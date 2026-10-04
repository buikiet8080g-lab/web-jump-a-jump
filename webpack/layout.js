// ---------------------------------------------------------------------------
// 页面骨架
//
// 4 个页面（首页 + 3 个内容页）共用这一份 <head>/<header>/<footer>，
// 避免导航和元信息在 4 个模板里各写一遍。
//
// 为什么用 templateContent 函数而不是 .html 模板文件：
//   HtmlWebpackPlugin 的模板只会做 <%= %> 替换，拼不出「导航高亮当前页 +
//   面包屑 + 每页不同的 JSON-LD」这种结构。用函数可以直接写 JS。
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const { SITE, NAV, CRUMB, absolute } = require('./site');

const chromeCss = fs.readFileSync(path.join(__dirname, 'chrome.css'), 'utf8');

// logo 直接内联进页面。
// 不引用 /logo.svg 的原因：素材过了 webpack，文件名带 hash（logo.abc123.svg），
// 而这些内容页是零 JS 的，拿不到那个 URL。内联还省掉一次请求。
const logoSvg = fs
  .readFileSync(path.join(__dirname, '..', 'src', 'res', 'brand', 'logo.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '')
  // 注释必须去掉：logo.svg 里有大段中文说明，内联进 favicon 的 data URI 时
  // 会被 URL 编码成几十倍长度（实测光注释就 4KB），每个页面都要背一遍
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\n\s*/g, ' ')
  .trim();

// favicon 同样内联成 data URI —— 内容页不需要额外的图标文件
const faviconDataUri =
  'data:image/svg+xml,' + encodeURIComponent(logoSvg).replace(/'/g, '%27').replace(/"/g, '%22');

/** HTML 文本转义，防止内容里的 & < > " 破坏结构 */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 顶部导航；当前页加 aria-current，样式和 SEO 都认它 */
function renderNav(activePath) {
  const links = NAV.map(({ path: p, label }) => {
    const href = p ? `/${p}` : '/';
    const current = p === activePath ? ' aria-current="page"' : '';
    return `        <a href="${href}"${current}>${esc(label)}</a>`;
  }).join('\n');

  return `      <nav class="site-header__nav" aria-label="Main">
${links}
      </nav>`;
}

/** 面包屑：首页 > 当前页。同时会输出 BreadcrumbList 结构化数据 */
function renderCrumbs(pagePath) {
  if (!pagePath) return '';

  const label = CRUMB[pagePath] || pagePath;

  return `    <nav class="crumbs wrap" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">${esc(SITE.name)}</a></li>
        <li>${esc(label)}</li>
      </ol>
    </nav>`;
}

function breadcrumbJsonLd(pagePath) {
  if (!pagePath) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE.name, item: absolute('') },
      { '@type': 'ListItem', position: 2, name: CRUMB[pagePath] || pagePath, item: absolute(pagePath) },
    ],
  };
}

function renderJsonLd(blocks) {
  return blocks
    .filter(Boolean)
    .map((b) => `    <script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join('\n');
}

/**
 * 生成一个完整页面。
 *
 * @param {object}   page
 * @param {string}   page.path         '' | 'scoring' | 'cats' | 'tips'（用于 canonical / 导航高亮）
 * @param {string}   page.title        <title>
 * @param {string}   page.description  meta description
 * @param {string}   page.body         正文 HTML（已含 <main>）
 * @param {object[]} [page.jsonLd]     额外结构化数据
 * @param {string}   [page.head]       额外 <head> 内容
 * @param {string}   [page.scripts]    页面脚本标签（只有首页有）
 */
function buildPage({ path: pagePath = '', title, description, body, jsonLd = [], head = '', scripts = '' }) {
  const canonical = absolute(pagePath);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="${faviconDataUri}">
    <meta name="theme-color" content="${SITE.themeColor}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${esc(SITE.name)}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${esc(SITE.url + SITE.ogImage)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${esc(SITE.url + SITE.ogImage)}">
${renderJsonLd(jsonLd.concat([breadcrumbJsonLd(pagePath)]))}${head ? '\n' + head : ''}

    <style>
${chromeCss}
    </style>
  </head>
  <body>
    <header class="site-header">
      <a class="site-header__brand" href="/">
        <span class="site-header__logo" aria-hidden="true">${logoSvg}</span>
        <span>${esc(SITE.name)}</span>
      </a>
${renderNav(pagePath)}
    </header>
${renderCrumbs(pagePath)}
${body}
    <footer class="site-footer">
      <div class="wrap">
        <nav aria-label="Footer">
          <a href="/">Play ${esc(SITE.name)}</a>
          <a href="/scoring">How scoring works</a>
          <a href="/cats">The cats</a>
          <a href="/tips">Tips &amp; strategy</a>
        </nav>
        <p>${esc(SITE.tagline)}</p>
      </div>
    </footer>
${scripts}
  </body>
</html>
`;
}

module.exports = { buildPage, esc };
