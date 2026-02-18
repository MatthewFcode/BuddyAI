'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Conversation } from '../../models/interface'

function History() {
  const [historyState, setHistoryState] = useState<Conversation[]>([])

  const handleTodayClick = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await fetch('/api/chat', {
      method: 'GET',
    })

    const history: Conversation[] = await res.json() // the Get is going to return an array of the conversation objects

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
