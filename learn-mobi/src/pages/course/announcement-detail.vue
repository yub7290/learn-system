<template>
  <view class="announcement-detail-page">
    <view v-if="loading" class="loading-wrap">
      <u-loading-icon mode="circle" size="28"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="detail-content">
      <text class="detail-title">{{ detail.longTitle || detail.title }}</text>
      <view class="detail-meta">
        <text class="meta-source" v-if="detail.source">{{ detail.source }}</text>
        <text class="meta-time">{{ detail.createTimeStr || detail.createTime || '' }}</text>
      </view>
      <text class="detail-summary" v-if="detail.summary">{{ detail.summary }}</text>
      <rich-text class="detail-body" :nodes="detail.content || '暂无内容'"></rich-text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAnnouncementDetail } from '../../api/announcement'
import type { AnnouncementVO } from '../../types/course'

const id = ref(0)
const detail = ref<AnnouncementVO>({ id: 0, courseId: 0, title: '', status: 1 })
const loading = ref(true)

onLoad((q: any) => {
  id.value = Number(q.id) || 0
  if (id.value) loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getAnnouncementDetail(id.value)
  } catch {
    uni.showToast({ title: '加载公告详情失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.announcement-detail-page { min-height: 100vh; background: $bg-page; padding: 16px; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 80px; gap: 10px; }
.loading-text { font-size: 13px; color: $text-3; }
.detail-content { background: $bg-card; border-radius: 12px; padding: 20px; box-shadow: $shadow-card; }
.detail-title { font-size: 18px; font-weight: 600; color: $text-1; line-height: 1.5; }
.detail-meta { display: flex; gap: 14px; margin-top: 10px; font-size: 12px; color: $text-3; }
.detail-summary { display: block; background: #f5f7fa; padding: 10px 14px; border-radius: 8px; margin-top: 14px; font-size: 13px; color: $text-2; line-height: 1.6; }
.detail-body { margin-top: 16px; font-size: 14px; color: $text-2; line-height: 1.8; }
</style>
