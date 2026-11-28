# 秒秒记账政策维护

2026-11-28。与 AlignerDiary 共用当前站点、统一 11 语言 `.aligner-doc` 页面框架（含右上角 11 语言地球下拉菜单、版本化静态资源与统一正文排版）及 `assets/site-config.js` 联系地址。独立公开路径已按用户要求更新为新应用名 `apps/miaomiaojizhang/`（中文名「秒秒记账」，英文/国际品牌名「Swiftally」，`assets/app-catalog.js` 中的 Apple `bundleId: 'com.dzy.keepaccounts'` 保持不变），11 种语言全部由 `assets/locales/miaomiaojizhang.js` 统一维护并与 `zh-Hans.js`/`ja.js` 同步。本次更新不改变 AlignerDiary 的正文和 `2026-11-23` 日期。

## 事实来源

应用当前工作区 `d:/Project/02_jizhang_ios_google`（对外显示名「秒秒记账」，iOS `bundleIdentifier` 未改动）。

| 数据/功能 | 地点、用途与删除 | 代码证据 |
| --- | --- | --- |
| 账单、备注、分账、往来待办、多图附件 | 本机 SQLite（WAL 分表增量持久化）与应用沙盒压缩多图（单条最多 9 张 JPEG）；「拍照与选图存入应用」开关默认开启，删除记录自动清理孤立副本，完整增删改查 | `src/services/storage/ledgerSqliteStorage.ts`、`src/services/media/photoStorageService.ts`、`src/store/useFlowStore.ts` |
| 可选 AI 语音（含待办自动映射）与 AI 拍照票据识别 | HTTPS → 双边 Serverless 网关（中国内地阿里云 FC + 百炼/千问/DeepSeek；海外 Google Cloud Run + Gemini/容灾）；客户端零密钥；仅请求内处理，不建账单/录音/图片持久化库 | `src/services/ai/aiRecognitionService.ts`、`serverless/src/prompts.mjs`、`serverless/src/gateway.mjs` |
| 订阅权益与购买凭证 | Apple StoreKit 月度/年度自动续订；基础手动记账、待办与多图附件免费；不接收银行卡 | `src/components/modals/AiSubscriptionModal.tsx` |
| 备份快照、CSV 与汇率请求 | 可选 iCloud 私有库快照；CSV 通过系统分享导出；公开汇率接口仅请求币种汇率，不含账单 | `src/services/currency/exchangeRateService.ts`、`src/components/views/DetailsPane.tsx` |

AI 草稿仅用户确认后入账。基础记账和照片附件免费；照片识别尚未提供。月订阅基准 US$3.00，界面与条款采用 Apple 当地实际报价；Apple 一周免费首次优惠由资格决定。TestFlight 沙盒时间可能加速，不代表正式试用时长。

本实现不能核实云厂商全部日志和数据保留周期，政策未承诺全链路零保留。没有将无自建数据库等同于 Apple App Privacy “不收集”；App Store 隐私答案及正式审核为独立待办。翻译未经过法律或母语专业审核。

## 界面与验收

沿用共享样式、760px正文列、原有触控和换行规则；首页两款应用使用相同 .app-entry 图文网格、笔记本插画、名称、其他语言名称与三项文档行；仅 App Store 按钮为“测试中”不可点击状态（英文 Not released）。桌面同为 .9fr/1.3fr，680px以下同为单列，父级边界与既有图片间距保持一致。不能横向溢出，正文和语言链接完整可达，旧 App 页面不变。

生成一致性、30页1534项静态/语言检查已通过。浏览器首页及隐私／条款／支持三语在320／375／1280px共36组合测量无横向溢出，实际手机条款截图、语言切换及键盘焦点已核验。三语字体内容覆盖及文件校验通过。原18份 AlignerDiary／模板文档无正文差异。最终 URL 在发布后另验。网站发布不代表 App Store 隐私回答、原生真机购买或公开上架完成。

2026-10-12 首页修订：按用户要求补相同笔记本插画与三语名称区，复用同一网格；实际三语320／375／1280px共9组合左右边界与列宽一致、无水平溢出。商店入口保留同样外观但无 href、aria-disabled=true，不能误跳其他应用。已验证现有本地字体覆盖新状态文字，未再发送页面字符给外部字体服务。
