'use server'

import { NextResponse } from 'next/server'
import { prisma } from '../../../../prismaClient'
import { Conversation } from '../../../../models/interface'

export async function GET(request: Request) {
  const start = new Date()
  const day = start.getDay() // 0 = Sunday
  start.setDate(start.getDate() - day) // go to start of week
  start.setHours(0, 0, 0, 0)

  const weeksHistory: Conversation = prisma.conversation.findMany({
    where: { chatTime: { gte: start } },
    orderBy: { chatTime: 'desc' },
  })

  return NextResponse.json(weeksHistory)
}
