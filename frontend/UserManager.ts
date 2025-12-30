import { _decorator, Component, sys } from 'cc';
import { NetworkManager } from './NetworkManager';
const { ccclass } = _decorator;

@ccclass('UserManager')
export class UserManager extends Component {
    private static instance: UserManager = null;
    private currentUser: any = null;
    private isGuest: boolean = true;

    static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    onLoad() {
        UserManager.instance = this;
        this.loadUserData();
    }

    async register(username: string, password: string): Promise<boolean> {
        try {
            const response = await NetworkManager.getInstance().post('/register', {
                username,
                password
            });
            
            if (response.userId) {
                this.currentUser = response;
                this.isGuest = false;
                this.saveUserData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    }

    async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await NetworkManager.getInstance().post('/login', {
                username,
                password
            });
            
            if (response.userId) {
                this.currentUser = response;
                this.isGuest = false;
                this.saveUserData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        this.isGuest = true;
        sys.localStorage.removeItem('userData');
    }

    playAsGuest() {
        this.isGuest = true;
        this.currentUser = null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn(): boolean {
        return !this.isGuest && this.currentUser !== null;
    }

    getUserId(): string | null {
        return this.currentUser ? this.currentUser.userId : null;
    }

    getUsername(): string {
        return this.currentUser ? this.currentUser.username : 'Guest';
    }

    getTotalScore(): number {
        return this.currentUser ? this.currentUser.totalScore : 0;
    }

    getReviveCount(): number {
        return this.currentUser ? this.currentUser.reviveCount : 0;
    }

    private saveUserData() {
        if (this.currentUser) {
            sys.localStorage.setItem('userData', JSON.stringify(this.currentUser));
        }
    }

    private loadUserData() {
        const userData = sys.localStorage.getItem('userData');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isGuest = false;
            } catch (error) {
                console.error('Failed to load user data:', error);
            }
        }
    }
}