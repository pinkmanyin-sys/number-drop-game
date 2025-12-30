import { _decorator, Component, Node, Label, ScrollView, Prefab, instantiate } from 'cc';
import { NetworkManager } from './NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('LeaderboardManager')
export class LeaderboardManager extends Component {
    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Node)
    content: Node = null;

    @property(Prefab)
    leaderboardItemPrefab: Prefab = null;

    @property(Label)
    loadingLabel: Label = null;

    private leaderboardData: any[] = [];

    async loadLeaderboard() {
        if (this.loadingLabel) {
            this.loadingLabel.string = 'Loading...';
            this.loadingLabel.node.active = true;
        }

        try {
            this.leaderboardData = await NetworkManager.getInstance().get('/leaderboard');
            this.displayLeaderboard();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            if (this.loadingLabel) {
                this.loadingLabel.string = 'Failed to load leaderboard';
            }
        }
    }

    private displayLeaderboard() {
        if (this.loadingLabel) {
            this.loadingLabel.node.active = false;
        }

        // 清除现有内容
        this.content.removeAllChildren();

        // 创建排行榜项目
        this.leaderboardData.forEach((player, index) => {
            const item = instantiate(this.leaderboardItemPrefab);
            const rankLabel = item.getChildByName('RankLabel').getComponent(Label);
            const nameLabel = item.getChildByName('NameLabel').getComponent(Label);
            const scoreLabel = item.getChildByName('ScoreLabel').getComponent(Label);
            const reviveLabel = item.getChildByName('ReviveLabel').getComponent(Label);

            rankLabel.string = `#${player.rank}`;
            nameLabel.string = player.username;
            scoreLabel.string = player.totalScore.toString();
            reviveLabel.string = `Revives: ${player.reviveCount}`;

            // 前三名特殊颜色
            if (player.rank <= 3) {
                const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // 金银铜
                rankLabel.color = this.hexToColor(colors[player.rank - 1]);
            }

            this.content.addChild(item);
        });
    }

    private hexToColor(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return new cc.Color(r * 255, g * 255, b * 255, 255);
    }

    getPlayerRank(username: string): number {
        const player = this.leaderboardData.find(p => p.username === username);
        return player ? player.rank : -1;
    }

    refreshLeaderboard() {
        this.loadLeaderboard();
    }
}