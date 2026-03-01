'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Conversation } from '../../models/interface'
import styles from '../styles/history.module.scss'

function History() {
  const [historyState, setHistoryState] = useState<Conversation[]>([])
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'all'>(
    'today'
  )

  const handleTodayClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setActiveFilter('today')
    const res = await fetch('/api/chat/today', { method: 'GET' })
    const history: Conversation[] = await res.json()
    setHistoryState(history)
  }

  const handleWeekClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setActiveFilter('week')
    const res = await fetch('/api/chat/week', { method: 'GET' })
    const history: Conversation[] = await res.json()
    setHistoryState(history)
  }

  const handleAllHistoryClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault()
    setActiveFilter('all')
    const res = await fetch('/api/chat', { method: 'GET' })
    const history: Conversation[] = await res.json()
    setHistoryState(history)
  }

  useEffect(() => {
    const loadDefault = async () => {
      const res = await fetch('api/chat/today', { method: 'GET' })
      const todaysHistory: Conversation[] = await res.json()
      setHistoryState(todaysHistory)
    }
    loadDefault()
  }, [])

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgLayer}>
        <div className={styles.bgGlow} />
        <div className={styles.bgNoise} />
      </div>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link href="/harry" className={styles.homeLink}>
          Back to Harry
        </Link>

        <div className={styles.sidebarTitle}>
          <span className={styles.sidebarLabel}>Archive</span>
          <h1 className={styles.sidebarHeading}>
            <strong>Harry</strong>
            <br />
            Conversations
          </h1>
        </div>

        <ul className={styles.filterNav}>
          <li>
            <button
              onClick={handleTodayClick}
              className={`${styles.filterBtn} ${
                activeFilter === 'today' ? styles.active : ''
              }`}
            >
              Today
            </button>
          </li>
          <li>
            <button
              onClick={handleWeekClick}
              className={`${styles.filterBtn} ${
                activeFilter === 'week' ? styles.active : ''
              }`}
            >
              This Week
            </button>
          </li>
          <li>
            <button
              onClick={handleAllHistoryClick}
              className={`${styles.filterBtn} ${
                activeFilter === 'all' ? styles.active : ''
              }`}
            >
              All Time
            </button>
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <main className={styles.content}>
        {historyState.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◈</div>
            <p className={styles.emptyText}>No conversations found</p>
          </div>
        ) : (
          <div className={styles.list}>
            {historyState.map((d: Conversation, i: number) => (
              <div key={i} className={styles.card}>
                <p className={styles.cardTime}>
                  {new Date(d.chatTime).toLocaleString()}
                </p>
                <div className={styles.exchange}>
                  <div className={styles.message}>
                    <span
                      className={`${styles.messageLabel} ${styles.messageLabelUser}`}
                    >
                      You
                    </span>
                    <p
                      className={`${styles.messageText} ${styles.messageTextUser}`}
                    >
                      {d.userPrompt}
                    </p>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.message}>
                    <span
                      className={`${styles.messageLabel} ${styles.messageLabelHarry}`}
                    >
                      Harry
                    </span>
                    <p
                      className={`${styles.messageText} ${styles.messageTextHarry}`}
                    >
                      {d.aiReply}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default History
