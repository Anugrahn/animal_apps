# Putting the party edition online

The birthday edition — *Naura's Wonderf4ur World* — lives on the branch
`party-naura` and is hosted on **Vercel**:

**https://wonderfour.vercel.app**

It is a separate project from the everyday app, so the two never touch each
other: a push to `party-naura` cannot change what Naura plays day to day, and
a push to `main` cannot change the party.

## Why Vercel and not Cloudflare

The everyday app runs on Cloudflare Workers with a small worker in front of
`/voice/*`. That worker exists for one reason: Safari asks for sound in byte
ranges, and Cloudflare's asset host answers with the whole file, so the voice
falls back to the device's robot reader on an iPhone.

Vercel answers byte-range requests on static files by itself — verified on a
real clip from this app:

```
voice/<clip>.mp3  →  206,  accept-ranges: bytes
```

So the party edition needs no worker, and gets a shorter address with no
account slug in it.

The Cloudflare copy is still live at
`naura-wonderfour.uga-ergonomi.workers.dev` and works. Keep it as a fallback
until the party is over, then delete the project.

## The project's settings

| Setting | Value |
|---|---|
| Project | `wonderfour` (account `anugrahnrhmd-3426`) |
| Git repository | `Anugrahn/animal_apps` |
| Production branch | `party-naura` |
| Root directory | `/` |
| Build command | `sh tools/deploy/cf-build.sh` |
| Output directory | `dist` |
| Deployment Protection | **off** — on, it puts every guest behind a Vercel login |

`vercel.json` at the repository root carries what `_headers` set on Cloudflare:
`sw.js` is never cached, so an update always reaches an installed phone, plus
the three safety headers on everything else.

**Never deploy this from the command line.** `vercel deploy` uploads every file,
and the free plan allows 5,000 file uploads a day — this app is 4,895 files, so
one deploy burns the day's quota and locks the account out for 24 hours. Vercel
builds from GitHub instead, which uploads nothing.

**Commit as the personal identity.** This repo's git config is set to
`anugrahnrhmd@gmail.com`. The machine's default is Uga's work address, and
Vercel has refused a personal deploy over it before.

## Every update

1. Change the app on `party-naura`.
2. `git push`. Vercel builds in about fifteen seconds.
3. Open the address again. An installed phone picks the update up next time it
   opens online.

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
- [ ] **Listen to it.** Nobody has heard this app yet — the audio fixes were
      measured, not heard.
- [ ] Try it on an iPhone. Everything so far was tested in Chromium only, and
      the voice path on Vercel is different from the Cloudflare one.
- [ ] Check the Bahasa stop speaks Indonesian on a guest's phone; a phone with
      no Indonesian voice installed reads it in whatever voice it has.
- [ ] Repaint the pictures listed in `animal-friends-v2/docs/art/`.
- [ ] Record the 30 English lines that have no clip (`tools/voice`), or accept
      that the friend turns robotic for those few lines.
- [ ] Only then print the invitation
      (`animal-friends-v2/interface/party/undangan-qr.png`).
