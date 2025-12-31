const express = require('express');
const UserController = require('../controllers/UserController');
const ScoreController = require('../controllers/ScoreController');

function createRoutes(userService, scoreService) {
    const router = express.Router();
    const userController = new UserController(userService);
    const scoreController = new ScoreController(scoreService, userService);

    // 用户路由
    router.post('/register', (req, res) => userController.register(req, res));
    router.post('/login', (req, res) => userController.login(req, res));

    // 分数路由
    router.post('/score', (req, res) => scoreController.saveScore(req, res));
    router.get('/leaderboard', (req, res) => scoreController.getLeaderboard(req, res));
    router.get('/user/:userId/stats', (req, res) => scoreController.getUserStats(req, res));
    router.get('/user/:userId/score', (req, res) => scoreController.getUserScores(req, res));

    return router;
}

module.exports = createRoutes;