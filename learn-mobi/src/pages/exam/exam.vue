<template>
  <view class="exam-page">
    <!-- 顶部标题栏 -->
    <view class="topbar"><text class="title">考试</text></view>

    <!-- 状态分类标签 -->
    <view class="status-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <!-- 考试列表 -->
    <scroll-view scroll-y class="list-wrap" @scrolltolower="onLoadMore">
      <view class="list-inner">
        <ExamCard
          v-for="(item, i) in filteredList"
          :key="item.id"
          :item="item"
          :index="allList.indexOf(item) + 1"
          @click="handleCardClick"
        />
        <view v-if="loading" class="loading-tip">加载中...</view>
        <u-empty
          v-if="!loading && filteredList.length === 0"
          text="暂无考试"
          mode="list"
          margin-top="40"
        ></u-empty>
      </view>
    </scroll-view>

    <TabBar :current="3"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import ExamCard from '../../components/ExamCard.vue'
import { getExamList } from '../../api/exam'
import { requireLogin } from '../../utils/auth'
import { examDetailUrl } from '../../utils/exam-route'
import type { ExamVO } from '../../types/exam'

/**
 * 考试状态枚举
 * 当前学员的作答状态：0=未作答  1=进行中  2=已完成
 */
type ExamStatus = 0 | 1 | 2

interface TabItem {
  key: 'all' | ExamStatus
  name: string
}

const tabs: TabItem[] = [
  { key: 'all', name: '全部' },
  { key: 0, name: '未作答' },
  { key: 1, name: '进行中' },
  { key: 2, name: '已完成' },
]

const activeTab = ref<string | number>('all')
const examList = ref<ExamVO[]>([])
const loading = ref(false)

const allList = computed(() => examList.value)

/** 根据当前 Tab 过滤 */
const filteredList = computed(() => {
  if (activeTab.value === 'all') return allList.value
  return allList.value.filter((item) => item.attemptStatus === activeTab.value)
})

/** 切换 Tab */
function switchTab(key: string | number) {
  activeTab.value = key
}

async function loadList() {
  loading.value = true
  try {
    const res = await getExamList()
    examList.value = res.list
  } catch {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onLoadMore() {
  // 列表分页由后续加载更多处理。
}

function handleCardClick(item: ExamVO) {
  if (!requireLogin('登录后才能查看考试详情')) return
  uni.navigateTo({ url: examDetailUrl(item) })
}

onShow(loadList)
</script>

<style scoped lang="scss">
.exam-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

/* ===== 顶部标题栏 ===== */
.topbar {
  background: $bg-card;
  padding: 12px 14px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));

  .title {
    font-size: 17px;
    font-weight: 700;
    color: $text-1;
  }
}

/* ===== 状态分类标签 ===== */
.status-tabs {
  background: $bg-card;
  display: flex;
  flex-direction: row;
  padding: 0 14px 10px;
  gap: 8px;
  border-bottom: 1px solid $border;
}

.status-tab {
  flex: 1;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  font-size: 13px;
  color: $text-3;
  background: $bg-page;
  transition: all 0.2s;
  font-weight: 500;

  &.active {
    background: $primary;
    color: #fff;
  }
}

/* ===== 列表区域 ===== */
.list-wrap {
  flex: 1;
  overflow-y: auto;
}

.list-inner {
  padding: 12px 14px 100px;
}

.loading-tip {
  text-align: center;
  color: $text-3;
  font-size: 12px;
  padding: 16px 0;
}
</style>
