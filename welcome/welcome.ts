import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const model = new ChatGoogleGenerativeAI({
  model: 'models/gemini-flash-latest',
  temperature: 0.3,
  streaming: true,
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function welcomeMessage() {
  const prompt: string = `You are the welcome message for Matthews personal AI assistant app. 
     
    I need to you come up with a welcome message no longer than a sentence. 
    
     The tone should be subtle but positive`

  const response = await model.invoke(prompt)

  return response.content
}
