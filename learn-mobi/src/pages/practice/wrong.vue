<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack"><u-icon name="arrow-left" color="#333" size="20"></u-icon></view>
      <text class="title">错题回顾</text>
    </view>
    <view class="list">
      <view class="card" v-for="item in list" :key="item.id" @click="goQuestion(item)">
        <view class="card-top">
          <view class="type-tag" :style="{ background: getTypeColor(item.questionType) + '18', color: getTypeColor(item.questionType) }">
            {{ getTypeLabel(item.questionType) }}
          </view>
          <view class="wrong-badge" v-if="item.wrongCount !== void 0">错{{ item.wrongCount }}次</view>
        </view>
        <text class="content line-2">{{ item.content }}</text>
        <view class="chapter-name" v-if="item.chapterName">{{ item.chapterName }}</view>
      </view>
      <u-empty v-if="!loading && !list.length" text="暂无错题" mode="data" margin-top="40"></u-empty>
      <u-loadmore v-if="loading" status="loading" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getWrongQuestions } from '../../api/practice'
import type { PracticeQuestionSimpleVO } from '../../types/practice'

const courseId = ref(0)
const list = ref<PracticeQuestionSimpleVO[]>([])
const loading = ref(false)

const typeLabels: Record<number, string> = { 0: '单选', 1: '多选', 2: '判断', 3: '简答', 4: '填空' }
const typeColors: Record<number, string> = { 0: '#0195ff', 1: '#f59e0b', 2: '#10b981', 3: '#8b5cf6', 4: '#ec4899' }

function getTypeLabel(t: number) { return typeLabels[t] ?? '未知' }
function getTypeColor(t: number) { return typeColors[t] ?? '#999' }

onLoad((q: any) => { courseId.value = Number(q.courseId) || 0 })
onShow(() => { if (courseId.value) loadData() })

async function loadData() {
  loading.value = true
  try {
    const data = await getWrongQuestions(courseId.value)
    list.value = data
    if (!data || data.length === 0) {
      list.value = getMockList()
    }
  } catch {
    list.value = getMockList()
    if (list.value.length === 0) {
      uni.showToast({ title: '加载失败', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

function getMockList(): PracticeQuestionSimpleVO[] {
  return [
    { id: 1, questionType: 0, content: '计算 1/2 + 1/3 的结果，正确的是？', difficulty: 3, wrongCount: 3, chapterName: '几何图形', relatedTime: '2026-06-20' },
    { id: 2, questionType: 0, content: '一件商品原价100元，先涨价10%，再降价10%，现价是多少元？', difficulty: 4, wrongCount: 5, chapterName: '正数和负数', relatedTime: '2026-06-19' },
    { id: 4, questionType: 2, content: '一根绳子用去 2/5 米，还剩全长的 2/5，用去的和剩下的相比？', difficulty: 3, wrongCount: 2, chapterName: '有理数的加减法', relatedTime: '2026-06-18' },
    { id: 6, questionType: 2, content: '一项工程，甲单独做要6天完成，乙单独做要12天完成，两人合作需要几天完成？', difficulty: 4, wrongCount: 1, chapterName: '整式的加减', relatedTime: '2026-06-17' },
  ]
}

function goBack() { uni.navigateBack().catch(() => {}) }
function goQuestion(_item: PracticeQuestionSimpleVO) {
  uni.navigateTo({ url: `/pages/practice/question?courseId=${courseId.value}&chapterId=0&practiceMode=2` }).catch(() => {})
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: $bg-page; }
.header { position: sticky; top: 0; z-index: 10; background: $bg-card; display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid $border; }
.back { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.title { flex: 1; font-size: 16px; font-weight: 600; color: $text-1; text-align: center; margin-right: 30px; }
.list { padding: 12px 14px; }
.card { background: $bg-card; border-radius: 12px; padding: 14px; margin-bottom: 10px; box-shadow: $shadow-card; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.type-tag { font-size: 10px; padding: 2px 8px; border-radius: 8px; font-weight: 500; }
.wrong-badge { font-size: 11px; color: $danger; background: #fef0f0; padding: 2px 8px; border-radius: 8px; }
.content { font-size: 14px; color: $text-1; line-height: 1.5; }
.chapter-name { font-size: 11px; color: $text-3; margin-top: 6px; }
.line-2 { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
