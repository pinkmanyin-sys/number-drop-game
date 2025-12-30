@echo off
echo 数字掉落游戏 - 快速启动指南
echo ================================

echo 1. 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] AWS CLI 未安装，后端部署将跳过
    echo 下载地址: https://aws.amazon.com/cli/
)

echo 2. 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo 3. 启动本地测试服务器...
echo API 地址: http://localhost:3000
call npm run local

pause