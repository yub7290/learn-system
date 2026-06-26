<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="我的课程" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <!-- Tab导航 -->
    <view class="tabs-wrap">
      <u-tabs
        :list="tabList"
        :current="currentTab"
        @click="switchTab"
        :scrollable="false"
        activeColor="#0195ff"
        inactiveColor="#666"
        fontSize="15"
        bold
        barWidth="28"
        barHeight="3"
      ></u-tabs>
    </view>

    <!-- 课程列表 -->
    <scroll-view scroll-y class="list-scroll" show-scrollbar="false">
      <view class="course-list">
        <view
          v-for="item in showCourseList"
          :key="item.id"
          class="course-card"
          @click="goCourseDetail(item.id)"
        >
          <image class="course-cover" :src="item.coverUrl" mode="aspectFill" />
          <view class="course-info">
            <text class="course-name">{{ item.name }}</text>
            <text class="course-category">共{{ item.totalLessonCount || '-' }}课时</text>

            <!-- 学习进度 -->
            <view class="progress-row">
              <text class="progress-label">学习进度</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: item.progressPercent + '%' }"></view>
              </view>
              <text class="progress-num">{{ item.progressPercent }}%</text>
            </view>

            <!-- 最近学习 -->
            <text class="last-study" v-if="item.lastStudyTime">最近学习: {{ item.lastStudyTime }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <u-empty v-if="showCourseList.length === 0" text="暂无相关课程" mode="list" :marginTop="60"></u-empty>

      <view class="list-footer" v-if="showCourseList.length > 0">没有更多了</view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMyCourseList } from '../../api/mine'
import type { MyCourseItemVO } from '../../types/mine'

interface TabItem {
  name: string
  type: number
}

const tabList: TabItem[] = [
  { name: '我的课程', type: 1 },
  { name: '过期课程', type: 2 },
  { name: '试学课程', type: 3 },
]

const currentTab = ref(0)
const allCourseList = ref<MyCourseItemVO[]>([])

const showCourseList = computed(() => {
  const currentType = tabList[currentTab.value].type
  return allCourseList.value.filter((item: any) => (item as any).type === currentType)
})

onMounted(async () => {
  try {
    const res = await getMyCourseList({ page: 1, pageSize: 50 })
    allCourseList.value = res.list.map((item) => ({
      ...item,
      type: 1,
    }))
    if (res.list.length === 0) {
      loadMockData()
    }
  } catch (e) {
    loadMockData()
  }
})

function loadMockData() {
  allCourseList.value = [
    {
      id: 1,
      name: '高等数学基础精讲',
      coverUrl: 'https://picsum.photos/320/240?random=1',
      totalLessonCount: 48,
      learnedLessonCount: 36,
      progressPercent: 75,
      lastStudyTime: '2026-06-20 14:30',
      type: 1,
    } as any,
    {
      id: 2,
      name: '大学英语四级冲刺',
      coverUrl: 'https://picsum.photos/320/240?random=2',
      totalLessonCount: 36,
      learnedLessonCount: 16,
      progressPercent: 45,
      lastStudyTime: '2026-06-18 09:15',
      type: 1,
    } as any,
    {
      id: 3,
      name: '计算机网络原理',
      coverUrl: 'https://picsum.photos/320/240?random=3',
      totalLessonCount: 32,
      learnedLessonCount: 32,
      progressPercent: 100,
      lastStudyTime: '2026-05-30 16:00',
      type: 2,
    } as any,
    {
      id: 4,
      name: 'Python入门体验课',
      coverUrl: 'https://picsum.photos/320/240?random=4',
      totalLessonCount: 12,
      learnedLessonCount: 3,
      progressPercent: 20,
      lastStudyTime: '2026-06-22 11:00',
      type: 3,
    } as any,
  ]
}

function switchTab(index: number) {
  if (currentTab.value === index) return
  currentTab.value = index
}

function goCourseDetail(id: number) {
  uni.navigateTo({ url: `/pages/course/detail?id=${id}` }).catch(() => {})
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.tabs-wrap {
  background: $bg-card;
  padding-top: 44px;
}

.list-scroll {
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  display: flex;
  flex-direction: row;
  padding: 12px;
  background: $bg-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  gap: 12px;
}

.course-card:active {
  opacity: 0.85;
}

.course-cover {
  width: 110px;
  height: 82px;
  border-radius: 8px;
  flex-shrink: 0;
  background: $bg-page;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.course-name {
  font-size: 15px;
  font-weight: 500;
  color: $text-1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-category {
  font-size: 12px;
  color: $text-3;
}

.progress-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.progress-label {
  font-size: 11px;
  color: $text-2;
  width: 56px;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: $border;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $primary;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-num {
  font-size: 11px;
  color: $primary;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.last-study {
  font-size: 11px;
  color: $text-3;
}

.list-footer {
  padding: 20px 0;
  text-align: center;
  font-size: 12px;
  color: $text-3;
}

.bottom-space {
  height: 20px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
