const User = require('../models/User');
const I18nService = require('../i18n/I18nService');

class UserService {
    constructor() {
        this.users = [];
        this.i18n = new I18nService();
    }

    async register(username, password, language = 'zh', nickname = null) {
        User.validate(username, password);
        
        if (this.findByUsername(username)) {
            throw new Error(this.i18n.t('errors.username_exists', language));
        }
        
        const user = new User(username, password, nickname);
        this.users.push(user);
        
        return user;
    }

    async login(username, password, language = 'zh') {
        if (!username || !password) {
            throw new Error(this.i18n.t('errors.required_fields', language));
        }
        
        const user = this.findByUsername(username);
        
        if (!user) {
            throw new Error(this.i18n.t('errors.user_not_exists', language));
        }
        
        if (user.password !== password) {
            throw new Error(this.i18n.t('errors.wrong_password', language));
        }
        
        return user;
    }

    findByUsername(username) {
        return this.users.find(u => u.username === username);
    }

    findById(userId) {
        return this.users.find(u => u.userId === userId);
    }

    getAllUsers() {
        return this.users.map(u => u.toJSON());
    }
}

module.exports = UserService;