// ---------------------------------------------------------------------------
// 测试夹具主题 —— 故意做得又丑又怪
//
// 它**不是**给玩家看的，唯一作用是当一个「第二个实例」来验证主题边界：
// 如果切到它之后，画面里**所有**外观都变了（箱子颜色、背景、光照、小人、
// 粒子、拖尾、箱子类型），说明没有任何外观常量漏在主题外面。
//
// 如果切过去之后发现某处没变（比如拖尾还是白的），那就是那个常量还硬编码
// 在代码里，需要收进主题。
//
// 上线前可以删掉这个文件；只要 index.js 不再引用它就行。
// ---------------------------------------------------------------------------

import dot from '../../res/dot.png';

export default {
  id: 'fixture',
  name: '测试夹具',

  // 灰阶三色，一眼就能和糖果主题区分
  colors: [0x333333, 0x888888, 0xd0d0d0],

  // 故意不给贴图，全部走纯色 —— 顺便验证「没有贴图时退回纯色」这条路径
  textures: [],
  textureRatio: 0,
  fitTextures: false,

  // 只出立方体：验证主题能控制箱型权重
  boxWeights: { cube: 1, cylinder: 0, express: 0, magic: 0 },

  // 故意不给特殊箱子贴图 —— 验证「缺贴图时退回纯色」不会崩
  expressTexture: null,
  magicTextures: null,

  // 深色背景 + 荧光绿光 + 青色小人 + 品红粒子 + 黄色拖尾
  background: { top: 0x101010, bottom: 0x3a3a3a },
  light: { color: 0x00ff00, ambient: 1.0, directional: 0.0 },
  groundShadowOpacity: 1.0,

  littleMan: { headColor: 0x00ffff, bodyColor: 0x00ffff },
  particle: { colors: [0xff00ff], texture: dot },
  tail: { color: 0xffff00, opacity: 1.0 },
};
