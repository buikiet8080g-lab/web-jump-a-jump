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
 * 按倍数缩放 UV，实现「纹理平铺」而不是「拉伸铺满」。
 *
 * 为什么需要：箱子高度是固定的（Box.defaultHeight），但底面尺寸是随机的
 * （12.5 ~ 33.3）。如果 UV 一直保持 0~1，同一张贴图会被拉伸成 0.75:1 ~ 2:1
 * 的各种比例 —— 箱子一大一小看起来就不像同一种材质了。
 *
 * 缩放之后「一个纹理块的物理尺寸」恒定，箱子变大只是多铺几块。
 *
 * @param {BufferGeometry} geometry
 * @param {number} uScale        U 方向倍数
 * @param {number} vScale        V 方向倍数
 * @param {number[]} [range]     只处理顶点区间 [start, end)；不传则处理全部
 */
function tileUV(geometry, uScale, vScale = 1, range = null) {
  const uv = geometry.attributes && geometry.attributes.uv;
  if (!uv) return;

  const start = range ? range[0] : 0;
  const end = range ? range[1] : uv.count;

  for (let i = start; i < end; i++) {
    uv.setX(i, uv.getX(i) * uScale);
    uv.setY(i, uv.getY(i) * vScale);
  }
  uv.needsUpdate = true;
}

/**
 * 对立方体指定面做 UV 平铺。
 *
 * BoxGeometry 的面顺序与上面的常量一致，每面 4 个顶点（默认 1 个分段），
 * 所以第 f 个面的顶点区间就是 [f*4, f*4+4)。
 */
function tileCubeFaces(geometry, faceIndices, uScale, vScale = 1) {
  const uv = geometry.attributes && geometry.attributes.uv;
  if (!uv) return;

  faceIndices.forEach((faceIndex) => {
    tileUV(geometry, uScale, vScale, [faceIndex * 4, faceIndex * 4 + 4]);
  });
}

export {
  recreateCubeUV,
  tileUV,
  tileCubeFaces,
  RIGHT,
  LEFT,
  TOP,
  BOTTOM,
  BEHIND,
  AFTER
}


