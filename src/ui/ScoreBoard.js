// ---------------------------------------------------------------------------
// 分数板（HUD）
//
// 位置在游戏区顶部、标题下面（不单独占一条背景，和标题一样直接叠在画面上）。
// 显示：本局得分 + 连击倍率 + 历史最高分。
// ---------------------------------------------------------------------------

import { loadBest, saveBest } from '../util/ScoreStore';

export default class ScoreBoard {

  constructor () {
    // 本局得分
    this.score = 0;
    // 本局连续成功次数
    this.combo = 0;
    // 当前连击倍率
    this.mult = 1;
    // 连续「完美落点」次数（完美奖励按它递增）—— 必须给初值，
    // 否则第一次完美时 undefined + 1 = NaN，会把总分污染掉
    this.perfectCombo = 0;
    // 历史最高分（只存在浏览器本地）
    this.best = loadBest();
    // 本局是否已经破过纪录
    this.beatBest = false;

    this.build();
    this.render();
  }

  build () {
    const board = document.createElement('div');
    board.className = 'scoreboard';

    const score = document.createElement('span');
    score.className = 'scoreboard__score';

    const combo = document.createElement('span');
    combo.className = 'scoreboard__combo';

    const best = document.createElement('span');
    best.className = 'scoreboard__best';

    // 得分飘字（每次得分冒一个 +N 出来）
    const pop = document.createElement('span');
    pop.className = 'scoreboard__pop';

    board.appendChild(score);
    board.appendChild(combo);
    board.appendChild(best);
    board.appendChild(pop);

    this.board = board;
    this.scoreEl = score;
    this.comboEl = combo;
    this.bestEl = best;
    this.popEl = pop;
  }

  get element () {
    return this.board;
  }

  // 开新一局：本局清零，最高分保留
  reset () {
    this.score = 0;
    this.combo = 0;
    this.mult = 1;
    this.perfectCombo = 0;
    this.beatBest = false;

    this.render();
  }

  /**
   * 记一跳。
   *
   * @param {{points:number, mult:number, perfect:boolean}} result
   *        util/Scoring.js 里 scoreJump() 的返回值
   */
  addJump (result) {
    this.combo += 1;
    this.mult = result.mult;
    // 完美连击次数由结算结果回写：连上了递增、断了归零
    this.perfectCombo = result.nextPerfectCombo;
    this.score += result.points;

    // 破纪录时最高分实时跟着涨 —— 玩家能看到自己正在刷新纪录
    if (this.score > this.best) {
      this.best = this.score;
      this.beatBest = true;
      saveBest(this.best);
    }

    this.render();
    this.popPoints(result);
  }

  render () {
    this.scoreEl.textContent = String(this.score);
    this.bestEl.textContent = `Best ${this.best}`;

    // 连击标记：第 2 跳起才显示倍率
    if (this.combo >= 2) {
      this.comboEl.textContent = `×${this.mult.toFixed(1)}`;
      this.comboEl.classList.add('is-on');
    } else {
      this.comboEl.textContent = '';
      this.comboEl.classList.remove('is-on');
    }

    this.scoreEl.classList.toggle('is-best', this.beatBest);
  }

  // 得分飘字（+N，完美落点额外标出来）
  popPoints (result) {
    const el = this.popEl;

    el.textContent = result.perfect ? `+${result.points} PERFECT` : `+${result.points}`;
    el.classList.toggle('is-perfect', result.perfect);

    // 摘掉动画类 → 强制回流 → 再加回来：动画才能重复触发
    el.classList.remove('is-on');
    void el.offsetWidth;
    el.classList.add('is-on');
  }

}
