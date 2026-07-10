export interface NoticeVO {
  id: number
  courseId: number
  title: string
  content: string
  /** 类型 1:系统通知 2:课程相关 3:考试相关 4:活动 */
  type: number
  status: number
  publishTime?: string
  /** 关联课程名称 */
  courseName?: string
  /** 是否已读 1:已读 0:未读 */
  readFlag?: number
  createTimeStr?: string
}

export interface NoticeUnreadVO {
  count: number
}
