# 跳一跳

使用 Three.js 仿写的跳一跳，仅供学习参考

## 安装

```
npm install
```

## 运行

```
npm run start
```

打开 http://localhost:8080/

## 运行效果

gif 制作软件的帧率只有 8，实际运行帧率在 50 - 60 之间。

![preview](https://raw.githubusercontent.com/shenmaxg/web-jump/image/final-show.gif)

## 相关阅读

1. [仿写跳一跳｜1：基础概念](https://zhuanlan.zhihu.com/p/370842717)
2. [仿写跳一跳｜2：搭建场景](https://zhuanlan.zhihu.com/p/370888158)
3. [仿写跳一跳｜3：蓄力与跳跃](https://zhuanlan.zhihu.com/p/372502939)
4. [仿写跳一跳｜4：粒子与拖尾](https://zhuanlan.zhihu.com/p/372503966)
5. [仿写跳一跳｜5：跳跃后行为](https://zhuanlan.zhihu.com/p/378296291)
6. [仿写跳一跳｜6：盒子贴图](https://zhuanlan.zhihu.com/p/378297064)
7. [仿写跳一跳｜7：性能监控](https://zhuanlan.zhihu.com/p/386484824)

---

## 部署（Cloudflare Pages）

线上站点：<https://kittyjump.online>（含 `www`），
Cloudflare Pages 项目名 `kittyjump`。

### 常规路径：push `master` 即上线

Cloudflare 侧已经接好 Git 集成，构建配置放在 Cloudflare Dashboard
（Pages 项目 → Settings → Builds & deployments）：

| 配置项 | 值 |
| --- | --- |
| Production branch | `master` |
| Build command | `npm run build` |
| Build output directory | `build` |

推 `master` → Cloudflare 构建机执行 `npm ci` + `npm run build` → 发布到生产。
其它分支的 push 会走预览部署。

### 备用路径：本地直投

Git 集成不可用、或需要立刻上线时（本机构建后直传）：

```
CLOUDFLARE_API_TOKEN=<token> \
CLOUDFLARE_ACCOUNT_ID=68cc5fbb61c1d8f9b608407f831e83db \
npm run deploy
```

脚本内部就是 `npm run build` + `wrangler pages deploy ./build --project-name kittyjump --branch master`。
注意 `--branch master` 不能省：Pages 的生产分支是 `master`，
写成别的分支（或按当前分支推断）会变成**预览**部署，线上不会更新。

### 为什么仓库里没有 wrangler.toml

踩过的坑，别再往仓库里加：

Cloudflare 的构建机只要在仓库根目录看到 `wrangler.toml`，就以它为准读构建配置，
而且**忽略 Dashboard 里的 build command**。但 Pages 的配置又不支持写构建命令
（实测写 `[build] command` 会让整个文件被判为无效配置）。结果是二选一：

- 只写 `pages_build_output_dir` → 构建机认为「没有构建命令，跳过构建」，
  然后去找一个还不存在的 `build/`，构建直接失败；
- 写成「无效配置」→ 构建机跳过该文件、回落到 Dashboard 设置。能跑通，
  但每次构建都会刷一条配置无效的警告，纯属碰运气。

所以构建配置刻意只放在 Dashboard，仓库里不存 `wrangler.toml`。

## 改 logo 之后别忘了重新生成图标

`src/res/brand/logo.svg` 有两类消费方：

1. **内联进 HTML** —— `webpack/layout.js` 读它，生成顶部品牌行的 `<svg>`
   和 favicon 的 data URI（四个页面都有一份）；
2. **PNG 图标** —— `src/object/JumpGame.js` `import` 了 `icon-32/64/192/180.png`，
   走 webpack file-loader 输出带 hash 的文件名。

第 2 类**不会**跟着 SVG 自动变，改完 SVG 必须重新生成：

```
npm run icons      # = python3 scripts/gen-icons.py，需要 pip install cairosvg
```

记得把重新生成的 PNG 和 SVG 一起提交，否则标签页 / 主屏图标还是旧的那张。
