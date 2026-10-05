import Stage from './Stage';
import BoxGroup from './BoxGroup';
import LittleMan from './LittleMan';
import {setFrameAction} from '../util/TweenUtil';
import {scoreJump} from '../util/Scoring';
import HowToOverlay from '../ui/HowToOverlay';
import ScoreBoard from '../ui/ScoreBoard';
import {scoreShareIntent} from '../util/Share';

// 页面图标素材（webpack 处理后文件名带 hash，所以只能 import 进来拿 URL）
// 注意：logo.svg 不在这里 —— 顶部品牌行是静态 HTML，logo 直接内联在页面里
import favicon32 from '../res/brand/icon-32.png';
import favicon64 from '../res/brand/icon-64.png';
import favicon192 from '../res/brand/icon-192.png';
import appleTouchIcon from '../res/brand/icon-180.png';

export default class JumpGame {

  constructor () {
    // 舞台
    this.stage = null;
    // 盒子组
    this.boxGroup = null;
    // 小人
    this.littleMan = null;
    // 本局结束的提示浮层
    this.overlay = null;
    // 游戏初始化
    this.init();
  }

  init() {
    // 游戏挂到哪里。首页里有这个宿主元素（见 webpack/pages/home.js），
    // 量不到就退回 body —— 这样在别处复用也不会直接挂掉
    this.mount = document.querySelector('[data-game-canvas]') || document.body;

    // 先把页面图标和分数板搭好，用户不用等 WebGL 初始化。
    // 品牌行（logo + 游戏名）不在这里了 —— 它变成页面导航栏的一部分，
    // 静态写在 HTML 里（见 webpack/layout.js），内容页和游戏页共用一份。
    this.scoreBoard = new ScoreBoard();
    this.initBranding();
    // 初始化舞台
    this.stage = new Stage(this.mount);
    // 初始化盒子
    this.initBoxes();
    // 初始化小人
    this.initLittleMan();
    // 每次动画后都要渲染
    setFrameAction(this.stage.render.bind(this.stage));
    // 初始化结束提示
    this.initOverlay();
    // 首次进入的玩法提示（只在第一次打开时显示，记在 localStorage）
    this.howTo = new HowToOverlay(this.mount);
  }

  initBoxes() {
    this.boxGroup = new BoxGroup();

    // 初始化首个盒子
    this.boxGroup.createBox();
    // 初始化第二个盒子
    this.boxGroup.createBox();
    // 盒子加入场景
    this.boxGroup.enterStage(this.stage);
  }

  initLittleMan() {
    // 小人初始化
    this.littleMan = new LittleMan(this.stage, this.boxGroup);
    // 将小人给盒子一份，方便盒子移动的时候带上小人
    this.boxGroup.setLittleMan(this.littleMan);
    // 加入舞台
    this.littleMan.enterStage(this.stage);

    // 本局结束（掉下去）时弹提示
    this.littleMan.onGameOver = () => this.showOverlay();
    // 跳中一下 → 结算得分
    this.littleMan.onScore = (jump) => this.scoreBoard.addJump(
      scoreJump({
        gap: jump.gap,
        targetSize: jump.targetSize,
        offsetFromCenter: jump.offsetFromCenter,
        // 连击数含当前这一跳，所以要 +1
        combo: this.scoreBoard.combo + 1,
        perfectCombo: this.scoreBoard.perfectCombo,
      })
    );

    // 更新盒子和小人的位置
    this.boxGroup.updatePosition({
      duration: 0
    });
  }

  // ---------------- 品牌：页面图标 ----------------

  initBranding() {
    this.initFavicon();
    // 分数板直接叠在游戏区上，没有自己的背景色
    this.mount.appendChild(this.scoreBoard.element);
  }

