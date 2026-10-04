// /tips —— 提高分数的思路
//
// 页面里的数字是从 src/object/LittleMan.js + src/config/constant.js 推出来的：
//   蓄力 1500ms 期间 trunkScaleY 从 1 线性压到 0.6
//   跳跃距离 = (1 - trunkScaleY) × JUMP_TIME(350) = 0.0933 × 按住毫秒数（世界单位）
//   需要跨越的总距离 = 间距 + (本块宽 + 落点块宽) / 2
// 所以「需要按多久」是能算出来的，这一页就是把这几个数翻译成人话。

const body = `<main class="wrap">
      <article class="prose">
        <h1>How to Get a High Score in Kitty Jump</h1>

        <p class="lede">
          Kitty Jump has one control and no timer, which means almost every mistake
          is a <em>measurement</em> mistake rather than a reaction mistake. These are
          the things that actually move the number.
        </p>

        <h2>Calibrate your hold before you need it</h2>
        <p>
          The charge meter takes <strong>1.5 seconds</strong> to fill, but you will
          almost never use the top of it. On the maps the game generates, jumps call
          for holds somewhere between roughly <strong>0.25 s</strong> and
          <strong>0.9 s</strong> &mdash; the whole useful range lives in the bottom
          two-thirds of the meter.
        </p>
        <p>
          That is the single most useful thing to internalise, because it means a
          full meter is almost always an overshoot. The first few jumps of any run
          land on wide blocks; treat them as calibration rather than as scoring
          opportunities. If your first three jumps feel long or short, you have not
          warmed up yet &mdash; and on a short run, that is the whole run.
        </p>

        <h2>Protect the combo before chasing perfect</h2>
        <p>
          The two bonuses pull in different directions, and the combo is usually worth
          more. A perfect landing pays a flat bonus equal to your perfect streak, capped
          at <strong>+10</strong>. The combo multiplier climbs to <strong>&times;2.0</strong>
          on your eleventh consecutive jump &mdash; and it multiplies the entire jump,
          not just a bonus.
        </p>
        <p>
          Concretely: a mid-difficulty jump scores about 6 points. At &times;1.0 that is
          6; at &times;2.0 it is 12. So going for a risky centre hit that ends your run
          can cost you <em>twice</em> the points the perfect bonus was ever going to
          pay you on that jump. When you are past ten jumps, take the safe landing and
          keep the multiplier alive.
        </p>

        <h2>Why small blocks are doubly punishing</h2>
        <p>
          It is tempting to think a narrow block is just "a bit harder". It is harder
          by a square, not a little.
        </p>
        <p>
          A block's width is the entire success window &mdash; land anywhere inside
          those edges and you score. So halving the block width halves your allowed
          error. But the <em>difficulty</em> of the jump is scored on the ratio of gap
          to block width, which is logarithmic. A block going from 33 units to 12 units
          moves that ratio from 1.0 to 2.75, and the difficulty score all the way from
          5 to about 8.
        </p>
        <p>
          In other words: the small blocks are where the points are. They are also
          where runs end.
        </p>

        <h2>Aim for the centre, not for the block</h2>
        <p>
          The centre of a block is simultaneously the safest place to land and the only
          place that counts as perfect. A perfect landing is one that stops within
          <strong>15% of the block's width</strong> from the middle &mdash; for a
          maximum-width block that is a comfortable window; for the narrowest blocks in
          the game it is about <strong>20 milliseconds</strong> of timing either way.
        </p>
        <p>
          That number is why perfect streaks are rare. Do not chase them on small
          blocks; take the landing. Chase them on the wide blocks, where the window is
          four or five times wider and you are not risking much.
        </p>

        <h2>Read the gap, not the edge</h2>
        <p>
          The width of the block you are aiming at changes how far you have to travel:
          the cat has to clear its own block, the gap, and then reach the centre of the
          next one. Two jumps with an identical gap but different block widths need
          different holds.
        </p>
        <p>
          So measure from centre to centre, not from edge to edge. Players who
          undershoot consistently are usually measuring the gap and forgetting that a
          narrow landing block pulls the target <em>further</em> away, while a wide one
          pulls it closer.
        </p>

        <h2>The two ways you miss</h2>
        <p>
          Physically there are only two, and they have different fixes:
        </p>
        <ul>
          <li>
            <strong>Short.</strong> You released before the cat reached the block. It is
            almost always caused by measuring the gap from the near edge, or by
            underestimating a wide landing block. Fix: aim past the centre and let the
            width catch you.
          </li>
          <li>
            <strong>Long.</strong> You held past the point where the block was under the
            cat. This is the one that feels worse, because it usually happens after a
            string of good jumps when you start pushing for extra distance. Fix: pick
            the release time <em>before</em> you press, and do not extend mid-hold.
          </li>
        </ul>
        <p>
          There is no third. You cannot over-aim and be saved by the cat &mdash; the
          game only checks where you land.
        </p>

        <h2>What a good run looks like</h2>
        <p>
          A run of about twenty jumps puts you at &times;1.9, where even easy jumps pay
          in the low teens and a clean stretch of perfect landings pushes single jumps
          past 20. Past thirty jumps the multiplier stops climbing entirely, so from
          there the only thing left to improve is accuracy &mdash; which is exactly when
          the perfect streak becomes worth chasing.
        </p>
        <p>
          The best score is stored per browser, so the run you are trying to beat is
          always your own. See <a href="/scoring">how the score is calculated</a>, or
          go <a href="/">play</a>.
        </p>

        <p style="margin-top:34px">
          <a href="/">Play Kitty Jump</a> &nbsp;·&nbsp;
          <a href="/scoring">How scoring works</a> &nbsp;·&nbsp;
          <a href="/cats">The cats</a>
        </p>
      </article>
    </main>`;

module.exports = {
  path: 'tips',
  title: 'Kitty Jump Tips — How to Beat Your High Score',
  description:
    'Practical Kitty Jump strategy: the real hold-time range, why the combo multiplier is worth more than perfect-landing bonuses, why narrow blocks punish twice as hard, and the only two ways to miss.',
  body,
};
