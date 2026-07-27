# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The **Devflovv website** (devflovv.com) — a static, RequireJS-driven site with
a WebGL gem homepage and a project portfolio. Owner: Tanzeel (Devflovv).

It began as a copy of a third-party agency-site template, and a previous
developer stripped features by **commenting them out rather than deleting
them**. That single habit is the source of nearly every problem found here:
dead assets that still downloaded, foreign client content left in the data,
and 58 JS modules that could never load. Assume anything odd traces back to it.

**There is no build system.** No package.json, no bundler, no `src/`. The files
in `assets/js/` and `assets/data/` ARE the deployable site. Edit them directly;
nothing regenerates them. Never .gitignore them.

## How the site actually boots (verified, not assumed)

`index.html` sniffs the device and forwards to `index_desktop.html` or
`index_mobile.html`. Both set `data-main="assets/js/loader"`, and RequireJS
loads exactly these files — confirmed against a headless-Chrome netlog of the
live site:

    require.js, es6-shim.min.js, modernizr-2.5.3.min.js, text.js, howler.js,
    loader.js, and main_desktop_extended.js   (main_mobile.js on mobile)

Everything else that used to live under `assets/js/` was either already inlined
in those bundles or belonged to commented-out features. `Config.CDN` is
`"./assets"`, so `/img/x.png` in the bundles means `assets/img/x.png`.

## Testing: you MUST use a real WebGL browser

`--dump-dom` / request-count checks are **worthless** here. Headless Chrome
without a GPU never finishes the WebGL boot, so a completely black site reports
*zero errors and zero 404s*. Two broken builds shipped to production that way.

Use `~/Development/Resn-cleanup/cdp.py` (a dependency-free Chrome DevTools
Protocol client) which runs Chrome with SwiftShader, waits in real time, and
reports console output, uncaught exceptions and failed requests:

```bash
python3 ~/Development/Resn-cleanup/cdp.py https://devflovv.com/ 45 shot.png
```

**A healthy boot logs `show initial`.** If that line is missing, the gem never
got revealed - that is the black screen, and it happens with no exception at
all. Always check both `/` and `/#!/work`, and look at the screenshot.

## Performance (2026-07-27: 43.9s -> 1.06s load)

- **nginx had `gzip on;` but `gzip_types` commented out**, so only HTML was
  compressed and the 3.9 MB JS bundle shipped raw. Enabling it was the single
  biggest win (bundle 3,988 KB -> 845 KB). Backup: `/root/nginx.conf.bak`.
- Work posters must never be preloaded. `WorkMenuPosterView` builds bare
  `<img>` tags and sets `src` on first `show()`; `addProjectsToLoader()` is a
  deliberate no-op. Home page fetches 0 project images.
- Ambient tracks were downloaded twice - Howler fetched them, then
  `loadAmbients()` re-added them to LoaderCollection under `AMBIENT_TRACKS_*`
  ids nothing ever read.
- **Audio cannot be deferred.** The intro sequence is entangled with the sound
  load; defer it and `show initial` never fires (black screen, no exception).
  The MP3s are 64kbps mono instead.

## Latent bugs fixed (both only appear when boot gets faster)

- `playNext()` used `this._currentAmbient.pause()` with no null check.
- `AppModel.get('pageOptions')[0]` is read inside a `requestAnimationFrame`
  that can fire before the router sets it - intermittent, 2 of 3 runs.

## Commented-out code inventory

**19% of the bundles (44,520 of 234,289 lines) is commented-out code.** The
previous developer disabled features by commenting them rather than deleting,
which is why assets kept downloading for things that can never run:

| feature | live refs | commented | status |
|---|---|---|---|
| resize-your-window character | 0 | 36 | dead |
| rotate-your-device character | 0 | 5 | dead |
| showreel | 0 | 1 | dead |
| sound clip playback | 3 | 15 | partly live |
| shapeshifter / bat / video | some | some | partly live |

Regenerate with `~/Development/Resn-cleanup/commented_inventory.py`.

## Investigation rules (each one cost real time here)

1. **A commented-out reference still looks like usage.** Every naive audit
   counted them. `img/resize/` survived three passes because all 32 of its
   references sit in commented blocks. Always test line liveness.
2. **Substring matching lies.** `loop`, `rei`, `flash`, `dove` appear inside
   ordinary JS words; `easel` matches EaselJS attribution text; `resn` is
   inside `fresnelAmount` and `featuresNativeTextTracks`. Match full paths.
