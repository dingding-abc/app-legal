// Public App Store names, verified with Apple's lookup API on 2026-10-07.
// Keep the store title verbatim so visitors can search for the same app.
module.exports = Object.freeze({
  keepaccounts: {
    storeId: '6820356123', bundleId: 'com.dzy.keepaccounts', status: 'testing', policyUpdated: '2026-10-12',
    locales: { en: {name:'朝暮有数',description:'Personal bookkeeping with optional AI voice input. In testing.'}, 'zh-Hans': {name:'朝暮有数',description:'日常记账与代付管理，可选 AI 语音输入。测试中。'}, ja: {name:'朝暮有数',description:'個人の記帳・立替管理と任意の AI 音声入力。テスト中。'} },
  },
  alignerdiary: {
    storeId: '6811375012',
    bundleId: 'com.dzy.alignerdiary',
    verifiedOn: '2026-10-07',
    locales: {
      en: {
        name: 'Aligner Tracker-AlignerDiary',
        storeURL: 'https://apps.apple.com/us/app/aligner-tracker-alignerdiary/id6811375012',
        source: 'https://itunes.apple.com/lookup?id=6811375012&country=us',
      },
      'zh-Hans': {
        name: '齿间时光 - 牙套管理 - AlignerDiary',
        storeURL: 'https://apps.apple.com/cn/app/齿间时光-牙套管理-alignerdiary/id6811375012',
        source: 'https://itunes.apple.com/lookup?id=6811375012&country=cn',
      },
      ja: {
        name: 'アライナーモーメント-AlignerDiary',
        storeURL: 'https://apps.apple.com/jp/app/アライナーモーメント-alignerdiary/id6811375012',
        source: 'https://itunes.apple.com/lookup?id=6811375012&country=jp',
      },
    },
  },
});
