export interface AIReply {
  reply: string
}

export interface UserPrompt {
  prompt: string
}

export interface Conversation {
  id: number
  userPrompt: string
  aiReply: string
  chatTime: Date
}
