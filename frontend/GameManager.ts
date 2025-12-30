import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, Tween } from 'cc';
import { NetworkManager } from './NetworkManager';
import { UserManager } from './UserManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab)
    numberBlockPrefab: Prefab = null;
    
    @property(Node)
    gameBoard: Node = null;
    
    private gridWidth = 6;
    private gridHeight = 10;
    private blockSize = 80;
    private gameGrid: number[][] = [];
    private currentBlock: Node = null;
    private currentBlockX = 3;
    private dropTween: Tween<Node> = null;
    private uiManager: any;
    private reviveCount = 0;
    private gameOver = false;
    
    start() {
        this.initGrid();
        this.uiManager = this.node.getComponent('UIManager');
        this.spawnBlock();
    }
    
    initGrid() {
        this.gameGrid = Array(this.gridHeight).fill(null).map(() => Array(this.gridWidth).fill(0));
    }
    
    spawnBlock() {
        if (this.gameOver) return;
        
        const number = Math.pow(2, Math.floor(Math.random() * 4) + 1);
        this.currentBlock = instantiate(this.numberBlockPrefab);
        this.currentBlock.getComponent('NumberBlock').setNumber(number);
        this.currentBlockX = 3;
        this.updateBlockPosition();
        this.gameBoard.addChild(this.currentBlock);
        
        if (this.gameGrid[0][this.currentBlockX] !== 0) {
            this.endGame();
            return;
        }
        
        this.dropBlock();
    }
    
    dropBlock() {
        this.dropTween = tween(this.currentBlock)
            .by(1.0, { position: new Vec3(0, -this.blockSize) })
            .call(() => this.checkCollision())
            .repeatForever();
        this.dropTween.start();
    }
    
    checkCollision() {
        // 检测碰撞和合并逻辑
        const pos = this.currentBlock.getPosition();
        const gridX = Math.floor(pos.x / this.blockSize + this.gridWidth / 2);
        const gridY = Math.floor((this.gridHeight * this.blockSize / 2 - pos.y) / this.blockSize);
        
        if (gridY >= this.gridHeight - 1 || this.gameGrid[gridY + 1][gridX] !== 0) {
            this.placeBlock(gridX, gridY);
            this.checkMerge(gridX, gridY);
            this.spawnBlock();
        }
    }
    
    placeBlock(x: number, y: number) {
        const number = this.currentBlock.getComponent('NumberBlock').getNumber();
        this.gameGrid[y][x] = number;
    }
    
    checkMerge(x: number, y: number) {
        const currentNumber = this.gameGrid[y][x];
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (this.isValidPosition(newX, newY) && 
                this.gameGrid[newY][newX] === currentNumber) {
                this.mergeBlocks(x, y, newX, newY);
                this.addScore(currentNumber * 2);
            }
        }
    }
    
    mergeBlocks(x1: number, y1: number, x2: number, y2: number) {
        const newNumber = this.gameGrid[y1][x1] * 2;
        this.gameGrid[y1][x1] = newNumber;
        this.gameGrid[y2][x2] = 0;
        // 更新UI显示
    }
    
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }
    
    moveBlock(direction: number) {
        if (!this.currentBlock || this.gameOver) return;
        
        const newX = this.currentBlockX + direction;
        if (newX >= 0 && newX < this.gridWidth) {
            this.currentBlockX = newX;
            this.updateBlockPosition();
        }
    }
    
    updateBlockPosition() {
        const x = (this.currentBlockX - this.gridWidth / 2) * this.blockSize;
        const currentY = this.currentBlock.getPosition().y;
        this.currentBlock.setPosition(x, currentY);
    }
    
    accelerateDrop() {
        if (this.dropTween) {
            this.dropTween.stop();
            this.dropTween = tween(this.currentBlock)
                .by(0.1, { position: new Vec3(0, -this.blockSize) })
                .call(() => this.checkCollision())
                .repeatForever();
            this.dropTween.start();
        }
    }
    
    rotateBlock() {
        // 旋转功能可以后续添加
    }
    
    endGame() {
        this.gameOver = true;
        if (this.dropTween) this.dropTween.stop();
        this.uiManager.showGameOver();
        
        // 只有登录用户才保存分数
        if (UserManager.getInstance().isUserLoggedIn()) {
            const userId = UserManager.getInstance().getUserId();
            NetworkManager.getInstance().saveScore(userId, this.currentScore, this.reviveCount);
        }
    }
    
    restart() {
        this.gameOver = false;
        this.reviveCount = 0;
        this.currentScore = 0;
        this.initGrid();
        if (this.currentBlock) {
            this.currentBlock.destroy();
        }
        this.spawnBlock();
    }
    
    revive() {
        if (UserManager.getInstance().isUserLoggedIn()) {
            this.reviveCount++;
            this.gameOver = false;
            this.spawnBlock();
        }
    }
    
    addScore(points: number) {
        this.currentScore += points;
        if (this.uiManager) {
            this.uiManager.updateScore(this.currentScore);
        }
    }
    
    getCurrentScore(): number {
        return this.currentScore;
    }
}