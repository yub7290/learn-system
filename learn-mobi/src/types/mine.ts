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
  /** 实例ID */
  id: number
  /** 学习卡标题 */
  title: string
  /** 卡号 */
  cardNo: string
  /** 金额 */
  amount: number
  /** 状态 0:未使用 1:已使用 2:已回滚 3:已禁用 */
  status: number
  /** 有效开始日期 */
  validStartDate: string
  /** 有效结束日期 */
  validEndDate: string
  /** 关联课程名称 */
  courseNames: string[]
  /** 使用时间 */
  useTime: string
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
  /** 商品类型: 1=实物商品 2=学习卡 */
  productType: number
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

/** 登录日志 */
export interface LoginLogVO {
  /** 登录时间 */
  createTime: string
  /** 客户端IP */
  ip: string
  /** 设备信息 */
  userAgent: string
  /** 登录状态 1=成功 0=失败 */
  status: number
  /** 失败原因 */
  errorMsg?: string
}

/** 收货地址 */
export interface AddressVO {
  /** 地址ID */
  id: number
  /** 收货人姓名 */
  name: string
  /** 联系电话 */
  phone: string
  /** 省 */
  province: string
  /** 市 */
  city: string
  /** 区 */
  district: string
  /** 详细地址 */
  detail: string
  /** 是否默认: 0=否 1=是 */
  isDefault: number
}

/** 兑换结果 */
export interface ExchangeResultVO {
  /** 兑换码(线下) */
  exchangeCode?: string
  /** 学习卡卡号(学习卡) */
  cardNo?: string
  /** 学习卡密钥(学习卡) */
  cardSecret?: string
  /** 订单编号(邮寄) */
  orderNo?: string
}
