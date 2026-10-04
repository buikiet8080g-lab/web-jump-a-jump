// ---------------------------------------------------------------------------
// 贴图缓存
//
// 职责有三：
//   1. 同一个 URL 全局只加载一次
//   2. 允许平铺（UV 会超过 0~1）
//   3. 加载完成后催一帧重绘 —— 这是修复「箱子渲染成黑色」的关键
//
// 为什么必须有第 1 条：
//   ExpressBox / MagicCubeBox 标了 isStatic，网格会缓存复用，贴图只加载一次；
//   但 CubeBox / CylinderBox 是**每个箱子都 new 一次**的 —— 如果照抄原来
//   `new TextureLoader().load(url)` 的写法，每生成一个箱子就会重新下载 + 解码
//   同一张图，几十个箱子下去直接卡死。
//
// 为什么必须有第 3 条：
//   这个游戏是「按需渲染」的（见 util/TweenUtil.js）：只有 TWEEN 动画在跑时才
//   render()，静下来就停掉 rAF。而贴图是异步加载的，于是必然出现这个竞态 ——
//   启动时箱子先画出来（贴图还没到 → 采样到空白 → 黑箱），等启动动画结束已经
//   不重绘了，贴图才刚加载完，黑箱就永久留在屏幕上，直到玩家下一次操作才恢复。
//   所以在 onLoad 里主动催一帧，黑箱就会在贴图到位的瞬间自动消失。
// ---------------------------------------------------------------------------

import { TextureLoader, RepeatWrapping } from 'three';
import { requestRender } from './TweenUtil';

const loader = new TextureLoader();
const cache = new Map();

export function getTexture(url) {
  if (!url) return null;

  if (!cache.has(url)) {
    const texture = loader.load(url, () => {
      // 贴图到位了，立刻重绘一帧（否则按需渲染的游戏会一直停在黑箱那一帧）
      requestRender();
    });

    // 箱子底面尺寸是随机的，平铺时 UV 会超过 0~1，必须允许循环
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    // 注意：这里**不要**调用 texture.dispose()。
    // BoxGroup 在箱子跑远后会 dispose 掉 geometry/material，
    // 但 material.dispose() 不会连带释放贴图，共享贴图是安全的。
    cache.set(url, texture);
  }

  return cache.get(url);
}

// 供调试/换主题时用
export function clearTextureCache() {
  cache.clear();
}
