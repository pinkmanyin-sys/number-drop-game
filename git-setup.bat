@echo off
echo 初始化Git仓库并推送到远程...

echo 1. 初始化Git仓库
git init

echo 2. 添加所有文件
git add .

echo 3. 创建初始提交
git commit -m "v1.0: 数字掉落游戏稳定版"

echo 4. 创建v1.0标签
git tag -a v1.0 -m "稳定版本 - 完整功能实现"

echo 5. 添加远程仓库（请手动执行）
echo git remote add origin https://github.com/yourusername/number-drop-game.git

echo 6. 推送到远程仓库（请手动执行）
echo git push -u origin main
echo git push origin v1.0

echo.
echo 请先在GitHub创建仓库，然后执行上述命令
pause