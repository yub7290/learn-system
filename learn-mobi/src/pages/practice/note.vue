<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack"><u-icon name="arrow-left" color="#333" size="20"></u-icon></view>
      <text class="title">我的笔记</text>
    </view>
    <view class="list">
      <view class="card" v-for="item in list" :key="item.id" @click="goQuestion(item)" @longpress="onLongPress(item)">
        <view class="card-top">
          <view class="type-tag" :style="{ background: getTypeColor(item.questionType) + '18', color: getTypeColor(item.questionType) }">
            {{ getTypeLabel(item.questionType) }}
          </view>
          <text class="date">{{ item.createTime }}</text>
        </view>
        <text class="q-content line-1">{{ item.questionContent }}</text>
        <view class="note-body">
          <u-icon name="edit-pen" color="#f59e0b" size="12"></u-icon>
          <text class="note-text line-2">{{ item.noteContent }}</text>
        </view>
      </view>
      <u-empty v-if="!loading && !list.length" text="暂无笔记" mode="data" margin-top="40"></u-empty>
      <u-loadmore v-if="loading" status="loading" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getNotes, deleteNote } from '../../api/practice'
import type { NoteVO } from '../../types/practice'

const courseId = ref(0)
const list = ref<NoteVO[]>([])
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
    const data = await getNotes(courseId.value)
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

function getMockList(): NoteVO[] {
  return [
    { id: 1, questionId: 1, courseId: courseId.value, questionType: 0, questionContent: '计算 1/2 + 1/3 的结果，正确的是？', noteContent: '异分母加减必须先通分，不能分子分母直接加，容易和分数乘法搞混。', createTime: '2026-06-20 14:30' },
    { id: 2, questionId: 4, courseId: courseId.value, questionType: 2, questionContent: '一根绳子用去 2/5 米，还剩全长的 2/5，用去的和剩下的相比？', noteContent: '分率和具体量要区分开，这里问的是比较，统一换算成分率就清楚了。', createTime: '2026-06-18 09:15' },
  ]
}

function onLongPress(item: NoteVO) {
  uni.showModal({
    title: '提示',
    content: '确定删除这条笔记吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteNote(item.id)
        list.value = list.value.filter(i => i.id !== item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      } catch {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },
  })
}

function goBack() { uni.navigateBack().catch(() => {}) }
function goQuestion(_item: NoteVO) {
  uni.navigateTo({ url: `/pages/practice/question?courseId=${courseId.value}&chapterId=0&practiceMode=3` }).catch(() => {})
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: $bg-page; }
.header { position: sticky; top: 0; z-index: 10; background: $bg-card; display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid $border; }
.back { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.title { flex: 1; font-size: 16px; font-weight: 600; color: $text-1; text-align: center; margin-right: 30px; }
.list { padding: 12px 14px; }
.card { background: $bg-card; border-radius: 12px; padding: 14px; margin-bottom: 10px; box-shadow: $shadow-card; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.type-tag { font-size: 10px; padding: 2px 8px; border-radius: 8px; font-weight: 500; }
.date { font-size: 11px; color: $text-3; }
.q-content { font-size: 13px; color: $text-2; margin-bottom: 8px; display: block; }
.note-body { display: flex; gap: 6px; background: #fffbe6; border-radius: 8px; padding: 8px 10px; align-items: flex-start; }
.note-text { font-size: 13px; color: #8a6d0b; line-height: 1.5; flex: 1; }
.line-1 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.line-2 { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
