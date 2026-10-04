import {
  Group
} from 'three';
import TWEEN from '@tweenjs/tween.js';
import CubeBox from './CubeBox';
import CylinderBox from './CylinderBox';
import ExpressBox from './ExpressBox';
import MagicCubeBox from './MagicCubeBox';
import {animateFrame} from '../util/TweenUtil';
import {FAR, ENABLE_DISPOSE_BOX} from "../config/constant";
import {getTheme} from '../config/theme';

// key 用于在主题里配权重（theme.boxWeights）
const BoxList = [{
  index: 0,
  key: 'cube',
  box: CubeBox,
  isStatic: false
}, {
  index: 1,
  key: 'cylinder',
  box: CylinderBox,
  isStatic: false
},{
  index: 2,
  key: 'express',
  box: ExpressBox,
  isStatic: true
},{
  index: 3,
  key: 'magic',
  box: MagicCubeBox,
  isStatic: true
}];

// 当前主题里各箱型的权重
function themeWeights() {
  return getTheme().boxWeights || {};
}

function weightOf(boxIndex) {
  const entry = BoxList[boxIndex];

  return entry ? (themeWeights()[entry.key] || 0) : 0;
}

// 按主题权重随机挑一个箱型（权重 0 = 该主题里不出现这种箱子）
function pickBoxIndex() {
  const weights = themeWeights();
  const pool = BoxList.filter((entry) => (weights[entry.key] || 0) > 0);

  // 主题没配权重（或全为 0）时退回均等随机，保证永远有箱子可生成
  if (pool.length === 0) {
    return Math.floor(Math.random() * BoxList.length);
  }

  const total = pool.reduce((sum, entry) => sum + weights[entry.key], 0);
  let threshold = Math.random() * total;

  for (const entry of pool) {
    threshold -= weights[entry.key];
    if (threshold < 0) return entry.index;
  }

  return pool[pool.length - 1].index;
}

export default class BoxGroup {

  constructor() {
    // 最后一个盒子
    this.last = null;
    // 存放盒子组
    this.group = new Group();
    // 保存一个小人的引用
    this.littleMan = null;
    // 存放盒子的缓存
    this.boxInstance = {};

    // 只为「本主题会用到」的特殊箱子预建缓存：
    // 主题把权重设成 0 时就不建，省一次无谓的加载
    if (weightOf(2) > 0) this.boxInstance[2] = new ExpressBox(null).mesh;
    if (weightOf(3) > 0) this.boxInstance[3] = new MagicCubeBox(null).mesh;
  }

  getBoxInstance(index) {
    const boxObject = BoxList[index];

    if (boxObject.isStatic) {
      if (this.boxInstance[index]) {
        return new boxObject.box(this.last, this.boxInstance[index]);
      } else {
        const box = new boxObject.box(this.last);

        this.boxInstance[index] = box.mesh.clone();

        return box;
      }
    } else {
      return new boxObject.box(this.last);
    }
  }

  // 创建一个盒子
  createBox() {
    let box;

    if (!this.last || !this.last.prev) {
      // 开局两个箱子的尺寸是固定的（见 Box.initSize），所以开局优先用立方体当起跳台；
      // 万一主题里没有立方体，就走权重随机
      const startIndex = weightOf(0) > 0 ? 0 : pickBoxIndex();

      box = this.getBoxInstance(startIndex);
    } else {
      box = this.getBoxInstance(pickBoxIndex());
    }

    this.group.add(box.mesh);
    this.last = box;

    return this.last;
  }

  // 更新位置
  updatePosition({
    duration,
  }) {
    // 找到最后两个盒子的中点
    const last = this.last;
    const secondOfLast = last.prev;
    const centerX = 0.5 * (last.position.x + secondOfLast.position.x);
    const centerZ = 0.5 * (last.position.z + secondOfLast.position.z);

    let lastX = 0;
    let lastZ = 0;

    // 先记录下小人最终的目的地，因为可能在盒子未移动完成之前，小人点击了跳跃
    if (this.littleMan) {
      const {x, z} = this.littleMan.body.position;
      this.littleMan.body.finalX = x - centerX;
      this.littleMan.body.finalZ = z - centerZ;
    }

    // 配置动画参数并开始
    new TWEEN.Tween({x: 0,z: 0})
      .to({x: centerX, z: centerZ }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(({x,z})=>{
        const deltaX = x - lastX;
        const deltaZ = z - lastZ;

        // 更新盒子
        this.updateBoxPositionInChain(deltaX, deltaZ);
        // 更新小人
        this.updateLittleMan(deltaX, deltaZ);

        lastX = x;
        lastZ = z;
      })
      .start();

    animateFrame();
  }

  // 根据入参改变链路上的所有 Box 的位置
  updateBoxPositionInChain(deltaX, deltaZ) {
    let tail = this.last;
    const boxToDisPose = [];

    while(tail) {
      const {x, z} = tail.position;
      const position = {
        x: x - deltaX,
        z: z - deltaZ
      };

      if (ENABLE_DISPOSE_BOX) {
        if (position.x > 2 * FAR || position.z > 2 * FAR) {
          boxToDisPose.push(tail);
        } else {
          tail.updateXZPosition(position);
        }
      } else {
        tail.updateXZPosition(position);
      }

      tail = tail.prev;
    }

    if (ENABLE_DISPOSE_BOX) {
      boxToDisPose.forEach((box) => {
        if (box.next) {
          box.next.prev = null;
        }
        box.prev = null;
        box.next = null;
        box.mesh.geometry.dispose();
        box.mesh.material.dispose();
        box.mesh.dispose();
        box = null;
      });

      boxToDisPose.length = 0;
    }
  }

  updateLittleMan(deltaX, deltaZ) {
    if (this.littleMan) {
      this.littleMan.body.translateX(-deltaX);
      this.littleMan.body.translateZ(-deltaZ);
    }
  }

  // 加入场景
  enterStage(stage) {
    stage.scene.add(this.group);
  }

  setLittleMan(littleMan) {
    this.littleMan = littleMan;
  }

  // 重开一局：把本局的盒子全部摘掉并释放显存。
  //
  // 静态箱型（ExpressBox / MagicCubeBox）的网格是缓存的克隆体，几何体/材质
  // 是和场景里的网格**共享**的，所以用两个 Set 去重，避免重复 dispose。
  // 释放掉也没关系 —— 重开一局会 new 一个全新的 BoxGroup，缓存会重建。
  destroy() {
    const disposedGeo = new Set();
    const disposedMat = new Set();

    const disposeMesh = (mesh) => {
      if (!mesh) return;

      if (mesh.geometry && !disposedGeo.has(mesh.geometry)) {
        disposedGeo.add(mesh.geometry);
        mesh.geometry.dispose();
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (mat && !disposedMat.has(mat)) {
          disposedMat.add(mat);
          // 注意：material.dispose() 不会连带释放贴图，共享的 TextureCache 是安全的
          mat.dispose();
        }
      });

      // 魔方箱的中间环是挂在父网格下的子 Mesh
      (mesh.children || []).forEach(disposeMesh);
    };

    this.group.children.slice().forEach((mesh) => {
      disposeMesh(mesh);
      this.group.remove(mesh);
    });

    Object.keys(this.boxInstance).forEach((key) => {
      disposeMesh(this.boxInstance[key]);
      delete this.boxInstance[key];
    });

    this.last = null;
    this.littleMan = null;
  }

}
