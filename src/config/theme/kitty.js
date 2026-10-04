// ---------------------------------------------------------------------------
// 猫咪主题
//
// 主题 = 「这个游戏长什么样」的全部数据。物理/玩法参数不在这里，
// 在 src/config/constant.js。
//
// 一个主题要自洽的两个东西：**图案** 和 **色板** 必须是同一套调性。
// 这里的色板是柔和粉彩（高明度 + 中低饱和），七个色相铺开但都不刺眼，
// 目的是让方块彼此能区分、又不抢猫脸的视觉重心。
// ---------------------------------------------------------------------------

// 方块图案：6 个猫种 + 1 个爪印。
//
// 这批是 AI 生成（apimart-image-generator）后程序化抠图 —— 生成记录见
// tmp/texture-gen/breeds/。抠图用的是「从四角泛洪填充找背景」，
// 而不是亮度阈值：这些猫脸内部有大量浅色细节（燕尾服猫的白下巴、
// 布偶猫的白色倒 V、各品种的白色口吻），按亮度切会把它们挖成破洞。
//
// 贴图格式要求（和早期「可平铺无缝花纹」完全不同，注意别搞混）：
//   ① 图案居中   ② 四边必须完全透明
// 透明底不是用来做半透明的，是**图案的遮罩** —— 见 util/MaterialUtil.js。
// UV 怎么摆见 util/MapUtil.js 的 fitUV；为什么要取边缘像素见 util/TextureCache.js。
import scottishFold from '../../res/textures/tex_kitty_scottish_fold.webp';
import maineCoon from '../../res/textures/tex_kitty_maine_coon.webp';
import ragdoll from '../../res/textures/tex_kitty_ragdoll.webp';
import britishShorthair from '../../res/textures/tex_kitty_british_shorthair.webp';
import siamese from '../../res/textures/tex_kitty_siamese.webp';
import tuxedo from '../../res/textures/tex_kitty_tuxedo.webp';
import paw from '../../res/textures/tex_kitty_paw.webp';

// 魔方箱：三张图集，按 MagicCubeBox 的裁切区域手绘（3×3 / 3×1 / 1×3 贴纸网格）
import magicTop from '../../res/textures/kitty_magic_top.webp';
import magicMiddle from '../../res/textures/kitty_magic_middle.webp';
import magicBottom from '../../res/textures/kitty_magic_bottom.webp';

// 快递箱：纸箱 + 封箱胶带 + 寄件标签（AI 生成后按裁切区域拼成 428×428 图集）
import expressParcel from '../../res/textures/kitty_express.webp';

// 粒子贴图
import dot from '../../res/dot.png';

export default {
  id: 'kitty',
  name: '猫咪',

  // ---------------- 箱子外观 ----------------

  // 粉彩色板：七个色相铺开，明度都偏高、饱和都偏低。
  // 要和使用场景一起看 —— 背景本身也是浅色渐变，方块太淡会糊进背景，
  // 所以这里的「浅」是相对饱和色而言，不是接近白色。
  colors: [
    0xf7a399, // 蜜桃
    0xf6c177, // 杏黄
    0x8ed1b4, // 薄荷
    0x8fb8de, // 雾蓝
    0xc3a6d9, // 薰衣草
    0xe8cfa4, // 燕麦
    0xe8919c, // 覆盆子
  ],

  // 图案池。每个方块只命中其中一张，而且**一个面只出现一个完整图案**（不铺满）。
  // 六个猫种是有意选的「在 100px 大小下能互相区分」的组合：
  // 折耳的耳朵是折的、缅因的耳朵带尖毛、布偶脸中间是白的、英短脸最圆、
  // 暹罗脸中间是深色、燕尾服是黑白配。
  textures: [
    scottishFold,
    maineCoon,
    ragdoll,
    britishShorthair,
    siamese,
    tuxedo,
    paw,
  ],

  // 出现图案的概率，剩下 (1 - textureRatio) 走纯色底面
  textureRatio: 0.8,

  // 按面适配 UV：图案居中、等比、不重复。
  // 注意这**不是**「平铺」—— 平铺会把图案铺成一堆小图，看不出是什么。
  fitTextures: true,

  // 4 种箱子类型的出现权重（0 = 完全不出现）
  boxWeights: { cube: 1, cylinder: 1, express: 1, magic: 1 },

  // 特殊箱子的贴图：
  //   魔方箱 —— 必须还能看出是「一格格的魔方」，所以用贴纸网格图集，
  //             直接套用猫脸贴图会变得只剩一团花纹；
  //   快递箱 —— 必须还能看出是「包裹」，所以用带封箱胶带 + 寄件标签的纸箱面。
  expressTexture: expressParcel,
  magicTextures: { top: magicTop, middle: magicMiddle, bottom: magicBottom },

  // ---------------- 场景氛围 ----------------

  // 背景渐变：淡玫白 → 淡薰衣草
  background: { top: 0xfdf6fb, bottom: 0xe9e2f6 },

  // 光照：整体偏亮、明暗差偏小。
  // 浅色主题下如果只给环境光，方块侧面会发灰发脏；现在侧面 ≈ 0.78、
  // 顶面 ≈ 1.0，只留一点明暗来读出立体感。
  light: { color: 0xffffff, ambient: 0.78, directional: 0.28 },

  // 地面阴影浓度（浅色背景下阴影太重会发灰）
  groundShadowOpacity: 0.38,

  // ---------------- 角色 / 特效 ----------------

  // 小猫：奶白色的头 + 树莓红的身子。
  // 耳朵单独用 bodyColor（见 object/LittleMan.js）—— 猫耳如果和头同色，
  // 贴在球面上边界会完全消失，只剩两个小鼓包。
  littleMan: {
    headColor: 0xfff4ec, // 奶白
    bodyColor: 0xf0455f, // 树莓红
  },

  // 跳跃粒子：和色板同源的彩屑
  particle: {
    colors: [0xf7a399, 0x8ed1b4, 0xf6c177, 0xc3a6d9],
    texture: dot,
  },

  // 拖尾：暖杏色，在淡紫背景上能看清楚
  tail: { color: 0xffc0a8, opacity: 0.8 },
};
