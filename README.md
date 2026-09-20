# App Legal & Support

这是一个无构建步骤的静态站点，用于集中发布各 App 的隐私政策、使用条款和支持信息。当前目录包含 AlignerDiary 的三份公开文档，以及供后续 App 复用的页面模板。

## 目录

```text
.
├── index.html                 # App 目录首页
├── assets/
│   ├── style.css              # 全站共享样式
│   └── favicon.svg            # 全站图标
├── apps/
│   ├── alignerdiary/          # AlignerDiary 的公开文档
│   └── _template/             # 新 App 页面模板（不显示在首页）
├── DESIGN.md                  # 视觉与功能规范
├── PROJECT.md                 # 项目事实与维护边界
└── AGENTS.md                  # 本项目开发约定
```

## 本地预览

可以直接打开 `index.html`。如需核对与 GitHub Pages 更接近的链接行为，可在项目根目录启动任意静态文件服务器。以下是需要预先安装 Python 3 的可选示例，本项目未在当前环境验证该命令：

```powershell
python -m http.server 8000
```

随后访问 `http://localhost:8000/`。项目没有运行时依赖、包管理器或构建步骤。

## 添加 App

1. 复制 `apps/_template/` 为 `apps/your-app-name/`。
2. 替换 `APP_NAME`、`LAST_UPDATED`、`YOUR_EMAIL`、`APP_PURPOSE` 和各数据处理段落令牌。
3. 按真实 App 行为核对隐私政策和条款内容。
4. 在 `index.html` 中复制 AlignerDiary 的 App 面板，并更新名称、描述和相对链接。
5. 从首页逐一打开新页面，检查返回链接、页间导航、键盘焦点和窄屏布局。

每个 App 的路径应保持稳定：

```text
apps/<app-slug>/privacy.html
apps/<app-slug>/terms.html
apps/<app-slug>/support.html
```

## 发布前检查

`YOUR_EMAIL` 当前仍存在于 AlignerDiary 和模板页面中，是明确的发布前置条件，不代表可用的联系地址。发布前必须替换为经确认的邮箱，并再次检查 `mailto:` 链接。

还需根据 App 的真实行为确认开发者后端、分析或崩溃 SDK、账户注册、广告 SDK、位置、照片/健康/联系人数据、iCloud/CloudKit 和应用内购买。隐私页面必须与实际行为及 App Store Connect 的 App Privacy 答案一致。

## GitHub Pages

本项目计划通过 GitHub Pages 托管，但此目录本身不表示已部署。仓库建立并推送后，可在 GitHub 的 `Settings → Pages → Build and deployment` 中选择从 `main` 分支的 `/ (root)` 发布。

若仓库名为 `app-legal`，预期地址形如：

```text
https://YOUR_GITHUB_USERNAME.github.io/app-legal/
https://YOUR_GITHUB_USERNAME.github.io/app-legal/apps/alignerdiary/privacy.html
https://YOUR_GITHUB_USERNAME.github.io/app-legal/apps/alignerdiary/terms.html
https://YOUR_GITHUB_USERNAME.github.io/app-legal/apps/alignerdiary/support.html
```
