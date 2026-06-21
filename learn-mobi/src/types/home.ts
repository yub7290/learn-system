export interface BannerItem { img: string; link: string }
export interface NavItem { img: string; name: string; link: string }
export interface HomeBaseVO {
  logo: string
  banner: BannerItem[]
  nav: NavItem[]
}
export interface TeacherItem {
  id: number
  avatar: string
  name: string
  star: number
}
export interface HomeCourseItem {
  id: number
  img: string
  name: string
  link: string
  type: number
  teacher?: string
}
