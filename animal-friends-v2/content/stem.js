/* ============================================================
   content/stem.js — Science, Technology, Engineering, Maths
   ------------------------------------------------------------
   Curriculum map (lingokids_content_architecture.md, section 3):
     Pre-numeracy       -> Numbers   (cardinality, counting, + and −)
                        -> Shapes    (geometry, colour, patterns, size)
     Scientific inquiry -> Discover  (biology, earth science, space,
                                      simple physics)

   Maths follows concrete -> pictorial -> symbolic: the child counts
   real pictures long before a bare "2 + 1" appears.
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, PR = AF.Pairs, W = AF.WORDS;
  const num = (list) => list.map(n => ({ glyph: String(n), label: AF.NUM[n] }));
  const it = (e, word, bin) => ({ e: e, w: word, bin: bin });
  const step = (e, label) => ({ e: e, label: label });

  /* ---------------- Numbers ---------------- */

  AF.register({
    id: 'numbers', area: 'stem',
    title: 'Numbers', icon: '🔢', colour: '#36D6B5',
    blurb: 'Count & add',
    note: 'Count the pictures, tap the number',
    skill: 'Counting and early sums',
    tip: 'Count real things together: stairs, spoons, socks. Touch each one as you say the number.',
    levels: AF.tiers([
      /* ---- Basic: numbers to five ---- */
      { id: 'n1', title: 'Count to 3', icon: '3', type: 'choose', rounds: 5, gen: G.count(1, 3, 3) },
      { id: 'nt1', title: 'Trace 1 2 3', icon: '✏️', type: 'trace', kind: 'number', set: [1, 2, 3], ordered: true },
      { id: 'n2', title: 'Count to 5', icon: '5', type: 'choose', rounds: 6, gen: G.count(1, 5, 3) },
      { id: 'nm1', title: 'Number & stars', icon: '⭐', type: 'match', rounds: 3, n: 3, pairs: PR.count(1, 5),
        say: 'Match each number to the stars.', text: 'Match each <b>number</b> to the stars' },
      { id: 'np1', title: 'Pop the number', icon: '🎈', type: 'pop', rounds: 4, gen: G.numeral(1, 5, 3) },
      { id: 'n3', title: 'Find the number', icon: '👂', type: 'choose', rounds: 6, gen: G.numeral(1, 10, 3) },
      { id: 'nt2', title: 'Trace 4 5 6', icon: '✏️', type: 'trace', kind: 'number', set: [4, 5, 6], ordered: true }
    ], [
      /* ---- Intermediate: numbers to ten, order, first sums ---- */
      { id: 'n4', title: 'Count to 10', icon: '10', type: 'choose', rounds: 7, gen: G.count(4, 10, 4) },
      { id: 'n5', title: 'More or fewer', icon: '⚖️', type: 'choose', rounds: 7, gen: G.compare(6) },
      { id: 'nt3', title: 'Trace 7 8 9', icon: '✏️', type: 'trace', kind: 'number', set: [7, 8, 9, 0], ordered: true },
      { id: 'n6', title: 'In order', icon: '🔢', type: 'order', pick: 3, sets: [
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([1, 2, 3, 4]), praise: 'One, two, three, four!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([2, 3, 4, 5]), praise: 'Two, three, four, five!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([4, 5, 6, 7]), praise: 'Four, five, six, seven!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([6, 7, 8, 9, 10]), praise: 'Six, seven, eight, nine, ten!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([1, 3, 5, 7]), praise: 'One, three, five, seven!' }
      ] },
      { id: 'n10', title: 'Before & after', icon: '↔️', type: 'choose', rounds: 7, gen: G.neighbour(2, 9, 3) },
      { id: 'nm2', title: 'Match to 10', icon: '🔟', type: 'match', rounds: 3, n: 4, pairs: PR.count(3, 10, '🔵'),
        say: 'Match each number to the dots.', text: 'Match each <b>number</b> to the dots' },
      { id: 'n7', title: 'Add to 5', icon: '➕', type: 'choose', rounds: 7, gen: G.add(5, 3) },
      { id: 'n8', title: 'Take away', icon: '➖', type: 'choose', rounds: 7, gen: G.takeAway(5, 3) }
    ], [
      /* ---- Advanced: sums to ten, missing numbers, counting in steps ---- */
      { id: 'n9', title: 'Add to 10', icon: '🔟', type: 'choose', rounds: 8, gen: G.add(10, 4) },
      { id: 'n11', title: 'Take away to 10', icon: '➖', type: 'choose', rounds: 8, gen: G.takeAway(10, 4) },
      { id: 'n12', title: 'Bigger number', icon: '🐘', type: 'choose', rounds: 8, gen: G.bigger(1, 20) },
      { id: 'n13', title: 'How many more?', icon: '❓', type: 'choose', rounds: 8, gen: G.missing(8, 4) },
      { id: 'n14', title: 'Count in twos', icon: '2', type: 'choose', rounds: 8, gen: G.skip([2], 20) },
      { id: 'n15', title: 'Fives and tens', icon: '5', type: 'choose', rounds: 8, gen: G.skip([5, 10], 60) },
      { id: 'n16', title: 'Big order', icon: '🔢', type: 'order', pick: 3, sets: [
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([3, 6, 8, 11, 12]), praise: 'Well ordered!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([2, 4, 6, 8, 10]), praise: 'Two, four, six, eight, ten!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([5, 7, 9, 10, 12]), praise: 'Well ordered!' },
        { say: 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num([1, 5, 8, 9, 11]), praise: 'Well ordered!' }
      ] },
      { id: 'np2', title: 'Pop to 12', icon: '🎈', type: 'pop', rounds: 5, gen: G.numeral(6, 12, 4) }
    ])
  });

  /* ---------------- Shapes & Patterns ---------------- */

  const HUNT = [
    ['circle', [['ball', '⚽'], ['clock', '🕒'], ['cookie', '🍪'], ['coin', '🪙']]],
    ['triangle', [['pizza slice', '🍕'], ['tent', '⛺'], ['mountain', '⛰️']]],
    ['rectangle', [['door', '🚪'], ['phone', '📱'], ['book', '📕'], ['bus', '🚌']]],
    ['square', [['present', '🎁'], ['picture', '🖼️'], ['dice', '🎲']]]
  ];
  const huntList = [];
  HUNT.forEach((h, i) => h[1].forEach(thing => {
    // A square IS a rectangle, so never offer one as the wrong answer for the other.
    const boxy = (n) => n === 'square' || n === 'rectangle';
    const others = AF.U.shuffle(HUNT.filter((x, j) => j !== i && !(boxy(h[0]) && boxy(x[0])))).map(x => AF.U.one(x[1]));
    huntList.push({
      say: `Which one is shaped like a ${h[0]}?`, text: `Which one is shaped like a <b>${h[0]}</b>?`,
      show: G.shape(h[0], '#FFC93C'),
      options: [{ key: thing[0], emoji: thing[1] }].concat(others.slice(0, 2).map(o => ({ key: o[0], emoji: o[1] }))),
      answer: thing[0], praise: `The ${thing[0]} is a ${h[0]}`
    });
  }));

  AF.register({
    id: 'shapes', area: 'stem',
    title: 'Shapes', icon: '🔺', colour: '#4CC3FF',
    blurb: 'Shapes & patterns',
    skill: 'Shapes, colours and patterns',
    tip: 'Go on a shape hunt at home. How many circles can you find in the kitchen?',
    levels: AF.tiers([
      /* ---- Basic: name it, draw it, spot the pattern ---- */
      { id: 'sh1', title: 'Shapes', icon: '⭕', type: 'choose', rounds: 6, gen: G.shapes(['circle', 'square', 'triangle', 'star'], 3) },
      { id: 'sht1', title: 'Draw lines', icon: '✏️', type: 'trace', kind: 'line', set: ['across', 'down', 'slide', 'zigzag', 'wave'], ordered: true, rounds: 4 },
      { id: 'shm1', title: 'Shape holes', icon: '🧩', type: 'match', rounds: 3, n: 3, pairs: PR.shape(['circle', 'square', 'triangle', 'star', 'heart']),
        say: 'Put each shape in its place.', text: 'Put each <b>shape</b> in its place' },
      { id: 'sh2', title: 'Big & small', icon: '🐘', type: 'choose', rounds: 5, gen: G.size() },
      { id: 'sh3', title: 'What’s next?', icon: '🔴', type: 'choose', rounds: 6, gen: G.pattern(['AB']) },
      { id: 'shp1', title: 'Pop the shape', icon: '🎈', type: 'pop', rounds: 4, gen: G.shapes(['circle', 'square', 'triangle', 'star'], 3) }
    ], [
      /* ---- Intermediate: eight shapes, shapes in the real world, colour ---- */
      { id: 'sh4', title: 'More shapes', icon: '💠', type: 'choose', rounds: 7, gen: G.shapes(AF.SHAPES, 4) },
      { id: 'sht2', title: 'Draw shapes', icon: '✏️', type: 'trace', kind: 'line', set: ['circle', 'square', 'triangle', 'hill', 'loop'], ordered: true, rounds: 4 },
      { id: 'sh5', title: 'Shape hunt', icon: '🔎', type: 'choose', rounds: 7, gen: G.ask(huntList) },
      { id: 'shs1', title: 'Sort by colour', icon: '🎨', type: 'sort', rounds: 9,
        items: [it('🍎', 'apple', 'red'), it('🍓', 'strawberry', 'red'), it('🚒', 'fire engine', 'red'), it('🌹', 'rose', 'red'),
          it('🍌', 'banana', 'yellow'), it('⭐', 'star', 'yellow'), it('🐥', 'chick', 'yellow'), it('🍋', 'lemon', 'yellow'),
          it('🐸', 'frog', 'green'), it('🥦', 'broccoli', 'green'), it('🍃', 'leaf', 'green'), it('🐢', 'turtle', 'green')],
        bins: [{ key: 'red', emoji: '🔴', label: 'Red', c: '#EE5B5B' }, { key: 'yellow', emoji: '🟡', label: 'Yellow', c: '#F2B618' },
          { key: 'green', emoji: '🟢', label: 'Green', c: '#58B368' }],
        ask: i => `What colour is the ${i.w}?`, tell: (i, b) => `The ${i.w} is ${b.key}` },
      { id: 'shm2', title: 'More holes', icon: '🧩', type: 'match', rounds: 3, n: 4, pairs: PR.shape(AF.SHAPES),
        say: 'Put each shape in its place.', text: 'Put each <b>shape</b> in its place' },
      { id: 'sh6', title: 'Tricky patterns', icon: '🧠', type: 'choose', rounds: 7, gen: G.pattern(['ABB', 'AAB', 'ABC']) }
    ], [
      /* ---- Advanced: sides and corners, long patterns, ordering by size ---- */
      { id: 'sh7', title: 'How many sides?', icon: '📐', type: 'choose', rounds: 8, gen: G.sides() },
      { id: 'sh8', title: 'Long patterns', icon: '🧵', type: 'choose', rounds: 8, gen: G.pattern(['AABB', 'ABCB', 'ABBC', 'AABC']) },
      { id: 'sh9', title: 'Small to big', icon: '📏', type: 'order', pick: 3, sets: [
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>',
          steps: [step('🐜', 'ant'), step('🐭', 'mouse'), step('🐶', 'dog'), step('🐘', 'elephant')], praise: 'Ant, mouse, dog, elephant!' },
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>',
          steps: [step('🍒', 'cherry'), step('🍎', 'apple'), step('🍉', 'watermelon'), step('🌳', 'tree')], praise: 'From small to big!' },
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>',
          steps: [step('🚲', 'bike'), step('🚗', 'car'), step('🚌', 'bus'), step('✈️', 'plane')], praise: 'Bike, car, bus, plane!' },
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>',
          steps: [step('🥚', 'egg'), step('🐥', 'chick'), step('🐔', 'hen'), step('🦒', 'giraffe')], praise: 'From small to big!' }
      ] },
      { id: 'sh10', title: 'Corner shapes', icon: '⬡', type: 'choose', rounds: 8,
        gen: G.shapes(AF.SHAPES.concat(['pentagon', 'hexagon']), 4) },
      { id: 'shp2', title: 'Shape bubbles', icon: '🎈', type: 'pop', rounds: 5, gen: G.shapes(AF.SHAPES, 4) }
    ])
  });

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
    it('🪵', 'log', 'float'), it('🪨', 'rock', 'sink'), it('🔑', 'key', 'sink'), it('🪙', 'coin', 'sink'),
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
    sp('Which planet has a ring?', 'saturn', [['saturn', '🪐'], ['earth', '🌍'], ['moon', '🌙']], 'Saturn has rings'),
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
    season('Baby birds hatch in their nests. Which season is it?', '🐣', 'spring', 'Babies are born in spring'),
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
        ask: i => `Where does the ${i.w} live?`,
        tell: (i, b) => `The ${i.w} lives ${b.key === 'land' ? 'on land' : b.key === 'water' ? 'in water' : 'in the sky'}` },
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
        ask: i => `${i.w}. Day, or night?`, tell: (i, b) => `${i.w} goes with ${b.key}` }
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
          it('🧊', 'ice', 'cold'), it('⛄', 'snowman', 'cold'), it('🍦', 'ice cream', 'cold'), it('❄️', 'snow', 'cold'), it('🐧', 'penguin’s home', 'cold')],
        bins: [{ key: 'hot', emoji: '🥵', label: 'Hot', c: '#EE5B5B' }, { key: 'cold', emoji: '🥶', label: 'Cold', c: '#4D9DE0' }],
        ask: i => `${i.w}. Hot, or cold?`, tell: (i, b) => `${i.w} is ${b.key}` },
      { id: 'd11', title: 'Baby animals', icon: '🐣', type: 'match', rounds: 3, n: 3,
        pairs: PR.of([['chick', '🐔', '🐥', 'A hen has a chick'], ['tadpole', '🐸', '🥚', 'A frog comes from an egg'],
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
          steps: [step('🥚', 'egg'), step('🐛', 'caterpillar'), step('🟤', 'cocoon'), step('🦋', 'butterfly')], praise: 'Egg, caterpillar, cocoon, butterfly!' },
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
