// 首页 = 游戏本体 + 右侧（手机上是下方）的说明内容

const { SITE, absolute } = require('../site');

const FAQ = [
  {
    q: 'Is Kitty Jump free to play?',
    a: 'Yes. There is no purchase, no subscription, and no account. Open the page and play.',
  },
  {
    q: 'Do I need to install or download anything?',
    a: 'No. Kitty Jump runs in the browser on desktop and mobile. There is nothing to install.',
  },
  {
    q: 'Where is my high score saved?',
    a: 'In your own browser, using local storage. Nothing is uploaded anywhere — which also means clearing your browser data will clear your best score.',
  },
  {
    q: 'Do my scores sync between devices?',
    a: 'No. Scores stay on the device and browser you played on. There is no account system, so there is nothing to sync.',
  },
  {
    q: 'How is the score calculated?',
    a: 'Each jump is worth 1 to 10 points based on how demanding it was, multiplied by a combo bonus, plus a separate bonus for landing close to the centre of the block. The scoring page walks through the exact formula.',
  },
  {
    q: 'Does it work on a phone?',
    a: 'Yes — it is designed for it. Hold a finger anywhere on the game area to charge, then lift to jump. The layout switches to a single column on narrow screens.',
  },
  {
    q: 'Is there an end, or a final level?',
    a: 'No. The game is endless. The blocks keep coming until you miss one, so the only goal is beating your own best score.',
  },
  {
    q: 'Can I play offline?',
    a: 'Once the page has finished loading, everything runs inside your browser, so a dropped connection will not interrupt a run. You will still need a connection to load the page in the first place.',
  },
  {
    q: 'Why do the blocks keep changing size?',
    a: 'Block width and the gap between blocks are both random. That randomness is the difficulty curve: wide blocks forgive an imprecise jump, narrow ones do not.',
  },
];

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function videoGameJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: SITE.name,
    url: absolute(''),
    description:
      'A free browser game in the jump jump family: hold to charge, release to hop, and land on the next block. Six cat breeds, combo scoring and perfect-landing bonuses.',
    genre: ['Casual game', 'Arcade game'],
    gamePlatform: ['Web browser', 'iOS', 'Android'],
    playMode: 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Any device with a web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    image: SITE.url + SITE.ogImage,
  };
}

const body = `<main class="home-main">
      <div class="game-column">
        <!-- 画布 / 分数板 / 浮层都由 src/index.js 注入到这里 -->
        <div class="game-stage" data-game-canvas></div>
      </div>

      <div class="home-copy">
        <div class="home-copy-inner">
          <h1>Kitty Jump &mdash; a Free One-Thumb Cat Jumping Game</h1>

          <p class="lede">
            Kitty Jump is a browser game in the <em>jump jump</em> family. Hold to charge,
            release to hop, and land on the next block &mdash; this time every block is
            wearing a cat. No download, no account, no waiting.
          </p>

          <h2>How to play</h2>
          <ol>
            <li><strong>Hold</strong> anywhere on the game area to charge the jump.
                A ring fills up around your finger (or the cursor).</li>
            <li><strong>Release</strong> to jump. The longer you held, the further the cat goes.</li>
            <li><strong>Land on the next block</strong> to score and keep the run alive.
                Miss it and the run ends.</li>
            <li><strong>Aim for the centre.</strong> Landing close to the middle of a block
                counts as a perfect landing and pays a bonus.</li>
          </ol>
          <p>
            That is the whole game. There is no timer and no second control &mdash; the only
            thing you are tuning is how long you hold.
          </p>

          <h2>Why the blocks keep changing size</h2>
          <p>
            The width of the next block and the distance to it are both random. That
            randomness <em>is</em> the difficulty curve: the game never speeds up, it just
            becomes less forgiving. A wide block tolerates a sloppy release; a narrow one
            does not. Because the same charge gives a different result depending on the
            block ahead, long runs are about reading the gap before you commit, not about
            raw reaction time.
          </p>

          <h2>How scoring works</h2>
          <p>
            A single jump is worth <strong>1 to 10 points</strong>, based on how demanding
            it was: short hops between wide blocks pay little, long hops onto narrow blocks
            pay the most.
          </p>
          <ul>
            <li>Consecutive successful jumps build a <strong>combo multiplier</strong>, up to &times;2.</li>
            <li>Landing near the centre of a block is a <strong>perfect landing</strong>,
                worth extra points on its own and building a separate streak.</li>
            <li>Missing a block ends the run and resets everything except your best score.</li>
          </ul>
          <p>
            The <a href="/scoring">scoring page</a> spells out the exact formula, including a
            worked example.
          </p>

          <h2>The cats</h2>
          <p>
            The blocks are decorated with six cat breeds and a paw print. They are cosmetic
            &mdash; a block with a Scottish Fold on it is exactly as wide as one with a
            Maine Coon &mdash; but you will end up with favourites.
            <a href="/cats">Meet all of them</a>.
          </p>

          <h2>Frequently asked questions</h2>
          <dl class="faq">
${FAQ.map(({ q, a }) => `            <dt>${q}</dt>\n            <dd>${a}</dd>`).join('\n')}
          </dl>

          <p style="margin-top:34px">
            Want to push your best score higher?
            <a href="/tips">Read the tips</a>.
          </p>
        </div>
      </div>
    </main>`;

module.exports = {
  path: '',
  title: 'Kitty Jump — Free Cat Jumping Game, Play Online',
  description:
    'Play Kitty Jump, a free one-thumb cat jumping game in your browser. Hold to charge, release to hop, land on the next block. Six cat breeds, combo scoring, no download or account.',
  body,
  jsonLd: [videoGameJsonLd(), faqJsonLd()],
};
