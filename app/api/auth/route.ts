'use server'

import { NextResponse } from 'next/server'
import { encryptionOne } from '../../../encryption/encryption-one.js'
import { encryptionTwo } from '../../../encryption/encryption-two.js'

export async function POST(request: Request) {
  // what is being posted???
  const body = await request.json()

  const passwordOne = encryptionOne(body.password1)
  const passwordTwo = encryptionTwo(body.password2)

  if (
    passwordOne === process.env.ENCRYPTION_ONE_KEY &&
    passwordTwo === process.env.ENCRYPTION_TWO_KEY
  ) {
    return NextResponse.json({ status: 'correct' })
  } else {
    return NextResponse.json({ status: 'incorrect' })
  }
}
