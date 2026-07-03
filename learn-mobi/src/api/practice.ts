import { http } from './request'
import type {
  PracticeOverviewVO,
  ChapterTreeNodeVO,
  PracticeQuestionVO,
  PracticeQuestionSimpleVO,
  NoteVO,
  FavoriteToggleVO,
  PracticeSessionVO,
  AnswerSheetItemVO,
  ReciteModeConfigVO,
  CoursePracticeOverviewVO
} from '../types/practice'

/** 获取练习概览 */
export function getPracticeOverview(courseId: number): Promise<PracticeOverviewVO> {
  return http.get<PracticeOverviewVO>('/student/practice/overview', { courseId })
}

/** 获取章节树 */
export function getChapterTree(courseId: number): Promise<ChapterTreeNodeVO[]> {
  return http.get<ChapterTreeNodeVO[]>('/student/practice/chapter-tree', { courseId })
}

/** 获取练习题目列表 */
export function getPracticeQuestions(
  courseId: number,
  chapterId?: number,
  practiceMode: number = 1
): Promise<PracticeQuestionVO[]> {
  return http.get<PracticeQuestionVO[]>('/student/practice/questions', {
    courseId,
    chapterId,
    practiceMode
  })
}

/** 提交答案 */
export function submitAnswer(data: {
  courseId: number
  chapterId: number
  questionId: number
  userAnswer: string
  isCorrect: number
  answerDuration: number
  practiceMode: number
  sourceRecordId?: number
}): Promise<void> {
  return http.post<void>('/student/practice/answer', data)
}

/** 继续练习 */
export function continuePractice(data: {
  courseId: number
  practiceMode: number
  chapterId?: number
}): Promise<PracticeSessionVO> {
  return http.post<PracticeSessionVO>('/student/practice/continue', data)
}

/** 错题列表 */
export function getWrongQuestions(courseId: number): Promise<PracticeQuestionSimpleVO[]> {
  return http.get<PracticeQuestionSimpleVO[]>('/student/practice/wrong-questions', { courseId })
}

/** 收藏列表 */
export function getFavorites(courseId: number): Promise<PracticeQuestionSimpleVO[]> {
  return http.get<PracticeQuestionSimpleVO[]>('/student/practice/favorites', { courseId })
}

/** 切换收藏 */
export function toggleFavorite(data: {
  courseId: number
  questionId: number
}): Promise<FavoriteToggleVO> {
  return http.post<FavoriteToggleVO>('/student/practice/favorites/toggle', data)
}

/** 笔记列表 */
export function getNotes(courseId: number): Promise<NoteVO[]> {
  return http.get<NoteVO[]>('/student/practice/notes', { courseId })
}

/** 创建笔记 */
export function createNote(data: {
  courseId: number
  questionId: number
  noteContent: string
}): Promise<NoteVO> {
  return http.post<NoteVO>('/student/practice/notes', data)
}

/** 删除笔记 */
export function deleteNote(noteId: number): Promise<void> {
  return http.delete<void>('/student/practice/notes/' + noteId)
}

/** 更新笔记 */
export function updateNote(noteId: number, noteContent: string): Promise<void> {
  return http.put<void>('/student/practice/notes/' + noteId, { noteContent })
}

/** 查询用户在某题目下的笔记 */
export function getNoteForQuestion(questionId: number): Promise<NoteVO[]> {
  return http.get<NoteVO[]>('/student/practice/notes/question/' + questionId)
}

/** 高频错题 */
export function getHighFreqWrong(courseId: number): Promise<PracticeQuestionSimpleVO[]> {
  return http.get<PracticeQuestionSimpleVO[]>('/student/practice/high-freq-wrong', { courseId })
}

/**
 * 获取答题卡（Mock 实现）
 * @param courseId 课程ID
 * @returns 答题卡数据
 */
export function getAnswerSheet(courseId: number): Promise<AnswerSheetItemVO[]> {
  return Promise.resolve([])
}

/**
 * 标记答题卡题目（Mock 实现）
 * @param questionId 题目ID
 * @param marked 是否标记
 * @returns 标记结果
 */
export function markAnswerSheetQuestion(questionId: number, marked: boolean): Promise<{ questionId: number; marked: boolean }> {
  return Promise.resolve({ questionId, marked })
}

/**
 * 获取背题模式配置（Mock 实现）
 * @returns 背题模式配置
 */
export function getReciteModeConfig(): Promise<ReciteModeConfigVO> {
  return Promise.resolve({ autoShowAnswer: true, autoPlayAnalysis: false })
}

/**
 * 切换背题模式自动显示答案（Mock 实现）
 * @param autoShowAnswer 是否自动显示答案
 * @returns 更新后的配置
 */
export function toggleReciteAutoShowAnswer(autoShowAnswer: boolean): Promise<ReciteModeConfigVO> {
  return Promise.resolve({ autoShowAnswer, autoPlayAnalysis: false })
}

/** 获取所有课程的练习概览 */
export function getAllCoursesPracticeOverview(): Promise<CoursePracticeOverviewVO[]> {
  return http.get<CoursePracticeOverviewVO[]>('/student/practice/all-courses-overview')
}
