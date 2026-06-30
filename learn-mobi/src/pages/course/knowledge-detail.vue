<template>
  <view class="detail-page">
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <u-icon name="arrow-left" color="#333" size="22"></u-icon>
        </view>
        <text class="page-title">知识点详情</text>
      </view>
    </view>

    <!-- 正文滚动区域 -->
    <scroll-view scroll-y class="page-scroll">
      <view v-if="loading" class="loading-wrap">
        <u-loading-icon mode="flower" size="36"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <view v-if="!loading && !detailInfo.id" class="empty-wrap">
        <u-empty text="知识点不存在" mode="data" margin-top="60"></u-empty>
      </view>

      <view class="detail-card" v-if="!loading && detailInfo.id">
        <!-- 标题与归类 -->
        <view class="detail-header">
          <text class="detail-title">{{ detailInfo.title || '知识点' }}</text>
          <view class="detail-meta">
            <text class="cate-tag" v-if="detailInfo.categoryName">{{ detailInfo.categoryName }}</text>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 正文内容 -->
        <view class="detail-content">
          <rich-text class="content-rich" :nodes="renderedContent" v-if="renderedContent"></rich-text>
          <text class="content-plain" v-else>{{ detailInfo.content || '暂无内容' }}</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getKnowledgeDetail } from '../../api/knowledge'

const knowledgeId = ref(0)
const loading = ref(false)
const detailInfo = ref({ id: 0, title: '', content: '', categoryName: '' })

/** 富文本内容直接渲染（后端返回的已经是 HTML） */
const renderedContent = computed(() => {
  return detailInfo.value?.content || ''
})

onLoad((options: any) => {
  if (options.id) knowledgeId.value = Number(options.id)
  loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    const result = await getKnowledgeDetail(knowledgeId.value)
    detailInfo.value = result ?? { id: 0, title: '', content: '', categoryName: '' }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
page { height: 100%; width: 100%; overflow: hidden; background: $bg-page; }
.detail-page { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: $bg-page; }
.page-header { flex-shrink: 0; width: 100%; padding: 24rpx 32rpx; padding-top: calc(24rpx + env(safe-area-inset-top)); background: $bg-card; box-sizing: border-box; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.header-left { display: flex; align-items: center; gap: 12rpx; }
.back-btn { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 32rpx; font-weight: 600; color: $text-1; }
.page-scroll { flex: 1; width: 100%; height: 0; padding: 24rpx; box-sizing: border-box; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; gap: 20rpx; }
.loading-text { font-size: 26rpx; color: $text-3; }
.empty-wrap { padding-top: 100rpx; }
.detail-card { width: 100%; padding: 32rpx; background: $bg-card; border-radius: 12rpx; box-sizing: border-box; box-shadow: $shadow-card; }
.detail-header { margin-bottom: 24rpx; }
.detail-title { display: block; font-size: 36rpx; font-weight: 700; color: $text-1; line-height: 1.4; margin-bottom: 20rpx; }
.detail-meta { display: flex; align-items: center; gap: 16rpx; flex-wrap: wrap; }
.cate-tag { padding: 6rpx 16rpx; background: $primary-bg; color: $primary; font-size: 22rpx; border-radius: 6rpx; }
.divider { width: 100%; height: 1rpx; background: $border; margin-bottom: 32rpx; }
.detail-content { display: flex; flex-direction: column; gap: 24rpx; }
.content-rich { font-size: 28rpx; color: $text-2; line-height: 1.8; }
.content-rich :deep(h1) { font-size: 34rpx; font-weight: 700; color: $text-1; margin: 20rpx 0 12rpx; }
.content-rich :deep(h2) { font-size: 32rpx; font-weight: 600; color: $text-1; margin: 16rpx 0 10rpx; }
.content-rich :deep(h3) { font-size: 30rpx; font-weight: 600; color: $text-1; margin: 12rpx 0 8rpx; }
.content-rich :deep(strong) { color: $text-1; font-weight: 700; }
.content-rich :deep(li) { list-style: none; padding-left: 20rpx; position: relative; margin: 6rpx 0; }
.content-rich :deep(li)::before { content: '•'; position: absolute; left: 0; color: $primary; }
.content-rich :deep(p) { margin: 8rpx 0; }
.content-plain { font-size: 28rpx; color: $text-2; line-height: 1.8; }
.bottom-space { height: 60rpx; width: 100%; }
</style>
