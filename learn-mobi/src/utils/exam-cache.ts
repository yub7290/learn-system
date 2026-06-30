/**
 * 考试启动数据缓存
 * 用于在 exam-detail → exam-answer 页面间传递 startExam 返回的数据
 */
import type { StartExamVO } from '../types/exam'

let _data: StartExamVO | null = null

export function setExamStartData(data: StartExamVO) {
  _data = data
}

export function getExamStartData(): StartExamVO | null {
  return _data
}

export function clearExamStartData() {
  _data = null
}
