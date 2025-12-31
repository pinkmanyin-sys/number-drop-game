const UserService = require('../../src/services/UserService');

describe('UserService', () => {
    let userService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('register', () => {
        it('should register new user successfully', async () => {
            const user = await userService.register('testuser', 'password123');
            
            expect(user.username).toBe('testuser');
            expect(user.userId).toBeDefined();
            expect(userService.users).toHaveLength(1);
        });

        it('should throw error for duplicate username', async () => {
            await userService.register('testuser', 'password123');
            
            await expect(
                userService.register('testuser', 'password456')
            ).rejects.toThrow('用户名已存在');
        });

        it('should throw error for invalid data', async () => {
            await expect(
                userService.register('ab', 'password123')
            ).rejects.toThrow('用户名至少3个字符');
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            await userService.register('testuser', 'password123');
        });

        it('should login with correct credentials', async () => {
            const user = await userService.login('testuser', 'password123');
            
            expect(user.username).toBe('testuser');
        });

        it('should throw error for wrong password', async () => {
            await expect(
                userService.login('testuser', 'wrongpassword')
            ).rejects.toThrow('用户名或密码错误');
        });

        it('should throw error for non-existent user', async () => {
            await expect(
                userService.login('nonexistent', 'password123')
            ).rejects.toThrow('用户名或密码错误');
        });

        it('should throw error for empty credentials', async () => {
            await expect(
                userService.login('', '')
            ).rejects.toThrow('用户名和密码不能为空');
        });
    });

    describe('findByUsername', () => {
        it('should find existing user', async () => {
            await userService.register('testuser', 'password123');
            const user = userService.findByUsername('testuser');
            
            expect(user.username).toBe('testuser');
        });

        it('should return undefined for non-existent user', () => {
            const user = userService.findByUsername('nonexistent');
            
            expect(user).toBeUndefined();
        });
    });
});