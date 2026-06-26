/**
 * 我的 - TypeScript 类型定义
 */

/** 课程学习进度项 */
export interface MyCourseItemVO {
  /** 课程ID */
  id: number
  /** 课程名称 */
  name: string
  /** 课程封面 */
  coverUrl: string
  /** 总课时数 */
  totalLessonCount: number
  /** 已学习课时数 */
  learnedLessonCount: number
  /** 学习进度百分比 */
  progressPercent: number
  /** 最近学习时间 */
  lastStudyTime?: string
}

/** 学习卡信息 */
export interface StudyCardVO {
  /** 卡片ID */
  id: number
  /** 卡片名称 */
  name: string
  /** 卡片类型 */
  cardType: number
  /** 有效期开始时间 */
  validStartTime: string
  /** 有效期结束时间 */
  validEndTime: string
  /** 是否有效 */
  valid: boolean
}

/** 积分记录项 */
export interface PointsRecordVO {
  /** 记录ID */
  id: number
  /** 变动积分 */
  points: number
  /** 变动类型: 1 获得, 2 消耗 */
  changeType: number
  /** 变动描述 */
  description: string
  /** 创建时间 */
  createTime: string
}

/** 积分账户 */
export interface PointsAccountVO {
  /** 当前可用积分 */
  availablePoints: number
  /** 累计获得积分 */
  totalPoints: number
}

/** 积分兑换商品 */
export interface PointsProductVO {
  /** 商品ID */
  id: number
  /** 商品名称 */
  name: string
  /** 商品图片 */
  imageUrl: string
  /** 所需积分 */
  requiredPoints: number
  /** 库存数量 */
  stockCount: number
}

/** 个人信息 */
export interface PersonalInfoVO {
  /** 用户ID */
  id: number
  /** 昵称 */
  nickname: string
  /** 头像地址 */
  avatarUrl: string
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 邮箱 */
  email: string
  /** 性别: 0 未知, 1 男, 2 女 */
  gender: number
  /** 生日 */
  birthday: string
  /** 所在学校 */
  schoolName: string
  /** 年级 */
  gradeName: string
}

/** 个人中心汇总 */
export interface MineCentreVO {
  /** 用户信息 */
  userInfo: PersonalInfoVO
  /** 积分账户 */
  pointsAccount: PointsAccountVO
  /** 在学课程数 */
  studyingCourseCount: number
  /** 已完成课程数 */
  completedCourseCount: number
  /** 考试次数 */
  examCount: number
}
