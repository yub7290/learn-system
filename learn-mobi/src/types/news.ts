export interface NewsCategoryVO {
  id: number
  name: string
  sortOrder?: number
  status?: number
}

export interface NewsVO {
  id: number
  title: string
  summary?: string
  coverUrl?: string
  content: string
  categoryId?: number
  categoryName?: string
  source?: string
  author?: string
  status: number
  views?: number
  publishTime?: string
  publishTimeStr?: string
}
