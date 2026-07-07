# Maddie Bhuvan, PM intern portfolio (Google/Chrome edition)

A static site styled after Google Search and Chrome. Vanilla HTML/CSS/JS, no backend, no API keys. Deployable as-is to GitHub Pages.

## Where the content lives

Every section's content is plain HTML in its own page. Edit the text there directly.

| File | What it holds |
|---|---|
| `index.html` | Homepage (Google home screen): wordmark, search bar, suggestion prompts, shortcut tiles |
| `about.html` | About Me: bio, beliefs, current roles, plus the knowledge panel with the headshot |
| `projects.html` | All projects: Knosy, Hackbubu, Evergreen Goodwill, Blue Shield, JPMC (building now), dance app startup, plus the experience timeline panel |
| `interests.html` | Dance, music and DJing, travel and photography |
| `skills.html` | Product / Technical / How she works skill lists and the LinkedIn Learning credentials |
| `contact.html` | Email, LinkedIn, resume links and the get-in-touch panel |

## Shared pieces

| File | What it does |
|---|---|
| `css/style.css` | All styling: Chrome tab strip, Google colors, search bar, result entries, knowledge panels, responsive rules |
| `js/chrome.js` | Renders the browser tab strip and toolbar on every page. Tab names and order live in `CHROME_TABS` at the top. Also colors the wordmark and wires AI Overview anchor links |
| `js/search.js` | Homepage suggestion dropdown (`SEARCH_SUGGESTIONS`) and keyword routing (`KEYWORD_ROUTES`). No AI: plain keyword matching, unmatched queries go to About Me |
| `site_assets/` | Headshot, resume PDF, project images, pitch video (unchanged from the original site) |

## How the pages are structured

Each section page follows the same skeleton, top to bottom:

1. `<div id="chrome-top">`: the tab strip, injected by `js/chrome.js`. Which tab is active comes from `<body data-tab="...">`.
2. A results header with the "query" pre-filled. Typing a new query and pressing Enter routes to the closest section.
3. Decorative results filters (All, Images, Videos, ...).
4. An AI Overview card. Links inside it scroll to the matching result below and flash it. Anchor ids like `#knosy` sit on each `<article class="result">`.
5. Google-style result entries: blue title, URL-ish breadcrumb, snippet.
6. An optional right-side info panel (`<aside class="kpanel">`).

## Editing tips

- To add a project, copy one `<article class="result" id="...">` block in `projects.html`, give it a new id, and link the id from the AI Overview paragraph.
- To rename a tab, edit `CHROME_TABS` in `js/chrome.js` (the file names stay the same unless you also rename the HTML files).
- The colored wordmark is generated from the `data-text` attribute; change the name in one place per page.

## Deploying

Push to GitHub and enable Pages (Settings > Pages > deploy from `main`, root). No build step.
