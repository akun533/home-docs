# ============================
# 生产环境镜像
# ============================
# 使用官方镜像（配置镜像加速器后可正常拉取）
FROM node:20-alpine

WORKDIR /app

# 安装 nginx
RUN apk add --no-cache nginx

# 复制前端依赖文件
COPY frontend/package*.json ./frontend/

# 安装前端依赖
RUN cd frontend && \
    npm config set registry https://registry.npmmirror.com && \
    npm install

# 复制前端源码
COPY frontend/ ./frontend/

# 复制后端依赖文件
COPY server/package*.json ./server/

# 安装后端依赖
RUN cd server && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --production

# 复制后端源码
COPY server/ ./server/

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建必要的目录
RUN mkdir -p /app/server/db /var/log/nginx /run/nginx && \
    chown -R node:node /app

# 暴露端口
EXPOSE 80 3000 8080

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Starting services..."' >> /app/start.sh && \
    echo '# 启动后端服务' >> /app/start.sh && \
    echo 'cd /app/server && node app.js &' >> /app/start.sh && \
    echo 'echo "✅ Backend started on port 3000"' >> /app/start.sh && \
    echo '# 启动前端开发服务' >> /app/start.sh && \
    echo 'cd /app/frontend && npm run docs:dev -- --host 0.0.0.0 --port 8080 &' >> /app/start.sh && \
    echo 'echo "✅ Frontend started on port 8080"' >> /app/start.sh && \
    echo '# 等待前端服务启动' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo '# 启动 Nginx' >> /app/start.sh && \
    echo 'nginx -g "daemon off;"' >> /app/start.sh && \
    chmod +x /app/start.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# 启动服务
CMD ["/app/start.sh"]
