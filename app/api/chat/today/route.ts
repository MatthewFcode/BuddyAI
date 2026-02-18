'use server'

import { NextResponse } from 'next/server'
import { prisma } from '../../../../prismaClient'
import { Conversation } from '../../../../models/interface'

export async function GET(request: Request) {
  const start = new Date() // gets the current day
  start.setHours(0, 0, 0, 0)

  const todaysHistory: Conversation[] = await prisma.conversation.findMany({
    where: { chatTime: { gte: start } },
    orderBy: { chatTime: 'desc' },
  })

  return NextResponse.json(todaysHistory)
}
