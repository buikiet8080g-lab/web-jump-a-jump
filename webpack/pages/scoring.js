// /scoring —— 计分机制
//
// 页面上的每个数字都是从 src/util/Scoring.js 实际跑出来的（不是手算的），
// 改计分规则时这里要跟着重新核一遍，否则页面会骗人。

const body = `<main class="wrap">
      <article class="prose">
        <h1>How Scoring Works in Kitty Jump</h1>

        <p class="lede">
          A single jump in Kitty Jump is worth 1 to 10 points, and then a combo
          multiplier and a perfect-landing bonus are applied on top. The maximum
          a single jump can pay is <strong>30</strong>.
        </p>

        <h2>Jump distance versus block width</h2>
        <p>
          Everything starts from one ratio. You do not steer the cat in the air
          &mdash; you choose one number, how long you hold. And the game judges you
          against one number, how wide the block you are aiming at is.
        </p>
        <p>
          The chance of landing is set entirely by the width of the block you are
          aiming at: land anywhere within its edges and you score. So the ratio
        </p>
        <p><code>ratio = gap &divide; block width</code></p>
        <p>
          is really <em>how long you have to hold</em> divided by <em>how much error
          you are allowed</em>. Across the game's generated maps that ratio only ever
          falls between <strong>0.375</strong> (a wide block very close by &mdash;
          almost any hold works) and <strong>4.0</strong> (a narrow block far away
          &mdash; you have to be precise).
        </p>

        <h2>The difficulty score (1&ndash;10)</h2>
        <p>
          That ratio is converted into a difficulty between 0 and 1, then mapped
          onto a 1&ndash;10 score:
        </p>
        <p><code>difficulty = (ln(ratio) &minus; ln(0.375)) &divide; (ln(4.0) &minus; ln(0.375))</code></p>
        <p><code>difficulty score = 1 + round(difficulty &times; 9)</code></p>
        <p>
          The logarithm is not decoration. Perceived effort scales with the
          <em>ratio</em> of durations, not their difference &mdash; a 200&nbsp;ms hold
          and a 300&nbsp;ms hold feel far more different than 1,200&nbsp;ms and
          1,300&nbsp;ms. A linear scale would also squash almost every jump into the
          bottom two or three points and make scoring feel flat.
        </p>

        <div class="table-scroll">
          <table>
            <thead>
              <tr><th>Gap</th><th>Block width</th><th>Ratio</th><th>Difficulty score</th></tr>
            </thead>
            <tbody>
              <tr><td class="num">13</td><td class="num">33.3</td><td class="num">0.39</td><td class="num">1</td></tr>
              <tr><td class="num">20</td><td class="num">33.3</td><td class="num">0.61</td><td class="num">3</td></tr>
              <tr><td class="num">33</td><td class="num">33.3</td><td class="num">1.00</td><td class="num">5</td></tr>
              <tr><td class="num">30</td><td class="num">20</td><td class="num">1.50</td><td class="num">6</td></tr>
              <tr><td class="num">40</td><td class="num">12.5</td><td class="num">3.20</td><td class="num">9</td></tr>
              <tr><td class="num">50</td><td class="num">12.5</td><td class="num">4.00</td><td class="num">10</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          This is why the game never feels like it speeds up. Nothing gets faster.
          The blocks just stop being generous.
        </p>

        <h2>The combo multiplier</h2>
        <p>
          Every successful jump in a row adds <strong>+0.1</strong> to the multiplier,
          starting at &times;1.0 for the first jump of a run. It stops climbing at
          <strong>&times;2.0</strong>, which you reach on your eleventh consecutive jump.
        </p>

        <div class="table-scroll">
          <table>
            <thead>
              <tr><th>Jumps in a row</th><th>Multiplier</th></tr>
            </thead>
            <tbody>
              <tr><td class="num">1</td><td class="num">&times;1.0</td></tr>
              <tr><td class="num">2</td><td class="num">&times;1.1</td></tr>
              <tr><td class="num">5</td><td class="num">&times;1.4</td></tr>
              <tr><td class="num">10</td><td class="num">&times;1.9</td></tr>
              <tr><td class="num">11 or more</td><td class="num">&times;2.0</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The multiplier resets to &times;1.0 the moment you miss a block &mdash; which
          is what makes a long run compound, and what makes a careless jump late in a
          run expensive.
        </p>

        <h2>Perfect landing bonuses</h2>
        <p>
          A landing counts as <strong>perfect</strong> when the cat stops within
          <strong>15% of the block's width</strong> from its centre. That tolerance is
          proportional, so a wide block is not automatically easier to score a perfect
          on than a narrow one &mdash; you have to mean it either way.
        </p>
        <p>
          A perfect landing pays a flat bonus equal to how many perfect landings you
          have made in a row, up to <strong>+10</strong>. Chain three perfect landings
          and the third pays +3; chain twelve and you are still getting +10 for each.
          Miss the centre and the perfect streak resets to zero &mdash; but unlike the
          combo multiplier, <em>missing a block entirely</em> is the only thing that
          ends the run.
        </p>
        <p>
          One deliberate detail: the perfect bonus is added <em>after</em> the combo
          multiplier is applied, and is never multiplied by it. If perfect bonuses
          compounded with the combo, a long clean run would run away into absurd
          numbers and the difficulty score would stop mattering.
        </p>

        <h2>A worked example</h2>
        <div class="card">
          <p>Suppose you are on your <strong>5th jump in a row</strong>, aiming at a block
             <strong>20 units</strong> wide that is <strong>30 units</strong> away, and you
             land <strong>2 units</strong> from its centre. It is your third perfect landing
             in a row.</p>
          <ol>
            <li><code>ratio = 30 &divide; 20 = 1.50</code></li>
            <li>Difficulty works out to <strong>0.586</strong>, which rounds to a
                difficulty score of <strong>6</strong>.</li>
            <li>Fifth jump in a row &rarr; combo multiplier <strong>&times;1.4</strong>.</li>
            <li>The perfect tolerance is 20 &times; 0.15 = <strong>3.0</strong>, and your
                2-unit offset is inside it &mdash; and it is the 3rd perfect in a row, so
                the bonus is <strong>+3</strong>.</li>
            <li><code>score = round(6 &times; 1.4) + 3 = 8 + 3 = 11 points</code></li>
          </ol>
        </div>
        <p>
          So the same physical jump that is worth 6 points on its own pays nearly
          double once a run is going and you are hitting centres. That is the whole
          scoring design: get consistent first, then get accurate.
        </p>

        <h2>Your best score</h2>
        <p>
          Kitty Jump keeps a single high score per browser, stored locally. It is
          overwritten whenever a run beats it, and it survives replaying. There is no
          leaderboard and no account, so it is always you against your own last run.
        </p>

        <p style="margin-top:34px">
          <a href="/">Play Kitty Jump</a> &nbsp;·&nbsp;
          <a href="/tips">Tips for a higher score</a> &nbsp;·&nbsp;
          <a href="/cats">The cats</a>
        </p>
      </article>
    </main>`;

module.exports = {
  path: 'scoring',
  title: 'Kitty Jump Scoring — Combos, Difficulty & Perfect Landings',
  description:
    'Exactly how Kitty Jump scores a jump: the gap-to-block-width ratio, the 1–10 difficulty score, the combo multiplier up to ×2.0, and perfect landing bonuses. Includes a worked example.',
  body,
};
