# Devflovv — devflovv.com

The Devflovv agency website: a static, RequireJS-driven site with an animated
WebGL background and a project portfolio.

## Running it

There is no build step. Serve the repository root with any static file
server, for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. `index.html` detects the device and
forwards to `index_desktop.html` or `index_mobile.html`; both boot RequireJS
via `assets/js/loader.js`.

## Layout

| Path | What it holds |
|---|---|
| `assets/data/projects.json` | desktop portfolio entries |
| `assets/data/projects_mobile.json` | mobile portfolio entries |
| `assets/data/interactives/` | config for the interactive backgrounds |
| `assets/img/projects/<project>/` | per-project imagery, one folder per project |
| `assets/js/` | site code (AMD modules, loaded by `loader.js`) |

Editing the portfolio means editing the two `projects*.json` files and adding
images under `assets/img/projects/<project>/`.

See `CLAUDE.md` for repository conventions and history.
