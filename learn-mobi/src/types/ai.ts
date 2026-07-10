export interface PageResult<T> {
  total: number
  records: T[]
}

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

export interface HomeworkSubmitDTO {
  courseId: number
  imageUrls: string[]
}

export interface HomeworkPageVO {
  id: number
  courseId: number
  courseName: string
  totalQuestions: number
  correctCount: number
  score: number
  status: number
  createTime: string
}

export interface HomeworkCorrectionVO {
  id: number
  courseId: number
  courseName: string
  studentId: number
  studentName: string
  images: string
  totalQuestions: number
  correctCount: number
  score: number
  status: number
  createTime: string
  questions: HomeworkQuestionVO[]
}

export interface HomeworkQuestionVO {
  id: number
  correctionId: number
  questionNo: number
  questionContent: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: number | null
  analysis: string
  sourceImage: string
  reviewStatus: number
  reviewResult: number
  displayAnswer: string
  displayAnalysis: string
  reviewAnswer: string
  reviewAnalysis: string
  reviewedBy: number
  reviewTime: string
}
