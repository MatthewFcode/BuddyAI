//import 'dotenv/config'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { UserPrompt } from '../models/interface'
import { Langfuse } from 'langfuse'
import { prisma } from '../prismaClient'
import { createClient } from '@supabase/supabase-js' // JavaScript client for supabase
import { pipeline } from '@xenova/transformers' // runs ML models locally in JS
import { sendEmail } from '../tools/resend'

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
  Make your response max 50 words.

  You are Harry. Matthew Foley's personal assistant for absolutley anything you're sole purpose is to serve him with anything he needs (he is the only one that has access to you)
  
  Here is todays chat history with you Harry ${JSON.stringify(todaysHistory)}

  Here is what was pulled from the RAG pipeline from Matthews profile from this prompt ${contextText}


  current chat from Matthew: ${userPrompt.prompt}
  `

  // tool definition

  const tools = [
    {
      name: 'send_email',
      description: 'Send an email on behalf of Matthew like you are Matthew',
      schema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Email body content' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  ]

  // manual tool caling
  const stream = await model.stream(prompt, { tools }) // .stream returns an Async iterable (meaning we can iterate over the tokens the LLM sends back as they are generated)
  //mhm
  let fullResponse: string = '' // string to append the full response to

  // SOLUTION FOR SENDING THE FULL RESPONSE AS A WHOLE AND NOT STREAMING THE RESPONSE
  // for await (const chunk of stream) {
  //   if (chunk.tool_calls) {
  //     for (const call of chunk.tool_calls) {
  //       if (call.name === 'send_email') {
  //         try {
  //           const { to, subject, body } = call.args

  //           const result = await sendEmail(call.args)

  //           fullResponse = 'Email sent successfully ✅'

  //           continue
  //         } catch (err) {
  //           const errorMsg = `\n\n❌ Failed to send email.`
  //           fullResponse += errorMsg
  //         }
  //       }
  //     }
  //   }
  //   if (chunk.content) {
  //     const token = chunk.content as string
  //     for (const char of token) {
  //       fullResponse += char
  //     }
  //   }
  // }

  async function* generator() {
    for await (const chunk of stream) {
      const anyChunk = chunk as any

      // 🔥 TOOL CALL DETECTED
      if (anyChunk.tool_calls) {
        for (const call of anyChunk.tool_calls) {
          if (call.name === 'send_email') {
            try {
              const { to, subject, body } = call.args

              const result = await sendEmail(call.args)

              fullResponse = 'Email sent successfully ✅'

              //             // 🧠 Now we call Gemini AGAIN
              //             const followUpPrompt = `
              // You just successfully sent this email:

              // To: ${to}
              // Subject: ${subject}
              // Body: ${body}

              // Email ID: ${result?.id ?? 'Unknown'}

              // Now confirm to Matthew what was sent in a clear, professional way.
              // `

              // const followUpStream = await model.stream(followUpPrompt)

              // for await (const followChunk of followUpStream) {
              //   if (followChunk.content) {
              //     const token = followChunk.content as string
              //     fullResponse += token

              //     for (const char of token) {
              //       yield char
              //     }
              //   }
              // }

              continue
            } catch (err) {
              const errorMsg = `\n\n❌ Failed to send email.`
              fullResponse += errorMsg
            }
          }
        }
      }

      // 🧠 NORMAL RESPONSE (no tool used)
      if (chunk.content) {
        const token = chunk.content as string

        for (const char of token) {
          fullResponse += char
          console.log('TOKEN:', char)
          yield char
        }
      }
    }
    // inserting the current user prompt and the chat from the AI into the database
    await prisma.conversation.create({
      // moved inside the function as the streaming happens after we return rather than before
      data: {
        userPrompt: userPrompt.prompt,
        aiReply: fullResponse,
      },
    })

    //updating the current langfuse trace with the output from the user
    trace.update({
      name: 'Harry',
      output: fullResponse,
    })
  }

  return generator() // return the generator function for the api route
}

// NOTES about the current AI function:
// the generator function is currently commented out and the where we loop over the current stream of ai response and yield it on to the API route
// Currently we just loop over the incoming tokens from the gemini response and add whatever to full response and then return it as a whole at the end of the stream
// Sending the email and then returning what was sent into the AI again is currently commented out due to latency issues and simplicity and also token usage for  the eleven labs voice
