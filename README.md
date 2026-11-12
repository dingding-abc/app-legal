> 2026-11-12 当前本地维护范围：AlignerDiary 1.2.0 已审核通过（用户提供事实）。其隐私／条款／支持改为简明的 11 语言静态文档；首页、Keepaccounts 和模板仍为原三语。以下旧日期及三语验收记录仅代表原阶段。本轮仅本地准备，未提交、推送或部署，母语／法律及浏览器验收不由生成成功替代。

> 2026-10-26：AlignerDiary 中英日隐私／条款／支持已按当前 SDK58 真实实现准备本地同步，日期仅九份受影响文档更新为2026-10-26。补充主动30天免费试用、一次终身购买、旧生产原始build≤85.2资格、到期保留与限制、Keychain及Widget最小访问状态、相册另存和计划／全部数据清除边界。日期由 assets/app-catalog.js 的每App policyUpdated 生成；keepaccounts 与模板正文／日期保持原样。下文9月20日保护描述为此前内容基线，本次变更由当前发布准备范围明确授权。尚未部署、未经法律或母语审校，浏览器本轮未执行；事实映射与静态检查证据在主任务 output/apple-release-2026-10-26/legal-site/。

> 2026-10-12：朝暮有数新增中英日隐私／条款／支持共九页，与 AlignerDiary 在同站统一维护，目录 apps/keepaccounts。联系方式仍只来自 assets/site-config.js；三语内容与页面生成沿用现有流程。下方“只有 AlignerDiary／21页”为此前阶段；当前30页。新应用处于测试阶段，不提供虚构的商店下载链接。事实与验收见 KEEPACCOUNTS.md。

# App Legal & Support

面向 GitHub Pages 的静态应用政策与支持站。当前公开目录只有 AlignerDiary；首页还展示 Light 与 Smart 两个分类，Smart 明确标为暂无应用。站点提供英语、简体中文和日语完整页面，英语沿用原有 URL，另两种语言使用同目录 `.zh-Hans.html`、`.ja.html` 后缀。站内导航与语言链接均为相对地址，在域名根路径和仓库子路径下可用。

部署文件是纯 HTML、CSS、SVG、本地字体和一段渐进式 JavaScript，没有远程运行依赖或框架。当前版以手册插画和文档索引组成应用介绍，手机上排列为单列。英文、简中、日文分别使用 Fraunces、LXGW WenKai、Zen Maru Gothic；英文正文与应用名沿用 Inter。直接打开 `index.html` 可阅读英语；三语页面及切换链接在禁用 JavaScript 时也可用。`assets/site-language.js` 仅记住访客选择，存储不可用时不影响阅读和导航。

## 维护入口

- `assets/site-config.js`：**唯一维护的真实联系邮箱**。修改后运行生成脚本；生成 HTML 中重复的地址是输出，不是多个手工来源。`apps/_template/` 的 `YOUR_EMAIL` 是必须保留的模板令牌。
- `assets/app-catalog.js`：应用的三语 App Store 全称、商店链接、应用 ID 与核实来源。首页以当前语言全称为标题，同时列出另外两种语言全称；下载入口对应当前语言店面。文档标题与应用标签复用此来源。名称按真实商店信息维护，不自行翻译商品名。
- `index.html`：英语首页布局与文案来源。**AlignerDiary 全部 11 语言、三类正文统一以 `assets/locales/alignerdiary.js` 为唯一维护源**，包括英语；`apps/alignerdiary/*.html` 全是输出，修改后会被重建。旧 `assets/locales/zh-Hans.js`、`ja.js` 中的 AlignerDiary 块由正文负责者移除或同步，生成器不再读取它们的 AlignerDiary 正文。其他 App 与模板沿原权威方向，英语正文仍来自其无后缀 HTML。日期仅 AlignerDiary 改为 `2026-11-12`，仍从 `assets/app-catalog.js` 生成。
- `assets/aligner-languages.js`：仅 AlignerDiary 的 11 语言注册、自称及本地化界面，导出 `{ supported, labels, messages }`，`messages` 沿 `ui/page/title` 形状；不维护正文或 App Store 商品名。`assets/i18n.js`：其余三语页面标题、meta、导航和首页文案；首页 `data-i18n` 标记对应 `ui` 内的键，节点仅包含文本，改文案后重新生成即可。`assets/locales/zh-Hans.js`、`ja.js`：其他 App 与模板的原三语正文翻译。模板令牌须在所有语言保持原样。
- `assets/style.css`、`assets/favicon.svg`、`assets/fonts/`：共享视觉资源。字体来源、许可证与维护方式见 `assets/fonts/SOURCE.md`。`apps/_template/` 仅作新 App 模板，不在首页列出；复制后必须按新 App 的真实行为重写法律条款。

