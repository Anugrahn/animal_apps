# Putting Animal Friends online (Cloudflare Pages, free)

The app is a set of plain files (no server, no database), so any static host
works. Cloudflare Pages is free, allows commercial use, has no bandwidth limit,
and puts every `git push` online by itself.

## One time: set it up (about 10 minutes)

1. Make a free account at <https://dash.cloudflare.com/sign-up>.
2. In the dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
   Allow access to GitHub and pick the repository **Anugrahn/animal_apps**
   (a private repository is fine).
3. **Project name:** this becomes the address, `<name>.pages.dev`, for good.
   Choose it carefully (for example `animal-friends` → `animal-friends.pages.dev`).
   Children's progress is saved per address, so changing the address later
   means starting over on every phone.
4. **Build settings:**

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `sh tools/deploy/cf-build.sh` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |

5. **Save and Deploy.** After a minute or two the app is live at
   `https://<name>.pages.dev`.

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
  but progress saved on `pages.dev` does not move to it by itself.

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
  (Custom domains). Best before many families use the `pages.dev` address.
- **App stores:** Google Play can take this app as is, wrapped with PWABuilder
  ($25 once). The App Store needs a wrapper such as Capacitor ($99 a year) and
  follows Apple's rules for the Kids category.
