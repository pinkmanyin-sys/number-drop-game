import { _decorator, Component, Node, EditBox, Button, Label } from 'cc';
import { UserManager } from './UserManager';
import { LeaderboardManager } from './LeaderboardManager';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    @property(Node)
    loginPanel: Node = null;

    @property(Node)
    registerPanel: Node = null;

    @property(Node)
    mainMenuPanel: Node = null;

    @property(EditBox)
    loginUsername: EditBox = null;

    @property(EditBox)
    loginPassword: EditBox = null;

    @property(EditBox)
    registerUsername: EditBox = null;

    @property(EditBox)
    registerPassword: EditBox = null;

    @property(EditBox)
    confirmPassword: EditBox = null;

    @property(Label)
    messageLabel: Label = null;

    @property(Button)
    loginButton: Button = null;

    @property(Button)
    registerButton: Button = null;

    @property(Button)
    guestButton: Button = null;

    @property(LeaderboardManager)
    leaderboardManager: LeaderboardManager = null;

    start() {
        this.setupButtons();
        this.showLoginPanel();
        
        // 如果用户已登录，直接进入主菜单
        if (UserManager.getInstance().isUserLoggedIn()) {
            this.showMainMenu();
        }
    }

    setupButtons() {
        this.loginButton.node.on('click', this.onLoginClick, this);
        this.registerButton.node.on('click', this.onRegisterClick, this);
        this.guestButton.node.on('click', this.onGuestClick, this);
    }

    async onLoginClick() {
        const username = this.loginUsername.string.trim();
        const password = this.loginPassword.string.trim();

        if (!username || !password) {
            this.showMessage('Please enter username and password');
            return;
        }

        this.showMessage('Logging in...');
        const success = await UserManager.getInstance().login(username, password);

        if (success) {
            this.showMessage('Login successful!');
            this.showMainMenu();
        } else {
            this.showMessage('Invalid username or password');
        }
    }

    async onRegisterClick() {
        if (this.registerPanel.active) {
            // 执行注册
            const username = this.registerUsername.string.trim();
            const password = this.registerPassword.string.trim();
            const confirm = this.confirmPassword.string.trim();

            if (!username || !password || !confirm) {
                this.showMessage('Please fill all fields');
                return;
            }

            if (password !== confirm) {
                this.showMessage('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                this.showMessage('Password must be at least 6 characters');
                return;
            }

            this.showMessage('Registering...');
            const success = await UserManager.getInstance().register(username, password);

            if (success) {
                this.showMessage('Registration successful!');
                this.showMainMenu();
            } else {
                this.showMessage('Username already exists');
            }
        } else {
            // 显示注册面板
            this.showRegisterPanel();
        }
    }

    onGuestClick() {
        UserManager.getInstance().playAsGuest();
        this.showMainMenu();
    }

    showLoginPanel() {
        this.loginPanel.active = true;
        this.registerPanel.active = false;
        this.mainMenuPanel.active = false;
        this.clearMessage();
    }

    showRegisterPanel() {
        this.loginPanel.active = false;
        this.registerPanel.active = true;
        this.mainMenuPanel.active = false;
        this.clearMessage();
    }

    showMainMenu() {
        this.loginPanel.active = false;
        this.registerPanel.active = false;
        this.mainMenuPanel.active = true;
        this.clearMessage();
        
        // 加载排行榜
        if (this.leaderboardManager) {
            this.leaderboardManager.loadLeaderboard();
        }
    }

    showMessage(message: string) {
        if (this.messageLabel) {
            this.messageLabel.string = message;
            this.messageLabel.node.active = true;
        }
    }

    clearMessage() {
        if (this.messageLabel) {
            this.messageLabel.string = '';
            this.messageLabel.node.active = false;
        }
    }

    onBackToLogin() {
        this.showLoginPanel();
    }

    onLogout() {
        UserManager.getInstance().logout();
        this.showLoginPanel();
    }
}