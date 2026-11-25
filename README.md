<p align="center">
  <img src="./assets/prod/t3-black-web-icon-192x192.png" width="80" height="80" alt="T3 Code logo" />
</p>

<h1 align="center">T3 Code (No Telemetry)</h1>

<p align="center">
  基于上游 <a href="https://github.com/pingdotgg/t3code">pingdotgg/t3code</a> 正式稳定版维护的<strong>去遥测纯净分支</strong>，提供 GitHub Actions 自动构建的 macOS Apple Silicon (<code>arm64</code>) 安装包。
</p>

<p align="center">
  <a href="https://github.com/wwoodfox/t3code/releases"><strong>下载 macOS arm64 安装包</strong></a> ·
  <a href="https://github.com/wwoodfox/t3code/compare/v0.1.11...no-telemetry-v0.1.11">查看相对 v0.1.11 的完整改动</a> ·
  <a href="https://github.com/wwoodfox/t3code/actions/workflows/build-macos-arm64.yml">GitHub Actions 构建</a> ·
  <a href="./docs/README.md">原版文档</a>
</p>

---

## 项目目标

[T3 Code](https://github.com/pingdotgg/t3code) 是一款优秀的本地编程 Agent 控制面板（支持 Claude Code、Codex、Cursor、OpenCode、ACP 等），但官方版本内置了产品使用遥测、账号/设备指纹收集以及外部追踪上报。

本 Fork 的目标很明确：
1. **彻底去除源码中的遥测与外部上报**（并非仅靠环境变量开关屏蔽），让所有工作流和凭据仅停留在本地。
2. **仅追踪上游正式稳定版**，清理无关的 nightly / preview 标签与开发分支，保持仓库结构干净、易于审计每版 diff。
3. **通过 GitHub Actions 透明构建 macOS Apple Silicon (`arm64`) 客户端**，并在 CI 阶段自动审计产物零遥测与纯 `arm64` 架构。

---

## 相对上游的修改内容

### 1. 移除遥测、行为分析与指纹收集
- **删除 PostHog 产品分析模块**：完整删除 `apps/server/src/telemetry/` 目录下全部文件（`AnalyticsService`、`ProviderUsageAnalytics`、`DelegatedTaskAnalytics`、`FeatureUsage`、`ProviderDimensions` 等）及 `packages/shared/src/telemetryId.ts`，彻底移除 `ingest.t3.codes` 上报端点与内置 PostHog Key。
- **删除账号与设备指纹采集**：移除 `Identify.ts`，不再读取 `~/.codex/auth.json`、`~/.claude.json` 或解析 OpenAI JWT 提取用户标识，不再在本地目录写入 `anonymous-id`。
- **移除客户端追踪标识**：移除 Web/移动端 `localStorage` 设备指纹 `t3code:analytics-device-id`（`AnalyticsDevice`）以及 WebSocket 连接查询参数中的 `clientOwner` / `clientDevice`。
- **移除外部 Tracing 与崩溃上报**：移除 server / desktop / web / mobile 中的 Axiom OTLP relay tracing 上报与移动端 `expo-observe` 崩溃上报。
- **移除默认云端认证外联**：构建流程默认不注入 `.env.example` 中的 Clerk / T3 Connect 配置，启动时不会外联 `clerk.t3.codes` 或 `relay.t3.codes`（如需启用可在手动触发 workflow 时勾选 `enable_t3_connect`）。
- **清理界面提示**：移除首次引导页的遥测声明横幅，更新设置页中的隐私说明。

### 2. 保留的核心功能
- 完整保留本地编程 Agent 管理、多模型切换、Git worktree / diff、本地/SSH/Tailscale 连接、本地日志，以及本地进程资源监控（`native/resource-monitor` / `resourceTelemetry`）。
- 桌面端自动更新源已随仓库指向本 Fork（`wwoodfox/t3code`），不会自动覆盖回上游官方版本。

### 3. 新增构建与审计工作流
- 新增 [`.github/workflows/build-macos-arm64.yml`](./.github/workflows/build-macos-arm64.yml)，并微调 [`scripts/build-desktop-artifact.ts`](./scripts/build-desktop-artifact.ts) 以支持在 GitHub 托管 macOS runner 上稳定交叉构建原生 `arm64` 产物。
- 每次构建都会自动执行：
  - **源码与产物零遥测扫描**：检查源码、`apps/server/dist`、`apps/desktop/dist-electron`、`apps/web/dist` 以及最终打包进 DMG 的 `app.asar`，确认不存在遥测域名、Key 或事件名残留。
  - **架构校验**：挂载生成的 DMG，使用 `lipo -archs` 逐一验证主程序 `T3 Code`、`t3-resource-monitor` 及所有 `.node` / `.dylib` 原生二进制均为 `arm64`。

---

## 分支与标签约定

为保持仓库干净，本 Fork 仅保留上游正式稳定版基线及对应的去遥测版本：

| 分支 / 标签 | 说明 |
| --- | --- |
| `v0.1.11` | 上游正式稳定版 `v0.1.11` 原始基线，便于直接对比改动 |
| `no-telemetry-v0.1.11` | 基于 `v0.1.11` 的去遥测稳定版（默认分支与 Release 标签） |
| 后续版本（如 `v0.1.12`、`no-telemetry-v0.1.12`） | 上游发布新正式稳定版后按相同命名规则跟进 |

---

## 下载与安装（macOS Apple Silicon）

1. 前往 [Releases](https://github.com/wwoodfox/t3code/releases) 下载对应版本的 `T3-Code-<version>-arm64.dmg`（或 `.zip`）以及 `SHA256SUMS.txt`。
2. 打开 `.dmg`，将 **T3 Code** 拖入 `/Applications`（应用程序）。
3. **首次启动说明**：由于安装包由 GitHub Actions 使用 ad-hoc 签名（无 Apple Developer ID 证书），首次打开时若 macOS 提示“已损坏”或“无法验证开发者”，请在终端运行一次以下命令清除隔离属性：

```bash
xattr -cr "/Applications/T3 Code.app"
```

---

## 通过 GitHub Actions 构建新版本

- **手动触发**：进入仓库的 **Actions → Build macOS arm64 (No Telemetry) → Run workflow**，可自定义：
  - `version`：写入安装包的版本号（例如 `0.1.11`、`0.1.12`）
  - `create_release`：是否自动发布/更新对应的 `no-telemetry-v<version>` GitHub Release（默认 `true`）
  - `enable_t3_connect`：是否包含公开的 T3 Connect / Clerk 配置（默认 `false`）
  - `runner`：选择构建环境（默认 `macos-15-intel` 交叉编译原生 `arm64`，避开 GitHub `arm64` 托管池排队拥堵；也可选 `macos-26` / `macos-15`）
- **标签触发**：推送符合 `no-telemetry-*` 格式的标签（如 `no-telemetry-v0.1.12`）即可自动构建并发布 Release。

---

## 上游项目与许可协议

- 上游项目：[pingdotgg/t3code](https://github.com/pingdotgg/t3code)
- 开源协议：[MIT](./LICENSE)