需要预装 Node.js 才执行以下**维护**命令；托管和访客浏览不需要 Node，也不安装 npm 包。在站点根目录运行：

```powershell
node scripts/build-site.cjs
node scripts/build-site.cjs --check
node scripts/check-site.cjs
node scripts/update-fonts.cjs --check
```

第一条同步邮箱并生成 54 个静态页面（AlignerDiary 33、其他 App 9、模板 9、首页 3）；`--check` 检查生成结果未漂移，第三条检查页面语言、内部链接、锚点、文档结构、邮箱、模板令牌与基础故障情况。可直接打开页面预览，或在根目录启动任意静态文件服务器，确认部署到仓库子路径时的链接行为。

字体检查离线运行，核对正文所需字符、字体文件完整性及许可证。若文案新增的字符不在已下载的子集中，先生成页面，再运行 `node scripts/update-fonts.cjs` 联网获取已记录来源的字体子集，随后重新执行上述检查。字体更新只用 Node 内建模块；访客与日常构建均不访问远程字体服务。

## 固定公开路径

```text
index.html
apps/alignerdiary/privacy.html
apps/alignerdiary/terms.html
apps/alignerdiary/support.html
```

简中和日文页面在对应文件名 `.html` 前加 `.zh-Hans` 或 `.ja`。修改这些路径会影响已有链接。本目录是维护源工程；本地检查不表示已部署。发布前还需核对最终应用行为、法律内容、联系邮箱可达性、App Store Connect 隐私回答，以及目标域名中的页面。

`.github/workflows/check-site.yml` 在推送及拉取请求时执行相同的生成一致性和链接检查，不含部署步骤。维护运行时由 `.node-version` 声明；当前检查不需要安装依赖。

## AlignerDiary 11 语言与本地交接（2026-11-12）

语言按代码顺序为 `ar, de, en, es, fr, it, ja, ko, pt, zh-Hans, zh-Hant`，入口显示语言自称，不使用旗帜或地区。英语、简中、日文原 URL 保留，其余使用同目录语言后缀；三类文档互链保留语言。额外语言返回明确标注英语的首页（`index.html?lang=en`），不生成额外语言首页。既有英语、简中、日文继续使用 app-catalog 中已核实的商品全名，仅新增八语使用已确认品牌 AlignerDiary，不编造当地商品名。

页首语言入口在窄屏位于品牌之后、文档导航之前，使用原生 `details/summary` 与 11 个静态链接；非英语按钮显示本地化语言标签及 `/ Language`。弹出面板绝对定位、有视口高度限制与内部滚动，不占正文空间。无 JavaScript 仍可展开和导航；JavaScript 只增强偏好、Escape／外点关闭和返回缓存清理。AlignerDiary 原无后缀英语文档现在也视为显式英语，避免偏好存储失败后无法选择英语；首页及其他 App 的原三语偏好增强保留。

保留 en／简中／日文既有本地字体；新增拉丁语使用现有 Inter，阿语、韩语、繁中使用可读系统后备，菜单逐链接按 `lang` 选择字体。`update-fonts.cjs` 保留原采集范围和下载来源，仍采集 en／简中／日文整页文本（包含菜单自称）维护三套字库字符快照、资源校验和及许可；它不证明 Fraunces 等能绘制阿语或韩语。新字符先生成再由测试负责者运行字体更新和离线检查，系统字形与 RTL 另作浏览器验收。

研究及采用边界见 DESIGN.md；技术备份／原始自查位于主任务 `output/policy-concise-2026-11-12/`，最终测试由独立 Sol xhigh 负责，浏览器与验收裁定由主代理负责。

缓存配套：仅 AlignerDiary 输出为 `style.css`、`site-language.js`、`fonts/typefaces.css` 加当前文件 SHA-256 前 12 位 `?v=`，避免旧缓存资源配上新 HTML。字体更新后须**再次生成页面**刷新字体样式版本，再执行检查。其他页面资源引用和布局保持原样。此项针对主代理保留的旧 CSS／新 HTML 实际失败，修复结果仍须在原浏览器路径复验。

字体字节缓存链（独立审核 R1 批准）：生成的每个 WOFF2 URL 追加该文件实际 SHA-256 前 12 位 `?v=`，不改文件名、字体族或许可证。`--check` 解析并分离 query，核对原本地资源集合、版本与实际字体字节，同时保留完整性、字符快照及许可检查。顺序为：最新正文先生成供 corpus → 字体维护写字节及带版本的字体 CSS → 再生成 HTML 更新三项资源哈希。原有按来源 URL 和完整字节哈希命中的下载缓存保留，不强制重新下载已有字体。共享字体 CSS 的其他 App 三语浏览器回归另记。
