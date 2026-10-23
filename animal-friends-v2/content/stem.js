/* ============================================================
   content/stem.js — Science, Technology, Engineering, Maths
   ------------------------------------------------------------
   Curriculum map (lingokids_content_architecture.md, section 3):
     Scientific inquiry -> Discover  (biology, earth science, space,
                                      simple physics, animals)
     First coding       -> Coding    (planning steps in order)

   Maths moved to content/math.js in v4 (the Wink curriculum: five
   levels, each covering six areas). Numbers and Shapes were folded
   into it.
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, PR = AF.Pairs, W = AF.WORDS;
  const num = (list) => list.map(n => ({ glyph: String(n), label: AF.NUM[n] }));
  const it = (e, word, bin) => ({ e: e, w: word, bin: bin });
  const step = (e, label) => ({ e: e, label: label });
  /* 'goes' or 'go': plural words (stars) take the plural verb */
  const pl = (word, one, many) => /[^su]s$/.test(word) ? many : one;   // (not bus, glass)

  /* ---------------- Discover (science) ---------------- */

  const HOMES = [it('🐟', 'fish', 'water'), it('🐳', 'whale', 'water'), it('🐙', 'octopus', 'water'), it('🐬', 'dolphin', 'water'),
    it('🐮', 'cow', 'land'), it('🐴', 'horse', 'land'), it('🦁', 'lion', 'land'), it('🐶', 'dog', 'land'),
    it('🐦', 'bird', 'sky'), it('🐝', 'bee', 'sky'), it('🦋', 'butterfly', 'sky'), it('🦅', 'eagle', 'sky')];
  const HOME_BINS = [{ key: 'land', emoji: '🌳', label: 'Land', c: '#7BD389' }, { key: 'water', emoji: '🌊', label: 'Water', c: '#4CC3FF' },
    { key: 'sky', emoji: '☁️', label: 'Sky', c: '#B9C8FF' }];

  const ALIVE = [it('🐶', 'dog', 'yes'), it('🌳', 'tree', 'yes'), it('🌸', 'flower', 'yes'), it('🐦', 'bird', 'yes'),
    it('🐟', 'fish', 'yes'), it('🐛', 'caterpillar', 'yes'), it('🪨', 'rock', 'no'), it('🚗', 'car', 'no'),
    it('⚽', 'ball', 'no'), it('🪑', 'chair', 'no'), it('🥄', 'spoon', 'no'), it('👟', 'shoe', 'no')];
  const ALIVE_BINS = [{ key: 'yes', emoji: '🌱', label: 'Living', c: '#7BD389' }, { key: 'no', emoji: '🧱', label: 'Not living', c: '#C9C3D9' }];

  const FLOAT = [it('🦆', 'duck', 'float'), it('⛵', 'boat', 'float'), it('🍃', 'leaf', 'float'), it('⚽', 'ball', 'float'),
    it('🍎', 'apple', 'float'), it('🪨', 'rock', 'sink'), it('🔑', 'key', 'sink'), it('🪙', 'coin', 'sink'),
    it('⚓', 'anchor', 'sink'), it('🥄', 'spoon', 'sink')];
  const FLOAT_BINS = [{ key: 'float', emoji: '⬆️', label: 'Floats', c: '#4CC3FF' }, { key: 'sink', emoji: '⬇️', label: 'Sinks', c: '#8FA3C8' }];

  const SENSE = [{ key: 'eye', emoji: '👁️' }, { key: 'ear', emoji: '👂' }, { key: 'nose', emoji: '👃' }, { key: 'tongue', emoji: '👅' }, { key: 'hand', emoji: '✋' }];
  const sense = (say, show, answer, praise) => ({
    say: say, show: `<span class="big-e">${show}</span>`,
    options: [SENSE.filter(s => s.key === answer)[0]].concat(AF.U.pick(SENSE.filter(s => s.key !== answer), 2)),
    answer: answer, praise: praise
  });
  const SENSES = [
    sense('A rainbow! What do you see it with?', '🌈', 'eye', 'We see with our eyes'),
    sense('Music! What do you hear it with?', '🎵', 'ear', 'We hear with our ears'),
    sense('A flower. What do you smell it with?', '🌸', 'nose', 'We smell with our nose'),
    sense('Ice cream! What do you taste it with?', '🍦', 'tongue', 'We taste with our tongue'),
    sense('A soft kitten. What do you feel it with?', '🐱', 'hand', 'We feel with our hands'),
    sense('A bell is ringing. What do you hear it with?', '🔔', 'ear', 'We hear with our ears'),
    sense('A book. What do you look at it with?', '📖', 'eye', 'We see with our eyes'),
    sense('Yummy soup. What do you smell it with?', '🍲', 'nose', 'We smell with our nose')
  ];

  const wear = (say, show, answer, praise) => ({
    say: say, show: `<span class="big-e">${show}</span>`,
    options: [{ key: 'sun', emoji: '🧢', label: 'sun hat' }, { key: 'rain', emoji: '☂️', label: 'umbrella' }, { key: 'cold', emoji: '🧣', label: 'scarf' }],
    answer: answer, praise: praise
  });
  const WEATHER = [
    wear('It is raining. What do you need?', '🌧️', 'rain', 'An umbrella keeps you dry'),
    wear('It is hot and sunny. What do you need?', '☀️', 'sun', 'A hat keeps the sun off'),
    wear('It is snowing. What do you need?', '❄️', 'cold', 'A scarf keeps you warm'),
    wear('It is a very cold day. What do you need?', '🥶', 'cold', 'A scarf keeps you warm'),
    wear('Look at the dark rain clouds. What do you need?', '⛈️', 'rain', 'An umbrella keeps you dry')
  ];

  const sp = (say, answer, opts, praise) => ({
    say: say, options: opts.map(o => ({ key: o[0], emoji: o[1] })), answer: answer, praise: praise
  });
  const SPACE = [
    sp('Which one is the sun?', 'sun', [['sun', '☀️'], ['moon', '🌙'], ['earth', '🌍']], 'The sun gives us light'),
    sp('Which one do we live on?', 'earth', [['earth', '🌍'], ['moon', '🌙'], ['star', '⭐']], 'We live on planet Earth'),
    sp('What can fly to space?', 'rocket', [['rocket', '🚀'], ['bus', '🚌'], ['bike', '🚲']], 'A rocket flies to space'),
    sp('What shines in the sky at night?', 'moon', [['moon', '🌙'], ['sun', '☀️'], ['tree', '🌳']], 'The moon shines at night'),
    sp('Who travels to space?', 'astronaut', [['astronaut', '🧑‍🚀'], ['farmer', '🧑‍🌾'], ['cook', '🧑‍🍳']], 'An astronaut!'),
    sp('Which one is a comet? It has a long, shiny tail.', 'comet', [['comet', '☄️'], ['earth', '🌍'], ['moon', '🌙']], 'A comet has a shiny tail'),
    sp('What do we use to look at the stars?', 'telescope', [['telescope', '🔭'], ['spoon', '🥄'], ['shoe', '👟']], 'A telescope')
  ];

  const season = (say, show, answer, praise) => ({
    say: say, show: `<span class="big-e">${show}</span>`,
    options: [{ key: 'spring', emoji: '🌸', label: 'spring' }, { key: 'summer', emoji: '☀️', label: 'summer' },
      { key: 'autumn', emoji: '🍂', label: 'autumn' }, { key: 'winter', emoji: '❄️', label: 'winter' }],
    answer: answer, praise: praise
  });
  const SEASONS = [
    season('Snow is falling. Which season is it?', '⛄', 'winter', 'It snows in winter'),
    season('The leaves turn orange and fall. Which season is it?', '🍁', 'autumn', 'Leaves fall in autumn'),
    season('Flowers begin to grow. Which season is it?', '🌷', 'spring', 'Flowers grow in spring'),
    season('It is hot and we go to the beach. Which season is it?', '🏖️', 'summer', 'Summer is hot'),
    season('Baby birds hatch in their nests. Which season is it?', '🐣', 'spring', 'Lots of baby animals are born in spring'),
    season('We wear a warm coat and gloves. Which season is it?', '🧤', 'winter', 'Winter is cold'),
    season('We pick apples and pumpkins. Which season is it?', '🎃', 'autumn', 'We pick them in autumn')
  ];

  const plant = (say, show, good) => ({
    say: say + ' Does a plant need it?', text: AF.U.esc(say) + ' Does a plant <b>need</b> it?',
    show: `<span class="big-e">${show}</span>`,
    options: [{ key: true, emoji: '👍', label: 'Yes', c: '#7BD389' }, { key: false, emoji: '👎', label: 'No', c: '#FFB3B3' }],
    answer: good, praise: good ? 'Yes, plants need that' : 'No, plants do not need that'
  });
  const PLANTS = [plant('Water.', '💧', true), plant('Sunlight.', '☀️', true), plant('Soil.', '🪴', true),
    plant('Sweets.', '🍬', false), plant('Air.', '🌬️', true), plant('A television.', '📺', false), plant('Shoes.', '👟', false)];

  AF.register({
    id: 'science', area: 'stem',
    title: 'Discover', icon: '🔬', colour: '#7BD389',
    blurb: 'How things work',
    skill: 'Science and the world',
    tip: 'Fill a bowl with water and test what floats and what sinks. Guess first, then try!',
    levels: AF.tiers([
      /* ---- Basic: animals and my own body ---- */
      { id: 'd1', title: 'Animal homes', icon: '🏡', type: 'sort', rounds: 7, items: HOMES, bins: HOME_BINS,
        ask: i => `Where do you find the ${i.w}?`,
        tell: (i, b) => `The ${i.w} ${b.key === 'land' ? 'lives on land' : b.key === 'water' ? 'lives in water' : 'flies in the sky'}` },
      { id: 'd2', title: 'My senses', icon: '👃', type: 'choose', rounds: 6, gen: G.ask(SENSES) },
      { id: 'd8', title: 'Who eats what?', icon: '🥕', type: 'match', rounds: 3, n: 3,
        pairs: PR.of([['rabbit', '🐰', '🥕', 'The rabbit eats a carrot'], ['monkey', '🐵', '🍌', 'The monkey eats a banana'],
          ['mouse', '🐭', '🧀', 'The mouse eats cheese'], ['bee', '🐝', '🌸', 'The bee visits a flower'],
          ['dog', '🐶', '🦴', 'The dog chews a bone'], ['cat', '🐱', '🐟', 'The cat eats fish'], ['panda', '🐼', '🎋', 'The panda eats bamboo']]),
        say: 'What does each animal eat?', text: 'What does each animal <b>eat</b>?' },
      { id: 'd3', title: 'Alive or not?', icon: '🌱', type: 'sort', rounds: 8, items: ALIVE, bins: ALIVE_BINS,
        ask: i => `Is the ${i.w} living?`, tell: (i, b) => `The ${i.w} is ${b.key === 'yes' ? 'living' : 'not living'}` },
      { id: 'd9', title: 'Day or night?', icon: '🌙', type: 'sort', rounds: 8,
        items: [it('☀️', 'sun', 'day'), it('🌈', 'rainbow', 'day'), it('🐓', 'rooster', 'day'), it('🦋', 'butterfly', 'day'), it('🏫', 'school', 'day'),
          it('🌙', 'moon', 'night'), it('⭐', 'stars', 'night'), it('🦉', 'owl', 'night'), it('🦇', 'bat', 'night'), it('🛏️', 'bed', 'night')],
        bins: [{ key: 'day', emoji: '🌞', label: 'Day', c: '#F2B618' }, { key: 'night', emoji: '🌜', label: 'Night', c: '#6C63C7' }],
        ask: i => `${i.w}. Day, or night?`, tell: (i, b) => `The ${i.w} ${pl(i.w, 'goes', 'go')} with ${b.key}` }
    ], [
      /* ---- Intermediate: how things grow and behave ---- */
      { id: 'd4', title: 'How it grows', icon: '🌻', type: 'order', sets: [
        { say: 'How does a flower grow? Put it in order.', text: 'How does a <b>flower</b> grow?',
          steps: [step('🌰', 'seed'), step('🌱', 'sprout'), step('🌿', 'plant'), step('🌻', 'flower')], praise: 'Seed, sprout, plant, flower!' },
        { say: 'How does a chick grow? Put it in order.', text: 'How does a <b>chick</b> grow?',
          steps: [step('🥚', 'egg'), step('🐣', 'hatching'), step('🐥', 'chick'), step('🐔', 'hen')], praise: 'Egg, chick, hen!' },
        { say: 'What happens in a day? Put it in order.', text: 'What happens in a <b>day</b>?',
          steps: [step('🌅', 'morning'), step('☀️', 'midday'), step('🌇', 'evening'), step('🌙', 'night')], praise: 'Morning, midday, evening, night!' }
      ] },
      { id: 'd5', title: 'Weather', icon: '🌦️', type: 'choose', rounds: 5, gen: G.ask(WEATHER, false) },
      { id: 'd6', title: 'Float or sink', icon: '🚢', type: 'sort', rounds: 8, items: FLOAT, bins: FLOAT_BINS,
        ask: i => `Does the ${i.w} float or sink?`, tell: (i, b) => `The ${i.w} ${b.key === 'float' ? 'floats' : 'sinks'}` },
      { id: 'd10', title: 'Hot or cold?', icon: '🌡️', type: 'sort', rounds: 8,
        items: [it('🔥', 'fire', 'hot'), it('☀️', 'sun', 'hot'), it('🍲', 'soup', 'hot'), it('☕', 'hot drink', 'hot'), it('🌋', 'volcano', 'hot'),
          it('🏔️', 'snowy mountain', 'cold'), it('⛄', 'snowman', 'cold'), it('🍦', 'ice cream', 'cold'), it('❄️', 'snow', 'cold'), it('🐧', 'penguin’s home', 'cold')],
        bins: [{ key: 'hot', emoji: '🥵', label: 'Hot', c: '#EE5B5B' }, { key: 'cold', emoji: '🥶', label: 'Cold', c: '#4D9DE0' }],
        ask: i => `${i.w}. Hot, or cold?`, tell: (i, b) => `The ${i.w} is ${b.key}` },
      { id: 'd11', title: 'Little and big', icon: '🐣', type: 'match', rounds: 3, n: 3,
        pairs: PR.of([['hen', '🐔', '🐥', 'A hen was once a chick'], ['frog', '🐸', '🥚', 'A frog comes from an egg'],
          ['butterfly', '🦋', '🐛', 'A butterfly was a caterpillar'], ['flower', '🌻', '🌰', 'A flower grows from a seed'],
          ['tree', '🌳', '🌱', 'A tree was a little sprout']]),
        say: 'What did each one start as?', text: 'What did each one <b>start as</b>?' }
    ], [
      /* ---- Advanced: space, materials, seasons, life cycles ---- */
      { id: 'd7', title: 'Space', icon: '🚀', type: 'choose', rounds: 7, gen: G.ask(SPACE) },
      { id: 'd12', title: 'Hard or soft?', icon: '🧱', type: 'sort', rounds: 8,
        items: [it('🪨', 'rock', 'hard'), it('🔑', 'key', 'hard'), it('🧱', 'brick', 'hard'), it('🥄', 'spoon', 'hard'), it('🔨', 'hammer', 'hard'),
          it('🧸', 'teddy', 'soft'), it('🧦', 'sock', 'soft'), it('☁️', 'cotton wool', 'soft'), it('🐑', 'wool', 'soft'), it('🛏️', 'pillow', 'soft')],
        bins: [{ key: 'hard', emoji: '🪨', label: 'Hard', c: '#8E96A3' }, { key: 'soft', emoji: '🧸', label: 'Soft', c: '#EC7FA9' }],
        ask: i => `Is the ${i.w} hard or soft?`, tell: (i, b) => `The ${i.w} is ${b.key}` },
      { id: 'd13', title: 'Seasons', icon: '🍂', type: 'choose', rounds: 7, gen: G.ask(SEASONS) },
      { id: 'd14', title: 'Life cycles', icon: '🦋', type: 'order', sets: [
        { say: 'How does a butterfly grow? Put it in order.', text: 'How does a <b>butterfly</b> grow?',
          steps: [step('🥚', 'egg'), step('🐛', 'caterpillar'), step('💤', 'chrysalis'), step('🦋', 'butterfly')], praise: 'Egg, caterpillar, chrysalis, butterfly!' },
        { say: 'How does an apple tree grow? Put it in order.', text: 'How does an <b>apple tree</b> grow?',
          steps: [step('🌰', 'seed'), step('🌱', 'sprout'), step('🌳', 'tree'), step('🌸', 'blossom'), step('🍎', 'apple')], praise: 'Seed, sprout, tree, blossom, apple!' },
        { say: 'Where does rain come from? Put it in order.', text: 'Where does <b>rain</b> come from?',
          steps: [step('☀️', 'sun warms water'), step('☁️', 'cloud'), step('🌧️', 'rain'), step('🌊', 'river')], praise: 'Sun, cloud, rain, river!' }
      ] },
      { id: 'd15', title: 'What plants need', icon: '🪴', type: 'choose', rounds: 6, gen: G.ask(PLANTS, false) }
    ])
  });

  /* ---------------- Coding ----------------
     Science & Tech in the curriculum includes first coding:
     planning a sequence of steps before carrying it out.
     S start, G the house, # a rock, * a star, . grass. */

  const code = (id, title, grid, say, text, preview) => ({
    id: id, title: title, icon: '🤖', type: 'code', grid: grid, say: say, text: text, preview: !!preview
  });
  const HOME = 'Line up the arrows to get me home. Then press go!';
  const HOME_T = 'Line up the <b>arrows</b>, then press <b>Go</b>';
  const STARS = 'Get the stars on the way home. Then press go!';
  const STARS_T = 'Get the <b>stars</b> on the way home';

  AF.register({
    id: 'coding', area: 'stem',
    title: 'Coding', icon: '🤖', colour: '#F5B81C',
    blurb: 'Plan, then go',
    note: 'Line up the arrows, then press Go',
    skill: 'Planning steps in order (first coding)',
    tip: 'Play “robot”: your child gives you one step at a time — forward, turn, forward — to reach the sofa.',
    levels: AF.tiers([
      /* ---- Basic: straight lines and one turn, with footprints to show the plan ---- */
      code('c1', 'Three steps', ['S..G'], HOME, HOME_T, true),
      code('c2', 'Go down', ['S', '.', '.', 'G'], HOME, HOME_T, true),
      code('c3', 'One turn', ['S..', '..G'], HOME, HOME_T, true),
      code('c4', 'Round the corner', ['S..', '#..', '#.G'], HOME, HOME_T, true),
      code('c5', 'A star', ['S.*', '..G'], STARS, STARS_T, true)
    ], [
      /* ---- Intermediate: rocks in the way, no footprints ---- */
      code('c6', 'Mind the rock', ['S#.', '...', '.#G'], HOME, HOME_T),
      code('c7', 'Zig zag', ['S.#.', '#..#', '.#.G'], HOME, HOME_T),
      code('c8', 'Star path', ['S.*.', '.#.#', '...G'], STARS, STARS_T),
      code('c9', 'The long way', ['S.#G', '.##.', '....'], HOME, HOME_T),
      code('c10', 'Two stars', ['S*..', '.#.*', '..#G'], STARS, STARS_T)
    ], [
      /* ---- Advanced: bigger boards, several stars, longer plans ---- */
      code('c11', 'Rock garden', ['S.#..', '..#.#', '.....', '#.#.G'], HOME, HOME_T),
      code('c12', 'Star hunt', ['S..#.', '.#*..', '.#.#.', '*...G'], STARS, STARS_T),
      code('c13', 'Snake path', ['S....', '####.', '.....', '.####', '....G'], HOME, HOME_T),
      code('c14', 'Three stars', ['S.*..', '.#.#.', '*...*', '.#.#G'], STARS, STARS_T),
      code('c15', 'The big one', ['S.#...', '..#.#.', '.*..#*', '.##...', '....#G'], STARS, STARS_T)
    ])
  });
})(window.AF = window.AF || {});
