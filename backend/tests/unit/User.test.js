const User = require('../../src/models/User');

describe('User Model', () => {
    describe('constructor', () => {
        it('should create user with valid data', () => {
            const user = new User('testuser', 'password123');
            
            expect(user.username).toBe('testuser');
            expect(user.password).toBe('password123');
            expect(user.userId).toMatch(/^user_\d+_[a-z0-9]+$/);
            expect(user.createdAt).toBeInstanceOf(Number);
        });
    });

    describe('validate', () => {
        it('should pass validation with valid data', () => {
            expect(() => {
                User.validate('testuser', 'password123');
            }).not.toThrow();
        });

        it('should throw error for empty username', () => {
            expect(() => {
                User.validate('', 'password123');
            }).toThrow('用户名和密码不能为空');
        });

        it('should throw error for empty password', () => {
            expect(() => {
                User.validate('testuser', '');
            }).toThrow('用户名和密码不能为空');
        });

        it('should throw error for short username', () => {
            expect(() => {
                User.validate('ab', 'password123');
            }).toThrow('用户名至少3个字符');
        });

        it('should throw error for short password', () => {
            expect(() => {
                User.validate('testuser', '12345');
            }).toThrow('密码至少6个字符');
        });
    });

    describe('toJSON', () => {
        it('should return user data without password', () => {
            const user = new User('testuser', 'password123');
            const json = user.toJSON();
            
            expect(json).toHaveProperty('userId');
            expect(json).toHaveProperty('username', 'testuser');
            expect(json).toHaveProperty('createdAt');
            expect(json).not.toHaveProperty('password');
        });
    });
});