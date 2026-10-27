# Putting the party edition online

This is the birthday edition — *Naura's Wonderf4ur World* — which lives on the
branch `party-naura`. It is a **separate Cloudflare project** from the everyday
app, so the two never touch each other: a push to `party-naura` cannot change
what Naura plays on `animal-apps`, and a push to `main` cannot change the party.

The branch is already on GitHub. What is left is one setup in the dashboard,
done once.

## Make the project (once)

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → repository `Anugrahn/animal_apps`.

| Setting | Value |
|---|---|
| Project name | `naura-wonderfour` |
| Production branch | **`party-naura`** ← not `main` |
| Root directory | `/` *(the repository root, not `animal-friends-v2`)* |
| Build command | `sh tools/deploy/cf-build.sh` |
| Deploy command | `npx wrangler deploy` |

The project name has to be `naura-wonderfour`, because that is the name in
`wrangler.jsonc` on this branch and it is what the QR code on the invitation
points at:

**https://naura-wonderfour.uga-ergonomi.workers.dev/**

If you would rather have a different address, say so before printing the
invitation — the QR takes ten seconds to redo, a printed card does not.

## Every update after that

1. Change the app on the `party-naura` branch.
2. `git push`. Cloudflare builds and publishes in about a minute.
3. Open the address again on the phone. A phone that already has it installed
   picks the update up the next time it opens online.

`tools/deploy/cf-build.sh` copies only what a phone needs into `dist/` — the
invitation artwork and the raw sticker cut-outs under `interface/` stay out of
it — and fingerprints the offline cache so an update always reaches installed
copies.

## Keeping the two editions in step

Bug fixes and layout work are done on `main`, then brought across:

```sh
cd /Users/uga/Desktop/project_apps-party
git merge main
```

Going the other way is deliberate and rare: the party branch holds the Pinkfong
cast, the party skin and the Birthday Quest, and none of that belongs in the
everyday app.

## Before the party

- [ ] Play all six quest stops by hand, on a real phone, start to cake.
- [ ] Listen to it. Nobody has heard this app yet — the audio fixes were
      measured, not heard.
- [ ] Try it on an iPhone. Everything so far was tested in Chromium only.
- [ ] Check the Bahasa stop speaks Indonesian on a guest's phone; a phone with
      no Indonesian voice installed will read it in whatever voice it has.
- [ ] Repaint the six pictures in
      `animal-friends-v2/interface/ASSET_NEEDS_world-objects.md`.
- [ ] Only then print the invitation.
