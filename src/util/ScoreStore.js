// ---------------------------------------------------------------------------
// 最高分存储
//
// 只存在浏览器本地（localStorage），**不涉及任何联网** —— 就是自己跟自己比。
// 清了浏览器缓存/换浏览器，最高分就归零，这是预期行为。
// ---------------------------------------------------------------------------

// key 带版本号：以后如果改了计分公式，旧纪录和新分数就不可比了，
// 那时候把 v1 改成 v2，所有人的最高分重新开始 ——
// 否则会出现「新规则下永远破不了旧纪录」的尴尬。
const BEST_KEY = 'jumpjump.best.v1';

export function loadBest () {
  try {
    const value = Number(window.localStorage.getItem(BEST_KEY));

    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch (error) {
    // localStorage 在隐私模式 / 沙箱 iframe 里可能直接抛异常
    return 0;
  }
}

export function saveBest (score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(Math.floor(score)));
  } catch (error) {
    // 存不了就算了，只是最高分记不住，不影响玩
  }
}
