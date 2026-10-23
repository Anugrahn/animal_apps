/* ============================================================
   icons.js — the "jelly" icon set
   ------------------------------------------------------------
   One look for every button and subject: a glossy squircle in a
   single hue, a darker rim, a highlight spot, and a simple glyph
   in a deeper tone of the same colour with a pale accent.

   The squircle itself is CSS (.jelly in ui.css) so one variable
   recolours it:   <span class="jelly" style="--h:#F28A2E">…</span>
   This file only holds the glyphs.

   Two ways to use it:
     AF.Icon.jelly('maze', '#3E9BF0')        -> html for a squircle
     <button class="round-btn" data-ic="home"></button>
        any element with data-ic is filled in automatically, even
        when a game adds it to the page later.

   Emoji are still used for the PICTURES a child learns from (cat,
   apple, sun). They are no longer used for the interface.
   ============================================================ */
(function (AF) {
  'use strict';

  const line = (w) => `fill="none" stroke="currentColor" stroke-width="${w || 5.5}" stroke-linecap="round" stroke-linejoin="round"`;
  const soft = 'stroke="currentColor" stroke-width="3" stroke-linejoin="round"';
  const STAR = 'M24 5l5.6 12.2 13.4 1.5-10 9 2.8 13.1L24 34.2 12.2 40.8 15 27.7l-10-9 13.4-1.5z';
  const text = (t, size, y) =>
    `<text x="24" y="${y}" text-anchor="middle" font-family="Fredoka, 'Arial Rounded MT Bold', sans-serif" font-size="${size}" font-weight="700" fill="currentColor">${t}</text>`;
  const arrow = (deg) => `<g transform="rotate(${deg} 24 24)"><path d="M27 10 L13 24 L27 38 M14 24 H37" ${line(6.5)}/></g>`;

  /* 48 × 48 glyphs. currentColor = the deep tone; class "a" = the pale accent. */
  const G = {
    /* ---- interface ---- */
    settings: `<g fill="currentColor">${[0, 1, 2, 3, 4, 5, 6, 7].map(k =>
      `<rect x="20" y="4" width="8" height="11" rx="3" transform="rotate(${k * 45} 24 24)"/>`).join('')}<circle cx="24" cy="24" r="13.5"/></g><circle class="a" cx="24" cy="24" r="6"/>`,
    home: `<path d="M7 23 L24 8 L41 23 Z" fill="currentColor" ${soft}/><rect x="11" y="21" width="26" height="20" rx="5" fill="currentColor"/><rect class="a" x="20" y="28" width="8" height="13" rx="3"/>`,
    back: arrow(0), right: arrow(180), next: arrow(180), up: arrow(90), down: arrow(270),
    help: text('?', 38, 37),
    sound: `<path d="M8 19h8l10-9v28l-10-9H8z" fill="currentColor" ${soft}/><path d="M32 17q5 7 0 14M37 11q10 13 0 26" ${line(4.5)}/>`,
    play: `<path d="M17 11 L37 24 L17 37 Z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>`,
    check: `<path d="M10 25 L20 35 L38 13" ${line(7.5)}/>`,
    close: `<path d="M13 13 L35 35 M35 13 L13 35" ${line(7)}/>`,
    retry: `<path d="M37 25a13 13 0 1 1-5-10.5" ${line(6)}/><path d="M35 5v11H24" ${line(6)}/>`,
    flag: `<path d="M13 8v34" ${line(5.5)}/><path d="M13 10h23l-6 8 6 8H13z" fill="currentColor" ${soft}/>`,
    hint: `<circle cx="24" cy="20" r="13" fill="currentColor"/><rect x="18" y="32" width="12" height="9" rx="3.5" fill="currentColor"/><path d="M17.5 18a7 7 0 0 1 5.5-5.5" fill="none" stroke="var(--ia)" stroke-width="3.5" stroke-linecap="round"/>`,
    mic: `<rect x="17" y="5" width="14" height="25" rx="7" fill="currentColor"/><path d="M10.5 22a13.5 13.5 0 0 0 27 0M24 36v7" ${line(4.5)}/>`,
    dice: `<rect x="7" y="7" width="34" height="34" rx="9" fill="currentColor"/><g class="a"><circle cx="16" cy="16" r="3.2"/><circle cx="32" cy="16" r="3.2"/><circle cx="24" cy="24" r="3.2"/><circle cx="16" cy="32" r="3.2"/><circle cx="32" cy="32" r="3.2"/></g>`,
    edit: `<path d="M8 40l3-12 19-19 9 9-19 19z" fill="currentColor" ${soft}/><path d="M26 13l9 9" fill="none" stroke="var(--ia)" stroke-width="3.5" stroke-linecap="round"/>`,
    star: `<path d="${STAR}" fill="currentColor" ${soft}/>`,
    lock: `<rect x="10" y="21" width="28" height="21" rx="6" fill="currentColor"/><path d="M16 21v-5a8 8 0 0 1 16 0v5" ${line(5.5)}/><circle class="a" cx="24" cy="31" r="3.4"/>`,
    drum: `<path d="M7 17v15c0 4.5 7.6 8 17 8s17-3.5 17-8V17" fill="currentColor"/><ellipse class="a" cx="24" cy="17" rx="17" ry="7.5"/><path d="M12 6l11 9M36 6L25 15" ${line(3.5)}/>`,
    plus: `<path d="M24 9v30M9 24h30" ${line(7)}/>`,
    flame: `<path d="M25 3c1 9 12 13 12 25a13 13 0 0 1-26 0c0-6 3-10 6-14 1 4 2 6 4 6 0-7 1-12 4-17z" fill="currentColor"/><path class="a" d="M24 25c3 4 6.500 6 6.500 10.500a6.500 6.500 0 0 1-13 0C17.500 32 21 30 24 25z"/>`,

    map: `<path d="M5 12l12-5 14 5 12-5v29l-12 5-14-5-12 5z" fill="currentColor"/><path class="a" d="M17 7v29l14 5V12z"/>`,
    journey: `<path d="M5 12l12-5 14 5 12-5v29l-12 5-14-5-12 5z" fill="currentColor"/><path d="M11 32c5-1 4-8 10-8s6 6 12-2" fill="none" stroke="var(--ia)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 5"/><path d="M35 14l3 3m0-3l-3 3" fill="none" stroke="#EE5B5B" stroke-width="3" stroke-linecap="round"/>`,
    chart: `<rect x="7" y="26" width="9" height="15" rx="3" fill="#EE5B5B"/><rect x="19.500" y="16" width="9" height="25" rx="3" fill="#F5B81C"/><rect x="32" y="7" width="9" height="34" rx="3" fill="currentColor"/>`,
    clock: `<circle cx="24" cy="25" r="17" fill="currentColor"/><circle class="a" cx="24" cy="25" r="12.500"/><path d="M24 17v9l6 4" ${line(4)}/><path d="M10 9l6-3M38 9l-6-3" ${line(4)}/>`,
    shield: `<path d="M24 4l16 6v12c0 10-7 17.500-16 21C15 39.500 8 32 8 22V10z" fill="currentColor"/><path d="M16 24l6 6 11-12" fill="none" stroke="var(--ia)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,

    /* ---- character maker tabs ---- */
    paw: `<g fill="currentColor"><ellipse cx="24" cy="31.500" rx="10.500" ry="8.500"/><ellipse cx="10.500" cy="22" rx="4.300" ry="5.200"/><ellipse cx="19" cy="13" rx="4.500" ry="5.600"/><ellipse cx="29" cy="13" rx="4.500" ry="5.600"/><ellipse cx="37.500" cy="22" rx="4.300" ry="5.200"/></g>`,
    palette: `<path d="M24 5C13 5 4 13 4 23.500S12.500 42 22.500 42c3.300 0 5-2.200 4.300-5-.8-3.300 1.600-5.500 5-5.500H36c4.500 0 8-4 8-9C44 12.500 35.500 5 24 5z" fill="currentColor"/><circle cx="13.500" cy="22" r="3.600" fill="#FF6B6B"/><circle cx="20" cy="13.500" r="3.600" fill="#FFD84A"/><circle cx="30" cy="13.500" r="3.600" fill="#58D68D"/><circle cx="36.500" cy="21.500" r="3.600" fill="#4CC3FF"/>`,
    tophat: `<rect x="14" y="8" width="20" height="24" rx="3.500" fill="currentColor"/><rect x="5" y="30" width="38" height="8" rx="4" fill="currentColor"/><rect class="a" x="14" y="24" width="20" height="5"/>`,
    glasses: `<circle cx="13.500" cy="27" r="8.500" ${line(4.5)}/><circle cx="34.500" cy="27" r="8.500" ${line(4.5)}/><path d="M22 26q2-2.500 4 0M5.500 23l-1.500-7M42.500 23l1.500-7" ${line(4.5)}/>`,
    balloon: `<ellipse cx="24" cy="18" rx="13.500" ry="15.500" fill="currentColor"/><path d="M20.500 33h7l-3.500-4z" fill="currentColor"/><path d="M24 34q-5 5 0 11" ${line(3)}/><path d="M17 13a8 8 0 0 1 5.500-5" fill="none" stroke="var(--ia)" stroke-width="3.500" stroke-linecap="round"/>`,

    /* ---- areas ---- */
    literacy: text('A', 40, 38),
    stem: `<path d="M19 6h10M21 6v12L9 37a4 4 0 0 0 4 6h22a4 4 0 0 0 4-6L27 18V6z" fill="currentColor" ${soft}/><path class="a" d="M15 32h18l3.4 6a2 2 0 0 1-1.8 3H13.4a2 2 0 0 1-1.8-3z"/>`,
    life: `<path d="M24 42C8 31 4 19 11 12c5-4.5 11-2.5 13 3 2-5.500 8-7.500 13-3 7 7 3 19-13 30z" fill="currentColor"/><g class="a"><circle cx="18" cy="21" r="2.5"/><circle cx="30" cy="21" r="2.500"/></g><path d="M18 27q6 6 12 0" fill="none" stroke="var(--ia)" stroke-width="3" stroke-linecap="round"/>`,
    playtime: `<circle cx="24" cy="24" r="18" fill="currentColor"/><path class="a" transform="translate(11.5 11) scale(.52)" d="${STAR}"/>`,

    /* ---- subjects (named by module id) ---- */
    letters: text('Aa', 27, 34),
    words: `<path d="M8 13a7 7 0 0 1 7-7h18a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7H23l-9 8v-8a7 7 0 0 1-6-7z" fill="currentColor"/><g class="a"><circle cx="17" cy="19.500" r="2.800"/><circle cx="24" cy="19.500" r="2.800"/><circle cx="31" cy="19.500" r="2.800"/></g>`,
    sayit: `<rect x="17" y="5" width="14" height="25" rx="7" fill="currentColor"/><path d="M10.5 22a13.5 13.5 0 0 0 27 0M24 36v7" ${line(4.5)}/><path d="M21 12v8" fill="none" stroke="var(--ia)" stroke-width="3" stroke-linecap="round"/>`,
    stories: `<path d="M9 9a4 4 0 0 1 4-4h25v31H13a4 4 0 0 0-4 4z" fill="currentColor"/><path class="a" d="M9 40a4 4 0 0 1 4-4h25v7H13a4 4 0 0 1-4-3z"/><path class="a" transform="translate(13 8) scale(.46)" d="${STAR}"/>`,
    numbers: text('123', 22, 32),
    shapes: `<circle cx="15" cy="15" r="9.500" fill="currentColor"/><rect x="26" y="26" width="16" height="16" rx="4" fill="currentColor"/><path class="a" d="M33 7l9 15H24z" stroke="var(--ia)" stroke-width="2" stroke-linejoin="round"/><path d="M6 42l8.500-15 8.500 15z" fill="currentColor" ${soft}/>`,
    science: `<path d="M19 6h10M21 6v12L9 37a4 4 0 0 0 4 6h22a4 4 0 0 0 4-6L27 18V6z" fill="currentColor" ${soft}/><path class="a" d="M15 32h18l3.4 6a2 2 0 0 1-1.8 3H13.4a2 2 0 0 1-1.8-3z"/><circle class="a" cx="24" cy="25" r="2"/>`,
    feelings: `<path d="M24 42C8 31 4 19 11 12c5-4.5 11-2.5 13 3 2-5.500 8-7.500 13-3 7 7 3 19-13 30z" fill="currentColor"/><g class="a"><circle cx="18" cy="21" r="2.500"/><circle cx="30" cy="21" r="2.500"/></g><path d="M18 27q6 6 12 0" fill="none" stroke="var(--ia)" stroke-width="3" stroke-linecap="round"/>`,
    habits: `<path d="M24 4c8.500 11 13.500 17.500 13.500 24.500a13.500 13.500 0 0 1-27 0C10.500 21.500 15.500 15 24 4z" fill="currentColor"/><path d="M16.500 29a8 8 0 0 0 6.500 7.500" fill="none" stroke="var(--ia)" stroke-width="3.500" stroke-linecap="round"/>`,
    planet: `<circle cx="24" cy="24" r="18.500" fill="currentColor"/><path class="a" d="M13 14c4-3.500 10-2.500 11 1.500s-3 5-5 8-6.500 1-7.500-3 0-4.500 1.500-6.500zM27 27c4-2 8.500 0 8.500 4s-4 7-7 6-4.500-8-1.500-10z"/>`,
    maze: `<path d="M8 8h32v32H15V16h17v16H23v-8" ${line(5.5)}/>`,
    coding: `<path d="M16 14 L6 24 L16 34 M32 14 L42 24 L32 34" ${line(5.5)}/><path d="M27.500 9 L20.500 39" ${line(4.5)}/>`,
    memory: `<rect x="6" y="13" width="20" height="27" rx="5.500" transform="rotate(-10 16 26)" fill="currentColor" opacity=".55"/><rect x="20" y="8" width="22" height="30" rx="5.500" fill="currentColor"/><path class="a" transform="translate(21.500 13.500) scale(.4)" d="${STAR}"/>`,
    songs: `<path d="M19 34V10l20-4.500v24" ${line(5.5)}/><ellipse cx="14" cy="35" rx="7" ry="5.800" fill="currentColor"/><ellipse cx="34" cy="31" rx="7" ry="5.800" fill="currentColor"/>`
  };

  /* Painted versions (art/ui, art/subj) from the mock-up sheets.
     Where one exists it replaces the drawn glyph; the glyphs above
     stay for everything that has no painting. */
  const PAINT = {
    back: 'ui/back', home: 'ui/home', settings: 'ui/settings', help: 'ui/help', sound: 'ui/sound', mic: 'ui/mic',
    play: 'ui/play', retry: 'ui/retry', close: 'ui/close', check: 'ui/check', lock: 'ui/lock', star: 'ui/star',
    paw: 'ui/paw', clock: 'ui/clock', dice: 'ui/dice', hint: 'ui/bulb-glow',
    letters: 'subj/letters', words: 'subj/words', sayit: 'subj/sayit', stories: 'subj/stories', numbers: 'subj/numbers',
    shapes: 'subj/shapes', science: 'subj/science', coding: 'subj/coding', feelings: 'subj/feelings', habits: 'subj/habits',
    planet: 'subj/planet', maze: 'subj/maze', memory: 'subj/memory', songs: 'subj/songs',
    phonics: 'subj/letters', english: 'subj/words', math: 'subj/numbers', bahasa: 'subj/bahasa',
    literacy: 'subj/letters', stem: 'subj/numbers', life: 'subj/feelings', playtime: 'subj/maze',
    right: 'ui/pad-right', down: 'ui/pad-down', up: 'ui/pad-up', map: 'ui/map', next: 'ui/next',
    pause: 'ui/pause', trophy: 'ui/trophy', thumbs: 'ui/thumbs', drum: 'prop/play-drum', heart: 'ui/heart'
  };
  /* the four arrow pads and the light bulb in the maze and coding games */
  const PAD = { up: 'ui/pad-up', down: 'ui/pad-down', back: 'ui/pad-left', right: 'ui/pad-right', hint: 'ui/pad-hint', retry: 'ui/retry' };
  /* If a painting cannot be loaded, the drawn glyph comes back, so a
     button is never left blank. */
  const pic = (src) => `<img class="pic" src="art/${src}.webp" alt="" draggable="false" onerror="AF.Icon.unpaint(this)">`;

  /* Learning pictures that exist as paintings. Anything else stays an emoji. */
  const EMOJI = {
    // animals
    '🐱': 'pic/cat', '🐶': 'pic/dog', '🦁': 'pic/lion', '🐰': 'pic/rabbit', '🐝': 'pic/bee', '🐐': 'pic/goat',
    '🐟': 'pic/fish', '🐠': 'pic/fish', '🐻': 'char/bear-idle', '🦊': 'char/fox-idle', '🐸': 'char/frog-idle',
    '🐧': 'char/penguin-idle', '🐥': 'char/chick-idle', '🐤': 'char/chick-idle', '🐼': 'char/panda-idle',
    '🦖': 'char/dino-idle', '🦕': 'char/dino-idle', '🦋': 'prop/heart-butterfly',
    // fruit and food
    '🍎': 'pic/apple', '🍌': 'pic/banana', '🍊': 'pic/orange', '🍇': 'pic/grapes', '🍓': 'pic/strawberry',
    '🍉': 'pic/watermelon', '🍍': 'pic/pineapple', '🍐': 'pic/pear', '🍒': 'pic/cherry', '🍋': 'pic/lemon',
    '🥭': 'pic/mango', '🥝': 'pic/kiwi', '🍑': 'pic/peach', '🫐': 'pic/blueberry', '🥥': 'pic/coconut',
    '🥚': 'pic/egg', '🍦': 'pic/icecream',
    // things
    '🔑': 'pic/key', '🎩': 'pic/tophat', '👃': 'pic/nose', '🌙': 'pic/moon', '☀️': 'pic/sun', '🌞': 'pic/sun',
    '🌳': 'pic/tree', '🌲': 'pic/tree', '⭐': 'ui/star', '🌟': 'ui/star', '❤️': 'ui/heart', '💗': 'ui/heart', '💛': 'ui/heart',
    '📖': 'wear/book', '📚': 'prop/abc-books', '✏️': 'prop/abc-pencil', '🖍️': 'prop/abc-crayons', '🚂': 'pic/steam-train',
    '🚌': 'pic/bus', '🔤': 'subj/letters', '🔢': 'subj/numbers', '🧱': 'prop/abc-blocks',
    '🔬': 'prop/stem-microscope', '🔭': 'prop/stem-telescope', '🔍': 'prop/stem-magnifier', '🔎': 'prop/stem-magnifier',
    '🌋': 'prop/stem-volcano', '🚀': 'prop/stem-rocket', '⚙️': 'prop/stem-gears', '💡': 'prop/stem-bulb',
    '🧮': 'prop/stem-abacus', '📏': 'prop/stem-ruler', '🧪': 'prop/stem-tubes', '🌍': 'prop/stem-globe', '🌎': 'prop/stem-globe',
    '🌈': 'prop/heart-rainbow', '🪁': 'prop/heart-kite', '🎈': 'wear/balloon', '🪴': 'pic/potted-plant',
    '🥁': 'prop/play-drum', '🎸': 'prop/play-guitar', '🎤': 'prop/play-mic', '🎵': 'prop/play-note', '🎶': 'prop/play-note',
    '🏆': 'ui/trophy', '🥇': 'ui/medal', '👍': 'ui/thumbs', '✨': 'ui/sparkle', '🧩': 'game/puzzle', '🪙': 'game/coin',
    '🏠': 'world/house', '🏡': 'world/house', '👑': 'wear/crown', '🧢': 'wear/cap', '🧣': 'wear/scarf', '🎒': 'wear/backpack',
    '🎮': 'wear/gamepad', '🎲': 'ui/dice', '⏰': 'ui/clock', '🕒': 'ui/clock', '🌴': 'world/palm', '🌸': 'world/flowers',
    '🌼': 'world/flowers', '🚩': 'world/flag', '🏁': 'prop/play-flag', '🪨': 'world/rock', '👓': 'wear/glasses',
    '🕶️': 'wear/sunglasses', '🎀': 'wear/bow', '🔒': 'ui/lock', '🐾': 'ui/paw',
    // game-needs batch: faces, body, clothes, jobs, kind choices, washing, colours
    '😠': 'pic/face-angry', '😃': 'pic/face-awake', '😁': 'pic/face-smile-big', '😑': 'pic/face-bored', '😬': 'pic/face-brushing',
    '😛': 'pic/face-tongue', '🤩': 'pic/face-excited', '🙄': 'pic/face-eyeroll', '😤': 'pic/face-huffing', '😀': 'pic/face-happy',
    '😊': 'pic/face-gentle', '🤗': 'pic/face-hug', '🤕': 'pic/face-hurt', '😆': 'pic/face-laugh', '🥺': 'pic/face-leftout',
    '😌': 'pic/face-proud', '😶': 'pic/face-quiet', '😢': 'pic/face-sad', '😨': 'pic/face-scared', '🤫': 'pic/face-shh',
    '😳': 'pic/face-shy', '🤒': 'pic/face-sick', '😜': 'pic/face-wink', '😴': 'pic/face-sleepy', '🙂': 'pic/face-slight',
    '🤧': 'pic/face-sneeze', '😲': 'pic/face-surprised', '😝': 'pic/face-teasing', '🤔': 'pic/face-thinking', '🥶': 'pic/face-cold',
    '🥵': 'pic/face-hot', '😟': 'pic/face-worried', '🥱': 'pic/face-yawn', '😋': 'pic/face-yummy', '🤐': 'pic/face-zip',
    '😐': 'pic/face-calm', '👂': 'pic/ear', '👁️': 'pic/eye', '🦶': 'pic/foot', '🦵': 'pic/leg',
    '✋': 'pic/hand', '👄': 'pic/mouth', '💪': 'pic/arm', '👅': 'pic/tongue', '🦷': 'pic/tooth',
    '⛑️': 'pic/helmet', '🧥': 'pic/coat', '👗': 'pic/dress', '🧤': 'pic/gloves', '👟': 'pic/sneaker',
    '🧦': 'pic/socks', '👕': 'pic/tshirt', '👖': 'pic/trousers', '🧑‍🎨': 'pic/job-artist', '🧑‍🚀': 'pic/job-astronaut',
    '🧒': 'pic/job-child', '🧑‍🍳': 'pic/job-cook', '🧑‍⚕️': 'pic/job-doctor', '🧑‍🌾': 'pic/job-farmer', '🧑‍🚒': 'pic/job-firefighter',
    '👧': 'pic/job-girl', '👨': 'pic/job-man', '🧑‍✈️': 'pic/job-pilot', '🧑‍💼': 'pic/job-shophelper', '🧑‍🏫': 'pic/job-teacher',
    '💔': 'pic/act-brokenheart', '👏': 'pic/act-clap', '💥': 'pic/act-crash', '👆': 'pic/act-touch', '💐': 'pic/act-flowers',
    '✊': 'pic/act-grab', '🙋': 'pic/act-handup', '🤝': 'pic/act-share', '🙈': 'pic/act-hide', '👊': 'pic/act-hit',
    '🤸': 'pic/act-jump', '🚫': 'pic/act-leftout', '👀': 'pic/act-look', '🤲': 'pic/act-please', '🏃': 'pic/act-run',
    '👐': 'pic/act-scrub', '🖐️': 'pic/act-stophand', '🙅': 'pic/act-no', '🛑': 'pic/act-stop', '🗣️': 'pic/act-talk',
    '🙏': 'pic/act-thanks', '👎': 'pic/act-thumbsdown', '🚶': 'pic/act-walkaway', '👋': 'pic/act-wave', '🛁': 'pic/bath',
    '♻️': 'pic/recycle', '🚿': 'pic/shower', '🧼': 'pic/soap', '🚰': 'pic/tap', '🪥': 'pic/toothbrush',
    '🧻': 'pic/towel', '🔵': 'pic/ball-blue', '🟢': 'pic/ball-green', '🟩': 'pic/tile-green', '🟠': 'pic/ball-orange',
    '🟧': 'pic/tile-orange', '🟣': 'pic/ball-purple', '🟪': 'pic/tile-purple', '🔴': 'pic/ball-red', '🟡': 'pic/ball-yellow',
    '⬇️': 'pic/arrow-down', '❓': 'pic/question', '⬆️': 'pic/arrow-up', '💙': 'pic/heart-blue',
    // 2026-10 sheets (interface/ASSET_SHEETS.md, cut by tools/art/cut.py)
    '🐇': 'pic/rabbit-running', '🐍': 'pic/snake', '🐑': 'pic/sheep', '🐓': 'pic/rooster', '🐔': 'pic/hen',
    '🐘': 'pic/elephant', '🐙': 'pic/octopus', '🐛': 'pic/caterpillar', '🐜': 'pic/ant', '🐞': 'pic/ladybird',
    '🐢': 'pic/turtle', '🐣': 'pic/chick-hatching-from-an-egg', '🐦': 'pic/bird', '🐪': 'pic/camel', '🐬': 'pic/dolphin',
    '🐭': 'pic/mouse', '🐮': 'pic/cow', '🐳': 'pic/whale', '🐴': 'pic/horse', '🐵': 'pic/monkey',
    '🐷': 'pic/pig', '🐿': 'pic/squirrel', '🦂': 'pic/scorpion', '🦅': 'pic/eagle', '🦆': 'pic/duck',
    '🦇': 'pic/bat', '🦈': 'pic/friendly-shark', '🦉': 'pic/owl', '🦌': 'pic/reindeer', '🦒': 'pic/giraffe',
    '🧸': 'pic/teddy-bear', '☕': 'pic/cup-of-hot-cocoa', '🌽': 'pic/corn-cob', '🍕': 'pic/slice-of-pizza', '🍚': 'pic/bowl-of-rice',
    '🍞': 'pic/loaf-of-bread', '🍟': 'pic/chips', '🍩': 'pic/doughnut', '🍪': 'pic/biscuit', '🍬': 'pic/sweets',
    '🍯': 'pic/honey-jar', '🍰': 'pic/slice-of-cake', '🍲': 'pic/pot-of-soup', '🍳': 'pic/frying-pan-with-an-egg', '🍽': 'pic/plate-with-knife-and-fork',
    '🥄': 'pic/spoon', '🥒': 'pic/cucumber', '🥕': 'pic/carrot', '🥛': 'pic/glass-of-milk', '🥣': 'pic/bowl-of-breakfast-cereal',
    '🥤': 'pic/fizzy-drink-cup-with-straw', '🥦': 'pic/broccoli', '🥪': 'pic/sandwich', '🥫': 'pic/tin-can', '🧀': 'pic/cheese',
    '🌰': 'pic/seed', '🌱': 'pic/little-sprout', '🌷': 'pic/tulip', '🌹': 'pic/red-rose', '🌻': 'pic/sunflower',
    '🌿': 'pic/green-plant', '🍁': 'pic/red-maple-leaf', '🍂': 'pic/autumn-leaves', '🍃': 'pic/green-leaves', '☁': 'pic/cloud',
    '☄': 'pic/comet', '⛄': 'pic/snowman', '⛈': 'pic/thunder-cloud-with-rain', '⛰': 'pic/mountain', '🌅': 'pic/sunrise-over-hills',
    '🌇': 'pic/sunset-over-a-town', '🌊': 'pic/water-wave', '🌜': 'pic/crescent-moon', '🌦': 'pic/sun-behind-a-rain-cloud', '🌧': 'pic/rain-cloud',
    '🌫': 'pic/fog-cloud', '🌬': 'pic/wind', '🎋': 'pic/bamboo', '🏔': 'pic/snowy-mountain', '🏖': 'pic/beach-with-umbrella',
    '🏜': 'pic/desert-with-cactus', '💦': 'pic/water-splash', '💧': 'pic/water-drop', '🔥': 'pic/campfire-flame', '🕳': 'pic/hole-in-the-ground',
    '⚓': 'pic/anchor', '⛵': 'pic/sailing-boat', '✈': 'pic/aeroplane', '🚁': 'pic/helicopter', '🚒': 'pic/fire-engine',
    '🚗': 'pic/car', '🚚': 'pic/truck', '🚦': 'pic/traffic-light', '🚲': 'pic/bicycle', '−': 'pic/minus-sign',
    '☂': 'pic/umbrella', '⚽': 'pic/football', '⛏': 'pic/spade-for-digging', '✂': 'pic/scissors', '✉': 'pic/envelope-letter',
    '❄': 'pic/snowflake', '🎁': 'pic/gift-box', '🎃': 'pic/pumpkin', '💊': 'pic/medicine-pill', '💎': 'pic/gem',
    '📄': 'pic/sheet-of-paper', '📌': 'pic/pin', '📕': 'pic/red-book', '📦': 'pic/cardboard-box', '📰': 'pic/newspaper',
    '📱': 'pic/phone', '📺': 'pic/television', '🔔': 'pic/bell', '🔨': 'pic/hammer', '🕯': 'pic/candle',
    '🖼': 'pic/framed-picture', '🗑': 'pic/rubbish-bin', '🗺': 'pic/treasure-map', '🛋': 'pic/sofa', '🛍': 'pic/plastic-shopping-bag',
    '🛏': 'pic/bed', '🛒': 'pic/shopping-trolley', '🤖': 'pic/toy-robot', '🥅': 'pic/goal-net', '🦴': 'pic/dog-bone',
    '🧰': 'pic/toy-box', '🧴': 'pic/sun-cream-bottle', '🧹': 'pic/broom', '🧺': 'pic/laundry-basket', '🧽': 'pic/sponge',
    '🪑': 'pic/chair', '🚪': 'pic/door', '🚯': 'pic/no-litter-sign', '⛸': 'pic/ice-skate', '⛺': 'pic/tent',
    '🏊': 'pic/child-swimming', '🏞': 'pic/lake-with-trees', '🏪': 'pic/small-shop', '🏫': 'pic/school-building', '🏬': 'pic/big-store',
    '🏭': 'pic/factory-with-smoke', '🏰': 'pic/sand-castle', '🐶🎁': 'pic/scene-happy-puppy-opening-gift', '🧸✋': 'pic/scene-angry-child-holding-teddy', '🍦💧': 'pic/scene-sad-ice-cream-dropped',
    '🌙🥱': 'pic/scene-sleepy-child-yawning-under', '🌧🏠': 'pic/scene-bored-child-looking-window', '🎈🎂': 'pic/scene-excited-birthday-cake-with', '🎉🎂': 'pic/scene-surprised-surprise-birthday-party', '👋🏠': 'pic/scene-sad-waving-goodbye-house',
    '👟✨': 'pic/scene-proud-child-tied-shoes', '🧱✨': 'pic/scene-happy-finished-tower-toy', '⏳': 'pic/sand-timer', '🅿': 'pic/car-park-sign', '🎉': 'pic/party-popper',
    '🏷': 'pic/name-tag', '💤': 'pic/zzz-sleeping', '📢': 'pic/loudspeaker'
  };

  const EMOJI_IN = '.opt-emoji, .big-e, .mem-e, .mz-item, .sort-e, .mt-e, .bin-e, .group i, .story-e, .slot-e, .say-pic, .build-pic, .pattern i, .tr-pic, .breath-e, .maze-hud span, .pop-b .opt-emoji, .pos i, .pg-row b';
  /* Every emoji inside a learning picture that has a painting is swapped
     for it, one by one, so a picture made of two emoji ("🐶🎁") gets
     both paintings, and an unpainted one stays as it is; unless the pair
     has a painting of its own (a scene: the puppy opening its gift). */
  const GRAPHEME = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|\p{Emoji_Modifier})*/gu;
  const look = (e) => EMOJI[e] || EMOJI[e.replace(/\uFE0F/g, '')] || EMOJI[e + '\uFE0F'];
  function emojiPics(root) {
    const list = root.querySelectorAll ? Array.from(root.querySelectorAll(EMOJI_IN)) : [];
    if (root.matches && root.matches(EMOJI_IN)) list.push(root);
    list.forEach(el => {
      if (el.children.length) return;
      const t = el.textContent;
      if (!t || !GRAPHEME.test(t)) return;
      GRAPHEME.lastIndex = 0;
      const scene = t.trim().length > 2 && look(t.trim());
      if (scene) { el.innerHTML = `<img class="emo scene" src="art/${scene}.webp" alt="${t.trim()}" draggable="false">`; return; }
      let hit = false;
      const html = t.replace(GRAPHEME, (e) => {
        const src = look(e);
        if (!src) return e;
        hit = true;
        return `<img class="emo" src="art/${src}.webp" alt="${e}" draggable="false" onerror="this.replaceWith('${e}')">`;
      });
      if (hit) el.innerHTML = html;
    });
  }


  function svg(name) {
    const g = G[name];
    return g ? `<svg class="ic" viewBox="0 0 48 48" aria-hidden="true">${g}</svg>` : '';
  }

  const Icon = {
    has(name) { return !!G[name]; },
    painted(name) { return PAINT[name] ? `art/${PAINT[name]}.webp` : ''; },
    svg: svg,

    /** A glossy squircle. Falls back to showing `alt` (an emoji) if
        there is no glyph by that name. */
    jelly(name, hue, cls, alt) {
      if (PAINT[name]) return `<span class="jelly painted ${cls || ''}" data-n="${name}" style="--h:${hue || '#3DA5F4'}">${pic(PAINT[name])}</span>`;
      return `<span class="jelly ${cls || ''}" style="--h:${hue || '#3DA5F4'}">${svg(name) || `<span class="jelly-alt">${alt || ''}</span>`}</span>`;
    },

    /** Fills in every [data-ic] element under `root`. */
    hydrate(root) {
      const list = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-ic]')) : [];
      if (root.matches && root.matches('[data-ic]')) list.push(root);
      list.forEach(el => {
        if (el._ic === el.dataset.ic) return;
        el._ic = el.dataset.ic;
        const old = el.querySelector(':scope > svg.ic, :scope > img.pic');
        if (old) old.remove();
        const isPad = el.classList.contains('pad') || el.classList.contains('pad-hint');
        // a small arrow inside a text button stays a plain glyph, and so do
        // the grown-up area's row icons (one calm, flat set there)
        const inText = (el.closest('.pill-go, .btn') && !el.classList.contains('painted-ok')) || el.classList.contains('g-ic');
        const p = isPad ? PAD[el.dataset.ic] : inText ? null : PAINT[el.dataset.ic];
        el.classList.toggle('painted', !!p);
        el.insertAdjacentHTML('afterbegin', p ? pic(p) : svg(el.dataset.ic));
      });
      emojiPics(root);
    },

    /** A painting failed to load: put the drawn glyph back. */
    unpaint(img) {
      const el = img.parentNode;
      if (!el) return;
      el.classList.remove('painted');
      img.outerHTML = svg(el.dataset.ic || el.dataset.n || '') || '';
    }
  };

  /* Games add buttons to the page long after boot, so watch for them. */
  function watch() {
    Icon.hydrate(document.body);
    new MutationObserver(muts => muts.forEach(m => {
      if (m.type === 'attributes') Icon.hydrate(m.target);
      else {
        m.addedNodes.forEach(n => { if (n.nodeType === 1) Icon.hydrate(n); });
        if (m.target.nodeType === 1) emojiPics(m.target);
      }
    })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ic'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();

  AF.Icon = Icon;
})(window.AF = window.AF || {});
