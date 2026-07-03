import { http } from './request'
import type { AddressVO } from '../types/mine'

/**
 * 获取收货地址列表
 */
export function getAddressList(): Promise<AddressVO[]> {
  return http.get<AddressVO[]>('/app/address/list')
}

/**
 * 新增收货地址
 */
export function addAddress(data: Omit<AddressVO, 'id'>): Promise<void> {
  return http.post<void>('/app/address', data)
}

/**
 * 更新收货地址
 */
export function updateAddress(data: AddressVO): Promise<void> {
  return http.put<void>('/app/address', data)
}

/**
 * 删除收货地址
 */
export function deleteAddress(id: number): Promise<void> {
  return http.delete<void>(`/app/address/${id}`)
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(id: number): Promise<void> {
  return http.put<void>(`/app/address/${id}/default`)
}
