(function (root) {
  'use strict';
  const body = {
    miaomiaojizhang: require('./miaomiaojizhang.js').ja,
    alignerdiary: require('./alignerdiary.js').ja,
    template: {
      privacy: `
<p>APP_NAME はプライバシーを尊重します。このポリシーは、アプリ利用時の情報の取り扱いを説明します。</p>
<h2>1. 収集するデータ</h2><p>DATA_COLLECTION_TEXT</p>
<h2>2. 端末内の保存と iCloud</h2><p>ICLOUD_TEXT</p>
<h2>3. 購入</h2><p>PURCHASE_TEXT</p>
<h2>4. 分析、広告、トラッキング</h2><p>ANALYTICS_TEXT</p>
<h2>5. データの管理</h2><p>DATA_CONTROL_TEXT</p>
<h2>6. 子どものプライバシー</h2><p>本アプリは、開発者が運営するアカウントやサーバーを通じて、子どもの個人情報を意図的に収集することを目的としていません。</p>
<h2>7. ポリシーの変更</h2><p>アプリの機能やデータの取り扱いが変わると、このポリシーを更新する場合があります。最新の版は常にこのページで確認できます。</p>
<h2>8. 連絡先</h2><p>このプライバシーポリシーについての質問は、<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a> までお送りください。</p>`,
      terms: `
<p>APP_NAME を利用すると、この利用規約に同意したものとします。</p>
<h2>1. アプリの目的</h2><p>APP_PURPOSE</p>
<h2>2. 利用者の責任</h2><p>アプリに入力、保存、管理する情報、および端末と Apple アカウントへのアクセスを維持することは、ご自身の責任です。</p>
<h2>3. 提供状況</h2><p>本アプリは「提供可能な状態で」提供されます。機能は時間の経過とともに変更、改善、または終了する場合があります。</p>
<h2>4. 購入</h2><p>アプリ内購入はすべて Apple の App Store を通じて処理され、Apple の適用される規約と請求ポリシーに従います。</p>
<h2>5. 制限</h2><p>本アプリは個人の情報管理用ツールです。専門的な判断を要する決定の唯一の根拠として利用しないでください。</p>
<h2>6. 変更</h2><p>この規約は随時更新される場合があります。更新後もアプリを利用すると、更新後の規約が適用されます。</p>
<h2>7. 連絡先</h2><p>ご質問は <a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a> までお送りください。</p>`,
      support: `
<p>問題が発生した場合や提案がある場合は、開発者にご連絡ください。</p>
<div class="notice">メール：<a href="mailto:YOUR_EMAIL">YOUR_EMAIL</a></div>
<h2>サポートへの連絡時</h2><p>アプリのバージョン、iOS のバージョン、端末の機種、問題の簡潔な説明をお知らせください。解決に必要な場合を除き、機微な個人情報は送らないでください。</p>
<h2>法的情報</h2><div class="link-list"><a class="button" href="./privacy.html">プライバシーポリシー</a><a class="button" href="./terms.html">利用規約</a></div>`,
    },
  };
  root.SiteLocaleBodies = root.SiteLocaleBodies || {};
  root.SiteLocaleBodies.ja = body;
  if (typeof module === 'object' && module.exports) module.exports = body;
})(typeof globalThis !== 'undefined' ? globalThis : this);
