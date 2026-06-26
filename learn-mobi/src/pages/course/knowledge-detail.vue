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
      <view class="detail-card">
        <!-- 标题与归属 -->
        <view class="detail-header">
          <text class="detail-title">{{ detailInfo.name || '知识点' }}</text>
          <view class="detail-meta">
            <text class="course-tag">{{ courseName }}</text>
            <text class="mastery-tag" v-if="detailInfo.masteryPercent !== undefined">掌握度 {{ detailInfo.masteryPercent }}%</text>
            <text class="important-tag" v-if="detailInfo.important">重点</text>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 正文内容 -->
        <view class="detail-content">
          <!-- 富文本渲染 -->
          <rich-text class="content-rich" :nodes="renderedContent" v-if="renderedContent"></rich-text>
          <text class="content-plain" v-else>{{ detailInfo.content || '暂无内容' }}</text>

          <!-- 关联视频 -->
          <view class="video-section" v-if="detailInfo.videoUrl">
            <view class="video-header">
              <u-icon name="play-circle" color="#0195ff" size="22"></u-icon>
              <text class="video-title">关联视频讲解</text>
            </view>
            <video class="video-player" :src="detailInfo.videoUrl" controls></video>
          </view>
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
import type { KnowledgeDetailVO } from '../../types/knowledge'

const knowledgeId = ref(0)
const courseId = ref(0)
const courseName = ref('')
const detailInfo = ref<KnowledgeDetailVO>({
  id: 0,
  name: '',
  content: '',
  important: false,
  questionIds: [],
  masteryPercent: 0,
})

/** 将 content 中的 markdown 标题等转换为 html */
const renderedContent = computed(() => {
  const text = detailInfo.value.content || ''
  if (!text) return ''
  // 简单 markdown 转 html：将 ## 标题、**加粗**、\n 换行转换
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
  return `<p>${html}</p>`
})

onLoad((options: any) => {
  if (options.id) {
    knowledgeId.value = Number(options.id)
  }
  if (options.courseId) {
    courseId.value = Number(options.courseId)
  }
  if (options.courseName) {
    courseName.value = decodeURIComponent(options.courseName)
  }
  loadDetail()
})

async function loadDetail() {
  try {
    uni.showLoading({ title: '加载中...' })
    detailInfo.value = await getKnowledgeDetail(knowledgeId.value)
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: $bg-page;
}

.detail-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
}

/* 顶部导航栏 */
.page-header {
  flex-shrink: 0;
  width: 100%;
  padding: 24rpx 32rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $bg-card;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-1;
}

/* 正文滚动区 */
.page-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.detail-card {
  width: 100%;
  padding: 32rpx;
  background: $bg-card;
  border-radius: 12rpx;
  box-sizing: border-box;
  box-shadow: $shadow-card;
}

/* 标题区 */
.detail-header {
  margin-bottom: 24rpx;
}

.detail-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $text-1;
  line-height: 1.4;
  margin-bottom: 20rpx;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.course-tag {
  padding: 6rpx 16rpx;
  background: $primary-bg;
  color: $primary;
  font-size: 22rpx;
  border-radius: 6rpx;
}

.mastery-tag {
  padding: 6rpx 16rpx;
  background: #f0f9eb;
  color: #07c160;
  font-size: 22rpx;
  border-radius: 6rpx;
}

.important-tag {
  padding: 6rpx 16rpx;
  background: #fff3ec;
  color: #ff7847;
  font-size: 22rpx;
  border-radius: 6rpx;
}

.divider {
  width: 100%;
  height: 1rpx;
  background: $border;
  margin-bottom: 32rpx;
}

/* 正文内容 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.content-rich {
  font-size: 28rpx;
  color: $text-2;
  line-height: 1.8;

  :deep(h1) {
    font-size: 34rpx;
    font-weight: 700;
    color: $text-1;
    margin: 20rpx 0 12rpx;
  }

  :deep(h2) {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-1;
    margin: 16rpx 0 10rpx;
  }

  :deep(h3) {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-1;
    margin: 12rpx 0 8rpx;
  }

  :deep(strong) {
    color: $text-1;
    font-weight: 700;
  }

  :deep(li) {
    list-style: none;
    padding-left: 20rpx;
    position: relative;
    margin: 6rpx 0;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: $primary;
    }
  }

  :deep(p) {
    margin: 8rpx 0;
  }
}

.content-plain {
  font-size: 28rpx;
  color: $text-2;
  line-height: 1.8;
}

/* 视频关联 */
.video-section {
  margin-top: 24rpx;
  padding: 20rpx;
  background: $bg-page;
  border-radius: 12rpx;
}

.video-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.video-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-1;
}

.video-player {
  width: 100%;
  border-radius: 8rpx;
}

.bottom-space {
  height: 60rpx;
  width: 100%;
}
</style>
