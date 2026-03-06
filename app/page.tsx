'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import harryAnimation from '../src/animations/ai animation Flow 1.json'
import backgroundAnimation from '../src/animations/Background 3d stroke.json'
import styles from './styles/auth.module.scss'

type FeedbackState = 'idle' | 'loading' | 'error' | 'success'

export default function Auth() {
  const [passwordOneState, setPasswordOneState] = useState('')
  const [passwordTwoState, setPasswordTwoState] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const harryRef = useRef<LottieRefCurrentProps>(null)
  const router = useRouter()

  // ── Speech helper ────────────────────────────────────────────────────────────
  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined') return
    const synth = window.speechSynthesis
    synth.cancel()

    const voices = synth.getVoices()
    const maleVoice =
      voices.find((v) => v.name.toLowerCase().includes('daniel')) ||
      voices.find((v) => v.name.toLowerCase().includes('alex')) ||
      voices.find((v) =>
        v.name.toLowerCase().includes('google uk english male')
      ) ||
      voices.find((v) => v.name.toLowerCase().includes('male')) ||
      voices.find((v) => v.lang === 'en-GB') ||
      voices.find((v) => v.lang === 'en-US')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 0.85
    utterance.lang = 'en-GB'
    if (maleVoice) utterance.voice = maleVoice

    utterance.onstart = () => {
      setIsSpeaking(true)
      harryRef.current?.play()
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      harryRef.current?.stop()
      if (onEnd) onEnd()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      harryRef.current?.stop()
    }

    synth.speak(utterance)
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback('loading')
    setIsSpinning(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password1: passwordOneState,
          password2: passwordTwoState,
        }),
      })
      const data = await res.json()

      setIsSpinning(false)

      if (data.status === 'correct') {
        setFeedback('success')
        setFeedbackMsg('Identity confirmed.')

        speak('Glad to have you back Matthew', () => {
          router.push('/harry')
        })
      } else {
        setFeedback('error')
        setFeedbackMsg('Access denied.')
        speak('Wrong Passwords')
      }
    } catch {
      setIsSpinning(false)
      setFeedback('error')
      setFeedbackMsg('Something went wrong.')
    }
  }

  // ── Animation class ──────────────────────────────────────────────────────────
  const animClass = [
    styles.animationWrapper,
    isSpinning ? styles.spinning : '',
    isSpeaking ? styles.speaking : '',
  ]
    .filter(Boolean)
    .join(' ')

  const isLoading = feedback === 'loading'

  return (
    <div className={styles.page}>
      {/* Full-screen background Lottie */}
      <div className={styles.bgLottie}>
        <Lottie animationData={backgroundAnimation} autoplay loop />
      </div>

      {/* Noise grain */}
      <div className={styles.bgNoise} />

      {/* Auth card */}
      <div className={styles.card}>
        {/* Harry animation */}
        <div className={animClass}>
          <Lottie
            lottieRef={harryRef}
            animationData={harryAnimation}
            autoplay={false}
            loop
          />
        </div>

        {/* Title */}
        <h1 className={styles.title}>Buddy AI</h1>
        <p className={styles.subtitle}>Harry | Secure Access</p>

        <div className={styles.divider} />

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel} htmlFor="pw1">
              Password One
            </label>
            <input
              id="pw1"
              className={styles.input}
              type="password"
              placeholder="············"
              value={passwordOneState}
              onChange={(e) => setPasswordOneState(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel} htmlFor="pw2">
              Password Two
            </label>
            <input
              id="pw2"
              className={styles.input}
              type="password"
              placeholder="············"
              value={passwordTwoState}
              onChange={(e) => setPasswordTwoState(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className={[styles.button, isLoading ? styles.loading : ''].join(
              ' '
            )}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Enter'}
          </button>

          {feedback !== 'idle' && feedback !== 'loading' && (
            <p className={[styles.feedback, styles[feedback]].join(' ')}>
              {feedbackMsg}
            </p>
          )}
        </form>

        <p className={styles.hint}>Voice-authenticated · Private session</p>
      </div>
    </div>
  )
}
