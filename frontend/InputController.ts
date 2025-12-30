import { _decorator, Component, EventTouch, input, Input, KeyCode, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputController')
export class InputController extends Component {
    private gameManager: any;
    private touchStartPos: Vec2 = new Vec2();
    
    start() {
        this.gameManager = this.node.getComponent('GameManager');
        
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    
    onTouchStart(event: EventTouch) {
        this.touchStartPos = event.getLocation();
    }
    
    onTouchEnd(event: EventTouch) {
        const touchEndPos = event.getLocation();
        const deltaX = touchEndPos.x - this.touchStartPos.x;
        
        if (Math.abs(deltaX) > 50) {
            this.gameManager.moveBlock(deltaX > 0 ? 1 : -1);
        } else {
            this.gameManager.rotateBlock();
        }
    }
    
    onKeyDown(event: any) {
        switch(event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this.gameManager.moveBlock(-1);
                break;
            case KeyCode.ARROW_RIGHT:
                this.gameManager.moveBlock(1);
                break;
            case KeyCode.ARROW_DOWN:
                this.gameManager.accelerateDrop();
                break;
            case KeyCode.SPACE:
                this.gameManager.rotateBlock();
                break;
        }
    }
}