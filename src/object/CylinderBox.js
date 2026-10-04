import Box from './Box';
import {CylinderGeometry, Mesh, MeshLambertMaterial} from "three";
import {tileUV} from '../util/MapUtil';
import {getTheme} from '../config/theme';

// 径向分段数。它还决定侧面顶点数，平铺时要拿它算顶点区间，所以提成常量
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

    const theme = getTheme();

    // 贴图时底色被置成白色（避免染脏），盖子单独取色
    const capColor = this.texture
      ? theme.colors[Math.floor(Math.random() * theme.colors.length)]
      : this.color;

    if (this.texture && theme.tileTextures) {
      // 侧面沿圆周铺一圈。周长 = π * size，
      // 同样让「一个纹理块 = 一个箱子高度」→ 重复次数 = 周长 / 高度
      const repeat = Math.PI * this.size / this.height;
      // CylinderGeometry 顶点顺序：先侧面(torso)，再顶盖，再底盖
      const torsoVertexCount = (RADIAL_SEGMENTS + 1) * (HEIGHT_SEGMENTS + 1);

      tileUV(geometry, repeat, 1, [0, torsoVertexCount]);
    }

    geometry.translate(0, this.height/2, 0);

    // 盖子保持纯色：否则圆盖会显示贴图正中间的一小块，很怪。
    // CylinderGeometry 自带 3 个材质组：[侧面, 顶盖, 底盖]
    const material = this.texture
      ? [
          new MeshLambertMaterial({map: this.texture}),
          new MeshLambertMaterial({color: capColor}),
          new MeshLambertMaterial({color: capColor}),
        ]
      : new MeshLambertMaterial({color: this.color});

    this.mesh = new Mesh(geometry, material);
  }
}
