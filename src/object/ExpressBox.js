import Box from './Box';
import {BoxGeometry, Mesh, MeshLambertMaterial} from "three";
import {recreateCubeUV, LEFT, TOP, BEHIND} from '../util/MapUtil';
import {getTheme} from '../config/theme';
import {getTexture} from '../util/TextureCache';

export default class ExpressBox extends Box {
  constructor(prev) {
    super(prev)
  }

  initBox() {
    const geometry = new BoxGeometry(25, this.height, 25);

    // 贴图来自主题；主题没给就退回纯色（否则会直接崩）
    const url = getTheme().expressTexture;
    const material = url
      ? new MeshLambertMaterial({map: getTexture(url)})
      : new MeshLambertMaterial({color: this.color});

    geometry.translate(0, this.height/2, 0);

    if (url) {
      // 从图集里裁 3 块，贴到看得见的那 3 个面
      // （另 3 个面永远背对相机，不用管）
      recreateCubeUV(428, 428, geometry, LEFT, 0, 0, 280, 148);
      recreateCubeUV(428, 428, geometry, TOP, 0, 428, 280, 148);
      recreateCubeUV(428, 428, geometry, BEHIND, 280, 148, 428, 428, true);
    }

    // 生成网格
    this.mesh = new Mesh(geometry, material);
  }

}
