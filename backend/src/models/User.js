class User {
    constructor(username, password, nickname = null) {
        this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.username = username;
        this.password = password;
        this.nickname = nickname || username;
        this.createdAt = Date.now();
    }

    static validate(username, password, t = (key) => key) {
        if (!username || !password) {
            throw new Error(t('errors.required_fields'));
        }
        
        if (username.length < 3) {
            throw new Error(t('errors.username_min_length'));
        }
        
        if (password.length < 6) {
            throw new Error(t('errors.password_min_length'));
        }
        
        return true;
    }

    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            nickname: this.nickname,
            createdAt: this.createdAt
        };
    }
}

module.exports = User;