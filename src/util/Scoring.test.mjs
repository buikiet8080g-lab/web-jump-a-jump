import { test } from 'node:test';
import assert from 'node:assert/strict';

// constant.js 会读 window 拿画布尺寸，Node 里没有 window，
// 所以先塞一个最小实现再**动态** import（静态 import 会被提升到前面，来不及）。
globalThis.window = { innerWidth: 393, innerHeight: 852 };

const {
  difficultyOf,
  difficultyScore,
  comboMultiplier,
  isPerfect,
  scoreJump,
} = await import('./Scoring.js');

const {
  BLOCK_MIN_SIZE,
  BLOCK_MAX_SIZE,
  BLOCK_MIN_DISTANCE,
  BLOCK_MAX_DISTANCE,
  SCORE_MIN,
  SCORE_MAX,
  SCORE_COMBO_CAP,
  PERFECT_BONUS_CAP,
} = await import('../config/constant.js');

test('难度：最容易的一跳是 0，最难的一跳是 1', () => {
  assert.equal(difficultyOf(BLOCK_MIN_DISTANCE, BLOCK_MAX_SIZE), 0);
  assert.equal(difficultyOf(BLOCK_MAX_DISTANCE, BLOCK_MIN_SIZE), 1);
});

test('难度：方块越小、间距越大，难度单调递增', () => {
  const size = 20;

  assert.ok(difficultyOf(15, size) < difficultyOf(30, size));
  assert.ok(difficultyOf(30, 30) < difficultyOf(30, 15));
});

test('难度：永远被夹在 0~1 之间（地图参数即使越界也不炸）', () => {
  assert.equal(difficultyOf(1, 1000), 0);
  assert.equal(difficultyOf(1000, 1), 1);
});

test('难度：退化输入（方块宽度 / 间距为 0）不能算出 NaN', () => {
  // NaN 会一路污染总分，所以宁可兜底成 0
  for (const [gap, size] of [[0, 0], [10, 0], [0, 20], [-5, 20]]) {
    const d = difficultyOf(gap, size);

    assert.ok(Number.isFinite(d), `算出了非有限值: ${d}`);
  }
});

test('难度分：落在 SCORE_MIN ~ SCORE_MAX 之间', () => {
  assert.equal(difficultyScore(BLOCK_MIN_DISTANCE, BLOCK_MAX_SIZE), SCORE_MIN);
  assert.equal(difficultyScore(BLOCK_MAX_DISTANCE, BLOCK_MIN_SIZE), SCORE_MAX);

  // 随机撒一批，确认不会越界
  for (let i = 0; i < 500; i++) {
    const gap = BLOCK_MIN_DISTANCE + Math.random() * (BLOCK_MAX_DISTANCE - BLOCK_MIN_DISTANCE);
    const size = BLOCK_MIN_SIZE + Math.random() * (BLOCK_MAX_SIZE - BLOCK_MIN_SIZE);
    const score = difficultyScore(gap, size);

    assert.ok(score >= SCORE_MIN && score <= SCORE_MAX, `越界: ${score}`);
  }
});

test('连击倍率：第 1 跳不打折，之后每跳 +0.1，到顶封住', () => {
  assert.equal(comboMultiplier(0), 1);
  assert.equal(comboMultiplier(1), 1);
  assert.equal(comboMultiplier(2), 1.1);

  const cap = 1 + SCORE_COMBO_CAP * 0.1;
  assert.equal(comboMultiplier(SCORE_COMBO_CAP + 1), cap);
  assert.equal(comboMultiplier(999), cap);
});

test('完美落点：容差随方块宽度成比例', () => {
  // 宽度 20 时，中心 ±15% = ±3
  assert.equal(isPerfect(0, 20), true);
  assert.equal(isPerfect(3, 20), true);
  assert.equal(isPerfect(3.1, 20), false);
  // 大方块容差更大，不会被"更容易满分"
  assert.equal(isPerfect(3.1, 40), true);
});

test('单跳结算：得分 = 难度分 × 连击倍率 + 完美奖励', () => {
  const gap = BLOCK_MAX_DISTANCE;
  const size = BLOCK_MIN_SIZE;

  // 不带连击、不完美
  const plain = scoreJump({ gap, targetSize: size, offsetFromCenter: size, combo: 1, perfectCombo: 0 });
  assert.equal(plain.base, SCORE_MAX);
  assert.equal(plain.mult, 1);
  assert.equal(plain.perfect, false);
  assert.equal(plain.bonus, 0);
  assert.equal(plain.points, SCORE_MAX);

  // 连击 11 跳 → ×2；再来一次完美 → 完美奖励 +1
  const boosted = scoreJump({ gap, targetSize: size, offsetFromCenter: 0, combo: SCORE_COMBO_CAP + 1, perfectCombo: 0 });
  assert.equal(boosted.mult, 2);
  assert.equal(boosted.perfect, true);
  assert.equal(boosted.bonus, 1);
  assert.equal(boosted.points, SCORE_MAX * 2 + 1);
});

test('完美连击：连上递增，断了归零', () => {
  const args = { gap: 20, targetSize: 20, combo: 1 };

  const first = scoreJump({ ...args, offsetFromCenter: 0, perfectCombo: 0 });
  assert.equal(first.nextPerfectCombo, 1);
  assert.equal(first.bonus, 1);

  const second = scoreJump({ ...args, offsetFromCenter: 0, perfectCombo: 1 });
  assert.equal(second.nextPerfectCombo, 2);
  assert.equal(second.bonus, 2);

  // 这一跳不完美 → 连击断掉
  const broken = scoreJump({ ...args, offsetFromCenter: 999, perfectCombo: 5 });
  assert.equal(broken.perfect, false);
  assert.equal(broken.nextPerfectCombo, 0);
  assert.equal(broken.bonus, 0);
});

test('完美奖励封顶', () => {
  const result = scoreJump({ gap: 20, targetSize: 20, offsetFromCenter: 0, combo: 1, perfectCombo: 999 });

  assert.equal(result.bonus, PERFECT_BONUS_CAP);
});
