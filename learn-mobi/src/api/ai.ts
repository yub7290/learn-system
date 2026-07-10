import { http } from './request'
import { BASE_URL } from '../env'
import { getAccessToken } from '../utils/auth'
import type { AiChatReqDTO, AiChatRespVO, HomeworkSubmitDTO, HomeworkPageVO, HomeworkCorrectionVO, PageResult } from '../types/ai'

export function chatSync(data: AiChatReqDTO): Promise<AiChatRespVO> {
  return http.post<AiChatRespVO>('/student/ai/chat', data)
}

/**
 * SSE流式对话（H5平台）
 * 通过XMLHttpRequest读取SSE流，逐token回调
 */
export function chatStream(
  data: AiChatReqDTO,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  onConversationId?: (id: number) => void,
) {
  const url = `${BASE_URL}/student/ai/chat/stream`
  const auth = getAccessToken()

  const xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  if (auth) xhr.setRequestHeader('Authorization', `Bearer ${auth}`)
  xhr.timeout = 300000

  let buffer = ''
  let done = false
  let currentEvent = 'token'

  xhr.onprogress = () => {
    const text = xhr.responseText
    const newPart = text.slice(buffer.length)
    buffer = text
    const lines = newPart.split('\n')
    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim()
      } else if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim()
        if (currentEvent === 'done' || payload === '[DONE]') {
          if (!done) { done = true; onDone() }
          return
        }
        if (currentEvent === 'error') {
          if (!done) { done = true; onError(payload) }
          return
        }
        if (currentEvent === 'conversationId') {
          onConversationId?.(Number(payload))
          currentEvent = 'token'
          continue
        }
        onToken(payload)
        currentEvent = 'token'
      }
    }
  }
  xhr.onload = () => { if (!done) { done = true; onDone() } }
  xhr.onerror = () => onError('网络请求失败')
  xhr.ontimeout = () => onError('请求超时')
  xhr.send(JSON.stringify(data))
}
export function getChatHistory(courseId: number, chatId?: number, limit = 50): Promise<AiChatRespVO[]> {
  return http.get<AiChatRespVO[]>('/student/ai/history', { courseId, chatId, limit })
}

export function submitHomework(data: HomeworkSubmitDTO): Promise<HomeworkCorrectionVO> {
  return http.post<HomeworkCorrectionVO>('/student/homework/submit', data, undefined, { timeout: 180000 })
}

export function getHomeworkList(courseId?: number, pageNum?: number, pageSize?: number): Promise<PageResult<HomeworkPageVO>> {
  return http.get<PageResult<HomeworkPageVO>>('/ai/homework/list', { courseId, pageNum, pageSize })
}

export function getHomeworkDetail(id: number): Promise<HomeworkCorrectionVO> {
  return http.get<HomeworkCorrectionVO>(`/ai/homework/detail/${id}`)
}
