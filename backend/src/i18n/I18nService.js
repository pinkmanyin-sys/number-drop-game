const en = require('./en.json');
const zh = require('./zh.json');

class I18nService {
    constructor() {
        this.languages = { en, zh };
        this.defaultLanguage = 'en';
    }

    t(key, lang = this.defaultLanguage) {
        const language = this.languages[lang] || this.languages[this.defaultLanguage];
        return this.getNestedValue(language, key) || key;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    detectLanguage(req) {
        // 从请求头检测语言
        const acceptLanguage = req.headers['accept-language'];
        if (acceptLanguage) {
            if (acceptLanguage.includes('zh')) return 'zh';
            if (acceptLanguage.includes('en')) return 'en';
        }
        
        // 从查询参数检测
        if (req.query.lang) {
            return req.query.lang;
        }
        
        return this.defaultLanguage;
    }

    middleware() {
        return (req, res, next) => {
            req.lang = this.detectLanguage(req);
            req.t = (key) => this.t(key, req.lang);
            next();
        };
    }
}

module.exports = I18nService;