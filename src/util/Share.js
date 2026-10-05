// ---------------------------------------------------------------------------
// 分享到 X（Twitter）
//
// 用的是 Web Intent —— 一个普通链接：
//
//     https://x.com/intent/post?text=<文案>&url=<地址>
//
// 点开只是「预填好内容的发帖框」，发不发、改不改都由用户自己决定。所以：
//
//   * 不需要 X 开发者账号，不需要 API key，不需要 OAuth —— 没有注册这一步；
//   * 不会替用户发帖（X API v2 直发才需要上面那些，而且绕过用户确认，
//     分享场景不该用：用户看不到自己要发什么）；
//   * 旧域名 twitter.com/intent/tweet 会 302 到 x.com/intent/post，两个都行，
//     这里统一用新域名；
//   * 手机上装了 App 会直接唤起 App，没装就落到网页版发帖框。
//
// 链接预览（卡片）同样不需要在 X 上注册任何东西：页面 <head> 里的
// og: / twitter: 这组 meta 就是全部（见 webpack/layout.js 的 buildPage）。
// 本文件只管「把用户送进发帖框」这一段。
// ---------------------------------------------------------------------------

/**
 * 拼一个 X 发帖框链接。text / url 都可省略。
 *
 * URLSearchParams 会把空格编成 "+"；虽然 query string 里 "+" 就等于空格，
 * 但 X 那边按 %20 处理更稳，所以统一换过来。
 */
export function tweetIntent({ text, url } = {}) {
  const params = new URLSearchParams();

  if (text) params.set('text', text);
  if (url) params.set('url', url);

  return `https://x.com/intent/post?${params.toString().replace(/\+/g, '%20')}`;
}

/**
 * 分享出去用哪个地址：优先取 <link rel="canonical">。
 * 这样从 www 进来的人分享出去的也是正式域名，不会把 www 版本散到各处。
 */
function canonicalUrl() {
  const link = document.querySelector('link[rel="canonical"]');
  const href = link && link.getAttribute('href');

  return href || window.location.href;
}

/** 「我得了 N 分」的分享链接 —— 游戏结束时用 */
export function scoreShareIntent(score) {
  return tweetIntent({
    text: `I scored ${score} in Kitty Jump 🐱 — a free one-thumb cat jumping game. Can you beat it?`,
    url: canonicalUrl(),
  });
}
