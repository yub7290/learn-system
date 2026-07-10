<template>
  <view class="notice-detail-page">
    <view class="nav-bar">
      <u-icon name="arrow-left" size="22" color="#222" @click="goBack"></u-icon>
      <text class="nav-title">通知详情</text>
      <view class="nav-right"></view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <u-loading-icon mode="circle" size="28"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="detail-content">
      <text class="detail-title">{{ detail.title }}</text>
      <view class="detail-meta">
        <text class="meta-tag" v-if="detail.courseName">{{ detail.courseName }}</text>
        <text class="meta-tag meta-type" v-if="detail.type">{{ typeLabel(detail.type) }}</text>
        <text class="meta-time">{{ detail.publishTime || detail.createTimeStr || '' }}</text>
      </view>
      <rich-text class="detail-body" :nodes="detail.content || '暂无内容'"></rich-text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNoticeDetail } from '../../api/notice'
import type { NoticeVO } from '../../types/notice'

const typeList = [
  { value: 1, label: '系统' },
  { value: 2, label: '课程' },
  { value: 3, label: '考试' },
  { value: 4, label: '活动' },
]
const id = ref(0)
const detail = ref<NoticeVO>({ id: 0, courseId: 0, title: '', content: '', type: 0, status: 1 })
const loading = ref(true)

function typeLabel(type?: number) {
  return (typeList.find((t) => t.value === type) || { label: '' }).label
}

onLoad((q: any) => {
  id.value = Number(q.id) || 0
  if (id.value) loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getNoticeDetail(id.value)
  } catch {
    uni.showToast({ title: '加载通知详情失败', icon: 'none' })
    setTimeout(() => goBack(), 1500)
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack().catch(() => uni.switchTab({ url: '/pages/mine/mine' }))
}
</script>

<style scoped lang="scss">
.notice-detail-page { min-height: 100vh; background: $bg-page; display: flex; flex-direction: column; }
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
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 80px; gap: 10px; }
.loading-text { font-size: 13px; color: $text-3; }
.detail-content { background: $bg-card; border-radius: 12px; padding: 20px; margin: 14px; box-shadow: $shadow-card; }
.detail-title { font-size: 18px; font-weight: 600; color: $text-1; line-height: 1.5; }
.detail-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 12px; font-size: 12px; color: $text-3; }
.meta-tag { font-size: 11px; padding: 1px 8px; border-radius: 8px; background: $primary-bg; color: $primary; }
.meta-type { background: #eafaf0; color: #07c160; }
.meta-time { margin-left: auto; }
.detail-body { margin-top: 18px; font-size: 14px; color: $text-2; line-height: 1.8; }
</style>
