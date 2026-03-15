# 🚀 轻量级全栈论坛系统 (Lightweight Full-Stack Forum)

这是一个基于 **React + Node.js + SQLite** 构建的现代化、轻量级全栈论坛项目。
本项目采用“前后端同端口”架构，内置嵌入式 SQLite 数据库，**零配置开箱即用**，非常适合作为全栈开发学习、二次开发或个人作品集展示。

## ✨ 核心特性 (Features)

- **🔐 完整的用户认证**：基于 JWT (JSON Web Token) 的注册、登录与状态保持 (`AuthContext`)。
- **📝 核心论坛功能**：支持浏览帖子列表、发布新帖、用户交互。
- **⚡ 极速的开发体验**：前端采用 Vite 构建，支持毫秒级热更新。
- **📦 零配置数据库**：采用 `better-sqlite3` 嵌入式数据库。无需安装 MySQL/Redis，运行项目时自动生成 `forum.db` 数据库文件及表结构。
- **🛠️ 优雅的全栈架构**：前后端共用同一端口，彻底告别跨域 (CORS) 烦恼，部署极其简单。

## 💻 技术栈 (Tech Stack)

### 前端 (Frontend)
- **核心框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由与状态**: React Router / Context API
- **样式**: CSS / TailwindCSS (视具体配置)

### 后端 (Backend)
- **运行环境**: Node.js
- **Web 框架**: Express / 原生 HTTP
- **数据库**: SQLite3 (`better-sqlite3`)
- **安全认证**: JWT (`jsonwebtoken`)

## 🚀 快速开始 (Quick Start)

只需 3 步，即可在本地跑起整个全栈项目！

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd forum-backend
