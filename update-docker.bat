@echo off
echo ==========================================
echo Docker 容器文章更新脚本（生产环境）
echo ==========================================
echo.

echo [1/3] 停止当前容器...
docker-compose down

echo.
echo [2/3] 重新构建镜像...
docker-compose build --no-cache

echo.
echo [3/3] 启动新容器...
docker-compose up -d

echo.
echo ==========================================
echo 更新完成！
echo 访问地址: http://localhost:8080
echo ==========================================
echo.

pause
