# Spoken audio for children aged 3 and up: research and comparison with Animal Friends

Researched 2026-10-13. Scope: what makes recorded speech slow, clear and easy to follow for 3- to 5-year-olds, and how the Animal Friends voice pipeline (`tools/voice/gen.mjs`, `gen_cb.py`, `post.py`, `mp3.mjs`, `animal-friends-v2/core/audio.js`) compares.

How to read the labels:
- **[evidence]**: peer-reviewed study or official guidance, read at least as an abstract.
- **[secondary]**: a number reported by someone other than the original authors; I could not check it against the original.
- **[expert opinion]**: a practitioner's figure with no published method behind it.
- **[vendor]**: a vendor's own documentation or claims.
- **[our inference]**: a recommendation derived from the sources, not stated in any of them.
- **[measured]**: measured by me on this repo's files (method in Appendix A).

No study gives one "correct" words-per-minute figure for 3-year-olds listening to an app. The numbers below are a target range built from several kinds of evidence, and they should be checked by listening with real children.

---

## 1. Summary of recommendations

| # | Recommendation | Target number | Status today |
|---|---|---|---|
| 1 | Get slowness from **pauses and a calmer take**, not from heavy time-stretching | Stretch no more than **1.3x** (WSOLA). Raw take at **≤ 170 WPM** before stretching | Raw takes have a median of **223 WPM**. **49%** of lines hit the 1.6x stretch cap. The mean stretch is **1.46x** [measured] |
| 2 | Overall speaking rate for instructions | **110–130 WPM** (aim for 120), about **2.0–2.3 syllables/s** including pauses. **No clip above 150 WPM** | Median **143 WPM**, p90 **184 WPM**, **2.95 syl/s** [measured] |
| 3 | Pauses | **600–800 ms** between sentences. **300–500 ms** before the target word. **≥ 250 ms** is the minimum a child can notice | Sentence gaps have a median of **~0.38 s**. Gaps inside lines have a median of **0.19 s** [measured] |
| 4 | Pure phonemes | Continuous sounds (/s/ /m/ /f/ /l/ /n/, vowels) held **~0.8–1.0 s** alone. Unvoiced stops (/p/ /t/ /k/) as a **burst only, ~60–150 ms, no "uh"**. /b/ /d/ /g/ /j/ with only a **tiny** schwa | Prompts are spelled "tuh", "puh", "kuh", so the schwa is built in. Sound clips skip all post-processing [measured, code] |
| 5 | Blending | Model **connected phonation** ("sssuuunnn"), then a **600–800 ms** pause, then the whole word at normal speed. If sounds are shown separately, use **~400–600 ms** gaps | "buh … uh … guh" lasts 1.09 s with almost no gaps. The "…" prompts rarely make pauses [measured] |
| 6 | Speech must stand clear of everything else | Voice **≥ 10 dB** above any music, chime or ambience playing at the same time. Never start speech on top of a chime | The "right" chime (~0.46 s) is followed straight away by speech in `maze.js:200-202`, `quiz.js:210-211` and `quiz.js:313-315` [code] |
| 7 | Loudness | **−16 LUFS integrated (±1)**, true peak **≤ −1 dBTP**, using a limiter rather than turning the whole clip down | ≈ **−18.5 LUFS** median (p10 −19.9). The peak is handled by scaling the whole clip [measured, code] |
| 8 | Friend voices | The pitched-up friend must not push pace over the target. Cap speed-up at **≤ 1.03x**, or pitch-shift offline without changing speed | The squeaky friend plays at **1.06x** speed and +1 semitone (`audio.js:182`) [code] |
| 9 | Prosody | Higher, wider pitch. Short sentences. **Target word last in the sentence, with a pitch peak**. Repeat it in the next sentence | The script is already short (median 3 words per sentence, max 10) [measured]. The prosody is left to Chatterbox |
| 10 | Format | Keep **MP3 mono 24 kHz at 48–64 kbps** (inside Apple's 40–80 kbps band for 22/24 kHz mono). Consider Opus at 24–32 kbps later | MP3 64 kbps mono 24 kHz: fine |

---

## 2. Our current settings compared with the recommendations

| Setting | Ours now (file) | Recommended | Sources |
|---|---|---|---|
| Engine and style | Chatterbox, `lively` = exaggeration 0.8, cfg_weight 0.3, default built-in voice, temperature 0.8 (`gen.mjs:20`, `gen_cb.py`) | Exaggeration **0.5–0.6** for instructions and phonics. Keep 0.7–0.8 for short praise only. cfg 0.3. Add a slow, warm reference clip (with consent) | Chatterbox README: higher exaggeration tends to speed speech up, and lower cfg slows pacing [vendor] ([GitHub](https://github.com/resemble-ai/chatterbox)) |
| Raw speaking rate | Median 223 WPM, p10 158, p90 293 (1,263 lines of ≥ 3 words) [measured] | ≤ 170 WPM raw, so that a ≤ 1.3x stretch reaches the target | Time-stretch quality falls as the factor moves away from 1, and slowing down is perceived worse than speeding up ([Roberts & Paliwal 2020](https://doi.org/10.1121/10.0001567)) |
| Take rejection | `plausible()` accepts 0.45x–2.4x of len/14 chars/s (`gen_cb.py:18-21`) | Also reject takes faster than ~180 WPM, or longer than ~2x the expected length (catches garbles such as "eye" = 2.45 s) | [our inference] |
| Target WPM after post | `TARGET_WPM = 140`, `MAX_STRETCH = 1.6`, `SHORT_STRETCH = 1.15` (`post.py:19-21`) | Overall **120** (110–130). Max stretch **1.3–1.35**. Make up the rest with pauses | Section 3 |
| Achieved WPM | Median 143, p10 123, p90 184 [measured] | 110–130, and no clip above 150 | Section 3 |
| Pauses | `breathe()` adds 60–220 ms to every gap ≥ 30 ms (`post.py:43`) | Sentence boundary 600–800 ms. Comma or phrase 300–400 ms. Before the target word 300–500 ms. Leave short gaps inside a phrase alone | [Fernald et al. 1989](https://doi.org/10.1017/S0305000900010679), [Read 2014](https://doi.org/10.3389/fpsyg.2014.00149), [Read et al. 2019](https://doi.org/10.1177/0142723719846583) |
| Letter sounds | No stretch and no pauses (`post.py` `sound` branch). `SOUND_SPEED = 0.75` only changes the cache hash and exaggeration (0.5). Chatterbox gets no speed setting (`gen.mjs:24,124`). `Audio.sound()`'s `rate: 0.55` only affects the device-voice fallback (`audio.js:297`) | Continuants 0.8–1.0 s. Stops as a pure burst. No schwa on unvoiced sounds | [DfE Reading framework, App. 6](https://assets.publishing.service.gov.uk/media/664f600c05e5fe28788fc437/The_reading_framework_.pdf), [NCIL](https://improvingliteracy.org/wp-content/uploads/2025/07/ncil-how-to-use-systematic-phonics-instruction-in-your-classroom.pdf) |
| Blends | TTS reads "buh … uh … guh": 1.09 s, inner gaps 0.01 s [measured]. The build-a-word celebration line (`quiz.js:315`, e.g. "buh … uh … guh … bug!") does not seem to be in `phrases.json`, so it probably plays in the device voice at rate 0.7 (worth checking) | Build blends from clean phoneme clips: connected phonation, then 600–800 ms, then the word | [Gonzalez-Frey & Ehri 2020](https://doi.org/10.1080/10888438.2020.1776290) |
| Time-stretch | audiotsm WSOLA, frame 1024 / hop 256 at 24 kHz (`post.py:29`) | WSOLA is fine up to ~1.3x. For bigger factors use pitch-synchronous OLA (Praat PSOLA) or Rubber Band R3. Lengthen vowels and pauses rather than stretching everything evenly | [Roberts & Paliwal 2020](https://arxiv.org/abs/2006.00848), [Praat manual](https://www.fon.hum.uva.nl/praat/manual/Sound__Lengthen__overlap-add____.html), [Picheny et al. 1989](https://doi.org/10.1044/jshr.3203.600) |
| High-pass | 70 Hz, 2nd order (`post.py:66`) | ~100 Hz (phone speakers reproduce little below a few hundred Hz). Optional +2 dB presence at 2–4 kHz | [Krause & Braida 2004](https://doi.org/10.1121/1.1635842) (clear speech has more 1–3 kHz energy). Speaker roll-off is general engineering knowledge, not a cited figure |
| Loudness | RMS to −18 dBFS, then the whole clip scaled down if the sample peak is above 0.89 (`post.py:67-71`). Measured −18.5 LUFS median, p10 −19.9 | −16 LUFS integrated ±1, true peak ≤ −1 dBTP, a limiter (not whole-clip gain) | [Apple Podcasts audio requirements](https://podcasters.apple.com/support/893-audio-requirements) [vendor]. EBU R128 s2 allows −20 to −16 for streaming ([EBU](https://knowledgehub.ebu.ch/files/live/sites/tech/files/shared/r/r128s2v2_0.pdf)) [secondary summary] |
| Lead and tail silence | Adds 80 ms and 150 ms, but `mp3.mjs` then trims to the first sample above 0.008 minus 40 ms, plus 120 ms of tail (`mp3.mjs:6`) | Keep ~80–100 ms of lead silence so iOS does not clip the first phoneme. Do not trim twice | [our inference] |
| Format | MP3, mono, 24 kHz, 64 kbps (`gen.mjs:92`) | Keep. Apple lists 40–80 kbps for mono at 22.05/24 kHz | [Apple](https://podcasters.apple.com/support/893-audio-requirements) [vendor], [caniuse Opus](https://caniuse.com/opus) |
| Friend pitch | `playbackRate` 0.93–1.06 with `preservesPitch = false` (`audio.js:182,195`). Squeaky = 1.06x speed | ≤ 1.03x speed-up, or offline pitch variants that keep the duration | [MDN preservesPitch](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch) |
| SFX and speech overlap | Chime and speech start together in several engines | Speech starts after the chime ends, or the chime is ducked at least 10 dB below the voice | [McMillan & Saffran 2016](https://doi.org/10.1111/cdev.12559), [Leibold & Buss 2019](https://doi.org/10.3389/fpsyg.2019.01981) |
| Fallback voice | Device `speechSynthesis`, local voices first, rate 0.85 | Keep (privacy). Lines with no recording should be rare | Section 7 |

---

## 3. Speech rate and pauses for ages 3–5

### What the research says

- **Child-directed speech (CDS) is slower than adult speech, mostly because it has more and longer pauses and longer final syllables.** In a six-language study, mothers and fathers both used shorter utterances and longer pauses when talking to infants [evidence] ([Fernald et al. 1989](https://doi.org/10.1017/S0305000900010679)). In one study, the overall slowing in infant-directed speech went away once the utterance-final syllable was left out of the rate calculation, so much of the slowing is final lengthening [evidence] ([Church et al. 2005](https://jcaa.caa-aca.ca/index.php/jcaa/article/view/1770)). A commonly quoted comparison is 138 WPM to infants versus 184 WPM to adults (Bernstein Ratner 1985) [secondary].
- **Caregivers slow down where it matters.** When talking with 3- to 4-year-olds, caregivers spoke more slowly about toys the child did not know. The bigger the slow-down on unknown words, the better the children learned them [evidence, correlational] ([Shi et al. 2020](https://cognitivesciencesociety.org/cogsci20/papers/0182/index.html)).
- **Slower speech helps comprehension.** In 102 Swedish children, sentences in a grammar test read at a fast rate lowered scores, and a slow rate helped in general. The benefit was largest for items a child was close to mastering [evidence] ([Haake et al. 2013](https://doi.org/10.3109/17549507.2013.845690)). In 19-month-olds, the slow rate and vowel hyper-articulation of infant-directed speech helped word recognition, but a wide pitch range did not [evidence] ([Song, Demuth & Morgan 2010](https://doi.org/10.1121/1.3419786)). The rates used were 1.94 versus 3.88 syllables/s, as reported in later literature [secondary].
- **Children's own processing rate.** Audiologists say 3- to 5-year-olds process speech well at about 120–124 WPM. *Mister Rogers' Neighborhood* is quoted at about 124 WPM, and some cartoons at 180–190 WPM [expert opinion] ([Hull, Wichita State](https://wichita.edu/about/wsunews/archive/index.php?nid=3349); [Madell 2013](https://hearinghealthmatters.org/hearing-and-kids/2013/can-children-understand-fast-speech/)). Neither gives a method, so treat these as a rough guide only.
- **Children's TV and apps.** I found no peer-reviewed corpus that measures speech rate in preschool TV (Pinkfong, Pororo, Peppa, Bluey and so on). No published figure for those shows is available. If needed, we could measure a few minutes of reference shows with the same script used in Appendix A (for internal comparison only).
- **Slowing alone is not clarity.** When clear speech was time-compressed to a conversational rate, or conversational speech was stretched to a clear-speech rate, both lost intelligibility [evidence] ([Picheny, Durlach & Braida 1989](https://doi.org/10.1044/jshr.3203.600)). Talkers trained to speak clearly at a normal rate showed more energy at 1–3 kHz, higher and wider F0, and deeper low-frequency envelope modulation [evidence] ([Krause & Braida 2004](https://doi.org/10.1121/1.1635842)). Clear speech also helps children: children identified words in noise better in clear speech [evidence] ([Bradlow, Kraus & Hayes 2003](https://doi.org/10.1044/1092-4388(2003/007))). In short, a take that was *spoken* slowly and clearly beats a fast take that was stretched afterwards.

### Pauses

- **Before the target word:** In storybook reading, parents' pauses longer than 250 ms before a new word went with stronger word learning. Pauses shorter than 250 ms were barely noticeable [evidence, exploratory subgroup] ([Read 2014](https://doi.org/10.3389/fpsyg.2014.00149)). A deliberate pause *before* the target word, which invites a guess, beat a pause after it [evidence] ([Read, Furay & Zylstra 2019](https://doi.org/10.1177/0142723719846583)).
- **Between utterances:** Caregivers use longer pauses with young children [evidence] ([Fernald et al. 1989](https://doi.org/10.1017/S0305000900010679)). I found no study giving one ideal value in milliseconds for 3- to 5-year-olds.
- **Industry reference points:** Azure SSML maps `break` strengths to 250, 500, 750, 1,000 and 1,250 ms [vendor] ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure)).

### Target for Animal Friends [our inference]

| Type of line | Overall rate (incl. pauses) | Pauses |
|---|---|---|
| Instructions, questions, new words | **110–130 WPM** (≈ 2.0–2.3 syl/s) | Sentence 600–800 ms. Before the target word 300–500 ms |
| Stories | 120–140 WPM | Sentence 600–700 ms. Before a predictable or rhymed word up to 1 s |
| Praise ("You found it!") | Natural (short lines) | — |
| Hard cap for any clip | **150 WPM** | — |

**Our measurements (Appendix A):** a median of 143 WPM is close to the upper end. The tail is the problem: the p90 is 184 WPM, a cartoon-like pace. Half of all lines came from Chatterbox at 223 WPM or more and could only be stretched 1.6x. Sentence pauses (median ~0.38 s) are about half of the target.

---

## 4. Prosody: pitch, emphasis, repetition, sentence length

- **Higher, more melodic pitch:** Parents raise their mean F0 when talking to young children, and mothers also widen the pitch range [evidence] ([Fernald et al. 1989](https://doi.org/10.1017/S0305000900010679); [Fernald & Simon 1984](https://doi.org/10.1037/0012-1649.20.1.104)). Wide pitch range on its own did not help word recognition at 19 months; slow rate and clear vowels did [evidence] ([Song et al. 2010](https://doi.org/10.1121/1.3419786)). Exaggerated melody draws attention, and clarity comes from rate and articulation. A "lively" voice is fine as long as it is not also fast.
- **CDS is not automatically clearer:** In a large Japanese corpus, sound contrasts in infant-directed speech were slightly *less* clear than in adult-directed speech [evidence] ([Martin et al. 2015](https://doi.org/10.1177/0956797614562453)). A natural "fun" voice will not produce clear articulation by itself, so we have to ask for it (calmer exaggeration, a clear reference voice).
- **Target word at the end, with a pitch peak:** Putting the new word at the end of the utterance *and* giving it a pitch peak typical of infant-directed speech gave the most word learning (school-age children) [evidence] ([Filippi, Laaha & Fitch 2017](https://doi.org/10.1098/rsos.161035)). This matches the classic finding that mothers put focused words on final pitch peaks ([Fernald & Mazzie 1991](https://doi.org/10.1037/0012-1649.27.2.209)) [secondary; abstract not read].
- **Use a frame, not the bare word:** 18-month-olds understood familiar words about 120 ms faster after a carrier phrase ("Where's the …") than in isolation [evidence] ([Fernald & Hurtado 2006](https://doi.org/10.1111/j.1467-7687.2006.00482.x)). "Find the … ball!" works better than "Ball."
- **Repetition across consecutive sentences:** 2-year-olds learned new words only when the label was repeated in successive sentences, not when the same exposures were spread out [evidence] ([Schwab & Lew-Williams 2016](https://doi.org/10.1037/dev0000125)). For example: "This is a **goat**. The **goat** says maa."
- **Sentence length and vocabulary:** Caregivers use shorter utterances with young children [evidence] ([Fernald et al. 1989](https://doi.org/10.1017/S0305000900010679)). Our script already does this: 3,033 sentences, median 3 words, max 10 [measured].
- **Praise:** Toddlers who heard more *process* praise ("you worked hard", "you found it") had more of a growth mindset at 7–8 years. Person praise and the *total amount* of praise did not predict this [evidence, correlational] ([Gunderson et al. 2013](https://doi.org/10.1111/cdev.12064)). Only 3 of our 2,150 lines use generic "Well done" [measured].

**For Animal Friends [our inference]:** Keep the lively, warm voice. Write lines as *frame + target word last* ("Can you find the … **red** one?"). Repeat the target in the next sentence. Make praise specific and short. The target word should get the pitch peak plus a 300–500 ms pause before it. A gentle 1.1–1.2x lengthening of that word alone is better than stretching the whole line.

---

## 5. Phonics audio: pure sounds, timing, human vs TTS

### Pure sounds (official guidance)

- The DfE *Reading framework* (updated September 2023) tells teachers to say phonemes clearly **without adding a schwa**, because /s/ /p/ /or/ /t/ blends to "sport" more easily than "suh-puh-or-tuh" [evidence] ([DfE Reading framework, Appendix 6, pp. 142–143](https://assets.publishing.service.gov.uk/media/664f600c05e5fe28788fc437/The_reading_framework_.pdf); [GOV.UK page](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy)). Its chart:
  - Unvoiced, said with no vowel: /p/ /t/ /k/ /ch/ /f/ /th/ /s/ /sh/ /h/.
  - /r/ and /l/ are voiced and can be held.
  - /b/ /d/ /g/ /j/ **cannot be heard clearly alone without a small schwa**, so a *small* one is acceptable for these four only.
  - /v/ /th/ /z/ /zh/ buzz. /m/ /n/ /ng/ are nasal and can be held.
  - /w/ and /y/ need a tiny /oo/ or /ee/, or a small schwa.
- The "Letters and Sounds" (2007) handbook came off the DfE's validated list in 2022 [secondary] ([Hampshire HIAS](https://english.hias.hants.gov.uk/course/section.php?id=4085)). The Reading framework is the current DfE reference.
- **Continuous vs stop sounds:** Continuous sounds (/m/ /s/ /f/ /n/ /l/ /r/ /v/ /z/ and vowels) can be held without distortion. Stop sounds (/b/ /p/ /k/ /t/ /d/ /g/) are quick puffs and become distorted if held [evidence: US federally funded guidance] ([NCIL, Office of Elementary and Secondary Education / OSEP](https://improvingliteracy.org/wp-content/uploads/2025/07/ncil-how-to-use-systematic-phonics-instruction-in-your-classroom.pdf)). The same guide recommends starting with all-continuous CVC words (man, run), then a final stop (sap, mat), then an initial stop (top, pan). Children should "keep their motor running" between sounds, then say the word "the fast way".

### Timing for segmenting and blending

- **Connected phonation is better than gaps:** Kindergartners taught to blend with sounds run together ("sssaaannn") decoded better, including on new words starting with stop consonants, than children taught with separated sounds ("sss – aaa – nnn"). Separated sounds made children forget the first phoneme [evidence; small RCT, N≈38] ([Gonzalez-Frey & Ehri 2020](https://doi.org/10.1080/10888438.2020.1776290)).
- **No source gives millisecond durations** for each phoneme or gap. The numbers below are **[our inference]**, based on the sources above and on our measurements:

| Element | Duration |
|---|---|
| Continuous phoneme said alone (/sss/, /mmm/, /aaa/) | 0.8–1.0 s steady sound, 30–50 ms fade in and out |
| Continuous phoneme inside a connected blend | 0.4–0.6 s each, cross-faded with no silence (voice stays on) |
| Unvoiced stop alone (/p/ /t/ /k/) | Burst plus aspiration only, 60–150 ms, **no vowel** |
| Voiced stop alone (/b/ /d/ /g/ /j/) | ≤ 120 ms with the smallest possible schwa |
| Separated sounds ("listen to each sound") | 400–600 ms gaps. Keep them short, because long gaps are what made children forget the first sound |
| After the blend, before the whole word | 600–800 ms |
| Whole word | Natural speed ("the fast way") |

For "bug", that is about /b/ 0.12 s + /ʌʌʌ/ 0.5 s + /g/ 0.12 s in connected form (~0.8 s), then 0.7 s of silence, then "bug" (~0.5 s). The total is about 2 s, against 1.09 s for today's "buh … uh … guh" alone.

### Human recordings vs TTS for phonemes

- Children understand and remember synthetic speech less well than natural speech. This is clear for older formant synthesisers such as DECtalk [evidence, dated] ([Reynolds & Fucci 1998](https://doi.org/10.1044/jslhr.4102.458)). I found **no study** comparing modern neural TTS phonemes with human phonemes for young children. This is an open question.
- Neural TTS engines are trained on words and sentences, not isolated phonemes. Spelling a phoneme ("tuh", "aaah") is ambiguous. "aaah" can come out as /ɑː/ instead of the /æ/ in "apple", and "tuh" carries a schwa by design. That is the impurity we hear [our inference, consistent with our measurements].
- Phoneme input exists in some engines: Azure and Google accept the SSML `<phoneme>` element with IPA ([Azure](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure), [Google](https://docs.cloud.google.com/text-to-speech/docs/ssml)). Piper accepts raw espeak phonemes in `[[ ]]` ([Piper CLI](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md)). ElevenLabs supports phoneme tags only on `eleven_flash_v2` ([ElevenLabs](https://elevenlabs.io/docs/best-practices/prompting/controls)) [vendor]. **Whether any of these produce a clean isolated /t/ is untested** [uncertain].
- **Practical conclusion [our inference]:** For the roughly 44 English phonemes, a **human recording** is the most reliable choice. It is one short session: about 44 sounds x 3 takes, under an hour. It can be in the same register as the TTS voice, and every major SSP programme ships human-recorded sounds. Second best, with no new recording: **cut phonemes out of words the TTS already says well**. Take /s/ from "sun" and /t/ from the release in "hat". Lengthen continuants with WSOLA or by looping the steady part, and keep only the burst for stops. A voicing detector (librosa `pyin`) can find where the schwa starts so it can be cut off.

---

## 6. Voices and engines (2026)

Privacy note for all engines: our lines are **pre-rendered at build time from a fixed script**, so no child data goes to any TTS service, even a cloud one. Privacy only matters for *runtime* speech, such as a name the child typed. That is why the device-voice fallback should stay local (Section 7).

### Open models (can run offline)

| Engine | Quality / character | Rate and pause control | Licence for a kids' app | Notes |
|---|---|---|---|---|
| **Chatterbox** (Resemble AI, 0.5B; Turbo 350M; Nano 110M; Multilingual V3) | Natural and expressive. Voice cloning from a reference clip | **No rate parameter.** Pace comes indirectly from `exaggeration` (higher = faster) and `cfg_weight` (lower = slower), and from the reference speaker's pace. No SSML. Turbo and Nano support tags such as `[laugh]` | MIT | Every output carries an imperceptible **Perth watermark** [vendor] ([GitHub](https://github.com/resemble-ai/chatterbox)) |
| **Kokoro-82M** | Clean and fast, flatter (our own experience: "quicker, flatter") | `speed` parameter. Phoneme input via misaki | Apache-2.0 weights | [HF](https://huggingface.co/hexgrad/Kokoro-82M), [GitHub](https://github.com/hexgrad/kokoro) |
| **F5-TTS** | High-quality cloning | Speed/duration controllable (from the inference code, not checked in detail) | Code MIT, but **pretrained weights are CC-BY-NC** (Emilia data), so **not for commercial use** | [GitHub](https://github.com/SWivid/F5-TTS) |
| **StyleTTS 2** | Good on LibriTTS voices | Duration via the model; no SSML | Code MIT. Pretrained models require **telling listeners the voice is synthetic**, unless you have the speaker's permission. Inference uses a GPL phonemizer. Repo not updated since 2024 | [GitHub](https://github.com/yl4579/StyleTTS2) |
| **Piper** (piper1-gpl) | Fast and light, more robotic | `--length-scale`, `--sentence-silence`, raw phoneme input | **GPL-3.0** (fine as a build tool, since the audio output is not covered). Each voice has its own licence | [GitHub](https://github.com/OHF-Voice/piper1-gpl) |
| **IndexTTS-2.5** (bilibili) | Expressive; emotion control | **`duration_factor` 0.5–2.0x**, the most direct pace control among the open models (per the README, released 2026-08) | Custom **bilibili Model Use Licence**. Free below 100M MAU / RMB 1bn revenue, but "Derivative Works" include **model outputs**, so the terms apply to our audio. Needs legal review | [GitHub](https://github.com/index-tts/index-tts) [vendor] |
| **Zonos v0.1** (Zyphra) | 44 kHz, cloning | **Speaking-rate**, pitch-variation and emotion conditioning | Apache-2.0 | [GitHub](https://github.com/Zyphra/Zonos) (last pushed 2025-03) |
| **CosyVoice 3 / 2** (Alibaba) | Good multilingual | Instructions for speed, emotion, volume | Apache-2.0 | [GitHub](https://github.com/FunAudioLLM/CosyVoice) |
| **Dia** (Nari Labs), **Orpheus** (Canopy) | Dialogue / emotive tags | No numeric rate | Code Apache-2.0. Check the licence of the weights (Orpheus is Llama-based) [uncertain] | [Dia](https://github.com/nari-labs/dia), [Orpheus](https://github.com/canopyai/Orpheus-TTS) |
| **NeuTTS Air**, **KittenTTS** | Small, on-device | Limited | NeuTTS Air Apache-2.0 (other NeuTTS models use their own licence). KittenTTS Apache-2.0 | [NeuTTS](https://github.com/neuphonic/neutts-air), [Kitten](https://github.com/KittenML/KittenTTS) |
| **Not usable:** Higgs Audio v3 (non-commercial), Fish Speech / OpenAudio (Fish Audio Research Licence), VibeVoice (research only; Microsoft disabled the TTS model) | — | — | — | [Higgs](https://github.com/boson-ai/higgs-audio), [Fish](https://github.com/fishaudio/fish-speech), [VibeVoice](https://github.com/microsoft/VibeVoice) |

### Cloud services

| Service | Rate control | Pause control | Phonemes | Notes |
|---|---|---|---|---|
| **Azure Speech** | SSML `prosody rate` 0.5–2x (x-slow = 0.5, slow = 0.64) | `<break>` 0–20,000 ms. `mstts:silence` for leading/trailing/sentence-boundary/comma silence, 0–20,000 ms | `<phoneme>` IPA | HD (DragonHD) voices support styles such as `encouraging`, `calm` and `excited`, but **not all SSML**. `<emphasis>` works on only 3 en-US voices [vendor] ([voice doc](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice), [structure doc](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure)) |
| **Google Cloud TTS** | `speaking_rate` 0.25–2.0 (Chirp 3 HD) | Chirp 3 HD: `[pause short]`, `[pause]`, `[pause long]` in the `markup` field, with lengths chosen by the model. SSML `<break>` on other voices. Chirp 3 HD SSML is in Preview | `<phoneme>` IPA / X-SAMPA | [vendor] ([Chirp 3 HD](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd), [SSML](https://docs.cloud.google.com/text-to-speech/docs/ssml)) |
| **ElevenLabs** | `speed` 0.7–1.2 | `<break time="x.xs"/>` up to 3 s, **not in v3/v4**. Many breaks can cause instability | Phoneme tags on `eleven_flash_v2` only | Pace "strongly influenced" by the voice's training audio. MP3, Opus and PCM output [vendor] ([controls](https://elevenlabs.io/docs/best-practices/prompting/controls), [models](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)) |
| **OpenAI** | `speed` 0.25–4.0. `gpt-4o-mini-tts` also takes free-text `instructions` for tone and pace (not tts-1) | No SSML | No | Usage policy **requires telling users the voice is AI-generated** [vendor] ([guide](https://developers.openai.com/api/docs/guides/text-to-speech), [API](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create)) |

### Which engines support time-stretching or SSML pauses

- **Exact pauses in ms:** Azure (`break`, `mstts:silence`), Google SSML voices (`break`), ElevenLabs older models (≤ 3 s), Piper (`--sentence-silence`, per sentence only). Chatterbox, Kokoro and the other open models have none, so pauses must be added in post-processing, as `post.py` already does, or by generating each sentence separately and joining them.
- **Native rate control (no stretching):** Azure, Google, OpenAI, ElevenLabs (narrow range), Kokoro, Piper, IndexTTS-2.5, Zonos, CosyVoice. Chatterbox does not have one.

### For Animal Friends [our inference]

Chatterbox is still a reasonable choice: MIT licence, local, natural, and the voice already exists. Its weak point is pace control. Fix that at the source (lower exaggeration, a slow reference voice, one sentence at a time) rather than with 1.5x stretching. If that is not enough, test **IndexTTS-2.5** (`duration_factor`, but read the licence) and **Zonos** (speaking-rate, Apache) on 20 lines each. **Azure HD** is the safest cloud option for exact SSML pauses and rate, and build-time use sends no child data.

---

## 7. Audio delivery

### Loudness

- Apple Podcasts asks for about −16 LKFS ±1 dB, with true peak no higher than −1 dBFS, measured per ITU-R BS.1770 [vendor] ([Apple](https://podcasters.apple.com/support/893-audio-requirements)). EBU R128 s2 (streaming) keeps −23 LUFS as the reference but allows an interim −20 to −16 LUFS where playback gain is limited, as on mobile [secondary summary] ([EBU R128 s2](https://knowledgehub.ebu.ch/files/live/sites/tech/files/shared/r/r128s2v2_0.pdf)). Auphonic recommends −16 LUFS for mobile [vendor] ([Auphonic](https://auphonic.com/blog/2013/01/07/loudness-targets-mobile-audio-podcasts-radio-tv/)).
- **Ours:** −18.5 LUFS median, p10 −19.9, p90 −17.8 [measured]. The clips that come out quiet are those where a peak forced the whole clip down (`post.py:70-71`). Use **−16 LUFS ±1** with a true-peak limiter at −1 dBTP, plus gentle compression (about 2:1, slow attack) before the limiter so loud syllables do not drive the gain [our inference]. BS.1770 integrated loudness needs ≥ 400 ms of audio. For one-word clips, pad them or use momentary loudness [our inference].
- **Voice vs everything else:** Toddlers learned new words when the target speech was **10 dB** louder than background speech, but not at 5 dB [evidence] ([McMillan & Saffran 2016](https://doi.org/10.1111/cdev.12559)). School-age children need 5–10 dB *more* signal-to-noise than adults with speech-like maskers, and only reach adult levels in adolescence [evidence] ([Leibold & Buss 2019](https://doi.org/10.3389/fpsyg.2019.01981)). Our chimes are sines at 0.13–0.3 amplitude in the 500–1,200 Hz range, which overlaps vowel information. When they play at the same time as speech, the speech-to-chime ratio is roughly 0 dB [our inference, from `audio.js` gains].

### EQ and compression for small speakers

- Clear speech has more energy at 1–3 kHz than conversational speech [evidence] ([Krause & Braida 2004](https://doi.org/10.1121/1.1635842)). A gentle +1.5–2 dB shelf or bell at 2–4 kHz, a high-pass at ~100 Hz (phone speakers waste energy below that and may distort), and mild de-essing at 5–8 kHz if the stretched /s/ is harsh are standard broadcast practice [our inference / practitioner practice, no primary study found on EQ for small-speaker intelligibility].

### File format and bitrate for a PWA

- **MP3** plays everywhere. Apple lists **40–80 kbps for mono at 22.05/24 kHz** [vendor] ([Apple](https://podcasters.apple.com/support/893-audio-requirements)). Our 64 kbps mono 24 kHz is inside that band. 48 kbps would probably be fine too and saves 25% [our inference; listen to /s/ and /f/ before switching].
- **Opus** gives fullband speech at about 24 kbps mono [vendor/standards body] ([Xiph](https://wiki.xiph.org/Opus_Recommended_Settings)). iOS Safari has **full** Opus support only from iOS 18.4, partial before that, and macOS Safari is still listed as partial [evidence] ([caniuse](https://caniuse.com/opus)). For an offline PWA aimed at families with older iPads, MP3 (or AAC) stays the safe default. Opus could be offered with an MP3 fallback later to halve download size.

### Time-stretching that keeps the voice natural

- A large listening study (42,529 ratings) found that quality falls as the stretch factor moves away from 1, and slowing down is rated worse than speeding up. For voice, WSOLA wins when speeding up. Most methods are similar between 0.6 and 1.0x playback speed (1.0–1.67x longer). The phase vocoder is clearly preferred below 0.6x speed [evidence] ([Roberts & Paliwal 2020](https://arxiv.org/abs/2006.00848)). The phase vocoder causes "phasiness" and transient smearing. WSOLA causes transient doubling (a stutter on stops) [evidence] (same source).
- **PSOLA** (pitch-synchronous overlap-add) was designed for speech and changes duration while keeping pitch [evidence] ([Moulines & Charpentier 1990](https://doi.org/10.1016/0167-6393(90)90021-Z)). Praat implements it (`Sound: Lengthen (overlap-add)`, factor up to 3, pitch floor about 150 Hz for a child's voice) [evidence] ([Praat manual](https://www.fon.hum.uva.nl/praat/manual/Sound__Lengthen__overlap-add____.html)). **Rubber Band** (R3 "Finer" engine) is a high-quality option, but GPL, or a paid licence if it is shipped inside a product. Using it as an offline build tool is fine [vendor] ([Rubber Band](https://breakfastquay.com/rubberband/)).
- **Uniform stretching is not how people slow down.** Real slow, clear speech adds pauses and lengthens vowels and final syllables, not every segment equally ([Picheny et al. 1989](https://doi.org/10.1044/jshr.3203.600); [Church et al. 2005](https://jcaa.caa-aca.ca/index.php/jcaa/article/view/1770)). Our recipe [our inference]: stretch ≤ 1.3x with WSOLA (or PSOLA). Get the rest from pauses at sentence and phrase boundaries. Optionally add a little extra lengthening on the final word.
- **Pitch shifting in the browser:** With `preservesPitch = false`, `playbackRate` changes pitch and speed together ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch)). The squeaky friend at 1.06x is therefore +1 semitone *and* 6% faster. A plain `<audio>` element has no way to change only the pitch. The options are pre-rendered offline pitch variants (Rubber Band `--pitch` with formant preservation, or Praat), which roughly triple storage for friend lines, or a smaller cap.

### Privacy (COPPA, GDPR-K)

- The amended COPPA Rule was published 22 April 2025, took effect 23 June 2025, and became fully enforceable on **22 April 2026** [secondary: law-firm summaries] ([White & Case](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know)). "Personal information" includes an audio file containing a child's voice. A narrow exception allows such audio only to answer the child's request, followed by immediate deletion and a disclosure [secondary] ([FPF redline](https://fpf.org/wp-content/uploads/2025/01/DRAFT-FPF-Redline-of-the-2025-Final-COPPA-Rule-.pdf); [2017 FTC policy statement](https://www.govinfo.gov/content/pkg/FR-2017-12-08/pdf/2017-26509.pdf)). The UK Children's Code requires data minimisation and high-privacy defaults [evidence] ([ICO code](https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf)). GDPR Article 8 sets the consent age for information-society services at 13–16, depending on the member state ([GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)).
- **For our output pipeline:** Pre-rendered audio from a fixed script involves no child data. The runtime fallback already prefers on-device voices (`audio.js` `pickVoice`). That should stay, because a network voice would send a child-typed name to a third party. The microphone features are outside this report. `core/speech.js` already gates Chrome's cloud recogniser behind a grown-up's consent.

---

## 8. Common mistakes in kids' app audio

1. **Talking too fast**, especially in long or multi-sentence lines. Our p90 of 184 WPM is in the range quoted for fast cartoons [measured; expert opinion].
2. **Slowing by stretching instead of pausing.** This produces a warbling, stuttering voice when stretched more than ~1.3x ([Roberts & Paliwal 2020](https://arxiv.org/abs/2006.00848)). Half of our lines are at the 1.6x cap [measured].
3. **Schwa on letter sounds** ("tuh", "puh"), which makes blending harder ([DfE](https://assets.publishing.service.gov.uk/media/664f600c05e5fe28788fc437/The_reading_framework_.pdf)). Our sound list has this built in [code].
4. **Long gaps between segmented sounds** (children forget the first sound), or the opposite, **no audible separation** when separation is the point ([Gonzalez-Frey & Ehri 2020](https://doi.org/10.1080/10888438.2020.1776290)).
5. **Music, chimes or ambience masking speech.** Keep the voice ≥ 10 dB above, and never start the voice on top of a chime ([McMillan & Saffran 2016](https://doi.org/10.1111/cdev.12559)). Ambience in the app is already off during games, which is good (`audio.js:121-125`).
6. **Too much generic praise and noise.** Specific, effort-based praise is better than "Great job!" ([Gunderson et al. 2013](https://doi.org/10.1111/cdev.12064)). Interactive "bells and whistles" unrelated to the content distract. Multimedia that is *synchronised with and supports* the narration can help ([Takacs, Swart & Bus 2015](https://doi.org/10.3102/0034654314566989); [Hirsh-Pasek et al. 2015](https://doi.org/10.1177/1529100615569721)).
7. **Lone words without a frame.** "Where's the ball?" is understood faster than "ball" ([Fernald & Hurtado 2006](https://doi.org/10.1111/j.1467-7687.2006.00482.x)).
8. **Uneven loudness** between clips and the device voice. When a child turns the volume up for a quiet clip, the next chime or clip is too loud.
9. **Character voices that undo the pacing** (the pitched-up friend plays faster).
10. **Unrecorded lines falling back to a robotic device voice** in the middle of a lesson (for example the blend celebration line in `quiz.js:315`, if it really is missing).

---

## 9. Prioritised changes for our pipeline

Cost labels:
- **[post.py only]**: `--convert-only`, under a minute, no re-recording. Bump `POST` in `gen.mjs` each time.
- **[needs re-recording, ~4 h]**: Chatterbox has to run again.
- **[app code]**: a small JS change, no audio regeneration. This is a third category, not in the brief, but some fixes live in `audio.js` or the engines.

| Priority | Change | Numbers | Cost |
|---|---|---|---|
| **1** | **Clean up the 33 sound clips.** Run them through post-processing. Unvoiced stops (/p/ /t/ /k/ /h/): keep only the burst and aspiration, and cut at the voicing onset of the "uh" (detect with `librosa.pyin` voiced flag or a harmonicity check). /b/ /d/ /g/: keep ≤ 120 ms. Continuants (/s/ /m/ /n/ /l/ /f/ /r/, vowels): stretch the steady middle to 0.8–1.0 s (WSOLA on the middle only, 30–50 ms fades). Normalise like the rest. **Listen to every result.** If a stop sounds unnatural, mark it for priority 7 | /t/ ≈ 60–150 ms; /s/ ≈ 0.9 s | **[post.py only]** |
| **2** | **Build blends from the cleaned phoneme clips plus the word clip** instead of TTS "buh … uh … guh". Connected version (cross-faded, 0.4–0.6 s per continuant), then 0.7 s silence, then the word at natural speed. Add a separated "listen to each sound" variant with 0.5 s gaps where the lesson needs it. Also record or compose the `quiz.js:315` celebration line so it stops falling back to the device voice | Blend ≈ 2–2.5 s in total, compared with 1.09 s now | **[post.py only]** (needs a small mapping from blend line to parts in `gen.mjs`) |
| **3** | **Pause-led slowing.** In `breathe()`: set the N−1 longest gaps of an N-sentence line to **650 ms**, comma or phrase gaps (gaps ≥ 150 ms) to **≥ 300 ms**, and the last gap before the final word to **≥ 350 ms**. Leave gaps < 100 ms alone, so phrases are not chopped up. Then lower `TARGET_WPM` to **125** and `MAX_STRETCH` to **1.35**. **Print the lines that are still above 150 WPM** as the re-recording list for priority 6 | Sentences 650 ms; before the target 350 ms; ≤ 1.35x | **[post.py only]** |
| **4** | **Loudness and tone.** Replace RMS −18 with **−16 LUFS integrated** (`pyloudnorm`, pad clips < 0.4 s). Add gentle 2:1 compression and a **−1 dBTP** true-peak limiter instead of scaling the whole clip. High-pass at **100 Hz**. Optional **+1.5–2 dB at 2–4 kHz** | −16 ±1 LUFS, −1 dBTP | **[post.py only]** |
| **5** | **Stop chimes masking speech.** Start speech when the chime ends (`SFX.right` ≈ 0.46 s), e.g. `S.later(() => say(...), 450)` in `maze.js:202`, `quiz.js:211`, `quiz.js:315`, or duck the SFX gain about 10 dB while a clip plays. **Limit the friend speed-up**: change the `clipRate` clamp to **0.95–1.03**, or later ship offline pitch variants that keep the duration. Note that `opts.rate` (e.g. `sound()` 0.55, blend 0.7) is ignored for recorded clips, so pacing has to live in the files | Voice ≥ 10 dB above SFX; friend ≤ 1.03x | **[app code]** (bump `sw.js` VERSION) |
| **6** | **Fix pace at the source.** For instructional lines, Chatterbox `exaggeration` **0.55** and `cfg_weight` **0.3**. Keep 0.8 only for praise or exclamations of ≤ 3 words. Pass `audio_prompt_path` with a **10–20 s reference of a warm, slow (~120 WPM), clearly spoken adult voice** recorded with consent; Chatterbox picks up the reference speaker's pacing. **Generate each sentence separately** and join them in `post.py` with fixed pauses. Tighten `plausible()` to retry raw takes above **180 WPM** and catch garbled overlong takes. Expected result: raw ~150–170 WPM, ≤ 1.3x stretch, final ~120 WPM | Raw ≤ 170 WPM; final 110–130 | **[needs re-recording, ~4 h]** |
| **7** | **Human-recorded pure phonemes** for all ~44 sounds (3 takes each, choose the best). This also fixes "aaah" (/ɑː/ vs /æ/) and "awh". Process them with the same loudness chain | 0.8–1.0 s continuants; burst-only stops | **[needs re-recording]** (a ~1 h human session, not the 4 h TTS run) |
| **8** | **Script tweaks** for target-word lines: frame + target last ("Find the … **goat**!"), repeat in the next sentence ("The **goat** says maa."), specific praise. Only the changed lines need re-voicing (incremental) | — | **[needs re-recording]** for those lines only |
| **9** | **Engine bake-off (optional).** 20 representative lines in Chatterbox (new settings), IndexTTS-2.5 (`duration_factor` 1.3; licence review), Zonos (speaking-rate) and Azure HD (SSML rate 0.85, breaks). Blind listening with a few parents. Measure WPM with the Appendix A script | — | Separate experiment |

Expected effect of priorities 1–5 with no re-recording [our inference]: the median overall rate drops from about 143 to about 125–130 WPM (most of it from longer sentence and phrase pauses), sentence pauses about double, letter sounds become clean and audible, and the voice gets about 2 dB louder and more even. The fastest ~20–30% of lines still need priority 6.

---

## Appendix A: how the current numbers were measured

- **Script:** a scratch Python script (not committed) using `.venv` librosa and soundfile on the 1,816 finished clips in `tools/voice/.wav-final/` listed in `animal-friends-v2/voice/index.js`. Raw takes came from `tools/voice/.wav-cache/` (file id = sha1 of `chatterbox-lively|1|<text>`).
- **WPM:** whitespace words divided by the duration after `librosa.effects.trim(top_db=40)`, pauses included. Only lines of ≥ 3 words (1,195 final, 1,263 raw).
- **Syllables:** vowel-group count heuristic (approximate). Articulation rate = syllables / non-silent time (`librosa.effects.split(top_db=32)`).
- **Gaps:** silences between non-silent regions (top_db 32). Sentence-boundary gaps are taken as the N−1 longest gaps in N-sentence lines (683 boundaries), which is an upper-bound estimate.
- **Loudness:** BS.1770-style K-weighting and gating implemented by hand at 24 kHz (approximate, ±0.5 dB).
- **Results:**
  - Raw WPM: p10/50/90 = 158 / 223 / 293. Share above 224 WPM (the 1.6x cap) = 0.49. Mean stretch = 1.46x.
  - Final WPM: 123 / 143 / 184. Syllables/s overall: 2.21 / 2.95 / 3.85. Articulation: 2.59 / 3.41 / 4.22.
  - Gaps: 0.01 / 0.19 / 0.47 s. Sentence-boundary gaps: 0.19 / 0.38 / 0.54 s.
  - LUFS: −19.9 / −18.5 / −17.8.
  - Sound clips: "buh" 0.28 s, "kuh" 0.32 s, "huh" 0.30 s, "ssss" 0.81 s, "buh … uh … guh" 1.09 s, "ssss … uh … nnnn" 1.75 s.
  - Suspiciously long single words, possibly garbled takes worth a listen: "eye" 2.45 s, "glove" 2.50 s, "heart" 2.35 s, "was" 2.33 s.

## Appendix B: open questions

- No published speech-rate measurements for Pinkfong, Pororo or similar shows. We could measure reference clips internally for comparison.
- No study comparing *modern neural* TTS with human narration for 3- to 5-year-olds' learning.
- No primary source gives millisecond timings for phonics phonemes and gaps. The values above are engineering choices to check by ear and with children.
- Whether cutting the schwa from TTS stops (priority 1) sounds natural enough is untested. Fall back to priority 7 if not.
