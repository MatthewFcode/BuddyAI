import { UserPrompt, AIReply } from '../models/interface'

export function harry(joeMama: UserPrompt): AIReply | undefined {
  if (joeMama.prompt === 'yo') return { reply: 'Yoza broksi' }
}
