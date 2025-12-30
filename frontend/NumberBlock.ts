import { _decorator, Component, Label, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NumberBlock')
export class NumberBlock extends Component {
    @property(Label)
    numberLabel: Label = null;
    
    @property(Sprite)
    background: Sprite = null;
    
    private number: number = 0;
    
    setNumber(value: number) {
        this.number = value;
        this.numberLabel.string = value.toString();
        this.updateAppearance();
    }
    
    getNumber(): number {
        return this.number;
    }
    
    updateAppearance() {
        // 根据数字大小设置不同颜色
        const colors = {
            2: new Color(238, 228, 218),
            4: new Color(237, 224, 200),
            8: new Color(242, 177, 121),
            16: new Color(245, 149, 99),
            32: new Color(246, 124, 95),
            64: new Color(246, 94, 59)
        };
        
        this.background.color = colors[this.number] || new Color(60, 58, 50);
        this.numberLabel.color = this.number <= 4 ? new Color(119, 110, 101) : Color.WHITE;
    }
}