<template>
  <view class="notice-page">
    <view class="nav-bar">
      <u-icon name="arrow-left" size="22" color="#222" @click="goBack"></u-icon>
      <text class="nav-title">通知</text>
      <view class="nav-right"></view>
    </view>

    <view class="filter-bar">
      <view
        v-for="t in typeList"
        :key="t.value"
        class="filter-chip"
        :class="{ active: activeType === t.value }"
        @click="switchType(t.value)"
      >{{ t.label }}</view>
    </view>

    <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore">
      <view
        v-for="item in list"
        :key="item.id"
        class="notice-item"
        @click="goDetail(item.id)"
      >
        <view class="item-top">
          <view class="item-dot" v-if="item.readFlag === 0"></view>
          <text class="item-title">{{ item.title }}</text>
          <text class="item-unread" v-if="item.readFlag === 0">未读</text>
        </view>
        <view class="item-meta">
          <text class="item-cate" v-if="item.courseName">{{ item.courseName }}</text>
          <text class="item-type" v-if="item.type">{{ typeLabel(item.type) }}</text>
          <text class="item-time">{{ item.createTimeStr || item.publishTime || '' }}</text>
        </view>
      </view>

      <u-empty v-if="!loading && list.length === 0" text="暂无通知" mode="list" margin-top="80"></u-empty>
      <view v-if="loading" class="loading-wrap">
        <u-loading-icon mode="circle" size="26"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="finished && list.length > 0" class="list-end">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getNoticePage } from '../../api/notice'
import type { NoticeVO } from '../../types/notice'

const typeList = [
  { value: 0, label: '全部' },
  { value: 1, label: '系统' },
  { value: 2, label: '课程' },
  { value: 3, label: '考试' },
  { value: 4, label: '活动' },
]
const activeType = ref(0)
const list = ref<NoticeVO[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)

function typeLabel(type?: number) {
  return (typeList.find((t) => t.value === type) || { label: '' }).label
}

function switchType(value: number) {
  if (activeType.value === value) return
  activeType.value = value
  resetAndLoad()
}

function resetAndLoad() {
  page.value = 1
  finished.value = false
  list.value = []
  loadList()
}

function loadList() {
  if (loading.value || finished.value) return
  loading.value = true
  const type = activeType.value === 0 ? undefined : activeType.value
  getNoticePage({ page: page.value, pageSize: pageSize.value, type })
    .then((res) => {
      list.value = list.value.concat(res.list)
      total.value = res.total
      if (list.value.length >= total.value) finished.value = true
      page.value += 1
    })
    .catch(() => uni.showToast({ title: '加载失败', icon: 'none' }))
    .finally(() => {
      loading.value = false
      uni.stopPullDownRefresh()
    })
}

function loadMore() {
  if (!finished.value) loadList()
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/mine/notice-detail?id=${id}` }).catch(() => {})
}

function goBack() {
  uni.navigateBack().catch(() => uni.switchTab({ url: '/pages/mine/mine' }))
}

onShow(() => resetAndLoad())
onPullDownRefresh(() => resetAndLoad())
</script>

<style scoped lang="scss">
.notice-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $bg-page;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  background: #fff;
  border-bottom: 1px solid $border;
}
.nav-title { font-size: 17px; font-weight: 600; color: $text-1; }
.nav-right { width: 22px; }
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: $bg-page;
  overflow-x: auto;
}
.filter-chip {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: $text-2;
  background: #fff;
  border: 1px solid $border;
}
.filter-chip.active {
  color: #fff;
  background: $primary;
  border-color: $primary;
}
.list-scroll {
  flex: 1;
  padding: 4px 14px 20px;
  box-sizing: border-box;
}
.notice-item {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: $shadow-card;
}
.item-top { display: flex; align-items: center; gap: 8px; }
.item-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: $danger; flex-shrink: 0;
}
.item-title { flex: 1; font-size: 15px; font-weight: 600; color: $text-1; line-height: 1.4; }
.item-unread {
  font-size: 10px; color: $danger;
  border: 1px solid $danger; border-radius: 6px; padding: 0 5px; flex-shrink: 0;
}
.item-meta { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.item-cate { font-size: 10px; padding: 1px 8px; border-radius: 8px; background: $primary-bg; color: $primary; }
.item-type { font-size: 10px; padding: 1px 8px; border-radius: 8px; background: #eafaf0; color: #07c160; }
.item-time { font-size: 11px; color: $text-3; margin-left: auto; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 40px; gap: 8px; }
.loading-text { font-size: 13px; color: $text-3; }
.list-end { text-align: center; font-size: 12px; color: $text-3; padding: 16px 0; }
</style>
