import Box from './Box';
import {BoxBufferGeometry, Mesh, MeshLambertMaterial} from "three/src/Three";
import {createTexturedMaterial} from '../util/MaterialUtil';
import {fitCubeFaces, LEFT, RIGHT, TOP, BOTTOM, BEHIND, AFTER} from '../util/MapUtil';
import {getTheme} from '../config/theme';

export default class CubeBox extends Box {
  constructor(prev) {
    super(prev)
  }

  // 生成盒子
  initBox() {
    const geometry = new BoxBufferGeometry(this.size, this.height, this.size);

    if (this.texture && getTheme().fitTextures) {
      // 每个面只放**一个**图案，居中且不拉伸。
      //
      // 规则：「一个纹理单位 = 一个箱子高度」（ratio = size / height）
      //   侧面 = size 宽 × height 高 → 只在 u 方向以中心缩放 ratio，v 方向乘 1
      //   顶/底 = size × size     → 两个方向都缩放 ratio
      //
      // 顶底也必须跟侧面用同一个比例尺，否则顶面的图案会比侧面大整整 ratio 倍。
      //
      // 注意这是「居中取一块」而不是「平铺」。UV 超出 0~1 的部分由贴图的
      // ClampToEdge 取到边缘的纯白像素，跟白底一起被 material.color 染成方块色。
      const ratio = this.size / this.height;

      fitCubeFaces(geometry, [LEFT, RIGHT, BEHIND, AFTER], ratio, 1);
      fitCubeFaces(geometry, [TOP, BOTTOM], ratio, ratio);
    }

    geometry.translate(0, this.height/2, 0);

    // 有贴图用贴图，没有就纯色。
    // 贴图是「透明底 + 图案」，但这里的 alpha 是**遮罩**不是半透明 ——
    // 底色填图案以外的区域、图案保持原色，两层怎么合成见 util/MaterialUtil.js。
    const material = this.texture
      ? createTexturedMaterial(this.texture, this.color)
      : new MeshLambertMaterial({color: this.color});

    this.mesh = new Mesh(geometry, material);
  }
}
