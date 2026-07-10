<template>
  <view class="page">
    <u-navbar title="我的订单" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left"><u-icon name="arrow-left" size="20"></u-icon></view>
    </u-navbar>
    <scroll-view scroll-y class="content-scroll" show-scrollbar="false"
      refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore">
      <view v-for="item in orderList" :key="item.orderNo" class="order-item">
        <view class="order-header">
          <text class="order-no">{{ item.orderNo }}</text>
          <text :class="['order-status', 'status-' + item.status]">{{ statusText(item.status) }}</text>
        </view>
        <view class="order-body">
          <text class="course-name">{{ item.courseName }}</text>
          <text class="order-amount">¥{{ item.amount.toFixed(2) }}</text>
        </view>
        <view class="order-footer"><text class="order-time">{{ item.paidAt || '' }}</text></view>
      </view>
      <view v-if="orderList.length === 0 && !loading" class="empty-state"><text>暂无订单记录</text></view>
      <view v-if="noMore && orderList.length > 0" class="no-more"><text>— 没有更多记录了 —</text></view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyCourseOrders } from '../../api/mine'
import type { CourseOrderVO } from '../../types/mine'

const loading = ref(false)
const isRefreshing = ref(false)
const noMore = ref(false)
const orderList = ref<CourseOrderVO[]>([])
const page = ref(1)
const pageSize = 10

onShow(() => { loadOrders(true) })

async function loadOrders(reset = false) {
  if (loading.value) return
  if (reset) { page.value = 1; noMore.value = false; orderList.value = [] }
  if (noMore.value) return
  loading.value = true
  try {
    const res = await getMyCourseOrders({ page: page.value, pageSize })
    if (reset) orderList.value = res.list; else orderList.value.push(...res.list)
    if (orderList.value.length >= res.total || res.list.length < pageSize) noMore.value = true
    page.value++
  } catch { /* 保持 */ }
  finally { loading.value = false; isRefreshing.value = false }
}

function onRefresh() { isRefreshing.value = true; loadOrders(true) }
function onLoadMore() { loadOrders(false) }
function goBack() { uni.navigateBack() }
function statusText(status: number) {
  const map: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已退款', 3: '已关闭' }
  return map[status] || '未知'
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.content-scroll { height: 100vh; padding-top: 88rpx; }
.order-item { margin: 24rpx; padding: 28rpx; background: #fff; border-radius: 12rpx; }
.order-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20rpx; border-bottom: 1rpx solid #f0f0f0; }
.order-no { font-size: 24rpx; color: #999; }
.order-status { font-size: 26rpx; font-weight: 500; }
.status-0 { color: #999; } .status-1 { color: #07c160; } .status-2 { color: #ff7847; } .status-3 { color: #f56c6c; }
.order-body { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; }
.course-name { font-size: 28rpx; color: #333; flex: 1; }
.order-amount { font-size: 30rpx; font-weight: 600; color: #333; }
.order-footer { padding-top: 16rpx; border-top: 1rpx solid #f0f0f0; }
.order-time { font-size: 24rpx; color: #999; }
.empty-state, .no-more { text-align: center; padding: 80rpx 0; color: #999; font-size: 26rpx; }
.bottom-space { height: 40rpx; }
</style>
