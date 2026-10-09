# Animal Friends — UI Redesign Specification

Version: 1.0  
Purpose: Create one consistent visual and interaction system across every menu level without changing the existing curriculum or game-engine architecture.

## 1. Product direction

Animal Friends should feel like one continuous playful world, not a collection of separate pages.

The visual hierarchy should be:

1. **Home World** — choose a learning area.
2. **Area / Island** — choose a subject.
3. **Subject Map** — choose a stage and level.
4. **Game** — complete one activity.
5. **Result** — celebrate, show stars, continue.
6. **Supporting spaces** — Character Maker, Grown-ups, Tutorial, Settings.

The child should always understand:
- Where am I?
- What can I tap?
- What should I do next?
- How do I get home?

Do not change learning content, level ordering, star logic, unlock rules, or game engines unless needed for interface compatibility.

---

## 2. Core design principle

### One world, three layers

Every child-facing screen is made from the same three visual layers:

**Layer A — World**
- Full-screen sky / environment.
- Changes by learning area.
- Slow ambient motion only.
- Never competes with the main action.

**Layer B — Navigation frame**
- Same HUD positioning on every menu screen.
- Back / settings on the left.
- Screen identity in the middle.
- Friend avatar, stars and streak on the right.
- Home shortcut only when not already at Home.

**Layer C — Play surface**
- Islands, paths, cards, trays, level stones, or game objects.
- Highest contrast and strongest depth.
- One obvious primary action.

This structure must stay consistent on phone, tablet and desktop.

---

## 3. Visual system

### 3.1 Shape language

Use four shape families only:

- **Jelly button** — primary child controls.
- **Pill** — labels, counters, stage selectors.
- **Soft card** — information and choices.
- **Clay object** — playable pieces and level objects.

Avoid adding new unrelated button shapes.

### 3.2 Depth

Use a simple 4-level depth system:

- `depth-0`: background/world.
- `depth-1`: decorative props.
- `depth-2`: cards, islands, trays.
- `depth-3`: active buttons, friend, draggable/tappable objects.

Interactive objects must visually sit above decorative objects.

### 3.3 Touch targets

For child-facing controls:
- Minimum target: 72 × 72 CSS px where practical.
- Primary action: 88 px or larger.
- Minimum 12 px visual gap between adjacent targets.
- Never rely on small text links.
- The visible object may be smaller than the hit area.

### 3.4 Typography

Use the existing friendly rounded typeface.

Recommended scale:
- Display / app title: `clamp(34px, 7vw, 64px)`
- Screen title: `clamp(26px, 5vw, 42px)`
- Card title: `22–28px`
- Child button label: `18–24px`
- Grown-up body copy: `16–18px`

Child-facing labels should be short: preferably 1–3 words.

### 3.5 Color behavior

Keep semantic colors consistent:
- Blue = navigation / home / settings.
- Green = positive / hear / continue.
- Yellow = hint / help.
- Pink = microphone / speaking.
- Red = close / stop / destructive.
- Purple = surprise / random.

Each learning area gets an environmental palette, but control meanings must not change with the area.

---

## 4. Shared navigation shell

Create one reusable child-facing shell.

### Desktop / tablet
- Top-left: Back or Settings.
- Top-center: breadcrumb + screen title.
- Top-right: avatar + stars + streak.
- Bottom-right: Home, except on Home screen.

### Phone
- Keep the same information hierarchy.
- Collapse star and streak into compact pills.
- Breadcrumb may reduce to one short context label.
- Never hide Back behind a menu.

### Breadcrumb examples
- `Home`
- `STEM Island`
- `STEM Island · Numbers`
- `Numbers · Intermediate`
- In a game: keep navigation visually quieter.

---

## 5. Menu-level redesign

## Level 0 — Onboarding / First launch

### Goal
Get the child into the experience quickly.

### Layout
1. Large friend / character preview.
2. One sentence instruction.
3. One primary action.
4. Progress dots at bottom.

### Rules
- One concept per slide.
- No dense paragraphs.
- Use animation to demonstrate gestures instead of explaining them in text.
- Final action: **Make My Friend** or **Start Playing**.

---

## Level 1 — Home World

### Goal
Let the child choose one of the four learning areas and make the Daily Journey obvious.

