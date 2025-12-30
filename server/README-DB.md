# PostgreSQL 数据库配置说明

## 数据库迁移

后端已从 JSON 文件存储迁移到 PostgreSQL 数据库。

## 前置要求

1. **安装 PostgreSQL**（版本 12 或以上）
2. **创建数据库**

```sql
CREATE DATABASE homedocs;
```

## 环境变量配置

在 `server` 目录下创建 `.env` 文件（可参考 `.env.example`）：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# PostgreSQL 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homedocs
DB_USER=postgres
DB_PASSWORD=postgres

# 跨域配置
ALLOWED_ORIGINS=http://localhost,http://localhost:80,http://47.108.150.157,http://127.0.0.1

# 管理员密钥
ADMIN_KEY=your_admin_key_here
```

## 数据库表结构

服务启动时会自动创建以下表：

### 1. comments（评论表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| page_url | VARCHAR(500) | 页面URL |
| content | TEXT | 评论内容 |
| author | VARCHAR(100) | 作者 |
| email | VARCHAR(100) | 邮箱 |
| website | VARCHAR(200) | 网站 |
| ip | VARCHAR(50) | IP地址 |
| created_at | TIMESTAMP | 创建时间 |
| parent_id | BIGINT | 父评论ID（外键） |

**索引：** page_url, created_at, parent_id

### 2. likes（点赞表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| page_url | VARCHAR(500) | 页面URL |
| user_id | VARCHAR(100) | 用户ID |
| created_at | TIMESTAMP | 创建时间 |

**约束：** UNIQUE(page_url, user_id)  
**索引：** page_url

### 3. page_views（访问记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| page_url | VARCHAR(500) | 页面URL |
| visitor_id | VARCHAR(100) | 访客ID |
| ip_address | VARCHAR(50) | IP地址 |
| created_at | TIMESTAMP | 创建时间 |

**索引：** page_url, created_at, (ip_address, created_at)

## 启动服务

1. **安装依赖**

```bash
cd server
npm install
# 或
pnpm install
```

2. **启动服务**

```bash
npm start
# 或开发模式
npm run dev
```

服务启动时会：
- ✅ 验证数据库连接
- ✅ 自动创建所需的表（如果不存在）
- ✅ 创建必要的索引

## Docker 部署

如需在 Docker 中使用 PostgreSQL，可在 `docker-compose.yml` 中添加：

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: homedocs
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - homedocs-network

  server:
    # ... 其他配置
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: homedocs
      DB_USER: postgres
      DB_PASSWORD: postgres

volumes:
  postgres_data:

networks:
  homedocs-network:
```

## 数据迁移（从 JSON 到 PostgreSQL）

如果你有旧的 JSON 数据需要迁移，请参考 `server/db/migrate.js` 脚本（需自行创建）。

## 性能优化

- 使用连接池（已配置，最大20个连接）
- 自动清理30天前的访问记录（1%概率触发）
- 10分钟内重复IP访问不计数（防刷）
- 所有关键字段都有索引优化查询性能

## 故障排除

### 连接失败
- 检查 PostgreSQL 服务是否启动
- 验证数据库连接配置（.env文件）
- 确认数据库用户权限

### 表创建失败
- 查看服务启动日志
- 手动连接数据库检查权限
- 确认 PostgreSQL 版本兼容性
