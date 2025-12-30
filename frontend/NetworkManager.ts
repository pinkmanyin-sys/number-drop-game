export class NetworkManager {
    private static instance: NetworkManager;
    private apiUrl = 'http://localhost:3000'; // 本地开发服务器
    
    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }
    
    async saveScore(userId: string, score: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, score, timestamp: Date.now() })
            });
            return response.ok;
        } catch (error) {
            console.error('Save score failed:', error);
            return false;
        }
    }
    
    async getLeaderboard(): Promise<any[]> {
        try {
            const response = await fetch(`${this.apiUrl}/leaderboard`);
            return response.ok ? await response.json() : [];
        } catch (error) {
            console.error('Get leaderboard failed:', error);
            return [];
        }
    }
}