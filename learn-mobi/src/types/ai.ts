export interface AiChatReqDTO {
  courseId?: number
  chatId?: number
  message: string
  mediaType?: string
  mediaUrl?: string
  mediaBase64?: string
}
export interface AiChatRespVO {
  id: number
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  mediaType?: string
  mediaUrl?: string
  createTime: string
}
