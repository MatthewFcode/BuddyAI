'use server'

import { NextResponse } from 'next/server'
import { encryptionOne } from '../../../encryption/encryption-one.js'
import { encryptionTwo } from '../../../encryption/encryption-two.js'

export async function POST(request: Request) {
  // what is being posted???
  const body = await request.json()

  const passwordOne = encryptionOne(body.password1)
  const passwordTwo = encryptionTwo(body.password2)

  console.log('Raw input:', body)
  console.log('Encrypted 1:', passwordOne)
  console.log('Encrypted 2:', passwordTwo)
  console.log('ENV 1:', process.env.ENCRYPTION_ONE_KEY)
  console.log('ENV 2:', process.env.ENCRYPTION_TWO_KEY)

  if (
    passwordOne === process.env.ENCRYPTION_ONE_KEY &&
    passwordTwo === process.env.ENCRYPTION_TWO_KEY
  ) {
    const response = NextResponse.json({ status: 'correct' })

    response.cookies.set('harry_auth', 'true', {
      // basically the browser goes oh cool save this and attatch it to every http request I make from now on
      // cookie is just a tiny piece of data that the browser can store and send back on every HTTP request it makes (we tell it to do that )
      httpOnly: true, // this means that the browser it storing and that JS cant read it in the console window.document.cookie
      secure: true, // only sent over HTTPS
      sameSite: 'strict', // only sent to our site
      maxAge: 60 * 60 * 8, // 8 hours in seconds (how long the cookie lives )
    })
  } else {
    return NextResponse.json({ status: 'incorrect' })
  }
}
