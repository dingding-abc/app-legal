# 网站维护约定

- 修改前读 `PROJECT.md`、`DESIGN.md`、`README.md` 与受影响的源文件。站点保持静态、无框架、无远程运行依赖；维护生成脚本只使用 Node 内建模块。
- `apps/alignerdiary/` 的法律事实与 2026-09-20 日期受保护；翻译须完整保留含义。更改正式法律事实时同步三语，不把翻译变成独立的新法律承诺。公开页面使用“独立开发者”身份，不出现个人姓名。
- 真实联系邮箱只改 `assets/site-config.js` 并运行 `node scripts/build-site.cjs`。已交付 HTML 中的重复地址是生成结果。`apps/_template/` 的 `APP_NAME`、`YOUR_EMAIL`、`LAST_UPDATED` 等令牌保持原样，模板页不进入首页。
- 英语原 URL 保持稳定。简中与日文在同目录使用 `.zh-Hans.html` 与 `.ja.html`；所有站内链接使用相对路径，语言栏不靠 JavaScript 才能导航。用户语言偏好仅作渐进增强，存储失败不报错。
- 完成前运行 `node scripts/build-site.cjs --check` 与 `node scripts/check-site.cjs`；核对每页一个 h1、skip link、aria-current、所有资源和锚点、模板令牌、完整正文与联系方式。用浏览器核对 320px、375px、桌面、键盘和无水平溢出；未执行的项目明确标为未验证。
- 部署须按用户当前授权执行，不能从本地生成或预览推断已发布。
