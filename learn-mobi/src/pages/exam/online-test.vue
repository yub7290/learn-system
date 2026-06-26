<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar">
      <view class="nav-left">
        <view class="back" @click="goBack">
          <u-icon name="arrow-left" color="#333" size="20"></u-icon>
        </view>
        <text class="nav-title">在线测试</text>
      </view>
      <view class="nav-right">
        <view class="search-box">
          <u-icon name="search" color="#999" size="16"></u-icon>
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            placeholder="请输入检索字符"
            placeholder-style="color: #bbb; font-size: 12px;"
            @confirm="handleSearch"
          />
        </view>
        <view class="search-btn" @click="handleSearch">搜索</view>
      </view>
    </view>

    <!-- 考试卡片列表 -->
    <scroll-view class="list-wrap" scroll-y @scrolltolower="onLoadMore">
      <view class="list-inner">
        <ExamCard
          v-for="(item, i) in examList"
          :key="item.id"
          :item="item"
          :index="i + 1"
          @click="handleCardClick"
        />
        <view v-if="loading" class="loading-tip">加载中...</view>
        <view v-if="loadingMore" class="loading-tip">加载更多...</view>
        <u-empty v-if="!loading && examList.length === 0" text="暂无考试" mode="list" margin-top="40"></u-empty>
        <view v-if="!loading && !loadingMore && examList.length > 0 && !hasMore" class="loading-tip">没有更多了</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getExamList } from '../../api/exam'
import ExamCard from '../../components/ExamCard.vue'
import type { ExamVO } from '../../types/exam'

const courseId = ref(0)
const keyword = ref('')
const examList = ref<ExamVO[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = computed(() => examList.value.length < total.value)

onLoad((q: any) => {
  courseId.value = Number(q.courseId) || 0
  loadList()
})

async function loadList() {
  pageNum.value = 1
  loading.value = true
  try {
    const res = await getExamList({
      courseId: courseId.value || undefined,
      keyword: keyword.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    examList.value = res.list
    total.value = res.total
  } catch (e) {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  loadList()
}

async function onLoadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  pageNum.value++
  try {
    const res = await getExamList({
      courseId: courseId.value || undefined,
      keyword: keyword.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    examList.value = examList.value.concat(res.list)
    total.value = res.total
  } catch {
    pageNum.value--
    uni.showToast({ title: '加载更多失败', icon: 'none' })
  } finally {
    loadingMore.value = false
  }
}

function handleCardClick(item: ExamVO) {
  uni.navigateTo({ url: `/pages/exam/exam-detail?id=${item.id}` })
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' }))
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.navbar {
  background: $bg-card;
  padding: 12px 14px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));
}

.nav-left {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 20px;
  padding: 0 12px;
  height: 34px;
}

.search-input {
  flex: 1;
  margin-left: 6px;
  font-size: 12px;
  color: $text-1;
  height: 100%;
}

.search-btn {
  font-size: 13px;
  color: $bg-card;
  background: $gradient-primary;
  padding: 6px 16px;
  border-radius: 17px;
  flex-shrink: 0;
  font-weight: 500;
}

/* 卡片列表 */
.list-wrap {
  flex: 1;
  overflow-y: auto;
}

.list-inner {
  padding: 12px 14px;
  padding-bottom: 40px;
}

.loading-tip {
  text-align: center;
  color: $text-3;
  font-size: 12px;
  padding: 16px 0;
}
</style>
