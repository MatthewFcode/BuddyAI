'use server'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.json({ status: 'ok' })

  response.cookies.set('harry_auth', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0, // overwrite the current cookie with max age 0 which means the browser just immediatley deletes it
  })

  return response
}
