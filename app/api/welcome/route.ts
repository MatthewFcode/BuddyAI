'use server'

import { NextResponse } from 'next/server'
import { welcomeMessage } from '../../../welcome/welcome'

export async function GET(request: Request) {
  // const response = await welcomeMessage()
  const response = await fetch('https://affirmations.dev/', {
    method: 'GET',
    cache: 'no-store', // not storing a response indefinitley in the cache
  })

  const affirmation = await response.json()

  return NextResponse.json(affirmation)
}
