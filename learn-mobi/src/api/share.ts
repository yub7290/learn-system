import { http } from './request'
import type { ShareContentVO } from '../types/share'

export function getActiveShareContent(): Promise<ShareContentVO | null> {
  return http.get<ShareContentVO | null>('/app/share/content', undefined, undefined, { showError: false })
}