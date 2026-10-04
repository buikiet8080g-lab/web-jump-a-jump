// 增加一些辅助线
// 增加性能监控指标
const DEV = false;

// 辅助用户调整视角,DEBUG 时候开启，
// 注意会导致 mouse 监听无效
const ORBIT_CONTROL = false;

// 使用 ImagePost 方式开启残影效果
// 开发时候的尝试，该方案已经被 PASS
const ENABLE_IMAGE_POST_PROCESS = false;

// 开启后，一定会调到中点，测试性能时候使用
const ENABLE_AUTO_JUMP = false;

// 手动销毁 box
const ENABLE_DISPOSE_BOX = true;

// 注意：
// 外观类常量（背景色、光源颜色、箱子颜色池、小人颜色、贴图）已经全部
// 搬到 src/config/theme/ 下按主题管理。本文件只保留「物理 / 玩法 / 技术」参数。

// 基础宽度
// 为了方便计算，任何大小的屏幕下，宽度都是基础宽
const BASE_WIDTH = 100;

// canvas 大小
//
// 竖版比例，最多 3:5：
//   桌面（屏幕比 3:5 宽） → 保持 3:5，居中，两边露出页面底色
//   手机（屏幕比 3:5 瘦） → 直接铺满宽度，整屏都是游戏区
// 高度始终铺满视口（游戏区的渐变因此能上下贯通，不会被顶部标题截断）
const VIEWPORT_WIDTH = window.innerWidth;
const VIEWPORT_HEIGHT = window.innerHeight;
const CLIENT_HEIGHT = VIEWPORT_HEIGHT;
const CLIENT_WIDTH = VIEWPORT_HEIGHT * Math.min(3 / 5, VIEWPORT_WIDTH / VIEWPORT_HEIGHT);

// 视图的宽高
const WIDTH = BASE_WIDTH;
const HEIGHT = CLIENT_HEIGHT /CLIENT_WIDTH * BASE_WIDTH;
// 远近值取宽高中大的那个
const FAR = WIDTH > HEIGHT ? WIDTH: HEIGHT;

// 盒子大小
const BLOCK_MAX_SIZE = WIDTH > HEIGHT ? HEIGHT/3 : WIDTH/3;
const BLOCK_MIN_SIZE = WIDTH > HEIGHT ? HEIGHT/8 : WIDTH/8;

// 两个盒子之间距离
const BLOCK_MAX_DISTANCE = WIDTH > HEIGHT ? HEIGHT/2 : WIDTH/2;
const BLOCK_MIN_DISTANCE = WIDTH > HEIGHT ? HEIGHT/8 : WIDTH/8;

// 小人的大小
const LITTLE_MAN_WIDTH = BLOCK_MIN_SIZE/2.3;
const LITTLE_MAN_HEIGHT = LITTLE_MAN_WIDTH * 3.5;

// 最大蓄力时间
const STORAGE_TIME = 1500;

// 跳跃滞空 ms 数
const JUMP_TIME = 350;
// 跳跃的高度
const HIGH_JUMP = WIDTH > HEIGHT ? HEIGHT/3.5 : WIDTH/3.5;


// 粒子数量
const PARTICLE_NUM = 2 * 8;
// 粒子最小距离
const PARTICLE_MIN_DISTANCE = LITTLE_MAN_WIDTH/2;
// 粒子最大距离
const PARTICLE_MAX_DISTANCE = LITTLE_MAN_HEIGHT/1.5;


// 拖尾碎片宽度,表示精度
const TAIL_WIDTH = 1;
// 拖尾碎片最大高度
const TAIL_HEIGHT = LITTLE_MAN_WIDTH * 2;
// 拖尾碎片存在的时间
const TAIL_DURATION = 70;

export {
  DEV,
  ORBIT_CONTROL,
  ENABLE_IMAGE_POST_PROCESS,
  ENABLE_DISPOSE_BOX,
  BASE_WIDTH,
  CLIENT_HEIGHT,
  CLIENT_WIDTH,
  WIDTH,
  HEIGHT,
  FAR,
  BLOCK_MAX_SIZE,
  BLOCK_MIN_SIZE,
  BLOCK_MAX_DISTANCE,
  BLOCK_MIN_DISTANCE,
  LITTLE_MAN_WIDTH,
  LITTLE_MAN_HEIGHT,
  JUMP_TIME,
  HIGH_JUMP,
  STORAGE_TIME,
  PARTICLE_NUM,
  PARTICLE_MIN_DISTANCE,
  PARTICLE_MAX_DISTANCE,
  TAIL_WIDTH,
  TAIL_HEIGHT,
  TAIL_DURATION,
  ENABLE_AUTO_JUMP
}
