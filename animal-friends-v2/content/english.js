/* ============================================================
   content/english.js — English (Wink curriculum, 4 stages)
   ------------------------------------------------------------
   Wink English teaches English the way a mother tongue is learned:
   through short stories. Every lesson walks the same road:

     Story  -> Words  -> Say it (or Play) -> Quiz
     a tiny    the key   the child says    questions about the
     story     words as  the key words     story and the words
               cards     (Stage 4 builds
                         sentences too)

   Curriculum map:
     Stage 1  basic expressions     hello, colours, animals, one to five
     Stage 2  everyday expressions  food, my body, my morning, feelings
     Stage 3  my world              the park, weather, helpers, transport
     Stage 4  reading and grammar   in on under, one and many, opposites,
                                    question words, reading sentences
   Each stage ends with a Review: questions from every lesson of the
   stage, then a memory game with the stage's words.

   The friend tells every story in the first person ("I like apples!"),
   so the key expressions are heard in a voice the child knows. Only
   one line uses the friend's name ({name}): each such line is
   recorded once per name. Quiz questions never use {name}: only the
   story engine fills it in.
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, PR = AF.Pairs, L = AF.lesson;

  /* ---------- little helpers ---------- */

  /** an answer card: a picture, with a short word under it when given */
  const o = (key, emoji, label) => ({ key: key, emoji: emoji, label: label });
  /** a written-word card */
  const g = (key, glyph) => ({ key: key, glyph: glyph || key });
  /** an answer card drawn with html (a row of ducks, a cat on a box) */
  const h = (key, html) => ({ key: key, html: html });
  /** a question: what is said, the answers, the right one, the praise */
  const q = (say, options, answer, praise, more) =>
    Object.assign({ say: say, options: options, answer: answer, praise: praise }, more || {});

  const big = (e) => `<span class="big-e">${e}</span>`;
  /** n of something in a row: in the question strip, or on an answer card */
  const row = (e, n) => G.row(e, n);
  /** a row in the question strip: fewer things, bigger */
  const showRow = (e, n) => `<span class="en-row" data-n="${Math.min(n, 4)}">${G.row(e, n)}</span>`;
  /** a row on an intro card (smaller next to a big numeral) */
  const introRow = (e, n, withBig) => `<span class="en-row on-card${withBig ? ' with-big' : ''}" data-n="${Math.min(n, 4)}">${G.row(e, n)}</span>`;
  const rowCard = (e, n) => `<span class="group en-cardrow" data-n="${Math.min(n, 3)}">${`<i>${e}</i>`.repeat(n)}</span>`;

  /* Where something is: a cat on, in or under a box or a chair.
     Two painted pictures, one placed over the other. `size` is the
     size of the whole picture (1.3em in the question strip, 40cqmin
     on an answer card...). */
  const place = (what, where, thing, size) =>
    `<span class="group en-place ${where}" style="--size:${size}"><i class="en-thing">${thing}</i><i class="en-what">${what}</i></span>`;

  /* A long or a short pencil: the painted pencil (tip down on the left)
     turned flat and stretched or squashed. */
  const flat = (long) => `<i class="en-pencil ${long ? 'long' : 'short'}">✏️</i>`;
  const pencil = (long, size) => `<span class="group en-size" style="--size:${size}">${flat(long)}</span>`;
  /** two pictures side by side, the second one smaller when `k` is given (intro cards) */
  const pair = (a, b, k) => `<span class="group en-pair"${k ? ` style="--k:${k}"` : ''}><i>${a}</i><i>${b}</i></span>`;
  /** something painted, at a size: 1 fills an answer card */
  const sized = (e, k) => `<span class="group"><i class="sized" style="--k:${k}">${e}</i></span>`;

  /* A written sentence to read, in big friendly letters. */
  const line = (t) => `<span class="read-line">${AF.U.esc(t)}</span>`;

  /** a sentence to build with the order engine, one word per card */
  const build = (words, say) => ({
    say: `Put the words in order. ${say}`,
    text: `Put the words in order: <b>${AF.U.esc(words.join(' '))}</b>`,
    steps: words.map(w => ({ glyph: w, say: w === 'I' ? 'I' : w.toLowerCase().replace(/[^a-z']/g, '') })),
    praise: say
  });

  /** the four steps of a lesson */
  const lesson = (id, title, topic, parts) => L(id, title, [
    { step: 'story', type: 'story', pages: parts.story },
    { step: 'words', type: 'intro', cards: parts.words },
    parts.say ? { step: 'say', type: 'speak', rounds: 3, words: parts.say } : Object.assign({ step: 'play', type: 'order' }, parts.play),
    { step: 'quiz', type: 'choose', rounds: 4, gen: G.ask(parts.quiz.concat(parts.check)) }
  ], { topic: topic });

  /** a stage review: questions from every lesson, then a memory game */
  const review = (id, lessons, pairs) => L(id, 'Review', [
    { step: 'review', type: 'choose', rounds: 6, gen: G.ask([].concat.apply([], lessons.map(x => x.check))) },
    { step: 'play', type: 'memory', n: 4, pairs: pairs, peek: true }
  ], { review: true });

  /* ============================================================
     STAGE 1 — basic expressions
     ============================================================ */

  const HELLO = {
    story: [
      { art: '{me} 🏷️', text: 'Hello! My name is {name}.', bg: '#FFF1CF' },
      { art: '{me} 🐱', text: 'Look, a cat! Hello, Cat!', bg: '#E3F7D2' },
      { art: '🐱 🍎 {me}', text: 'Cat says, this apple is for you.', bg: '#FFE6F0' },
      { art: '{me} 🍎 💛', text: 'Thank you, Cat!', bg: '#FFF6B8' },
      { art: '🐱 🏡 {me}', text: 'Goodbye, Cat! See you soon!', bg: '#FFE0C2' }
    ],
    words: [
      { pic: '👋', word: 'hello', say: 'Hello! We say hello when we meet.' },
      { pic: '🏷️', word: 'my name is', say: 'My name is. Say it, and then say your name!' },
      { pic: '🙏', word: 'thank you', say: 'Thank you! We say it when someone is kind.' },
      { pic: '🚶', word: 'goodbye', say: 'Goodbye! We say goodbye when we go.' }
    ],
    say: [{ w: 'hello', e: '👋' }, { w: 'thank you', e: '🙏' }, { w: 'goodbye', e: '🚶' }],
    quiz: [
      q('Who did I meet in the story?', [o('cat', '🐱'), o('dog', '🐶')], 'cat', 'A cat!'),
      q('What did Cat give me?', [o('apple', '🍎'), o('ball', '⚽')], 'apple', 'An apple!')
    ],
    check: [
      q('You meet a friend. What do you say?', [o('hello', '👋', 'hello'), o('goodbye', '🚶', 'goodbye')], 'hello', 'Hello!',
        { text: 'You meet a friend. What do you <b>say</b>?' }),
      q('It is time to go home. What do you say?', [o('goodbye', '🚶', 'goodbye'), o('thanks', '🙏', 'thank you')], 'goodbye', 'Goodbye!',
        { text: 'Time to go home. What do you <b>say</b>?' }),
      q('A friend gives you a present. What do you say?', [o('thanks', '🙏', 'thank you'), o('hello', '👋', 'hello')], 'thanks', 'Thank you!',
        { text: 'A friend gives you a present. What do you <b>say</b>?', show: big('🎁') })
    ]
  };

  const COLOURS = {
    story: [
      { art: '{me} 🖍️', text: 'I love colours. Let\'s look!', bg: '#FFF1CF' },
      { art: '🍎 🔴', text: 'An apple. It is red.', bg: '#FFE0DC' },
      { art: '☀️ 🟡', text: 'The sun. It is yellow.', bg: '#FFF6B8' },
      { art: '🐸 🟢', text: 'A frog. It is green.', bg: '#E3F7D2' },
      { art: '{me} 🐳 🔵', text: 'A whale! It is blue.', bg: '#DCEBFF' }
    ],
    words: [
      { pic: '🔴', word: 'red', say: 'Red. The apple is red.' },
      { pic: '🟡', word: 'yellow', say: 'Yellow. The sun is yellow.' },
      { pic: '🟢', word: 'green', say: 'Green. The frog is green.' },
      { pic: '🔵', word: 'blue', say: 'Blue. The whale is blue.' }
    ],
    say: [{ w: 'red', e: '🔴' }, { w: 'yellow', e: '🟡' }, { w: 'green', e: '🟢' }, { w: 'blue', e: '🔵' }],
    quiz: [
      q('What colour was the apple?', [o('red', '🔴', 'red'), o('blue', '🔵', 'blue')], 'red', 'It is red!', { show: big('🍎') }),
      q('What colour was the frog?', [o('green', '🟢', 'green'), o('yellow', '🟡', 'yellow')], 'green', 'It is green!', { show: big('🐸') })
    ],
    check: [
      q('Find yellow.', [o('yellow', '🟡'), o('blue', '🔵'), o('red', '🔴')], 'yellow', 'Yellow!', { text: 'Find <b>yellow</b>' }),
      q('Find green.', [o('green', '🟢'), o('red', '🔴'), o('yellow', '🟡')], 'green', 'Green!', { text: 'Find <b>green</b>' }),
      q('Find something blue.', [o('whale', '🐳'), o('apple', '🍎'), o('sun', '☀️')], 'whale', 'The whale. It is blue!',
        { text: 'Find something <b>blue</b>' }),
      q('Find something red.', [o('apple', '🍎'), o('frog', '🐸'), o('whale', '🐳')], 'apple', 'The apple. It is red!',
        { text: 'Find something <b>red</b>' })
    ]
  };

  const ANIMALS = {
    story: [
      { art: '{me} 🏡', text: 'Let\'s go to the farm!', bg: '#E3F7D2' },
      { art: '🐮', text: 'Moo! What is it? It is a cow!', bg: '#FFF1CF' },
      { art: '🦆', text: 'Quack! What is it? It is a duck!', bg: '#DCEBFF' },
      { art: '🐷', text: 'Oink! What is it? It is a pig!', bg: '#FFE6F0' },
      { art: '{me} 🐶 🐱', text: 'Woof! Miaow! A dog and a cat!', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '🐮', word: 'cow', say: 'A cow. The cow says moo!' },
      { pic: '🦆', word: 'duck', say: 'A duck. The duck says quack!' },
      { pic: '🐷', word: 'pig', say: 'A pig. The pig says oink!' },
      { pic: '🐶', word: 'dog', say: 'A dog. The dog says woof!' }
    ],
    say: [{ w: 'cow', e: '🐮' }, { w: 'duck', e: '🦆' }, { w: 'pig', e: '🐷' }, { w: 'dog', e: '🐶' }, { w: 'cat', e: '🐱' }],
    quiz: [
      q('Where did I go in the story?', [o('farm', '🏡', 'the farm'), o('beach', '🏖️', 'the beach')], 'farm', 'The farm!'),
      q('Which animal said oink?', [o('pig', '🐷'), o('cow', '🐮'), o('duck', '🦆')], 'pig', 'A pig! Oink!')
    ],
    check: [
      q('Moo! What is it?', [o('cow', '🐮'), o('pig', '🐷'), o('duck', '🦆')], 'cow', 'It is a cow!'),
      q('Quack! What is it?', [o('duck', '🦆'), o('dog', '🐶'), o('cow', '🐮')], 'duck', 'It is a duck!'),
      q('Woof! What is it?', [o('dog', '🐶'), o('cat', '🐱')], 'dog', 'It is a dog!'),
      q('Find the cat.', [o('cat', '🐱'), o('pig', '🐷')], 'cat', 'A cat! Miaow!', { text: 'Find the <b>cat</b>' })
    ]
  };

  const NUMBERS = {
    story: [
      { art: '{me} 🦆', text: 'One little duck. Quack!', bg: '#DCEBFF' },
      { art: '{me} 🦆 🦆', text: 'Two little ducks. Quack, quack!', bg: '#CDEBFF' },
      { art: '🦆 🦆 🦆', text: 'How many ducks? Three!', bg: '#D9F7F0' },
      { art: '🦆 🦆 🦆 🦆', text: 'Four ducks swim in the pond.', bg: '#BFE3FF' },
      { art: '{me} ✋', text: 'Five ducks, like my five fingers!', bg: '#FFF6B8' }
    ],
    words: [
      { big: '1', show: introRow('🦆', 1, true), word: 'one', say: 'One. One duck.' },
      { big: '2', show: introRow('🦆', 2, true), word: 'two', say: 'Two. Two ducks.' },
      { big: '3', show: introRow('🦆', 3, true), word: 'three', say: 'Three. Three ducks.' },
      { big: '5', show: introRow('🦆', 5, true), word: 'five', say: 'Five. One, two, three, four, five!' }
    ],
    say: [
      { w: 'one', e: '<span class="en-shrink" style="--k:.6">' + row('🦆', 1) + '</span>' },
      { w: 'two', e: '<span class="en-shrink" style="--k:.6">' + row('🦆', 2) + '</span>' },
      { w: 'three', e: '<span class="en-shrink" style="--k:.5">' + row('🦆', 3) + '</span>' },
      { w: 'four', e: '<span class="en-shrink" style="--k:.4">' + row('🦆', 4) + '</span>' },
      { w: 'five', e: '<span class="en-shrink" style="--k:.35">' + row('🦆', 5) + '</span>' }
    ],
    quiz: [
      q('How many ducks came at the end?', [g(5, '5'), g(3, '3')], 5, 'Five ducks!'),
      q('How many ducks swam in the pond?', [g(4, '4'), g(2, '2'), g(1, '1')], 4, 'Four ducks!', { show: showRow('🦆', 4) })
    ],
    check: [
      q('How many ducks?', [g(2, '2'), g(3, '3'), g(4, '4')], 3, 'Three ducks!', { text: 'How many <b>ducks</b>?', show: showRow('🦆', 3) }),
      q('How many apples?', [g(1, '1'), g(2, '2'), g(3, '3')], 2, 'Two apples!', { text: 'How many <b>apples</b>?', show: showRow('🍎', 2) }),
      q('How many stars?', [g(4, '4'), g(5, '5')], 5, 'Five stars!', { text: 'How many <b>stars</b>?', show: showRow('⭐', 5) }),
      q('How many cats?', [g(1, '1'), g(3, '3')], 1, 'One cat!', { text: 'How many <b>cats</b>?', show: showRow('🐱', 1) }),
      q('Find number four.', [g(4, '4'), g(2, '2'), g(5, '5')], 4, 'Four!', { text: 'Find number <b>four</b>' })
    ]
  };

  const STAGE1_PAIRS = [{ w: 'hello', e: '👋' }, { w: 'thank you', e: '🙏' }, { w: 'cat', e: '🐱' }, { w: 'dog', e: '🐶' },
    { w: 'cow', e: '🐮' }, { w: 'duck', e: '🦆' }, { w: 'pig', e: '🐷' }, { w: 'red', e: '🔴' }, { w: 'yellow', e: '🟡' },
    { w: 'green', e: '🟢' }, { w: 'blue', e: '🔵' }];

  /* ============================================================
     STAGE 2 — everyday expressions
     ============================================================ */

  const FOOD = {
    story: [
      { art: '{me} 🍽️', text: 'I am hungry. Let\'s eat!', bg: '#FFF1CF' },
      { art: '{me} 🍎 🍌', text: 'I like apples. I like bananas.', bg: '#FFE6F0' },
      { art: '{me} 🥕', text: 'I like carrots too. Crunch, crunch!', bg: '#FFE0C2' },
      { art: '{me} 🥛', text: 'I am thirsty. I want milk, please.', bg: '#DCEBFF' },
      { art: '{me} 😋', text: 'Yummy! My tummy is happy.', bg: '#E3F7D2' }
    ],
    words: [
      { pic: '🍎', word: 'apple', say: 'An apple. I like apples!' },
      { pic: '🍌', word: 'banana', say: 'A banana. I like bananas!' },
      { pic: '🥕', word: 'carrot', say: 'A carrot. Crunch, crunch!' },
      { pic: '🥛', word: 'milk', say: 'Milk. I want milk, please.' }
    ],
    say: [{ w: 'I like apples', e: '🍎' }, { w: 'I want milk', e: '🥛' }, { w: 'banana', e: '🍌' }, { w: 'yummy', e: '😋' }],
    quiz: [
      q('In the story, what went crunch?', [o('carrot', '🥕'), o('milk', '🥛'), o('banana', '🍌')], 'carrot', 'Carrots! Crunch, crunch!'),
      q('I was thirsty. What did I want?', [o('milk', '🥛', 'milk'), o('bread', '🍞', 'bread'), o('cheese', '🧀', 'cheese')], 'milk', 'I want milk, please.')
    ],
    check: [
      q('I like bananas. Find the bananas.', [o('banana', '🍌'), o('apple', '🍎'), o('carrot', '🥕')], 'banana', 'Bananas!',
        { text: 'I like <b>bananas</b>' }),
      q('I like apples. Find the apples.', [o('apple', '🍎'), o('cheese', '🧀'), o('bread', '🍞')], 'apple', 'Apples!',
        { text: 'I like <b>apples</b>' }),
      q('I want bread, please. Find the bread.', [o('bread', '🍞'), o('milk', '🥛'), o('banana', '🍌')], 'bread', 'Bread, please!',
        { text: 'I want <b>bread</b>, please' }),
      q('Find something to drink.', [o('milk', '🥛'), o('apple', '🍎'), o('carrot', '🥕')], 'milk', 'Milk!',
        { text: 'Find something to <b>drink</b>' })
    ]
  };

  const BODY = {
    story: [
      { art: '{me} 🐵', text: 'Monkey says, let\'s play a game!', bg: '#E3F7D2' },
      { art: '{me} 👃', text: 'Touch your nose. Boop!', bg: '#FFE6F0' },
      { art: '{me} 👂', text: 'Touch your ears. Wiggle, wiggle!', bg: '#FFF1CF' },
      { art: '{me} 🦶', text: 'Stamp your feet. Stamp, stamp!', bg: '#FFE0C2' },
      { art: '{me} 👏 🐵', text: 'Clap your hands. Clap, clap, clap!', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '👃', word: 'nose', say: 'Nose. Touch your nose!' },
      { pic: '👂', word: 'ears', say: 'Ears. I hear with my ears.' },
      { pic: '🦶', word: 'feet', say: 'Feet. Stamp your feet!' },
      { pic: '✋', word: 'hands', say: 'Hands. Clap your hands!' }
    ],
    say: [{ w: 'nose', e: '👃' }, { w: 'ears', e: '👂' }, { w: 'feet', e: '🦶' }, { w: 'hands', e: '✋' }],
    quiz: [
      q('Who played the game with me?', [o('monkey', '🐵'), o('cow', '🐮'), o('pig', '🐷')], 'monkey', 'Monkey!'),
      q('What did we clap?', [o('hands', '✋', 'hands'), o('feet', '🦶', 'feet'), o('nose', '👃', 'nose')], 'hands', 'Our hands! Clap, clap!')
    ],
    check: [
      q('Touch your nose! Find the nose.', [o('nose', '👃'), o('ear', '👂'), o('hand', '✋')], 'nose', 'Nose!', { text: 'Touch your <b>nose</b>!' }),
      q('Stamp your feet! Find the feet.', [o('feet', '🦶'), o('hand', '✋'), o('nose', '👃')], 'feet', 'Feet! Stamp, stamp!',
        { text: 'Stamp your <b>feet</b>!' }),
      q('What do we hear with?', [o('ear', '👂', 'ears'), o('eye', '👁️', 'eyes'), o('nose', '👃', 'nose')], 'ear', 'Our ears!',
        { text: 'What do we <b>hear</b> with?' }),
      q('What do we see with?', [o('eye', '👁️', 'eyes'), o('ear', '👂', 'ears'), o('mouth', '👄', 'mouth')], 'eye', 'Our eyes!',
        { text: 'What do we <b>see</b> with?' })
    ]
  };

  const MORNING = {
    story: [
      { art: '🌅 {me}', text: 'Good morning! Time to wake up.', bg: '#FFE9C7' },
      { art: '{me} 🪥', text: 'I brush my teeth. Brush, brush, brush!', bg: '#DCEBFF' },
      { art: '{me} 👕 🧦', text: 'I get dressed. Shirt on, socks on!', bg: '#FFE6F0' },
      { art: '{me} 🥣', text: 'I eat my breakfast. Yum, yum!', bg: '#FFF1CF' },
      { art: '{me} ☀️', text: 'I am ready. Good morning, everyone!', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '⏰', word: 'wake up', say: 'Wake up! Good morning!' },
      { pic: '🪥', word: 'brush teeth', say: 'Brush your teeth. Brush, brush!' },
      { pic: '👕', word: 'get dressed', say: 'Get dressed. Put on your clothes.' },
      { pic: '🥣', word: 'eat breakfast', say: 'Eat your breakfast. Yum, yum!' }
    ],
    say: [{ w: 'good morning', e: '🌅' }, { w: 'wake up', e: '⏰' }, { w: 'brush teeth', e: '🪥' }, { w: 'get dressed', e: '👕' }],
    quiz: [
      q('What did I do first?', [o('wake', '⏰', 'wake up'), o('eat', '🥣', 'eat breakfast')], 'wake', 'I woke up!'),
      q('What did I eat for breakfast?', [o('cereal', '🥣'), o('cake', '🍰'), o('pizza', '🍕')], 'cereal', 'A bowl of cereal. Yum!')
    ],
    check: [
      q('Brush your teeth! Find the toothbrush.', [o('brush', '🪥'), o('spoon', '🥄'), o('sock', '🧦')], 'brush', 'A toothbrush!',
        { text: 'Brush your <b>teeth</b>!' }),
      q('Get dressed! What do you put on?', [o('shirt', '👕'), o('bread', '🍞'), o('bed', '🛏️')], 'shirt', 'A shirt!',
        { text: 'Get <b>dressed</b>! What do you put on?' }),
      q('Eat your breakfast! Find the breakfast.', [o('cereal', '🥣'), o('brush', '🪥'), o('shirt', '👕')], 'cereal', 'Breakfast! Yum!',
        { text: 'Eat your <b>breakfast</b>!' }),
      q('The sun is up. What do we say?', [o('morning', '🌅', 'good morning'), o('bye', '🚶', 'goodbye')], 'morning', 'Good morning!',
        { text: 'The sun is up. What do we <b>say</b>?' })
    ]
  };

  const FACE = { happy: '😀', sad: '😢', angry: '😠', sleepy: '😴' };
  const feel = (f) => o(f, FACE[f], f);
  const FEELINGS = {
    story: [
      { art: '{me} 😀 🎁', text: 'I have a present. I am happy!', bg: '#FFF6B8' },
      { art: '{me} 😢 🍦', text: 'Oh no, my ice cream fell. I am sad.', bg: '#DCEBFF' },
      { art: '{me} 😠 🧱', text: 'My tower fell down. I am angry!', bg: '#FFE0C2' },
      { art: '{me} 😴 🌙', text: 'It is late. Yawn! I am sleepy.', bg: '#E6E0FF' },
      { art: '{me} 🛏️ 🌙', text: 'Goodnight! Sweet dreams.', bg: '#2B2B5E' }
    ],
    words: [
      { pic: '😀', word: 'happy', say: 'Happy. I am happy!' },
      { pic: '😢', word: 'sad', say: 'Sad. I am sad.' },
      { pic: '😠', word: 'angry', say: 'Angry. I am angry!' },
      { pic: '😴', word: 'sleepy', say: 'Sleepy. Yawn! I am sleepy.' }
    ],
    say: [{ w: 'happy', e: '😀' }, { w: 'sad', e: '😢' }, { w: 'angry', e: '😠' }, { w: 'sleepy', e: '😴' }],
    quiz: [
      q('I had a present. How did I feel?', [feel('happy'), feel('sad'), feel('sleepy')], 'happy', 'I was happy!', { show: big('🎁') }),
      q('My tower fell down. How did I feel?', [feel('angry'), feel('happy'), feel('sleepy')], 'angry', 'I was angry.', { show: big('🧱') })
    ],
    check: [
      q('Oh no, the ice cream fell. How does she feel?', [feel('sad'), feel('happy')], 'sad', 'She is sad.',
        { text: 'The ice cream fell. How does she <b>feel</b>?', show: big('🍦💧') }),
      q('It is late. Yawn! How does he feel?', [feel('sleepy'), feel('angry'), feel('happy')], 'sleepy', 'He is sleepy.',
        { text: 'It is late. How does he <b>feel</b>?', show: big('🌙🥱') }),
      q('The puppy has a present. How does it feel?', [feel('happy'), feel('sad'), feel('angry')], 'happy', 'It is happy!',
        { text: 'The puppy has a present. How does it <b>feel</b>?', show: big('🐶🎁') }),
      q('I am happy! Find happy.', [feel('happy'), feel('sad'), feel('angry')], 'happy', 'Happy!', { text: 'I am <b>happy</b>!' })
    ]
  };

  const STAGE2_PAIRS = PR.word([{ w: 'apple', e: '🍎' }, { w: 'banana', e: '🍌' }, { w: 'milk', e: '🥛' }, { w: 'carrot', e: '🥕' },
    { w: 'nose', e: '👃' }, { w: 'ears', e: '👂' }, { w: 'feet', e: '🦶' }, { w: 'hands', e: '✋' }, { w: 'breakfast', e: '🥣' },
    { w: 'happy', e: '😀' }, { w: 'sad', e: '😢' }, { w: 'sleepy', e: '😴' }]);

  /* ============================================================
     STAGE 3 — my world
     ============================================================ */

  const PARK = {
    story: [
      { art: '{me} 🌳 🌸', text: 'It is a sunny day. Let\'s go to the park!', bg: '#E3F7D2' },
      { art: '🐶 ⚽ {me}', text: 'Dog has a ball. Let\'s play!', bg: '#FFF1CF' },
      { art: '{me} 🪁', text: 'Whoosh! My kite flies up high.', bg: '#DCEBFF' },
      { art: '🪁 🌳', text: 'Oh no! My kite is in the tree.', bg: '#E6E0FF' },
      { art: '{me} 🌬️ 🪁', text: 'The wind blows. Down comes my kite. Hooray!', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '⚽', word: 'ball', say: 'A ball. Let\'s kick the ball!' },
      { pic: '🪁', word: 'kite', say: 'A kite. It flies in the wind.' },
      { pic: '🌳', word: 'tree', say: 'A tree. The tree is very tall.' },
      { pic: '🤝', word: 'let\'s play', say: 'Let\'s play! We say it to a friend.' }
    ],
    say: [{ w: 'let\'s play', e: '🤝' }, { w: 'ball', e: '⚽' }, { w: 'kite', e: '🪁' }, { w: 'tree', e: '🌳' }],
    quiz: [
      q('Where did my kite get stuck?', [o('tree', '🌳', 'in the tree'), o('car', '🚗', 'in the car'), o('house', '🏠', 'in the house')],
        'tree', 'In the tree!'),
      q('Who had a ball?', [o('dog', '🐶'), o('cat', '🐱'), o('pig', '🐷')], 'dog', 'Dog had a ball!'),
      q('What brought my kite down?', [o('wind', '🌬️', 'the wind'), o('rain', '🌧️', 'the rain'), o('snow', '❄️', 'the snow')], 'wind', 'The wind!')
    ],
    check: [
      q('Let\'s fly it! Find the kite.', [o('kite', '🪁'), o('ball', '⚽'), o('tree', '🌳')], 'kite', 'A kite!', { text: 'Find the <b>kite</b>' }),
      q('Let\'s kick it! Find the ball.', [o('ball', '⚽'), o('kite', '🪁'), o('flower', '🌸')], 'ball', 'A ball!', { text: 'Find the <b>ball</b>' }),
      q('It is big and tall and green. What is it?', [o('tree', '🌳'), o('ball', '⚽'), o('kite', '🪁')], 'tree', 'A tree!',
        { text: 'Big, tall and green. What <b>is</b> it?' }),
      q('You want to play with a friend. What do you say?', [o('play', '🤝', 'let\'s play'), o('bye', '🚶', 'goodbye')], 'play', 'Let\'s play!',
        { text: 'You want to play. What do you <b>say</b>?' })
    ]
  };

  const WEATHER = {
    story: [
      { art: '{me} ☀️ 🧢', text: 'It is sunny. I need my cap.', bg: '#FFF6B8' },
      { art: '{me} 🌧️ ☂️', text: 'It is rainy. I need an umbrella.', bg: '#DCEBFF' },
      { art: '{me} 🌬️ 🪁', text: 'It is windy. Whoosh! Let\'s fly my kite.', bg: '#E3F7D2' },
      { art: '{me} ❄️ ⛄', text: 'It is snowy. Let\'s make a snowman!', bg: '#EAF4FF' },
      { art: '{me} 🧣 🧤', text: 'It is cold. I need my scarf and gloves.', bg: '#E6E0FF' }
    ],
    words: [
      { pic: '☀️', word: 'sunny', say: 'Sunny. The sun is out.' },
      { pic: '🌧️', word: 'rainy', say: 'Rainy. Drip, drop! I need an umbrella.' },
      { pic: '🌬️', word: 'windy', say: 'Windy. The wind blows. Whoosh!' },
      { pic: '❄️', word: 'snowy', say: 'Snowy. The snow is white and cold.' }
    ],
    say: [{ w: 'sunny', e: '☀️' }, { w: 'rainy', e: '🌧️' }, { w: 'windy', e: '🌬️' }, { w: 'snowy', e: '❄️' }, { w: 'umbrella', e: '☂️' }],
    quiz: [
      q('It was snowy. What did I make?', [o('snowman', '⛄', 'a snowman'), o('castle', '🏰', 'a sandcastle')], 'snowman', 'A snowman!'),
      q('It was sunny. What did I need?', [o('cap', '🧢', 'my cap'), o('scarf', '🧣', 'my scarf'), o('umbrella', '☂️', 'an umbrella')],
        'cap', 'My cap!')
    ],
    check: [
      q('It is rainy. What do I need?', [o('umbrella', '☂️', 'umbrella'), o('cap', '🧢', 'cap'), o('kite', '🪁', 'kite')], 'umbrella',
        'I need an umbrella!', { text: 'It is <b>rainy</b>. What do I need?' }),
      q('Whoosh! What is the weather like?', [o('windy', '🌬️', 'windy'), o('sunny', '☀️', 'sunny'), o('snowy', '❄️', 'snowy')], 'windy',
        'It is windy!', { text: 'Whoosh! What is the <b>weather</b> like?' }),
      q('Drip, drop. What is the weather like?', [o('rainy', '🌧️', 'rainy'), o('sunny', '☀️', 'sunny'), o('snowy', '❄️', 'snowy')], 'rainy',
        'It is rainy!', { text: 'Drip, drop. What is the <b>weather</b> like?' }),
      q('It is cold and snowy. What do I need?', [o('scarf', '🧣', 'scarf'), o('cap', '🧢', 'cap'), o('cream', '🧴', 'sun cream')], 'scarf',
        'My scarf!', { text: 'It is <b>snowy</b>. What do I need?' })
    ]
  };

  const HELPERS = {
    story: [
      { art: '{me} 🧑‍⚕️', text: 'She is a doctor. She helps me feel better.', bg: '#DCEBFF' },
      { art: '🧑‍🏫 📚 {me}', text: 'He is a teacher. He helps me learn.', bg: '#FFF1CF' },
      { art: '🧑‍🌾 🥕', text: 'She is a farmer. She grows carrots.', bg: '#E3F7D2' },
      { art: '🧑‍🍳 🍲', text: 'He is a cook. He makes yummy soup.', bg: '#FFE0C2' },
      { art: '{me} 💛', text: 'Thank you, helpers! You help us every day.', bg: '#FFE6F0' }
    ],
    words: [
      { pic: '🧑‍⚕️', word: 'doctor', say: 'A doctor. She helps us when we are ill.' },
      { pic: '🧑‍🏫', word: 'teacher', say: 'A teacher. He helps us learn.' },
      { pic: '🧑‍🌾', word: 'farmer', say: 'A farmer. She grows our food.' },
      { pic: '🧑‍🍳', word: 'cook', say: 'A cook. He cooks yummy food.' }
    ],
    say: [{ w: 'doctor', e: '🧑‍⚕️' }, { w: 'teacher', e: '🧑‍🏫' }, { w: 'farmer', e: '🧑‍🌾' }, { w: 'cook', e: '🧑‍🍳' }],
    quiz: [
      q('Who grows carrots?', [o('farmer', '🧑‍🌾', 'farmer'), o('cook', '🧑‍🍳', 'cook'), o('doctor', '🧑‍⚕️', 'doctor')], 'farmer', 'The farmer!'),
      q('Who makes yummy soup?', [o('cook', '🧑‍🍳', 'cook'), o('teacher', '🧑‍🏫', 'teacher'), o('farmer', '🧑‍🌾', 'farmer')], 'cook', 'The cook!')
    ],
    check: [
      q('I feel ill. Who can help me?', [o('doctor', '🧑‍⚕️', 'doctor'), o('farmer', '🧑‍🌾', 'farmer'), o('cook', '🧑‍🍳', 'cook')], 'doctor',
        'The doctor!', { show: big('🤒') }),
      q('Who helps us learn at school?', [o('teacher', '🧑‍🏫', 'teacher'), o('doctor', '🧑‍⚕️', 'doctor'), o('cook', '🧑‍🍳', 'cook')], 'teacher',
        'The teacher!', { show: big('🏫') }),
      q('She is a doctor. Find the doctor.', [o('doctor', '🧑‍⚕️'), o('teacher', '🧑‍🏫'), o('farmer', '🧑‍🌾')], 'doctor', 'She is a doctor!',
        { text: 'She is a <b>doctor</b>' }),
      q('He is a cook. Find the cook.', [o('cook', '🧑‍🍳'), o('farmer', '🧑‍🌾'), o('teacher', '🧑‍🏫')], 'cook', 'He is a cook!',
        { text: 'He is a <b>cook</b>' })
    ]
  };

  const TRAVEL = {
    story: [
      { art: '{me} 🚗', text: 'Beep, beep! We go by car.', bg: '#FFF1CF' },
      { art: '{me} 🚂', text: 'Choo, choo! Now we go by train.', bg: '#E3F7D2' },
      { art: '✈️ ☁️ {me}', text: 'Zoom! A plane flies in the sky.', bg: '#DCEBFF' },
      { art: '{me} 🚌', text: 'Let\'s go by bus! Here we go.', bg: '#FFE0C2' },
      { art: '{me} 🏖️ ☀️', text: 'Hooray! We are at the beach.', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '🚗', word: 'car', say: 'A car. Beep, beep!' },
      { pic: '🚌', word: 'bus', say: 'A bus. Let\'s go by bus!' },
      { pic: '🚂', word: 'train', say: 'A train. Choo, choo!' },
      { pic: '✈️', word: 'plane', say: 'A plane. It flies in the sky.' }
    ],
    say: [{ w: 'let\'s go', e: '🚌' }, { w: 'car', e: '🚗' }, { w: 'train', e: '🚂' }, { w: 'plane', e: '✈️' }],
    quiz: [
      q('Where did we go in the story?', [o('beach', '🏖️', 'the beach'), o('school', '🏫', 'school'), o('shop', '🏪', 'the shop')], 'beach',
        'To the beach!'),
      q('What did we see in the sky?', [o('plane', '✈️'), o('bus', '🚌'), o('car', '🚗')], 'plane', 'A plane! Zoom!')
    ],
    check: [
      q('Which one flies in the sky?', [o('plane', '✈️'), o('car', '🚗'), o('train', '🚂')], 'plane', 'A plane!', { text: 'Which one <b>flies</b>?' }),
      q('Choo, choo! What is it?', [o('train', '🚂'), o('bus', '🚌'), o('plane', '✈️')], 'train', 'A train!'),
      q('Beep, beep! Find the car.', [o('car', '🚗'), o('train', '🚂'), o('plane', '✈️')], 'car', 'A car!', { text: 'Find the <b>car</b>' }),
      q('Let\'s go by bus! Find the bus.', [o('bus', '🚌'), o('car', '🚗'), o('train', '🚂')], 'bus', 'Let\'s go by bus!',
        { text: 'Let\'s go by <b>bus</b>!' })
    ]
  };

  const STAGE3_PAIRS = PR.word([{ w: 'ball', e: '⚽' }, { w: 'kite', e: '🪁' }, { w: 'tree', e: '🌳' }, { w: 'sunny', e: '☀️' },
    { w: 'umbrella', e: '☂️' }, { w: 'snowman', e: '⛄' }, { w: 'doctor', e: '🧑‍⚕️' }, { w: 'farmer', e: '🧑‍🌾' }, { w: 'cook', e: '🧑‍🍳' },
    { w: 'car', e: '🚗' }, { w: 'bus', e: '🚌' }, { w: 'train', e: '🚂' }, { w: 'plane', e: '✈️' }]);

  /* ============================================================
     STAGE 4 — reading and grammar
     ============================================================ */

  const ON = (what, thing) => place(what, 'on', thing, '40cqmin');
  const IN = (what, thing) => place(what, 'in', thing, '40cqmin');
  const UNDER = (what, thing) => place(what, 'under', thing, '40cqmin');

  const WHERE = {
    story: [
      { art: '{me} 📦', text: 'Look, a big box!', bg: '#FFF1CF' },
      { art: '🐱 📦', text: 'The cat is on the box.', bg: '#FFE6F0' },
      { art: '📦 🐱', text: 'Now the cat is in the box. Peekaboo!', bg: '#E6E0FF' },
      { art: '🪑 🐱', text: 'Now the cat is under the chair.', bg: '#DCEBFF' },
      { art: '{me} 🐱 💛', text: 'Here you are, Cat! Purr, purr.', bg: '#FFF6B8' }
    ],
    words: [
      { show: place('🐱', 'on', '📦', '2.6em'), word: 'on', say: 'On. The cat is on the box.' },
      { show: place('🐱', 'in', '📦', '2.6em'), word: 'in', say: 'In. The cat is in the box.' },
      { show: place('🐱', 'under', '🪑', '2.6em'), word: 'under', say: 'Under. The cat is under the chair.' }
    ],
    say: [
      { w: 'on the box', e: place('🐱', 'on', '📦', '.6em') },
      { w: 'in the box', e: place('🐱', 'in', '📦', '.6em') },
      { w: 'under', e: place('🐱', 'under', '🪑', '.6em') }
    ],
    quiz: [
      q('Where did the cat say peekaboo?', [h('in', IN('🐱', '📦')), h('on', ON('🐱', '📦')), h('under', UNDER('🐱', '🪑'))], 'in',
        'In the box!'),
      q('Where was the cat first?', [h('on', ON('🐱', '📦')), h('in', IN('🐱', '📦'))], 'on', 'On the box!')
    ],
    check: [
      q('The cat is on the box. Find it.', [h('on', ON('🐱', '📦')), h('in', IN('🐱', '📦')), h('under', UNDER('🐱', '🪑'))], 'on',
        'The cat is on the box.', { text: 'The cat is <b>on</b> the box' }),
      q('The cat is in the box. Find it.', [h('in', IN('🐱', '📦')), h('on', ON('🐱', '📦')), h('under', UNDER('🐱', '🪑'))], 'in',
        'The cat is in the box.', { text: 'The cat is <b>in</b> the box' }),
      q('The dog is under the chair. Find it.', [h('under', UNDER('🐶', '🪑')), h('on', ON('🐶', '🪑'))], 'under',
        'The dog is under the chair.', { text: 'The dog is <b>under</b> the chair' }),
      q('Where is the dog? Find the word.', [g('on'), g('in'), g('under')], 'on', 'On the box!',
        { text: 'Where is the dog? Find the <b>word</b>', show: place('🐶', 'on', '📦', '1.8em') }),
      q('Where is the cat? Find the word.', [g('under'), g('on'), g('in')], 'under', 'Under the chair!',
        { text: 'Where is the cat? Find the <b>word</b>', show: place('🐱', 'under', '🪑', '1.8em') })
    ]
  };

  const MANY = {
    story: [
      { art: '{me} 🐱', text: 'I see one cat.', bg: '#FFF1CF' },
      { art: '🐱 🐱 🐱', text: 'Now I see three cats!', bg: '#FFE6F0' },
      { art: '{me} 🐶 🐶', text: 'Look, two dogs! Woof, woof!', bg: '#E3F7D2' },
      { art: '🦆 🦆 🦆 🦆', text: 'Four ducks say quack, quack!', bg: '#DCEBFF' },
      { art: '⭐ ⭐ ⭐ ⭐', text: 'Many stars! Goodnight, stars.', bg: '#2B2B5E' }
    ],
    words: [
      { show: introRow('🐱', 1), word: 'one cat', say: 'One cat.' },
      { show: introRow('🐱', 3), word: 'three cats', say: 'Three cats. One cat, two cats, three cats!' },
      { show: introRow('🐶', 2), word: 'two dogs', say: 'Two dogs. One dog, two dogs!' },
      { show: introRow('⭐', 5), word: 'many stars', say: 'Many stars! Lots and lots of stars.' }
    ],
    play: {
      sets: [
        build(['I', 'see', 'one', 'cat.'], 'I see one cat.'),
        build(['I', 'see', 'two', 'dogs.'], 'I see two dogs.'),
        build(['I', 'see', 'three', 'cats.'], 'I see three cats.')
      ]
    },
    quiz: [
      q('How many dogs did I see?', [h(2, rowCard('🐶', 2)), h(1, rowCard('🐶', 1)), h(3, rowCard('🐶', 3))], 2, 'Two dogs!'),
      q('How many ducks said quack?', [g(4, '4'), g(2, '2'), g(1, '1')], 4, 'Four ducks!')
    ],
    check: [
      q('Find two dogs.', [h(2, rowCard('🐶', 2)), h(1, rowCard('🐶', 1)), h(3, rowCard('🐶', 3))], 2, 'Two dogs!',
        { text: 'Find <b>two dogs</b>' }),
      q('Find one cat.', [h(1, rowCard('🐱', 1)), h(3, rowCard('🐱', 3))], 1, 'One cat!', { text: 'Find <b>one cat</b>' }),
      q('Find three apples.', [h(3, rowCard('🍎', 3)), h(1, rowCard('🍎', 1)), h(2, rowCard('🍎', 2))], 3, 'Three apples!',
        { text: 'Find <b>three apples</b>' }),
      q('Look! Is it cat, or cats?', [g('cats'), g('cat')], 'cats', 'Cats! Three cats.',
        { text: 'Is it <b>cat</b> or <b>cats</b>?', show: showRow('🐱', 3) }),
      q('Look! Is it dog, or dogs?', [g('dog'), g('dogs')], 'dog', 'Dog! One dog.',
        { text: 'Is it <b>dog</b> or <b>dogs</b>?', show: showRow('🐶', 1) })
    ]
  };

  const OPPOSITE = {
    story: [
      { art: '{me} 🐘 🐭', text: 'The elephant is big. The mouse is small.', bg: '#E3F7D2' },
      { art: '🐍', text: 'The snake is long. Very, very long!', bg: '#FFF1CF' },
      { art: '{me} ☕', text: 'My cocoa is hot. Blow, blow!', bg: '#FFE0C2' },
      { art: '{me} 🍦', text: 'My ice cream is cold. Lick, lick!', bg: '#DCEBFF' },
      { art: '{me} 🐘 🐭', text: 'Big or small, we are all friends!', bg: '#FFE6F0' }
    ],
    words: [
      { show: pair('🐘', '🐭', 0.55), word: 'big, small',
        say: 'Big and small. The elephant is big. The mouse is small.' },
      { show: `<span class="group en-stack">${flat(true)}${flat(false)}</span>`, word: 'long, short',
        say: 'Long and short. This pencil is long. This pencil is short.' },
      { show: pair('☕', '🍦'), word: 'hot, cold',
        say: 'Hot and cold. The cocoa is hot. The ice cream is cold.' }
    ],
    say: [{ w: 'big', e: '🐘' }, { w: 'small', e: '🐭' }, { w: 'hot', e: '☕' }, { w: 'cold', e: '🍦' }],
    quiz: [
      q('In the story, what was hot?', [o('cocoa', '☕', 'cocoa'), o('ice', '🍦', 'ice cream')], 'cocoa', 'The cocoa was hot!'),
      q('In the story, who was small?', [o('mouse', '🐭'), o('elephant', '🐘'), o('snake', '🐍')], 'mouse', 'The mouse!')
    ],
    check: [
      q('Find the big dog.', [h('big', sized('🐶', 0.85)), h('small', sized('🐶', 0.4))],
        'big', 'The big dog!', { text: 'Find the <b>big</b> dog' }),
      q('Find the long pencil.', [h('long', pencil(true, '30cqmin')), h('short', pencil(false, '30cqmin'))], 'long', 'The long pencil!',
        { text: 'Find the <b>long</b> pencil' }),
      q('Find the short pencil.', [h('short', pencil(false, '30cqmin')), h('long', pencil(true, '30cqmin'))], 'short', 'The short pencil!',
        { text: 'Find the <b>short</b> pencil' }),
      q('Which one is cold?', [o('snowman', '⛄'), o('fire', '🔥'), o('sun', '☀️')], 'snowman', 'The snowman is cold!',
        { text: 'Which one is <b>cold</b>?' }),
      q('The mouse is big, or small?', [g('small'), g('big')], 'small', 'The mouse is small!',
        { text: 'The mouse is <b>big</b> or <b>small</b>?', show: big('🐭') })
    ]
  };

  const ASK = {
    story: [
      { art: '{me} 🎁', text: 'What is it? It is a present!', bg: '#FFE6F0' },
      { art: '{me} 🧸', text: 'I open it. It is a teddy!', bg: '#FFF1CF' },
      { art: '{me} 🚪', text: 'Knock, knock! Who is it?', bg: '#E6E0FF' },
      { art: '🐻 🚪 {me}', text: 'It is Bear! Bear wants to play.', bg: '#E3F7D2' },
      { art: '🪑 🧸 🐻', text: 'Where is the teddy? It is under the chair!', bg: '#DCEBFF' }
    ],
    words: [
      { pic: '🎁', word: 'What is it?', say: 'What is it? It is a present.' },
      { pic: '🚪', word: 'Who is it?', say: 'Who is it? It is Bear.' },
      { show: place('🧸', 'under', '🪑', '2.6em'), word: 'Where is it?', say: 'Where is it? It is under the chair.' }
    ],
    play: {
      sets: [
        build(['What', 'is', 'it?'], 'What is it?'),
        build(['Who', 'is', 'it?'], 'Who is it?'),
        build(['Where', 'is', 'the', 'teddy?'], 'Where is the teddy?')
      ]
    },
    quiz: [
      q('What was in the present?', [o('teddy', '🧸'), o('ball', '⚽'), o('apple', '🍎')], 'teddy', 'It is a teddy!'),
      q('Knock, knock! Who came to play?', [o('bear', '🐻'), o('cow', '🐮'), o('pig', '🐷')], 'bear', 'It is Bear!'),
      q('Where was the teddy?', [h('under', UNDER('🧸', '🪑')), h('on', ON('🧸', '🪑'))], 'under', 'Under the chair!')
    ],
    check: [
      q('It is a present. What was the question?', [g('what', 'What is it?'), g('where', 'Where is it?')], 'what', 'What is it?',
        { text: 'It is a present. What was the <b>question</b>?', show: big('🎁') }),
      q('It is Bear. What was the question?', [g('who', 'Who is it?'), g('what', 'What is it?')], 'who', 'Who is it?',
        { text: 'It is Bear. What was the <b>question</b>?', show: big('🐻') }),
      q('It is under the chair. What was the question?', [g('where', 'Where is it?'), g('who', 'Who is it?')], 'where', 'Where is it?',
        { text: 'It is under the chair. What was the <b>question</b>?', show: place('🧸', 'under', '🪑', '1.8em') })
    ]
  };

  /* Read it: the friend does not read the sentence first; the
     praise reads it after, so every answer is heard once right. */
  const read = (sentence, options, answer) => q('Read it. Which picture is it?', options, answer, sentence,
    { text: 'Read it. Find the <b>picture</b>', show: line(sentence) });
  const READ = {
    story: [
      { art: '{me} 🐶', text: 'I see a dog.', bg: '#FFF1CF' },
      { art: '🐶 🔴', text: 'The dog has a ball.', bg: '#E3F7D2' },
      { art: '🔴', text: 'The ball is red.', bg: '#FFE0DC' },
      { art: '🌳 🐶 🔴', text: 'The dog runs. Run, dog, run!', bg: '#DCEBFF' },
      { art: '{me} 🐶 😀', text: 'The dog is happy. I am happy too!', bg: '#FFF6B8' }
    ],
    words: [
      { pic: '👀', word: 'I see', say: 'I see. I see a dog.' },
      { pic: '🐶', word: 'the dog', say: 'The dog. The dog has a ball.' },
      { pic: '🔴', word: 'a ball', say: 'A ball. The ball is red.' },
      { pic: '😀', word: 'happy', say: 'Happy. The dog is happy.' }
    ],
    play: {
      sets: [
        build(['I', 'see', 'a', 'dog.'], 'I see a dog.'),
        build(['The', 'ball', 'is', 'red.'], 'The ball is red.'),
        build(['The', 'dog', 'runs.'], 'The dog runs.')
      ]
    },
    quiz: [
      read('The dog has a ball.', [o('dog', '🐶'), o('cat', '🐱'), o('duck', '🦆')], 'dog')
    ],
    check: [
      read('I see a cat.', [o('cat', '🐱'), o('dog', '🐶'), o('cow', '🐮')], 'cat'),
      read('The ball is blue.', [o('blue', '🔵'), o('red', '🔴'), o('yellow', '🟡')], 'blue'),
      read('I see two dogs.', [h(2, rowCard('🐶', 2)), h(1, rowCard('🐶', 1)), h('cats', rowCard('🐱', 2))], 2),
      read('The cat is on the box.', [h('on', ON('🐱', '📦')), h('in', IN('🐱', '📦'))], 'on'),
      read('I am sleepy.', [feel('sleepy'), feel('happy'), feel('angry')].map(x => Object.assign({}, x, { label: undefined })), 'sleepy'),
      read('It is rainy.', [o('rainy', '🌧️'), o('sunny', '☀️'), o('snowy', '❄️')], 'rainy')
    ]
  };

  const STAGE4_PAIRS = PR.word([{ w: 'big', e: '🐘' }, { w: 'small', e: '🐭' }, { w: 'hot', e: '🔥' }, { w: 'cold', e: '❄️' },
    { w: 'box', e: '📦' }, { w: 'chair', e: '🪑' }, { w: 'present', e: '🎁' }, { w: 'teddy', e: '🧸' }, { w: 'dog', e: '🐶' },
    { w: 'cats', e: '🐱' }]);

  AF.register({
    id: 'english', area: 'literacy', core: 3,
    title: 'English', icon: '🗣️', colour: '#FF8A4C',
    blurb: 'Stories & talk',
    skill: 'English through stories: listening, words, speaking, reading',
    tip: 'Pick one line from today’s story, like “I like apples!” or “It is rainy”, and use it together at home: at breakfast, at the window, on a walk. Little and often is how a first language grows.',
    stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'],
    stageCrumbs: ['Hello, colours, animals', 'Food, body, my day', 'My world', 'Reading & grammar'],
    topics: { hello: 'Greetings & talk', things: 'Everyday words', me: 'Me & my day', world: 'The world around me', read: 'Reading & grammar' },
    levels: AF.tiers([
      lesson('en1-1', 'Hello!', 'hello', HELLO),
      lesson('en1-2', 'Colours', 'things', COLOURS),
      lesson('en1-3', 'Animals', 'things', ANIMALS),
      lesson('en1-4', 'Count to five', 'things', NUMBERS),
      review('en1-r', [HELLO, COLOURS, ANIMALS, NUMBERS], STAGE1_PAIRS)
    ], [
      lesson('en2-1', 'Yummy food', 'things', FOOD),
      lesson('en2-2', 'My body', 'me', BODY),
      lesson('en2-3', 'Good morning', 'me', MORNING),
      lesson('en2-4', 'Feelings', 'me', FEELINGS),
      review('en2-r', [FOOD, BODY, MORNING, FEELINGS], STAGE2_PAIRS)
    ], [
      lesson('en3-1', 'At the park', 'world', PARK),
      lesson('en3-2', 'Weather', 'world', WEATHER),
      lesson('en3-3', 'People who help', 'world', HELPERS),
      lesson('en3-4', 'Going places', 'world', TRAVEL),
      review('en3-r', [PARK, WEATHER, HELPERS, TRAVEL], STAGE3_PAIRS)
    ], [
      lesson('en4-1', 'In, on, under', 'read', WHERE),
      lesson('en4-2', 'One and many', 'read', MANY),
      lesson('en4-3', 'Big and small', 'read', OPPOSITE),
      lesson('en4-4', 'Questions', 'read', ASK),
      lesson('en4-5', 'Read it!', 'read', READ),
      review('en4-r', [WHERE, MANY, OPPOSITE, ASK, READ], STAGE4_PAIRS)
    ])
  });
})(window.AF = window.AF || {});
