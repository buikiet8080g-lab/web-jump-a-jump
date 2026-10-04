import Box from './Box';
import {CylinderGeometry, Mesh, MeshLambertMaterial} from "three";
import {createTexturedMaterial} from '../util/MaterialUtil';

// 径向分段数，决定圆有多圆
const RADIAL_SEGMENTS = 50;
const HEIGHT_SEGMENTS = 1;

export default class CylinderBox extends Box {
  constructor(prev) {
    super(prev)
  }

  // 生成盒子
  initBox() {
    const geometry = new CylinderGeometry(
      this.size / 2, this.size / 2, this.height, RADIAL_SEGMENTS, HEIGHT_SEGMENTS);

    geometry.translate(0, this.height/2, 0);

    // 图案放在**顶盖**上，侧面保持纯色。原因：
    //
    //   侧面是曲面。要让图案在物理尺寸上不变形，一圈就得铺 π*size/height 次
    //   （一个底面尺寸 20、高度 16.7 的圆柱 ≈ 12 次）—— 每个图案要覆盖 30° 的
    //   弧面，越靠边缘被透视压得越扁，看起来就是「头像变形 + 一大堆小头像」。
    //   这是曲面贴图的固有问题，不是调参数能解决的。
    //
    //   而 CylinderGeometry 的顶盖 UV 是「把圆盘正投影进 0~1 正方形、圆心在
    //   (0.5, 0.5)」（u 取 x、v 取 z），正好让贴图正中间那一个图案**居中、无透视**
    //   地落在圆盖上 —— 不需要做任何 UV 变换，比侧面还规整。
    const material = this.texture
      ? [
          // CylinderGeometry 自带 3 个材质组：[侧面, 顶盖, 底盖]
          new MeshLambertMaterial({color: this.color}),
          createTexturedMaterial(this.texture, this.color),
          new MeshLambertMaterial({color: this.color}),
        ]
      : new MeshLambertMaterial({color: this.color});

    this.mesh = new Mesh(geometry, material);
  }
}
