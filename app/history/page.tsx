'use client'

import Link from 'next/link'
import { useState } from 'react'

function History() {
  const [historyState, setHistoryState] = useState('')

  const handleTodayClick = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await fetch('/api/chat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const history = await res.json() // history needs to be deconstructed into the human reply | the ai reply and then the time of the conversation

    setHistoryState(history)
  }

  return (
    <div>
      <Link href="/">Home</Link>
      {/* Seperation for the left hand side  */}
      <div>
        <h1>Harry Conversation History</h1>
        <div>
          <ul>
            <li>Today</li>
            <li>This Week</li>
            <li>All Time History</li>
          </ul>
        </div>
      </div>
      {/* Seperation for the right hand side */}
      <div></div>
    </div>
  )
}

export default History
