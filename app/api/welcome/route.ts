'use server'

import { NextResponse } from 'next/server'
import { welcomeMessage } from '../../../welcome/welcome'

export async function GET(request: Request) {
  // const response = await welcomeMessage()

  return NextResponse.json('Straight back at it Matthew')
}
