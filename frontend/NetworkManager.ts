export class NetworkManager {
    private static instance: NetworkManager;
    private apiUrl = 'https://your-api-gateway-url.amazonaws.com/prod';
    
    static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }
    
    async post(endpoint: string, data: any): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Network request failed:', error);
            throw error;
        }
    }
    
    async get(endpoint: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Network request failed:', error);
            throw error;
        }
    }
    
    async saveScore(userId: string, score: number, reviveUsed: number = 0): Promise<boolean> {
        try {
            await this.post('/score', { userId, score, reviveUsed });
            return true;
        } catch (error) {
            console.error('Save score failed:', error);
            return false;
        }
    }
    
    async getLeaderboard(): Promise<any[]> {
        try {
            return await this.get('/leaderboard');
        } catch (error) {
            console.error('Get leaderboard failed:', error);
            return [];
        }
    }
}