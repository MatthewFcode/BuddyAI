'use server'

import { NextResponse } from 'next/server'
import { harry } from '../../../harry/harry'
import { prisma } from '../../../prismaClient'
import { flushAllTraces } from 'next/dist/trace'
import { generateSpeech } from '../../../voice/elevenLabs'

export async function POST(request: Request) {
  const body = await request.json()

  const fullResponse = await harry(body) // call the harry function on our body object | this now returns the generator which sends us the tokens as they are generated

  const audio = await generateSpeech(fullResponse)

  return NextResponse.json({ text: fullResponse, audio: audio })
  // const encoder = new TextEncoder() // converts string to binary chunks

  // const readableStream = new ReadableStream({
  //   // creates stream to front end
  //   async start(controller) {
  //     // start starts the stream as soon as the stream from the generator begins
  //     for await (const chunk of harryStream) {
  //       // looping over the token yielded from harry
  //       controller.enqueue(encoder.encode(chunk)) // convert the string to binary
  //     }
  //     controller.close() // closing the stream when finished
  //   },
  // })

  // return new Response(readableStream, {
  //   // returns the stream response for the front end
  //   headers: {
  //     'Content-Type': 'text/plain; charset=utf-8',
  //     //'Transfer-Encoding': 'chunked',
  //     'Cache-Control': 'no-cache',
  //   },
  // }) // basicall returns the response from Harry to the client (without  streaming yet and without the need for a get request from the client)
}

// GET route for all chats
export async function GET(request: Request) {
  // getting all entries from the database for full history
  const fullHistory = await prisma.conversation.findMany()

  return NextResponse.json(fullHistory)
}
