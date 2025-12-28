#!/bin/bash

# 服务器端自动部署钩子脚本
# 保存为 /var/www/scripts/deploy-blog.sh

BLOG_DIR="/var/www/blog"
REPO_DIR="/var/www/repo/ai-docs"
NGINX_CONFIG="/etc/nginx/sites-available/blog"

echo "================================"
echo "开始部署博客 $(date)"
echo "================================"

# 1. 进入仓库目录
cd $REPO_DIR || exit 1

# 2. 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 3. 安装依赖
echo "安装依赖..."
npm install --production

# 4. 构建
echo "构建静态文件..."
npm run docs:build

# 5. 备份旧版本
if [ -d "$BLOG_DIR" ]; then
    echo "备份旧版本..."
    cp -r $BLOG_DIR ${BLOG_DIR}_backup_$(date +%Y%m%d_%H%M%S)
    # 只保留最近3个备份
    ls -dt ${BLOG_DIR}_backup_* | tail -n +4 | xargs rm -rf
fi

# 6. 复制新文件
echo "部署新版本..."
rm -rf $BLOG_DIR
cp -r docs/.vuepress/dist $BLOG_DIR

# 7. 设置权限
chown -R www-data:www-data $BLOG_DIR
chmod -R 755 $BLOG_DIR

# 8. 测试 Nginx 配置
echo "测试 Nginx 配置..."
nginx -t

# 9. 重载 Nginx
if [ $? -eq 0 ]; then
    echo "重载 Nginx..."
    systemctl reload nginx
    echo "✅ 部署成功！"
else
    echo "❌ Nginx 配置有误，回滚..."
    rm -rf $BLOG_DIR
    mv ${BLOG_DIR}_backup_$(date +%Y%m%d)* $BLOG_DIR 2>/dev/null
fi

echo "================================"
echo "部署完成 $(date)"
echo "================================"
