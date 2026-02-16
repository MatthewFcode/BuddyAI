'use server'

import { NextResponse } from 'next/server'
import { harry } from '../../../harry/harry'

export async function POST(request: Request) {
  const body = await request.json()

  const harryResponse = await harry(body)

  return NextResponse.json(harryResponse)
}
