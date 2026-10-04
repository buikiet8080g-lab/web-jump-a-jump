import * as THREE from 'three';

const RIGHT = 0;
const LEFT = 1;
const TOP = 2;
const BOTTOM = 3;
const BEHIND = 4;
const AFTER = 5;
function recreateCubeUV(textureWidth, textureHeight, geometry, faceIndex, x1, y1, x2, y2, rotate) {
  // 将 px 坐标转换到 uv 坐标
  const tileUvW = 1 / textureWidth;
  const tileUvH = 1 / textureHeight;
  let UVs = geometry.faceVertexUvs[0][faceIndex * 2];
  if (rotate) {
    UVs[0].x = x1 * tileUvW;
    UVs[0].y = y1 * tileUvH;
    UVs[2].x = x1 * tileUvW;
    UVs[2].y = y2 * tileUvH;
    UVs[1].x = x2 * tileUvW;
    UVs[1].y = y1 * tileUvH;
  } else {
    UVs[0].x = x1 * tileUvW;
    UVs[0].y = y1 * tileUvH;
    UVs[1].x = x1 * tileUvW;
    UVs[1].y = y2 * tileUvH;
    UVs[2].x = x2 * tileUvW;
    UVs[2].y = y1 * tileUvH;
  }
  UVs = geometry.faceVertexUvs[0][faceIndex * 2 + 1];
  if (rotate) {
    UVs[2].x = x1 * tileUvW;
    UVs[2].y = y2 * tileUvH;
    UVs[1].x = x2 * tileUvW;
    UVs[1].y = y2 * tileUvH;
    UVs[0].x = x2 * tileUvW;
    UVs[0].y = y1 * tileUvH;
  } else {
    UVs[0].x = x1 * tileUvW;
    UVs[0].y = y2 * tileUvH;
    UVs[1].x = x2 * tileUvW;
    UVs[1].y = y2 * tileUvH;
    UVs[2].x = x2 * tileUvW;
    UVs[2].y = y1 * tileUvH;
  }
}

/**
 * 把 UV 以 (0.5, 0.5) 为中心做等比缩放。
 *
 * 为什么不是像平铺那样直接从 0 乘：
 *   直接乘（uScale=3）是「平铺」语义 —— 同一个图案在面上出现 3 次；
 *   以中心缩放是「取贴图中间的一块」语义 —— 图案只出现一次，且居中。
 *
 * 典型用法是让「一个纹理单位 = 方块高度」：
 *   侧面（size 宽 × height 高）→ u 方向乘 size/height、v 方向乘 1
 * 这样图案在**物理尺寸上是正方形**。方块大小变化只是周围留白多少不同，
 * 不会把图案拉变形，也不会铺成一堆小图。
 *
 * UV 超出 0~1 的部分靠贴图的 ClampToEdge 采样到边缘像素（＝全透明，alpha = 0），
 * 所以不会重复。这些区域的底色怎么补上见 util/MaterialUtil.js。
 *
 * @param {BufferGeometry} geometry
 * @param {number} uScale        U 方向倍数（相对中心）
 * @param {number} vScale        V 方向倍数（相对中心）
 * @param {number[]} [range]     只处理顶点区间 [start, end)；不传则处理全部
 */
function fitUV(geometry, uScale, vScale = 1, range = null) {
  const uv = geometry.attributes && geometry.attributes.uv;
  if (!uv) return;

  const start = range ? range[0] : 0;
  const end = range ? range[1] : uv.count;

  for (let i = start; i < end; i++) {
    uv.setX(i, (uv.getX(i) - 0.5) * uScale + 0.5);
    uv.setY(i, (uv.getY(i) - 0.5) * vScale + 0.5);
  }
  uv.needsUpdate = true;
}

/**
 * 对立方体指定面做「居中适配」。
 *
 * BoxGeometry 的面顺序与上面的常量一致，每面 4 个顶点（默认 1 个分段），
 * 所以第 f 个面的顶点区间就是 [f*4, f*4+4)。
 */
function fitCubeFaces(geometry, faceIndices, uScale, vScale = 1) {
  faceIndices.forEach((faceIndex) => {
    fitUV(geometry, uScale, vScale, [faceIndex * 4, faceIndex * 4 + 4]);
  });
}

export {
  recreateCubeUV,
  fitUV,
  fitCubeFaces,
  RIGHT,
  LEFT,
  TOP,
  BOTTOM,
  BEHIND,
  AFTER
}


