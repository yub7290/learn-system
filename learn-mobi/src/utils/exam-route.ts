import type { ExamVO } from '../types/exam'

export function examDetailUrl(exam: Pick<ExamVO, 'id' | 'isFinalExam' | 'courseId'>): string {
  return exam.isFinalExam === 1 && exam.courseId
    ? `/pages/exam/exam-detail?courseId=${exam.courseId}&final=1`
    : `/pages/exam/exam-detail?id=${exam.id}`
}
