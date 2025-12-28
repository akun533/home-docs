# Docker 部署指南

本文档说明如何使用 Docker 部署 AI Docs 项目（包含前端文档和后端服务）。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重新构建
docker-compose up -d --build
```

访问地址：
- 前端文档：http://localhost:8080
- API 服务：http://localhost:3000
- 健康检查：http://localhost:8080/health

### 2. 使用 Docker 命令

```bash
# 构建镜像
docker build -t home-docs:latest .

# 运行容器
docker run -d \
  --name home-docs-app \
  -p 8080:80 \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e ALLOWED_ORIGINS=http://localhost:8080 \
  -v $(pwd)/data:/app/server/db \
  home-docs:latest

# 查看日志
docker logs -f home-docs-app

# 停止容器
docker stop home-docs-app

# 删除容器
docker rm home-docs-app
```

## 🔧 环境变量配置

在 `docker-compose.yml` 或运行命令中配置以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | production |
| PORT | 后端服务端口 | 3000 |
| ALLOWED_ORIGINS | 允许的跨域来源 | http://localhost:8080 |

## 📦 数据持久化

数据库文件存储在容器的 `/app/server/db` 目录下，通过 volume 映射到宿主机的 `./data` 目录，确保数据不会因容器重启而丢失。

## 🔍 健康检查

Docker 容器配置了健康检查，每 30 秒检查一次服务状态：

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' home-docs-app
```

## 🌐 生产环境部署

### 使用自定义域名

1. 修改 `nginx.docker.conf` 中的 `server_name`
2. 配置环境变量中的 `ALLOWED_ORIGINS`
3. 重新构建镜像

### 使用 HTTPS

推荐在 Docker 容器前使用反向代理（如 Nginx 或 Traefik）来处理 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🛠 维护命令

```bash
# 进入容器
docker exec -it home-docs-app sh

# 查看资源使用
docker stats home-docs-app

# 清理未使用的镜像
docker image prune -a

# 导出镜像
docker save home-docs:latest | gzip > home-docs.tar.gz

# 导入镜像
docker load < home-docs.tar.gz
```

## 📊 监控和日志

```bash
# 实时日志
docker-compose logs -f home-docs

# Nginx 日志
docker exec home-docs-app tail -f /var/log/nginx/access.log
docker exec home-docs-app tail -f /var/log/nginx/error.log

# 后端日志
docker-compose logs -f home-docs | grep "服务器运行"
```

## ⚡ 性能优化

1. **多阶段构建**：Dockerfile 使用多阶段构建减小镜像体积
2. **静态资源缓存**：Nginx 配置了静态资源长期缓存
3. **Gzip 压缩**：启用 Gzip 压缩减少传输大小
4. **健康检查**：自动检测服务状态

## 🐛 故障排查

### 容器无法启动
```bash
docker logs home-docs-app
```

### 端口冲突
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8081:80"  # 改为其他端口
```

### 数据丢失
确保 volume 映射正确：
```bash
docker inspect home-docs-app | grep Mounts -A 10
```

## 📝 注意事项

- 首次启动可能需要几分钟构建时间
- 确保宿主机的 8080 和 3000 端口未被占用
- 数据库文件会自动创建在 `./data` 目录
- 建议在生产环境使用专业的数据库服务（如 MongoDB、PostgreSQL）

## 🔄 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```
