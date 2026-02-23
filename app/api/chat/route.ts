'use server'

import { NextResponse } from 'next/server'
import { harry } from '../../../harry/harry'
import { prisma } from '../../../prismaClient'
import { flushAllTraces } from 'next/dist/trace'

export async function POST(request: Request) {
  const body = await request.json()

  const harryStream = await harry(body)

  const encoder = new TextEncoder()

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of harryStream) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  }) // basicall returns the response from Harry to the client (without  streaming yet and without the need for a get request from the client)
}

// GET route for all chats
export async function GET(request: Request) {
  // getting all entries from the database for full history
  const fullHistory = await prisma.conversation.findMany()

  return NextResponse.json(fullHistory)
}