  /**
   * 页面图标（浏览器标签页 / 书签 / 添加到主屏）。
   *
   * 不写在 HTML 模板里的原因：素材过了 webpack，文件名带 hash，
   * 只有 import 进来才能拿到真实 URL。
   */
  initFavicon() {
    const links = [
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32 },
      { rel: 'icon', type: 'image/png', sizes: '64x64', href: favicon64 },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: favicon192 },
      { rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIcon },
    ];

    links.forEach((attrs) => {
      const link = document.createElement('link');

      Object.keys(attrs).forEach((key) => link.setAttribute(key, attrs[key]));
      document.head.appendChild(link);
    });
  }

  // 顶部品牌行已移到静态 HTML（见 webpack/layout.js），这里不再生成。
  // 分数板挂在游戏区里，由 initBranding 处理。

  // ---------------- 结束提示 ----------------

  initOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over';

    const card = document.createElement('div');
    card.className = 'game-over__card';

    const title = document.createElement('div');
    title.className = 'game-over__title';
    title.textContent = 'Game Over';

    const desc = document.createElement('div');
    desc.className = 'game-over__desc';
    desc.textContent = 'You missed the block.';

    const button = document.createElement('button');
    button.className = 'game-over__button';
    button.type = 'button';
    button.textContent = 'Play Again';
    button.addEventListener('click', () => this.restart());

    // 「分享到 X」。就是个普通 <a>（见 util/Share.js）：不需要 X 的 SDK、
    // 不需要开发者账号，点了只打开预填好成绩的发帖框，发不发由用户决定。
    // href 每次结算时才拼（要带本局分数），这里先建好元素。
    const share = document.createElement('a');
    share.className = 'game-over__share';
    share.target = '_blank';
    share.rel = 'noopener';
    share.textContent = 'Share on X';

    // 本局成绩
    const stats = document.createElement('div');
    stats.className = 'game-over__stats';

    const scoreValue = document.createElement('strong');
    scoreValue.className = 'game-over__stat-value';

    const bestValue = document.createElement('strong');
    bestValue.className = 'game-over__stat-value';

    const newBest = document.createElement('em');
    newBest.className = 'game-over__new-best';
    newBest.textContent = 'NEW BEST';

    stats.appendChild(this.makeStatRow('Score', scoreValue));
    stats.appendChild(this.makeStatRow('Best', bestValue, newBest));

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(stats);
    card.appendChild(button);
    card.appendChild(share);
    overlay.appendChild(card);
    this.mount.appendChild(overlay);

    this.overlayScore = scoreValue;
    this.overlayBest = bestValue;
    this.overlayNewBest = newBest;
    this.overlayShare = share;

    this.overlay = overlay;
  }

  // 结算卡片里的一行「标签 + 数值 [+ 附加标记]」
  makeStatRow (label, value, extra) {
    const row = document.createElement('div');
    row.className = 'game-over__stat';

    const name = document.createElement('span');
    name.className = 'game-over__stat-label';
    name.textContent = label;

    row.appendChild(name);
    row.appendChild(value);
    if (extra) row.appendChild(extra);

    return row;
  }

  showOverlay() {
    if (!this.overlay) return;

    const {score, best, beatBest} = this.scoreBoard;

    this.overlayScore.textContent = String(score);
    this.overlayBest.textContent = String(best);
    this.overlayNewBest.classList.toggle('is-on', beatBest);

    // 分享的文案要带本局分数，所以每次结算重新拼一次链接。
    // 0 分（一上来就掉下去）就不给分享了 —— 分享「我得了 0 分」没意义。
    this.overlayShare.href = scoreShareIntent(score);
    this.overlayShare.classList.toggle('is-hidden', score < 1);

    this.overlay.classList.add('is-visible');
  }

  hideOverlay() {
    if (this.overlay) this.overlay.classList.remove('is-visible');
  }

  // ---------------- 重开一局 ----------------

  restart() {
    this.hideOverlay();

    // 本局分数清零（最高分保留）
    this.scoreBoard.reset();

    // 1) 拆掉上一局
    //    解绑小人身上的输入监听（否则每重开一次就多挂一份）
    this.littleMan.destroy();
    //    释放盒子的几何体/材质
    this.boxGroup.destroy();
    //    把盒子组、小人、拖尾碎片从场景里摘掉（保留地面和灯光）
    this.stage.removeGameObjects();

    // 2) 重建一局 —— 渲染器/相机/灯光/贴图缓存全部复用，所以这一步很快
    this.initBoxes();
    this.initLittleMan();

    // 3) 立刻画一帧，不等下一次交互
    this.stage.render();
  }

  start() {
    this.stage.render();
  }

}
