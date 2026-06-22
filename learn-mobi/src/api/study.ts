import { http } from './request'
import type { StudyRecord, StudyStatsVO } from '../types/study'

export function saveStudyRecord(data: StudyRecord): Promise<void> {
  return http.post<void>('/student/study/saveRecord', data)
}
export function batchUploadStudy(data: StudyRecord[]): Promise<void> {
  return http.post<void>('/student/study/batchUpload', data)
}
export function getStudyStats(): Promise<StudyStatsVO> {
  return http.get<StudyStatsVO>('/student/study/stats')
}
