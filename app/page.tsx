'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { AIReply } from '../models/interface'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
//import harryAnimation from '../src/animations/AI logo Foriday.json'
import harryAnimation from '../src/animations/ai animation Flow 1.json'
import styles from './styles/harry.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

// ── Nav Component ──────────────────────────────────────────────────────────────
export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/history" className={styles.navHistory}>
        History
      </Link>
      <h1 className={styles.navTitle}>
        <strong>Harry</strong>
      </h1>
      <span className={styles.navBuddy}>BuddyAI</span>
    </nav>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function Harry() {
  const [prompt, setPrompt] = useState('')
  //const [copiedText, setCopiedText] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  // ai states
  const [reply, setReply] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // state for the welcome message
  const [dashboardMessage, setDashboardMessage] = useState('')
  // ai state? that could be removed
  const [messageVisible, setMessageVisible] = useState(false)
  // state for the listening (mic)
  const [isListening, setIsListening] = useState(false)
  // speaking state for the ai
  const [isSpeaking, setIsSpeaking] = useState(false)

  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const replyTextRef = useRef<HTMLDivElement | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setPrompt(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  // handler function for toggle of is listening
  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  //handler function for copying text from ai response
  const copyText = async () => {
    if (!reply.trim()) {
      return
    }

    await navigator.clipboard.writeText(reply)

    setIsCopied(true)

    setTimeout(() => setIsCopied(false), 10000) // set timeout for 10 seconds
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setReply('')
    lottieRef.current?.setSpeed(2.5) // ← add this
    lottieRef.current?.play() // ← add this

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const data = await res.json()
    // if (!data.audio) {
    //   const utterance = new SpeechSynthesisUtterance(data.text)
    //   window.speechSynthesis.speak(utterance)
    // }

    setReply(data.text)
    setIsLoading(false)
    lottieRef.current?.setSpeed(1)

    // Play ElevenLabs audio
    const audio = new Audio(data.audio) // creates the audio and plays it | the states are for the animations

    audio.onplay = () => {
      setIsSpeaking(true)
      lottieRef.current?.play()
    }

    audio.onended = () => {
      setIsSpeaking(false)
      lottieRef.current?.stop()
    }

    audio.play()

    // const reader = res.body?.getReader()
    // const decoder = new TextDecoder()

    // let done = false

    // while (!done) {
    //   const { value, done: doneReading } = await reader!.read()
    //   done = doneReading

    //   const chunkValue = decoder.decode(value)
    //   setReply((prev) => prev + chunkValue)
    //   await new Promise((r) => setTimeout(r, 5))
    // }

    // setIsLoading(false)
  }

  useEffect(() => {
    const fetchWelcome = async () => {
      const response = await fetch('/api/welcome')
      const message = await response.json()
      setDashboardMessage(message.affirmation)
      setTimeout(() => setMessageVisible(true), 100)
    }

    fetchWelcome()
    const interval = setInterval(fetchWelcome, 30000000)
    return () => clearInterval(interval)
  }, [])

  // Pause animation when idle, play + speed up when loading
  // useEffect(() => {
  //   if (!lottieRef.current) return
  //   if (isLoading) {
  //     lottieRef.current.setSpeed(2.5)
  //     lottieRef.current.play()
  //   } else {
  //     lottieRef.current.setSpeed(1)
  //     lottieRef.current.stop() // stationary when no query running
  //   }
  // }, [isLoading])

  return (
    <div className={styles.page}>
      {/* ── Background atmosphere ── */}
      <div className={styles.bgLayer}>
        <div className={styles.bgGlowCenter} />
        <div className={styles.bgGlowTop} />
        <div className={styles.bgGlowBottom} />
        <div className={styles.bgNoise} />
      </div>

      {/* ── Nav ── */}
      <Nav />

      {/* ── Main content column ── */}
      <main className={styles.main}>
        {/* ── TOP AREA: Animation + welcome msg ── */}
        <div className={styles.topArea}>
          {/* Lottie animation — stopped when idle, plays when loading */}
          <div
            className={`${styles.animationWrapper} ${
              isLoading ? styles.loading : ''
            } ${isSpeaking ? styles.speaking : ''}`}
          >
            <div className={styles.animationGlow} />
            <Lottie
              lottieRef={lottieRef}
              animationData={harryAnimation}
              loop
              autoplay={false}
              className={styles.lottie}
            />
            {isLoading && <div className={styles.pingRing} />}
          </div>

          {/* Welcome message */}
          <p
            className={`${styles.welcomeMessage} ${
              messageVisible ? styles.visible : ''
            }`}
          >
            {dashboardMessage || '\u00a0'}
          </p>

          <div className={styles.replyWrapper}>
            <div className={styles.replyBox}>
              <div className={styles.replyAccent} />

              {/* ── Scrollable text area ── */}
              <div ref={replyTextRef} className={styles.replyText}>
                {isLoading && !reply ? (
                  <div className={styles.thinkingRow}>
                    <span className={styles.dots}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </span>
                    thinking...
                  </div>
                ) : reply ? (
                  reply
                ) : (
                  '...response box'
                )}
              </div>

              <button className={styles.copyButton} onClick={copyText}>
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Input bar ── */}
        <div className={styles.bottomArea}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="ask Harry anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className={styles.input}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`${styles.micButton} ${
                  isListening ? styles.micActive : ''
                }`}
              >
                <img src="/images/sound-recognition.png" alt="microphone" />
              </button>
            </div>
            {/* <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="ask Harry anything..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className={styles.input}
              />
              <button type="button" onClick={toggleListening}>
                <img src="/images/sound-recognition.png" alt="microphone" />
              </button>
            </div> */}
            {/* <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={styles.sendButton}
            >
              {isLoading ? '...' : 'Send'}
            </button> */}
          </form>

          <p className={styles.hint}>your personal AI · powered by Harry</p>
        </div>
      </main>
    </div>
  )
}

export default Harry
