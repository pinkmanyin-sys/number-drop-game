const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let scores = [];

app.post('/score', (req, res) => {
    const { userId, score, timestamp } = req.body;
    scores.push({ userId, score, timestamp: timestamp || Date.now() });
    scores.sort((a, b) => b.score - a.score);
    res.json({ message: 'Score saved successfully' });
});

app.get('/leaderboard', (req, res) => {
    res.json(scores.slice(0, 10));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`游戏服务器运行在 http://localhost:${PORT}`);
    console.log('API 端点:');
    console.log('  POST /score - 保存分数');
    console.log('  GET /leaderboard - 获取排行榜');
});