import type {
  MineCentreVO,
  MyCourseItemVO,
  StudyCardVO,
  PointsAccountVO,
  PointsRecordVO,
  PointsProductVO,
  PersonalInfoVO,
} from '../types/mine'

/**
 * 获取个人中心汇总信息
 */
export function getMineCentre(): Promise<MineCentreVO> {
  return Promise.resolve({
    userInfo: {
      id: 1,
      nickname: '学习用户001',
      avatarUrl: '/static/default-avatar.png',
      realName: '张三',
      phone: '138****8888',
      email: 'zhangsan@example.com',
      gender: 1,
      birthday: '2000-01-01',
      schoolName: '示例大学',
      gradeName: '大一',
    },
    pointsAccount: {
      availablePoints: 5800,
      totalPoints: 12000,
    },
    studyingCourseCount: 3,
    completedCourseCount: 5,
    examCount: 12,
  })
}

/**
 * 获取我的课程列表
 */
export function getMyCourseList(params: {
  page: number
  pageSize: number
  status?: number
}): Promise<{ list: MyCourseItemVO[]; total: number }> {
  const allCourses: MyCourseItemVO[] = [
    {
      id: 1,
      name: '高等数学基础精讲',
      coverUrl: 'https://picsum.photos/320/240?random=1',
      totalLessonCount: 48,
      learnedLessonCount: 36,
      progressPercent: 75,
      lastStudyTime: '2026-06-20 14:30',
    },
    {
      id: 2,
      name: '大学英语四级冲刺',
      coverUrl: 'https://picsum.photos/320/240?random=2',
      totalLessonCount: 36,
      learnedLessonCount: 16,
      progressPercent: 45,
      lastStudyTime: '2026-06-18 09:15',
    },
    {
      id: 3,
      name: '计算机网络原理',
      coverUrl: 'https://picsum.photos/320/240?random=3',
      totalLessonCount: 32,
      learnedLessonCount: 32,
      progressPercent: 100,
      lastStudyTime: '2026-05-30 16:00',
    },
    {
      id: 4,
      name: 'Python入门体验课',
      coverUrl: 'https://picsum.photos/320/240?random=4',
      totalLessonCount: 12,
      learnedLessonCount: 3,
      progressPercent: 25,
      lastStudyTime: '2026-06-22 11:00',
    },
  ]
  return Promise.resolve({ list: allCourses, total: allCourses.length })
}

/**
 * 获取学习卡列表
 */
export function getStudyCardList(): Promise<StudyCardVO[]> {
  return Promise.resolve([
    {
      id: 1,
      name: '年度学习卡',
      cardType: 1,
      validStartTime: '2024-01-01',
      validEndTime: '2024-12-31',
      valid: true,
    },
    {
      id: 2,
      name: '季度学习卡',
      cardType: 2,
      validStartTime: '2024-03-01',
      validEndTime: '2025-02-28',
      valid: true,
    },
    {
      id: 3,
      name: '体验学习卡',
      cardType: 3,
      validStartTime: '2024-06-01',
      validEndTime: '2024-08-31',
      valid: false,
    },
  ])
}

/**
 * 获取积分账户信息
 */
export function getPointsAccount(): Promise<PointsAccountVO> {
  return Promise.resolve({
    availablePoints: 5800,
    totalPoints: 12000,
  })
}

/**
 * 获取积分记录列表
 */
export function getPointsRecordList(params: {
  page: number
  pageSize: number
}): Promise<{ list: PointsRecordVO[]; total: number }> {
  const records: PointsRecordVO[] = [
    { id: 1, points: 100, changeType: 1, description: '每日签到', createTime: '2026-06-25 08:00' },
    { id: 2, points: 200, changeType: 1, description: '完成课程学习', createTime: '2026-06-24 15:30' },
    { id: 3, points: 500, changeType: 2, description: '兑换学习卡', createTime: '2026-06-20 10:00' },
    { id: 4, points: 50, changeType: 1, description: '分享得积分', createTime: '2026-06-19 12:00' },
  ]
  return Promise.resolve({ list: records, total: records.length })
}

/**
 * 获取积分兑换商品列表
 */
export function getPointsProductList(params: {
  page: number
  pageSize: number
}): Promise<{ list: PointsProductVO[]; total: number }> {
  const products: PointsProductVO[] = [
    { id: 1, name: '语文进阶学习月卡', imageUrl: 'https://picsum.photos/id/24/200/200', requiredPoints: 1000, stockCount: 99 },
    { id: 2, name: '全科知识点季卡', imageUrl: 'https://picsum.photos/id/42/200/200', requiredPoints: 2500, stockCount: 50 },
    { id: 3, name: '定制笔记本套装', imageUrl: 'https://picsum.photos/id/20/200/200', requiredPoints: 800, stockCount: 30 },
    { id: 4, name: '古诗词必背手册', imageUrl: 'https://picsum.photos/id/28/200/200', requiredPoints: 1200, stockCount: 20 },
  ]
  return Promise.resolve({ list: products, total: products.length })
}

/**
 * 积分兑换商品
 */
export function exchangePointsProduct(
  productId: number
): Promise<{ success: boolean; orderId?: number }> {
  return Promise.resolve({ success: true, orderId: Date.now() })
}

/**
 * 获取个人信息
 */
export function getPersonalInfo(): Promise<PersonalInfoVO> {
  return Promise.resolve({
    id: 1,
    nickname: '学习用户001',
    avatarUrl: '/static/default-avatar.png',
    realName: '张三',
    phone: '138****8888',
    email: 'zhangsan@example.com',
    gender: 1,
    birthday: '2000-01-01',
    schoolName: '示例大学',
    gradeName: '大一',
  })
}

/**
 * 更新个人信息
 */
export function updatePersonalInfo(
  data: Partial<PersonalInfoVO>
): Promise<PersonalInfoVO> {
  return Promise.resolve({
    id: 1,
    nickname: data.nickname || '学习用户001',
    avatarUrl: data.avatarUrl || '/static/default-avatar.png',
    realName: data.realName || '',
    phone: data.phone || '',
    email: data.email || '',
    gender: data.gender ?? 0,
    birthday: data.birthday || '',
    schoolName: data.schoolName || '',
    gradeName: data.gradeName || '',
  })
}
