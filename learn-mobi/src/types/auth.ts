export interface CaptchaRespVO {
  key: string
  image: string
}

export interface StudentLoginReqDTO {
  account: string
  password: string
  captchaKey: string
  captchaCode: string
}

export interface StudentLoginRespVO {
  accessToken: string
  refreshToken: string
}

export interface StudentInfoRespVO {
  id: number
  account: string
  name: string
  nickName: string
  avatarUrl: string
  studentNo: string
  gender: number
  phone: string
  email: string
  major?: string
}
