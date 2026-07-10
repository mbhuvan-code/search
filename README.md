# Maddie Bhuvan, PM intern portfolio (Google/Chrome edition)

A static site styled after Google Search and Chrome. Vanilla HTML/CSS/JS, no backend, no API keys. Deployable as-is to GitHub Pages.

## Site structure

Results pages are light and scannable; the depth lives on detail pages you click into. Both the AI Overview links and the blue result titles route to the same detail page.

```
index.html            Google-style homepage
about.html            results page: who is maddie?
projects.html         results page: what experiences does maddie have?
interests.html        results page: what is maddie interested in?
skills.html           results page: what are maddie's skills?
contact.html          results page: how can i contact maddie? (no sub-pages)

projects/             designed case study pages
  knosy.html          Knosy (Perplexity Agent Build Night winner)
  hackbubu.html       Hackbubu (SF Tech Week, embeds the pitch video)
  goodwill.html       Evergreen Goodwill waste diversion (stats + team photos)
  blueshield.html     Blue Shield maternal care equity (deliverable images)
  jpmc.html           JPMC Summer Analyst work (building now)
  dance-app.html      The dance community app (founder, building now)

interests/            photo-forward pages (image placeholders to fill)
  dance.html          Dance
  music.html          Music and DJing
  travel.html         Travel and photography

skills/               skill deep-dives with proof-point chips
  product.html        Product skills + the LinkedIn Learning credentials card
  technical.html      Technical skills
  how-i-work.html     How she works
```

## Shared pieces

| File | What it does |
|---|---|
| `css/style.css` | Chrome tab strip, Google home + results styling, knowledge panels, responsive rules |
| `css/detail.css` | Detail pages only: case study layout (`.cs-*`), interest galleries (`.gallery`, `.ph` placeholders), skill rows (`.sk-*`) |
| `js/chrome.js` | Renders the tab strip and toolbar everywhere. Tabs live in `CHROME_TABS`. Detail pages declare `data-root="../"`, `data-parent` (makes the toolbar back arrow work), and `data-path` (shown in the omnibox) |
| `js/search.js` | Homepage suggestions and keyword routing (results pages only) |
| `site_assets/` | Headshot, resume PDF, project images, pitch video |

## Detail page anatomy

Every detail page: Chrome tab strip (section tab stays active, clicking it returns to results), a toolbar back arrow that behaves like the real browser back button (falling back to the section results page on a direct landing), an accent color set inline via `--accent` on `<main>`, and a next-page footer link.

## Gallery photos (interests pages)

The galleries are filled with photos pulled from the Figma portfolio (saved in `site_assets/` as `dance_*`, `music_*`, `travel_*`). To swap or add one, replace the `<img>` src and caption; keep the `wide`/`half`/`third` class on the figure and the `rXX` aspect class on the img. No placeholders remain.

`site_assets/ucb_portrait.jpg` (the UC Berkeley portrait from the Figma homepage) is saved but unused, in case you want it anywhere.

## Other TODOs in the code

- `projects/dance-app.html`: app name, current milestone, screenshots
- `projects/jpmc.html`: outcomes once the summer wraps
- `projects/blueshield.html`: replace the paraphrased pull quote if desired
- `skills/product.html`: proof points for requirements/user stories and sprint ceremonies
- `skills/technical.html`: an SQL-specific proof point (Python, Figma, and Excel are covered)

## Deploying

Push to GitHub and enable Pages (Settings > Pages > deploy from `main`, root). No build step.
