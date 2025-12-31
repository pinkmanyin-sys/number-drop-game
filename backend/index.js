const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { httpMethod, pathParameters, queryStringParameters, body } = event;
    const path = event.path || event.pathParameters?.proxy;
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
    
    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }
    
    try {
        let result;
        
        if (httpMethod === 'POST' && path === '/score') {
            result = await saveScore(JSON.parse(body));
        } else if (httpMethod === 'GET' && path === '/leaderboard') {
            result = await getLeaderboard(queryStringParameters);
        } else if (httpMethod === 'GET' && path?.startsWith('/user/')) {
            const userId = path.split('/')[2];
            result = await getUserScore(userId);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ message: 'Not Found' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function saveScore(data) {
    const { userId, score, timestamp } = data;
    
    if (!userId || !score) {
        throw new Error('userId and score are required');
    }
    
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            userId: userId.toString(),
            score: parseInt(score),
            timestamp: timestamp || Date.now()
        }
    };
    
    await dynamodb.put(params).promise();
    
    return { message: 'Score saved successfully' };
}

async function getLeaderboard(queryParams) {
    const limit = parseInt(queryParams?.limit) || 10;
    
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        IndexName: 'ScoreIndex',
        ScanIndexForward: false,
        Limit: limit
    };
    
    const result = await dynamodb.scan(params).promise();
    const sorted = result.Items.sort((a, b) => b.score - a.score);
    
    return {
        leaderboard: sorted,
        total: result.Count
    };
}

async function getUserScore(userId) {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    };
    
    const result = await dynamodb.query(params).promise();
    const scores = result.Items.sort((a, b) => b.score - a.score);
    
    return {
        bestScore: scores[0] || null,
        allScores: scores
    };
}