import Stage from './Stage';
import BoxGroup from './BoxGroup';
import LittleMan from './LittleMan';
import {setFrameAction} from '../util/TweenUtil';
import {scoreJump} from '../util/Scoring';
import HowToOverlay from '../ui/HowToOverlay';
import ScoreBoard from '../ui/ScoreBoard';

// 品牌素材（webpack 处理后文件名带 hash，所以只能 import 进来拿 URL）
import logoUrl from '../res/brand/logo.svg';
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
    // 先把页面外壳（页面图标 + 顶部标题 + 分数板）搭好，用户不用等 WebGL 初始化
    this.scoreBoard = new ScoreBoard();
    this.initBranding();
    // 初始化舞台
    this.stage = new Stage();
    // 初始化盒子
    this.initBoxes();
    // 初始化小人
    this.initLittleMan();
    // 每次动画后都要渲染
    setFrameAction(this.stage.render.bind(this.stage));
    // 初始化结束提示
    this.initOverlay();
    // 首次进入的玩法提示（只在第一次打开时显示，记在 localStorage）
    this.howTo = new HowToOverlay();
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

  // ---------------- 品牌：页面图标 + 顶部标题栏 ----------------

  initBranding() {
    this.initFavicon();
    this.initHeader();
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

  // 顶部：品牌行（logo + 游戏名）+ 分数板
  // 两者都直接叠在游戏区上，没有自己的背景色
  initHeader() {
    const header = document.createElement('header');
    header.className = 'game-header';

    const brand = document.createElement('div');
    brand.className = 'game-header__brand';

    const logo = document.createElement('img');
    logo.className = 'game-header__logo';
    logo.src = logoUrl;
    logo.alt = '';
    logo.width = 30;
    logo.height = 30;

    const name = document.createElement('span');
    name.className = 'game-header__name';
    // 名字只留一处来源：webpack.config.js 里 HtmlWebpackPlugin 的 title
    name.textContent = document.title;

    brand.appendChild(logo);
    brand.appendChild(name);
    header.appendChild(brand);

    // 分数板挂在品牌行下面
    header.appendChild(this.scoreBoard.element);
    document.body.appendChild(header);

    this.header = header;
  }

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
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    this.overlayScore = scoreValue;
    this.overlayBest = bestValue;
    this.overlayNewBest = newBest;

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
