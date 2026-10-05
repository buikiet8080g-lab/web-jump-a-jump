// ---------------------------------------------------------------------------
// 站点常量
//
// 换域名只改 SITE.url 这一行 —— canonical、og:url、sitemap.xml、JSON-LD
// 全部从它派生。
// ---------------------------------------------------------------------------

const SITE = {
  name: 'Kitty Jump',

  // 站点根地址。canonical、og:url、sitemap.xml、JSON-LD 全部从它派生，
  // 所以**这个值必须和实际上线地址一致**，否则搜索引擎会收到互相矛盾的信号。
  //
  // 用环境变量注入，因为不同托管方式的地址不一样，同一条构建命令都能用：
  //   正式站（默认）:    https://kittyjump.online
  //   Pages 预览域名:    SITE_URL=https://kittyjump.pages.dev npm run build
  //   自有域名:         SITE_URL=https://yourdomain.com npm run build
  url: (process.env.SITE_URL || 'https://kittyjump.online').replace(/\/+$/, ''),

  // GA4 Measurement ID。所有页面的 gtag 都由 webpack/layout.js 注入。
  // 用环境变量覆盖是为了本地/预览环境不往正式报表里灌数据。
  ga4: process.env.GA4_ID || 'G-Z6ZM31GBVV',

  tagline: 'A free one-thumb cat jumping game you can play in the browser.',

  // X（Twitter）站点账号，只影响卡片上的「来自 @xxx」归属，可有可无。
  // 留空就不输出 twitter:site / twitter:creator。
  // 注意：做分享按钮、做链接预览都**不需要**在 X 上注册任何东西，
  // 这个字段纯粹是「如果有官方账号就填一下」。
  twitterSite: process.env.TWITTER_SITE || '',
  // 社交分享图，1200×630
  ogImage: '/og.png',
  themeColor: '#ee5568',
};

// 导航。顺序 = 展示顺序，也用来判断「当前页」
const NAV = [
  { path: '', label: 'Play' },
  { path: 'scoring', label: 'Scoring' },
  { path: 'cats', label: 'Cats' },
  { path: 'tips', label: 'Tips' },
];

// 面包屑名字（"Play" 一页就是首页，不出现在面包屑里）
const CRUMB = { scoring: 'Scoring', cats: 'Cats', tips: 'Tips' };

/** 把页面路径拼成绝对 URL，'' → 站点根 */
function absolute(pagePath) {
  return pagePath ? `${SITE.url}/${pagePath}` : `${SITE.url}/`;
}

module.exports = { SITE, NAV, CRUMB, absolute };
