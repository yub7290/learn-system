import { http } from './request'
import type { AiChatReqDTO, AiChatRespVO } from '../types/ai'

export function chatSync(data: AiChatReqDTO): Promise<AiChatRespVO> {
  return http.post<AiChatRespVO>('/student/ai/chat', data)
}
export function getChatHistory(courseId: number, chatId?: number, limit = 50): Promise<AiChatRespVO[]> {
  return http.get<AiChatRespVO[]>('/student/ai/history', { courseId, chatId, limit })
}
