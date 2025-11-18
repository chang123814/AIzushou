# 项目快速上手

本项目为微信小程序 + 云函数。核心页面位于 `pages/index/`，云函数在 `cloudfunctions/translate`。

## 目录结构
- `pages/` 小程序页面源码
- `app.*` 小程序入口配置与样式
- `utils/` 工具函数
- `cloudfunctions/translate` 翻译云函数（Node.js 18）
- `scripts/` 本地开发脚本（不会打包进小程序）
- `docs/` 文档

## 本地开发
1. 安装依赖（云函数目录）：
   ```powershell
   cd cloudfunctions/translate
   npm config set registry https://registry.npmmirror.com
   npm i
   ```
2. 微信开发者工具导入项目，选择本目录；项目详情里勾选“使用云开发”。

## 部署云函数（命令行）
```powershell
# 登录（首次）
tcb login
# 在项目根目录执行部署（或在函数目录，均可）
tcb functions:deploy translate -e cloud1-6guzdqjkd69a13fb
# 云端自测
tcb functions:invoke translate -e cloud1-6guzdqjkd69a13fb -p '{ "text": "在森林里的猫" }'
```

## 必要配置
- 云开发控制台 → 云函数 → translate → 配置：
  - 超时：15 秒；内存：256 MB
  - 环境变量：`ZHIPU_API_KEY=你的密钥`

## 常见问题
- 401/403：检查 `ZHIPU_API_KEY` 是否设置并重新部署
- FUNCTION_NOT_FOUND：确认部署到 `cloud1-6guzdqjkd69a13fb`，前端调用 env 一致
- 依赖缺失：在 `cloudfunctions/translate` 目录执行 `npm i` 后再部署
