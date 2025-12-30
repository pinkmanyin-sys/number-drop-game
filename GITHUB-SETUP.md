# 创建GitHub远程仓库步骤

## 1. 在GitHub创建仓库
1. 访问 https://github.com
2. 点击 "New repository"
3. 仓库名: `number-drop-game`
4. 描述: `跨平台数字掉落合并游戏`
5. 选择 Public
6. 不要初始化README（我们已有文件）
7. 点击 "Create repository"

## 2. 本地Git操作
```bash
# 如果Git已安装，运行以下命令：
cd C:\number-drop-game
git init
git add .
git commit -m "v1.0: 数字掉落游戏稳定版"
git tag -a v1.0 -m "稳定版本 - 完整功能实现"
git branch -M main
git remote add origin https://github.com/你的用户名/number-drop-game.git
git push -u origin main
git push origin v1.0
```

## 3. 或者运行脚本
双击 `git-setup.bat` 文件自动执行初始化

## 4. 验证
访问你的GitHub仓库页面确认文件已上传并且v1.0标签已创建