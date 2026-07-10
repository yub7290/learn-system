import { http } from './request'
import type { CaptchaRespVO, StudentLoginReqDTO, StudentLoginRespVO, StudentInfoRespVO } from '../types/auth'

export function getCaptcha(): Promise<CaptchaRespVO> {
  return http.get<CaptchaRespVO>('/student/auth/captcha')
}

export function login(data: StudentLoginReqDTO): Promise<StudentLoginRespVO> {
  return http.post<StudentLoginRespVO>('/student/auth/login', data)
}

export function getUserInfo(): Promise<StudentInfoRespVO> {
  return http.get<StudentInfoRespVO>('/student/auth/getUserInfo', undefined, undefined, { requireAuth: true })
}

/** 获取OAuth登录授权URL */
export async function getOAuthLoginUrl(platform: string) {
  return http.get<{ url: string }>('/student/auth/oauth/loginUrl', { platform }, null, { skipAuth: true })
}
