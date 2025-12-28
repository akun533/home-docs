# 开发环境 Dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制前端依赖文件
COPY package.json pnpm-lock.yaml* ./

# 配置 pnpm 使用淘宝镜像源并安装前端依赖（包含开发依赖）
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile || pnpm install

# 复制后端依赖文件并安装
COPY server/package.json server/pnpm-lock.yaml* ./server/
RUN cd server && pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile || pnpm install

# 复制所有源码
COPY docs ./docs
COPY add-footer-to-articles.js ./
COPY server ./server

# 创建数据库目录
RUN mkdir -p /app/server/db && chown -R node:node /app/server/db

# 暴露端口：48080(VuePress开发服务器) 和 43000(后端API)
EXPOSE 48080 43000

# 创建启动脚本（同时启动前端开发服务器和后端）
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/server && node app.js &' >> /app/start.sh && \
    echo 'cd /app && pnpm run docs:dev -- --host 0.0.0.0 --port 48080' >> /app/start.sh && \
    chmod +x /app/start.sh

# 切换到非 root 用户
USER node

# 启动服务
CMD ["/app/start.sh"]
