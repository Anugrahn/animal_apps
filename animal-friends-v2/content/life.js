/* ============================================================
   content/life.js — Social-Emotional Learning & Life Skills
   ------------------------------------------------------------
   Curriculum map (lingokids_content_architecture.md, section 3):
     Emotional intelligence -> Feelings    (name it, read it, manage it)
     Hygiene & routines     -> Healthy Me  (washing, brushing, food, the day)
     Global citizenship     -> Our Planet  (recycling, caring, biodiversity)

   Nothing here is "right or wrong about you". The questions are
   about a character in a little story, so a child can explore a
   feeling at a safe distance.
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, W = AF.WORDS, PR = AF.Pairs;
  const step = (e, label, say) => ({ e: e, label: label, say: say });
  const it = (e, word, bin) => ({ e: e, w: word, bin: bin });
  /* 'goes' or 'go', 'That is' or 'They are': plural words (socks, grapes) take the plural form */
  const pl = (word, one, many) => /[^su]s$/.test(word) ? many : one;   // (not bus, glass)

  /* ---------------- Feelings ---------------- */

  const FACES = { happy: '😀', sad: '😢', angry: '😠', scared: '😨', surprised: '😲', sleepy: '😴' };
  const feel = (say, show, answer, others) => ({
    say: say + ' How do they feel?', text: AF.U.esc(say) + ' How do they <b>feel</b>?',
    show: `<span class="big-e">${show}</span>`,
    options: [answer].concat(others).map(f => ({ key: f, emoji: FACES[f], label: f })),
    answer: answer, praise: `They feel ${answer}`
  });
  const SCENES = [
    feel('Mia got a new puppy.', '🐶🎁', 'happy', ['sad', 'scared']),
    feel('Sam dropped his ice cream.', '🍦💧', 'sad', ['happy', 'sleepy']),
    feel('Someone took Ben’s toy without asking.', '🧸✋', 'angry', ['happy', 'sleepy']),
    feel('There is a loud thunder storm.', '⛈️', 'scared', ['happy', 'angry']),
    feel('It is very late and Lily is yawning.', '🌙🥱', 'sleepy', ['angry', 'surprised']),
    feel('Everyone jumped out and shouted, happy birthday!', '🎉🎂', 'surprised', ['sad', 'sleepy']),
    feel('Tom’s best friend moved away.', '👋🏠', 'sad', ['happy', 'surprised']),
    feel('Ana built a very tall tower all by herself.', '🧱✨', 'happy', ['scared', 'sad'])
  ];

  const kind = (say, show, good, bad) => ({
    say: say + ' What can you do?', text: AF.U.esc(say) + ' What can you <b>do</b>?',
    show: `<span class="big-e">${show}</span>`,
    options: [{ key: 'good', emoji: good[0], label: good[1] }, { key: 'bad', emoji: bad[0], label: bad[1] }],
    answer: 'good', praise: good[2]
  });
  const KIND = [
    kind('Your friend falls down.', '🤕', ['🤝', 'Help them up', 'Helping is kind'], ['😆', 'Laugh']),
    kind('You want the toy your friend has.', '🧸', ['🙋', 'Ask for a turn', 'Asking is kind'], ['✊', 'Grab it']),
    kind('You feel very angry.', '😠', ['🌬️', 'Take a slow breath', 'A slow breath helps'], ['💥', 'Throw things']),
    kind('A new child has no one to play with.', '🧒', ['👋', 'Say, come and play', 'You made a friend'], ['🚶', 'Walk away']),
    kind('You broke a cup by accident.', '🥛', ['🙏', 'Say sorry and tell', 'Telling the truth is brave'], ['🙈', 'Hide it']),
    kind('Your friend is crying.', '😢', ['🤗', 'Ask, are you okay', 'That is caring'], ['🙄', 'Ignore them']),
    kind('Grandma gives you a present.', '🎁', ['💛', 'Say thank you', 'Thank you is kind'], ['😶', 'Say nothing'])
  ];

  const FACE_GEN = (ctx) => {
    const r = G.find(W.feelings, 3)(ctx);
    r.say = r.say.replace('Find the', 'Who feels').replace('.', '?');
    r.text = r.text.replace('Find the', 'Who feels') + '?';
    r.options.forEach(o => { o.label = o.key; });
    return r;
  };

  const FACES2 = { proud: '😌', shy: '😳', worried: '😟', excited: '🤩', bored: '😑', calm: '😊' };
  const big = (say, show, answer, others) => ({
    say: say + ' How do they feel?', text: AF.U.esc(say) + ' How do they <b>feel</b>?',
    show: `<span class="big-e">${show}</span>`,
    options: [answer].concat(others).map(f => ({ key: f, emoji: FACES2[f], label: f })),
    answer: answer, praise: `They feel ${answer}`
  });
  const BIG = [
    big('Zara tied her shoes all by herself.', '👟✨', 'proud', ['bored', 'worried']),
    big('Leo hides behind his mum when he meets new people.', '🙈', 'shy', ['excited', 'proud']),
    big('Tomorrow Kai is going to the doctor.', '🧑‍⚕️', 'worried', ['bored', 'excited']),
    big('It is Nina’s birthday party today!', '🎈🎂', 'excited', ['shy', 'bored']),
    big('It is raining and there is nothing to do.', '🌧️🏠', 'bored', ['proud', 'excited']),
    big('Omar took three slow breaths and his body felt soft.', '🌬️', 'calm', ['worried', 'excited']),
    big('Ella finished a very hard puzzle.', '🧩', 'proud', ['shy', 'worried']),
    big('Ben cannot find his mum in the shop.', '🛒', 'worried', ['calm', 'proud'])
  ];

  const helps = (say, show, good, bad) => ({
    say: say + ' What helps?', text: AF.U.esc(say) + ' What <b>helps</b>?',
    show: `<span class="big-e">${show}</span>`,
    options: [{ key: 'good', emoji: good[0], label: good[1] }, { key: 'bad', emoji: bad[0], label: bad[1] }],
    answer: 'good', praise: good[2]
  });
  const HELPS = [
    helps('You feel sad.', '😢', ['🤗', 'Ask for a hug', 'A hug can help'], ['🙈', 'Hide away']),
    helps('You feel angry.', '😠', ['🌬️', 'Breathe slowly', 'Slow breaths cool us down'], ['👊', 'Hit something']),
    helps('You feel scared at night.', '😨', ['🧸', 'Cuddle teddy and tell a grown-up', 'Telling someone helps'], ['🤐', 'Tell no one']),
    helps('You feel worried.', '😟', ['🗣️', 'Talk about it', 'Talking makes worries smaller'], ['😶', 'Keep it inside']),
    helps('You feel too excited to sit still.', '🤩', ['🤸', 'Jump ten times', 'Moving helps'], ['📢', 'Scream indoors']),
    helps('You feel tired and grumpy.', '😴', ['🛏️', 'Have a rest', 'A rest helps'], ['🍬', 'Eat lots of sweets']),
    helps('You feel left out.', '🥺', ['🙋', 'Say, can I play too', 'Asking is brave'], ['😤', 'Stamp your feet'])
  ];
  const FRIENDS = [
    kind('Two friends both want the red car.', '🚗', ['⏳', 'Take turns', 'Taking turns is fair'], ['😠', 'Fight for it']),
    kind('Your friend built a tower. You bump it by accident.', '🧱', ['🙏', 'Say sorry and help rebuild', 'Sorry, and helping, fixes it'], ['🏃', 'Run away']),
    kind('Your friend says, stop, I do not like that.', '✋', ['🛑', 'Stop', 'Good friends listen'], ['😜', 'Keep doing it']),
    kind('A friend draws a picture and shows you.', '🖼️', ['👏', 'Say, I like it', 'Kind words feel good'], ['🙄', 'Say it is bad']),
    kind('You win the game. Your friend loses.', '🏆', ['🤝', 'Say, good game', 'You are a good sport'], ['😛', 'Laugh at them']),
    kind('Your friend is too shy to join in.', '😳', ['💛', 'Say, come with me', 'You helped a friend'], ['🚶', 'Leave them']),
    kind('There is one biscuit left and two of you.', '🍪', ['✂️', 'Break it in half', 'Sharing is fair'], ['😋', 'Eat it quickly'])
  ];

  AF.register({
    id: 'feelings', area: 'life',
    title: 'Feelings', icon: '😊', colour: '#FF9DB5',
    blurb: 'Name it, calm it',
    skill: 'Understanding feelings',
    tip: 'At bedtime ask, “What made you happy today? Was anything tricky?” Name your own feeling too.',
    levels: AF.tiers([
      /* ---- Basic: name the feeling ---- */
      { id: 'f1', title: 'Faces', icon: '😀', type: 'choose', rounds: 6, gen: FACE_GEN },
      // face to the same face: reading the expression is the skill, no reading of words needed
      { id: 'fm1', title: 'Same feeling', icon: '🙂', type: 'match', rounds: 2, n: 3,
        pairs: W.feelings.map(x => ({ w: x.w, a: { e: x.e }, b: { e: x.e } })),
        say: 'Find the face that feels the same.', text: 'Find the <b>same feeling</b>' },
      { id: 'f3', title: 'Calm breathing', icon: '🌬️', type: 'breathe', cycles: 3 },
      { id: 'fp1', title: 'Pop the feeling', icon: '🎈', type: 'pop', rounds: 4, gen: FACE_GEN }
    ], [
      /* ---- Intermediate: read a situation, choose a kind thing to do ---- */
      { id: 'f2', title: 'How do they feel?', icon: '💭', type: 'choose', rounds: 7, gen: G.ask(SCENES) },
      { id: 'f4', title: 'Kind choices', icon: '🤝', type: 'choose', rounds: 7, gen: G.ask(KIND) },
      { id: 'fs1', title: 'Kind or unkind?', icon: '💛', type: 'sort', rounds: 8,
        items: [it('🤝', 'sharing', 'kind'), it('🤗', 'a hug', 'kind'), it('🙏', 'saying thank you', 'kind'), it('👋', 'saying hello', 'kind'),
          it('🎁', 'giving', 'kind'), it('✊', 'grabbing', 'unkind'), it('😝', 'teasing', 'unkind'), it('📢', 'shouting at a friend', 'unkind'),
          it('🚫', 'leaving someone out', 'unkind'), it('💥', 'breaking a toy', 'unkind')],
        bins: [{ key: 'kind', emoji: '💛', label: 'Kind', c: '#6CC27A' }, { key: 'unkind', emoji: '💔', label: 'Not kind', c: '#9AA3B0' }],
        ask: i => `${i.w}. Kind, or not kind?`, tell: (i, b) => `${i.w} is ${b.key === 'kind' ? 'kind' : 'not kind'}` },
      { id: 'f5', title: 'Star breathing', icon: '⭐', type: 'breathe', cycles: 4 }
    ], [
      /* ---- Advanced: bigger feelings and what helps ---- */
      { id: 'f6', title: 'Bigger feelings', icon: '🤩', type: 'choose', rounds: 8, gen: G.ask(BIG) },
      { id: 'f7', title: 'What helps?', icon: '🧰', type: 'choose', rounds: 7, gen: G.ask(HELPS) },
      { id: 'f8', title: 'Good friends', icon: '👫', type: 'choose', rounds: 7, gen: G.ask(FRIENDS) },
      { id: 'f9', title: 'Long, slow breaths', icon: '🌙', type: 'breathe', cycles: 5 }
    ])
  });

  /* ---------------- Healthy Me ---------------- */

  const FOOD = [it('🍎', 'apple', 'daily'), it('🥕', 'carrot', 'daily'), it('🍌', 'banana', 'daily'), it('🥛', 'milk', 'daily'),
    it('🥚', 'egg', 'daily'), it('🥦', 'broccoli', 'daily'), it('💧', 'water', 'daily'), it('🍚', 'rice', 'daily'),
    it('🍰', 'cake', 'treat'), it('🍬', 'sweets', 'treat'), it('🍩', 'doughnut', 'treat'), it('🍦', 'ice cream', 'treat'),
    it('🍟', 'chips', 'treat'), it('🥤', 'fizzy drink', 'treat')];
  const FOOD_BINS = [{ key: 'daily', emoji: '💪', label: 'Every day', c: '#7BD389' }, { key: 'treat', emoji: '🎉', label: 'Sometimes', c: '#FFB3D1' }];

  const SAFE = [
    kind('You want to cross the road.', '🚦', ['🤝', 'Hold a grown-up’s hand', 'Hold hands to cross'], ['🏃', 'Run across']),
    kind('You get in the car.', '🚗', ['🔒', 'Put your seat belt on', 'Seat belts keep us safe'], ['🙅', 'No seat belt']),
    kind('The cooker is hot.', '🍳', ['🖐️', 'Keep away', 'Hot things can burn'], ['👆', 'Touch it']),
    kind('You ride your bike.', '🚲', ['⛑️', 'Wear a helmet', 'A helmet protects your head'], ['🧢', 'No helmet']),
    kind('You find some tablets on the table.', '💊', ['🗣️', 'Tell a grown-up', 'Only grown-ups give medicine'], ['👄', 'Taste them']),
    kind('You are lost in the shop.', '🏬', ['🧑‍💼', 'Ask someone who works there', 'Shop helpers can find your grown-up'], ['🚪', 'Go outside alone']),
    kind('You are at the pool.', '🏊', ['👀', 'Wait for a grown-up', 'Always swim with a grown-up'], ['💦', 'Jump in alone'])
  ];
  const BODY = [
    kind('It is bed time.', '🌙', ['😴', 'Go to sleep', 'Sleep helps you grow'], ['📺', 'Watch more TV']),
    kind('You have been sitting all morning.', '💺', ['🤸', 'Run and play', 'Moving makes you strong'], ['🛋️', 'Sit some more']),
    kind('You are thirsty.', '🥵', ['💧', 'Drink water', 'Water is the best drink'], ['🥤', 'A big fizzy drink']),
    kind('You come in from the garden.', '🌱', ['🧼', 'Wash your hands', 'Washing sends germs away'], ['🍪', 'Eat straight away']),
    kind('The sun is very strong.', '☀️', ['🧴', 'Sun cream and a hat', 'That protects your skin'], ['🙅', 'Nothing']),
    kind('You have a cough.', '🤒', ['💪', 'Cough into your elbow', 'That keeps germs from friends'], ['👐', 'Cough on your hands']),
    kind('It is breakfast time.', '🌅', ['🥣', 'Eat a good breakfast', 'Breakfast gives you energy'], ['🙅', 'Skip it'])
  ];

  AF.register({
    id: 'habits', area: 'life',
    title: 'Healthy Me', icon: '🧼', colour: '#4CC3FF',
    blurb: 'Wash, brush, eat',
    skill: 'Healthy habits and routines',
    tip: 'Sing the hand-washing song from Songs at the sink — one whole song is about 20 seconds.',
    levels: AF.tiers([
      /* ---- Basic: the daily routines ---- */
      { id: 'h1', title: 'Wash hands', icon: '🧼', type: 'order', sets: [
        { say: 'How do we wash our hands? Tap what comes first.', text: 'How do we <b>wash our hands</b>?',
          steps: [step('💧', 'wet', 'Wet your hands'), step('🧼', 'soap', 'Add soap'), step('👐', 'scrub', 'Scrub, scrub, scrub'),
            step('🚿', 'rinse', 'Rinse'), step('🧻', 'dry', 'Dry')],
          praise: 'Clean hands! Well done.' }
      ] },
      { id: 'h2', title: 'Brush teeth', icon: '🦷', type: 'order', sets: [
        { say: 'How do we brush our teeth? Tap what comes first.', text: 'How do we <b>brush our teeth</b>?',
          steps: [step('🪥', 'toothpaste', 'Put on toothpaste'), step('😬', 'brush', 'Brush every tooth'),
            step('💦', 'spit', 'Spit it out'), step('😁', 'smile', 'Big clean smile')],
          praise: 'Shiny teeth! Brush morning and night.' }
      ] },
      { id: 'h3', title: 'Good food', icon: '🥕', type: 'sort', rounds: 8, items: FOOD, bins: FOOD_BINS,
        ask: i => `${i.w}. Every day, or sometimes?`,
        tell: (i, b) => b.key === 'daily' ? `${i.w}! ${pl(i.w, 'That helps', 'They help')} you grow` : `${i.w}! ${pl(i.w, 'That is', 'They are')} a sometimes food` }
    ], [
      /* ---- Intermediate: the whole day, tidying, staying safe ---- */
      { id: 'h4', title: 'My day', icon: '🌞', type: 'order', sets: [
        { say: 'Good morning! What do we do first?', text: 'Good <b>morning</b>! What comes first?',
          steps: [step('🌅', 'wake up'), step('👕', 'get dressed'), step('👟', 'shoes on'), step('🎒', 'off to school')],
          praise: 'Ready for the day!' },
        { say: 'Time for bed! What do we do first?', text: 'Time for <b>bed</b>! What comes first?',
          steps: [step('🛁', 'bath'), step('🪥', 'brush teeth'), step('📖', 'story'), step('😴', 'sleep')],
          praise: 'Good night! Sleep well.' }
      ] },
      { id: 'h5', title: 'Tidy up', icon: '🧺', type: 'sort', rounds: 9,
        items: [it('🧸', 'teddy', 'toys'), it('⚽', 'ball', 'toys'), it('🧩', 'puzzle', 'toys'), it('🚗', 'toy car', 'toys'),
          it('👕', 'shirt', 'wash'), it('🧦', 'socks', 'wash'), it('👖', 'trousers', 'wash'),
          it('🍌', 'banana peel', 'bin'), it('🥤', 'empty cup', 'bin'), it('🍬', 'sweet wrapper', 'bin')],
        bins: [{ key: 'toys', emoji: '🧰', label: 'Toy box', c: '#F2A03D' }, { key: 'wash', emoji: '🧺', label: 'Washing', c: '#4D9DE0' },
          { key: 'bin', emoji: '🗑️', label: 'Bin', c: '#8E96A3' }],
        ask: i => `Where ${pl(i.w, 'does', 'do')} the ${i.w} go?`, tell: (i, b) => `The ${i.w} ${pl(i.w, 'goes', 'go')} in the ${b.label.toLowerCase()}` },
      { id: 'h6', title: 'Stay safe', icon: '⛑️', type: 'choose', rounds: 7, gen: G.ask(SAFE) }
    ], [
      /* ---- Advanced: why habits matter, germs, food groups ---- */
      { id: 'h7', title: 'Catch that sneeze', icon: '🤧', type: 'order', sets: [
        { say: 'You need to sneeze! What do we do? Put it in order.', text: 'You need to <b>sneeze</b>! What comes first?',
          steps: [step('🤧', 'sneeze in a tissue', 'Catch it in a tissue'), step('🗑️', 'bin it', 'Put the tissue in the bin'),
            step('🧼', 'wash hands', 'Wash your hands'), step('😀', 'all done', 'All done')],
          praise: 'Catch it, bin it, wash your hands!' },
        { say: 'Let us make a sandwich. Put it in order.', text: 'Let us make a <b>sandwich</b>',
          steps: [step('🧼', 'wash hands', 'First wash your hands'), step('🍞', 'bread', 'Take the bread'),
            step('🧀', 'cheese', 'Add the cheese'), step('🥪', 'close it', 'Close it up'), step('😋', 'eat', 'Enjoy')],
          praise: 'A sandwich, made with clean hands!' }
      ] },
      { id: 'h8', title: 'Food groups', icon: '🥗', type: 'sort', rounds: 10,
        items: [it('🍎', 'apple', 'fruit'), it('🍌', 'banana', 'fruit'), it('🍇', 'grapes', 'fruit'), it('🍓', 'strawberry', 'fruit'),
          it('🥕', 'carrot', 'veg'), it('🥦', 'broccoli', 'veg'), it('🌽', 'corn', 'veg'), it('🥒', 'cucumber', 'veg'),
          it('💧', 'water', 'drink'), it('🥛', 'milk', 'drink'), it('🥤', 'juice', 'drink')],
        bins: [{ key: 'fruit', emoji: '🍎', label: 'Fruit', c: '#EE5B5B' }, { key: 'veg', emoji: '🥕', label: 'Vegetables', c: '#58B368' },
          { key: 'drink', emoji: '🥤', label: 'Drinks', c: '#4D9DE0' }],
        ask: i => `${i.w}. Fruit, vegetable or drink?`, tell: (i, b) => `${i.w}! ${pl(i.w, 'That is', 'They are')} a ${b.key === 'veg' ? 'vegetable' : b.key}` },
      { id: 'h9', title: 'Healthy body', icon: '💪', type: 'choose', rounds: 7, gen: G.ask(BODY) }
    ])
  });

  /* ---------------- Our Planet ---------------- */

  const BIN = [it('📰', 'newspaper', 'paper'), it('📦', 'box', 'paper'), it('✉️', 'letter', 'paper'), it('📄', 'paper', 'paper'),
    it('🧴', 'bottle', 'plastic'), it('🥤', 'plastic cup', 'plastic'), it('🛍️', 'plastic bag', 'plastic'),
    it('🍌', 'banana peel', 'food'), it('🍎', 'apple core', 'food'), it('🥚', 'egg shell', 'food'), it('🍊', 'orange peel', 'food')];
  const BIN_BINS = [{ key: 'paper', emoji: '📄', label: 'Paper', c: '#7FB6FF' }, { key: 'plastic', emoji: '♻️', label: 'Plastic', c: '#FFD76A' },
    { key: 'food', emoji: '🌱', label: 'Food scraps', c: '#8FD98F' }];

  const earth = (say, show, good) => ({
    say: say + ' Does it help the Earth?', text: AF.U.esc(say) + ' Does it <b>help the Earth</b>?',
    show: `<span class="big-e">${show}</span>`,
    options: [{ key: true, emoji: '👍', label: 'Helps', c: '#7BD389' }, { key: false, emoji: '👎', label: 'Hurts', c: '#FFB3B3' }],
    answer: good, praise: good ? 'Yes, that helps the Earth' : 'That hurts the Earth'
  });
  const EARTH = [
    earth('Planting a tree.', '🌳', true),
    earth('Dropping rubbish on the ground.', '🚯', false),
    earth('Turning off the tap while you brush.', '🚰', true),
    earth('Leaving the light on in an empty room.', '💡', false),
    earth('Riding a bike to the park.', '🚲', true),
    earth('Drawing on both sides of the paper.', '📄', true),
    earth('Leaving the water running.', '💦', false),
    earth('Putting bottles in the recycling bin.', '♻️', true)
  ];

  const WILD = [it('🐧', 'penguin', 'ice'), it('🦌', 'reindeer', 'ice'), it('🐪', 'camel', 'desert'), it('🦂', 'scorpion', 'desert'),
    it('🐵', 'monkey', 'forest'), it('🦉', 'owl', 'forest'), it('🦊', 'fox', 'forest'), it('🐳', 'whale', 'sea'),
    it('🦈', 'shark', 'sea'), it('🐢', 'sea turtle', 'sea')];
  const WILD_BINS = [{ key: 'forest', emoji: '🌲', label: 'Forest', c: '#7BD389' }, { key: 'sea', emoji: '🌊', label: 'Sea', c: '#4CC3FF' },
    { key: 'ice', emoji: '❄️', label: 'Ice and snow', c: '#DCEBFF' }, { key: 'desert', emoji: '🏜️', label: 'Desert', c: '#FFD9A0' }];

  const SAVE = [
    earth('Turning off the light when you leave.', '💡', true),
    earth('A dripping tap, left all day.', '🚰', false),
    earth('Taking a short shower.', '🚿', true),
    earth('Leaving the TV on when no one is watching.', '📺', false),
    earth('Walking to school.', '🚶', true),
    earth('Using a bag again and again.', '🛍️', true),
    earth('Throwing away good food.', '🍞', false),
    earth('Watering plants with rain water.', '🌧️', true)
  ];
  const need = (say, answer, opts, praise) => ({
    say: say, options: opts.map(o => ({ key: o[0], emoji: o[1], label: o[0] })), answer: answer, praise: praise
  });
  const NEEDS = [
    need('What do bees need?', 'flowers', [['flowers', '🌸'], ['cars', '🚗'], ['shoes', '👟']], 'Bees need flowers'),
    need('What do fish need?', 'clean water', [['clean water', '💧'], ['sand castles', '🏰'], ['hats', '🎩']], 'Fish need clean water'),
    need('What do birds build nests in?', 'trees', [['trees', '🌳'], ['buses', '🚌'], ['shoes', '👟']], 'Birds nest in trees'),
    need('What do polar bears need?', 'snow and ice', [['snow and ice', '❄️'], ['a desert', '🏜️'], ['a volcano', '🌋']], 'Polar bears need snow and ice'),
    need('What do plants need?', 'sun and rain', [['sun and rain', '🌦️'], ['sweets', '🍬'], ['toys', '🧸']], 'Plants need sun and rain'),
    need('What do monkeys need?', 'a forest', [['a forest', '🌴'], ['a car park', '🅿️'], ['an ice rink', '⛸️']], 'Monkeys need forests'),
    need('What do we all need?', 'clean air', [['clean air', '🌬️'], ['smoke', '🏭'], ['rubbish', '🗑️']], 'We all need clean air')
  ];

  AF.register({
    id: 'planet', area: 'life',
    title: 'Our Planet', icon: '🌍', colour: '#7BD389',
    blurb: 'Care for the Earth',
    skill: 'Caring for the world',
    tip: 'Let your child be the “recycling boss” this week and decide which bin things go in.',
    levels: AF.tiers([
      /* ---- Basic: sort the rubbish, help or hurt ---- */
      { id: 'p1', title: 'Sort it', icon: '♻️', type: 'sort', rounds: 8, items: BIN, bins: BIN_BINS,
        ask: i => `Where ${pl(i.w, 'does', 'do')} the ${i.w} go?`, tell: (i, b) => `The ${i.w} ${pl(i.w, 'goes', 'go')} with ${b.label.toLowerCase()}` },
      { id: 'p2', title: 'Help the Earth', icon: '💚', type: 'choose', rounds: 6, gen: G.ask(EARTH, false) },
      { id: 'pm1', title: 'Animal shadows', icon: '🐼', type: 'match', rounds: 3, n: 3,
        pairs: PR.shadow(WILD.map(x => ({ w: x.w, e: x.e })).filter(x => x.e.length <= 2)),
        say: 'Match each wild animal to its shadow.', text: 'Match each animal to its <b>shadow</b>' }
    ], [
      /* ---- Intermediate: where animals live, growing things ---- */
      { id: 'p3', title: 'Wild homes', icon: '🐧', type: 'sort', rounds: 8, items: WILD, bins: WILD_BINS,
        ask: i => `Where does the ${i.w} live?`, tell: (i, b) => `The ${i.w} lives in the ${b.label.toLowerCase()}` },
      { id: 'p4', title: 'Grow a garden', icon: '🌱', type: 'order', sets: [
        { say: 'How do we grow a garden? Put it in order.', text: 'How do we grow a <b>garden</b>?',
          steps: [step('⛏️', 'dig', 'Dig a hole'), step('🌰', 'seed', 'Put in a seed'), step('💧', 'water', 'Water it'),
            step('☀️', 'sun', 'Wait for the sun'), step('🌻', 'flower', 'A flower grows')],
          praise: 'You grew a garden!' }
      ] },
      { id: 'p5', title: 'Save it', icon: '💡', type: 'choose', rounds: 7, gen: G.ask(SAVE) }
    ], [
      /* ---- Advanced: four bins, reuse, who needs what ---- */
      { id: 'p6', title: 'Four bins', icon: '🗑️', type: 'sort', rounds: 10,
        items: BIN.concat([it('🍯', 'glass jar', 'glass'), it('🥛', 'glass milk bottle', 'glass')]),
        bins: BIN_BINS.concat([{ key: 'glass', emoji: '🍯', label: 'Glass', c: '#55B985' }]),
        ask: i => `Where ${pl(i.w, 'does', 'do')} the ${i.w} go?`, tell: (i, b) => `The ${i.w} ${pl(i.w, 'goes', 'go')} with ${b.label.toLowerCase()}` },
      { id: 'p7', title: 'Use it again', icon: '🔁', type: 'match', rounds: 2, n: 3,
        pairs: PR.of([['box', '📦', '🏰', 'A box can be a castle'], ['tin', '🥫', '🖍️', 'A tin can hold crayons'],
          ['old shirt', '👕', '🧽', 'An old shirt can be a cleaning cloth'], ['bottle', '🧴', '🪴', 'A bottle can be a plant pot'],
          ['paper', '📰', '🎁', 'Old paper can wrap a present'], ['sock', '🧦', '🧸', 'An odd sock can be a puppet']]),
        say: 'What can each old thing become?', text: 'What can each old thing <b>become</b>?' },
      { id: 'p8', title: 'Who needs it?', icon: '🌍', type: 'choose', rounds: 7, gen: G.ask(NEEDS) }
    ])
  });
})(window.AF = window.AF || {});
