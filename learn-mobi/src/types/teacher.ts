/**
 * 教师列表项
 */
export interface TeacherListItem {
  id: number
  avatarUrl?: string
  name: string
  titleName?: string
  signature?: string
}

/** 教师详情 */
export interface TeacherInfoVO {
  id: number
  avatarUrl: string
  name: string
  titleName: string
  rating: number
  desc: string
  courseCount?: number
  studentCount?: number
}

/** 教师名下课程 */
export interface TeacherCourseVO {
  id: number
  imageUrl: string
  name: string
  teacherName: string
  courseType: number
  feeType?: string
}
