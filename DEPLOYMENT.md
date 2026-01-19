# 部署指南

本文档介绍如何将这个 Vue 3 项目部署到各种服务器。

## 一、构建生产版本

在部署之前，首先需要构建生产版本：

```bash
npm install
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，其中包含所有需要部署的静态文件。

## 二、部署方式

### 方式 1: 使用 Nginx（推荐）

#### 步骤 1: 安装 Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
# 或
sudo dnf install nginx
```

#### 步骤 2: 复制构建文件

```bash
# 将 dist 目录内容复制到 Nginx 网站根目录
sudo cp -r dist/* /var/www/html/

# 或者创建自定义目录
sudo mkdir -p /var/www/portfolio
sudo cp -r dist/* /var/www/portfolio/
```

#### 步骤 3: 配置 Nginx

创建或编辑 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/portfolio
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    root /var/www/portfolio;  # 替换为你的实际路径
    index index.html;

    # 支持 Vue Router 的 History 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

#### 步骤 4: 启用配置并重启 Nginx

```bash
# 创建符号链接（如果使用 sites-available）
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 步骤 5: 配置防火墙（如需要）

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 'Nginx Full'

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 方式 2: 使用 Apache

#### 步骤 1: 安装 Apache

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install apache2
```

**CentOS/RHEL:**
```bash
sudo yum install httpd
```

#### 步骤 2: 复制构建文件

```bash
sudo cp -r dist/* /var/www/html/
```

#### 步骤 3: 启用 mod_rewrite

```bash
sudo a2enmod rewrite  # Ubuntu/Debian
# 或编辑 /etc/httpd/conf/httpd.conf，取消注释 LoadModule rewrite_module (CentOS)
```

#### 步骤 4: 配置 Apache

编辑或创建虚拟主机配置：

```bash
sudo nano /etc/apache2/sites-available/portfolio.conf
```

添加以下配置：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/portfolio

    <Directory /var/www/portfolio>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # 支持 Vue Router History 模式
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 静态资源缓存
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
    </IfModule>
</VirtualHost>
```

#### 步骤 5: 启用站点并重启 Apache

```bash
sudo a2ensite portfolio.conf
sudo systemctl restart apache2
sudo systemctl enable apache2
```

### 方式 3: 使用 Node.js 服务器（如 Express）

#### 步骤 1: 安装 Express

```bash
npm install express
```

#### 步骤 2: 创建服务器文件 `server.js`

```javascript
const express = require('express');
const path = require('path');
const app = express();

// 提供静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 支持 Vue Router History 模式
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 8805;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

#### 步骤 3: 更新 package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 步骤 4: 运行服务器

```bash
npm run build
npm start
```

#### 步骤 5: 使用 PM2 进行进程管理（生产环境推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name portfolio

# 设置开机自启
pm2 startup
pm2 save
```

### 方式 4: 使用 Docker

#### 步骤 1: 创建 `Dockerfile`

```dockerfile
# 构建阶段
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 步骤 2: 创建 `nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 步骤 3: 构建和运行 Docker 容器

```bash
# 构建镜像
docker build -t portfolio .

# 运行容器
docker run -d -p 8805:80 --name portfolio portfolio
```

### 方式 5: 使用 Vercel / Netlify / Cloudflare Pages（静态托管）

#### Vercel

1. 安装 Vercel CLI: `npm i -g vercel`
2. 在项目根目录运行: `vercel`
3. 或通过 GitHub 连接，自动部署

#### Netlify

1. 安装 Netlify CLI: `npm install -g netlify-cli`
2. 构建项目: `npm run build`
3. 部署: `netlify deploy --prod --dir=dist`
4. 或通过 GitHub 连接，设置构建命令为 `npm run build`，发布目录为 `dist`

#### Cloudflare Pages

1. 连接 GitHub 仓库
2. 设置构建命令: `npm run build`
3. 设置输出目录: `dist`
4. 设置 Node.js 版本: 18 或更高

## 三、配置 HTTPS（SSL 证书）

### 使用 Let's Encrypt (Certbot)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx  # Nginx
# 或
sudo apt install certbot python3-certbot-apache  # Apache

# 获取证书
sudo certbot --nginx -d your-domain.com
# 或
sudo certbot --apache -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

## 四、环境变量配置

如果项目需要环境变量，在服务器上创建 `.env.production` 文件：

```bash
# 在构建之前创建
nano .env.production
```

然后在构建时使用：
```bash
npm run build
```

## 五、常见问题

### 1. Vue Router 路由 404 错误

确保 Web 服务器配置了重写规则，将所有请求重定向到 `index.html`（参考上面的 Nginx/Apache 配置）。

### 2. 静态资源路径错误

检查 `vite.config.js` 中的 `base` 配置：
- 如果部署在根目录: `base: '/'`
- 如果部署在子目录: `base: '/your-subdirectory/'`

### 3. API 请求跨域问题

在 `vite.config.js` 中配置代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-api-server.com',
      changeOrigin: true
    }
  }
}
```

生产环境需要在 Nginx 中配置：

```nginx
location /api {
    proxy_pass http://your-api-server.com;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 六、部署检查清单

- [ ] 构建生产版本 (`npm run build`)
- [ ] 检查 `dist` 目录是否包含所有必要文件
- [ ] 配置 Web 服务器（Nginx/Apache）
- [ ] 配置 Vue Router History 模式支持
- [ ] 测试所有路由是否正常工作
- [ ] 配置静态资源缓存
- [ ] 配置 HTTPS（如需要）
- [ ] 配置域名 DNS 解析
- [ ] 测试移动端访问
- [ ] 配置防火墙规则
- [ ] 设置监控和日志

## 七、自动化部署（CI/CD）

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
    - name: Deploy to server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        source: "dist/*"
        target: "/var/www/portfolio"
```

