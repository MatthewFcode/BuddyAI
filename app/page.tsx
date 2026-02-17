'use client' // declares this component a client component

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UserPrompt, AIReply } from '../models/interface'

// so this is a server component by default so it cannot use interactive handlers
function Harry() {
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState('')
  const [dashboardMessage, setDashboardMessage] = useState(
    'Welcome back to the show matthew'
  )
  // in the same directory so will be the home page?

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // prevents the browser from reloading the page (doing a traditional HTML submit)

    const res = await fetch('/api/chat', {
      // sending and HTTP request from the browser to our api route / next server that we don't manage
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // serialising our sent data to raw JSON
      },
      body: JSON.stringify({ prompt: prompt }), // sending the prompt variable as JSON as the req.body
    })

    const data: AIReply = await res.json() // the server sending JSON back??

    setReply(data.reply) // server responds with a object with the reply property and we access that property || both GET and POST requests send back responses from the server
  }

  //useEffect that runs on the component mount with setTimeout and Get request

  useEffect(() => {
    const fetchWelcome = async () => {
      const response = await fetch('/api/welcome')
      const message = await response.json()
      setDashboardMessage(message)
    }

    fetchWelcome()

    const interval = setInterval(() => {
      fetchWelcome()
    }, 30000000) // this is 5 minutes with two 0s removed

    return () => clearInterval(interval) // clear the interval to stop the interval from running in memory when the component unmounts
  }, [])

  return (
    <div>
      <Link href="/history">History</Link>
      <h1>Chat with Harry</h1>
      <div>{/* div for the lottie */}</div>
      <div>{dashboardMessage}</div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="..chat with Harry"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrompt(e.target.value)
            }
          />
          <button type="submit">Send </button>
        </form>
      </div>

      <div>
        <p>{reply}</p>
      </div>
    </div>
  )
}

export default Harry