### Recommended composition
- Friend in center foreground.
- Four islands arranged around the friend.
- Daily Journey as a horizontal/curved route near the lower third.
- HUD around the edge, not mixed with island content.

### Island card behavior
Each island has:
- Large illustrated world object.
- Area name in a pill.
- One small progress indicator.
- Gentle idle motion.
- Strong squash + spring on tap.

### Improvements
- Make the four islands clearly distinct in silhouette, not only color.
- Highlight the recommended / last-played island using a soft glow or floating marker.
- Keep Daily Journey visually secondary until the child interacts with it.
- Avoid showing too many numbers at once.

---

## Level 2 — Area / Island Subject Menu

### Goal
Choose a subject without feeling like a conventional app grid.

### Recommended composition
Use a **playground path**, not a dashboard grid.

- The friend enters from the bottom.
- Subject landmarks sit along a curved path.
- 3–5 subject landmarks visible without scrolling when possible.
- Each landmark combines icon + short subject name.
- Locked / coming-soon items become scenery rather than disabled grey UI.

### Subject landmark states
- Not started: normal.
- Current recommendation: glow + friend nearby.
- In progress: small star cluster.
- Complete: treasure / badge accent.
- Locked: visually present but quiet.

### Why
This keeps the app feeling like a world while preserving simple navigation.

---

## Level 3 — Subject Map

### Goal
Show progression and make the next level unmistakable.

### Structure
- Stage pills at top: Basic / Intermediate / Advanced.
- One island map.
- Stone path from start to treasure chest.
- Friend stands on or beside the **next recommended stone**.
- Completed stones show earned stars.
- Current stone is largest and brightest.

### Recommended level stone states
- Completed: filled stone + stars.
- Current: gold rim + subtle pulse.
- Available: normal bright stone.
- Locked: lower contrast, but still readable.

### Improvements
- Keep the map fully visible without scrolling.
- Add a tiny animated travel line when changing stages.
- When a level finishes, animate the friend moving to the next stone.
- Treasure chest should act as the stage-completion focal point.

---

## Level 4 — Game Screen

### Goal
Remove menu chrome and focus on one task.

### Layout zones
- Top: small progress / prompt.
- Center: play surface.
- Bottom: context controls only when needed.
- Friend + speech bubble remain spatially stable between questions.

### Rules
- One instruction at a time.
- Never place decorative movement directly behind selectable answers.
- Correct answer: immediate physical response + sound + positive friend reaction.
- Wrong answer: gentle feedback, no alarming red failure screen.
- Primary game pieces should be visually larger than navigation controls.

### Game frame
Use one reusable game shell for all engines:
- prompt
- progress
- friend
- help / hear
- engine slot
- pause / home sheet

---

## Level 5 — Result / Celebration

### Goal
Reward completion and make the next action obvious.

### Sequence
1. Immediate celebration.
2. Stars land one by one.
3. Friend reacts.
4. Two actions appear:
   - **Next**
   - **Play Again**

Optional secondary action:
- Home / Map.

### Rules
- Do not show a dense analytics summary to the child.
- Do not show "failure".
- For 1–2 stars, encourage replay without using negative wording.

---

## 6. Character Maker

The Character Maker should feel like a toy shelf, not a settings form.

### Structure
- Large live character center.
- Category jelly buttons along one side/bottom.
- Choice tray opposite/below the character.
- Name tag close to the friend.
- Oversized **Done** button.

### Categories
Animal → Color → Hat → Glasses → Hold item → Voice

### Behavior
- Selecting a category changes only the tray.
- Selecting an item updates the friend immediately.
- Keep Back visible.
- Do not expose technical labels.

---

## 7. Grown-up area

This area may use a more conventional card layout because it is for adults.

Recommended sections:
- Progress
- Play time
- Speech & privacy
- Sound & motion
- Try at home
- Accessibility
- Open every level

Keep the child-facing visual identity, but reduce animation and decorative density.

Use:
- clear headings
- 16–18px body text
- conventional toggles
- explicit privacy wording
- confirmation for important changes

---

## 8. Motion system

Use one shared spring for:
- button press
- screen entry
- card landing
- level stone focus
- friend reaction

Motion hierarchy:
1. User action response — fastest.
2. Screen transition — medium.
3. Ambient world motion — slowest.

