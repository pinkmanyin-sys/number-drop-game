// 轻量级国际化系统 - 不影响核心功能
class Lang {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.translations = {
            en: {
                // Login page
                app_title: 'Number Drop Game',
                username: 'Username',
                password: 'Password',
                login: 'Login',
                register: 'Register',
                guest_play: 'Try Now',
                
                // Game page
                score: 'Score',
                pause: 'Pause',
                resume: 'Resume',
                restart: 'Restart',
                game_over: 'Game Over',
                play_again: 'Play Again',
                back_to_home: 'Back to Home',
                
                // Start page
                welcome_back: 'Welcome back',
                best_score: 'Best Score',
                games_played: 'Games Played',
                ranking: 'Ranking',
                start_game: 'Start Game',
                leaderboard: 'Leaderboard',
                settings: 'Settings',
                logout: 'Logout'
            },
            zh: {
                // Login page
                app_title: '数字掉落游戏',
                username: '用户名',
                password: '密码',
                login: '登录',
                register: '注册',
                guest_play: '试玩体验',
                
                // Game page
                score: '分数',
                pause: '暂停',
                resume: '继续',
                restart: '重新开始',
                game_over: '游戏结束',
                play_again: '再来一局',
                back_to_home: '返回主页',
                
                // Start page
                welcome_back: '欢迎回来',
                best_score: '最高分',
                games_played: '游戏次数',
                ranking: '排名',
                start_game: '开始游戏',
                leaderboard: '排行榜',
                settings: '设置',
                logout: '退出登录'
            }
        };
    }
    
    t(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }
    
    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.updatePage();
    }
    
    updatePage() {
        // 安全更新页面文本，不影响功能
        try {
            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.getAttribute('data-lang');
                if (key && this.t(key)) {
                    el.textContent = this.t(key);
                }
            });
        } catch (e) {
            // 静默失败，不影响功能
        }
    }
}

// 全局实例
window.Lang = new Lang();