import TWEEN from '@tweenjs/tween.js'

// 每次动画 update 都要做的事情
// 本例中绑定了 render 函数
let frameAction = () => {};

const animateFrame = function () {
  if (animateFrame.running) {
    return
  }
  animateFrame.running = true;

  const animate = () => {
    const id = requestAnimationFrame(animate);
    const success = TWEEN.update();

    if (success) {
      frameAction && frameAction();
    } else {
      animateFrame.running = false;
      cancelAnimationFrame(id);
    }
  };
  animate()
};

const setFrameAction = (cb) => {
  frameAction = cb;
};

// 主动触发一次重绘。
//
// 为什么需要：这个游戏是「按需渲染」的 —— 只有 TWEEN 动画在跑时才 render()，
// 一旦静下来就停掉 rAF。但贴图是**异步加载**的：启动时箱子先画出来（贴图还没到
// → 渲染成黑色），等启动动画结束已经不重绘了，贴图才加载完 → 黑箱就永久留在
// 屏幕上，直到玩家下一次操作。所以贴图 onLoad 时必须自己催一帧。
const requestRender = () => {
  frameAction && frameAction();
};

export{
  animateFrame,
  setFrameAction,
  requestRender
}
