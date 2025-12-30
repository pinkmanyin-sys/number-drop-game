const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { httpMethod, path, body } = event;
    
    try {
        switch (httpMethod) {
            case 'POST':
                if (path === '/score') {
                    return await saveScore(JSON.parse(body));
                }
                break;
            case 'GET':
                if (path === '/leaderboard') {
                    return await getLeaderboard();
                }
                break;
        }
        
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Not Found' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function saveScore(data) {
    const { userId, score, timestamp } = data;
    
    const params = {
        TableName: 'GameScores',
        Item: {
            userId,
            score,
            timestamp: timestamp || Date.now()
        }
    };
    
    await dynamodb.put(params).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Score saved successfully' })
    };
}

async function getLeaderboard() {
    const params = {
        TableName: 'GameScores',
        IndexName: 'ScoreIndex',
        ScanIndexForward: false,
        Limit: 10
    };
    
    const result = await dynamodb.scan(params).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
    };
}