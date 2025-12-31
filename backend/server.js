const createApp = require('./src/app');

const { app } = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`游戏服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`网络访问: http://172.20.10.5:${PORT}`);
    console.log('API 端点:');
    console.log('  POST /register - 用户注册');
    console.log('  POST /login - 用户登录');
    console.log('  POST /score - 保存分数');
    console.log('  GET /leaderboard - 获取排行榜');
    console.log('  GET /user/:userId/stats - 用户统计');
});