// 'use client' // declares this component a client component

// import Link from 'next/link'
// import { useState, useEffect } from 'react'
// import { AIReply } from '../models/interface'
// import Lottie from 'lottie-react'

// import harryAnimation from '../src/animations/AI logo Foriday.json'

// // so this is a server component by default so it cannot use interactive handlers
// function Harry() {
//   const [prompt, setPrompt] = useState('')
//   const [reply, setReply] = useState('')
//   const [dashboardMessage, setDashboardMessage] = useState(
//     '☀️ Back into the mahi sunshine ☀️ '
//   )

//   // in the same directory so will be the home page?

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault() // prevents the browser from reloading the page (doing a traditional HTML submit)

//     const res = await fetch('/api/chat', {
//       // sending and HTTP request from the browser to our api route / next server that we don't manage
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json', // serialising our sent data to raw JSON
//       },
//       body: JSON.stringify({ prompt: prompt }), // sending the prompt variable as JSON as the req.body
//     })

//     const data: AIReply = await res.json() // the server sending JSON back??

//     setReply(data.reply) // server responds with a object with the reply property and we access that property || both GET and POST requests send back responses from the server
//   }

//   //useEffect that runs on the component mount with setTimeout and Get request

//   useEffect(() => {
//     const fetchWelcome = async () => {
//       const response = await fetch('/api/welcome')
//       const message = await response.json()
//       setDashboardMessage(message)
//     }

//     fetchWelcome()

//     const interval = setInterval(() => {
//       fetchWelcome()
//     }, 30000000) // this is 5 minutes with two 0s removed

//     return () => clearInterval(interval) // clear the interval to stop the interval from running in memory when the component unmounts
//   }, [])

//   return (
//     <div>
//       <Link href="/history">History</Link>
//       <div>
//         <h1>Harry</h1>
//       </div>
//       <h1>BuddyAI</h1>
//       <div>
//         <p>{reply}</p>
//       </div>
//       <div>
//         {/* div for the lottie */}
//         <Lottie animationData={harryAnimation} loop autoplay={true} />
//       </div>
//       <div>{dashboardMessage}</div>
//       <div>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="..chat with Harry"
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setPrompt(e.target.value)
//             }
//           />
//           <button type="submit">Send </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default Harry
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { AIReply } from '../models/interface'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import harryAnimation from '../src/animations/AI logo Foriday.json'
import styles from './styles/harry.module.scss'

// ── Nav Component ──────────────────────────────────────────────────────────────
function Nav() {
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
  const [reply, setReply] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [messageVisible, setMessageVisible] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setReply('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const data: AIReply = await res.json()
    setReply(data.reply)
    setIsLoading(false)
  }

  useEffect(() => {
    const fetchWelcome = async () => {
      const response = await fetch('/api/welcome')
      const message = await response.json()
      setDashboardMessage(message)
      setTimeout(() => setMessageVisible(true), 100)
    }

    fetchWelcome()
    const interval = setInterval(fetchWelcome, 30000000)
    return () => clearInterval(interval)
  }, [])

  // Pause animation when idle, play + speed up when loading
  useEffect(() => {
    if (!lottieRef.current) return
    if (isLoading) {
      lottieRef.current.setSpeed(2.5)
      lottieRef.current.play()
    } else {
      lottieRef.current.setSpeed(1)
      lottieRef.current.stop() // stationary when no query running
    }
  }, [isLoading])

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
            }`}
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

          {/* AI Reply box — no thinking dots, just shows reply when ready */}
          {reply && (
            <div className={styles.replyWrapper}>
              <div className={styles.replyBox}>
                <div className={styles.replyAccent} />
                {reply}
              </div>
            </div>
          )}
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
            </div>
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
