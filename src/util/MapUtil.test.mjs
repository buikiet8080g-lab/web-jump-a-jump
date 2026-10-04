// ---------------------------------------------------------------------------
// MapUtil 的 UV 适配测试
//
// 为什么需要这个测试：
//   「图案有没有被拉变形」在等轴视角的截图里是**判断不出来的** —— 顶面是
//   45° 斜看的，正方形本来就会显示成 2:1 的菱形；侧面又会被水平压缩。
//   肉眼看着"扁"不代表 UV 错了。
//
//   所以这里绕开渲染，直接量：把「每一份贴图单位对应多少世界坐标长度」在
//   U 方向和 V 方向分别算出来。两者相等 = 图案在方块表面上物理尺寸是正方形。
// ---------------------------------------------------------------------------

import test from 'node:test';
import assert from 'node:assert/strict';
import { BoxBufferGeometry } from 'three';
import {
  fitUV,
  fitCubeFaces,
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
  BEHIND,
  AFTER,
} from './MapUtil.js';

const SIDE_FACES = [LEFT, RIGHT, BEHIND, AFTER];

function edgeLength(geometry, i, j) {
  const p = geometry.attributes.position;
  return Math.hypot(
    p.getX(i) - p.getX(j),
    p.getY(i) - p.getY(j),
    p.getZ(i) - p.getZ(j)
  );
}

/**
 * 量一个面：「一个贴图单位」在 U / V 方向各对应多少世界长度。
 *
 * 面的 4 个顶点 UV 落在矩形四角，所以「只差 u」的那对顶点之间的世界距离
 * 就是这条边的物理长度，除以 UV 增量就是 U 方向的比例尺。
 */
function uvScale(geometry, faceIndex) {
  const uv = geometry.attributes.uv;
  const idx = [0, 1, 2, 3].map((k) => faceIndex * 4 + k);

  let u = null;
  let v = null;

  for (let a = 0; a < 4; a++) {
    for (let b = a + 1; b < 4; b++) {
      const i = idx[a];
      const j = idx[b];
      const du = Math.abs(uv.getX(i) - uv.getX(j));
      const dv = Math.abs(uv.getY(i) - uv.getY(j));
      const len = edgeLength(geometry, i, j);

      // 只差 u → 这条边是 u 方向
      if (dv < 1e-6 && du > 1e-6) u = len / du;
      // 只差 v → 这条边是 v 方向
      if (du < 1e-6 && dv > 1e-6) v = len / dv;
    }
  }

  assert.ok(u !== null && v !== null, `面 ${faceIndex} 没量到 U/V 比例尺`);
  return { u, v };
}

// 箱子高度固定、底面尺寸随机，这就是实际会遇到的比值区间
const HEIGHT = 16.667; // BLOCK_MAX_SIZE / 2
const SIZES = [12.5, 16.667, 20, 25, 33.333];

test('侧面：图案在世界空间里是正方形（箱子宽高比 0.75~2 全区间）', () => {
  for (const size of SIZES) {
    const geometry = new BoxBufferGeometry(size, HEIGHT, size);
    const ratio = size / HEIGHT;

    fitCubeFaces(geometry, SIDE_FACES, ratio, 1);

    for (const face of SIDE_FACES) {
      const { u, v } = uvScale(geometry, face);
      const aspect = u / v;

      assert.ok(
        Math.abs(aspect - 1) < 0.01,
        `size=${size} 面=${face} 图案被拉成 ${aspect.toFixed(3)}:1`
      );
    }
  }
});

test('顶面/底面：用和侧面同一个比例尺（否则图案会大 ratio 倍）', () => {
  for (const size of SIZES) {
    const geometry = new BoxBufferGeometry(size, HEIGHT, size);
    const ratio = size / HEIGHT;

    fitCubeFaces(geometry, SIDE_FACES, ratio, 1);
    fitCubeFaces(geometry, [TOP, BOTTOM], ratio, ratio);

    for (const face of [TOP, BOTTOM]) {
      const { u, v } = uvScale(geometry, face);
      const aspect = u / v;

      assert.ok(
        Math.abs(aspect - 1) < 0.01,
        `size=${size} 面=${face} 图案被拉成 ${aspect.toFixed(3)}:1`
      );

      // 关键：顶面的比例尺必须等于侧面（= 箱子高度），
      // 不然顶面的猫脸会比侧面大整整数倍
      assert.ok(
        Math.abs(u - HEIGHT) < 0.01,
        `size=${size} 面=${face} 比例尺 ${u.toFixed(2)} 不等于箱子高度 ${HEIGHT}`
      );
    }
  }
});

test('fitUV 是「居中取一块」而不是「平铺」', () => {
  const geometry = new BoxBufferGeometry(20, HEIGHT, 20);
  const uv = geometry.attributes.uv;
  const range = [LEFT * 4, LEFT * 4 + 4];

  const before = [];
  for (let i = range[0]; i < range[1]; i++) {
    before.push([uv.getX(i), uv.getY(i)]);
  }

  const ratio = 20 / HEIGHT;
  fitUV(geometry, ratio, 1, range);

  for (let i = range[0]; i < range[1]; i++) {
    const [u0, v0] = before[i - range[0]];

    // 中心点必须不动：图案才能保持在面正中
    // UV 存在 Float32Array 里，期望值是 float64 算的，容差按 float32 精度取
    assert.ok(Math.abs((uv.getX(i) - 0.5) - (u0 - 0.5) * ratio) < 1e-6);
    // v 方向倍率是 1，应该完全不变
    assert.ok(Math.abs(uv.getY(i) - v0) < 1e-6);
  }

  // 如果 V 也一起乘，图案会纵向溢出并被 ClampToEdge 压成条带
  const { v } = uvScale(geometry, LEFT);
  assert.ok(Math.abs(v - HEIGHT) < 0.01, 'V 方向的比例尺应当正好是箱子高度');
});

test('只影响指定面，其他面不动', () => {
  const geometry = new BoxBufferGeometry(20, HEIGHT, 20);
  const uv = geometry.attributes.uv;

  const snapshot = [];
  for (let i = 0; i < uv.count; i++) {
    snapshot.push([uv.getX(i), uv.getY(i)]);
  }

  fitCubeFaces(geometry, [LEFT], 2, 1);

  for (let i = 0; i < uv.count; i++) {
    const touched = i >= LEFT * 4 && i < LEFT * 4 + 4;
    if (touched) continue;

    assert.equal(uv.getX(i), snapshot[i][0], `顶点 ${i} 的 u 不该被改动`);
    assert.equal(uv.getY(i), snapshot[i][1], `顶点 ${i} 的 v 不该被改动`);
  }
});
