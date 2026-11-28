# 秒秒记账政策维护

2026-11-28。与 AlignerDiary 共用当前站点、统一 11 语言 `.aligner-doc` 页面框架（含右上角 11 语言地球下拉菜单、版本化静态资源与统一正文排版）及 `assets/site-config.js` 联系地址。独立公开路径 `apps/miaomiaojizhang/`（中文名「秒秒记账」，英文/国际品牌名「Swiftally」，`assets/app-catalog.js` 中的 Apple `bundleId: 'com.dzy.keepaccounts'` 保持不变），11 种语言全部由 `assets/locales/miaomiaojizhang.js` 统一维护并与 `zh-Hans.js`/`ja.js` 同步。本次更新同步 iCloud 私人快照备份、iCloud 家庭共享账本与 `$4.99` 家庭共享权益包事实，不改变 AlignerDiary 与 Kinsanote 正文。

## 事实来源

应用当前工作区 `d:/Project/02_jizhang_ios_google`（对外显示名「秒秒记账」，iOS `bundleIdentifier: com.dzy.keepaccounts` 未改动）。

| 数据/功能 | 地点、用途与删除 | 代码证据 |
| --- | --- | --- |
| 账单、备注、分账、往来待办、多图附件 | 本机 SQLite（WAL 分表增量持久化）与应用沙盒压缩多图（单条最多 9 张 JPEG）；「拍照与选图存入应用」开关默认开启，删除记录自动清理孤立副本，完整增删改查 | `src/services/storage/ledgerSqliteStorage.ts`、`src/services/media/photoStorageService.ts`、`src/store/useFlowStore.ts` |
| iCloud 私人快照备份（可选） | 原生 iOS 构建支持在「设置 → 偏好」自主开关 iCloud 私人快照备份（Apple `privateCloudDatabase`，容器 `iCloud.com.dzy.keepaccounts`），携带 SHA-256 校验码备份个人账本、待办、分类、偏好及关联照片，严格排除家庭共享账本与购买凭据，支持原子恢复回滚与本地 SHA-256 快照导出/恢复 | `modules/keepaccounts-cloudkit/`、`src/services/cloud/backupFormat.ts`、`src/services/cloud/cloudBackupService.ts`、`app.json` |
| iCloud 家庭共享账本（可选） | 基于 Apple CloudKit `CKRecordZone` + `CKShare` 的受邀家庭账本，与个人账本强隔离（冷启动默认进入个人空间，头部提供「返回个人」一键返回）；仅在共享区内同步家庭账单、小票照片、家庭专属分类与成员昵称，共同家庭池统计成员支出占比 | `modules/keepaccounts-cloudkit/`、`src/services/cloud/familySyncService.ts`、`src/utils/ledgerHelpers.ts`、`src/components/modals/SettingsCenterModal.tsx` |
| 可选 AI 语音（含待办自动映射）与 AI 拍照票据识别 | HTTPS → 双边 Serverless 网关（中国内地阿里云 FC + 百炼/千问/DeepSeek；海外 Google Cloud Run + Gemini/容灾）；客户端零密钥；仅请求内处理，不建账单/录音/图片持久化库 | `src/services/ai/aiRecognitionService.ts`、`serverless/src/prompts.mjs`、`serverless/src/gateway.mjs` |
| 订阅权益与家庭共享权益包 | Apple StoreKit 2 月度（US$5）/ 季度（US$12）/ 年度（US$42）自动续订 AI Pro（符合条件首周免费）及一次性非消耗型「家庭共享权益包」（`com.dzy.keepaccounts.family.pack`，参考价 US$4.99，开启 Apple 家人共享）；包月 AI 订阅期内附带家庭共享发起权限，付费季订/年订 AI Pro 永久赠送家庭共享权益，受邀家人免费加入并自由记账编辑删除；不接收银行卡 | `src/components/modals/AiSubscriptionModal.tsx`、`src/services/iap/subscriptionService.ts`、`modules/keepaccounts-storekit/`、`serverless/src/auth/entitlement.mjs` |
| 导出与汇率请求 | CSV 仅通过系统分享导出（不可用于恢复）；公开汇率接口仅请求币种汇率，不含账单 | `src/services/currency/exchangeRateService.ts`、`src/components/views/DetailsPane.tsx` |

AI 草稿仅用户确认后入账。基础记账、照片附件、iCloud 私人备份与受邀加入家庭账本永久免费；AI 语音（含待办自动映射）与 AI 拍照票据识别需要 AI Pro；发起创建家庭账本需 `$4.99` 权益包或 AI Pro 订阅赠送。定价基准为月度 US$5、季度 US$12、年度 US$42、家庭包 US$4.99，界面与条款采用 Apple 当地实际报价；Apple 首周免费试用由账号资格决定。TestFlight 沙盒时间可能加速，不代表正式试用时长。无任何消耗型打赏项目。

本实现不能核实云厂商全部日志和数据保留周期，政策未承诺全链路零保留。没有将无自建数据库等同于 Apple App Privacy “不收集”；App Store 隐私答案及正式审核为独立待办。翻译未经过法律或母语专业审核。

## 界面与验收

沿用共享样式、760px正文列、原有触控和换行规则；首页应用使用相同 .app-entry 图文网格、笔记本插画、名称、其他语言名称与三项文档行；App Store 按钮在未上架前保持不可点击状态（英文 Not released）。桌面同为 .9fr/1.3fr，680px以下同为单列，父级边界与既有图片间距保持一致。不能横向溢出，正文和语言链接完整可达，旧 App 页面不变。
