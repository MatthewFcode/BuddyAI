import { ElevenLabsClient } from 'elevenlabs'
import fs from 'fs'
import path from 'path'

const eleven = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
}) // creates the eleven labs client | which means that is a class that knows how to talk to the eleven labs API

export async function generateSpeech(text: string) {
  const audio = await eleven.textToSpeech.convert(
    // takes the string and calls the elvenLabs TTS API
    '7Znc1wuo18yOMS5u9Z5O', //'EXAVITQu4vr4xnSDxMaL', // default male voice (replace later)
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }
  )

  const filePath = path.join(process.cwd(), 'public', 'harry.mp3') // resulting audio is a buffer that we save to our public folder
  await fs.promises.writeFile(filePath, audio)
  return '/harry.mp3' // we return the public path so our front end can play it
}
