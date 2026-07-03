<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="我的课程" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <!-- 课程列表 -->
    <scroll-view scroll-y class="list-scroll" show-scrollbar="false">
      <view class="course-list">
        <view
          v-for="item in courseList"
          :key="item.id"
          class="course-card"
          @click="goCourseDetail(item.id)"
        >
          <image class="course-cover" :src="item.coverUrl" mode="aspectFill" />
          <view class="course-info">
            <text class="course-name">{{ item.name }}</text>
            <text class="course-category">共{{ item.totalLessonCount}}课时</text>

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
      <u-empty v-if="courseList.length === 0 && !loading" text="暂无课程" mode="list" :marginTop="60"></u-empty>

      <!-- 加载中 -->
      <view class="loading-tip" v-if="loading">加载中...</view>

      <view class="list-footer" v-if="courseList.length > 0">没有更多了</view>
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyCourseList } from '../../api/mine'
import type { MyCourseItemVO } from '../../types/mine'

const courseList = ref<MyCourseItemVO[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getMyCourseList({ page: 1, pageSize: 50 })
    courseList.value = res.list
  } catch (e) {
    console.error('获取我的课程失败', e)
  } finally {
    loading.value = false
  }
})

function goCourseDetail(id: number) {
  uni.navigateTo({ url: `/pages/course/detail?cid=${id}` }).catch(() => {})
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

.list-scroll {
  width: 100%;
  padding: 56px 14px 0;
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

.loading-tip {
  padding: 30px 0;
  text-align: center;
  font-size: 14px;
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
