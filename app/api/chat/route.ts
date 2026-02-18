'use server'

import { NextResponse } from 'next/server'
import { harry } from '../../../harry/harry'
import { prisma } from '../../../prismaClient'
import { flushAllTraces } from 'next/dist/trace'

export async function POST(request: Request) {
  const body = await request.json()

  const harryResponse = await harry(body)

  return NextResponse.json(harryResponse) // basicall returns the response from Harry to the client (without  streaming yet and without the need for a get request from the client)
}

// GET route for all chats
export async function GET(request: Request) {
  // getting all entries from the database for full history
  const fullHistory = await prisma.conversation.findMany()

  return NextResponse.json(fullHistory)
}
