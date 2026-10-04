// ---------------------------------------------------------------------------
// 首次进入的玩法提示
//
// 只在第一次打开时显示一次：点过「Got it」之后往 localStorage 记一笔。
// 这只是**前端状态** —— 用户清了浏览器缓存/换浏览器，下次还会重新提示，
// 这正是我们想要的行为（不涉及任何后端）。
// ---------------------------------------------------------------------------

// 带版本号：以后如果玩法变了、提示语要重写，把 v1 改成 v2 就会重新提示所有人
const STORAGE_KEY = 'jumpjump.howto.v1';

// 「长按」示意：手指按住 + 一圈蓄力环（循环填充）。
//
// 这里用内联 SVG 而不是位图，原因有三个：
//   1. 要表达的是「按住会一直蓄力」这个**动态**概念 —— 静态图片说不清，
//      SVG 可以配一个循环动画；
//   2. 只有几百字节，任意尺寸都锐利（用户特意说了图不能大）；
//   3. 配色能跟着主题走（环用树莓红，和「Got it」按钮同一套色）。
const ILLUSTRATION = `
<svg viewBox="0 0 96 96" width="88" height="88" fill="none" aria-hidden="true">
  <!-- 蓄力环：底下是浅色轨道，上面是填充弧 -->
  <circle cx="48" cy="62" r="17" stroke="#ebdbe4" stroke-width="6"/>
  <circle class="how-to__ring" cx="48" cy="62" r="17" stroke="#f0455f" stroke-width="6"
          stroke-linecap="round" transform="rotate(-90 48 62)"/>

  <!-- 手指（垂直按住）。颜色特意比卡片背景深一档，小尺寸下轮廓才看得清 -->
  <rect x="41" y="10" width="14" height="52" rx="7" fill="#b3a7c4"/>
  <rect x="43.5" y="22" width="9" height="2.4" rx="1.2" fill="#9c8fb0"/>
  <rect x="43.5" y="30" width="9" height="2.4" rx="1.2" fill="#9c8fb0"/>
</svg>`;

export default class HowToOverlay {

  constructor (mount) {
    this.overlay = null;
    // 挂到游戏区里，浮层就不会盖住右侧正文
    this.mount = mount || document.body;

    this.build();

    // 没看过就直接弹出来
    if (!this.hasSeen()) {
      this.show();
    }
  }

  // localStorage 在隐私模式 / 沙箱 iframe 里可能直接抛异常，所以统一包一层
  hasSeen () {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch (error) {
      // 读不到就当作没看过 —— 宁可多提示一次，也不要漏掉
      return false;
    }
  }

  markSeen () {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch (error) {
      // 存不了也无所谓，下次打开再提示一遍，不是致命问题
    }
  }

  build () {
    const overlay = document.createElement('div');
    overlay.className = 'how-to';

    const card = document.createElement('div');
    card.className = 'how-to__card';

    const title = document.createElement('div');
    title.className = 'how-to__title';
    title.textContent = 'How to Play';

    // 示意图
    const art = document.createElement('div');
    art.className = 'how-to__art';
    art.innerHTML = ILLUSTRATION;

    // 两个时刻：按住蓄力 → 松手起跳
    const steps = document.createElement('ol');
    steps.className = 'how-to__steps';

    [
      'Press and hold anywhere to charge.',
      'Release to jump — the longer you hold, the farther you jump.',
    ].forEach((text) => {
      const item = document.createElement('li');

      item.textContent = text;
      steps.appendChild(item);
    });

    const tip = document.createElement('p');
    tip.className = 'how-to__tip';
    tip.textContent = 'Tip: check the gap between blocks, then hold just long enough to land on the next one.';

    const button = document.createElement('button');
    button.className = 'how-to__button';
    button.type = 'button';
    button.textContent = 'Got it';
    button.addEventListener('click', () => {
      this.markSeen();
      this.hide();
    });

    card.appendChild(title);
    card.appendChild(art);
    card.appendChild(steps);
    card.appendChild(tip);
    card.appendChild(button);
    overlay.appendChild(card);
    this.mount.appendChild(overlay);

    this.overlay = overlay;
  }

  show () {
    if (this.overlay) this.overlay.classList.add('is-visible');
  }

  hide () {
    if (this.overlay) this.overlay.classList.remove('is-visible');
  }

}
