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
import type { ExamVO } from '../../types/exam'

/**
 * 考试状态枚举
 * 0=未开始  1=进行中  2=已结束
 */
type ExamStatus = 0 | 1 | 2

interface TabItem {
  key: 'all' | ExamStatus
  name: string
}

const tabs: TabItem[] = [
  { key: 'all', name: '全部' },
  { key: 0, name: '未开始' },
  { key: 1, name: '进行中' },
  { key: 2, name: '已结束' },
]

const activeTab = ref<string | number>('all')
const examList = ref<ExamVO[]>([])
const loading = ref(false)

/**
 * Mock 考试状态映射（正式环境由后端返回）
 * 为演示效果，给部分考试设置不同状态
 */
const mockStatus: Record<number, ExamStatus> = {
  1: 0, // 未开始
  2: 1, // 进行中
  3: 0, // 未开始
  4: 1, // 进行中
  5: 2, // 已结束
  6: 2, // 已结束
}

/** 带状态的考试列表 */
const allList = computed<Array<ExamVO & { status: ExamStatus }>>(() =>
  examList.value.map((item) => ({
    ...item,
    status: mockStatus[item.id] ?? 0,
  }))
)

/** 根据当前 Tab 过滤 */
const filteredList = computed(() => {
  if (activeTab.value === 'all') return allList.value
  return allList.value.filter((item) => item.status === activeTab.value)
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
  // 预留加载更多; mock 数据暂不分页
}

function handleCardClick(item: ExamVO) {
  if (!requireLogin('登录后才能查看考试详情')) return
  uni.navigateTo({ url: `/pages/exam/exam-detail?id=${item.id}` })
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
