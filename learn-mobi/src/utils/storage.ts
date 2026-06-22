export const StorageKey = {
  ACCESS_TOKEN: 'student_access_token',
  REFRESH_TOKEN: 'student_refresh_token',
  USER_INFO: 'student_user_info',
  STUDY_OFFLINE_QUEUE: 'study_offline_queue',
} as const

export type StorageKeyType = keyof typeof StorageKey
