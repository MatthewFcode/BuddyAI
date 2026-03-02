'use client'

import { useState } from 'react'
// import { useNavigate } from 'react-router'
import { useRouter } from 'next/navigation'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import harryAnimation from '../src/animations/ai animation Flow 1.json'

export function Auth() {
  const [passwordOneState, setpasswordOneState] = useState('')
  const [passwordTwoState, setpasswordTwoState] = useState('')

  const navigate = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // just making it a JSOn object rather than leaving it as a JavaScript object
        password1: passwordOneState,
        password2: passwordTwoState,
      }),
    })

    const data = await res.json()

    if (data.status === 'correct') {
      navigate.push('/harry')
    }
  }

  return (
    <>
      <div>
        <div>
          <Lottie animationData={harryAnimation} autoplay={false} loop />ß
        </div>
        <input
          type="text"
          placeholder="..password 1"
          onChange={(e) => setpasswordOneState(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="..password 2"
          onChange={(e) => setpasswordTwoState(e.target.value)}
        />
      </div>
    </>
  )
}
