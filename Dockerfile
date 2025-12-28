# 多阶段构建 Dockerfile

# ==================== 阶段 1: 构建前端 ====================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制前端依赖文件
COPY package*.json ./

# 安装前端依赖（包含开发依赖，因为 VuePress 在 devDependencies 中）
RUN npm ci

# 复制前端源码
COPY docs ./docs
COPY add-footer-to-articles.js ./

# 构建前端静态文件
RUN npm run docs:build

# ==================== 阶段 2: 构建后端 ====================
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# 复制后端依赖文件
COPY server/package*.json ./

# 安装后端依赖（仅生产环境）
RUN npm ci --only=production

# 复制后端源码
COPY server ./

# ==================== 阶段 3: 生产环境 ====================
FROM node:18-alpine

# 安装 nginx
RUN apk add --no-cache nginx

WORKDIR /app

# 从构建阶段复制后端文件
COPY --from=backend-builder /app/server ./server

# 从构建阶段复制前端构建产物
COPY --from=frontend-builder /app/docs/.vuepress/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.docker.conf /etc/nginx/http.d/default.conf

# 创建必要的目录
RUN mkdir -p /run/nginx /var/log/nginx /app/server/db

# 设置权限
RUN chown -R node:node /app/server/db

# 暴露端口
EXPOSE 80 3000

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'cd /app/server && node app.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# 切换到非 root 用户（后端进程）
USER node

# 启动服务
CMD ["/app/start.sh"]
