class ScoreController {
    constructor(scoreService, userService) {
        this.scoreService = scoreService;
        this.userService = userService;
    }

    async saveScore(req, res) {
        try {
            const { userId, score, timestamp } = req.body;
            
            // 拒绝游客分数保存
            if (userId && userId.startsWith('guest_')) {
                return res.status(403).json({
                    error: '游客模式不支持分数保存'
                });
            }
            
            const scoreObj = await this.scoreService.saveScore(userId, score, timestamp);
            
            res.json({
                message: 'Score saved successfully',
                score: scoreObj.toJSON()
            });
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.scoreService.getLeaderboardWithUsers(this.userService, limit);
            
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    async getUserStats(req, res) {
        try {
            const { userId } = req.params;
            const stats = await this.scoreService.getUserStats(userId);
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    async getUserScores(req, res) {
        try {
            const { userId } = req.params;
            const scores = await this.scoreService.getUserScores(userId);
            
            res.json({
                bestScore: scores[0] || null,
                allScores: scores
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}

module.exports = ScoreController;