import { useState } from 'react'
import { useNavigate } from 'react-router'

export function Auth() {
  const [passwordOneState, setpasswordOneState] = useState('')
  const [passwordTwoState, setpasswordTwoState] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { password1: passwordOneState, password2: passwordTwoState },
    })

    const data = await res.json()

    if (data.status === 'correct') {
      navigate('/harry')
    }
  }

  return (
    <>
      <div>
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
