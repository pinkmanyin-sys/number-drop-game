import { _decorator, Component, Label, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Label)
    scoreLabel: Label = null;
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(Node)
    gameOverPanel: Node = null;
    
    @property(Button)
    restartButton: Button = null;
    
    private score = 0;
    private level = 1;
    
    start() {
        this.restartButton.node.on('click', this.onRestart, this);
        this.updateUI();
    }
    
    addScore(points: number) {
        this.score += points;
        this.level = Math.floor(this.score / 1000) + 1;
        this.updateUI();
    }
    
    updateUI() {
        this.scoreLabel.string = `分数: ${this.score}`;
        this.levelLabel.string = `等级: ${this.level}`;
    }
    
    showGameOver() {
        this.gameOverPanel.active = true;
    }
    
    onRestart() {
        this.score = 0;
        this.level = 1;
        this.gameOverPanel.active = false;
        this.updateUI();
        this.node.getComponent('GameManager').restart();
    }
    
    getScore(): number {
        return this.score;
    }
}