import type { FriendVO } from '../types/mine'
import { http } from './request'

/**
 * 获取我的好友列表
 */
export function getMyFriends(): Promise<FriendVO[]> {
  return http.get<FriendVO[]>('/app/friend/my')
}

/**
 * 移除好友（删除双向关系）
 *
 * @param friendId 好友学员ID
 */
export function removeFriend(friendId: number): Promise<void> {
  return http.delete<void>(`/app/friend/${friendId}`)
}
