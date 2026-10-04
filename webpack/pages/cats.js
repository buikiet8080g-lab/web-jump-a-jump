// /cats —— 方块上的猫
//
// 品种特征是按真实的猫写的（不是编的），因为这一页的意义就是「游戏之外的
// 真内容」：可以放内部链接、可以承接「cat breeds」这类搜索，而且不会和
// 其他游戏的页面撞车。

const BREEDS = [
  {
    slug: 'scottish-fold',
    name: 'Scottish Fold',
    swatch: '#3d5a61',
    look: 'Folded flat ears, an unusually round head, huge round eyes',
    text: `The giveaway is the ears. A cartilage mutation makes them fold forward and
           down, so the head reads as a single round shape with almost no ear tips.
           In the game this is the easiest breed to spot from directly above, because
           there is nothing sticking out of the silhouette.`,
    fact: `The fold is caused by a gene that affects cartilage throughout the body, not
           just the ears — which is why responsible breeders only ever cross a folded
           cat with a straight-eared one.`,
  },
  {
    slug: 'maine-coon',
    name: 'Maine Coon',
    swatch: '#c8763c',
    look: 'Large pointed ears with tufts, a shaggy ruff around the face',
    text: `Big, angular and shaggy. The ears carry little tufts at the tips and the
           cheeks flare into a ruff, so the face is wider than it is tall. On a block
           it is the busiest of the six, with the most small details.`,
    fact: `Maine Coons are among the largest domestic cats, and their ear tufts and
           thick tail are both cold-weather adaptations from the north-eastern
           United States.`,
  },
  {
    slug: 'ragdoll',
    name: 'Ragdoll',
    swatch: '#9aa8b8',
    look: 'Bicolor face — a white blaze up the middle, blue-grey on the sides, blue eyes',
    text: `This one is drawn as a <em>bicolor</em> Ragdoll: a white inverted V runs up
           the middle of the face while the cheeks and ears stay blue-grey. It is
           deliberately the opposite of the Siamese — pale centre, dark edges.`,
    fact: `Ragdolls are colourpoint cats, which means they are born white and their
           darker patches develop on the coolest parts of the body — the ears, face
           and tail.`,
  },
  {
    slug: 'british-shorthair',
    name: 'British Shorthair',
    swatch: '#8b93a8',
    look: 'A very round face with full cheeks and small, widely set ears',
    text: `Round on round. The cheeks push out past the ears, the eyes are wide circles,
           and the ears sit low and far apart. If a block has a cat on it that looks
           slightly surprised and slightly overfed, it is this one.`,
    fact: `That dense, plush coat is why the breed is often described as looking like a
           teddy bear — and why it takes longer to dry after a bath than most cats.`,
  },
  {
    slug: 'siamese',
    name: 'Siamese',
    swatch: '#6b4a3a',
    look: 'A dark mask over the centre of the face, almond blue eyes, pale cream body',
    text: `The inverse of the Ragdoll: dark in the middle, pale at the edges. The mask
           covers the nose and spans across the eyes, and the ears match it. Together
           with the almond-shaped eyes it is the most angular face in the set.`,
    fact: `Siamese is one of the oldest recognised cat breeds, and the same
           temperature-sensitive colouring gene is behind several other colourpoint
           breeds, including the Ragdoll.`,
  },
  {
    slug: 'tuxedo',
    name: 'Tuxedo',
    swatch: '#1c1c22',
    look: 'Black face with a white chin and muzzle, bright yellow eyes',
    text: `Not a breed — a coat pattern. Black across the top of the head and around the
           eyes, white over the chin and mouth, split cleanly down the middle. The
           highest-contrast cat on any block, which makes it the easiest to judge your
           landing offset against.`,
    fact: `Tuxedo is a bicolor pattern, and because the white patches are not tied to
           breed, they show up on completely unrelated cats around the world.`,
  },
];

const CARD = (b) => `          <li class="breed">
            <h3><span class="swatch" style="background:${b.swatch}"></span>${b.name}</h3>
            <p>${b.text}</p>
            <p style="margin-top:10px"><strong>Look for:</strong> ${b.look}</p>
            <p style="margin-top:10px"><strong>Real world:</strong> ${b.fact}</p>
          </li>`;

const body = `<main class="wrap">
      <article class="prose" style="max-width:88ch">
        <h1>Every Cat You'll Land On in Kitty Jump</h1>

        <p class="lede">
          Six breeds and one paw print. The cats are purely decorative &mdash; a block
          with a Maine Coon on it is exactly as wide as one with a Scottish Fold &mdash;
          but blocks are drawn at random, so you will quickly develop opinions.
        </p>

        <h2>How the cat blocks work</h2>
        <p>
          Most blocks are painted with one of the patterns below. The pattern is
          applied as a single image, centred on each face of the block, scaled to fit
          without stretching. That last part matters more than it sounds: an earlier
          version tiled the image to fill the face, which turned every cat into a grid
          of dozens of unreadable little cats. One cat per face, always the right
          proportions.
        </p>
        <p>
          The colour underneath is picked at random too, so the same breed can turn up
          on a mint block, a lavender one or anything else in the palette. The cat
          keeps its own colours regardless &mdash; the block colour only fills the space
          around it.
        </p>

        <h2>The six breeds</h2>
        <ul class="breed-grid">
${BREEDS.map(CARD).join('\n')}
        </ul>

        <h2>The paw print</h2>
        <p>
          The seventh pattern is not a cat at all. Paw prints show up on roughly one
          block in seven, and they are the plainest block decoration in the game
          &mdash; just a big orange pad and four toes. They are also, quietly, the
          easiest to judge a perfect landing against: the centre pad sits exactly
          where the centre of the block is.
        </p>

        <h2>Does the cat affect how a block plays?</h2>
        <p>
          No. Block width and the distance to the next block are the only two things
          that decide how hard a jump is, and both are rolled independently of the
          decoration. You cannot learn to recognise a "hard" cat &mdash; which is
          probably for the best, because it means every block has to be read on its
          actual size.
        </p>
        <p>
          What the decoration does affect is <em>you</em>. High-contrast cats like the
          Tuxedo make it easy to see where the centre of a block is, and
          <a href="/scoring">perfect landings</a> depend on exactly that.
        </p>

        <p style="margin-top:34px">
          <a href="/">Play Kitty Jump</a> &nbsp;·&nbsp;
          <a href="/scoring">How scoring works</a> &nbsp;·&nbsp;
          <a href="/tips">Tips</a>
        </p>
      </article>
    </main>`;

module.exports = {
  path: 'cats',
  title: 'The Cats in Kitty Jump — Every Breed on the Blocks',
  description:
    'Meet the six cat breeds painted on the blocks in Kitty Jump — Scottish Fold, Maine Coon, Ragdoll, British Shorthair, Siamese and Tuxedo — plus what each one really looks like and why the decorations are harder to spot than you think.',
  body,
};
