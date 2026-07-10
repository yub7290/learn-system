<template>
  <view class="news-detail-page">
    <view class="nav-bar">
      <u-icon name="arrow-left" size="22" color="#222" @click="goBack"></u-icon>
      <text class="nav-title">资讯详情</text>
      <view class="nav-right"></view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <u-loading-icon mode="circle" size="28"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="detail-content">
      <text class="detail-title">{{ detail.title }}</text>
      <view class="detail-meta">
        <text class="meta-tag" v-if="detail.categoryName">{{ detail.categoryName }}</text>
        <text class="meta-source" v-if="detail.source">{{ detail.source }}</text>
        <text class="meta-time" v-if="detail.author">作者：{{ detail.author }}</text>
        <text class="meta-time">{{ detail.publishTimeStr || detail.publishTime || '' }}</text>
        <text class="meta-views" v-if="detail.views != null">阅读 {{ detail.views }}</text>
      </view>
      <image
        v-if="detail.coverUrl"
        class="detail-cover"
        :src="detail.coverUrl"
        mode="aspectFill"
      />
      <rich-text class="detail-body" :nodes="detail.content || '暂无内容'"></rich-text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNewsDetail } from '../../api/news'
import type { NewsVO } from '../../types/news'

const id = ref(0)
const detail = ref<NewsVO>({ id: 0, title: '', content: '', status: 1 })
const loading = ref(true)

onLoad((q: any) => {
  id.value = Number(q.id) || 0
  if (id.value) loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await getNewsDetail(id.value)
  } catch {
    uni.showToast({ title: '加载资讯详情失败', icon: 'none' })
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
.news-detail-page { min-height: 100vh; background: $bg-page; display: flex; flex-direction: column; }
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
.meta-views { margin-left: auto; }
.detail-cover {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin: 16px 0;
  background: #f0f2f5;
}
.detail-body { font-size: 14px; color: $text-2; line-height: 1.8; }
</style>
