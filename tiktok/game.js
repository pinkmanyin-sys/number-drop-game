// TikTok小游戏版本 - 游戏管理器
class TikTokGameManager {
    constructor() {
        this.gameGrid = Array(10).fill(null).map(() => Array(6).fill(0));
        this.currentBlock = null;
        this.currentScore = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.userInfo = null;
        this.playTime = 0;
        this.gameStartTime = Date.now();
        this.currentDialog = null;
        
        this.initTikTokSDK();
        this.initGame();
        this.startPlayTimeCounter();
    }

    // 防沉迷计时器
    startPlayTimeCounter() {
        setInterval(() => {
            this.playTime += 1;
            // 每30分钟提醒休息
            if (this.playTime % 1800 === 0) {
                this.showHealthReminder();
            }
        }, 1000);
    }

    // 健康游戏提醒
    showHealthReminder() {
        tt.showModal({
            title: '健康游戏提醒',
            content: '您已连续游戏30分钟，建议适当休息，保护视力健康！',
            showCancel: true,
            cancelText: '继续游戏',
            confirmText: '休息一下',
            success: (res) => {
                if (res.confirm) {
                    // 暂停游戏
                    this.pauseGame();
                }
            }
        });
    }

    // 初始化TikTok SDK
    initTikTokSDK() {
        // 用户静默登录
        this.silentLogin();
        
        // 监听游戏显示/隐藏
        tt.onShow(() => {
            console.log('游戏显示');
            this.resumeGame();
        });

        tt.onHide(() => {
            console.log('游戏隐藏');
            this.pauseGame();
        });
    }

    // 用户静默登录
    silentLogin() {
        tt.login({
            success: (res) => {
                console.log('静默登录成功:', res);
                // 获取用户信息
                tt.getUserInfo({
                    success: (userRes) => {
                        this.userInfo = userRes.userInfo;
                        console.log('用户信息:', this.userInfo);
                        this.loadLeaderboard();
                    },
                    fail: (err) => {
                        console.error('获取用户信息失败:', err);
                        this.userInfo = { nickName: 'Guest' };
                    }
                });
            },
            fail: (err) => {
                console.error('静默登录失败:', err);
                this.userInfo = { nickName: 'Guest' };
            }
        });
    }

    // 初始化游戏
    initGame() {
        this.canvas = tt.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = 375;
        this.canvas.height = 667;
        
        this.setupControls();
        this.spawnBlock(); // 开始游戏
        this.gameLoop();
    }

