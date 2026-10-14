# Putting Animal Friends online (Cloudflare, free)

The app is a set of plain files (no server, no database). It runs on
Cloudflare Workers (free; commercial use allowed; every `git push` goes online
by itself) at **https://animal-apps.uga-ergonomi.workers.dev/**.

## The project's settings (Workers & Pages → animal-apps → Settings → Build)

| Setting | Value |
|---|---|
| Git repository | Anugrahn/animal_apps, branch `main` |
| Root directory | `/` *(the repository root, not `animal-friends-v2`)* |
| Build command | `sh tools/deploy/cf-build.sh` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` (repository root) tells Cloudflare what to publish: only
`dist/`, which the build command fills with what a phone needs, plus a tiny
worker (`tools/deploy/worker.js`) that answers voice clips asked for in pieces.
Safari asks for sound that way and plays nothing (so the app falls back to the
robot-like device voice) if the host sends the whole file instead, and
Cloudflare's file host does.

Children's progress is saved per address. Keep this address, or add your own
domain to this same project later (Settings → Domains & Routes), before many
families use it.

(Cloudflare Pages works too: project name = address `<name>.pages.dev`, build
command as above, output directory `dist`. It needs no deploy command; the
voice worker is then not used.)

## Every update after that

1. Change the app (content, art, voice), and try it locally:
   `cd animal-friends-v2 && python3 serve.py`.
2. `git push`. Cloudflare builds and publishes it in about a minute.
3. Installed copies update the next time they open online. Children's
   progress stays.

`tools/deploy/cf-build.sh` copies only what a phone needs into `dist/` (not
`interface/`, `docs/`, notes or the local server) and names the offline cache
after the app's files, so you no longer have to remember to bump `VERSION` for
an update to arrive. (Bumping it still marks a release.) Voice clips that didn't
change are not downloaded again, so an update costs a few MB, not the whole
73 MB.

**Keep these rules** (see `animal-friends-v2/CLAUDE.md`):
- Never rename or remove a level's or subject's id (`letters`, `l7` ...): stars
  are saved under it.
- Keep the address. A custom domain can be added to the same project later,
  but progress saved on the old address does not move to it by itself.

Limits on the free plan that matter here: 20,000 files and 25 MB per file per
deploy (the app has about 3,300 files, none over 1 MB), 500 deploys a month.

## How parents install it

Share the address. Open it once on Wi-Fi: the app stores itself (about 73 MB)
and then works with no internet.

- **Android (Chrome):** menu ⋮ → **Install app** (or the install banner).
- **iPhone / iPad (Safari):** Share → **Add to Home Screen**. Do install it:
  Safari may clear a website's saved data after about a week unused, but not
  an app on the home screen.
- **Computer (Chrome / Edge):** the install icon in the address bar.

## Before telling everyone

- The privacy page (`animal-friends-v2/privacy.html`, linked at the bottom of
  the grown-up area) gives anugrahnrhmd@gmail.com as the contact.
- Try it on a real phone: install, play offline, Say It! with each speech
  option.

## Later

- **Own domain** (about $10–15 a year): add it in the Pages project
  (Domains & Routes). Best before many families use the workers.dev address.
- **App stores:** Google Play can take this app as is, wrapped with PWABuilder
  ($25 once). The App Store needs a wrapper such as Capacitor ($99 a year) and
  follows Apple's rules for the Kids category.
