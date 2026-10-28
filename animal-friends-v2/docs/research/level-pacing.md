# Level pacing for a 4-year-old: how fast Animal Friends moves, and how fast the evidence says it should

Researched 2026-10-27. Scope: why a 4-year-old finishes each level too quickly ("kaya terlalu cepet naura mengerjakan setiap levelnya"), what the code actually does (`engines/lesson.js`, `core/levels.js`, `core/profile.js`, `content/*.js`), and what the research says about session length, repetitions, spacing and mastery gating for ages 3–5.

How to read the labels:
- **[evidence]**: peer-reviewed study or official guidance, read at least as an abstract.
- **[secondary]**: a number reported by someone other than the original authors.
- **[vendor]**: a company's own documentation or marketing.
- **[expert opinion]**: a practitioner's figure with no published method behind it.
- **[uncertain]**: contested, or could not be verified.
- **[our inference]**: derived from the sources, not stated in any of them.
- **[measured]** / **[code]**: measured by me on this repo (method in Appendix A).

**The one-line answer: the lesson length is not the problem. Each item is taught about four times in one sitting and then never comes back.** Four- to six-year-olds need roughly 15–21 retrieval-weighted trials per new word spread over at least two days ([Leonard et al. 2020](https://doi.org/10.1044/2020_JSLHR-20-00105)) [evidence]. A new letter in Phonics gets about **3.5–5 presentations, all inside one 2–3 minute lesson, and about 0.2 more for the rest of the stage** [measured]. Lengthening lessons would fight the attention evidence; bringing items back would not.

---

## 1. The numbers up front

| What | Today | What the evidence supports | Source |
|---|---|---|---|
| Steps per core lesson | **4** (Listen→Trace→Play→Quiz and its siblings), fixed | Keep 4 | `engines/lesson.js:12-15`, `content/phonics.js:41-49` [code] |
| Rounds per core lesson | median **12** (Phonics 12, English 16, Math 12, Bahasa 12; range 9–17) | Keep **12–16**. Do not grow past ~16 | [measured]; §4.1 |
| Modelled lesson length | **~80 s floor**, realistically **2–3.5 min** for Phonics, **4–7 min** for English/Math | 5–15 min per sitting is the defensible band; nobody has tested longer | [modelled]; §4.1 |
| Presentations per new item, inside its lesson | **~3.5–5** (1 intro card + 0.75 trace + 1–2.25 play + 0.7–1.0 quiz) | **15–21 trials per new item, across ≥ 2 days**, retrieval-weighted | [measured]; [Leonard et al. 2020](https://doi.org/10.1044/2020_JSLHR-20-00105) [evidence] |
| Presentations per item after its lesson | **~0.2** (the stage Review asks 6 questions about 26 letters) | Several, on later days | `content/phonics.js:69-72` [code]; §4.3 |
| Steps that can cost a star | **2 of 4**. Listen, Story, Words, Trace and Say it never call `S.miss()` | Keep them free, but they should still produce *retrieval*, which Trace and Listen do not | `engines/base.js:195`, `engines/trace.js`, `engines/voice.js`, `engines/media.js:8-10` [code] |
| Stars | 0–1 mistakes → 3 · 2–4 → 2 · 5+ → 1. Finishing always earns ≥ 1 | Keep. There is no fail state and that is right | `core/levels.js:30-35` [code] |
| Maximum mistakes reachable in a 4-round quiz | **8** (2 per round, then the wrong cards become untappable) | Keep the no-dead-end rule | `engines/quiz.js:113-118`, `engines/engines.css:80` [code] |
| What unlocks the next level | **1 star** on the one before | Keep the unlock at 1 star; put the gate in *what is recommended*, not in what is reachable | `core/levels.js:37-46` [code] |
| What unlocks the next stage | 1 star on the stage's last (Review) lesson | Same | `core/levels.js:63-67` [code] |
| Missed items re-asked | **Never.** Nothing records which item was missed, and generators actively avoid repeating the last answer (`k !== ctx.last`) | Re-ask the missed item **immediately and again after a delay** | `content/bank.js:216,229,243-244` [code]; [Leonard et al. 2022](https://doi.org/10.1177/23969415221077652) [evidence] |
| Spaced review | Only the stage Review lesson, and Today's Study at weekends | A **30-second** within-session lag already helps at age 3; different **days** matter most for production | `core/app.js:355-367` [code]; [Vlach et al. 2008](https://doi.org/10.1016/j.cognition.2008.07.013), [Childers & Tomasello 2002](https://digitalcommons.trinity.edu/psych_faculty/66) [evidence] |
| One stage of Phonics | **8 lessons / 97 rounds** ≈ 20–30 min = **one sitting** | A stage should be days of work, not one sitting | [measured] |
| Whole core curriculum | **121 lessons / 1,498 rounds** ≈ 6–9 hours of play | — | [measured] |
| Today's Study | **3 items/day** (2 core + 1 fun), up to 4 with yesterday's carry-over. Free play on the map bypasses it entirely | Keep 2–3/day; make the *recommended* next item a repeat when the last one was shaky | `core/app.js:324-383` [code] |
| Daily time limit | default **Off**; options Off / 15 / 30 / 45 min | App's own target is already right: 10–15 min/day | `core/profile.js:42`, `index.html:266`, `core/app.js:922`, `README.md:89` [code] |

### The five mechanisms that make it fast

1. **An item is taught once.** Four new letters get one intro card, three traces (one letter is dropped at random), one play step and four quiz questions — then the lesson ends. `content/phonics.js:46` is `rounds: Math.min(3, keys.length)` with `keys.length === 4`, and `engines/trace.js:102-103` shuffles the pool, so **one of the four new letters is never traced** [code].
2. **Half the lesson cannot be got wrong, and does not ask for recall either.** Listen/Story/Words (`intro`), Trace, Say it (`speak`), Story and Song never call `S.miss()`. That is the right call for stars — but `intro` and `trace` are also pure *study*, not retrieval, and retrieval is where the learning is (§5.4). So a 12-round lesson contains only about **7 retrieval rounds**.
3. **Nothing comes back.** No per-item record exists anywhere in the profile (`core/profile.js:8-19` stores stars, attempts, a mistake *count* per level, and days — never which item). Generators go out of their way to avoid repeating: `U.one(words.filter(x => x.w !== ctx.last))` (`content/bank.js:216`). A missed letter is gone.
4. **One star opens everything.** `isUnlocked` needs `stars(...) > 0` (`core/levels.js:41-45`), and finishing always earns at least one star (`core/levels.js:32-34`). A child who makes every mistake the engine allows still opens the next level. There is no mastery requirement anywhere in the codebase.
5. **The quiz dilutes as the pool grows.** `G.letterSound(sofar, n, keys)` picks from the focus list only 65% of the time (`content/bank.js:243`). In lesson 1 (pool = 4 letters) each new letter is asked **1.0** times; by lesson 6 (pool = 24) each new letter is asked **0.71** times [measured, §4.2].

### The single highest-impact change

**Give each engine a missed-item queue, and re-ask a missed item twice: once at the end of its step, once at the end of the lesson.** It is the only change that addresses the actual deficit (exposures per item), it adds only a few seconds to lessons the child answers correctly, it costs nothing in star fairness (the first miss already counted; the retry is free), and it touches no level id, no star record and no unlock rule. [Kliegl et al. 2018](https://doi.org/10.3389/fpsyg.2018.01446) is the strongest result in this whole document: in preschoolers, cued retrieval **with immediate feedback** gave **89.1% vs 41.8%** final recall against restudy — and **without** feedback the testing effect was **zero** [evidence].

---

# PART A — How the app paces levels today

## 2. The shape of a lesson

A core lesson is data: `AF.lesson(id, title, steps, extra)` (`content/bank.js:56`) produces `{ id, title, type: 'lesson', steps: [...] }`. `E.lesson` (`engines/lesson.js:80-135`) walks the steps in order, each as a child session (`engines/base.js:153-159`), and sums their mistakes:

```js
child = E.child(S, st, (m, avg) => {
  mistakes += m || 0;
  if (avg) times.push(avg);
  S.after(next, 700);
});
```
— `engines/lesson.js:99-103`

Before each step a "road" card shows where the child is, speaks the step's line, and clears itself after 1,300 ms or a tap (`engines/lesson.js:109-132`).

The four roads (`engines/lesson.js:12-15`):

| Subject | Road | Lessons | Stages |
|---|---|---|---|
| Phonics | Listen → Trace → Play → Quiz | 28 (24 teaching + 4 Review) | 4 Steps |
| English | Story → Words → Say it → Quiz | 21 (17 + 4) | 4 Stages |
| Math | Story → Real life → Play → Quiz | 46 (41 + 5) | 5 Levels |
| Bahasa | Kenal → Tebalkan → Kuasai (3 steps, sometimes 4) | 26 (22 + 4) | 4 Tahap |

Measured round counts per lesson [measured]:

| Subject | min | median | max | mean | Quiz rounds |
|---|---|---|---|---|---|
| Phonics | 9 | **12** | 15 | 12.2 | 4 (always) |
| English | 15 | **16** | 16 | 15.8 | 4 (always) |
| Math | 9 | **12** | 17 | 12.1 | 4 (always) |
| Bahasa | 9 | **12** | 14 | 12.3 | 3 (median) |
| Review lessons | 10 | **10** | 10 | 10 | 6 choose + 4 memory |

## 3. What a round costs in time

The code's own waits, plus the measured length of the recorded lines [measured; Appendix A]:

| Constant | Value | Where |
|---|---|---|
| "Ready" card before a non-lesson level | 1,200 ms, or a tap | `core/app.js:769` |
| Step road card inside a lesson | 1,300 ms + the rest of the line + 260 ms exit | `engines/lesson.js:131,127` |
| Gap between steps | 700 ms + the rest of any line | `engines/lesson.js:102` |
| `S.after(fn, ms)` | waits `ms`, **then** waits for speech, up to 8 s more | `engines/base.js:182-190` |
| Intro card: line starts | 320 ms after the card appears | `engines/lesson.js:194` |
| Intro card: green arrow wakes | when the line ends, else at 6,000 ms | `engines/lesson.js:176,195` |
| `choose` round: line starts | 320 ms | `engines/quiz.js:102` |
| `choose` round: after a correct tap | 1,700 ms with praise, 1,100 ms without | `engines/quiz.js:128` |
| `pop` round: bubbles | spawn every 780 ms, float 6.2–8.8 s, **3 correct pops needed** | `engines/touch.js:255,288,346` |
| `sort` round: after a correct drop | 1,900 ms | `engines/touch.js:111-114` |
| Result sheet: stars land | 320 ms + 420 ms each, then the friend's cheer | `core/levels.js:294-309` |
| Recorded line length | median **2.18 s**, p75 3.19 s, p90 4.42 s (3,432 clips) | [measured] |

**Modelled lesson length** [modelled — the method is in Appendix A and the figure should be checked against the app's own minutes/day]:

- `ph1-1` (a b c d, with the `pop` play step): step cards ~10 s + Listen ~15 s + Trace ~35 s + Pop ~38 s + Quiz ~28 s + result ~5 s ≈ **2.2 min**. With no thinking time at all the forced waits still total **~80 s**.
- `ph1-2` (e f g h, with the `match` play step): ≈ **1.9 min**.
- English and Math carry far more speech — median **63 s** and **78 s** of recorded audio per lesson against Phonics' **23.5 s** — so they land at roughly **4–7 min** [measured].

`engines/lesson.js:9` and `README.md:56-57` both state the design intent as "about five minutes". **Phonics does not reach it.** Phonics Step 1 is 8 lessons / 97 rounds, which at 2–3 min each is **20–30 minutes: one sitting.** That matches what the owner is seeing.

## 4. How many times an item is actually taught

### 4.1 One alphabet lesson, item by item

`alphabet(id, keys, sofar, game)` (`content/phonics.js:41-50`) builds every Step 1 lesson. For `ph1-1` (`keys = ['a','b','c','d']`):

| Step | Config | Presentations per new letter |
|---|---|---|
| Listen (`intro`) | 4 cards, one per letter, each saying "a … aaah … apple" (2.54 s [measured]) | **1.0** (study, not retrieval) |
| Trace | `set: keys`, `rounds: Math.min(3, 4) = 3`, pool shuffled | **0.75** (study; one letter is skipped at random) |
| Play (`pop`) | `rounds: 3`, `need: 3` → 3 target letters × 3 correct pops | **~2.25** (retrieval) |
| Quiz (`choose`) | `rounds: 4`, `G.letterSound(upTo('d'), 3, keys)` | **1.0** (retrieval) |
| **Total** | | **~5.0, of which ~3.25 retrieval** |

For the `match` variant (`ph1-2`, `ph1-4`, `ph1-6`): Listen 1.0 + Trace 0.75 + Match 1.0 + Quiz 0.83 ≈ **3.6, of which ~1.8 retrieval**.

### 4.2 The quiz dilutes as the alphabet grows

`G.letterSound` (`content/bank.js:240-259`) picks from the `focus` list with probability 0.65:

```js
let from = (focus && Math.random() < 0.65 ? focus : pool).filter(k => k !== ctx.last);
```

So the expected number of the 4 quiz rounds that land on a **new** letter is `4 × (0.65 + 0.35 × |keys| / |pool|)` [measured, analytic]:

| Lesson | New letters | Quiz pool (`sofar`) | Quiz rounds on new letters | Per new letter |
|---|---|---|---|---|
| ph1-1 | a b c d | 4 | 4.00 | **1.00** |
| ph1-2 | e f g h | 8 | 3.30 | **0.83** |
| ph1-3 | i j k l | 12 | 3.07 | **0.77** |
| ph1-4 | m n o p | 16 | 2.95 | **0.74** |
| ph1-5 | q r s t | 20 | 2.88 | **0.72** |
| ph1-6 | u v w x | 24 | 2.83 | **0.71** |
| ph1-7 | y z | 26 | 2.71 | **1.35** |

The design is sound — the quiz *does* mix in old letters, which is interleaving — but the total is too small for either job. 4 rounds split 65/35 gives neither 4 solid trials on the new letters nor meaningful review of the old ones.

### 4.3 The Review lesson barely reviews

```js
L('ph1-r', 'Review', [
  { step: 'review', type: 'choose', rounds: 6, gen: mix(G.letterSound(A, 4), G.firstSound(STARTS, 3)) },
  { step: 'play', type: 'memory', n: 4, peek: true, pairs: PR.letter([...10 letters]) }
], { review: true })
```
— `content/phonics.js:69-72`

**6 questions across all 26 letters** = 0.23 exposures per letter, plus a 4-pair memory game drawn from a fixed list of 10. Every one of the 17 Review lessons in the curriculum is exactly 10 rounds [measured]. A Review lesson is the same length as a teaching lesson and covers 6× as much material.

It also does not look at what the child actually struggled with — even though the grown-up screen already computes exactly that (`core/app.js:938-947` classifies each topic as `sure` / `going` / `help` / `not` and collects the `help` ones into `practise`).

## 5. Scoring, unlocking and adaptation

### 5.1 Stars

```js
starsFor(mistakes, level) {
  const lesson = level && level.type === 'lesson';
  if (mistakes <= (lesson ? 1 : 0)) return 3;
  if (mistakes <= (lesson ? 4 : 2)) return 2;
  return 1;
}
```
— `core/levels.js:30-35`

A lesson earns **3 stars with up to 1 mistake** across all ~7 of its scoring rounds. Stars are a *count of slips*, never time (`core/levels.js:6-12`), and `setStars` keeps the best: `Math.max(prev, n)` (`core/profile.js:147`). There is no fail state.

A misheard word genuinely never costs a star: `engines/voice.js` contains no `S.miss()` call, and after two tries the word is accepted with a "good try" (`engines/voice.js:9-17`). `engines/media.js:8-10` says stories and songs "cannot be got wrong". Both decided-2026-10-13 rules hold in the code.

Mistake ceilings per round type [code]:
- `choose`: 2, then every wrong card gets `.dimmed`, which is `pointer-events: none` (`engines/quiz.js:113-118`, `engines/engines.css:80`).
- `pop`: 2, then wrong bubbles turn `.pale`, also `pointer-events: none` (`engines/touch.js:317-319`, `engines/engines.css:507`).
- `sort`, `order`, `build`: unbounded; after 2 the right answer is hinted but wrong taps still register (`engines/touch.js:83-93`, `engines/quiz.js:187`, `engines/quiz.js:290-295`).
- `memory`: derived, not counted directly — `S.mistakes = Math.max(0, Math.ceil((misses - n) / 2))`, i.e. one free wrong flip per pair (`engines/quiz.js:470`).

### 5.2 Unlocking

```js
isUnlocked(moduleId, levels, index) {
  if (index <= 0 || AF.Profile.setting('open')) return true;
  if (AF.Profile.stars(moduleId, levels[index].id) > 0) return true;   // never re-locked
  let prev = index - 1;
  while (prev > 0 && levels[prev].soon) prev--;
  return levels[prev].soon || AF.Profile.stars(moduleId, levels[prev].id) > 0;
}
```
— `core/levels.js:37-46`

One star on the previous level. A stage opens the same way, via the first level of the new tier (`core/levels.js:63-67`), which in practice means one star on the previous stage's Review lesson. The treasure chest is stricter — it needs a star on *every* level in the tier (`core/levels.js:148`) — but since the levels are sequential that is the same condition. The `open` setting in the grown-up area bypasses everything.

**There is no mastery requirement in the codebase.** Nothing anywhere asks for 2 or 3 stars before moving on.

### 5.3 The two adaptations that do exist

```js
helpLevel(moduleId, levelId) {
  if (Levels.stretch(moduleId, levelId)) return 0;
  const tries = AF.Profile.attempts(moduleId, levelId);
  if (tries >= 4) return 2;
  if (tries >= 2) return 1;
  return 0;
}
stretch(moduleId, levelId) { return AF.Profile.stars(moduleId, levelId) === 3; }
```
— `core/levels.js:85-97`

- **Help** counts *lifetime* attempts at that level, not slips within the session. At 2 attempts, one wrong card dims after 3,200 ms; at 4, the prompt also replays at 8,000 ms (`engines/quiz.js:93-100`). A child who gets everything right first time never sees it, and a child who needs help mid-lesson does not get it until the *next* attempt.
- **Stretch** fires only on a replay of a 3-star level, and only adds **one** extra distractor / memory pair / spare tile / spoken word (`content/bank.js:155-156`, `engines/quiz.js:375`, `engines/quiz.js:251`, `engines/voice.js:33`). It is invisible in the UI — nothing tells the child or the grown-up that a replay is harder.

### 5.4 Today's Study

`todayPicks()` (`core/app.js:324-383`) plans **3 items a day**: two core subjects in a rotating pair (Phonics+Math, then English+Bahasa), plus one Fun & Joy game; yesterday's unfinished lesson comes first, up to 4 in all. At weekends nothing new — the two *least sure* played lessons come back (fewest stars, then most slips per attempt, `core/app.js:356-364`).

This is a genuinely good spacing plan. **It is also entirely optional.** The subject map lets the child tap any unlocked stone (`core/levels.js:171-182`), and the default play limit is `Off` (`core/profile.js:42`). Nothing stops a 4-year-old from clearing Phonics Step 1 end to end in one afternoon.

### 5.5 What the app already measures (use this before changing anything)

- `P.addPlay(15000)` on a 15-second interval while the app is visible and not in the maker or the grown-up area (`core/app.js:1143-1149`) → `minutesToday()`, `week(7)`, `streak()` (`core/profile.js:201-220`).
- `noteResult(mod, lvl, mistakes, avgMs)` keeps a rolling average of thinking time per level: `r.ms = r.ms ? Math.round(r.ms * 0.6 + avgMs * 0.4) : Math.round(avgMs)` (`core/profile.js:184-192`). `S.lap()` caps a round at 30 s (`engines/base.js:194`).
- The grown-up screen shows minutes/day against a **15-minute goal line** (`core/app.js:916-922`) and lessons cleared out of the total (`core/app.js:900-913`).

So the diagnosis is checkable today: if Naura's minutes/day is at or under 15 while her lessons-cleared count is climbing fast, the problem is confirmed as **too little practice per lesson**, not too little time on the app.

---

# PART B — What the evidence says pacing should be

## 6. Session length: nobody has set a number, and the folklore is folklore

**The headline is a negative result.** Not the AAP, not the WHO, not NAEYC, not Zero to Three gives a per-session or per-lesson length for 3–5 year olds. They all give **daily totals only**.

- **AAP, "Media and Young Minds" (2016)**, *Pediatrics* 138(5):e20162591: "For children 2 to 5 years of age, limit screen use to **1 hour per day** of high-quality programming, coview with your children…". The strings "at a time" and "session" do not appear in the recommendations. [evidence] ([publisher page](https://publications.aap.org/pediatrics/article/138/5/e20162591/60503/Media-and-Young-Minds); [full text read here](https://www.justonenorfolk.nhs.uk/media/i5cn5lgj/docobookcom_media-and-young-minds.pdf)). The statement notes that AAP policy auto-expires 5 years after publication unless reaffirmed.
- **WHO (2019)**, ages 3–4: "Sedentary screen time should be no more than **1 hour**; less is better", plus ≥180 min/day physical activity and 10–13 h sleep. WHO's only "at a time" limit (1 hour) is about restraint in prams and high chairs, **not screens**. [evidence] ([WHO news](https://www.who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more), [guideline](https://apps.who.int/iris/handle/10665/311664))
- **NAEYC / Fred Rogers Center (2012)** position statement, birth–8: no numeric limits at all; technology "can enhance but not replace play, physical activity, outdoor experiences, conversation, and social interaction". [evidence] ([NAEYC](https://www.naeyc.org/resources/pubs/yc/sep2017/technology-and-interactive-media), [full text mirror](https://fg.ed.pacificu.edu/cldc/resources/TechPositionNAEYC.pdf))
- **Zero to Three, "Screen Sense"**: no minute figure for session or daily use; the framework is the 3 C's (content, context, child). [evidence] ([Zero to Three](https://www.zerotothree.org/resource/screen-sense-what-the-research-says-about-the-impact-of-media-on-children-aged-0-3-years-old/))
- **RCPCH (UK, 2019)** explicitly **declined** to set a threshold, saying evidence of direct harm from screen time per se was too weak. [secondary — news reports] ([Optometry Today](https://www.aop.org.uk/ot/news/2019/01/08/harmful-effects-of-screen-time-in-children-overstated))

**The "2–3 minutes per year of age" rule has no primary source.** Three separate searches traced it; every page states it with no attribution or credits unnamed "experts". It is not even internally stable — 2–3, 2–5, 3–5 and "up to 5" min/year all circulate. Wikipedia's *Attention span* article, which does cite primary literature, does not contain the rule at all and gives no minutes figure for children. The commonly circulated "8–12 min adult-directed / 10–20 min self-chosen" table for a 4-year-old is a blog value with no method. [expert opinion] ([earlyyears.tv](https://www.earlyyears.tv/attention-span-development/), [Metro Parent](https://metroparent.com/parenting/advice/concentration-and-little-kids/), [Wikipedia](https://en.wikipedia.org/wiki/Attention_span)) — **do not design against these numbers.**

### What the real literature gives instead

- **Age 4 is roughly where sustained attention stops improving.** Sarid & Breznitz (1997), *IJBD* 21(2):303–312, N = 48 nursery + 47 kindergarten children: sustained attention rises with age with both linear and quadratic components, improving until about age 4 and then **plateauing**. Free play was a more sensitive measure than a structured test. [evidence] ([record](https://cris.haifa.ac.il/en/publications/developmental-aspects-of-sustained-attention-among-2-to-6-year-ol/))
- **The unit of analysis in this literature is seconds, not minutes.** Ruff & Lawson (1990) set the threshold for a "sustained" look at **> 3 seconds**, and focused-attention duration in free play rises with age across 1–5 years. [evidence for the threshold, via [Yuan et al. 2019](https://doi.org/10.1016/j.jecp.2018.11.020); secondary for the 1990 finding] ([Ruff & Lawson DOI](https://doi.org/10.1037/0012-1649.26.1.85))
- **Child choice sustains attention longest — replicated three times, magnitude never published.** DiCarlo et al. (2016), N = 63 preschoolers: mean attention duration was longest under **child choice**, shorter under adult choice, shortest under adult presentation. Replicated with N = 93 three-year-olds (2025) and N = 40 (Geary 2011). **No accessible version of any of the three reports a mean in seconds or minutes.** [evidence for the direction; no source found giving a number] ([DiCarlo 2016](https://repository.lsu.edu/education_pubs/38), [Springer 2025](https://link.springer.com/article/10.1007/s10643-025-01985-w), [Geary 2011](https://repository.lsu.edu/gradschool_theses/1989))
- **Group activity: 20 minutes is the documented disengagement threshold.** Bustamante et al. (2018), *Elementary School Journal* 118(4):610–631: circle-time engagement **decreased once it exceeded 20 minutes**; engagement was high at the start and declined in all classrooms; **half** the classrooms showed significant disengagement with **over 30% of children off-task**. The study average was 20 minutes and the authors recommended decreasing it. [evidence, read via a 2023 full text quoting it] ([DOI](https://doi.org/10.1086/697473))
- **Experienced practitioners land at 11–15 minutes.** Koczela & Carver (2023), *Journal of Montessori Research* 9(2), survey of **276 US Montessori guides** of 3–6-year-olds across all 50 states: most hold circle time to **20 minutes or less**, and the **largest single group is 11–15 minutes**, which also contained the most experienced teachers. [evidence, full text read] ([article](https://journals.ku.edu/jmr/article/view/20962))
- **Preschool literacy RCTs converge on 10–15 minutes, and that convention is not validated.** Roberts, Vadasy & Sanders (2018): **10-minute** sessions, 4 days/week, 9 weeks, N = 93, mean age 49.8 months. Piasta & Wagner (2010): **34 lessons of 10–15 minutes**, N = 38 aged 3–4. **Both produced null or WWC-indeterminate effects on the taught content.** [evidence] ([Roberts full text](https://files.eric.ed.gov/fulltext/ED583491.pdf), [WWC Roberts](https://ies.ed.gov/ncee/wwc/Study/90071), [WWC Piasta](https://ies.ed.gov/ncee/wwc/Study/90015))
- **The only randomised test of session length on pre-primary children compared 5 vs 7 vs 9 minutes, and is contested.** Sun et al. (2025), EdTech Hub Evidence Brief No. 1: **94,813 pre-primary learners** in Kenya randomised to 5, 7 or 9 minutes per session; shorter sessions appeared to improve literacy and numeracy. **Grey literature, not peer reviewed**, and the companion conference paper (Friedberg 2023, AIED) describing an A/B/C test in Nairobi reports **no significant group differences**. Nobody has tested 15 or 20 minutes against 5. [evidence-grade design / uncertain] ([brief](https://doi.org/10.53832/edtechhub.1046), [conference paper](https://doi.org/10.1007/978-3-031-36336-8_119))

**Conclusion for this app [our inference]:** a self-paced, child-chosen touchscreen session for a 4-year-old is defensible in the **5–15 minute** band, by analogy only. A **2–3.5 minute lesson is not too short** — three of them is a good day. The app's existing 10–15 min/day target and 15-minute goal line are already the right numbers.

## 7. How many repetitions a new item needs

This is the best-quantified area in the whole document, and it is where Animal Friends is short by a factor of 3–5.

- **The dose-response curve plateaus at 36 exposures (for children who struggle).** Storkel et al. (2017), *LSHSS*, N = 27 kindergarteners with SLI randomised to **12, 24, 36 or 48** exposures per word during interactive book reading: "Response to treatment improved as intensity increased from 12 to 24 to 36 exposures and then no further improvements were observed as intensity increased to 48." Conclusion: "The adequate intensity … was **36 exposures**." [evidence, open access] ([DOI](https://doi.org/10.1044/2017_LSHSS-16-0058)). A University of Kansas press release frames the typically-developing figure as **12 exposures**, but that is press framing, not a result of the trial. [secondary — flag it] ([KU](https://news.ku.edu/news/article/2017/01/18/reading-picture-books-children-holds-promise-treating-common-language-disorder))
- **The concrete trial budget for a 4-year-old: 15–21 trials per word, across two consecutive days.** Leonard et al. (2020), *JSHLR* 63:2763–2776, N = 13 children with DLD + 13 typical peers, **all aged 4–6**, two learning sessions on consecutive days. Every word received **at least 8 study trials, 7 immediate retrieval trials and 6 spaced retrieval trials**, then nine additional study-only *or* nine additional retrieval-only trials. Results: word-form recall **60.57% (more retrieval) vs 43.91% (more study)**, p = .001; meaning recall 93.40% vs 87.15%, p = .037; recall at **1 week was higher than at 5 minutes** (55.45% vs 49.00%, p = .030). The procedure built in a sticker-path progress break and **5-second animated clips between trials** to keep children engaged. [evidence, full text read] ([DOI](https://doi.org/10.1044/2020_JSLHR-20-00105))
- **Total exposures matter; how you split them across sessions does not.** Storkel et al. (2019), N = 34 kindergarteners, compared Dose 6 × Frequency 6 against 4 × 9 and 9 × 4: once total intensity was adequate, the split did not change word learning. [evidence for the design; results statement secondary] ([PDF](https://pubs.asha.org/doi/pdf/10.1044/2019_LSHSS-VOIA-18-0131)) — **this is the licence to keep lessons short and add sessions instead.**
- **Repeating the *same* context beats varying it, at age 3.** Horst, Parsons & Bryan (2011), *Frontiers in Psychology* 2:17, N = 16 three-year-olds, 9 storybooks read **3 times** over 1 week with the same total exposures per word in both conditions: children who heard the **same** story repeatedly were accurate on both immediate recall **and 1-week retention**; children who heard **different** stories with the same words failed retention. From the same paper's review: a story heard **3 times** taught ~5.10 words (50%); heard **once**, 3.2 words (30%). [evidence, full text read] ([DOI](https://doi.org/10.3389/fpsyg.2011.00017))
- **Mere exposure teaches nothing; explicit instruction does.** Goldstein et al. (2016), *JSLHR* 59(3):484–500, cluster RCT, 32 classrooms, ~195 preschoolers: comparison children learned **no** novel challenging words from story exposure alone, while children who got embedded lessons showed significant gains — which **diminished over the school year**. [evidence] ([DOI](https://doi.org/10.1044/2015_JSLHR-L-15-0227))
- **Fast mapping is not mastery.** 3- and 4-year-olds can map a new word to a novel object after one or two exposures when contrasted with a familiar word, but that initial link is explicitly not retention. [secondary] ([review PDF](https://reading-9.eprints-hosting.org/37152/1/Fast_mapping_in_lexical_development-revised%20%281%29.pdf))

**Where the evidence is absent — say this out loud:**
- **No source gives a number of trials to criterion for a letter-sound correspondence in a typically developing 4-year-old.** The only trials-to-criterion figure found is from a 2006 preschool phonological-awareness study whose WWC summary does not even state the direction. [uncertain] ([WWC](https://ies.ed.gov/ncee/wwc/Study/64603))
- **No source gives a number of repetitions for a 3–5 year old to learn a number word or cardinality.** Searched three ways. The closest finding is that number words are mastered **one at a time**, not all at once (36–52 months), and that about **17% of 4-year-olds** have not yet grasped counting meaning. [evidence / secondary] ([JNC PDF](https://jnc.psychopen.eu/index.php/jnc/article/download/7029/7029.pdf), [NIE brief](https://repository.nie.edu.sg/server/api/core/bitstreams/335748f4-7049-4768-a45d-161d2a6d7c59/content))
- **No authoritative source gives Direct Instruction / Reading Mastery's mastery-criterion percentage.** The commonly quoted "90% accuracy" traces only to an uncited commercial blog. [uncertain]
- Roberts (2018) and Piasta & Wagner (2010) both ran roughly **one lesson per letter** and both produced null/indeterminate effects. That is a real caution against assuming one short lesson per item is enough — which is exactly what Animal Friends does.

## 8. Spacing, interleaving and error handling

### 8.1 Spacing works, and 30 seconds is enough

- **A 30-second lag already produces a spacing benefit at age 3.** Vlach, Sandhofer & Kornell (2008), *Cognition* 109(1):163–167, N = 36 three-year-olds, 16 trials over four sessions on separate days. Massed = presentations **less than one second** apart; spaced = **30 seconds** apart, filled with play-doh and storybooks. Spaced beat massed for **both** memory (identical instances) and category induction (different instances), despite being harder. The authors' mechanism: spacing allows time to forget surface features, and forgetting promotes abstraction. [evidence, read from the paper] ([DOI](https://doi.org/10.1016/j.cognition.2008.07.013))
- **Different *days* matter most for production.** Childers & Tomasello (2002), two-year-olds: production of words was better after distributed than massed exposure, and the follow-up found the **number of different days** of exposure mattered most. Comprehension showed no such difference. [evidence] ([full text](https://www.gwern.net/doc/psychology/spaced-repetition/2002-childers.pdf))
- **⚠ The direction reverses when you test immediately.** Vlach, Ankowski & Sandhofer (2012), *JEP:LMC* 38(1):246–254, N = 144 two-year-olds: **simultaneous presentation won at immediate test; spaced presentation won after a 15-minute delay.** [evidence] ([DOI](https://doi.org/10.1037/a0025260)) — **an app that measures success within the session will systematically favour massing and be wrong.** Animal Friends measures exactly that: stars come from mistakes made inside one sitting. Keep this in mind before "proving" a change works.
- **The evidence base for under-5s is thin, per the people who study it.** Knabe & Vlach (2020), *JARMAC* 9:447–454: spacing is "one of the most robust and replicable phenomena in psychological science" **but** "very few studies have been conducted with children aged 0–5", and the literature reports only group-level results. [evidence] ([lab publications](https://vlachlab.education.wisc.edu/publications))

### 8.2 Interleaving: asserted, not demonstrated, for this age

**Do not build a claim on interleaving for a 4-year-old.** No study was found that tests interleaved vs blocked practice in 3–5 year olds with a reportable number. A review attributes a preschool interleaving benefit to "Vlach & DeBrock (2017)", but that paper is about **cross-situational** word learning, not an interleaved-vs-blocked manipulation — it appears to be a miscitation. The one clean blocked-vs-interleaved child study (N = 56, ages 6–10) found **no difference in rate of learning**. In a 2025 children-vs-adults comparison, interleaving helped but **young adults benefited more than children**. Blocking enables within-category comparison and can be as good or better under some conditions. [uncertain / secondary] ([review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10455486/), [null study](https://www.psy.ox.ac.uk/publication/1146547), [Dong 2025](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12470837/))

The app's existing mix (new items + `sofar` pool in the quiz) is therefore defensible on **spacing** grounds, not on interleaving grounds.

### 8.3 Retrieval practice and feedback: the strongest single result

- **Kliegl, Abel & Bäuml (2018)**, *Frontiers in Psychology* 9:1446, four experiments with preschoolers (N = 32 aged 4–6, M 5.4; N = 32 aged 4–5, M 4.7; N = 28 aged 3–6, M 4.8; N = 28 aged 3–6, M 4.9), 5-minute retention interval filled with a colouring distractor. Final recall, retrieval practice vs restudy:

  | Experiment | Design | Retrieval | Restudy |
  |---|---|---|---|
  | 1 | free-recall practice, no feedback, free-recall test | 43.5% | 44.5% (**no effect**) |
  | 2 | cued-recall practice, no feedback, free-recall test | 43.8% | 44.7% (**no effect**) |
  | 3 | cued-recall practice, no feedback, **cued**-recall test | 62.1% | 45.5% (**+17**) |
  | 4 | cued-recall practice **with immediate feedback**, cued test | **89.1%** | 41.8% (**+47**) |

  **Two critical ingredients: cued retrieval (not free recall), and immediate feedback after each attempt. Without both, the testing effect in preschoolers is zero.** [evidence, full text read] ([DOI](https://doi.org/10.3389/fpsyg.2018.01446))

  Animal Friends already has both: every round is a cued multiple-choice question, and feedback is immediate (`engines/quiz.js:45-58`). The machinery is right; the trial count is not.

- **Retrieval practice also fails sometimes.** A 2023 *Frontiers in Developmental Psychology* paper reports a **lack** of retrieval-practice effects for novel words in storybook reading with preschoolers. [evidence] ([article](https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2023.1270938/full))

### 8.4 When to re-ask a missed item: immediately *and* later

- **Leonard et al. (2022)**, *Autism and Developmental Language Impairments* 7, 4- and 5-year-olds with DLD and typical peers, tested at the final learning trial, 5 minutes and 1 week: **immediate retrieval produced more accurate production at the final learning trial, but after one week accuracy was much lower** than for words learned under a **mixed spaced-plus-immediate** schedule, which was very stable across time in both groups. [evidence, abstract; exact percentages not retrievable] ([DOI](https://doi.org/10.1177/23969415221077652))
  → **Immediate-only re-presentation buys within-session accuracy that decays by a week. Do both.**
- **Immediate error correction beats end-of-session correction — but in a tiny clinical sample.** Barbetta et al. (1994), *JABA* 27(1):177–178, N = 5 students with developmental disabilities: immediate whole-word correction was superior on all four dependent variables. [evidence, but not preschoolers and N = 5] ([DOI](https://doi.org/10.1901/jaba.1994.27-177))
- **State plainly: no source was found comparing immediate vs delayed re-presentation of a missed item in typically developing preschoolers.** The immediate-correction evidence is all n ≤ 5 single-case work in clinical populations. [uncertain]
- **Errorless learning is contested — do not oversell it.** Errorless procedures reliably reduce errors *during training*; whether they produce lasting advantages in learning or retention is not established. A preschool dissertation found the **trial-and-error group performed as well as the shaping groups on the criterion test**, and concluded the results "bring into question the overall advantage of errorless over trial-and-error procedures". [evidence, dissertation — the strongest counter-evidence] ([UNM](https://digitalrepository.unm.edu/psy_etds/504))

  The app's current two-strikes-then-dim rule (`engines/quiz.js:113-118`) sits sensibly between errorless and trial-and-error. Keep it.

## 9. Mastery gates: the evidence does not reach this age group

- **Mastery learning works, and works best for the youngest learners studied.** Hattie's synthesis: **d = 0.58** overall, **d = 0.94 for elementary vs d = 0.72 for high school** — effects decrease with student age. The operational bar is "a high level of success, **typically at about the 80% level**". [evidence] ([Evidence for Learning toolkit](https://evidenceforlearning.org.au/education-evidence/australasian-research-summaries/teaching-and-learning-toolkit/mastery-learning))
- **Kulik, Kulik & Bangert-Drowns (1990)**, *RER* 60(2):265–299, **108 controlled evaluations**, mean effect ≈ **0.52 SD**, stronger for weaker students. [evidence for the meta-analysis; secondary for the exact 0.52, which came from a summary rather than the original] ([SAGE](https://journals.sagepub.com/doi/10.2190/FG7X-7Q9V-JX8M-RDJP))
- **⚠ The counter-evidence is serious.** Slavin (1987), best-evidence synthesis of group-based mastery learning programs ≥ 4 weeks: "essentially **no evidence** to support the effectiveness of group-based mastery learning on standardized achievement measures"; median effect ≈ **0.25 SD**; effects on experimenter-made measures were positive but with little evidence of maintenance. Kulik et al. published a critique; Slavin replied. [evidence] ([ORBi record](https://orbi.uliege.be/handle/2268/10875), [Slavin's later clarification](https://ascd.org/el/articles/outcome-based-education-is-not-mastery-learning))
- **⚠ And the most relevant caveat of all: "the approach appears to be much less effective when pupils work at their own pace."** EEF Teaching & Learning Toolkit, mastery learning: headline **+5 months**, **primary +8 months vs secondary +3**, mastery bar "usually 80% to 90%". [evidence — figures read via a council reproduction of the toolkit; verify on the live EEF page before quoting] ([EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/mastery-learning), [reproduction](https://www.lancashire.gov.uk/media/934548/teaching-and-learning-toolkit-ordinarily-available-provision.pdf))
- **Guskey's mastery cycle is the design template**: brief formative check → feedback → **correctives matched item-by-item**, so the child revisits only what was not mastered → **retest with a different formative test after one or two periods**; those already at mastery get enrichment. [evidence] ([Marshall Memo summary](https://marshallmemo.com/issues/bdfbeea965daab7a18c96540f7e8928a/MarshMemo105.pdf))
- **The honest gap: no study anywhere tests mastery gating versus completion-based progression with 3-to-5-year-olds, in software or otherwise.** Hattie's "elementary" band is the youngest data point and even that is not 3–5. Anyone claiming mastery gates are evidence-based for preschoolers is extrapolating. [uncertain]

### What *is* evidenced for this age

- **Scaffolded feedback and gradual leveling, measured directly on preschoolers.** Callaghan & Reich (SRCD 2019): **240 predominantly low-income preschoolers aged 4–5**, 3×2 between-subjects, custom app teaching three novel category names. **Scaffolded verbal feedback that named the specific item the child selected produced the highest accuracy** (F(2,120) = 4.98, p < .01), strongest when children met feedback tasks from the start. **Gradually increasing challenge produced faster *and* more accurate responses than random ordering** (p < .001). Non-verbal sound feedback made children work faster (F(2,240) = 3.44, p < .05). [evidence] ([Reach Every Reader summary](https://reacheveryreader.gse.harvard.edu/which-mobile-app-feedback-and-leveling-designs-best-scaffold-preschool-learning), [eScholarship record](https://escholarship.org/uc/item/4rd5s8r1))
- **Warm, non-punitive responses to error promote persistence.** 4–6-year-olds who received **emotion-validating** feedback persisted longer than those given invalidating or no feedback. [evidence] ([SKKU](https://pure.skku.edu/en/publications/your-feelings-are-reasonable-emotional-validation-promotes-persis/))
- **Competence and autonomy are what separate effective from ineffective early-years interventions.** A scoping review of **19 preschool self-regulation interventions (2010–2020)** found that targeting competence through encouragement and feedback, and nurturing autonomy, distinguished more- from less-effective interventions; relatedness was least discriminating. [evidence] ([PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8878745/))
- **Challenge is not the enemy of mastery motivation; harsh feedback is.** NAEYC: persistence on hard tasks predicts later achievement, and children who are **not** given challenging activities, or who receive negative or harsh feedback, show **less** mastery motivation. [evidence, read via search excerpt — naeyc.org blocks automated fetch] ([NAEYC](https://www.naeyc.org/resources/pubs/yc/nov2016/mastery-motivation-persistence-problem-solving))
- **⚠ Do not overclaim learned helplessness.** A 1980 study across K–grade 5 found failure had significantly **less** influence on helplessness in younger children, attributed to attributional capability still developing. Most primary helplessness work is from the 1980s and none tests preschoolers under modern methods. The "gating causes learned helplessness in 3-year-olds" argument is plausible but **not well evidenced**. [evidence + uncertain] ([thesis](https://research.library.mun.ca/1375/3/Corcoran_Carolyn.pdf))
- **⚠ Promised rewards can undercut existing interest.** Lepper, Greene & Nisbett (1973): preschoolers who already enjoyed drawing and were **promised a certificate in advance** drew less in later free time than unexpected-reward or no-reward groups. Secondary sources disagree on the sample size, so cite the paper, not the blogs. [evidence, details second-hand] ([overview](https://www.psychologynoteshq.com/overjustification-effect/))

**Net read [our inference]:** the defensible position is a **soft gate** — adapt the next item on performance, re-present missed content, steer what is *recommended*, and never block the child. Both a hard mastery gate (no direct evidence for 3–5s) and pure time-served progression (where the EEF says mastery approaches lose their effect) are worse.

## 10. What comparable apps actually do

Caveat first: **not one of the six major vendors publishes an item count per activity.** If a number like "5 questions per activity" is needed, it has to come from hands-on instrumentation, not from the literature. [uncertain]

- **Wink (단비교육 Danbi Education)** — the app this curriculum is modelled on, and the most useful source here because the numbers are first-party. From wink.co.kr [vendor]:
  - **10–20 minutes per day** ("학습량을 하루 10~20분 수준으로 부담 없이 구성하고"), designed as "short, high-concentration sessions of around 20 minutes/day".
  - Its stated rationale: a preschooler's attention span is "under 5 minutes" (**a vendor assertion with no citation**).
  - A **4-step** learning cycle per concept: understand → apply in games/quizzes → **reinforce through repetition and correction of errors** → consolidate via the paper workbook.
  - **"오답만 다시"** — the child can review **only the incorrect items and repeat them**. This is the clearest wrong-answer design statement found for *any* app in this study, and Animal Friends copied the 4-step road but **not** this.
  - Parents set the daily usage time directly; the device signals break time.
  - **Not published**: the number of 단계 (stages), lessons or activities per day, or any rule for advancing between stages. Level changes appear to be a manual/commercial action (a free device swap by stage or interest), i.e. **parent-initiated placement, not an automatic mastery gate**. Wink is a **time-based daily-habit design**, not a count-based or mastery-based one. [uncertain / inferred] ([wink.co.kr](https://www.wink.co.kr), [third-party comparison](https://academy.prompie.com/edu-services/smart-learning/products/윙크))
- **Khan Academy Kids**: ages 2–8, "over 4,000 activities", a "personalized path that grows with them". **Lesson length, activities per path segment and items per activity are not published anywhere.** The only duration figure is *observed usage* in its RCT: Arnold et al. (2021), *Journal of Children and Media*, N = 49 four- and five-year-olds from low-income communities, 10 weeks, randomised against non-literacy apps — **13 minutes/day average actual use**, emergent literacy 34th → 47th percentile, phonological awareness 23rd → 47th. Children using ≥ 1 hour/week gained more than double. [evidence for the design; vendor for the numbers; note n = 49 is small, no effect sizes published, and the ≥1hr/week finding is a within-arm dose-response analysis] ([Khan blog](https://blog.khanacademy.org/khan-academy-kids-improves-pre-literacy-skills-in-preschoolers-research-confirms/), [DOI](https://doi.org/10.1080/17482798.2020.1863239)). ⚠ Khan's documented 70–99%-correct mastery system belongs to the **main** Khan Academy platform, **not** Khan Academy Kids.
- **Lingokids**: ages 2–8. Its own sources contradict each other on lesson structure — the blog says diagnostic → **3–4 units** → revision unit → final assessment, "the entire experience takes about an hour"; the press release says **8–10 units** and **1–2 weeks**. Recommended **15–30 minutes/day** (reported in a trade outlet, not on Lingokids' own site). A third-party reviewer counted **10 units with 34–77 activities each**, with one unit unlocking the next. **No unlock rule, no score threshold, no mastery gate is published, and the wrong-answer behaviour is documented nowhere.** The "90% of children who complete a Lesson show skill improvement" claim has no sample size, control group or definition. [vendor, inconsistent / secondary] ([methodology](https://lingokids.com/blog/posts/lingokids-learning-methodology), [press release](https://lingokids.com/press/new-lingokids-feature-proves-90-effective-in-improving-childrens-skill-learning-abilities), [third-party review](https://childrenandmedia.org.au/app-reviews/apps/lingokids))
- **Duolingo ABC**: **127 units** per Common Sense Media's hands-on review (other sources say 300 or 700+, unreconciled). **Progression is strictly sequential completion, not mastery** — "kids must complete each successive game to unlock the next", with no published score threshold. One review reports a **hearts** system (a wrong answer costs a heart, replenished on advancing); Common Sense does not mention it. Lesson length and exercises per lesson are **not published** — the widely quoted "3–4 minutes" is a university blog's estimate of the **main** app. [secondary / uncertain] ([Common Sense](https://www.commonsensemedia.org/app-reviews/duolingo-abc-learn-to-read), [Imagination Soup](https://imaginationsoup.net/duolingo-abc-literacy-app/), [Duolingo method](https://blog.duolingo.com/duolingo-teaching-method/))
- **ABCmouse**: a **10-level** Step-by-Step Learning Path containing **850+ lessons** inside **10,000+ activities**; separate Reading and Math paths set independently by the parent; each "adventure" ends in a **"Show What You Know" quiz**. **No mastery threshold or quiz pass mark is published** — advancement reads as completion-based. ⚠ Changing a level **resets completed activities on that path**. All efficacy research is authored by Age of Learning staff with no independent replication. [vendor / uncertain] ([learning path guide](https://www.abcmouse.com/learn/abcmouse/unlocking-early-learning-success-a-guide-to-abcmouses-learning-path/7966))
- **Endless Alphabet** — the clearest published "no-fail" statement found: designed so "there are **no high scores, failures, limits or stress**". It is not feedback-free: a wrong letter produces a sad "uh uh" cue, the target phoneme **keeps sounding until the letter is placed correctly**, and the child simply retries in place. **Immediate corrective feedback, no fail state, no penalty, infinite retries.** [vendor via a review that quotes the creators / secondary] ([Education World](https://www.educationworld.com/a_tech/ipad-app-review/endless-alphabet.shtml), [SLJ](https://www.slj.com/review/endless-alphabet))
- **The market's known weakness, and it is exactly ours:** content analyses converge on the finding that positive feedback for correct answers is near-universal in preschool apps, but **feedback that explains why an answer was wrong is rare** — apps mostly respond with a sound effect, an X, or a generic prompt. In one coded sample, **none** of the error responses explained why the choice was wrong. [evidence / secondary] ([EdWeek](https://www.edweek.org/teaching-learning/bad-teaching-for-preschoolers-there-are-lots-of-apps-for-that/2018/08), [Kidscreen](https://kidscreen.com/2018/11/23/why-kids-apps-need-an-educational-makeover))
- **Re-presenting missed items within a session: only Wink documents it.** Lingokids has a revision *unit* (lesson scale, not within-session). Duolingo's main app claims practice sessions that "strengthen the skills where you could use the most help" but does **not** name spaced repetition or missed-item re-presentation. Guskey's model supplies the template. [vendor / evidence]
- **Reducing the number of answer choices after an error** was searched for explicitly: **no study and no vendor documentation of the pattern in any preschool app.** It is plausible and consistent with Callaghan & Reich's gradual-leveling finding, but it is undocumented. Animal Friends already does it (`engines/quiz.js:113-118`) — a point in its favour, not a gap. [uncertain]

---

# PART C — What to change in Animal Friends

Design principle for all of it: **keep the lesson short; make the item come back.** The attention evidence says a 2–3.5 minute lesson is fine. The repetition evidence says ~4 exposures per item is nowhere near enough. Those two facts together point at spacing and re-presentation, not at longer levels.

## 11. Recommendations, ranked by impact ÷ effort

| # | Change | Target numbers | Impact | Effort | Risk to saved progress |
|---|---|---|---|---|---|
| **R1** | **Missed-item queue inside the lesson** | Re-ask each missed item **twice**: once at the end of its step, once at the end of the lesson. Cap at **4 extra rounds** per lesson. The retry **never** adds a second mistake | **High** | Low–Med | **None** |
| **R2** | **Reserve 2 quiz rounds for earlier lessons** | Quiz **4 → 6 rounds**: 4 on this lesson's new items (guaranteed, not probabilistic), 2 drawn from the previous two lessons of the same subject | **High** | Low | **None** |
| **R3** | **Trace every new item** | `content/phonics.js:46`: `Math.min(3, keys.length)` → `keys.length`. Same audit for every `rounds:` that is smaller than its `set`/`items`/`words` | Med | **Trivial** | **None** |
| **R4** | **Soft mastery gate in Today's Study only** | Don't offer the *next new* lesson in a subject until the previous one has **≥ 2 stars**; offer that previous lesson as a repeat instead. The map stays fully open | **High** | Low | **None** (no change to `isUnlocked`) |
| **R5** | **Make the Review lesson do real work** | **6 → 12 rounds**, drawn from the child's weakest topics using the `help` classification the grown-up screen already computes | Med–High | Med | **None** |
| **R6** | **Surface the stretch** | Show a "harder" badge on 3-star stones; let Today's Study pick a 3-star lesson as a stretch repeat; raise the stretch bonus from +1 to **+1 distractor and +2 rounds** | Med | Low | **None** |
| **R7** | **Help within the session, not only across attempts** | `helpLevel` should also respond to **mistakes so far in this lesson** (≥ 2 → dim one wrong card; ≥ 4 → also replay the prompt), not just lifetime attempts | Med | Low | **None** |
| **R8** | **Name the mistake** | On a wrong tap, say what the child chose and what was asked ("That's *b*. We want the one that says /sss/") rather than only a chime | Med | Med | **None** |
| **R9** | **Default the play limit to 20 min for new profiles** | `core/profile.js:42`: `limit: 0` → `limit: 20` | Low–Med | **Trivial** | **None** (existing profiles keep theirs) |
| **R10** | **Per-item records in the profile** | New additive key, e.g. `items: { moduleId: { itemKey: { seen, missed, lastDay } } }`, to drive true spaced repetition across days | High (long term) | **High** | Low, if additive |
| **R11** | ~~Split long lessons into two~~ | — | Low | Med | **⚠ HIGH — do not do this** |
| **R12** | ~~Require 2 stars to unlock~~ | — | — | Low | **⚠ VIOLATES A NON-NEGOTIABLE — do not do this** |

## 12. The recommendations in detail

### R1 — Missed-item queue (the highest-impact change)

**What:** each engine keeps the round objects it got wrong. At the end of the step, re-ask them. At the end of the lesson, re-ask them once more.

**Numbers:** re-ask each missed item **2 extra times**; cap the extra rounds at **4 per lesson** so a bad day cannot turn a 12-round lesson into 30. A child who makes no mistakes sees no change at all — the lesson stays 12 rounds and 2–3 minutes.

**Why these numbers:** immediate re-presentation buys within-session accuracy that decays by a week; a mixed immediate-plus-spaced schedule is stable ([Leonard et al. 2022](https://doi.org/10.1177/23969415221077652)). Within-session, a **30-second** lag is already enough at age 3 ([Vlach et al. 2008](https://doi.org/10.1016/j.cognition.2008.07.013)) — the end of a step is comfortably more than 30 seconds later. And the whole effect depends on **cued retrieval with immediate feedback**, which the app already does ([Kliegl et al. 2018](https://doi.org/10.3389/fpsyg.2018.01446): 89% vs 42%).

**Where:** `choose` already holds the live round in `cur` (`engines/quiz.js:69`), so queuing it costs a few lines. `pop` holds it too (`engines/touch.js:258`). `sort`, `build` and `match` work from item lists, so the missed item is directly identifiable. `trace`, `intro`, `speak`, `story` and `song` have nothing to re-ask, which is fine — they are the study half of the lesson.

**Fairness:** the retry must not be scored. The first miss already counted; charging again for the retry would punish exactly the child the retry is for, and would mean a 1-mistake lesson could no longer reach 3 stars. Mark retry rounds and skip `S.miss()` on them.

**Respects:** no level id changes, no star record changes, no unlock rule changes. "A misheard word never costs a star" is unaffected (`speak` has no misses to queue). Service-worker version must be bumped (`CLAUDE.md:41`).

### R2 — Reserve quiz rounds for earlier lessons

**What:** change the quiz from `rounds: 4` with a 65% focus probability to `rounds: 6` with **4 rounds guaranteed on the new items and 2 rounds drawn from the previous two lessons**.

**Numbers:** +2 rounds ≈ **+12 s** per lesson (a `choose` round is ~6 s, §3). Per new letter the quiz goes from 0.71–1.00 exposures to a guaranteed **1.0**; each item then also gets **~0.5 exposures in each of the next two lessons**, which is the first real spacing the curriculum would have.

**Why:** total exposures matter and the per-session split does not ([Storkel et al. 2019](https://pubs.asha.org/doi/pdf/10.1044/2019_LSHSS-VOIA-18-0131)); spacing across days matters most for production ([Childers & Tomasello 2002](https://www.gwern.net/doc/psychology/spaced-repetition/2002-childers.pdf)); gradually increasing challenge beats random ordering in preschoolers (Callaghan & Reich 2019). Making the new items **guaranteed** rather than 65%-likely is the "gradual leveling" half; the 2 carried-over rounds are the spacing half.

**Where:** `content/bank.js:240-259` (`letterSound` and its siblings) and the `gen:` lines in `content/phonics.js`, `english.js`, `math.js`, `bahasa.js`. The cleanest shape is a new generator wrapper — `G.mixNew(newItems, oldItems, n)` — rather than editing 98 `quiz/choose` step definitions by hand.

**Respects:** `rounds` is not part of a level's identity, so saved stars keyed by id are untouched (`core/profile.js:135-150`).

### R3 — Trace every new item

`content/phonics.js:46` is `rounds: Math.min(3, keys.length)` with four new letters, and `engines/trace.js:102-103` shuffles the pool, so **one of the four new letters is never written**. Changing `3` to `keys.length` costs ~10 s per lesson and closes a hole that is pure loss. Audit the same pattern everywhere a `rounds:` is smaller than the set it draws from (`sort` at `engines/touch.js:34`, `build` at `engines/quiz.js:236`, `speak` at `engines/voice.js:33`) and decide each case deliberately rather than by accident.

### R4 — Soft mastery gate, in the recommendation only

**What:** in `todayPicks()` (`core/app.js:324-383`), when choosing a core subject's item for the day, check the previous lesson's stars. If it has **1 star**, offer **that lesson again** as `kind: 'review'` instead of advancing to the next new one. At **2 or 3 stars**, advance.

**Numbers:** the gate is **≥ 2 stars**, i.e. ≤ 4 mistakes across the lesson (`core/levels.js:33`). That is close to the 80% bar the mastery literature uses, without being a pass mark the child can fail.

**Why this shape and not a real gate:** mastery learning's effect sizes are real and largest for the youngest learners studied (Hattie d = 0.94 elementary; 80% bar), but **no study tests mastery gating with 3–5 year olds**, Slavin's synthesis found near-zero effects on standardized measures, and the EEF notes the approach is "much less effective when pupils work at their own pace" — which is exactly this app. Meanwhile child choice is what sustains preschool attention (DiCarlo 2016, replicated at N = 40/63/93), and promised rewards can undercut existing interest (Lepper 1973). So: steer, don't block.

**Respects every non-negotiable:** `isUnlocked` is not touched, so nothing is ever re-locked and the "a level with stars is never locked" rule holds verbatim. The map stays fully explorable. Saved stars are only read.

### R5 — Make the Review lesson review

**What:** `review` steps go from 6 rounds to **12**, and the generator draws from the topics the child is weakest on rather than uniformly from the whole stage.

**Numbers:** 12 rounds over Phonics Step 1's 26 letters is still only 0.46 exposures per letter — but weighted toward the weak ones it becomes several exposures where they are needed. A 12-round review lesson is ~2 min of quiz, still inside the band in §6. The Review lesson is the one place in the curriculum where growing the round count is clearly right: today it is the same 10 rounds as a teaching lesson while covering 6× the material (all 17 Review lessons are exactly 10 rounds [measured]).

**The data already exists.** `core/app.js:938-947` classifies each topic as `sure` / `going` / `help` / `not` from `P.stars` and pushes the `help` ones into `practise`. Move that classification into `core/levels.js` or `content/bank.js` so a generator can read it, and the Review lesson can ask about what actually needs practice. This is Guskey's "correctives matched item-by-item" ([template](https://marshallmemo.com/issues/bdfbeea965daab7a18c96540f7e8928a/MarshMemo105.pdf)) with the app's own existing signal.

### R6 — Surface the stretch

`stretch` (`core/levels.js:94-97`) exists, fires only on 3-star replays, adds exactly **one** extra option, and is invisible. Make it: **+1 distractor and +2 rounds**, a "harder" badge on 3-star stones, and eligible for Today's Study as a repeat. That turns the 121 already-cleared lessons into usable practice instead of dead weight, which matters a lot once the child is moving fast. Gradually increasing challenge is the leveling design that beat random ordering in Callaghan & Reich's N = 240 preschool study.

### R7 — Help within the session

`helpLevel` reads **lifetime attempts** (`core/levels.js:85-92`), so a child struggling in the middle of her first attempt gets no help until the second. Add an in-session trigger: at ≥ 2 mistakes so far in this lesson, dim one wrong card after 3,200 ms; at ≥ 4, also replay the prompt at 8,000 ms. The thresholds and timings already exist (`engines/quiz.js:93-100`) — only the trigger changes. Note the existing per-round rule (2 misses on one question → wrong cards become untappable) is separate and should stay.

### R8 — Name the mistake

Today a wrong tap gets a chime, a shake and the friend's "hmm" (`engines/quiz.js:45-51`). The one directly-measured preschool app study found that **feedback naming the specific item the child selected** produced the highest accuracy (Callaghan & Reich 2019, F(2,120) = 4.98, p < .01), and content analyses find this is precisely what the preschool app market does not do. It must stay gentle — emotion-validating feedback promotes persistence in 4–6-year-olds — and it must stay free of stars. Cost: new recorded lines, so this is the highest-effort item in the "do it" list; it needs the `tools/voice` pipeline and the pacing targets in `docs/research/kids-audio.md`.

### R9 — Default the play limit

`core/profile.js:42` defaults `limit: 0` (Off). Wink's own first-party design target is **10–20 min/day**; the app's README and grown-up screen already say 10–15 and draw a 15-minute line. Defaulting new profiles to **20** matches both and is safe: `load()` merges saved settings **over** the blank defaults (`core/profile.js:65`), so an existing profile keeps whatever the grown-up chose. Note the AAP/WHO figure is 1 hour/day as a *ceiling*, not a target.

### R10 — Per-item records (the real fix, later)

Everything above is a workaround for one missing data structure: **the profile has no idea which letters, words or numbers the child knows.** `core/profile.js:8-19` stores stars per level, attempt counts per level, and an aggregate mistake count per level — never an item. Until that exists, true spaced repetition across days is impossible, and the app can only space at the granularity of whole lessons.

If it is built: add it as a **new additive key** (e.g. `items`), include it in the guard list at `core/profile.js:78`, and never make any existing behaviour depend on its presence. `load()` uses `Object.assign`, so an older saved profile simply arrives without the key. Keep it small — a few hundred item keys with 3 small fields each is a few KB of localStorage. This also finally lets the Review lesson and Today's Study pick *items* rather than *levels*.

## 13. What not to do, and why

- **R11 — Do not split existing lessons into two shorter ones.** A lesson's id is permanent because saved stars are keyed by it (`CLAUDE.md:22-24`, `core/profile.js:135-150`). New ids would orphan the old records: `allStars()` still counts them so the **total never drops**, but the new sequence's `isUnlocked` chain would start from zero (`core/levels.js:37-46`), so a child who had cleared Step 1 would find it locked again. That breaks "a level that already has stars is never locked" by the back door. **This is the one recommendation on the list with a real risk of breaking saved progress.** If a lesson ever must be split, the first half must keep the original id.
- **R12 — Do not raise the unlock bar to 2 stars.** `isUnlocked` returning false for a level the child already cleared with 1 star is exactly the re-locking the 2026-10-13 decision forbids (`CLAUDE.md:25-27`). R4 achieves the same pedagogical effect through the recommendation instead.
- **Do not lengthen teaching lessons past ~16 rounds.** The only randomised session-length test on pre-primary children favoured **shorter** (5 over 9 minutes), group engagement falls past 20 minutes, experienced practitioners land at 11–15, and sustained attention stops improving at about age 4. Growing the lesson is the intuitive fix and the evidence is against it.
- **Do not make stars depend on time.** `core/levels.js:6` ("Stars measure MISTAKES, never time. No countdowns anywhere") is right and nothing in the research argues otherwise.
- **Do not judge any of these changes by within-session scores.** In 2-year-olds, simultaneous/massed presentation **wins at immediate test and loses after 15 minutes** ([Vlach, Ankowski & Sandhofer 2012](https://doi.org/10.1037/a0025260)). Stars, which are computed inside one sitting, will systematically flatter massing. Judge R1, R2 and R5 by whether Naura still gets items right **the next day** — which the app can show once `noteResult` history or R10's item records exist.
- **Do not build on interleaving.** No study tests interleaved vs blocked practice in 3–5 year olds with a reportable number, and the apparent preschool citation for it is a miscitation (§8.2).

## 14. Before changing anything: check the diagnosis

The app already has the measurements:

1. Open the grown-up area and read **minutes/day for the last 7 days** against the 15-minute line (`core/app.js:916-922`).
2. Read **lessons cleared** out of the total (`core/app.js:900-913`).
3. If minutes/day is at or under 15 while lessons cleared is climbing by several a day, the problem is confirmed as **too little practice per lesson, not too little time**, and R1 + R2 + R4 are the right three.
4. If minutes/day is well over 20, the problem is a marathon session as well, and R9 belongs in the first batch.
5. `P.result(mod, lvl).ms` holds a rolling average of thinking time per round (`core/profile.js:184-192`) but is not surfaced anywhere. Printing it in the grown-up report — even just as "about N seconds a question" — would turn every number in §3 of this document from a model into a measurement.

---

## Appendix A — Method

**Curriculum counts.** The content files were loaded in Node with `window`, `document` and `AF.Icon` stubbed, and `AF.registry` was walked. A step's round count is `rounds` where present, else `cards.length` (`intro`), `fixed.length`, `pick || sets.length` (`order`), `pages.length` (`story`), `n` (`memory`), or `set.length` (`trace`). `maze`, `code`, `song` and `breathe` levels have no round count in their data and are excluded from the round totals. This produced 13 modules, 218 levels, 121 lessons (all four core subjects), 1,498 core rounds and 17 Review lessons.

**Speech durations.** `voice/index.js` maps each line of the script to a hash under `voice/`. The clips are MP3 CBR 64 kbps mono 24 kHz (`docs/research/kids-audio.md` §2), so duration was taken as `bytes × 8 / 64000`. Across 3,432 clips: p10 0.77 s, p25 1.39 s, **median 2.18 s**, p75 3.19 s, p90 4.42 s, max 7.90 s. Per-lesson spoken seconds were summed over `AF.Engines.linesOf(level)`, which enumerates a level's **static** lines only — generator-produced quiz prompts are not in it, so the per-lesson figures (Phonics median 23.5 s, English 63.2 s, Math 77.7 s) are **lower bounds**. **Bahasa is excluded**: it is spoken by the device's Indonesian voice (`CLAUDE.md:28-30`), so almost no clips exist and the measured 3.2 s is not meaningful.

**Lesson length model.** Each step's duration was built from the code's own waits (table in §3) plus the median clip length, plus 1–3 s of child response time per round. `S.after(fn, ms)` waits `ms` and **then** waits for speech to finish (`engines/base.js:182-190`), so a step's floor is `max(wait, remaining speech)`. The "~80 s floor" for `ph1-1` sets child response time to zero. Labelled **[modelled]** throughout: it should be replaced with the app's own `minutesToday()` and `result().ms` as soon as those are read (§14).

**Exposure counts.** Computed per step from the level data. For `G.letterSound(pool, n, focus)` the probability that a round targets a new item is `0.65 + 0.35 × |focus| / |pool|` (`content/bank.js:243`), which gives the §4.2 table. `trace` shuffles its set and takes `rounds` of it (`engines/trace.js:102-103`), hence 3/4 = 0.75. `pop` needs 3 correct taps per round over 3 rounds with `ctx.last` avoidance, hence ~2.25 per letter. `match` with `rounds: 1, n: 4` shows each of the four pairs once.

**Web research.** Two parallel research passes, roughly 42 distinct searches and 50 page fetches. Several sites block automated fetch and the numbers attributed to them were read via search excerpts or third-party reproductions, which is noted inline: `publications.aap.org`, `educationendowmentfoundation.org.uk`, `naeyc.org`, `journals.sagepub.com`, `help.lingokids.com`, `support.khanacademy.org`, `support.abcmouse.com`, `umass.edu/news`. **Verify any figure so labelled before quoting it outside this repo.** Search results for "Teach Your Monster to Read" efficacy are heavily polluted by AI content-farm spam inventing "studies" and session-length numbers; none of it was used.

## Appendix B — Where the evidence is thin, contested or absent

**Absent — no source found giving a number:**
1. Optimal lesson or session length for a 3–5 year old on a touchscreen. Only the EdTech Hub 5/7/9-minute brief exists, it is grey literature, and its companion paper reports a null.
2. A measured "minutes of attention at age 4" from any peer-reviewed study. The "2–3 minutes per year of age" rule has **no primary source**, and neither do the 8–12 / 10–20 min table values.
3. Mean attention duration in seconds or minutes in the DiCarlo/Geary child-choice studies — three studies, consistent direction, zero published magnitudes.
4. Trials to criterion for a letter-sound correspondence in a typically developing 4-year-old.
5. Repetitions needed for a 3–5 year old to learn a number word or cardinality concept.
6. Direct Instruction / Reading Mastery's mastery-criterion percentage, from any authoritative source.
7. Immediate vs delayed re-presentation of a missed item in **typically developing** preschoolers.
8. Items per activity for Khan Academy Kids, Lingokids, Duolingo ABC, ABCmouse, Teach Your Monster or Wink — **not one of the six publishes it.**
9. Lessons or activities per day for Wink, or any rule for how a child advances between its stages.
10. Any figures for Moyer & Gilmer (1955) or Choudhury & Gorman (2000) — do not cite these with numbers.

**Contested:**
11. EdTech Hub's "shorter sessions are better" against the Nairobi A/B/C null.
12. Mastery learning: Hattie d = 0.58 / 0.94 elementary and Kulik ~0.52 against Slavin's near-zero on standardized measures — and the EEF's "much less effective when pupils work at their own pace".
13. Errorless learning: a preschool dissertation found trial-and-error matched shaping on the criterion test.
14. Spacing direction **reverses** with test delay in 2-year-olds. Within-session metrics will mislead.
15. Retrieval practice in preschoolers is **zero** without cued retrieval plus immediate feedback, and has failed outright in storybook contexts.
16. Khan Academy Kids' own figures differ across sources: 49 children / 13 min/day / 10 weeks (vendor blog), 3 months / ~20 min/day target (UMass), 50 children (Education Week).
17. Lingokids contradicts itself: 3–4 units and "about an hour" (blog) vs 8–10 units and 1–2 weeks (press release).

**Thin:**
18. Spacing in under-5s: the researchers who study it state that "very few studies have been conducted with children aged 0–5" (Knabe & Vlach 2020).
19. Interleaving in 3–5 year olds: asserted in a review via an apparent miscitation; the one clean blocked-vs-interleaved child study (ages 6–10) is null.
20. Two separate preschool letter RCTs at ~10–15 min/session produced null or WWC-indeterminate effects on the taught content — the 10–15 minute convention is **not** validated.
21. No study anywhere tests **mastery gating vs completion-based progression with 3-to-5-year-olds**. Every recommendation in §11 that touches gating is an extrapolation, and R4 is deliberately the weakest form of it.
