#!/bin/bash

# 博客自动部署脚本

echo "开始构建博客..."

# 1. 安装依赖
npm install

# 2. 构建静态文件
npm run docs:build

echo "构建完成！"
echo "静态文件位于: docs/.vuepress/dist"
echo ""
echo "部署到服务器："
echo "rsync -avz --delete docs/.vuepress/dist/ user@your-server:/var/www/blog/"
