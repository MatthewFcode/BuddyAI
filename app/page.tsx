'use client'

import { useState } from 'react'
// import { useNavigate } from 'react-router'
import { useRouter } from 'next/navigation'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import harryAnimation from '../src/animations/ai animation Flow 1.json'
import backgroundAnimation from '../src/animations/Background 3d stroke.json'
function Auth() {
  const [passwordOneState, setpasswordOneState] = useState('')
  const [passwordTwoState, setpasswordTwoState] = useState('')

  const [isSpeaking, setIsSpeaking] = useState(false)
  // speech helper
  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined') return

    const synth = window.speechSynthesis
    synth.cancel()

    const voices = synth.getVoices()

    // Try to select a masculine voice
    const maleVoice =
      voices.find((v) => v.name.toLowerCase().includes('daniel')) || // UK male
      voices.find((v) => v.name.toLowerCase().includes('alex')) || // macOS male
      voices.find((v) =>
        v.name.toLowerCase().includes('google uk english male')
      ) ||
      voices.find((v) => v.name.toLowerCase().includes('male')) ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.lang === 'en-US')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
    utterance.onerror = () => setIsSpeaking(false)

    if (maleVoice) {
      utterance.voice = maleVoice
    }

    // Masculine tuning
    utterance.rate = 0.92
    utterance.pitch = 0.85
    utterance.lang = 'en-GB' // slightly more refined tone than en-US

    synth.speak(utterance)
  }

  const navigate = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // just making it a JSOn object rather than leaving it as a JavaScript object
        password1: passwordOneState,
        password2: passwordTwoState,
      }),
    })

    const data = await res.json()

    if (data.status === 'correct') {
      speak('Glad to have you back Matthew', () => {
        navigate.push('/harry')
      })
    }

    if (data.status === 'incorrect') {
      speak('Wrong Passwords')
    }
  }

  return (
    <>
      <Lottie animationData={backgroundAnimation} autoplay={true} loop />
      <div>
        <div>
          <Lottie animationData={harryAnimation} autoplay={false} loop />
        </div>
        <div>
          <h1>Buddy AI - Harry</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="..password 1"
              onChange={(e) => setpasswordOneState(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="..password 2"
              onChange={(e) => setpasswordTwoState(e.target.value)}
            />
          </div>
          <div>
            <button type="submit">Log In</button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Auth