3. **RequireJS omits the `.js` extension**, so filename matching marks every
   module dead — including the 4 MB main bundle. Match the bare stem too.
4. **Commented code can be superseded by live data.** `awwward.js` has its
   asset list commented out, but `interactives.json` referenced those assets
   for real. Check data files before concluding.
5. **Verify against the running site, not the source.** Headless Chrome plus a
   logging static server is the ground truth:
   `python3 -m http.server` + `google-chrome --headless=new --dump-dom`, then
   diff the request set and require zero 404s.

## The preload trap (biggest perf bug found)

The bundles register assets with `LoaderCollection.add({id, src})` and read them
with `getResult(id)`. Features were commented out **without** removing their
`.add()` lines, so browsers downloaded assets nothing would ever use — 1.04 MB
every visit, including the whole "rotate your device" character on every mobile
load. If you delete such an asset, delete its `.add()` line too or you create a
404. `preload_audit.py` (see tooling below) finds them.

**Still outstanding:** the homepage preloads all 13 project poster images before
it renders. They belong on the Work page, not the home screen. Fixing this is
the next big win.

## Content integrity — check provenance, not just presence

This site shipped for years displaying another agency's client work as
Devflovv's. All of the following were found and fixed on 2026-07-27:

- Desktop project descriptions were the template's original marketing copy
  (a James Patterson novel, New Zealand vodka on the Keyfree entry, an REI
  campaign, a vogue-ball documentary on THDC), or `"Add Descrription"`
  placeholders. Real copy existed in `projects_mobile.json` all along.
- Every Vimeo video belonged to the original agency — confirmed via Vimeo's
  public oEmbed API (`04_lexus_skate`, `Dove - Have Your Say`, a Sea Shepherd
  AR teaser). All video is now removed from the site.
- The mobile Augmentt entry displayed real REI photography.
- Asset folders were named after the template's clients (`mustang`, `rei`,
  `pioneer`, `les-mills-grit`) while holding Devflovv's images. Renamed to
  `eventium`, `augmentt`, `cade-insights`, `edu-os`.

**Before trusting any project entry, verify the copy, images and video are
actually Devflovv's.** Cross-check against the Slack-derived portfolio in
`~/Development/tenders/matcher/portfolio/`.

## Conventions

- Project assets: `assets/img/projects/<project>/`, lowercase kebab-case
  filenames. Case mismatches previously caused silently broken images.
- Every image must stay **under 300 KB** and 2400px on the long edge.
- Transparent images use WebP (PNG8 quantisation dithers visibly on the
  gradient mockups); opaque photos use JPEG.
- Never commit video files.
- Batch edits to the multi-MB bundles and data JSONs — each commit stores a
  near-full copy.

## Deployment

`.github/workflows/deploy.yml` rsyncs master to
`root@167.172.43.243:/var/www/new.devflovv.com` on every push. Note the real
docroot is **new.devflovv.com**; `/var/www/devflovv.com` is empty. The workflow
does a `--dry-run --itemize-changes` pass first, then deploys, then asserts the
site returns 200. Requires repo secret `DEPLOY_SSH_KEY`; host/user/path can be
overridden with repo variables.

The droplet is Ubuntu 20.04 (EOL) with root SSH open — treat as production.

## Housekeeping

- Tooling lives in `~/Development/Resn-cleanup/` (`compress_images.py`,
  `budget_pass.py`, `build_strip_list.py`, `git-filter-repo`).
- Pre-cleanup backup mirror: `~/Development/Resn-backup.git` — the only copy of
  the original history and of the deleted branches.
- Two unmerged branches are archived as tags **on origin**:
  `archive/frontend-changes` (removes Google Analytics, tracking controller and
  owner references — never went live, worth revisiting) and
  `archive/control-progress-bar-speed`.
- Only `master` is maintained. It used to be stale — the live site was really
  running `dev`, ~50 commits ahead — so master was reset to dev before the
  other five branches were deleted.
- History was rewritten and later squashed; any old clone must be re-cloned.

## Known pre-existing breakage

Two referenced files have never existed: `img/bg-ios-fallback.jpg` and
`img/textures/00.jpg`. Font `.eot`/`.svg` variants and `critical_mobile.css`
referenced in `all_mobile.css` are also missing. None of this came from the
cleanup — verify against this list before assuming a change broke something.

Also: console errors mentioning `inpage.js`, `EthereumAdapter` or
`px.ads.linkedin.com` come from **browser extensions** (a crypto wallet and an
ad blocker), not from this site.
