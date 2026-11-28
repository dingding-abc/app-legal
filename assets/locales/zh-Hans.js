(function (root) {
  'use strict';
  const body = {
    kinsanote: require('./kinsanote.js')['zh-Hans'],
    miaomiaojizhang: require('./miaomiaojizhang.js')['zh-Hans'],
    alignerdiary: require('./alignerdiary.js')['zh-Hans'],
    template: {
      privacy: `
<p>APP_NAME 尊重你的隐私。本政策说明你使用应用时，信息会如何处理。</p>
<h2>1. 数据收集</h2><p>DATA_COLLECTION_TEXT</p>
<h2>2. 本地存储与 iCloud</h2><p>ICLOUD_TEXT</p>
<h2>3. 购买</h2><p>PURCHASE_TEXT</p>
<h2>4. 分析、广告与跟踪</h2><p>ANALYTICS_TEXT</p>
<h2>5. 数据控制</h2><p>DATA_CONTROL_TEXT</p>
<h2>6. 儿童隐私</h2><p>本应用的设计目的并非通过开发者运营的账号或服务器有意收集儿童的个人信息。</p>
<h2>7. 政策变更</h2><p>应用功能或数据处理做法变化时，本政策可能更新。此页面始终提供最新版本。</p>
<h2>8. 联系方式</h2><p>如果你对本隐私政策有疑问，请联系：<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a></p>`,
      terms: `
<p>使用 APP_NAME 即表示你同意本使用条款。</p>
<h2>1. 应用用途</h2><p>APP_PURPOSE</p>
<h2>2. 用户责任</h2><p>你须对在应用中输入、保存或管理的信息，以及保持对设备和 Apple 账号的访问负责。</p>
<h2>3. 可用性</h2><p>本应用按“现有可用状态”提供。功能可能随时间变更、改进或停止提供。</p>
<h2>4. 购买</h2><p>任何应用内购买均通过 Apple App Store 处理，并受 Apple 适用条款和账单政策约束。</p>
<h2>5. 限制</h2><p>本应用是个人信息管理工具，不应作为需要专业判断之决策的唯一依据。</p>
<h2>6. 变更</h2><p>本条款可能不时更新。更新后继续使用本应用，表示更新后的条款适用。</p>
<h2>7. 联系方式</h2><p>问题请发送至：<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a></p>`,
      support: `
<p>如遇到问题或有建议，请联系开发者。</p>
<div class="notice">邮箱：<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a></div>
<h2>联系支持时</h2><p>请提供应用版本、iOS 版本、设备型号和问题的简要说明。除非解决问题确有必要，否则不要发送敏感个人信息。</p>
<h2>法律信息</h2><div class="link-list"><a class="button" href="./privacy.html">隐私政策</a><a class="button" href="./terms.html">使用条款</a></div>`,
    },
  };
  root.SiteLocaleBodies = root.SiteLocaleBodies || {};
  root.SiteLocaleBodies['zh-Hans'] = body;
  if (typeof module === 'object' && module.exports) module.exports = body;
})(typeof globalThis !== 'undefined' ? globalThis : this);