Rules:
- Every tap receives visible feedback.
- Never animate more than 3 important elements simultaneously.
- Respect the existing reduced-motion / “Bubbles, confetti & wiggles” preference.
- Keep the friend and speech bubble stable between game questions.
- Screen transitions should originate near the tapped object when practical.

---

## 9. Responsive behavior

### Small phone
- One main focal object.
- 3 columns maximum for compact choice trays.
- Use bottom sheets for secondary controls.
- HUD must respect safe areas.
- No horizontal page scrolling.

### Large phone / tablet
- Friend and content may sit side-by-side.
- Subject path can show more landmarks.
- Character maker can use a two-column composition.

### Desktop
- Preserve child-scale interaction.
- Do not shrink controls merely because more space exists.
- Cap main content width and use scenery to fill unused space.

---

## 10. Reusable components Claude should create

Prefer reusable render functions/classes over screen-specific markup.

Suggested components:

- `AF.UI.Hud`
- `AF.UI.JellyButton`
- `AF.UI.Pill`
- `AF.UI.ProgressPill`
- `AF.UI.FriendAvatar`
- `AF.UI.WorldShell`
- `AF.UI.AreaLandmark`
- `AF.UI.SubjectLandmark`
- `AF.UI.StageTabs`
- `AF.UI.LevelStone`
- `AF.UI.TreasureChest`
- `AF.UI.GameFrame`
- `AF.UI.ResultSheet`
- `AF.UI.BottomSheet`
- `AF.UI.GrownupCard`

Do not duplicate styles for equivalent controls.

---

## 11. CSS token layer

Create a token section near the top of `core/ui.css`.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  --tap-min: 72px;
  --tap-primary: 88px;

  --radius-pill: 999px;
  --radius-card: 28px;
  --radius-jelly: 32%;

  --shadow-soft: 0 10px 24px rgba(44, 40, 70, .14);
  --shadow-raised: 0 14px 0 rgba(44, 40, 70, .14), 0 22px 34px rgba(44, 40, 70, .16);

  --dur-fast: 120ms;
  --dur-medium: 260ms;
  --dur-slow: 900ms;
}
```

Keep area-specific colors in scene/theme variables rather than hard-coding them per component.

---

## 12. Scene system

Continue using a screen-level scene attribute.

Example:

```html
<body data-scene="stem" data-screen="subject-map">
```

Suggested scenes:
- `home`
- `literacy`
- `stem`
- `heart`
- `play`
- `maker`
- `grownups`

Suggested screens:
- `home`
- `area`
- `subject-map`
- `game`
- `result`
- `maker`
- `tutorial`
- `grownups`

Components should react to `data-scene`; layout should react to `data-screen`.

---

## 13. Implementation boundaries

### Prefer editing
- `core/ui.css`
- `core/screens.css`
- `core/motion.css`
- `core/icons.js`
- `core/world.js`
- `core/app.js`
- `core/levels.js` only for map presentation / transitions

### Avoid changing unless required
- `content/*`
- engine question logic
- star scoring
- unlock rules
- profile persistence
- speech matching behavior

If a UI change requires engine changes, keep the engine API backward-compatible.

---

## 14. Implementation order

Do not redesign every screen independently.

Implement in this order:

1. CSS tokens and responsive shell.
2. Shared HUD.
3. Jelly buttons, pills, cards and sheets.
4. Home World.
5. Area / subject menu.
6. Subject map.
7. Game frame.
8. Result screen.
9. Character Maker.
10. Grown-up area.
11. Tutorial / onboarding.
12. Responsive cleanup.
13. Motion consistency pass.
14. Real-device testing.

After every phase, verify deep links still work.

---

## 15. Acceptance checklist

A redesign is complete only when:

- Equivalent controls look identical across screens.
- Back/Home/Settings never jump position unexpectedly.
- Every child control has a large hit area.
- Home → Area → Subject → Game feels like one continuous world.
- The next recommended action is visually obvious.
- Subject maps remain usable without page scrolling.
- Child screens avoid dense text.
- Grown-up screens prioritize clarity over decoration.
- Motion uses the same spring and responds immediately to taps.
- Reduced-motion preference still works.
- Existing level content and progression remain intact.
- Phone, tablet and desktop layouts all remain usable.
