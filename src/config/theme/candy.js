// ---------------------------------------------------------------------------
// 糖果主题（v1 交付的唯一主题）
//
// 主题 = 「这个游戏长什么样」的全部数据。物理/玩法参数不在这里，
// 在 src/config/constant.js。
//
// 一个主题要自洽的两个东西：**贴图** 和 **色板** 必须是同一套调性。
// 早期版本只把贴图做成了糖果风、色板却留着原来的彩虹色（橙/青/蓝/紫/绿），
// 结果红蓝青同屏、完全不成主题 —— 所以下面的 colors 是重新配过的马卡龙色板。
//
// 贴图要求：正方形 + 四方连续无缝 + 无阴影无暗角。换图请保持同样的要求。
// ---------------------------------------------------------------------------

// 正式贴图：AI 生成（apimart-image-generator）+ 程序化「周期裁切」无缝校正，最后压成 WebP
//（3 张合计 80KB，之前的 PNG 版是 711KB）。
// 生成记录：tmp/texture-gen/ ；未裁切的母版：src/res/textures/_raw/
//
// 每张贴图都有**明确的色相**，并统一在「马卡龙」调性里：
//   蜜桃粉（圆点）/ 薄荷绿（斜纹）/ 柠檬黄（格纹）
// —— 如果贴图都做成淡奶油色，贴图箱子会灰白一片、融进背景，就不成主题了。
import texPeach from '../../res/textures/tex_candy_peach.webp';
import texMint from '../../res/textures/tex_candy_mint.webp';
import texLemon from '../../res/textures/tex_candy_lemon.webp';
import texTaro from '../../res/textures/tex_candy_taro.webp';
import texSoda from '../../res/textures/tex_candy_soda.webp';
import texCocoa from '../../res/textures/tex_candy_cocoa.webp';

// 魔方箱：三张图集，按 MagicCubeBox 的裁切区域手绘（3×3 / 3×1 / 1×3 贴纸网格）
import magicTop from '../../res/textures/candy_magic_top.webp';
import magicMiddle from '../../res/textures/candy_magic_middle.webp';
import magicBottom from '../../res/textures/candy_magic_bottom.webp';

// 快递箱：马卡龙色纸箱 + 封箱胶带 + 寄件标签（AI 生成后按裁切区域拼成 428×428 图集）
import expressParcel from '../../res/textures/candy_express.webp';

// 粒子贴图
import dot from '../../res/dot.png';

export default {
  id: 'candy',
  name: '糖果',

  // ---------------- 箱子外观 ----------------

  // 马卡龙色板：统一「高明度 + 中低饱和」，七个色相铺开但都不刺眼。
  // 关键是要和上面 6 张贴图同调（蜜桃粉/薄荷绿/柠檬黄/香芋紫/蓝莓蓝/奶咖），
  // 而不是各自为政。
  colors: [
    0xf7a399, // 蜜桃粉
    0xf6c177, // 焦糖黄
    0x8ed1b4, // 开心果绿
    0x8fb8de, // 蓝莓蓝
    0xc3a6d9, // 香芋紫
    0xe8cfa4, // 卡仕达（原来的 0xf2e2c4 太浅，和暖奶油背景融在一起）
    0xe8919c, // 覆盆子
  ],

  // 贴图池。必须是**无缝可平铺**的图，否则平铺会露出接缝。
  // 6 张 = 6 个色相 × 6 种花纹（圆点 / 斜纹 / 格纹 / 菱格 / 波浪 / 三角），
  // 配合下面 7 个纯色，箱子外观已经足够多变。
  textures: [texPeach, texMint, texLemon, texTaro, texSoda, texCocoa],

  // 出现贴图的概率，剩下 (1 - textureRatio) 走纯色
  textureRatio: 0.6,

  // 让贴图平铺：每个纹理块的物理尺寸恒定，箱子变大只是多铺几块
  tileTextures: true,

  // 4 种箱子类型的出现权重（0 = 完全不出现）
  boxWeights: { cube: 1, cylinder: 1, express: 1, magic: 1 },

  // 特殊箱子的贴图也换成糖果系，但**不能丢掉它们的辨识度**：
  //   魔方箱 —— 必须还能看出是「一格格的魔方」，所以用专门画的贴纸网格图集，
  //             直接套用普通糖果贴图会变得只剩花纹；
  //   快递箱 —— 必须还能看出是「包裹」，所以用带封箱胶带 + 寄件标签的纸箱面。
  expressTexture: expressParcel,
  magicTextures: { top: magicTop, middle: magicMiddle, bottom: magicBottom },

  // ---------------- 场景氛围 ----------------

  // 马卡龙色渐变：淡玫白 → 淡薰衣草（原来是冷灰纯色 0xD6DBDF）
  background: { top: 0xfdf6fb, bottom: 0xe9e2f6 },

  // 光照：整体调亮、明暗差调小。
  // 原来的 0.5/0.5 配高饱和原色没问题，但换成浅色马卡龙后，
  // 侧面只能拿到环境光 → 一暗就发灰发脏，完全不是糖果感。
  // 现在侧面 ≈ 0.78、顶面 ≈ 1.0，只留一点明暗来读出立体感。
  light: { color: 0xffffff, ambient: 0.78, directional: 0.28 },

  // 地面阴影浓度（浅色背景下阴影太重会发灰）
  groundShadowOpacity: 0.38,

  // ---------------- 角色 / 特效 ----------------

  // 小人：双色糖果小人。头做成棉花糖一样的奶白，身子是糖果树莓红，
  // 比原来“整个一个纯色棋子”更像糖果。
  littleMan: {
    headColor: 0xfff4ec, // 棉花糖奶白
    bodyColor: 0xf0455f, // 糖果树莓红
  },

  // 跳跃粒子：马卡龙彩屑（四个色轮流），像撒出来的糖针
  particle: {
    colors: [0xf7a399, 0x8ed1b4, 0xf6c177, 0xc3a6d9],
    texture: dot,
  },

  // 拖尾：暖杏色，在淡紫背景上能看清楚
  tail: { color: 0xffc0a8, opacity: 0.8 },
};
