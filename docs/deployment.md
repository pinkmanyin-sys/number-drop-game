# 部署指南

## AWS后端部署

1. 安装AWS CLI和SAM CLI
```bash
pip install aws-sam-cli
aws configure
```

2. 部署后端服务
```bash
cd backend
sam build
sam deploy --guided
```

3. 记录API Gateway URL用于前端配置

## 微信小程序发布

1. 在Cocos Creator中构建项目
   - 选择平台：微信小游戏
   - 构建路径：build/wechatgame

2. 使用微信开发者工具
   - 导入项目：选择build/wechatgame目录
   - 配置AppID
   - 上传代码审核

## 多平台发布

- **Web版本**：构建为Web平台，部署到CDN
- **移动端**：构建为原生应用，发布到应用商店
- **其他小程序**：支持字节跳动、百度等平台

## 配置要点

1. 修改NetworkManager中的API URL
2. 配置微信小程序域名白名单
3. 设置DynamoDB表权限
4. 配置CloudFront CDN（可选）