export interface BannerItem { id: number; imageUrl: string; linkUrl: string }
export interface NavItem { name: string; link: string }
export interface HomeBaseVO {
  logo: string
  banner: BannerItem[]
  nav: NavItem[]
}
export interface TeacherItem {
  id: number
  avatarUrl: string
  name: string
  titleName: string
  rating: number
}
export interface HomeCourseItem {
  id: number
  imageUrl: string
  name: string
  courseType: number
  teacherName: string
  feeType?: string
}
