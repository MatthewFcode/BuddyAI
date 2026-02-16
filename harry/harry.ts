//import 'dotenv/config'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { UserPrompt, AIReply } from '../models/interface'

const model = new ChatGoogleGenerativeAI({
  model: 'models/gemini-flash-latest',
  temperature: 0.3,
  streaming: true,
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function harry(joeMama: UserPrompt) {
  // if (joeMama.prompt === 'yo') return { reply: 'Yoza broksi' }
  // else {
  //   return { reply: 'Not one of my bros ' }
  // }
  const prompt: string = `
  You are Harry. Matthew Foley's personal assistant for absolutley anything you're sole purpose is to serve him with anything he needs (he is the only one that has access to you)

  current chat from Matthew: ${joeMama.prompt}
  `
  const response = await model.invoke(prompt)
  console.log(response)

  return { reply: response.content }
}
