# CLAUDE.md — Animal Friends UI Revamp Instructions

## Mission

Revamp the Animal Friends interface so every menu level feels like one coherent product and follows `docs/UI_REDESIGN_SPEC.md`.

Before coding, read:
1. `README.md`
2. `docs/UI_REDESIGN_SPEC.md`

Treat `README.md` as the source of truth for existing product behavior and architecture.
Treat `docs/UI_REDESIGN_SPEC.md` as the source of truth for interface presentation and interaction consistency.

## Non-negotiables

- The curriculum (v4, decided 2026-10-23 by the owner) is modelled on Danbi
  Education's Wink: four core subjects taught as short lessons (Phonics 4 steps,
  English 4 stages, Math 5 levels × 6 areas, Bahasa Indonesia 4 tahap), each
  lesson a fixed road of steps (`engines/lesson.js`), plus the Fun & Joy extras
  (Discover, Coding, Feelings, Healthy Me, Our Planet, Maze, Memory, Songs,
  Story Time). Keep that shape; change content inside it.
- Preserve level IDs and deep-link formats. A lesson's id never changes once
  shipped (saved stars are keyed by it). Retired subjects' stars live on in
  `legacyStars` (`core/profile.js`), so a child's total never drops.
- Preserve star scoring, unlocking, profile migration and saved progress.
  (Decided 2026-10-13: a misheard word never costs a star, and a level that
  already has stars is never locked. Keep both.)
- Bahasa Indonesia is recorded with an Indonesian voice (decided 2026-10-28 by
  the owner, reversing his own earlier rule that the device should say it): the
  clips in `voice/` are made by `tools/voice/record_id.mjs` with macOS
  Damayanti, so every phone hears the same voice. Never record it with the
  English voice, and never give it a speaking (`speak`) step. `lang: 'id'` and
  `AF.Audio.setLang` stay as they are: they still pick the device's Indonesian
  voice, which is now only the fallback for a line that has no recording.
- Preserve the current no-build-step approach.
- Do not introduce a framework or package dependency.
- Keep the app functional offline.
- Reuse the existing Three.js character system.
- Keep child-facing controls large and touch-friendly.
- Do not redesign each screen independently.
- Build shared UI primitives first and reuse them everywhere.
- Do not use emoji for navigation buttons.
- Learning-content emoji may remain unless replaced deliberately.
- Keep the existing reduced-motion / effects preference working.
- Whenever code files change, follow the existing service-worker versioning rule.

## Architecture boundaries

Existing responsibilities should remain separated:

