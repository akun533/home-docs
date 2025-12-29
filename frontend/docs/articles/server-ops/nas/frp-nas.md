---
title: 飞牛OS 部署 Frp 内网穿透
icon: network-wired
date: 2025-12-29
category:
  - 服务器运维
  - NAS
tag:
  - Docker
  - Frp
  - 代理服务
  - NAS
---

## 部署需求

- 公网服务器一台（具备公网IP）
- 本地 NAS 服务器一台

## 服务器端部署

### 1. 下载并解压 Frp 服务端

1. 访问 [Frp 官方发布页面](https://github.com/fatedier/frp/releases) 下载适合您服务器架构的版本

2. 上传到服务器并解压：
   ```bash
   tar -xf frp_0.54.0_linux_amd64.tar.gz
   mv frp_0.54.0_linux_amd64 frp
   cd frp
   chmod +x frps
   ```

### 2. 配置服务端

编辑 [frps.toml](file:///C:/Users/yang/WebstormProjects/home-docs/frontend/docs/.vuepress/components/SiteStats.vue#L1-L35) 配置文件：

```toml
# 服务绑定的 IP 与端口
bindAddr = "0.0.0.0"
bindPort = 7000

# Web 仪表板配置
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "admin"

# 启用 Prometheus 监控指标
enablePrometheus = true

# Token 权限验证，需与客户端配置一致
auth.method = "token"
auth.token = "123456"

# 日志配置
log.to = "/app/frp/logs/frps.log"
log.level = "info"
log.maxDays = 3
```

> **安全提醒**：在生产环境中，请务必修改默认的仪表板用户名和密码，以及 Token 验证串，使用更复杂的密码组合。

### 3. 创建日志目录

根据配置文件中指定的路径创建日志目录：

```bash
mkdir -p /app/frp/logs
```

### 4. 启动服务端

有以下几种启动方式：

1. **命令行方式启动**：
   ```bash
   ./frps -c ./frps.toml
   ```

2. **后台运行方式**：
   ```bash
   nohup ./frps -c ./frps.toml &> /dev/null &
   ```

3. **使用 systemd 管理服务**（推荐）：
   
   创建服务配置文件：
   ```bash
   sudo vi /etc/systemd/system/frps.service
   ```
   
   填入以下内容：
   ```ini
   [Unit]
   Description=Frp Server Service
   After=network.target syslog.target
   Wants=network.target
   
   [Service]
   Type=simple
   Restart=on-failure
   RestartSec=5
   ExecStart=/app/frp/frps -c /app/frp/frps.toml
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   启动并启用服务：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start frps
   sudo systemctl enable frps
   ```

## 客户端配置（本地 NAS）

### 1. 安装 Frp 客户端

在飞牛 NAS 的应用中心下载并安装 Frp 客户端应用。

### 2. 配置客户端

打开 Frp 客户端，修改配置文件：

```toml
# 服务器公网 IP
serverAddr = "x.x.x.x"

# 服务端口
serverPort = 7000

# 不要删除此配置，否则连接不上会闪退
loginFailExit = false

# Token 权限验证，需与服务端配置一致
auth.method = "token"
auth.token = "123456"

# 配置端口映射，将服务器的端口转发到本地端口，可配置多个
[[proxies]]
name = "fnOs"              # 连接名称
type = "tcp"               # 代理类型
localIP = "127.0.0.1"      # 本地 IP
localPort = 5666           # 内网服务监听的端口
remotePort = 25666         # 需要在公网服务器上监听的端口

[[proxies]]
name = "example-udp"       # 连接名称
type = "udp"               # 代理类型
localIP = "127.0.0.1"      # 本地 IP
localPort = 9999           # 内网服务监听的端口
remotePort = 29999         # 需要在公网服务器上监听的端口
```

### 3. 保存配置并启动

保存配置后，启动 Frp 客户端服务。可以通过以下方式验证连接状态：

在浏览器中访问：`http://公网IP:7500`，使用之前设置的用户名和密码登录查看连接状态。

## 防火墙配置

需要在公网服务器上配置防火墙规则，开放以下端口：

- **7000 端口**：Frp 服务端口（TCP）
- **7500 端口**：Frp 仪表板端口（TCP）
- **25666 端口**：示例中的 NAS 访问端口（TCP）
- **29999 端口**：示例中的 UDP 服务端口（UDP）

根据您的实际配置，相应地在防火墙中添加放行规则。

## 使用验证

配置完成后，可以通过公网 IP 和映射的端口访问本地 NAS 服务。例如，飞牛 APP 可以通过 `公网IP:25666` 的方式进行访问。

## 注意事项

1. **安全性**：生产环境务必使用强密码和复杂的 Token 验证串
2. **端口规划**：合理规划端口使用，避免冲突
3. **日志监控**：定期检查日志，确保服务正常运行
4. **网络环境**：确保网络连接稳定，避免频繁断线重连]()