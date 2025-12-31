class Score {
    constructor(userId, score, timestamp = null) {
        this.userId = userId;
        this.score = parseInt(score);
        this.timestamp = timestamp || Date.now();
    }

    static validate(userId, score, t = (key) => key) {
        if (!userId) {
            throw new Error(t('errors.user_id_required'));
        }
        
        if (!score || isNaN(score) || score < 0) {
            throw new Error(t('errors.invalid_score'));
        }
        
        return true;
    }

    toJSON() {
        return {
            userId: this.userId,
            score: this.score,
            timestamp: this.timestamp
        };
    }
}

module.exports = Score;