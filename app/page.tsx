import Link from 'next/link'

function Harry() {
  // in the same directory so will be the home page?
  return (
    <div>
      <Link href="/history">History</Link>
      <h1>Chat with Harry</h1>
    </div>
  )
}

export default Harry
