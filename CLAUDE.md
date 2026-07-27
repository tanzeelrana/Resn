# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The **Devflovv website** — a static site adapted from the open-source
`playday3008/Resn` template (itself a copy-paste of `resn.co.nz`).
Owner: Tanzeel (Devflovv). Remote: `github.com/tanzeelrana/Resn`.

**There is no build system.** No package.json, no bundler, no src/. The files
in `assets/js/` (`main_desktop_extended.js`, `main_mobile.js`, `loader.js`)
and `assets/data/` (`projects.json`, `letters.json`, …) are the deployable
site code and **must stay tracked in git** — do not .gitignore them. Edit
them directly; there is nothing to "rebuild" from.

## Repo hygiene rules (learned the hard way)

This repo hit **921 MB** (533 MB `.git` + 388 MB images) before the 2026-07-27
cleanup. Causes and rules:

1. **Never commit videos.** A single `coursology-m-v.mov` (26 MB) sat in
   history long after being deleted. Use compressed `.mp4`/`.webm` hosted
   elsewhere, or keep them out of git entirely.
2. **Compress images before committing.** `assets/img/projects/` holds
   ~1,470 files. Target: JPEGs ≤ 300 KB, PNGs ≤ 1 MB. Multi-MB title PNGs
   (`learnEZ-title3.png` was 6.7 MB) hurt both repo size and page load.
3. **Commit the big JS/JSON files as rarely as possible.** They are ~4 MB
   each and minified, so git stores a near-full copy per commit —
   `main_desktop_extended.js` alone was 17 versions ≈ 65 MB of history.
   Batch changes to them; don't commit them incrementally.

## History rewrite record

- **2026-07-27**: history rewritten with `git filter-repo` to strip the
  `.mov` and all old (non-tip) blobs ≥ 100 KB across all 6 branches
  (master, dev, develop, frontend_changes, Refactor/removed_iFit_details,
  feature/control-progress-bar-speed). All branch tips were protected —
  current site content unaffected. Force-pushed to origin.
- Consequence: **checking out pre-rewrite commits gives incomplete trees**
  (old asset versions are gone). That is intentional.
- Pre-rewrite backup: `~/Development/Resn-backup.git` (mirror clone,
  533 MB). Delete it once confident nothing was lost.
- Anyone with an old clone must re-clone (or hard-reset to the new
  history) — old clones cannot be pushed/pulled against the rewritten
  remote.

## Branches

`master` is the GitHub default branch but is **stale** — as of 2026-07-27 the
active line of work is ~50 commits ahead of it and unmerged:
`dev` (tip, includes the iFit-details removal via PR #5),
`Refactor/removed_iFit_details`, `feature/control-progress-bar-speed`,
`frontend_changes`. `develop` is an old 2024 branch (2 unmerged commits).
Decide deliberately which branch is deployed before merging or deleting
anything; the iFit removal was likely done for client-confidentiality
reasons and probably belongs on whatever branch is live.

## Maintenance of this file

Keep this file updated when: repo-shaping events happen (rewrites, asset
policy changes), branches are added/retired, or a build/deploy pipeline is
introduced (which would change the "no build system" rule above).
