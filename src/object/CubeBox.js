import Box from './Box';
import {BoxBufferGeometry, Mesh, MeshLambertMaterial} from "three/src/Three";
import {tileCubeFaces, LEFT, RIGHT, TOP, BOTTOM, BEHIND, AFTER} from '../util/MapUtil';
import {getTheme} from '../config/theme';

export default class CubeBox extends Box {
  constructor(prev) {
    super(prev)
  }

  // 生成盒子
  initBox() {
    const geometry = new BoxBufferGeometry(this.size, this.height, this.size);

    if (this.texture && getTheme().tileTextures) {
      // 箱子高度固定（Box.defaultHeight），底面尺寸随机（12.5 ~ 33.3）。
      // 如果 UV 保持 0~1，同一张贴图会被拉成 0.75:1 ~ 2:1 各种比例。
      //
      // 这里让「一个纹理块 = 一个箱子高度」：
      //   侧面：横向铺 size/height 次，纵向 1 次
      //   顶/底：正方形，两个方向都铺 size/height 次
      // 这样每个面的纹理密度都一致，箱子大小变化只是"多铺几块"。
      const ratio = this.size / this.height;

      tileCubeFaces(geometry, [LEFT, RIGHT, BEHIND, AFTER], ratio, 1);
      tileCubeFaces(geometry, [TOP, BOTTOM], ratio, ratio);
    }

    geometry.translate(0, this.height/2, 0);

    // 有贴图用贴图，没有就纯色
    const material = this.texture
      ? new MeshLambertMaterial({map: this.texture})
      : new MeshLambertMaterial({color: this.color});

    this.mesh = new Mesh(geometry, material);
  }
}
