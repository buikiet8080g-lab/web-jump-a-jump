// 注意顺序：先 import 样式。
//
// src/config/constant.js 会在模块求值时就测量画布宿主 `[data-game-canvas]`
// 的尺寸（桌面是两列布局，游戏只占左列，取不到视口就白算了）。
// 而测量要拿到真实布局，样式必须先注入 —— style-loader 是同步注入的，
// 所以「先 css 后 game」这个顺序是功能性的，不是风格问题。
import './index.css';
import JumpGame from './object/JumpGame';

new JumpGame().start();
