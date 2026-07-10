import { http } from './request'
import type { StudyRecord, StudyStatsVO } from '../types/study'
import { isLoggedIn } from '../utils/auth'

export function saveStudyRecord(data: StudyRecord): Promise<void> {
  if (!isLoggedIn()) return Promise.resolve()
  // 不传 requireAuth：后台静默上报，401/刷新失败时走离线队列兜底，不弹登录框打断视频播放
  return http.post<void>('/student/study/saveRecord', data, undefined, { showError: false })
}
export function batchUploadStudy(data: StudyRecord[]): Promise<void> {
  if (!isLoggedIn()) return Promise.resolve()
  return http.post<void>('/student/study/batchUpload', data, undefined, { showError: false })
}
export function getStudyStats(): Promise<StudyStatsVO> {
  if (!isLoggedIn()) return Promise.resolve({ courseCount: 0, studyHours: 0, certCount: 0 })
  return http.get<StudyStatsVO>('/student/study/stats')
}
