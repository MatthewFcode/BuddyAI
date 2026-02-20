'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Conversation } from '../../models/interface'

function History() {
  const [historyState, setHistoryState] = useState<Conversation[]>([])

  const handleTodayClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    const res = await fetch('/api/chat/today', {
      method: 'GET',
    })

    const history: Conversation[] = await res.json() // the Get is going to return an array of the conversation objects

    setHistoryState(history)
  }

  const handleWeekClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    const res = await fetch('/api/chat/week', {
      method: 'GET',
    })

    const history: Conversation[] = await res.json() // the Get is going to return an array of the conversation objects

    setHistoryState(history)
  }

  const handleAllHistoryClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    const res = await fetch('/api/chat', {
      method: 'GET',
    })

    const history: Conversation[] = await res.json() // the Get is going to return an array of the conversation objects

    setHistoryState(history)
  }

  useEffect(() => {
    const loadDefault = async () => {
      const res = await fetch('api/chat/today', {
        method: 'GET',
      })
      const todaysHistory: Conversation[] = await res.json()

      setHistoryState(todaysHistory)
    }

    loadDefault()
  }, [])

  return (
    <div>
      <Link href="/">Home</Link>

      {/* Seperation for the left hand side  */}
      <div>
        <h1>Harry Conversation History</h1>
        <div>
          <ul>
            <li>
              <button onClick={(e) => handleTodayClick(e)}>Today</button>
            </li>
            <li>
              <button onClick={(e) => handleWeekClick(e)}>This Week</button>
            </li>
            <li>
              <button onClick={(e) => handleAllHistoryClick(e)}>
                All Time History
              </button>
            </li>
          </ul>
        </div>
      </div>
      {/* Seperation for the right hand side */}

      <div>
        {historyState.map((d: Conversation, i: number) => (
          <div key={i}>
            <p>
              <em>{new Date(d.chatTime).toLocaleString()}</em>
            </p>
            <p>
              <strong>Matthew:</strong> {d.userPrompt}
            </p>
            <p>
              <strong>Harry:</strong> {d.aiReply}
            </p>
          </div>
        ))}
      </div>
      <div></div>
    </div>
  )
}

export default History
