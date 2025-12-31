const express = require('express');
const cors = require('cors');
const UserService = require('./services/UserService');
const ScoreService = require('./services/ScoreService');
const I18nService = require('./i18n/I18nService');
const createRoutes = require('./routes');

function createApp() {
    const app = express();
    
    // 中间件
    app.use(cors());
    app.use(express.json());
    
    // 国际化中间件
    const i18nService = new I18nService();
    app.use(i18nService.middleware());
    
    // 服务实例
    const userService = new UserService();
    const scoreService = new ScoreService();
    
    // 根路径
    app.get('/', (req, res) => {
        res.json({
            message: req.t('api.title'),
            version: '2.0.0',
            language: req.lang,
            endpoints: {
                'POST /register': req.t('api.endpoints.register'),
                'POST /login': req.t('api.endpoints.login'),
                'POST /score': req.t('api.endpoints.score'),
                'GET /leaderboard': req.t('api.endpoints.leaderboard'),
                'GET /user/:userId/stats': req.t('api.endpoints.stats')
            }
        });
    });
    
    // API 路由
    app.use('/', createRoutes(userService, scoreService));
    
    return { app, userService, scoreService, i18nService };
}

module.exports = createApp;