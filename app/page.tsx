'use client' // declares this component a client component

import Link from 'next/link'
import { useState } from 'react'
// so this is a server component by default so it cannot use interactive handlers
function Harry() {
  const [prompt, setPrompt] = useState('')
  // in the same directory so will be the home page?

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault

    await 
  }
  return (
    <div>
      <Link href="/history">History</Link>
      <h1>Chat with Harry</h1>
      <div>
        <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="..chat with Harry"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
        />
        <button type="submit">Send </button>
        </form>
      </div>
    </div>
  )
}

export default Harry
