import { http } from './request'
import type { StudyRecord, StudyStatsVO } from '../types/study'
import { isLoggedIn } from '../utils/auth'

export function saveStudyRecord(data: StudyRecord): Promise<void> {
  if (!isLoggedIn()) return Promise.resolve()
  return http.post<void>('/student/study/saveRecord', data, undefined, { requireAuth: true, showError: false })
}
export function batchUploadStudy(data: StudyRecord[]): Promise<void> {
  if (!isLoggedIn()) return Promise.resolve()
  return http.post<void>('/student/study/batchUpload', data, undefined, { requireAuth: true, showError: false })
}
export function getStudyStats(): Promise<StudyStatsVO> {
  if (!isLoggedIn()) return Promise.resolve({ courseCount: 0, studyHours: 0, certCount: 0 })
  return http.get<StudyStatsVO>('/student/study/stats')
}
