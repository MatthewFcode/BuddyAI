//import 'dotenv/config'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { UserPrompt } from '../models/interface'
import { Langfuse } from 'langfuse'
import { prisma } from '../prismaClient'

// const prisma = new PrismaClient()

const model = new ChatGoogleGenerativeAI({
  model: 'models/gemini-flash-latest',
  temperature: 0.3,
  streaming: true,
  apiKey: process.env.GOOGLE_API_KEY,
})

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})

export async function harry(userPrompt: UserPrompt) {
  // start the langfuse trace on the useer prompt
  const trace = langfuse.trace({
    name: 'user ',
    input: userPrompt.prompt,
  })

  const prompt: string = `
  You are Harry. Matthew Foley's personal assistant for absolutley anything you're sole purpose is to serve him with anything he needs (he is the only one that has access to you)

  current chat from Matthew: ${userPrompt.prompt}
  `
  const stream = await model.stream(prompt)

  let fullResponse: string = ''

  async function* generator() {
    for await (const chunk of stream) {
      const token = chunk.content as string
      fullResponse += token
      yield token
    }
  }

  // inserting the current user prompt and the chat from the AI into the database
  await prisma.conversation.create({
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

  return generator()
}
