# 朝暮有数政策维护

2026-10-12。与 AlignerDiary 共用当前站点、三语生成、页面样式及 `assets/site-config.js` 联系地址。独立目录 `apps/keepaccounts/`，中英文及日文逐节对应。新增条款不改变 AlignerDiary 的正文和 2026-09-20 日期。

## 事实来源

应用仓库 `dingding-abc/keep-accounts`，订阅实现基线 `74b0ff4`。此页路径指应用仓库。

| 数据/功能 | 地点、用途与删除 | 代码证据 |
| --- | --- | --- |
| 账单、备注、代付、照片 | 设备内 SQLite；删除账单不清除外部副本 | `iphone/src/services/repository.ts`、`iphone/src/ui/SettingsScreen.tsx` |
| 语音与当前字典 | HTTPS → 上海 FC → 百炼/千问；仅请求内处理，不建录音/权益业务库 | `iphone/src/services/nativeVoice.ts`、`services/ai-gateway/app.py` |
| 购买凭证 | StoreKit 本地验证；FC 向 Apple 每次查当前权益，无订阅状态数据库 | `iphone/modules/keepaccounts-storekit/ios/SubscriptionStore.swift`、`services/ai-gateway/apple_entitlement.py` |
| 备份快照及照片 | Apple Account 的 CloudKit 私有库；手动创建/恢复，最多10份；单独删除 | `iphone/src/ui/CloudBackupPanel.tsx`、`iphone/modules/keepaccounts-cloud-backup/` |
| CSV、相册副本 | 系统分享指定目的地／用户可选相册保存；用户分别管理 | `iphone/src/ui/SettingsScreen.tsx`、`iphone/src/services/photoAssets.ts` |
| 汇率请求 | ExchangeRate-API、Fawaz Currency API、Frankfurter；不含账单 | `iphone/src/services/rates.ts` |
| 付款 | Apple 收款；月订阅与自愿消耗型打赏独立；不接收银行卡 | `iphone/src/services/subscriptions/`、`iphone/src/services/tips/` |

AI 草稿仅用户确认后入账。基础记账和照片附件免费；照片识别尚未提供。月订阅基准 US$3.00，界面与条款采用 Apple 当地实际报价；Apple 一周免费首次优惠由资格决定。TestFlight 沙盒时间可能加速，不代表正式试用时长。

本实现不能核实云厂商全部日志和数据保留周期，政策未承诺全链路零保留。没有将无自建数据库等同于 Apple App Privacy “不收集”；App Store 隐私答案及正式审核为独立待办。翻译未经过法律或母语专业审核。

## 界面与验收

沿用共享样式、760px正文列、原有触控和换行规则；首页两款应用使用相同 .app-entry 图文网格、笔记本插画、名称、其他语言名称与三项文档行；仅 App Store 按钮为“测试中”不可点击状态（英文 Not released）。桌面同为 .9fr/1.3fr，680px以下同为单列，父级边界与既有图片间距保持一致。不能横向溢出，正文和语言链接完整可达，旧 App 页面不变。

生成一致性、30页1534项静态/语言检查已通过。浏览器首页及隐私／条款／支持三语在320／375／1280px共36组合测量无横向溢出，实际手机条款截图、语言切换及键盘焦点已核验。三语字体内容覆盖及文件校验通过。原18份 AlignerDiary／模板文档无正文差异。最终 URL 在发布后另验。网站发布不代表 App Store 隐私回答、原生真机购买或公开上架完成。

2026-10-12 首页修订：按用户要求补相同笔记本插画与三语名称区，复用同一网格；实际三语320／375／1280px共9组合左右边界与列宽一致、无水平溢出。商店入口保留同样外观但无 href、aria-disabled=true，不能误跳其他应用。已验证现有本地字体覆盖新状态文字，未再发送页面字符给外部字体服务。
