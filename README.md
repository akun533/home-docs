# Home Docs - 前后端分离博客系统

一个基于 VuePress 和 Express 的全栈博客系统，前后端完全分离架构。

## 📁 项目结构

```
home-docs/
├── frontend/          # 前端模块 (VuePress)
│   ├── docs/         # 文档源码
│   ├── .env.development
│   ├── .env.production
│   └── package.json
├── server/           # 后端模块 (Express)
│   ├── db/          # 数据库
│   ├── routes/      # API 路由
│   ├── app.js       # 入口文件
│   └── package.json
├── Dockerfile        # Docker 配置
└── package.json      # 根配置
```

## 🚀 快速开始

### 安装依赖
```bash
# 安装所有模块依赖
npm run install:all

# 或分别安装
npm run frontend:install
npm run server:install
```

### 开发模式
```bash
# 同时启动前后端
npm run dev

# 单独启动前端
npm run frontend:dev

# 单独启动后端
npm run server:dev
```

### 生产构建
```bash
# 构建前端
npm run frontend:build

# 启动后端
npm run server:start
```

## 📦 模块说明

### Frontend（前端）
- 基于 VuePress 2.x
- 使用 vuepress-theme-hope 主题
- 运行端口：8080
- 详见 `frontend/README.md`

### Server（后端）
- 基于 Express
- 提供评论、点赞、统计等 API
- 运行端口：3000
- 详见 `server/README.md`

## 🌐 访问地址

- **前端**: http://47.108.150.157:8080
- **后端 API**: http://47.108.150.157:3000/api
- **健康检查**: http://47.108.150.157:3000/health

## 🔧 环境配置

### 前端环境变量
- `frontend/.env.development` - 开发环境
- `frontend/.env.production` - 生产环境

### 后端环境变量
- `server/.env.example` - 环境变量模板
- 复制为 `.env` 并配置

## 🐳 Docker 部署

详见 `README.docker.md`

## 📄 License

MIT
