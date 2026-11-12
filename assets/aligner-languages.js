/* AlignerDiary document chrome. Build-time only; no browser dependency. */
const legacy = require('./i18n.js').messages;
const supported = Object.freeze(['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'zh-Hans', 'zh-Hant']);
const labels = Object.freeze({ ar: 'العربية', de: 'Deutsch', en: 'English', es: 'Español', fr: 'Français', it: 'Italiano', ja: '日本語', ko: '한국어', pt: 'Português', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文' });
// Each row supplies localized chrome, never legal/support body copy or store names.
const rows = {
  ar: ['الخصوصية والدعم', 'سياسة الخصوصية', 'شروط الاستخدام', 'الدعم', 'انتقل إلى المحتوى', 'اللغة', 'مستندات AlignerDiary', 'الخصوصية', 'الشروط', 'الدعم', 'جميع التطبيقات', 'جميع التطبيقات (بالإنجليزية)', 'الصفحة الرئيسية (بالإنجليزية)', 'آخر تحديث: {date}', '© 2026 مطوّر مستقل. جميع الحقوق محفوظة.'],
  de: ['App-Rechtliches & Support', 'Datenschutzerklärung', 'Nutzungsbedingungen', 'Support', 'Zum Inhalt', 'Sprache', 'AlignerDiary-Dokumente', 'Datenschutz', 'Bedingungen', 'Support', 'Alle Apps', 'Alle Apps (Englisch)', 'Startseite (Englisch)', 'Zuletzt aktualisiert: {date}', '© 2026 Unabhängiger Entwickler. Alle Rechte vorbehalten.'],
  es: ['Información legal y soporte', 'Política de privacidad', 'Condiciones de uso', 'Soporte', 'Ir al contenido', 'Idioma', 'Documentos de AlignerDiary', 'Privacidad', 'Condiciones', 'Soporte', 'Todas las apps', 'Todas las apps (inglés)', 'Inicio (inglés)', 'Última actualización: {date}', '© 2026 Desarrollador independiente. Todos los derechos reservados.'],
  fr: ['Informations légales et assistance', 'Politique de confidentialité', 'Conditions d’utilisation', 'Assistance', 'Aller au contenu', 'Langue', 'Documents AlignerDiary', 'Confidentialité', 'Conditions', 'Assistance', 'Toutes les apps', 'Toutes les apps (anglais)', 'Accueil (anglais)', 'Dernière mise à jour : {date}', '© 2026 Développeur indépendant. Tous droits réservés.'],
  it: ['Informazioni legali e assistenza', 'Informativa sulla privacy', 'Condizioni d’uso', 'Assistenza', 'Vai al contenuto', 'Lingua', 'Documenti di AlignerDiary', 'Privacy', 'Condizioni', 'Assistenza', 'Tutte le app', 'Tutte le app (inglese)', 'Home (inglese)', 'Ultimo aggiornamento: {date}', '© 2026 Sviluppatore indipendente. Tutti i diritti riservati.'],
  ko: ['앱 법적 정보 및 지원', '개인정보 처리방침', '이용약관', '지원', '본문으로 이동', '언어', 'AlignerDiary 문서', '개인정보', '이용약관', '지원', '모든 앱', '모든 앱 (영어)', '홈 (영어)', '최종 업데이트: {date}', '© 2026 독립 개발자. 모든 권리 보유.'],
  pt: ['Informações legais e suporte', 'Política de privacidade', 'Termos de uso', 'Suporte', 'Ir para o conteúdo', 'Idioma', 'Documentos do AlignerDiary', 'Privacidade', 'Termos', 'Suporte', 'Todos os apps', 'Todos os apps (inglês)', 'Início (inglês)', 'Última atualização: {date}', '© 2026 Desenvolvedor independente. Todos os direitos reservados.'],
  'zh-Hant': ['應用程式法律與支援', '隱私權政策', '使用條款', '支援', '跳至正文', '語言', 'AlignerDiary 文件', '隱私權', '條款', '支援', '所有應用程式', '所有應用程式（英文）', '首頁（英文）', '最後更新：{date}', '© 2026 獨立開發者。保留所有權利。'],
};
const messages = {};
for (const [locale, row] of Object.entries(rows)) {
  const [title, privacy, terms, support, skip, languageLabel, navDocs, privacyShort, termsShort, supportShort, allApps, allAppsEnglish, brandHomeEnglish, lastUpdated, footer] = row;
  messages[locale] = {
    title,
    page: { privacy: [privacy, `${privacy} · AlignerDiary`], terms: [terms, `${terms} · AlignerDiary`], support: [support, `${support} · AlignerDiary`] },
    ui: { skip, brandHome: brandHomeEnglish, brandHomeEnglish, languageLabel, navDocs, privacyShort, termsShort, supportShort, allApps, allAppsEnglish, lastUpdated, footer },
  };
}
for (const locale of ['en', 'zh-Hans', 'ja']) {
  const lastUpdated = { en: 'Last updated: {date}', 'zh-Hans': '最后更新：{date}', ja: '最終更新日：{date}' }[locale];
  const allAppsEnglish = { en: 'All apps (English)', 'zh-Hans': '全部应用（英语）', ja: 'すべてのアプリ（英語）' }[locale];
  const brandHomeEnglish = { en: 'App Legal & Support home (English)', 'zh-Hans': '应用法律与支持首页（英语）', ja: 'ホーム（英語）' }[locale];
  messages[locale] = { ...legacy[locale], ui: { ...legacy[locale].ui, lastUpdated, allAppsEnglish, brandHomeEnglish } };
}
module.exports = Object.freeze({ supported, labels, messages: Object.freeze(messages) });
