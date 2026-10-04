// ---------------------------------------------------------------------------
// 方块材质
//
// 方块的外观是**两层**叠出来的：
//   底层 = material.color（主题色板里摇出来的颜色，决定方块是什么颜色）
//   上层 = 贴图里的图案（猫脸 / 爪印）
//
// three 默认的 map 行为是 `diffuseColor *= texelColor`，也就是两层**相乘**。
// 这对「图案 + 底色」是错的：
//   橘色爪印 (#F97316) × 薄荷绿底 (#8ED1B4) = 土褐色 —— 图案被底色染脏了。
//
// 所以这里改写 map_fragment，把贴图的 alpha 当遮罩，对颜色做一次 mix：
//   alpha = 0 → 保留材质色（图案以外都是方块底色）
//   alpha = 1 → 换成贴图色（图案保持自己的颜色）
//   0 < alpha < 1 → 两者之间的过渡，抗锯齿边缘天然就融合好了
//
// 这就是为什么贴图必须是「透明底 + 图案」：alpha 不是用来做半透明的，
// 而是**图案的遮罩**。也正因为走的是 mix 而不是混合，材质不能设
// transparent: true —— 那样 alpha=0 的像素会什么都不画，直接看穿方块。
// ---------------------------------------------------------------------------

import { MeshLambertMaterial } from 'three';

// 所有贴图方块共用一个 shader 改写，函数是模块级的 ——
// 保证每个材质实例的 onBeforeCompile.toString() 一致，
// three 的程序缓存键才会命中，不会给每个方块都编译一份着色器。
function mixMapOverColor(shader) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <map_fragment>',
    `
    #ifdef USE_MAP
      vec4 texelColor = texture2D( map, vUv );
      texelColor = mapTexelToLinear( texelColor );
      diffuseColor.rgb = mix( diffuseColor.rgb, texelColor.rgb, texelColor.a );
    #endif
    `
  );
}

/**
 * 带图案的方块材质：底色填空白区域，图案保持原色。
 *
 * @param {Texture} map    图案贴图（透明底 + 居中图案）
 * @param {number}  color  方块底色（主题色板）
 */
export function createTexturedMaterial(map, color) {
  const material = new MeshLambertMaterial({ map, color });

  material.onBeforeCompile = mixMapOverColor;

  return material;
}
