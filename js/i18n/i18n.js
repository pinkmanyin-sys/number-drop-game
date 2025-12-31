class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = {};
        this.loadTranslations();
    }

    detectLanguage() {
        // 从URL参数检测
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        if (langParam) {
            localStorage.setItem('preferred_language', langParam);
            return langParam;
        }

        // 从本地存储检测
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang) return savedLang;

        // 从浏览器语言检测
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) return 'zh';
        
        return 'en'; // 默认英文
    }

    async loadTranslations() {
        try {
            const response = await fetch(`js/i18n/${this.currentLang}.json`);
            this.translations = await response.json();
            this.updatePageContent();
        } catch (error) {
            console.warn('Failed to load translations, using fallback');
            // 使用内置翻译作为fallback
            this.translations = this.getFallbackTranslations();
            this.updatePageContent();
        }
    }

    getFallbackTranslations() {
        const fallbacks = {
            en: {
                "app_title": "Number Drop Game",
                "welcome_back": "Welcome back",
                "login": "Login",
                "register": "Register",
                "username": "Username",
                "password": "Password",
                "confirm_password": "Confirm Password",
                "start_game": "Start Game",
                "leaderboard": "Leaderboard",
                "settings": "Settings",
                "logout": "Logout",
                "game_over": "Game Over",
                "final_score": "Final Score",
                "play_again": "Play Again",
                "back_to_home": "Back to Home",
                "best_score": "Best Score",
                "games_played": "Games Played",
                "ranking": "Ranking",
                "swipe_to_control": "Swipe to control blocks, tap to drop",
                "score": "Score",
                "pause": "Pause",
                "resume": "Resume",
                "restart": "Restart"
            },
            zh: {
                "app_title": "数字掉落游戏",
                "welcome_back": "欢迎回来",
                "login": "登录",
                "register": "注册",
                "username": "用户名",
                "password": "密码",
                "confirm_password": "确认密码",
                "start_game": "开始游戏",
                "leaderboard": "排行榜",
                "settings": "设置",
                "logout": "退出登录",
                "game_over": "游戏结束",
                "final_score": "最终分数",
                "play_again": "再来一局",
                "back_to_home": "返回主页",
                "best_score": "最高分",
                "games_played": "游戏次数",
                "ranking": "排名",
                "swipe_to_control": "滑动控制方块，点击加速下落",
                "score": "分数",
                "pause": "暂停",
                "resume": "继续",
                "restart": "重新开始"
            }
        };
        return fallbacks[this.currentLang] || fallbacks.en;
    }

    t(key) {
        return this.translations[key] || key;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        this.loadTranslations();
        
        // 更新URL参数
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }

    updatePageContent() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // 更新所有带有 data-i18n-placeholder 属性的输入框
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // 更新页面标题
        if (document.querySelector('[data-i18n="app_title"]')) {
            document.title = this.t('app_title');
        }
    }

    getApiLanguage() {
        return this.currentLang === 'zh' ? 'zh' : 'en';
    }
}

// 全局实例
window.i18n = new I18n();