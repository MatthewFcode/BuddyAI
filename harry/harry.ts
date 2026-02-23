//import 'dotenv/config'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { UserPrompt } from '../models/interface'
import { Langfuse } from 'langfuse'
import { prisma } from '../prismaClient'
import { createClient } from '@supabase/supabase-js' // JavaScript client for supabase
import { pipeline } from '@xenova/transformers' // runs ML models locally in JS

const model = new ChatGoogleGenerativeAI({
  model: 'models/gemini-flash-latest',
  temperature: 0.7,
  streaming: true,
  apiKey: process.env.GOOGLE_API_KEY,
})

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})

//FOR RAG: used for accessing to the database and vector search
const supabase = createClient(
  // supabase setup (using the service role key) | gives us full database access, should only run on the server side and is never exposed to the frontend
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// local model for creating embeddings and running semantic similarity
const embedPipeline = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2',
  { quantized: true }
)

//FOR RAG || helper function for converting text into a vector array
async function embedQuery(text: string): Promise<number[]> {
  const output = await embedPipeline(text, {
    pooling: 'mean',
    normalize: true,
  })
  return Array.from(output.data)
}

//FOR RAG ||
async function retrieveContext(query: string) {
  // helper retrieve function the R part of RAG-
  const embedding = await embedQuery(query) // converts the query into a vector

  const { data, error } = await supabase.rpc('match_documents', {
    // calls the supabase client
    // supabase Postgres function that compares all the vectors and returns the 5 most similar chunks
    query_embedding: embedding, // magic
    match_count: 5, // returns the top 5 chunks
  })

  if (error) {
    console.error('❌ Supabase vector search failed:', error)
    throw error
  }

  return data as {
    content: string
    metadata: Record<string, unknown>
    similarity: number
  }[] // returns an array of objects with this structure
}

export async function harry(userPrompt: UserPrompt) {
  // start the langfuse trace on the useer prompt
  const trace = langfuse.trace({
    name: 'user',
    input: userPrompt.prompt,
  })

  // getting todays conversation history:
  const start = new Date() // gets the current day
  start.setHours(0, 0, 0, 0)

  const todaysHistory = await prisma.conversation.findMany({
    where: { chatTime: { gte: start } },
    orderBy: { chatTime: 'desc' },
  })

  //FOR RAG || using the vector search helper functions in our code and converting the results into readable text for the LLM
  const contextChunks = await retrieveContext(userPrompt.prompt)
  const contextText =
    contextChunks.length > 0
      ? contextChunks
          .map(
            (c, i) =>
              `Source ${i + 1} (similarity ${c.similarity.toFixed(2)}):\n${
                c.content
              }`
          )
          .join('\n\n')
      : 'No Relevant Info from Matthews profile found'

  const prompt: string = `
  You are Harry. Matthew Foley's personal assistant for absolutley anything you're sole purpose is to serve him with anything he needs (he is the only one that has access to you)
  
  Here is todays chat history with you Harry ${todaysHistory}

  Here is what was pulled from the RAG pipeline from Matthews profile from this prompt ${contextText}


  current chat from Matthew: ${userPrompt.prompt}
  `
  const stream = await model.stream(prompt) // .stream returns an Async iterable (meaning we can iterate over the tokens the LLM sends back as they are generated)

  let fullResponse: string = '' // string to append the full response to

  async function* generator() {
    // asynchrnous generator function which allows the API route to pull tokens from us
    for await (const chunk of stream) {
      // for await (loop over the tokens as they generate but also wait for them)
      const token = chunk.content as string
      //console.log('CHUNK:', chunk.content)
      fullResponse += token
      for (const char of token) {
        // looping through this because Gemini doesn't return true token streaming it does like sentence level streaming init so I am breaking up these tokens more
        console.log('Char:', char)
        //fullResponse += char
        yield char // sends the character of a token outward to whoever is consuming this generator
      }
    }

    // inserting the current user prompt and the chat from the AI into the database
    await prisma.conversation.create({
      data: {
        userPrompt: userPrompt.prompt,
        aiReply: fullResponse,
      },
    })
  }

  //updating the current langfuse trace with the output from the user
  trace.update({
    name: 'Harry',
    output: fullResponse,
  })

  return generator() // return the generator function for the api route
}
