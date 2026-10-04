import {
  BLOCK_MAX_SIZE,
  BLOCK_MIN_SIZE,
  BLOCK_MAX_DISTANCE,
  BLOCK_MIN_DISTANCE,
} from "../config/constant";
import {getTheme} from "../config/theme";
import {getTexture} from "../util/TextureCache";
import TWEEN from '@tweenjs/tween.js';
import {animateFrame} from "../util/TweenUtil";

class Box {

  constructor(prev, cloneMesh) {
    // 构造一个链表结构，方便后续盒子的增加和销毁
    // 上一个盒子
    this.prev = prev;

    this.cloneMesh = cloneMesh;

    if (prev) {
      prev.next = this;
    }

    // 大小
    this.size = null;
    // 高度固定,缩放的时候这个值会变
    this.height = Box.defaultHeight;
    // 颜色（纯色路线用）
    this.color = null;
    // 贴图（贴图路线用）；null 表示这个箱子走纯色
    this.texture = null;

    // 位置
    // 这个设计不是很好，信息重复存放，后期维护很麻烦
    this.position = {
      x: null,
      y: null,
      z: null
    };
    // 盒子网格
    this.mesh = null;

    // 下一个盒子出现的方向 x | z
    this.direction = null;

    // 下一个盒子和当前盒子的距离
    this.distance = 0;

    // 初始化属性
    this.init();
  }

  init() {
    // 随机盒子的大小
    this.initSize();
    // 随机盒子的外观（贴图 or 纯色）
    this.initSkin();
    // 随机下一个盒子的方向
    this.initDirection();
    // 随机下一个盒子的距离
    this.initDistance();
    // 计算盒子位置
    this.initPosition();
    // 生成盒子
    if (this.cloneMesh) {
      this.mesh = this.cloneMesh;
    } else {
      this.initBox();
    }

    // 配置盒子
    this.configBox();
  }

  // 大小取最大和最小之间的随机数
  initSize() {
    // 前两个大小固定
    if (!this.prev || !this.prev.prev) {
      this.size = BLOCK_MAX_SIZE;

      return;
    }

    this.size = Math.random() * (BLOCK_MAX_SIZE - BLOCK_MIN_SIZE) + BLOCK_MIN_SIZE;
  }

  // 随机箱子的外观：优先贴图，没贴图（或概率没命中）就退回纯色
  initSkin() {
    const theme = getTheme();
    const textures = theme.textures || [];
    const colors = theme.colors || [0xffffff];
    const prev = this.prev;

    // 抽一次可能和上一个箱子撞成一模一样（纯随机会有 ~1/3 概率），
    // 相邻两个箱子长得完全一样看着很假，所以撞了重摇（最多 4 次，避免死循环）。
    for (let attempt = 0; attempt < 4; attempt++) {
      const useTexture = textures.length > 0 && Math.random() < (theme.textureRatio || 0);

      if (useTexture) {
        const url = textures[Math.floor(Math.random() * textures.length)];

        this.texture = getTexture(url);
        // 贴图时底色设白，否则 color 会和 map 相乘、把图染脏
        this.color = 0xffffff;
      } else {
        this.texture = null;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      const sameAsPrev = prev && prev.texture === this.texture && prev.color === this.color;

      if (!sameAsPrev) break;
    }
  }

  // 方向
  initDirection() {
    // 如果是第一个盒子，下一个一定是 x 方向
    if (!this.prev) {
      this.direction = 'x'
    } else {
      // 随机 x 或 z 方向
      const isX = Math.round(Math.random()) === 0;

      if (isX) {
        this.direction = 'x'
      } else {
        this.direction = 'z'
      }
    }
  }

  // 距离
  initDistance() {
    // 首个距离固定
    if (!this.prev) {
      this.distance = 0.5 * (BLOCK_MAX_DISTANCE + BLOCK_MIN_SIZE);
    } else {
      // 随机距离
      this.distance = Math.round(BLOCK_MIN_DISTANCE + Math.random() * (BLOCK_MAX_DISTANCE - BLOCK_MIN_SIZE));
    }
  }

  // 位置
  initPosition() {
    // 默认中心位置
    this.position = {
      x: 0,
      y: 0,
      z: 0
    };

    // 第1个盒子使用默认位置
    if (!this.prev) {
      return;
    }

    // 盒子向 X 或 Z 轴方向移动
    const { size: prevSize, position: prevPosition, direction, distance } = this.prev;
    const { x, z } = prevPosition;

    if (direction === 'x') {
      this.position.x = x + prevSize/2 + distance + this.size / 2;
      this.position.z = z;
    } else {
      this.position.z = z - prevSize/2 - distance - this.size / 2;
      this.position.x = x;
    }
  }

  initBox() {}

  configBox() {
    const {x, y, z} = this.position;
    // 阴影贴图
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // 设置位置
    this.mesh.position.setX(this.position.x);
    this.mesh.position.setZ(this.position.z);

    // 首个和第二个没有动画
    if (!this.prev || !this.prev.prev) {
      // 设置物体位置
      this.mesh.position.set(x, y, z);
    } else {
      // 盒子的入场动画
      new TWEEN.Tween({y: 10}).to({y: 0}, 400)
        .easing(TWEEN.Easing.Bounce.Out)
        .onUpdate(({ y })=>{
          this.mesh.position.setY(y);
        })
        .start();

      animateFrame();
    }
  }

  // 更新盒子位置
  updatePosition(position) {
    const {x, y, z} = position;

    this.position = position;
    this.mesh.position.set(x, y, z);
  }

  // 只更新 X 和 Z 的位置
  updateXZPosition(position) {
    const {x, z} = position;

    this.position.x = position.x;
    this.position.z = position.z;
    this.mesh.position.setX(x);
    this.mesh.position.setZ(z);
  }

  // Y 方向缩放
  scaleY(y) {
    this.height = Box.defaultHeight * y;
    this.mesh.scale.setY(y);
  }

  // 盒子动画
  doAnimate() {}
}

// 默认的高度
Box.defaultHeight = BLOCK_MAX_SIZE/2;

export default Box;
