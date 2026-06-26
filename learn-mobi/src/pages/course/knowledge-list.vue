<template>
  <view class="knowledge-page">
    <!-- 顶部标题栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <u-icon name="arrow-left" color="#333" size="22"></u-icon>
        </view>
        <text class="page-title">{{ courseName }} 知识库</text>
      </view>
    </view>

    <!-- 章节+知识点列表 -->
    <scroll-view scroll-y class="page-scroll" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <view v-if="chapterList.length === 0" class="empty-wrap">
        <u-empty text="暂无知识点" mode="list" margin-top="60"></u-empty>
      </view>

      <view class="chapter-list" v-else>
        <!-- 单个章节卡片 -->
        <view class="chapter-card" v-for="chapter in chapterList" :key="chapter.id">
          <!-- 章节标题 -->
          <view class="chapter-header">
            <u-icon name="bookmark" color="#07c160" size="22"></u-icon>
            <text class="chapter-title">{{ chapter.name }}</text>
          </view>

          <!-- 知识点列表 -->
          <view class="knowledge-list">
            <view
              class="knowledge-item"
              v-for="item in chapter.knowledgeList"
              :key="item.id"
              @click="goToDetail(item.id)"
            >
              <view class="item-left">
                <text class="knowledge-title">{{ item.name }}</text>
                <text class="knowledge-desc">{{ item.desc }}</text>
              </view>
              <view class="item-right">
                <text class="mastery-badge" v-if="item.masteryPercent !== undefined">{{ item.masteryPercent }}%</text>
                <u-icon name="arrow-right" color="#ccc" size="14"></u-icon>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getChapterList } from '../../api/course'
import { getKnowledgeList } from '../../api/knowledge'
import type { ChapterListItem } from '../../types/course'
import type { KnowledgeItemVO } from '../../types/knowledge'

/** 章节知识点组 */
interface ChapterKnowledgeGroup {
  id: number
  name: string
  knowledgeList: (KnowledgeItemVO & { desc?: string })[]
}

const courseId = ref(0)
const courseName = ref('')
const chapterList = ref<ChapterKnowledgeGroup[]>([])
const refreshing = ref(false)

/**
 * 加载章节与知识点数据
 */
async function loadData() {
  try {
    // 并行获取章节列表和知识点列表
    const [chRes, knList] = await Promise.all([
      getChapterList(courseId.value).catch(() => ({ list: [] as ChapterListItem[] })),
      getKnowledgeList({ courseId: courseId.value, page: 1, pageSize: 100 }).catch(() => ({ list: [] as KnowledgeItemVO[], total: 0 })),
    ])

    const chapters = chRes.list || []
    const knowledgeItems = knList.list || []

    if (chapters.length > 0) {
      // 按章节分组：每个章节分配知识点
      const itemsPerChapter = Math.ceil(knowledgeItems.length / Math.max(1, chapters.length))
      chapterList.value = chapters.map((ch, idx) => {
        const start = idx * itemsPerChapter
        const items = knowledgeItems.slice(start, start + itemsPerChapter).map((k) => ({
          ...k,
          desc: `掌握度 ${k.masteryPercent}%  |  ${k.questionCount} 道相关题目`,
        }))
        return {
          id: ch.id,
          name: ch.chapterName,
          knowledgeList: items,
        }
      })
    } else {
      // 无章节时，所有知识点归入"全部"
      chapterList.value = knowledgeItems.length > 0
        ? [{
            id: 0,
            name: '全部知识点',
            knowledgeList: knowledgeItems.map((k) => ({
              ...k,
              desc: `掌握度 ${k.masteryPercent}%  |  ${k.questionCount} 道相关题目`,
            })),
          }]
        : []
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

/**
 * 下拉刷新
 */
async function onRefresh() {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

/**
 * 跳转知识点详情
 */
function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/course/knowledge-detail?id=${id}&courseId=${courseId.value}&courseName=${encodeURIComponent(courseName.value)}`,
  })
}

function goBack() {
  uni.navigateBack()
}

onLoad((options: any) => {
  if (options.courseId) {
    courseId.value = Number(options.courseId)
  }
  if (options.courseName) {
    courseName.value = decodeURIComponent(options.courseName)
  }
  loadData()
})
</script>

<style scoped lang="scss">
page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: $bg-page;
}

.knowledge-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
}

/* 顶部标题栏 */
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

/* 滚动列表区 */
.page-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty-wrap {
  padding-top: 100rpx;
}

/* 章节卡片 */
.chapter-card {
  width: 100%;
  background: $bg-card;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: $shadow-card;
  box-sizing: border-box;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: linear-gradient(90deg, #f0f9eb 0%, $bg-card 100%);
  border-bottom: 1rpx solid $border;
}

.chapter-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-1;
  line-height: 1.3;
}

/* 知识点列表 */
.knowledge-list {
  padding: 0 24rpx;
}

.knowledge-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid $border;
}

.knowledge-item:last-child {
  border-bottom: none;
}

.knowledge-item:active {
  background: #fafbfc;
}

.item-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-right: 16rpx;
}

.knowledge-title {
  font-size: 28rpx;
  color: $text-1;
  font-weight: 500;
  line-height: 1.4;
}

.knowledge-desc {
  font-size: 22rpx;
  color: $text-3;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.item-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.mastery-badge {
  font-size: 22rpx;
  color: $primary;
  background: $primary-bg;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.bottom-space {
  height: 40rpx;
  width: 100%;
}
</style>
