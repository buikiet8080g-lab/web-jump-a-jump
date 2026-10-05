#!/usr/bin/env python3
"""把 src/res/brand/logo.svg 渲染成各尺寸的 PNG 图标。

为什么需要这一步 —— logo.svg 有两个消费方：

  1. webpack/layout.js 用 fs 读它，内联进 HTML（顶部品牌行的 <svg> +
     favicon 的 data URI）。改 SVG 立刻生效。
  2. src/object/JumpGame.js `import` 了 icon-32/64/192/180.png
     （浏览器标签页 / 书签 / 添加到主屏）。这条走 webpack file-loader，
     **不会**跟着 SVG 自动变。

所以改了 logo.svg 之后必须重跑本脚本，否则标签页图标还是旧的那张脸。
（为什么不干脆全用 SVG：apple-touch-icon 对 SVG 支持不稳，主屏图标还是 PNG 靠谱。）

用法：
    python3 scripts/gen-icons.py        # 需要 pip install cairosvg
"""

import pathlib
import sys

try:
    import cairosvg
except ImportError:  # pragma: no cover - 纯粹是给使用者看的提示
    sys.exit("缺少 cairosvg，请先 `pip install cairosvg`")

BRAND = pathlib.Path(__file__).resolve().parent.parent / "src" / "res" / "brand"
SRC = BRAND / "logo.svg"

# 32/64/192 = 普通 favicon；180 = apple-touch-icon
SIZES = (32, 64, 180, 192)


def main():
    if not SRC.exists():
        sys.exit(f"找不到 {SRC}")

    for size in SIZES:
        out = BRAND / f"icon-{size}.png"
        cairosvg.svg2png(
            url=str(SRC),
            write_to=str(out),
            output_width=size,
            output_height=size,
        )
        print(f"{out.relative_to(BRAND.parent.parent)}: {size}x{size}")

    print("完成。记得把重新生成的 PNG 一起提交。")


if __name__ == "__main__":
    main()
