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

// ── Nav Component ──────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
      {/* History – top left */}
      <Link
        href="/history"
        className="text-white/80 hover:text-white text-sm font-light tracking-[0.2em] uppercase transition-all duration-300 hover:tracking-[0.3em] group"
      >
        <span className="relative">
          History
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>

      {/* Harry – center */}
      <h1 className="text-white text-xl font-extralight tracking-[0.4em] uppercase select-none">
        Harry
      </h1>

      {/* BuddyAI – top right */}
      <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase">
        BuddyAI
      </span>
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
      // trigger fade-in after content loads
      setTimeout(() => setMessageVisible(true), 100)
    }

    fetchWelcome()
    const interval = setInterval(fetchWelcome, 30000000)
    return () => clearInterval(interval)
  }, [])

  // Control animation speed based on loading state
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(isLoading ? 2.5 : 0.6)
    }
  }, [isLoading])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0533] flex flex-col items-center">
      {/* ── Background atmosphere ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* deep radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#6b21a8]/20 blur-[120px]" />
        {/* top accent */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-[#9333ea]/10 blur-[80px]" />
        {/* bottom accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[100px]" />
        {/* subtle noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
      </div>

      {/* ── Nav ── */}
      <Nav />

      {/* ── Main content column ── */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full max-w-2xl min-h-screen px-6 pt-20 pb-8">
        {/* ── TOP AREA: Animation + welcome msg ── */}
        <div className="flex flex-col items-center flex-1 justify-center gap-6 w-full">
          {/* Lottie animation – large, center */}
          <div
            className={`relative transition-transform duration-700 ${
              isLoading ? 'scale-110' : 'scale-100'
            }`}
            style={{ width: 280, height: 280 }}
          >
            {/* glow ring behind animation */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 ${
                isLoading
                  ? 'bg-[#a855f7]/25 blur-2xl scale-125'
                  : 'bg-[#7c3aed]/10 blur-xl scale-100'
              }`}
            />
            <Lottie
              lottieRef={lottieRef}
              animationData={harryAnimation}
              loop
              autoplay
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            />
            {/* loading pulse ring */}
            {isLoading && (
              <div className="absolute inset-0 rounded-full border border-[#a855f7]/40 animate-ping" />
            )}
          </div>

          {/* Welcome message – fade-in on load */}
          <p
            className={`text-center text-[#d8b4fe]/70 text-sm font-light tracking-[0.15em] uppercase transition-all duration-1000 ${
              messageVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            {dashboardMessage || '\u00a0'}
          </p>

          {/* ── AI Reply box ── */}
          {(reply || isLoading) && (
            <div className="w-full self-start ml-[-8px] animate-[fadeSlideUp_0.4s_ease_both]">
              <div
                className="relative rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 px-6 py-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-[#e9d5ff] text-sm font-light leading-relaxed tracking-wide"
                style={{
                  boxShadow:
                    '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                {/* subtle left accent bar */}
                <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-[#a855f7] to-[#7c3aed] opacity-70" />
                {isLoading && !reply ? (
                  <div className="flex items-center gap-2 text-[#c084fc]/60 text-xs tracking-widest">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-bounce [animation-delay:300ms]" />
                    </span>
                    thinking…
                  </div>
                ) : (
                  reply
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM: Input bar ── */}
        <div className="w-full mt-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ask Harry anything…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="
                  w-full rounded-2xl
                  bg-white/[0.06] backdrop-blur-md
                  border border-white/10
                  text-[#f3e8ff] placeholder-[#7c3aed]/50
                  text-sm font-light tracking-wide
                  px-5 py-4
                  outline-none
                  transition-all duration-300
                  focus:border-[#a855f7]/50 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)]
                  disabled:opacity-50
                "
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="
                flex-shrink-0
                rounded-2xl
                bg-gradient-to-br from-[#9333ea] to-[#6d28d9]
                hover:from-[#a855f7] hover:to-[#7c3aed]
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white text-sm font-light tracking-widest uppercase
                px-6 py-4
                transition-all duration-300
                hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]
                active:scale-95
              "
            >
              {isLoading ? '…' : 'Send'}
            </button>
          </form>

          {/* bottom hint */}
          <p className="text-center text-[#6d28d9]/40 text-[10px] tracking-[0.2em] uppercase mt-3 select-none">
            your personal AI · powered by Harry
          </p>
        </div>
      </div>

      {/* ── Keyframe for reply box entry ── */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Harry