    // 设置触摸控制
    setupControls() {
        let startX = 0;
        let startY = 0;

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 30) {
                    this.moveBlock(1); // 右移
                } else if (deltaX < -30) {
                    this.moveBlock(-1); // 左移
                }
            } else {
                // 垂直滑动
                if (deltaY > 30) {
                    this.accelerateDrop(); // 加速下落
                }
            }
        });

        // 鼠标事件（PC端模拟）
        this.canvas.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const endX = e.clientX;
            const endY = e.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    this.moveBlock(1);
                } else if (deltaX < -30) {
                    this.moveBlock(-1);
                }
            } else {
                if (deltaY > 30) {
                    this.accelerateDrop();
                }
            }
        });

        // 键盘控制（PC端）
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted || this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.moveBlock(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.moveBlock(1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                case ' ':
                    this.accelerateDrop();
                    break;
            }
        });
    }

    // 生成新方块
    spawnBlock() {
        if (this.gameOver || !this.gameStarted) return;
        
        const numbers = [2, 4, 8, 16];
        const number = numbers[Math.floor(Math.random() * numbers.length)];
        
        this.currentBlock = {
            x: 3,
            y: 0,
            number: number,
            dropSpeed: 1
        };
        
        // 检查游戏结束
        if (this.gameGrid[0][3] !== 0) {
            console.log('游戏结束被触发');
            this.endGame();
            return;
        }
        
        this.dropBlock();
    }

    // 开始游戏
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameOver = false;
            this.spawnBlock();
        }
    }

    // 方块下落
    dropBlock() {
        if (!this.currentBlock || this.gameOver) return;
        
        this.dropInterval = setInterval(() => {
            if (this.canMove(this.currentBlock.x, this.currentBlock.y + 1)) {
                this.currentBlock.y++;
            } else {
                this.placeBlock();
                this.checkMerge();
                this.clearInterval();
                this.spawnBlock();
            }
        }, 500 / this.currentBlock.dropSpeed);
    }

    // 清除定时器
    clearInterval() {
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
            this.dropInterval = null;
        }
    }

    // 检查是否可以移动
    canMove(x, y) {
        return x >= 0 && x < 6 && y >= 0 && y < 10 && 
               (y >= 10 || this.gameGrid[y] === undefined || this.gameGrid[y][x] === 0);
    }

    // 放置方块
    placeBlock() {
        if (this.currentBlock && this.currentBlock.y >= 0 && this.currentBlock.y < 10) {
            this.gameGrid[this.currentBlock.y][this.currentBlock.x] = this.currentBlock.number;
        }
        this.currentBlock = null;
    }

    // 检查合并
    checkMerge() {
        let merged = false;
        
        // 重力下落
        this.applyGravity();
        
        // 检查合并
        for (let y = 9; y >= 0; y--) {
            for (let x = 0; x < 6; x++) {
                if (this.gameGrid[y][x] === 0) continue;
                
                const currentNumber = this.gameGrid[y][x];
                
                // 检查相邻方块
                const directions = [[0,1], [1,0], [0,-1], [-1,0]];
                for (const [dx, dy] of directions) {
                    const newX = x + dx;
                    const newY = y + dy;
                    
                    if (newX >= 0 && newX < 6 && newY >= 0 && newY < 10 &&
                        this.gameGrid[newY][newX] === currentNumber) {
                        
                        // 合并方块
                        this.gameGrid[y][x] = currentNumber * 2;
                        this.gameGrid[newY][newX] = 0;
                        this.addScore(currentNumber * 2);
                        merged = true;
                        break;
                    }
                }
            }
        }
        
        if (merged) {
            this.applyGravity();
            setTimeout(() => this.checkMerge(), 100);
        }
    }

    // 应用重力
    applyGravity() {
        for (let x = 0; x < 6; x++) {
            // 收集该列的所有非零方块
            const column = [];
            for (let y = 0; y < 10; y++) {
                if (this.gameGrid[y][x] !== 0) {
                    column.push(this.gameGrid[y][x]);
                    this.gameGrid[y][x] = 0;
                }
            }
            
            // 从底部重新放置
            for (let i = 0; i < column.length; i++) {
                this.gameGrid[10 - 1 - i][x] = column[column.length - 1 - i];
            }
        }
    }

    // 添加分数
    addScore(points) {
        this.currentScore += points;
        console.log('得分:', points, '总分:', this.currentScore);
    }

    // 移动方块
    moveBlock(direction) {
        if (!this.currentBlock || this.gameOver) return;
        
        const newX = this.currentBlock.x + direction;
        if (this.canMove(newX, this.currentBlock.y)) {
            this.currentBlock.x = newX;
        }
    }

    // 加速下落
    accelerateDrop() {
        if (this.currentBlock) {
            this.currentBlock.dropSpeed = 5;
            this.clearInterval();
            this.dropBlock();
        }
    }

    // 游戏结束
    endGame() {
        console.log('游戏结束被调用');
        this.gameOver = true;
        this.clearInterval();
        
        // 提交分数到TikTok排行榜
        this.submitScore();
        
        // 显示华丽的对话框
        setTimeout(() => {
            this.showGameOverDialog();
        }, 300);
    }

    // 显示游戏结束对话框（含广告复活）
    showGameOverDialog() {
        console.log('开始创建华丽对话框');
        
        // 先清理旧对话框
        this.closeDialog();
        
        // 创建华丽的TikTok风格对话框
        const dialog = document.createElement('div');
        dialog.id = 'gameOverDialog';
        dialog.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px; padding: 35px; text-align: center;
                max-width: 320px; margin: 20px; color: white;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 15px;">🎮</div>
                <h2 style="color: white; margin-bottom: 25px; font-size: 24px;">Game Over</h2>
                
                <div style="background: rgba(255,255,255,0.2); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 8px 0; font-size: 18px;">Your Score</p>
                    <div style="font-size: 32px; font-weight: bold; color: #FFD700;">${this.currentScore}</div>
                    <p style="margin: 8px 0; font-size: 14px; opacity: 0.8;">Play Time: ${Math.floor(this.playTime / 60)} min</p>
                </div>
                
                <button class="revive-btn" style="
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white; border: none; padding: 15px 25px;
                    border-radius: 25px; font-size: 16px; font-weight: bold;
                    margin: 8px; cursor: pointer; min-width: 140px;
                    box-shadow: 0 4px 15px rgba(255,107,107,0.4);
                ">📺 Watch Ad to Revive</button>
                
                <br>
                
                <button class="shortcut-btn" style="
                    background: linear-gradient(45deg, #4CAF50, #45a049);
                    color: white; border: none; padding: 12px 25px;
                    border-radius: 25px; font-size: 16px;
                    margin: 8px; cursor: pointer; min-width: 140px;
                ">🏠 Add to Home</button>
                
                <br>
                
                <button class="restart-btn" style="
                    background: rgba(255,255,255,0.2); color: white;
                    border: 2px solid rgba(255,255,255,0.3); padding: 12px 25px;
                    border-radius: 25px; font-size: 16px;
                    margin: 8px; cursor: pointer; min-width: 140px;
                ">🔄 Restart Game</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.currentDialog = dialog;
        
        console.log('华丽对话框已添加到DOM');
        
        // 直接绑定事件，不用setTimeout
        const reviveBtn = dialog.querySelector('.revive-btn');
        const shortcutBtn = dialog.querySelector('.shortcut-btn');
        const restartBtn = dialog.querySelector('.restart-btn');
        
        reviveBtn.addEventListener('click', () => {
            console.log('点击复活按钮');
            this.handleRevive();
        });
        
        shortcutBtn.addEventListener('click', () => {
            console.log('点击添加桌面快捷方式');
            this.addShortcut();
        });
        
        restartBtn.addEventListener('click', () => {
            console.log('点击重开按钮');
            this.handleRestart();
        });
        
        console.log('事件绑定完成');
    }
    
    // 处理复活
    handleRevive() {
        this.closeDialog();
        this.showRewardedAd();
    }
    
    // 处理重新开始
    handleRestart() {
        this.closeDialog();
        this.restart();
    }
    
    // 添加桌面快捷方式
    addShortcut() {
        this.closeDialog();
        tt.addShortcut({
            success: () => {
                console.log('添加桌面快捷方式成功');
                // 获取奖励
                tt.getShortcutMissionReward({
                    success: (res) => {
                        console.log('获取快捷方式奖励成功:', res);
                        tt.showToast({
                            title: 'Shortcut added! Bonus points earned!',
                            icon: 'success'
                        });
                    },
                    fail: (err) => {
                        console.error('获取快捷方式奖励失败:', err);
                    }
                });
            },
            fail: (err) => {
                console.error('添加桌面快捷方式失败:', err);
                tt.showToast({
                    title: 'Failed to add shortcut',
                    icon: 'none'
                });
            }
        });
    }

    // 跳转到个人主页侧边栏
    startEntranceMission() {
        tt.startEntranceMission({
            success: () => {
                console.log('跳转个人主页侧边栏成功');
                // 获取奖励
                tt.getEntranceMissionReward({
                    success: (res) => {
                        console.log('获取侧边栏奖励成功:', res);
                        tt.showToast({
                            title: 'Profile mission completed! Bonus earned!',
                            icon: 'success'
                        });
                    },
                    fail: (err) => {
                        console.error('获取侧边栏奖励失败:', err);
                    }
                });
            },
            fail: (err) => {
                console.error('跳转个人主页侧边栏失败:', err);
            }
        });
    }

    // 显示激励广告（复活用）
    showRewardedAd() {
        tt.createRewardedVideoAd({
            adUnitId: 'revive-ad-unit-id',
            success: (ad) => {
                ad.onLoad(() => {
                    ad.show();
                });
                
                ad.onClose((res) => {
                    if (res && res.isEnded) {
                        this.revivePlayer();
                    } else {
                        tt.showToast({
                            title: 'Watch full ad to revive',
                            icon: 'none'
                        });
                        this.showGameOverDialog();
                    }
                });
                
                ad.onError(() => {
                    this.revivePlayer(); // 广告失败时直接复活
                });
            },
            fail: () => {
                this.revivePlayer();
            }
        });
    }

    // 复活玩家
    revivePlayer() {
        this.gameOver = false;
        this.gameStarted = true;
        
        // 清除顶部5行，给玩家更多喘息空间
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 6; x++) {
                this.gameGrid[y][x] = 0;
            }
        }
        
        // 重新开始游戏循环
        this.spawnBlock();
        
        tt.showToast({
            title: 'Revive successful! Keep going!',
            icon: 'success'
        });
    }

    // 提交分数到TikTok排行榜
    submitScore() {
        if (this.userInfo && this.userInfo.nickName !== 'Guest') {
            tt.setUserCloudStorage({
                KVDataList: [{
                    key: 'score',
                    value: this.currentScore.toString()
                }, {
                    key: 'timestamp',
                    value: Date.now().toString()
                }],
                success: () => {
                    console.log('分数提交成功');
                    
                    // 提交到排行榜
                    tt.postMessage({
                        message: 'submitScore',
                        score: this.currentScore
                    });
                },
                fail: (err) => {
                    console.error('分数提交失败:', err);
                }
            });
        }
    }

    // 加载排行榜（全球+好友）
    loadLeaderboard() {
        // 获取好友排行榜
        tt.getFriendCloudStorage({
            keyList: ['score', 'timestamp'],
            success: (res) => {
                console.log('好友排行榜:', res.data);
                this.displayLeaderboard(res.data, '好友排行榜');
            },
            fail: (err) => {
                console.error('获取好友排行榜失败:', err);
            }
        });

        // 获取全球排行榜
        tt.getGroupCloudStorage({
            shareTicket: '', // 全球排行榜
            keyList: ['score', 'timestamp'],
            success: (res) => {
                console.log('全球排行榜:', res.data);
                this.displayLeaderboard(res.data, '全球排行榜');
            },
            fail: (err) => {
                console.error('获取全球排行榜失败:', err);
            }
        });

        // 使用TikTok开放域排行榜API
        tt.getOpenDataContext().postMessage({
            command: 'getLeaderboard',
            type: 'global'
        });
    }

    // 显示排行榜
    displayLeaderboard(data) {
        // 排序并显示前10名
        const leaderboard = data
            .filter(item => item.KVDataList.find(kv => kv.key === 'score'))
            .map(item => ({
                nickName: item.nickname,
                avatarUrl: item.avatarUrl,
                score: parseInt(item.KVDataList.find(kv => kv.key === 'score').value)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        this.renderLeaderboard(leaderboard);
    }

    // 渲染排行榜
    renderLeaderboard(leaderboard) {
        const startY = 50;
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Leaderboard', 150, 30);

        leaderboard.forEach((player, index) => {
            const y = startY + index * 40;
            
            // 排名
            this.ctx.fillStyle = index < 3 ? '#FFD700' : '#666';
            this.ctx.fillText(`#${index + 1}`, 20, y);
            
            // 玩家名
            this.ctx.fillStyle = '#333';
            this.ctx.fillText(player.nickName, 80, y);
            
            // 分数
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillText(player.score.toLocaleString(), 250, y);
        });
    }

    // 显示游戏结束对话框
    showGameOverDialog() {
        tt.showModal({
            title: '游戏结束',
            content: `本次得分: ${this.currentScore}\\n\\n是否重新开始？`,
            showCancel: true,
            cancelText: '分享',
            confirmText: '重新开始',
            success: (res) => {
                if (res.confirm) {
                    this.restart();
                } else if (res.cancel) {
                    this.shareGame();
                }
            }
        });
    }

    // 分享游戏
    shareGame() {
        tt.shareAppMessage({
            title: '我在数字掉落游戏中得了' + this.currentScore + '分！',
            desc: '快来挑战我的分数吧！',
            imageUrl: 'images/share.png',
            query: 'score=' + this.currentScore,
            success: () => {
                console.log('分享成功');
            },
            fail: (err) => {
                console.error('分享失败:', err);
            }
        });
    }

    // 重新开始游戏（清零分数）
    restart() {
        this.gameGrid = Array(10).fill(null).map(() => Array(6).fill(0));
        this.currentScore = 0;
        this.gameOver = false;
        this.gameStarted = true;
        this.spawnBlock();
    }

    // 暂停游戏
    pauseGame() {
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
    }

    // 恢复游戏
    resumeGame() {
        if (this.currentBlock && !this.gameOver) {
            this.dropBlock();
        }
    }

    // 游戏主循环
    gameLoop() {
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制游戏区域
        this.renderGrid();
        this.renderCurrentBlock();
        this.renderUI();
    }

    // 渲染网格
    renderGrid() {
        const blockSize = 50;
        const startX = 37.5;
        const startY = 100;
        
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 6; x++) {
                const posX = startX + x * blockSize;
                const posY = startY + y * blockSize;
                
                // 绘制网格线
                this.ctx.strokeStyle = '#ddd';
                this.ctx.strokeRect(posX, posY, blockSize, blockSize);
                
                // 绘制方块
                if (this.gameGrid[y][x] !== 0) {
                    this.renderBlock(posX, posY, blockSize, this.gameGrid[y][x]);
                }
            }
        }
    }

    // 渲染当前方块
    renderCurrentBlock() {
        if (this.currentBlock) {
            const blockSize = 50;
            const startX = 37.5;
            const startY = 100;
            
            const posX = startX + this.currentBlock.x * blockSize;
            const posY = startY + this.currentBlock.y * blockSize;
            
            this.renderBlock(posX, posY, blockSize, this.currentBlock.number);
        }
    }

    // 渲染单个方块
    renderBlock(x, y, size, number) {
        // 根据数字选择颜色
        const colors = {
            2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
            32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
            512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        
        this.ctx.fillStyle = colors[number] || '#3c3a32';
        this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // 绘制数字
        this.ctx.fillStyle = number <= 4 ? '#776e65' : '#f9f6f2';
        this.ctx.font = `${size/3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(number.toString(), x + size/2, y + size/2);
    }

    // 渲染UI
    renderUI() {
        // 分数
        this.ctx.fillStyle = '#333';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.currentScore}`, 20, 30);
        
        // 用户信息
        if (this.userInfo) {
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Player: ${this.userInfo.nickName}`, 20, 60);
        }
    }
}

// 启动游戏 - 自动开始
window.game = new TikTokGameManager();
if (window.game) {
    window.game.startGame();
}