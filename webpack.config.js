const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { buildPage } = require('./webpack/layout');
const { SITE, NAV } = require('./webpack/site');

const buildPath = './build/';

// 4 个页面。首页带游戏 bundle，另外三个是纯内容页。
//
// 内容页刻意不加载游戏 bundle：
//   1) 那 3.6MB 的 JS 对一页说明文字毫无用处；
//   2) 更重要的是 —— 内容写死在 HTML 里，搜索引擎拿到的就是正文，
//      不需要跑 JS 才能看到内容。
const pages = [
  require('./webpack/pages/home'),
  require('./webpack/pages/scoring'),
  require('./webpack/pages/cats'),
  require('./webpack/pages/tips'),
];

const pageUrl = (p) => (p ? `${SITE.url}/${p}` : `${SITE.url}/`);

/**
 * 额外产出 sitemap.xml / robots.txt，并把 src/static 下的文件原样拷进产物。
 *
 * 用 emitAsset 而不是写完盘再拷贝：这样 dev server 也能直接访问到，
 * 两种模式下行为一致。
 */
class SiteFilesPlugin {
  apply(compiler) {
    const name = 'SiteFilesPlugin';
    const staticDir = path.join(__dirname, 'src', 'static');

    compiler.hooks.thisCompilation.tap(name, (compilation) => {
      const { RawSource } = compiler.webpack.sources;

      compilation.hooks.processAssets.tap(
        { name, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          if (fs.existsSync(staticDir)) {
            fs.readdirSync(staticDir).forEach((file) => {
              compilation.emitAsset(file, new RawSource(fs.readFileSync(path.join(staticDir, file))));
            });
          }

          const today = new Date().toISOString().slice(0, 10);
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => {
    // 首页给最高权重，内容页依次递减
    const priority = p.path === '' ? '1.0' : p.path === 'tips' ? '0.6' : '0.7';
    return `  <url>
    <loc>${pageUrl(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;
          compilation.emitAsset('sitemap.xml', new RawSource(sitemap));

          const robots = `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;
          compilation.emitAsset('robots.txt', new RawSource(robots));
        }
      );
    });
  }
}

module.exports = {
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.join(__dirname, buildPath),
    filename: '[name].[contenthash].js',
    // auto：按页面所在深度算相对路径，放到任何子目录都能用
    publicPath: 'auto',
  },
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },{
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },{
        test: /\.(jpe?g|png|gif|svg|webp|tga|glb|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg)$/i,
        use: 'file-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      }
    ]
  },
  plugins: [
    ...pages.map((page) => new HtmlWebpackPlugin({
      // 'scoring' → build/scoring/index.html，静态托管下访问 /scoring 即可
      filename: page.path ? `${page.path}/index.html` : 'index.html',

      // 只有首页加载游戏；内容页 chunks: [] 意味着输出里一个 <script> 都没有
      chunks: page.path === '' ? ['main'] : [],
      inject: page.path === '' ? 'body' : false,
      scriptLoading: 'defer',

      title: page.title,
      templateContent: () => buildPage({
        path: page.path,
        title: page.title,
        description: page.description,
        body: page.body,
        jsonLd: page.jsonLd || [],
      }),
    })),
    new SiteFilesPlugin(),
  ]
};
