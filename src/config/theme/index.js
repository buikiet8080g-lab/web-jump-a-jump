// ---------------------------------------------------------------------------
// 主题入口
//
// 所有「外观」都从这里取，业务代码不直接读主题文件的字面量。
//
// 换主题 = 改下面 ACTIVE_THEME_ID 一行。
// 想加主题 = 在 theme/ 下新建一个同结构的文件，注册进 THEMES 即可。
// ---------------------------------------------------------------------------

import candy from './candy';
import fixture from './_fixture';

export const THEMES = {
  candy,
  fixture,
};

// 当前激活的主题
const ACTIVE_THEME_ID = 'candy';

// 用函数而不是直接导出对象：以后想加「运行时切换主题 / 调试面板」不用改调用方
export function getTheme() {
  return THEMES[ACTIVE_THEME_ID] || candy;
}

export default getTheme();
