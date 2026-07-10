import { request } from '../../../api/request'
import { getAccessToken } from '../../../utils/auth'
import { BASE_URL } from '../../../env'

export default {
  data() {
    return {
      courseId: 0,
      conversationId: null,
      messages: [],
      inputText: '',
      isSending: false,
      isAiThinking: false,
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      page: 1,
      scrollAnchor: '',
      keyboardHeight: 0,
      // 媒体相关
      selectedMedia: null,
      selectedMediaType: null,
      selectedMediaPreview: null,
      selectedMediaBase64: null,
      // 流式相关
      _streamAbort: null
    }
  },
  computed: {
    canSend() {
      return (this.inputText.trim().length > 0 || this.selectedMedia) && !this.isSending && !this.isAiThinking
    }
  },
  onLoad(option) {
    this.courseId = Number(option.cid) || 0
    if (!this.courseId) {
      uni.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => { uni.navigateBack() }, 1500)
      return
    }
    this.loadHistory()
    this.initKeyboardListener()
  },
  onUnload() {
    this.removeKeyboardListener()
    // 取消未完成的流式请求
    if (this._streamAbort) {
      this._streamAbort.abort()
      this._streamAbort = null
    }
  },
  methods: {
    // 返回
    goBack() {
      uni.navigateBack()
    },

    // 初始化键盘监听
    initKeyboardListener() {
      // #ifdef H5
      if (typeof uni.onKeyboardHeightChange === 'function') {
        uni.onKeyboardHeightChange(this.handleKeyboardHeight)
      }
      // #endif
    },

    // 移除键盘监听
    removeKeyboardListener() {
      // #ifdef H5
      if (typeof uni.offKeyboardHeightChange === 'function') {
        uni.offKeyboardHeightChange(this.handleKeyboardHeight)
      }
      // #endif
    },

    // 键盘高度变化
    handleKeyboardHeight(res) {
      this.keyboardHeight = res.height || 0
      if (this.keyboardHeight > 0) {
        this.scrollToBottom()
      }
    },

    // 输入框获取焦点
    onInputFocus() {
      setTimeout(() => { this.scrollToBottom() }, 300)
    },

    // 输入框失去焦点
    onInputBlur() {
      // 可选：收起键盘后重置
    },

    // 选择媒体文件
    chooseMedia() {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择图片', '录制视频', '从相册选择视频'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0: // 拍照
              this.captureImage()
              break
            case 1: // 从相册选择图片
              this.chooseImage()
              break
            case 2: // 录制视频
              this.captureVideo()
              break
            case 3: // 从相册选择视频
              this.chooseVideo()
              break
          }
        }
      })
    },

    // 拍照
    captureImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.processMedia(res.tempFiles[0], 'image')
        }
      })
    },

    // 从相册选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.processMedia(res.tempFiles[0], 'image')
        }
      })
    },

    // 录制视频
    captureVideo() {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: 60,
        success: (res) => {
          this.processMedia({ path: res.tempFilePath }, 'video')
        }
      })
    },

    // 从相册选择视频
    chooseVideo() {
      uni.chooseVideo({
        sourceType: ['album'],
        maxDuration: 60,
        success: (res) => {
          this.processMedia({ path: res.tempFilePath }, 'video')
        }
      })
    },

    // 处理媒体文件
    processMedia(file, mediaType) {
      this.selectedMedia = file.path || file
      this.selectedMediaType = mediaType
      this.selectedMediaPreview = file.path || file

      // 读取文件为Base64
      uni.getFileSystemManager().readFile({
        filePath: file.path || file,
        encoding: 'base64',
        success: (res) => {
          this.selectedMediaBase64 = res.data
        },
        fail: (err) => {
          console.error('读取文件失败', err)
          uni.showToast({ title: '文件读取失败', icon: 'none' })
        }
      })
    },

    // 移除选中的媒体
    removeMedia() {
      this.selectedMedia = null
      this.selectedMediaType = null
      this.selectedMediaPreview = null
      this.selectedMediaBase64 = null
    },

    // 预览图片
    previewImage(url) {
      uni.previewImage({
        urls: [url],
        current: url
      })
    },

    // 加载历史消息
    async loadHistory() {
      if (this.isLoading) return
      this.isLoading = true

      try {
        const list = await request({
          url: '/student/ai/history',
          method: 'GET',
          data: {
            courseId: this.courseId,
            limit: 50
          }
        })

        this.messages = (list || []).reverse()
        this.scrollToBottom()
      } catch (e) {
        console.error('加载历史消息失败', e)
      } finally {
        this.isLoading = false
      }
    },

    // 加载更多历史消息
    async loadMore() {
      if (this.isLoadingMore || !this.hasMore || this.messages.length === 0) return
      this.isLoadingMore = true
      this.page++

      try {
        const list = await request({
          url: '/student/ai/history',
          method: 'GET',
          data: {
            courseId: this.courseId,
            chatId: this.conversationId,
            limit: 50,
            page: this.page
          }
        })

        const arr = list || []
        if (arr.length < 50) {
          this.hasMore = false
        }
        this.messages = [...arr.reverse(), ...this.messages]
      } catch (e) {
        console.error('加载更多消息失败', e)
        this.page--
      } finally {
        this.isLoadingMore = false
      }
    },

    // 发送快捷问题
    sendQuickQuestion(question) {
      this.inputText = question
      this.sendMessage()
    },

    // 发送消息（流式）
    async sendMessage() {
      if (!this.canSend) return

      const text = this.inputText.trim()
      this.inputText = ''
      this.isSending = true

      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: text,
        mediaType: this.selectedMediaType,
        mediaUrl: this.selectedMediaPreview,
        createTime: new Date().toISOString()
      }
      this.messages.push(userMsg)
      this.scrollToBottom()

      // 清除选中的媒体
      const mediaType = this.selectedMediaType
      const mediaBase64 = this.selectedMediaBase64
      this.removeMedia()

      // 添加AI消息占位
      const aiMsgIndex = this.messages.length
      this.messages.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        createTime: new Date().toISOString(),
        isStreaming: true
      })
      this.isAiThinking = true
      this.scrollToBottom()

      // 创建 AbortController 用于取消请求
      const controller = new AbortController()
      this._streamAbort = controller

      try {
        const token = getAccessToken()
        const response = await fetch(`${BASE_URL}/student/ai/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: this.courseId,
            chatId: this.conversationId,
            message: text,
            mediaType: mediaType,
            mediaBase64: mediaBase64
          }),
          signal: controller.signal
        })

        // 检查 HTTP 状态码
        if (!response.ok) {
          if (response.status === 401) {
            this.messages[aiMsgIndex].content = '登录已过期，请重新登录'
          } else {
            this.messages[aiMsgIndex].content = `服务异常(${response.status})，请重试`
          }
          this.messages[aiMsgIndex].isStreaming = false
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ''
        let streamDone = false
        let pendingText = ''
        let rafId = null

        // 节流更新函数
        const flushText = () => {
          if (pendingText) {
            this.messages[aiMsgIndex].content += pendingText
            pendingText = ''
            this.scrollToBottom()
          }
          rafId = null
        }

        while (!streamDone) {
          const { done, value } = await reader.read()
          if (done) break

          // 使用流式模式解码，避免中文乱码
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n')
          buffer = parts.pop() // 保留可能不完整的最后一行

          for (const line of parts) {
            const trimmed = line.trim()
            if (trimmed.startsWith('event:conversationId')) {
              // 会话ID事件，下一行是数据
              continue
            }
            if (trimmed.startsWith('data:')) {
              const data = trimmed.substring(5).trim()
              if (data === '[DONE]') {
                this.messages[aiMsgIndex].isStreaming = false
                streamDone = true
                break
              }
              // 逐字追加（使用节流）
              pendingText += data
              if (!rafId) {
                rafId = requestAnimationFrame(flushText)
              }
            }
            if (trimmed.startsWith('event:token')) {
              // token 事件，下一行是数据
              continue
            }
            if (trimmed.startsWith('event:error')) {
              // 错误事件
              continue
            }
            if (trimmed.startsWith('event:done')) {
              this.messages[aiMsgIndex].isStreaming = false
              streamDone = true
              break
            }
          }
        }

        // 刷新剩余文本
        if (rafId) {
          cancelAnimationFrame(rafId)
        }
        flushText()

      } catch (e) {
        if (e.name === 'AbortError') {
          console.log('Stream aborted')
        } else {
          console.error('流式请求失败', e)
          this.messages[aiMsgIndex].content = '网络异常，请重试'
        }
        this.messages[aiMsgIndex].isStreaming = false
      } finally {
        this._streamAbort = null
        this.isAiThinking = false
        this.isSending = false
        this.scrollToBottom()
      }
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollAnchor = 'msg-bottom'
      })
    }
  }
}
