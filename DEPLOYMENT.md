# Hasu no Sora 音乐播放器 - 生产部署指南

## 🚀 快速部署

### 使用 Docker Compose（推荐）

1. **构建并启动容器**
   ```bash
   yarn docker:compose:up
   ```

2. **访问应用**
   打开浏览器访问：`http://localhost:8080`

3. **查看日志**
   ```bash
   yarn docker:compose:logs
   ```

4. **停止服务**
   ```bash
   yarn docker:compose:down
   ```

### 使用 Docker 命令

1. **构建镜像**
   ```bash
   yarn docker:build
   ```

2. **运行容器**
   ```bash
   yarn docker:run
   ```

## 📋 部署要求

### 系统要求
- Docker >= 20.10.0
- Docker Compose >= 2.0.0
- 至少 512MB 可用内存
- 至少 1GB 可用磁盘空间

### 音乐文件
- 将音乐文件放在项目根目录的 `music/` 文件夹中
- 支持的音频格式：`.mp3`, `.wav`, `.flac`, `.m4a`, `.ogg`
- 支持的封面格式：`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🔧 配置选项

### 环境变量
- `NODE_ENV`: 运行环境（默认：production）
- `PORT`: 服务端口（默认：8080）

### 音乐文件组织
```
music/
├── Album Name 1/
│   ├── 01 Track Name.mp3
│   ├── 02 Track Name.mp3
│   └── Folder.jpg          # 专辑封面
├── Album Name 2/
│   ├── 01 Track Name.mp3
│   └── cover.png           # 专辑封面
└── ...
```

## 🌐 访问路径

- **主应用**: `http://localhost:8080`
- **API 健康检查**: `http://localhost:8080/api/health`
- **专辑列表 API**: `http://localhost:8080/api/albums`

## 🔍 故障排除

### 常见问题

1. **容器无法启动**
   ```bash
   # 检查容器状态
   docker ps -a
   
   # 查看容器日志
   docker logs hasu-no-sora-player
   ```

2. **音乐文件无法加载**
   - 确保 `music/` 文件夹存在且包含音乐文件
   - 检查文件权限（容器内用户需要读取权限）
   - 确认音频文件格式受支持

3. **前端页面无法访问**
   - 确认访问路径为根路径 `/`
   - 检查端口 8080 是否被占用
   - 查看浏览器开发者工具的网络请求

### 日志查看

```bash
# 查看实时日志
yarn docker:compose:logs

# 查看特定服务日志
docker-compose logs hasu-no-sora

# 查看最近的日志
docker-compose logs --tail=50 hasu-no-sora
```

## 🔒 安全考虑

### 生产环境建议
- 使用反向代理（如 Nginx）
- 启用 HTTPS
- 设置防火墙规则
- 定期更新 Docker 镜像

### 网络安全
- 容器运行在非 root 用户下
- 音乐文件以只读模式挂载
- 只暴露必要的端口（8080）

## 📊 性能优化

### 缓存策略
- API 响应缓存：5-10 分钟
- 静态文件缓存：1 小时
- 音频文件缓存：1 天

### 资源限制
```yaml
# docker-compose.yml 中添加资源限制
services:
  hasu-no-sora:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## 🔄 更新部署

### 更新应用
1. 拉取最新代码
2. 重新构建镜像
3. 重启容器

```bash
git pull
yarn docker:compose:down
yarn docker:compose:up --build -d
```

### 备份音乐库
```bash
# 备份音乐文件
tar -czf music-backup-$(date +%Y%m%d).tar.gz music/

# 恢复音乐文件
tar -xzf music-backup-YYYYMMDD.tar.gz
```

## 📈 监控和维护

### 健康检查
- 容器自带健康检查，每 30 秒检查一次
- API 端点：`/api/health`
- 检查音乐库扫描状态

### 日志轮转
```bash
# 清理旧日志
docker system prune -f

# 限制日志大小
# 在 docker-compose.yml 中添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🆘 支持

如遇到问题，请检查：
1. Docker 和 Docker Compose 版本
2. 系统资源使用情况
3. 网络连接状态
4. 音乐文件格式和权限

更多技术细节请参考项目的 README.md 文件。
