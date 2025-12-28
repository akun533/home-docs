@echo off
echo ==========================================
echo Docker 开发环境启动脚本（支持热更新）
echo ==========================================
echo.

echo [1/2] 构建开发环境镜像...
docker-compose -f docker-compose.dev.yml build

echo.
echo [2/2] 启动开发环境容器...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo ==========================================
echo 开发环境启动成功！
echo.
echo 访问地址: http://localhost:8080
echo API 服务: http://localhost:3000
echo.
echo 功能说明:
echo - 文档目录已映射，修改文章自动重新构建
echo - 后端代码已映射，修改代码需重启容器
echo - 数据库文件保存在 ./data 目录
echo.
echo 查看日志: docker-compose -f docker-compose.dev.yml logs -f
echo 停止服务: docker-compose -f docker-compose.dev.yml down
echo ==========================================
echo.

pause
