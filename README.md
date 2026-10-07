# App Legal & Support

面向 GitHub Pages 的静态应用政策与支持站。当前公开目录只有 AlignerDiary；首页还展示 Light 与 Smart 两个分类，Smart 明确标为暂无应用。站点提供英语、简体中文和日语完整页面，英语沿用原有 URL，另两种语言使用同目录 `.zh-Hans.html`、`.ja.html` 后缀。站内导航与语言链接均为相对地址，在域名根路径和仓库子路径下可用。

部署文件是纯 HTML、CSS、SVG、本地字体和一段渐进式 JavaScript，没有远程运行依赖或框架。直接打开 `index.html` 可阅读英语；三语页面及切换链接在禁用 JavaScript 时也可用。`assets/site-language.js` 仅记住访客选择，存储不可用时不影响阅读和导航。

## 维护入口

- `assets/site-config.js`：**唯一维护的真实联系邮箱**。修改后运行生成脚本；生成 HTML 中重复的地址是输出，不是多个手工来源。`apps/_template/` 的 `YOUR_EMAIL` 是必须保留的模板令牌。
- `index.html` 与 `apps/alignerdiary/{privacy,terms,support}.html`：英语首页布局和三份英语正文来源。正式文档日期为 2026-09-20；改变法律事实或日期须有明确依据。
- `assets/i18n.js`：三语页面标题、meta、导航和首页文案；`assets/locales/zh-Hans.js`、`ja.js`：正式文档全文及模板文本的翻译。模板令牌须在所有语言保持原样。
- `assets/style.css`、本地图标/字体：共享视觉资源。`apps/_template/` 仅作新 App 模板，不在首页列出；复制后必须按新 App 的真实行为重写法律条款。

需要预装 Node.js 才执行以下**维护**命令；托管和访客浏览不需要 Node，也不安装 npm 包。在站点根目录运行：

```powershell
node scripts/build-site.cjs
node scripts/build-site.cjs --check
node scripts/check-site.cjs
```

第一条同步邮箱并生成 21 个静态页面；`--check` 检查生成结果未漂移，第三条检查页面语言、内部链接、锚点、文档结构、邮箱、模板令牌与基础故障情况。可直接打开页面预览，或在根目录启动任意静态文件服务器，确认部署到仓库子路径时的链接行为。

## 固定公开路径

```text
index.html
apps/alignerdiary/privacy.html
apps/alignerdiary/terms.html
apps/alignerdiary/support.html
```

简中和日文页面在对应文件名 `.html` 前加 `.zh-Hans` 或 `.ja`。修改这些路径会影响已有链接。本目录是维护源工程；本地检查不表示已部署。发布前还需核对最终应用行为、法律内容、联系邮箱可达性、App Store Connect 隐私回答，以及目标域名中的页面。

`.github/workflows/check-site.yml` 在推送及拉取请求时执行相同的生成一致性和链接检查，不含部署步骤。维护运行时由 `.node-version` 声明；当前检查不需要安装依赖。
