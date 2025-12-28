@echo off
echo ====================================
echo   启动博客前端和后端服务
echo ====================================
echo.

:: 检查 server 目录是否有 node_modules
if not exist "server\node_modules" (
    echo [1/3] 首次运行，正在安装后端依赖...
    cd server
    call npm install
    cd ..
    echo.
) else (
    echo [1/3] 后端依赖已安装
    echo.
)

:: 创建 .env 文件（如果不存在）
if not exist "server\.env" (
    echo [2/3] 创建后端环境配置文件...
    copy server\.env.example server\.env
    echo 请编辑 server\.env 文件配置你的环境变量
    echo.
) else (
    echo [2/3] 后端环境配置已存在
    echo.
)

echo [3/3] 启动服务...
echo.
echo 正在启动后端服务 (http://localhost:43000)
echo 正在启动前端服务 (http://localhost:48080)
echo.
echo 按 Ctrl+C 停止所有服务
echo ====================================
echo.

:: 同时启动前端和后端
start "后端服务" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "前端服务" cmd /k "npm run docs:dev"

echo.
echo 服务启动完成！
echo 前端: http://localhost:48080
echo 后端: http://localhost:43000
echo.
pause
