const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const crypto = require('crypto');

exports.handler = async (event) => {
    const { httpMethod, path, body } = event;
    
    try {
        switch (httpMethod) {
            case 'POST':
                if (path === '/register') {
                    return await registerUser(JSON.parse(body));
                } else if (path === '/login') {
                    return await loginUser(JSON.parse(body));
                } else if (path === '/score') {
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

async function registerUser(data) {
    const { username, password } = data;
    const userId = crypto.randomUUID();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const params = {
        TableName: 'Users',
        Item: {
            userId,
            username,
            passwordHash,
            totalScore: 0,
            reviveCount: 0,
            createdAt: Date.now()
        },
        ConditionExpression: 'attribute_not_exists(username)'
    };
    
    try {
        await dynamodb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ userId, username, message: 'User registered successfully' })
        };
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Username already exists' })
            };
        }
        throw error;
    }
}

async function loginUser(data) {
    const { username, password } = data;
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const params = {
        TableName: 'Users',
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username
        }
    };
    
    const result = await dynamodb.query(params).promise();
    
    if (result.Items.length === 0 || result.Items[0].passwordHash !== passwordHash) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid credentials' })
        };
    }
    
    const user = result.Items[0];
    return {
        statusCode: 200,
        body: JSON.stringify({ 
            userId: user.userId, 
            username: user.username,
            totalScore: user.totalScore,
            reviveCount: user.reviveCount
        })
    };
}

async function saveScore(data) {
    const { userId, score, reviveUsed } = data;
    
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Guest users cannot save scores' })
        };
    }
    
    // 更新用户总分和复活次数
    const updateParams = {
        TableName: 'Users',
        Key: { userId },
        UpdateExpression: 'ADD totalScore :score, reviveCount :revive',
        ExpressionAttributeValues: {
            ':score': score,
            ':revive': reviveUsed || 0
        }
    };
    
    await dynamodb.update(updateParams).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Score saved successfully' })
    };
}

async function getLeaderboard() {
    const params = {
        TableName: 'Users',
        ProjectionExpression: 'username, totalScore, reviveCount',
        FilterExpression: 'totalScore > :zero',
        ExpressionAttributeValues: {
            ':zero': 0
        }
    };
    
    const result = await dynamodb.scan(params).promise();
    
    // 按总分排序，取前100名
    const leaderboard = result.Items
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 100)
        .map((user, index) => ({
            rank: index + 1,
            username: user.username,
            totalScore: user.totalScore,
            reviveCount: user.reviveCount
        }));
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaderboard)
    };
}