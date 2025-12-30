@echo off
echo 启动TikTok小游戏本地测试...
echo.
echo 正在启动本地服务器...
cd /d "%~dp0\tiktok"

REM 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用Python启动服务器...
    echo 访问地址: http://localhost:8000
    echo 按Ctrl+C停止服务器
    echo.
    python -m http.server 8000
) else (
    echo Python未安装，尝试直接打开文件...
    start index.html
    echo 游戏已在浏览器中打开
    pause
)