/* ============================================================
   content/bahasa.js — Bahasa Indonesia (Wink curriculum, 4 tahap)
   ------------------------------------------------------------
   Modelled on Wink (Danbi Education) Indonesia:
     Tahap 1  alfabet a–z             vokal, then the consonants in fours
     Tahap 2  suku kata terbuka       ba bi bu be bo ... words of two
                                      open syllables (bo-la, sa-pi)
     Tahap 3  suku kata lanjutan      akhiran n t s, ng, ny, ai au oi,
                                      kh sy
     Tahap 4  membaca kalimat         two-word phrases, "Ini ...",
                                      S-P-O sentences, building a
                                      sentence, a Si Kancil story
   Every lesson walks Wink's road: Kenal (fun learning) -> Tebalkan
   (tracing) -> Kuasai (mastery games), sometimes with a short Kuis.
   Each tahap ends with an Ulang (review) lesson.

   All of it is spoken by the device's Indonesian voice, so letter
   names are spelled out in `say` ("huruf be", not "huruf b").
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U, G = AF.Gen, PR = AF.Pairs, L = AF.lesson;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const mix = (...gens) => (ctx) => gens[ctx.round % gens.length](ctx);

  /* ---------------- Tahap 1: huruf ---------------- */

  /* How the letters are called (EYD) — what the voice says. */
  const NAME = { a: 'a', b: 'be', c: 'ce', d: 'de', e: 'e', f: 'ef', g: 'ge', h: 'ha', i: 'i', j: 'je', k: 'ka', l: 'el', m: 'em',
    n: 'en', o: 'o', p: 'pe', q: 'ki', r: 'er', s: 'es', t: 'te', u: 'u', v: 've', w: 'we', x: 'eks', y: 'ye', z: 'zet' };
  /* A word that starts with each letter, and its picture. q and x have
     no everyday children's word: they are taught as shapes only. */
  const ABC = {
    a: ['apel', '🍎'], b: ['bola', '⚽'], c: ['ceri', '🍒'], d: ['domba', '🐑'], e: ['elang', '🦅'], f: ['foto', '🖼️'],
    g: ['gajah', '🐘'], h: ['hidung', '👃'], i: ['ikan', '🐟'], j: ['jeruk', '🍊'], k: ['kucing', '🐱'], l: ['lampu', '💡'],
    m: ['mobil', '🚗'], n: ['nanas', '🍍'], o: ['ombak', '🌊'], p: ['pisang', '🍌'], r: ['rumah', '🏠'], s: ['sapi', '🐮'],
    t: ['topi', '🎩'], u: ['ular', '🐍'], v: ['vas', '🏺'], w: ['wortel', '🥕'], y: ['ya', '👍'], z: ['zebra', '🦓']
  };
  const SHAPE_NOTE = { q: 'Ekornya lurus ke bawah.', x: 'Bentuknya seperti tanda silang.' };
  const ALL = AF.ALPHABET;
  const PICTURED = ALL.filter(k => ABC[k]);

  const hurufCard = (k) => ABC[k]
    ? { big: k, pic: ABC[k][1], word: ABC[k][0], say: `Ini huruf ${NAME[k]}. ${cap(NAME[k])} untuk ${ABC[k][0]}.` }
    : { big: k, say: `Ini huruf ${NAME[k]}. ${SHAPE_NOTE[k]}` };

  const kenalHuruf = (keys) => ({ step: 'listen', type: 'intro', cards: keys.map(hurufCard) });

  const tebalHuruf = (keys) => ({
    step: 'trace', type: 'trace', kind: 'word', rounds: 3,
    set: keys.map(k => ({ w: k, e: ABC[k] ? ABC[k][1] : '', say: `Tebalkan huruf ${NAME[k]}.`, text: `Tebalkan huruf <b>${k}</b>`,
      praise: ABC[k] ? `${cap(NAME[k])}, ${ABC[k][0]}!` : `Huruf ${NAME[k]}. Hebat!` }))
  });

  /* hear a letter's name, tap it (the bubble does not give it away) */
  const HURUF_ASK = { say: k => `Mana huruf ${NAME[k]}?`, text: () => 'Mana huruf yang kamu <b>dengar</b>?', praise: k => `Pintar! Huruf ${NAME[k]}.` };
  const HURUF_POP = { say: k => `Pecahkan gelembung huruf ${NAME[k]}!`, text: () => 'Pecahkan huruf yang kamu <b>dengar</b>', praise: k => `Huruf ${NAME[k]}. Hebat!` };

  /** "Apel dimulai dengan huruf apa?" — see a picture, tap its first letter. */
  function awal(keys, pool) {
    let prev = null;
    return (ctx) => {
      const t = U.one(keys.filter(k => k !== prev));
      prev = t;
      const word = ABC[t][0];
      const others = U.pick(pool, 2 + (ctx.stretch ? 1 : 0), [t]);
      return {
        say: `${cap(word)}. ${cap(word)} dimulai dengan huruf apa?`, text: 'Dimulai dengan huruf <b>apa</b>?',
        show: `<span class="big-e">${ABC[t][1]}</span>`,
        options: U.shuffle([t].concat(others)).map(k => ({ key: k, glyph: k })),
        answer: t, praise: `${cap(NAME[t])}, ${word}!`
      };
    };
  }

  /* a letter and its picture, for match and memory */
  const hurufPairs = (keys) => keys.filter(k => ABC[k]).map(k => ({
    w: k, sayA: `huruf ${NAME[k]}`, sayB: ABC[k][0], a: { t: k }, b: { e: ABC[k][1] }, say: `${cap(NAME[k])}, ${ABC[k][0]}.`
  }));

  const pilihHuruf = (step, keys, rounds) => ({ step: step, type: 'choose', rounds: rounds || 3, gen: G.sight(keys, 3, HURUF_ASK) });
  const popHuruf = (keys) => ({ step: 'master', type: 'pop', rounds: 3, gen: G.sight(keys, 3, HURUF_POP) });
  const awalHuruf = (keys, pool) => ({ step: 'quiz', type: 'choose', rounds: 3, gen: awal(keys, pool) });

  /* ---------------- Tahap 2–3: suku kata ---------------- */

  /* a row of syllables in the five colours the letter cards use (.syl in engines.css) */
  const sy = (list) => `<span class="syl big">${list.map(s => `<b>${U.esc(s)}</b>`).join('')}</span>`;
  const baris = (list, say) => ({ show: sy(list), say: say });
  /** a word card: "bo-la", the picture, "Bo, la. Bola." */
  const kata = (w, parts, e, more) => ({
    big: parts.join('-'), pic: e, word: w, say: `${cap(parts.join(', '))}. ${cap(w)}.${more ? ' ' + more : ''}`
  });
  const W = (w, parts, e) => ({ w: w, parts: parts, e: e });

  /** trace syllables: [syllable, picture?, word?] */
  const tebalSuku = (list) => ({
    step: 'trace', type: 'trace', kind: 'word', rounds: 2,
    set: list.map(x => ({ w: x[0], e: x[1] || '', say: `Tebalkan ${x[0]}.`, text: `Tebalkan <b>${x[0]}</b>`,
      praise: x[2] && x[2] !== x[0] ? `${cap(x[0])}, ${x[2]}!` : `${cap(x[0])}! Hebat!` }))
  });
  const susunKata = (words, pool) => ({ step: 'master', type: 'build', rounds: 3, extra: 1, words: words, pool: pool });

  const SUKU_ASK = { say: t => `Mana ${t}?`, text: () => 'Mana yang kamu <b>dengar</b>?', praise: t => `${cap(t)}. Pintar!` };
  const SUKU_POP = { say: t => `Pecahkan gelembung ${t}!`, text: () => 'Pecahkan yang kamu <b>dengar</b>', praise: t => `${cap(t)}. Hebat!` };
  const BACA_ASK = { say: () => 'Gambar apa ini? Pilih katanya.', text: () => 'Gambar apa ini? Pilih <b>katanya</b>', praise: w => `${cap(w)}. Hebat!` };
  const CARI_ASK = { say: w => `Mana ${w}?`, text: w => `Mana <b>${w}</b>?`, praise: w => `${cap(w)}!` };
  const CARI_POP = { say: w => `Pecahkan gelembung ${w}!`, text: w => `Pecahkan <b>${w}</b>!`, praise: w => `${cap(w)}. Hebat!` };

  const pilihSuku = (list) => ({ step: 'quiz', type: 'choose', rounds: 3, gen: G.sight(list, 3, SUKU_ASK) });
  const popSuku = (list) => ({ step: 'quiz', type: 'pop', rounds: 3, gen: G.sight(list, 3, SUKU_POP) });
  const bacaKata = (words) => ({ step: 'quiz', type: 'choose', rounds: 3, gen: G.read(words, 3, BACA_ASK) });

  const KV = (c) => ['a', 'i', 'u', 'e', 'o'].map(v => c + v);

  const T2 = {
    b: [W('bola', ['bo', 'la'], '⚽'), W('buku', ['bu', 'ku'], '📖'), W('batu', ['ba', 'tu'], '🪨'), W('baju', ['ba', 'ju'], '👕'), W('ibu', ['i', 'bu'], '👩')],
    cd: [W('ceri', ['ce', 'ri'], '🍒'), W('dadu', ['da', 'du'], '🎲'), W('dasi', ['da', 'si'], '👔'), W('kado', ['ka', 'do'], '🎁')],
    km: [W('kaki', ['ka', 'ki'], '🦶'), W('kuda', ['ku', 'da'], '🐴'), W('mata', ['ma', 'ta'], '👁️'), W('madu', ['ma', 'du'], '🍯'), W('kelapa', ['ke', 'la', 'pa'], '🥥')],
    np: [W('nasi', ['na', 'si'], '🍚'), W('nada', ['na', 'da'], '🎵'), W('pita', ['pi', 'ta'], '🎀'), W('palu', ['pa', 'lu'], '🔨')],
    st: [W('sapi', ['sa', 'pi'], '🐮'), W('sapu', ['sa', 'pu'], '🧹'), W('susu', ['su', 'su'], '🥛'), W('topi', ['to', 'pi'], '🎩'), W('sepatu', ['se', 'pa', 'tu'], '👟')],
    lain: [W('gigi', ['gi', 'gi'], '🦷'), W('guru', ['gu', 'ru'], '🧑‍🏫'), W('hati', ['ha', 'ti'], '❤️'), W('roti', ['ro', 'ti'], '🍞'), W('labu', ['la', 'bu'], '🎃'), W('bayi', ['ba', 'yi'], '👶')]
  };
  const T2_ALL = [].concat(T2.b, T2.cd, T2.km, T2.np, T2.st, T2.lain);
  const T2_SUKU = [].concat(KV('b'), KV('c'), KV('d'), KV('k'), KV('m'), KV('n'), KV('p'), KV('s'), KV('t'), ['ga', 'ha', 'ja', 'la', 'ra', 'wa', 'ya']);

  const T3 = {
    akhir: [W('ikan', ['i', 'kan'], '🐟'), W('bulan', ['bu', 'lan'], '🌙'), W('hujan', ['hu', 'jan'], '🌧️'), W('semut', ['se', 'mut'], '🐜'),
      W('obat', ['o', 'bat'], '💊'), W('tomat', ['to', 'mat'], '🍅'), W('nanas', ['na', 'nas'], '🍍')],
    ng: [W('bunga', ['bu', 'nga'], '🌸'), W('singa', ['si', 'nga'], '🦁'), W('jagung', ['ja', 'gung'], '🌽'), W('payung', ['pa', 'yung'], '☂️'),
      W('hidung', ['hi', 'dung'], '👃'), W('kucing', ['ku', 'cing'], '🐱'), W('pisang', ['pi', 'sang'], '🍌')],
    ny: [W('monyet', ['mo', 'nyet'], '🐵'), W('penyu', ['pe', 'nyu'], '🐢'), W('nyanyi', ['nya', 'nyi'], '🎤'), W('nyamuk', ['nya', 'muk'], '🦟'),
      W('kenyang', ['ke', 'nyang'], '😋')],
    ai: [W('pantai', ['pan', 'tai'], '🏖️'), W('tupai', ['tu', 'pai'], '🐿️'), W('cabai', ['ca', 'bai'], '🌶️'), W('danau', ['da', 'nau'], '🏞️'),
      W('kerbau', ['ker', 'bau'], '🐃'), W('harimau', ['ha', 'ri', 'mau'], '🐯')],
    khsy: [W('akhir', ['a', 'khir'], '🏁'), W('khawatir', ['kha', 'wa', 'tir'], '😟'), W('asyik', ['a', 'syik'], '🤩')]
  };
  const SYAL = { w: 'syal', e: '🧣' };
  /* more words that end in n, t or s, for the "last letter" game */
  const AKHIR_WORDS = T3.akhir.concat([{ w: 'tas', e: '🎒' }, { w: 'bus', e: '🚌' }, { w: 'awan', e: '☁️' }]);
  const T3_ALL = [].concat(T3.akhir, T3.ng, T3.ny, T3.ai, [W('koboi', ['ko', 'boi'], '🤠')], T3.khsy, [SYAL]);

  /** "Ikan. Huruf terakhirnya apa?" — n, t or s. */
  function akhiran(words) {
    let prev = null;
    return () => {
      const t = U.one(words.filter(x => x !== prev));
      prev = t;
      const end = t.w.slice(-1);
      return {
        say: `${cap(t.w)}. Huruf terakhirnya apa?`, text: 'Huruf <b>terakhir</b>nya apa?',
        show: `<span class="big-e">${t.e}</span>`,
        options: U.shuffle(['n', 't', 's']).map(k => ({ key: k, glyph: k })),
        answer: end, praise: `${cap(t.w)}. Huruf terakhirnya ${NAME[end]}.`
      };
    };
  }

  /* ---------------- Tahap 4: kalimat ---------------- */

  /** a phrase or sentence in big type, one colour per word (word gaps are easy to see) */
  const kal = (s, small) => `<span class="syl${small ? ' small' : ''}">${s.split(' ').map(w => `<b>${U.esc(w)}</b>`).join(' ')}</span>`;
  const tebalKata = (list) => ({
    step: 'trace', type: 'trace', kind: 'word', rounds: 2,
    set: list.map(x => ({ w: x[0], e: x[1] || '', say: `Tebalkan kata, ${x[0]}.`, text: `Tebalkan <b>${x[0]}</b>`, praise: `${cap(x[0])}! Hebat!` }))
  });

  const FRASA = [{ w: 'apel merah', e: '🍎' }, { w: 'pisang kuning', e: '🍌' }, { w: 'daun hijau', e: '🍃' },
    { w: 'gajah besar', e: '🐘' }, { w: 'semut kecil', e: '🐜' }];
  const BOLA = [{ w: 'bola merah', e: '🔴' }, { w: 'bola biru', e: '🔵' }, { w: 'bola kuning', e: '🟡' },
    { w: 'bola hijau', e: '🟢' }, { w: 'bola ungu', e: '🟣' }];
  const INI = [['bola', '⚽'], ['buku', '📖'], ['topi', '🎩'], ['kucing', '🐱'], ['ikan', '🐟'], ['rumah', '🏠'], ['apel', '🍎'], ['mobil', '🚗']];
  const INI_W = INI.map(x => ({ w: `Ini ${x[0]}.`, e: x[1] }));
  const INI_ASK = { say: () => 'Ini apa? Pilih kalimatnya.', text: () => 'Ini apa? Pilih <b>kalimatnya</b>', praise: w => w };
  const FRASA_ASK = { say: () => 'Gambar apa ini? Pilih tulisannya.', text: () => 'Gambar apa ini? Pilih <b>tulisannya</b>', praise: w => `${cap(w)}!` };

  /** "Ini ikan. Betul atau tidak?" */
  function betul() {
    let prev = null;
    return () => {
      const t = U.one(INI.filter(x => x !== prev));
      prev = t;
      const yes = Math.random() < 0.5;
      const named = yes ? t : U.one(INI.filter(x => x !== t));
      const s = `Ini ${named[0]}.`;
      return {
        say: `${s} Betul atau tidak?`, text: `<b>${s}</b> Betul atau tidak?`,
        show: `<span class="big-e">${t[1]}</span>`,
        options: [{ key: 'ya', emoji: '👍', label: 'Betul' }, { key: 'tidak', emoji: '👎', label: 'Tidak' }],
        answer: yes ? 'ya' : 'tidak', praise: yes ? `Betul! Ini ${t[0]}.` : `Ini bukan ${named[0]}. Ini ${t[0]}.`
      };
    };
  }

  /** read a sentence, then answer a question about it */
  const tanya = (s, q, qText, opts, praise) => ({
    say: `${s} ${q}`, text: qText, show: kal(s, true),
    options: opts.map(o => ({ key: o[0], emoji: o[1], label: o[0] })), answer: opts[0][0], praise: praise || s
  });
  const TANYA = [
    tanya('Adik makan nasi.', 'Adik makan apa?', 'Adik makan <b>apa</b>?', [['nasi', '🍚'], ['roti', '🍞'], ['pisang', '🍌']]),
    tanya('Kucing minum susu.', 'Kucing minum apa?', 'Kucing minum <b>apa</b>?', [['susu', '🥛'], ['apel', '🍎'], ['roti', '🍞']]),
    tanya('Kakak membaca buku.', 'Kakak membaca apa?', 'Kakak membaca <b>apa</b>?', [['buku', '📖'], ['bola', '⚽'], ['topi', '🎩']]),
    tanya('Ayah naik sepeda.', 'Ayah naik apa?', 'Ayah naik <b>apa</b>?', [['sepeda', '🚲'], ['mobil', '🚗'], ['bus', '🚌']]),
    tanya('Ibu memasak nasi.', 'Siapa yang memasak?', '<b>Siapa</b> yang memasak?', [['ibu', '👩'], ['ayah', '👨'], ['adik', '🧒']], 'Ibu yang memasak.'),
    tanya('Adik bermain bola.', 'Siapa yang bermain bola?', '<b>Siapa</b> yang bermain bola?', [['adik', '🧒'], ['ibu', '👩'], ['ayah', '👨']], 'Adik yang bermain bola.')
  ];

  /** tap the words in order: "Adik" "makan" "nasi." */
  const susun = (s) => ({
    say: `Ayo susun: ${s}`, text: `Susun: <b>${s}</b>`,
    steps: s.split(' ').map(w => ({ glyph: w, say: w.replace(/[.!?,]/g, '') })),
    praise: `${s} Hebat!`
  });

  /* Si Kancil dan Buaya: a gentle retelling of the folk tale */
  const KANCIL = [
    { art: '🦌 🌳', bg: '#E3F4D7', text: 'Ini Si Kancil. Kancil tinggal di hutan. Badannya kecil, tetapi Kancil cerdik.' },
    { art: '🦌 🌊 🥭', bg: '#DFF1FF', text: 'Kancil lapar. Di seberang sungai ada pohon mangga. Tetapi Kancil tidak bisa berenang.' },
    { art: '🐊 🐊 🐊', bg: '#CFE9FF', text: 'Di sungai ada banyak buaya. Buaya itu juga lapar. Kancil pun berpikir.' },
    { art: '🦌 💡 🐊', bg: '#FFF1CF', text: 'Kancil berkata, "Buaya, ada pesta untuk kalian! Ayo berbaris. Aku hitung dulu, ya."' },
    { art: '🐊 🐊 🦌 🐊 🐊', bg: '#CFE9FF', text: 'Buaya berbaris di sungai. Kancil melompat di atas punggung buaya. Satu, dua, tiga, empat!' },
    { art: '🦌 🥭 🌳', bg: '#E3F4D7', text: 'Hup! Kancil sampai di seberang. "Terima kasih, Buaya!" Kancil makan mangga. Kancil memang cerdik.' }
  ];
  const opt = (key, emoji, label) => ({ key: key, emoji: emoji, label: label });
  const KANCIL_QUIZ = [
    { say: 'Siapa yang tinggal di sungai?', text: '<b>Siapa</b> yang tinggal di sungai?',
      options: [opt('gajah', '🐘', 'gajah'), opt('buaya', '🐊', 'buaya'), opt('kucing', '🐱', 'kucing')], answer: 'buaya', praise: 'Buaya tinggal di sungai.' },
    { say: 'Kancil ingin makan apa?', text: 'Kancil ingin makan <b>apa</b>?',
      options: [opt('mangga', '🥭', 'mangga'), opt('nasi', '🍚', 'nasi'), opt('wortel', '🥕', 'wortel')], answer: 'mangga', praise: 'Kancil ingin makan mangga.' },
    { say: 'Kancil menghitung buaya. Ada berapa buaya?', text: 'Ada <b>berapa</b> buaya?',
      options: [{ key: 3, glyph: '3' }, { key: 4, glyph: '4' }, { key: 5, glyph: '5' }], answer: 4, praise: 'Satu, dua, tiga, empat. Empat buaya!' },
    { say: 'Bagaimana Kancil menyeberang sungai?', text: '<b>Bagaimana</b> Kancil menyeberang?',
      options: [opt('perahu', '⛵', 'naik perahu'), opt('berenang', '🏊', 'berenang'), opt('melompat', '🐊', 'melompat')], answer: 'melompat',
      praise: 'Kancil melompat di atas punggung buaya.' }
  ];

  /* ---------------- the lessons ---------------- */

  const ulang = (id, gen, pairs) => L(id, 'Ulang', [
    { step: 'review', type: 'choose', rounds: 6, gen: gen },
    { step: 'play', type: 'memory', n: 4, pairs: pairs, peek: true }
  ], { review: true });

  AF.register({
    id: 'bahasa', area: 'literacy', core: 4, lang: 'id',
    title: 'Bahasa Indonesia', icon: '🇮🇩', colour: '#E5484D',
    blurb: 'Huruf, suku kata, kalimat',
    skill: 'Reading Bahasa Indonesia: letters, syllables, words, sentences',
    tip: 'Clap out the syllables of everyday words together (sa-pi, bo-la, ma-ta). Out and about, point at a sign or a food packet, read it slowly syllable by syllable, and let your child find the first letter.',
    stages: ['Tahap 1', 'Tahap 2', 'Tahap 3', 'Tahap 4'],
    stageCrumbs: ['Huruf a–z', 'Suku kata', 'Suku kata lanjutan', 'Membaca kalimat'],
    topics: { vokal: 'Huruf vokal', konsonan: 'Huruf konsonan', suku: 'Suku kata', lanjut: 'ng, ny, ai, au…', kalimat: 'Membaca kalimat' },
    levels: AF.tiers([
      /* ---- Tahap 1: huruf a–z ---- */
      L('bi1-1', 'Vokal a i u e o', [
        kenalHuruf(['a', 'i', 'u', 'e', 'o']),
        tebalHuruf(['a', 'i', 'u', 'e', 'o']),
        pilihHuruf('master', ['a', 'i', 'u', 'e', 'o'], 4)
      ], { topic: 'vokal', say: 'Ayo kenalan dengan huruf vokal: a, i, u, e, o!' }),
      L('bi1-2', 'b c d f', [
        kenalHuruf(['b', 'c', 'd', 'f']),
        tebalHuruf(['b', 'c', 'd', 'f']),
        pilihHuruf('master', ['b', 'c', 'd', 'f']),
        awalHuruf(['b', 'c', 'd', 'f'], ['b', 'c', 'd', 'f'])
      ], { topic: 'konsonan', say: 'Ayo kenalan dengan huruf be, ce, de, dan ef!' }),
      L('bi1-3', 'g h j k', [
        kenalHuruf(['g', 'h', 'j', 'k']),
        tebalHuruf(['g', 'h', 'j', 'k']),
        popHuruf(['g', 'h', 'j', 'k']),
        awalHuruf(['g', 'h', 'j', 'k'], ['g', 'h', 'j', 'k'])
      ], { topic: 'konsonan', say: 'Ayo kenalan dengan huruf ge, ha, je, dan ka!' }),
      L('bi1-4', 'l m n p', [
        kenalHuruf(['l', 'm', 'n', 'p']),
        tebalHuruf(['l', 'm', 'n', 'p']),
        { step: 'master', type: 'match', rounds: 2, n: 3, pairs: hurufPairs(['l', 'm', 'n', 'p']),
          say: 'Cocokkan huruf dengan gambarnya.', text: 'Cocokkan <b>huruf</b> dengan gambarnya' },
        pilihHuruf('quiz', ['l', 'm', 'n', 'p'])
      ], { topic: 'konsonan', say: 'Ayo kenalan dengan huruf el, em, en, dan pe!' }),
      L('bi1-5', 'q r s t', [
        kenalHuruf(['q', 'r', 's', 't']),
        tebalHuruf(['q', 'r', 's', 't']),
        pilihHuruf('master', ['q', 'r', 's', 't']),
        awalHuruf(['r', 's', 't'], ['q', 'r', 's', 't'])
      ], { topic: 'konsonan', say: 'Ayo kenalan dengan huruf ki, er, es, dan te!' }),
      L('bi1-6', 'v w x y z', [
        kenalHuruf(['v', 'w', 'x', 'y', 'z']),
        tebalHuruf(['v', 'w', 'x', 'y', 'z']),
        popHuruf(['v', 'w', 'x', 'y', 'z']),
        awalHuruf(['v', 'w', 'y', 'z'], ['v', 'w', 'x', 'y', 'z'])
      ], { topic: 'konsonan', say: 'Ayo kenalan dengan huruf ve, we, eks, ye, dan zet!' }),
      ulang('bi1-r', mix(G.sight(ALL, 3, HURUF_ASK), awal(PICTURED, ALL)), hurufPairs(PICTURED))
    ], [
      /* ---- Tahap 2: suku kata (konsonan + vokal) ---- */
      L('bi2-1', 'ba bi bu be bo', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'ba', say: 'Be dan a, jadi ba.' },
          baris(KV('b'), 'Ba, bi, bu, be, bo.'),
          kata('bola', ['bo', 'la'], '⚽'),
          kata('buku', ['bu', 'ku'], '📖')
        ] },
        tebalSuku([['ba', '👕', 'baju'], ['bi', '👄', 'bibir'], ['bu', '📖', 'buku'], ['be', '🦆', 'bebek'], ['bo', '⚽', 'bola']]),
        susunKata(T2.b, KV('b')),
        pilihSuku(KV('b'))
      ], { topic: 'suku', say: 'Ayo membaca suku kata: ba, bi, bu, be, bo!' }),
      L('bi2-2', 'ca–co, da–do', [
        { step: 'listen', type: 'intro', cards: [
          baris(KV('c'), 'Ce dan a, jadi ca. Ca, ci, cu, ce, co.'),
          kata('ceri', ['ce', 'ri'], '🍒'),
          baris(KV('d'), 'De dan a, jadi da. Da, di, du, de, do.'),
          kata('dadu', ['da', 'du'], '🎲')
        ] },
        tebalSuku([['ca'], ['ce', '🍒', 'ceri'], ['co'], ['da', '🎲', 'dadu'], ['di'], ['du']]),
        susunKata(T2.cd, KV('c').concat(KV('d'))),
        popSuku(['ca', 'ci', 'cu', 'da', 'di', 'du'])
      ], { topic: 'suku', say: 'Ayo membaca ca, ci, cu, ce, co, dan da, di, du, de, do!' }),
      L('bi2-3', 'ka–ko, ma–mo', [
        { step: 'listen', type: 'intro', cards: [
          baris(KV('k'), 'Ka dan a, jadi ka. Ka, ki, ku, ke, ko.'),
          kata('kaki', ['ka', 'ki'], '🦶'),
          baris(KV('m'), 'Em dan a, jadi ma. Ma, mi, mu, me, mo.'),
          kata('mata', ['ma', 'ta'], '👁️')
        ] },
        tebalSuku([['ka', '🦶', 'kaki'], ['ku', '🐴', 'kuda'], ['ke', '🥥', 'kelapa'], ['ma', '👁️', 'mata'], ['mi'], ['mu']]),
        susunKata(T2.km, KV('k').concat(KV('m'))),
        bacaKata(T2.km)
      ], { topic: 'suku', say: 'Ayo membaca ka, ki, ku, ke, ko, dan ma, mi, mu, me, mo!' }),
      L('bi2-4', 'na–no, pa–po', [
        { step: 'listen', type: 'intro', cards: [
          baris(KV('n'), 'En dan a, jadi na. Na, ni, nu, ne, no.'),
          kata('nasi', ['na', 'si'], '🍚'),
          baris(KV('p'), 'Pe dan a, jadi pa. Pa, pi, pu, pe, po.'),
          kata('pita', ['pi', 'ta'], '🎀')
        ] },
        tebalSuku([['na', '🍚', 'nasi'], ['ni'], ['nu'], ['pa', '🔨', 'palu'], ['pi', '🎀', 'pita'], ['pu']]),
        susunKata(T2.np, KV('n').concat(KV('p'))),
        pilihSuku(['na', 'ni', 'nu', 'pa', 'pi', 'pu'])
      ], { topic: 'suku', say: 'Ayo membaca na, ni, nu, ne, no, dan pa, pi, pu, pe, po!' }),
      L('bi2-5', 'sa–so, ta–to', [
        { step: 'listen', type: 'intro', cards: [
          baris(KV('s'), 'Es dan a, jadi sa. Sa, si, su, se, so.'),
          kata('sapi', ['sa', 'pi'], '🐮'),
          baris(KV('t'), 'Te dan a, jadi ta. Ta, ti, tu, te, to.'),
          kata('topi', ['to', 'pi'], '🎩')
        ] },
        tebalSuku([['sa', '🐮', 'sapi'], ['su', '🥛', 'susu'], ['se', '👟', 'sepatu'], ['ta'], ['ti'], ['to', '🎩', 'topi']]),
        susunKata(T2.st, KV('s').concat(KV('t'))),
        popSuku(['sa', 'si', 'su', 'ta', 'ti', 'tu'])
      ], { topic: 'suku', say: 'Ayo membaca sa, si, su, se, so, dan ta, ti, tu, te, to!' }),
      L('bi2-6', 'ga ha ja la …', [
        { step: 'listen', type: 'intro', cards: [
          baris(['ga', 'ha', 'ja'], 'Ayo baca: ga, ha, ja.'),
          kata('gigi', ['gi', 'gi'], '🦷'),
          baris(['la', 'ra', 'wa', 'ya'], 'Ayo baca: la, ra, wa, ya.'),
          kata('roti', ['ro', 'ti'], '🍞'),
          kata('labu', ['la', 'bu'], '🎃')
        ] },
        tebalSuku([['ga'], ['gi', '🦷', 'gigi'], ['ha', '❤️', 'hati'], ['ja'], ['la', '🎃', 'labu'], ['ro', '🍞', 'roti'], ['wa'], ['ya']]),
        susunKata(T2.lain, ['ga', 'gu', 'ha', 'hi', 'ja', 'la', 'li', 'ra', 'ri', 'wa', 'ya', 'yu']),
        bacaKata(T2.lain)
      ], { topic: 'suku', say: 'Ayo membaca ga, ha, ja, la, ra, wa, ya!' }),
      ulang('bi2-r', mix(G.sight(T2_SUKU, 3, SUKU_ASK), G.read(T2_ALL, 3, BACA_ASK)), PR.word(T2_ALL))
    ], [
      /* ---- Tahap 3: suku kata lanjutan ---- */
      L('bi3-1', 'Akhiran n t s', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'tas', pic: '🎒', word: 'tas', say: 'Ta, ditambah es, jadi tas.' },
          kata('ikan', ['i', 'kan'], '🐟', 'Huruf terakhirnya en.'),
          kata('semut', ['se', 'mut'], '🐜', 'Huruf terakhirnya te.'),
          kata('nanas', ['na', 'nas'], '🍍', 'Huruf terakhirnya es.')
        ] },
        tebalSuku([['kan', '🐟', 'ikan'], ['lan', '🌙', 'bulan'], ['mut', '🐜', 'semut'], ['tas', '🎒'], ['bus', '🚌']]),
        susunKata(T3.akhir, ['ka', 'la', 'ja', 'mu', 'ba', 'ma', 'na']),
        { step: 'quiz', type: 'choose', rounds: 3, gen: akhiran(AKHIR_WORDS) }
      ], { topic: 'lanjut', say: 'Ayo membaca kata dengan akhiran en, te, dan es!' }),
      L('bi3-2', 'ng: bunga', [
        { step: 'listen', type: 'intro', cards: [
          baris(['nga', 'ngi', 'ngu', 'nge', 'ngo'], 'En dan ge dibaca bersama. Nga, ngi, ngu, nge, ngo.'),
          kata('bunga', ['bu', 'nga'], '🌸'),
          kata('singa', ['si', 'nga'], '🦁'),
          kata('jagung', ['ja', 'gung'], '🌽')
        ] },
        tebalSuku([['nga', '🌸', 'bunga'], ['gung', '🌽', 'jagung'], ['sang', '🍌', 'pisang'], ['dung', '👃', 'hidung']]),
        susunKata(T3.ng, ['na', 'ni', 'ga', 'gu', 'sa', 'ya', 'du', 'ci']),
        { step: 'quiz', type: 'pop', rounds: 3, gen: G.find(T3.ng, 3, CARI_POP) }
      ], { topic: 'lanjut', say: 'Ayo membaca kata dengan nga, seperti bunga!' }),
      L('bi3-3', 'ny: nyanyi', [
        { step: 'listen', type: 'intro', cards: [
          baris(['nya', 'nyi', 'nyu', 'nye', 'nyo'], 'En dan ye dibaca bersama. Nya, nyi, nyu, nye, nyo.'),
          kata('monyet', ['mo', 'nyet'], '🐵'),
          kata('penyu', ['pe', 'nyu'], '🐢'),
          kata('nyanyi', ['nya', 'nyi'], '🎤', 'Ayo bernyanyi!')
        ] },
        tebalSuku([['nya', '🎤', 'nyanyi'], ['nyu', '🐢', 'penyu'], ['nyet', '🐵', 'monyet']]),
        susunKata(T3.ny, ['na', 'ni', 'nu', 'ya', 'yu', 'ke', 'mo']),
        pilihSuku(['nya', 'nyi', 'nyu', 'na', 'ni', 'nu'])
      ], { topic: 'lanjut', say: 'Ayo membaca kata dengan nya, seperti nyanyi!' }),
      L('bi3-4', 'ai au oi', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'ai', say: 'A dan i dibaca ai.' },
          kata('pantai', ['pan', 'tai'], '🏖️'),
          { big: 'au', say: 'A dan u dibaca au.' },
          kata('kerbau', ['ker', 'bau'], '🐃'),
          kata('koboi', ['ko', 'boi'], '🤠', 'O dan i dibaca oi.')
        ] },
        // (not "tai" on its own: said alone it is a rude word)
        tebalSuku([['ai'], ['au'], ['oi'], ['pai', '🐿️', 'tupai'], ['nau', '🏞️', 'danau']]),
        susunKata(T3.ai, ['ta', 'pa', 'ba', 'na', 'ma', 'tau', 'pau']),
        pilihSuku(['ai', 'au', 'oi'])
      ], { topic: 'lanjut', say: 'Ayo membaca ai, au, dan oi!' }),
      L('bi3-5', 'kh dan sy', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'kh', say: 'Ka dan ha dibaca bersama, seperti pada kata akhir.' },
          kata('akhir', ['a', 'khir'], '🏁', 'Ini garis akhir.'),
          kata('khawatir', ['kha', 'wa', 'tir'], '😟'),
          { big: 'sy', say: 'Es dan ye dibaca bersama, seperti pada kata syal.' },
          { big: 'syal', pic: '🧣', word: 'syal', say: 'Syal. Syal membuat leher hangat.' }
        ] },
        tebalSuku([['kha', '😟', 'khawatir'], ['khir', '🏁', 'akhir'], ['sya'], ['syal', '🧣']]),
        susunKata(T3.khsy, ['ka', 'sa', 'kir', 'sik', 'ha', 'ya']),
        bacaKata(T3.khsy.concat([SYAL]))
      ], { topic: 'lanjut', say: 'Ayo membaca kha dan sya!' }),
      ulang('bi3-r', mix(G.find(T3_ALL, 3, CARI_ASK), G.read(T3_ALL, 3, BACA_ASK)), PR.word(T3_ALL))
    ], [
      /* ---- Tahap 4: membaca kalimat ---- */
      L('bi4-1', 'Kata & gambar', [
        { step: 'listen', type: 'intro', cards: [
          { pic: '🍎', show: kal('apel merah'), say: 'Apel merah. Apelnya berwarna merah.' },
          { pic: '🍌', show: kal('pisang kuning'), say: 'Pisang kuning. Pisangnya berwarna kuning.' },
          { pic: '🍃', show: kal('daun hijau'), say: 'Daun hijau. Daunnya berwarna hijau.' },
          { pic: '🐘', show: kal('gajah besar'), say: 'Gajah besar. Gajahnya besar sekali!' },
          { pic: '🐜', show: kal('semut kecil'), say: 'Semut kecil. Semutnya kecil sekali!' }
        ] },
        tebalKata([['merah', '🔴'], ['biru', '🔵'], ['besar', '🐘'], ['kecil', '🐜']]),
        { step: 'master', type: 'choose', rounds: 4, gen: G.find(BOLA, 3, CARI_ASK) },
        { step: 'quiz', type: 'choose', rounds: 3, gen: G.read(FRASA, 3, FRASA_ASK) }
      ], { topic: 'kalimat', say: 'Ayo membaca dua kata!' }),
      L('bi4-2', 'Ini …', [
        { step: 'listen', type: 'intro', cards: [
          { pic: '⚽', show: kal('Ini bola.'), say: 'Ini bola.' },
          { pic: '📖', show: kal('Ini buku.'), say: 'Ini buku.' },
          { pic: '👩', show: kal('Ini ibu.'), say: 'Ini ibu.' },
          { pic: '🌙', show: kal('Itu bulan.'), say: 'Itu bulan. Bulan jauh di langit.' }
        ] },
        tebalKata([['ini', '👆'], ['itu', '🌙']]),
        { step: 'master', type: 'choose', rounds: 3, gen: G.read(INI_W, 3, INI_ASK) },
        { step: 'quiz', type: 'choose', rounds: 3, gen: betul() }
      ], { topic: 'kalimat', say: 'Ayo membaca kalimat pertama kita!' }),
      L('bi4-3', 'Kalimat pendek', [
        { step: 'listen', type: 'intro', cards: [
          { pic: '🍚', show: kal('Adik makan nasi.'), say: 'Adik makan nasi.' },
          { pic: '🥛', show: kal('Kucing minum susu.'), say: 'Kucing minum susu.' },
          { pic: '📖', show: kal('Kakak membaca buku.'), say: 'Kakak membaca buku.' },
          { pic: '🚲', show: kal('Ayah naik sepeda.'), say: 'Ayah naik sepeda.' }
        ] },
        tebalKata([['makan', '🍚'], ['minum', '🥛'], ['naik', '🚲']]),
        { step: 'master', type: 'choose', rounds: 4, gen: G.ask(TANYA) }
      ], { topic: 'kalimat', say: 'Ayo membaca kalimat pendek!' }),
      L('bi4-4', 'Susun kalimat', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'Adik', pic: '🧒', say: 'Siapa? Adik.' },
          { big: 'makan', pic: '🍽️', say: 'Adik sedang apa? Makan.' },
          { big: 'nasi', pic: '🍚', say: 'Makan apa? Nasi.' },
          { show: kal('Adik makan nasi.'), say: 'Adik makan nasi. Kalimat dimulai dengan huruf besar, dan diakhiri dengan titik.' }
        ] },
        tebalKata([['aku', '🙋'], ['ibu', '👩'], ['adik', '🧒']]),
        // (short words only: a word card holds about five letters)
        { step: 'master', type: 'order', pick: 3, sets: [
          susun('Adik makan nasi.'), susun('Ibu minum teh.'), susun('Ayah naik bus.'),
          susun('Aku punya bola.'), susun('Kakak suka apel.'), susun('Aku suka bola biru.')
        ] }
      ], { topic: 'kalimat', say: 'Ayo menyusun kalimat!' }),
      L('bi4-5', 'Cerita Si Kancil', [
        { step: 'listen', type: 'intro', cards: [
          { big: 'kancil', pic: '🦌', say: 'Ini kancil. Kancil adalah hewan kecil yang cerdik.' },
          { big: 'buaya', pic: '🐊', say: 'Ini buaya. Buaya tinggal di sungai.' },
          { big: 'cerdik', pic: '💡', say: 'Cerdik artinya pandai mencari akal.' }
        ] },
        { step: 'story', type: 'story', pages: KANCIL },
        { step: 'quiz', type: 'choose', fixed: KANCIL_QUIZ }
      ], { topic: 'kalimat', say: 'Ayo dengarkan cerita Si Kancil!' }),
      ulang('bi4-r', mix(G.find(BOLA, 3, CARI_ASK), G.read(INI_W, 3, INI_ASK), betul()), PR.word(FRASA))
    ])
  });
})(window.AF = window.AF || {});
