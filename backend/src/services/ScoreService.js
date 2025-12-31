const Score = require('../models/Score');

class ScoreService {
    constructor() {
        this.scores = [];
    }

    async saveScore(userId, score, timestamp = null) {
        Score.validate(userId, score);
        
        const scoreObj = new Score(userId, score, timestamp);
        this.scores.push(scoreObj);
        
        // 按分数排序
        this.scores.sort((a, b) => b.score - a.score);
        
        return scoreObj;
    }

    async getLeaderboard(limit = 10) {
        const userBestScores = {};
        
        // 获取每个用户的最高分
        this.scores.forEach(score => {
            if (!userBestScores[score.userId] || 
                userBestScores[score.userId].score < score.score) {
                userBestScores[score.userId] = score;
            }
        });
        
        // 排序并限制数量
        const leaderboard = Object.values(userBestScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        
        return {
            leaderboard: leaderboard.map(s => s.toJSON()),
            total: Object.keys(userBestScores).length
        };
    }

    // 新增方法：获取带用户信息的排行榜
    async getLeaderboardWithUsers(userService, limit = 10) {
        const result = await this.getLeaderboard(limit);
        
        // 添加用户信息
        const leaderboardWithUsers = result.leaderboard.map(score => {
            const user = userService.findById(score.userId);
            return {
                ...score,
                nickname: user ? user.nickname : 'Unknown User'
            };
        });
        
        return {
            leaderboard: leaderboardWithUsers,
            total: result.total
        };
    }

    async getUserStats(userId) {
        const userScores = this.scores.filter(s => s.userId === userId);
        
        if (userScores.length === 0) {
            return {
                bestScore: 0,
                gamesPlayed: 0,
                ranking: null
            };
        }
        
        const bestScore = Math.max(...userScores.map(s => s.score));
        const gamesPlayed = userScores.length;
        
        // 计算排名
        const leaderboard = await this.getLeaderboard(1000);
        const ranking = leaderboard.leaderboard.findIndex(s => s.userId === userId) + 1;
        
        return {
            bestScore,
            gamesPlayed,
            ranking: ranking > 0 ? ranking : null
        };
    }

    async getUserScores(userId) {
        return this.scores
            .filter(s => s.userId === userId)
            .sort((a, b) => b.score - a.score)
            .map(s => s.toJSON());
    }
}

module.exports = ScoreService;