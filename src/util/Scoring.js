// ---------------------------------------------------------------------------
// 计分规则
//
// 这一整个文件都是**纯函数** —— 不碰 DOM、不碰 three.js、不读存储，
// 所以可以直接跑单元测试（见 Scoring.test.mjs）。
//
// 难度是怎么定义的，先说清楚：
//   成功判定窗口的宽度**就等于落点方块的宽度**（见 LittleMan.calculateState：
//   jumpDistance 落在 [nextNearEdge, nextFarEdge) 内才算跳中）。
//   而玩家实际控制的量是「按压时长」，它正比于间距。
//   所以这个比值就是「需要按多久 ÷ 允许多大误差」：
//
//       ratio = 间距 / 落点宽度        范围 0.375 ~ 4.0
//
//   ratio 小 = 方块大、间距近（随便按都中）；ratio 大 = 方块小、间距远（要拿捏得准）。
// ---------------------------------------------------------------------------

import {
  BLOCK_MIN_SIZE,
  BLOCK_MAX_SIZE,
  BLOCK_MIN_DISTANCE,
  BLOCK_MAX_DISTANCE,
  SCORE_MIN,
  SCORE_MAX,
  SCORE_COMBO_STEP,
  SCORE_COMBO_CAP,
  PERFECT_RADIUS_RATIO,
  PERFECT_BONUS_CAP,
  // 这里特意写全 .js —— 项目其他地方是 webpack 风格省略扩展名，
  // 但这个文件要能被 Node 直接跑单元测试（见 Scoring.test.mjs），
  // 而 Node 的 ESM 解析器必须要有扩展名。webpack 两种写法都认。
} from '../config/constant.js';

// ratio 的理论上下界（由地图生成参数决定）
const RATIO_MIN = BLOCK_MIN_DISTANCE / BLOCK_MAX_SIZE;
const RATIO_MAX = BLOCK_MAX_DISTANCE / BLOCK_MIN_SIZE;

const LN_RATIO_MIN = Math.log(RATIO_MIN);
const LN_RATIO_MAX = Math.log(RATIO_MAX);
const LN_RATIO_SPAN = LN_RATIO_MAX - LN_RATIO_MIN;

/**
 * 难度系数，0 ~ 1。
 *
 * 归一化取**对数**而不是线性：人对时长的感知本身就是对数性的（韦伯定律 ——
 * 时长越长，能分辨的差异越大）；而且线性归一化会把绝大多数跳数都挤到低分段，
 * 分数会显得很"平"。
 */
export function difficultyOf (gap, targetSize) {
  // 退化配置兜底：地图参数如果把间距上下限设成相等（或方块宽度为 0），
  // 分母 LN_RATIO_SPAN 会是 0 —— 这里直接给个下限值，
  // 不要让分数算出 NaN（NaN 会一路污染总分）。
  if (!(LN_RATIO_SPAN > 0) || !(targetSize > 0)) {
    return 0;
  }

  const ratio = gap / targetSize;

  // 负值 / 0 / NaN 的 ratio 会让 Math.log 返回 NaN 或 -Infinity，一并不放进公式
  if (!(ratio > 0)) {
    return 0;
  }

  const t = (Math.log(ratio) - LN_RATIO_MIN) / LN_RATIO_SPAN;

  return Math.min(1, Math.max(0, t));
}

// 单跳难度分（SCORE_MIN ~ SCORE_MAX）
export function difficultyScore (gap, targetSize) {
  const span = SCORE_MAX - SCORE_MIN;

  return SCORE_MIN + Math.round(difficultyOf(gap, targetSize) * span);
}

/**
 * 连击倍率。
 *
 * combo 是「连续成功次数（含当前这一跳）」，所以：
 *   第 1 跳 ×1.0、第 2 跳 ×1.1 …… 到 SCORE_COMBO_CAP+1 跳及以后封顶 ×(1+CAP*STEP)
 */
export function comboMultiplier (combo) {
  const steps = Math.min(Math.max(combo - 1, 0), SCORE_COMBO_CAP);

  return 1 + steps * SCORE_COMBO_STEP;
}

// 落点离方块中心多近算「完美」—— 容差按方块宽度成比例，大方块不会更容易满分
export function isPerfect (offsetFromCenter, targetSize) {
  return Math.abs(offsetFromCenter) <= targetSize * PERFECT_RADIUS_RATIO;
}

/**
 * 结算一跳。
 *
 * @param {number} gap               这一跳的间距
 * @param {number} targetSize        落点方块的宽度（也就是成功判定窗口的宽度）
 * @param {number} offsetFromCenter  落点离该方块中心的距离
 * @param {number} combo             连续成功次数（含这一跳）
 * @param {number} perfectCombo      此前连续「完美」的次数
 */
export function scoreJump ({ gap, targetSize, offsetFromCenter, combo, perfectCombo }) {
  const perfect = isPerfect(offsetFromCenter, targetSize);
  // 完美连击：连上了 +1，断了归零
  const nextPerfectCombo = perfect ? perfectCombo + 1 : 0;

  const base = difficultyScore(gap, targetSize);
  const mult = comboMultiplier(combo);
  const bonus = perfect ? Math.min(nextPerfectCombo, PERFECT_BONUS_CAP) : 0;

  return {
    // 难度分先乘连击倍率，再加完美奖励（完美奖励不参与倍率，否则会滚雪球）
    points: Math.round(base * mult) + bonus,
    base,
    mult,
    bonus,
    perfect,
    nextPerfectCombo,
  };
}
