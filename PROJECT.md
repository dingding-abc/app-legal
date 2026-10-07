# App Legal & Support · 项目档案

- 类型：面向 GitHub Pages 的纯静态网站。访客端只有 HTML/CSS/SVG/本地字体和渐进式语言偏好脚本；没有后端、数据库、框架或远程运行依赖。
- 使用者：查阅 App 政策、条款与支持的公众，以及维护页面的独立开发者。
- 核心流程：打开首页 → 选择 Light 分类中的 AlignerDiary → 阅读隐私/条款/支持 → 在三语间切换或返回同语言首页。Smart 分类目前没有应用。
- 本次范围：单一邮箱来源、独立开发者身份、英语/简中/日文全文与导航、稳定原 URL。设计入口为 `DESIGN.md`；本目录为维护源工程，未在本次工作中部署。

## 权威来源与生成方向

- 英语首页结构和文案基线：`index.html`；正式英语法律/支持正文：`apps/alignerdiary/*.html` 的无语言后缀文件。
- 联系地址：`assets/site-config.js`，通过 `scripts/build-site.cjs` 同步至正式文档输出。模板保留 `YOUR_EMAIL`。
- 三语公共 UI、标题和 meta：`assets/i18n.js`；简中/日文法律与模板正文：`assets/locales/zh-Hans.js`、`ja.js`。
- 输出：英语原文件 + `.zh-Hans.html`、`.ja.html` 静态页面。英语文件也是再生成输入；脚本幂等，`--check` 验证输出。相对路径是站内链接的契约。
- 样式与资源：`assets/style.css`、`assets/*.svg`、`assets/fonts/`；运行时偏好脚本 `assets/site-language.js` 不负责提供正文。
- 正式法律事实、2026-09-20 日期和模板令牌以现有英语正文为基线；不推断新事实。文案、页面输出和检查脚本在本目录统一维护。

## 本地验证与限制

维护命令为 `node scripts/build-site.cjs`、`node scripts/build-site.cjs --check`、`node scripts/check-site.cjs`。脚本核对 21 页生成一致性、内部资源/链接、三语跳转、标题/语言、每页单一 h1、模板令牌与联系地址。浏览器需进一步在 320px、375px 和桌面核对布局、键盘焦点、语言持久化与直接访问行为；只有实际执行后才能标为完成。原 URL 与各语言后缀均须在最终托管路径复验。
