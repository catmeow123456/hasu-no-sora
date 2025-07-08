# 多阶段构建 Dockerfile
FROM node:18-alpine AS builder

# 接收代理参数
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

# 设置代理环境变量
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}

# 设置工作目录
WORKDIR /app

# 设置国内镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 复制 package.json 文件
COPY package.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/ui/package.json ./packages/ui/

# 使用 npm 替代 yarn 以避免 Corepack 网络问题
RUN npm install --production=false

# 复制源代码
COPY . .

# 设置 NODE_ENV 为 production 进行构建
ENV NODE_ENV=production

# 构建前端
RUN cd packages/ui && npm run build

# 构建后端
RUN cd packages/server && npm run build

# 生产阶段
FROM node:18-alpine AS production

# 接收代理参数
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

# 设置代理环境变量
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hasu -u 1001

# 设置工作目录
WORKDIR /app

# 设置国内镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 复制 package.json 文件
COPY package.json ./
COPY packages/server/package.json ./packages/server/

# 只安装服务器生产依赖
RUN cd packages/server && npm install --only=production && npm cache clean --force

# 复制构建后的文件
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist

# 创建音乐文件夹
RUN mkdir -p /app/music && chown -R hasu:nodejs /app

# 切换到非 root 用户
USER hasu

# 暴露端口
EXPOSE 8080

# 清理代理环境变量（运行时不需要）
ENV HTTP_PROXY=
ENV HTTPS_PROXY=
ENV NO_PROXY=

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080

# 启动命令
CMD ["node", "packages/server/dist/index.js"]
