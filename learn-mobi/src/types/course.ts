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
}
export interface ChapterDetailVO {
  id: number
  mediaSrc: string
  mediaType: 'live' | 'video'
  article: string
  attachList: Array<{ id: number; fileName: string; fileSize: string }>
}
export interface ChapterListItem { id: number; chapterName: string }
