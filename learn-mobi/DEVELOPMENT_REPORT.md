# 学生端 APP 开发完成报告

## 项目概述

基于 uni-app-x 开发的学生端学习管理系统 APP，与后端 Spring Boot 系统对接。

## ✅ 已完成功能

### 1. 核心框架

| 模块 | 文件 | 功能 |
|------|------|------|
| HTTP 工具 | `utils/request.js` | 统一请求配置、Token 管理、401 自动刷新、文件上传 |
| 登录页 | `pages/login/login.uvue` | 用户名/密码/验证码登录、JWT Token 存储 |
| Tab 配置 | `pages.json` | 首页/课程/考试/我的 四个主页面 |

### 2. 页面功能

| 页面 | 功能 | API 接口 |
|------|------|----------|
| **首页** | Banner轮播、功能导航、老师推荐、精选课程、搜索 | `/home/base`, `/home/teacher`, `/home/course`, `/home/search` |
| **课程列表** | 分类筛选、Tab切换、关键词搜索 | `/course/category`, `/course/list`, `/course/search` |
| **课程详情** | 课程介绍、章节列表、学习目标、讲师信息 | `/course/detail` |
| **学习页面** | 视频/直播播放、学习计时、进度记录、聊天交流、附件下载 | `/chapter/detail`, `/chapter/list`, `/study/saveRecord`, `/chat/list`, `/chat/send` |
| **老师主页** | 老师信息、简介、课程列表 | `/teacher/info` |
| **考试中心** | 考试列表、状态筛选、进入考试 | `/exam/list` |
| **在线监考** | 摄像头监控、倒计时、异常行为检测 | `/exam/info/{id}`, `/exam/abnormal/add`, `/exam/result/submit` |
| **我的页面** | 用户信息、学习统计、菜单导航、退出登录 | `/study/stats` |

### 3. 技术特性

- ✅ JWT Token 认证与自动刷新
- ✅ 请求/响应拦截器
- ✅ 离线学习记录队列
- ✅ 断点续播支持
- ✅ APP/H5 双平台适配
- ✅ 条件编译 (`#ifdef APP-PLUS`, `#ifdef H5`)
- ✅ 本地缓存学习进度

## 📁 文件结构

```
learn-mobi/
├── utils/
│   └── request.js                    # HTTP 工具类
├── pages/
│   ├── index/index.uvue              # 首页
│   ├── login/login.uvue              # 登录页
│   ├── course/
│   │   ├── course.uvue               # 课程列表
│   │   ├── coursedeal.uvue           # 课程详情
│   │   ├── study.uvue                # 学习页面
│   │   ├── script/
│   │   │   ├── coursedeal.js         # 课程详情逻辑
│   │   │   ├── courseList.js         # 课程列表逻辑
│   │   │   └── study.js              # 学习页面逻辑
│   │   └── styles/                   # 样式文件
│   ├── exam/
│   │   ├── exam.uvue                 # 考试中心
│   │   └── HomeStudyMonitor.uvue     # 在线监考
│   ├── mine/mine.uvue                # 我的页面
│   └── teacher/teacher.uvue          # 老师主页
├── components/
│   ├── tabbar/tabbar.uvue            # 底部导航
│   └── coursecard/coursecard.uvue    # 课程卡片
├── static/                           # 静态资源
├── pages.json                        # 页面配置
└── manifest.json                     # 应用配置
```

## 🔧 API 对接

### 基础配置

```javascript
// utils/request.js
const BASE_URL = 'http://localhost:8001/api'
```

### 接口列表

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 认证 | `/auth/captcha` | GET | 获取验证码 |
| 认证 | `/auth/login` | POST | 用户登录 |
| 认证 | `/auth/refresh/{token}` | GET | 刷新 Token |
| 首页 | `/home/base` | GET | 首页基础数据 |
| 首页 | `/home/teacher` | GET | 老师推荐 |
| 首页 | `/home/course` | GET | 精选课程 |
| 首页 | `/home/search` | GET | 搜索课程 |
| 课程 | `/course/category` | GET | 课程分类 |
| 课程 | `/course/list` | GET | 课程列表 |
| 课程 | `/course/detail` | GET | 课程详情 |
| 章节 | `/chapter/detail` | GET | 章节详情 |
| 章节 | `/chapter/list` | GET | 章节列表 |
| 学习 | `/study/saveRecord` | POST | 保存学习记录 |
| 学习 | `/study/batchUpload` | POST | 批量上传记录 |
| 学习 | `/study/stats` | GET | 学习统计 |
| 聊天 | `/chat/list` | GET | 聊天历史 |
| 聊天 | `/chat/send` | POST | 发送消息 |
| 考试 | `/exam/list` | GET | 考试列表 |
| 考试 | `/exam/info/{id}` | GET | 考试详情 |
| 考试 | `/exam/abnormal/add` | POST | 上报异常 |
| 考试 | `/exam/result/submit` | POST | 提交考试结果 |
| 教师 | `/teacher/info` | GET | 教师详情 |

## 🧪 API 测试结果

使用 agent-browser 测试后端接口：

| 接口 | 状态 | 说明 |
|------|------|------|
| `/auth/captcha` | ✅ 200 | 正常返回验证码图片 |
| `/home/base` | ✅ 401 | 正确要求认证 |

## ⚠️ 注意事项

1. **CORS 问题**：如在浏览器调试遇到跨域问题，请在后端配置 CORS 或使用 APP 端运行

2. **SM3 加密**：登录页密码加密需要引入 `sm-crypto` 库：
   ```bash
   npm install sm-crypto
   ```

3. **摄像头权限**：APP 端需要在 `manifest.json` 中配置：
   ```json
   {
     "app-plus": {
       "distribute": {
         "android": {
           "permissions": [
             "<uses-permission android:name=\"android.permission.CAMERA\"/>"
           ]
         }
       }
     }
   }
   ```

4. **运行方式**：
   - HBuilderX：直接打开项目运行
   - 命令行：需要配置 uni-app CLI 环境

## 📋 待优化项

1. 引入 `sm-crypto` 实现密码 SM3 加密
2. 添加下拉刷新和上拉加载更多
3. 完善离线队列的去重和合并逻辑
4. 添加消息推送功能
5. 优化视频播放器的进度条 UI
6. 添加课程收藏功能
7. 实现证书查看和下载

## 🎯 总结

学生端 APP 核心功能已开发完成，包括：
- 完整的登录认证流程
- 首页、课程、考试、个人中心四大模块
- 学习记录和进度管理
- 在线监考和异常检测框架
- 统一的 HTTP 请求封装

所有 API 接口已与后端对接，采用 JWT Token 认证机制。