- `core/app.js`: routing and screen orchestration.
- `core/world.js`: scenery and world illustrations.
- `core/icons.js`: interface icon glyphs.
- `core/art.js`: 3D friend rendering.
- `core/profile.js`: state and progress.
- `core/levels.js`: stages, unlocking and subject maps.
- `core/ui.css`: design tokens and shared components.
- `core/screens.css`: screen-specific layout.
- `core/motion.css`: shared motion language.
- `engines/*`: gameplay mechanics (`engines/lesson.js` runs a lesson's steps as child sessions).
- `content/*`: curriculum and level data (`phonics.js`, `english.js`, `math.js`, `bahasa.js` are the core subjects).

Do not move curriculum logic into UI code.
Do not move screen/navigation logic into content files.

## Required hierarchy

Child flow:

`Home World → Area / Island → Subject Map → Game → Result`

Supporting routes:

`Character Maker`
`Tutorial`
`Grown-up Area`
`Settings`

The navigation hierarchy must be visually obvious.

## Shared visual shell

Implement one reusable shell for menu screens:

- top-left: Back or Settings
- top-center: context / title
- top-right: friend avatar + stars + streak
- bottom-right: Home when not on Home

On small screens, compact the shell; do not rearrange it unpredictably.

## Required reusable primitives

Create or consolidate reusable primitives for:

- HUD
- JellyButton
- Pill
- ProgressPill
- FriendAvatar
- WorldShell
- AreaLandmark
- SubjectLandmark
- StageTabs
- LevelStone
- TreasureChest
- GameFrame
- ResultSheet
- BottomSheet
- GrownupCard

Names can differ if the current code style suggests a better naming scheme, but equivalent controls must share one implementation.

## Screen requirements

### Home

- Keep the friend as the center anchor.
- Four learning areas should feel like physical islands in one world.
- Daily Journey must be visible but secondary to area selection.
- Give each island a distinct silhouette and environmental identity.
- Use progress cues sparingly.
- Highlight a recommended / last-played area without creating a modal.

### Area / Island

Replace dashboard-like subject grids with a world/path composition where practical.

- subject choices are landmarks
- friend appears near the recommended/current landmark
- completion shown through stars / treasure cues
- locked content stays visually part of the world

### Subject map

- stage tabs at top: Basic / Intermediate / Advanced, or the subject's own
  stage names (`stages`: Step 1–4, Level 1–5, Tahap 1–4); each stage ends with
  a Review lesson and its treasure chest
- one map visible at a time
- next recommended level is dominant
- friend stands at next level
- completed level stones show stars
- treasure chest is stage endpoint
- map should fit without document scrolling

### Game

- minimize navigation chrome
- keep prompt, friend and interaction surface stable
- maintain one task focus
- decorative motion must not sit behind answer choices
- wrong responses must remain gentle
- engine-specific controls live inside a common game frame

### Result

Sequence:
1. celebration
2. stars
3. friend reaction
4. Next / Play Again actions

Do not show failure language.

### Character Maker

- large live friend
- jelly category controls
- visual selection tray
- immediate preview
- oversized Done action
- treat it like a toy, not a settings form

### Grown-up area

May use conventional cards and toggles.
Reduce animation.
Prioritize clear privacy and settings language.

## CSS

Create a centralized token layer before adding new component styles.

Use CSS custom properties for:
- spacing
- touch sizes
- radii
- depth/shadow
- motion durations
- scene colors

Use `data-scene` for environmental theming and `data-screen` for layout states.

Avoid hard-coding the same colors, radii, shadows or spacing values repeatedly.

## Motion

One shared spring language.

Priority:
1. immediate touch feedback
2. screen transition
3. slow ambience

Do not allow multiple decorative animations to compete with the active task.

## Responsive requirements

Test at minimum:
- 390 × 844
- 768 × 1024
- 1280 × 720

Also test landscape phone behavior.

No child-facing primary action should become small merely to fit a desktop layout.

## Workflow

Implement in small passes:

1. Audit current screens and identify repeated UI.
2. Add design tokens.
3. Build shared primitives.
4. Migrate Home.
5. Migrate Area.
6. Migrate Subject Map.
7. Migrate Game Frame.
8. Migrate Result.
9. Migrate Maker.
10. Migrate Grown-up Area and Tutorial.
11. Normalize motion.
12. Responsive pass.
13. Deep-link smoke test.
14. Offline/cache smoke test.

After each pass:
- load affected deep links
- check browser console
- check progress persistence
- check Back/Home behavior
- check both new and existing profiles

## Coding style

Prefer:
- small render helpers
- semantic data attributes
- CSS classes driven by state
- event delegation where already used
- minimal DOM churn

Avoid:
- duplicated HTML blocks
- inline style strings for reusable visual properties
- one-off magic numbers
- changing content files just to solve layout problems
- global state added only for presentation

## Completion definition

Do not claim the UI revamp is complete until:

- the same component has the same visual behavior on every screen
- Home → Area → Subject → Game has a continuous visual language
- all important interactions work on touch-sized targets
- the next action is obvious on every child screen
- no existing progression behavior is broken
- deep links still work
- offline behavior still works
- reduced motion still works
- the app is usable at the required screen sizes
