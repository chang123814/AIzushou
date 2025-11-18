# 使用官方Node.js 16 LTS作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制所有文件到工作目录
COPY . .

# 暴露应用运行的端口
EXPOSE 3000

# 定义容器启动时运行的命令
CMD ["npm", "start"]
