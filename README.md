# 在线学习系统（learn-system）

> 面向教育培训场景的在线学习平台，包含 Web 端与移动端，支持课程学习与文件资源管理，文件存储基于七牛云。

## 项目简介
learn-system 是一套在线学习系统，后端采用 Spring Boot + MyBatis，集成 Redis 缓存与七牛云对象存储，支撑课程资料的上传与分发；同时提供移动端（learn-mobi）以适配多端学习场景。

## 技术栈
- 后端：Java + Spring Boot + MyBatis + PageHelper
- 缓存：Redis（Redisson）
- 存储：七牛云对象存储（qiniu-java-sdk）
- 数据库：MySQL
- 移动端：learn-mobi
- 构建：Maven（多模块）

## 功能特性
- 课程学习与章节管理
- 学习资料上传 / 分发（七牛云）
- 移动端适配（learn-mobi）
- 缓存加速与分页查询

## 项目结构
```
learn-system/
├── learn-mobi/     # 移动端工程
├── docs/           # 文档
├── uploads/        # 上传资源（本地或对象存储）
├── deploy/         # 部署脚本
└── (业务模块按 Maven 多模块组织)
```

## 快速开始
### 环境要求
- JDK 8/17
- MySQL 8.x
- Redis
- 七牛云账号（对象存储）

### 安装与运行
```bash
mvn clean install
# 运行各业务模块（Spring Boot 方式）
```
前端/移动端工程见 `learn-mobi` 与对应前端目录。
