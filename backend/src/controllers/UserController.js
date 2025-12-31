const I18nService = require('../i18n/I18nService');

class UserController {
    constructor(userService) {
        this.userService = userService;
        this.i18n = new I18nService();
    }

    async register(req, res) {
        try {
            const { username, password, nickname } = req.body;
            const language = req.language || 'zh';
            const user = await this.userService.register(username, password, language, nickname);
            
            res.status(201).json({
                message: this.i18n.t('success.register_success', language),
                userId: user.userId,
                nickname: user.nickname
            });
        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const language = req.language || 'zh';
            const user = await this.userService.login(username, password, language);
            
            res.json({
                message: this.i18n.t('success.login_success', language),
                userId: user.userId,
                username: user.username,
                nickname: user.nickname
            });
        } catch (error) {
            res.status(401).json({
                error: error.message
            });
        }
    }
}

module.exports = UserController;