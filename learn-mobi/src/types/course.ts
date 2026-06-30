export interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}
export interface CourseListItem {
  id: number
  imageUrl: string
  name: string
  courseType: number
  teacherName: string
  feeType?: string
}
export interface CourseDetailVO {
  course: {
    title: string
    bannerImg: string
    viewNum: number
    freeFlag: boolean
    desc: string
    target: string
  }
  chapter: Array<{ id: number; name: string }>
  teacher: { avatar: string; name: string; intro: string }
  aiAssistant?: { enabled: boolean }
}
export interface ChapterDetailVO {
  id: number
  mediaSrc: string
  mediaType: 'live' | 'video'
  article: string
  attachList: Array<{ id: number; fileName: string; fileSize: string }>
}
export interface ChapterListItem { id: number; chapterName: string }

/** 综合成绩 - 考试历史记录 */
export interface CourseExamHistoryVO {
  recordId: number
  examId: number
  examName: string
  isFinalExam: number
  score: number
  totalScore: number
  passScore: number
  isPass: number
  attemptNo: number
  submitTime: string
}

/** 综合成绩 */
export interface CourseScoreVO {
  courseId: number
  courseName: string
  courseImage: string
  examAvgScore: number
  examMaxScore: number
  examTotalCount: number
  examPassCount: number
  examPassRate: number
  practiceTotalCount: number
  practiceCorrectCount: number
  practiceAccuracyRate: number
  chapterTotalCount: number
  chapterStudiedCount: number
  chapterProgressRate: number
  examHistoryList: CourseExamHistoryVO[]
}

/** 公告项 */
export interface AnnouncementVO {
  id: number
  courseId: number
  title: string
  longTitle?: string
  category?: string
  summary?: string
  source?: string
  status: number
  content?: string
  createTime?: string
  createTimeStr?: string
}
