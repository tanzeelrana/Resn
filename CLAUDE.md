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

## Size cleanup — 2026-07-27

Repo was 921 MB (533 MB `.git` + 388 MB assets).

**Done:** images recompressed in place on all 6 branches (JPEG q82
progressive, ICC preserved; lossless PNG optimize). ~1,024 of 1,456 files
rewritten per branch, 393 MB → 216 MB of image data. Working tree assets:
388 MB → 236 MB.

**Not done — history rewrite is still PENDING.** Until it runs, `.git` is
*larger* than before (740 MB) because it holds both the old and the new
image blobs. The prepared, ready-to-run step lives in
`~/Development/Resn-cleanup/`:

```bash
cd ~/Development/Resn
python3 ~/Development/Resn-cleanup/build_strip_list.py   # regenerate the list
python3 ~/Development/Resn-cleanup/git-filter-repo \
    --strip-blobs-with-ids ~/Development/Resn-cleanup/strip_ids.txt \
    --prune-empty never --force
git remote add origin https://github.com/tanzeelrana/Resn   # filter-repo drops it
git push --force --all origin
```

The list strips 1,017 blobs (~514 MB): every blob ≥ 100 KB **not** reachable
from a branch tip (superseded old versions), plus
`assets/img/projects/coursology/coursology-m-v.mov` (25.6 MB, still at 4 tips
but referenced by nothing). Branch tips are otherwise protected, so no
current site content is touched. Re-run `build_strip_list.py` first if any
new commits have landed.

After it runs: pre-rewrite commits will have incomplete trees (intentional),
and anyone with an old clone must re-clone. Backup mirror of the *original*
history: `~/Development/Resn-backup.git` (533 MB) — keep until verified.

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
