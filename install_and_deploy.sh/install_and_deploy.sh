#!/bin/bash
set -e

# 一键部署脚本（CentOS/veLinux 兼容）
APP_DIR="/opt/translate-app"
GIT_REPO="https://github.com/example/translate-backend.git"  # 无代码时会用示例后端
BRANCH="main"
APP_PORT=3000
DOMAIN="www.qinghanju.cn"
SSL_DIR="/etc/ssl/ai"

echo "开始：安装依赖并准备环境..."

# 基础工具
yum install -y epel-release >/dev/null 2>&1 || true
yum install -y curl wget git unzip vim lsof || true

# 安装 Node 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装 nginx
yum install -y nginx
systemctl enable nginx
systemctl start nginx

# 安装 pm2
npm install -g pm2

# 创建应用目录
mkdir -p $APP_DIR
chown -R $(whoami):$(whoami) $APP_DIR

# 克隆或创建示例应用
if [ -d "$APP_DIR/.git" ]; then
  echo "仓库已存在，更新代码..."
  cd $APP_DIR
  git fetch --all
  git reset --hard origin/$BRANCH || true
else
  echo "尝试克隆仓库或创建示例应用..."
  if git ls-remote $GIT_REPO &>/dev/null; then
    git clone -b $BRANCH $GIT_REPO $APP_DIR || true
  fi

  if [ ! -f "$APP_DIR/server.js" ]; then
    echo "创建示例后端（Express）..."
    rm -rf $APP_DIR
    mkdir -p $APP_DIR
    cat > $APP_DIR/server.js <<'NODE'
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.post('/translate', (req,res)=> {
  const text = (req.body && req.body.text) || '';
  res.json({ translated: '[TRANSLATED] ' + text });
});
app.get('/healthz', (req,res)=>res.send('ok'));
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('server listening', port));
NODE
    cd $APP_DIR
    npm init -y
    npm install express body-parser
  fi
fi

cd $APP_DIR

# 安装依赖
if [ -f package.json ]; then
  npm ci --production || npm install --production || true
fi

# SSL 目录
mkdir -p $SSL_DIR
chmod 700 $SSL_DIR

# 生成 .env 模板（请根据需要修改）
ENV_FILE="$APP_DIR/.env"
cat > $ENV_FILE <<EOF
# 最小 .env
PORT=${APP_PORT}
NODE_ENV=production
# TRANSLATE_API_KEY=
# DB_URL=
EOF
chmod 600 $ENV_FILE

# 启动应用（pm2）
APP_NAME="translate-app"
if pm2 list | grep -q "$APP_NAME"; then
  pm2 delete "$APP_NAME" || true
fi
if [ -f package.json ] && grep -q "\"start\"" package.json; then
  pm2 start npm --name "$APP_NAME" -- start
else
  pm2 start server.js --name "$APP_NAME"
fi
pm2 save

# nginx 配置
NGINX_CONF="/etc/nginx/conf.d/translate.conf"
cat > $NGINX_CONF <<NGX
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl;
    server_name ${DOMAIN};

    ssl_certificate ${SSL_DIR}/${DOMAIN}.pem;
    ssl_certificate_key ${SSL_DIR}/${DOMAIN}.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    keepalive_timeout 65;

    access_log /var/log/nginx/translate.access.log;
    error_log /var/log/nginx/translate.error.log;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
    }

    location /healthz {
        proxy_pass http://127.0.0.1:${APP_PORT}/healthz;
    }
}
NGX

# 检查 nginx 配置并重启
nginx -t
systemctl restart nginx

echo "完成：请确认已上传证书到 $SSL_DIR 并命名为 ${DOMAIN}.key 与 ${DOMAIN}.pem"
echo "检查：pm2 status； curl -k https://${DOMAIN}/healthz"
