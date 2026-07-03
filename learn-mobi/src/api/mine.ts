import type {
  MineCentreVO,
  MyCourseItemVO,
  LoginLogVO,
  StudyCardVO,
  PointsAccountVO,
  PointsRecordVO,
  PointsProductVO,
  PersonalInfoVO,
  ExchangeResultVO,
} from '../types/mine'
import { isLoggedIn } from '../utils/auth'
import { http, uploadFile } from './request'

const emptyPersonalInfo: PersonalInfoVO = {
  id: 0,
  nickname: '',
  avatarUrl: '',
  realName: '',
  phone: '',
  email: '',
  gender: 0,
  birthday: '',
  schoolName: '',
}

/**
 * 获取个人中心汇总信息
 */
export function getMineCentre(): Promise<MineCentreVO> {
  if (!isLoggedIn()) {
    return Promise.resolve({
      userInfo: emptyPersonalInfo,
      pointsAccount: { availablePoints: 0, totalPoints: 0 },
      studyingCourseCount: 0,
      completedCourseCount: 0,
      examCount: 0,
    })
  }
  return http.get<MineCentreVO>('/app/profile/centre')
}

/**
 * 获取我的课程列表
 */
export function getMyCourseList(params: {
  page: number
  pageSize: number
}): Promise<{ list: MyCourseItemVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http.post<{ records: Array<{
    id: number
    name: string
    imageUrl: string
    totalCourseTime: number
    learnProgress: number
    recentLearnTime: string | null
  }>; total: number }>('/app/profile/myCourse', {
    pageParam: { pageNum: params.page, pageSize: params.pageSize },
    queryParam: {},
  }).then((res) => ({
    list: (res.records || []).map((item) => ({
      id: item.id,
      name: item.name,
      coverUrl: item.imageUrl,
      totalLessonCount: item.totalCourseTime,
      learnedLessonCount: Math.round(item.learnProgress * item.totalCourseTime / 100),
      progressPercent: item.learnProgress,
      lastStudyTime: item.recentLearnTime || '',
    })),
    total: res.total || 0,
  }))
}

/**
 * 获取学习卡汇总信息
 */
export function getStudyCardSummary(): Promise<{ totalCount: number; usedCount: number }> {
  if (!isLoggedIn()) return Promise.resolve({ totalCount: 0, usedCount: 0 })
  return http.get<{ totalCount: number; usedCount: number }>('/app/study-card/summary')
}

/**
 * 获取我的学习卡列表（分页）
 */
export function getMyStudyCards(params: {
  page: number
  pageSize: number
}): Promise<{ list: StudyCardVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http.post<{ records: StudyCardVO[]; total: number }>('/app/study-card/my', {
    pageParam: { pageNum: params.page, pageSize: params.pageSize },
    queryParam: {},
  }).then((res) => ({
    list: res.records || [],
    total: res.total || 0,
  }))
}

/**
 * 使用学习卡
 */
export function useStudyCard(cardNo: string): Promise<void> {
  return http.post<void>('/app/study-card/use', { cardNo })
}

/**
 * 暂存学习卡
 */
export function saveStudyCard(cardNo: string): Promise<void> {
  return http.post<void>('/app/study-card/save', { cardNo })
}

/**
 * 获取积分账户信息
 */
export function getPointsAccount(): Promise<PointsAccountVO> {
  if (!isLoggedIn()) return Promise.resolve({ availablePoints: 0, totalPoints: 0 })
  return http.get<PointsAccountVO>('/app/profile/points')
}

/**
 * 获取积分记录列表
 */
export function getPointsRecordList(params: {
  page: number
  pageSize: number
}): Promise<{ list: PointsRecordVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http.post<{ records: PointsRecordVO[]; total: number }>('/app/profile/points/records', {
    pageParam: { pageNum: params.page, pageSize: params.pageSize },
  }).then((res) => ({ list: res.records || [], total: res.total || 0 }))
}

/**
 * 获取积分兑换商品列表
 */
export function getPointsProductList(params: {
  page: number
  pageSize: number
}): Promise<{ list: PointsProductVO[]; total: number }> {
  return http.post<{ records: PointsProductVO[]; total: number }>('/app/profile/points/products', {
    pageParam: { pageNum: params.page, pageSize: params.pageSize },
  }).then((res) => ({ list: res.records || [], total: res.total || 0 }))
}

/**
 * 积分兑换商品
 */
export function exchangePointsProduct(
  productId: number,
  exchangeType: number,
  addressId?: number
): Promise<ExchangeResultVO> {
  if (!isLoggedIn()) return Promise.reject(new Error('unauthorized'))
  return http.post<ExchangeResultVO>('/app/profile/points/exchange', {
    productId,
    exchangeType,
    addressId,
  })
}

/**
 * 获取个人信息
 */
export function getPersonalInfo(): Promise<PersonalInfoVO> {
  if (!isLoggedIn()) return Promise.resolve(emptyPersonalInfo)
  return http.get<PersonalInfoVO>('/app/profile/getInfo')
}

/**
 * 更新个人信息
 */
export function updatePersonalInfo(
  data: Partial<PersonalInfoVO>
): Promise<PersonalInfoVO> {
  if (!isLoggedIn()) return Promise.reject(new Error('unauthorized'))
  return http.post<PersonalInfoVO>('/app/profile/updateInfo', data)
}

/**
 * 上传头像图片到七牛云，返回持久化 URL
 */
export function uploadAvatar(filePath: string): Promise<string> {
  return uploadFile({ filePath, formData: { directory: 'edu/avatar' } })
}

/**
 * 获取登录日志
 */
export function getLoginLogList(): Promise<LoginLogVO[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return http.get<LoginLogVO[]>('/app/profile/loginLog')
}

/**
 * 注册新用户
 */
export function register(data: {
  account: string
  password: string
  captchaKey: string
  captchaCode: string
}): Promise<void> {
  return http.post<void>('/student/auth/register', data, undefined, { skipAuth: true })
}

/**
 * 记录分享行为
 */
export function shareRecord(): Promise<void> {
  return http.post<void>('/app/share/record')
}

/**
 * 分享注册奖励
 */
export function shareRegister(inviterId: number): Promise<void> {
  return http.post<void>('/app/share/register', { inviterId })
}
