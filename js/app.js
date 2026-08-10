/* ==========================================================================
   app.js
   Single-page router for index.html plus the shared page behaviors.

   The site is one document: the homepage (#view-home) and five result
   sections (#view-results > .section-panel). Real browser navigation drives
   the state: every section lives at ?q=<question> via history.pushState,
   document.title mirrors the current question, and back/forward walk
   between sections (and back to the homepage) via popstate.

   To rename a section or its question, edit SECTIONS below.
   ========================================================================== */

const SECTIONS = {
  about:     { q: "who is maddie?",                     slug: "who+is+maddie" },
  projects:  { q: "what experiences does maddie have?", slug: "what+experiences+does+maddie+have" },
  interests: { q: "what is maddie interested in?",      slug: "what+is+maddie+interested+in" },
  skills:    { q: "what are maddie's skills?",          slug: "what+are+maddies+skills" },
  contact:   { q: "how can i contact maddie?",          slug: "how+can+i+contact+maddie" }
};

const HOME_TITLE = "Madhurum Bhuvan";

/* Homepage suggestion dropdown: question shown -> section it opens */
const SEARCH_SUGGESTIONS = [
  { text: "Who is Maddie?",                     section: "about" },
  { text: "What experiences does Maddie have?", section: "projects" },
  { text: "What is Maddie interested in?",      section: "interests" },
  { text: "What are Maddie's skills?",          section: "skills" },
  { text: "How can I contact Maddie?",          section: "contact" }
];

/* Free-typed queries are scored against these keyword lists: the section
   hitting the most keywords wins, ties keep the order below, and a query
   that hits nothing falls back to About. Keywords are matched as
   prefixes at word starts, so stems ("hobb", "certificat") are deliberate
   and catch their whole family. */
const KEYWORD_ROUTES = [
  { section: "interests", words: ["interest", "hobb", "dance", "music", "dj", "travel", "photo", "concert", "fun", "outside", "free time", "spare time", "passion", "personal life", "like to do"] },
  { section: "projects",  words: ["project", "experience", "work", "intern", "built", "build", "ship", "knosy", "hackbubu", "goodwill", "blue shield", "jpmorgan", "jpmc", "startup", "case", "hackathon"] },
  { section: "skills",    words: ["skill", "credential", "certificat", "tool", "sql", "python", "figma", "roadmap", "agile", "excel", "research"] },
  { section: "contact",   words: ["contact", "email", "reach", "linkedin", "resume", "hire", "touch"] },
  { section: "about",     words: ["about", "who", "maddie", "madhurum", "bio", "berkeley", "background"] }
];

/* Google colour rotation used for the wordmark letters */
const G_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853"];

/* ----------------------------------------------------------------- sources
   Citation list per section: exactly what that section's AI Overview links
   to, in text order. This single structure renders BOTH the source panel
   and the inline citation chip, so they can never diverge. */

const FAVICONS = {
  linkedin: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2"/><path fill="#fff" d="M8.2 10.1h2.1V17H8.2zM9.25 6.6a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM11.9 10.1H14v.95c.3-.57 1.06-1.15 2.18-1.15 2.05 0 2.72 1.25 2.72 3.1V17h-2.1v-3.55c0-.97-.35-1.63-1.2-1.63-.87 0-1.4.6-1.4 1.63V17h-2.1z"/></svg>',
  github: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#24292f" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="15" height="15" fill="#F4B400" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#5f6368" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 7L4 6v2l8 5 8-5V6l-8 5z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="15" height="15" fill="#5f6368" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.45a15.6 15.6 0 0 0-1.16-5.53A8.03 8.03 0 0 1 19.93 11zM12 4.07c.86 1.1 1.9 3.32 2.12 6.93H9.88c.22-3.61 1.26-5.83 2.12-6.93zM8.68 5.47A15.6 15.6 0 0 0 7.52 11H4.07a8.03 8.03 0 0 1 4.61-5.53zM4.07 13h3.45c.13 2.09.55 3.98 1.16 5.53A8.03 8.03 0 0 1 4.07 13zM12 19.93c-.86-1.1-1.9-3.32-2.12-6.93h4.24c-.22 3.61-1.26 5.83-2.12 6.93zm3.32-1.4c.61-1.55 1.03-3.44 1.16-5.53h3.45a8.03 8.03 0 0 1-4.61 5.53z"/></svg>'
};

const SECTION_SOURCES = {
  about: [
    { icon: "linkedin", name: "LinkedIn", href: "https://linkedin.com/in/madhurum-bhuvan",
      title: "Madhurum (Maddie) Bhuvan | LinkedIn",
      meta: "Jul 12, 2026 — UC Berkeley · JPMorgan Chase Summer Analyst, Summer 2026 · IVP, Net Impact Berkeley",
      thumb: "site_assets/headshot.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "site_assets/Madhurum_Bhuvan_Resume.pdf",
      title: "Madhurum_Bhuvan_Resume.pdf",
      meta: "2026 — One page: education, experience, leadership, and skills.",
      thumb: "site_assets/resume_thumb.jpg" },
    { icon: "globe", name: "Net Impact Berkeley", href: "https://netimpactberkeley.org",
      title: "Net Impact Berkeley",
      meta: "UC Berkeley's Net Impact chapter — social impact consulting." }
  ],
  projects: [
    { icon: "star", name: "Maddie Bhuvan", href: "projects/jpmc.html",
      title: "Inside JPMorgan Chase",
      meta: "Summer 2026 — SOP-writing AI tool adopted by 100+ users, 3rd of ~600 in the Global Hackathon." },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/knosy.html",
      title: "Knosy",
      meta: "Apr 2026 — Best Computer-Powered Product, Perplexity Agent Build Night." },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/hackbubu.html",
      title: "Hackbubu",
      meta: "Nov 2025 — Pitched live at the SF Tech Week Hackathon.",
      thumb: "site_assets/video_poster.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/goodwill.html",
      title: "Evergreen Goodwill",
      meta: "Mar to Dec 2025 — AI vendor scoring framework, 40% faster evaluation.",
      thumb: "site_assets/goodwill_slide1.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/blueshield.html",
      title: "Blue Shield of California",
      meta: "Jan to May 2025 — 1,200-plus data points into clinician-ready recommendations.",
      thumb: "site_assets/bsc_p1.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/dance-app.html",
      title: "DancerBase",
      meta: "Since Jun 2026 — Class discovery app; 10 Bay Area studios recruited supply-side first." },
    { icon: "star", name: "Maddie Bhuvan", href: "projects/project-unloaded.html",
      title: "Project Unloaded",
      meta: "Since Jun 2023 — SNUG campaign scaled to 6M+ teens, documented 25% attitude shift." }
  ],
  interests: [
    { icon: "star", name: "Maddie Bhuvan", href: "interests/dance.html",
      title: "Dance",
      meta: "5th nationally at World of Dance · hip-hop and Bollywood circuits.",
      thumb: "site_assets/dance_wod_team.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "interests/music.html",
      title: "Music and DJing",
      meta: "Indian classical vocals, 8 years of drums, learning to DJ.",
      thumb: "site_assets/music_drums_dj.jpg" },
    { icon: "star", name: "Maddie Bhuvan", href: "interests/travel.html",
      title: "Travel and Photography",
      meta: "15 trips last year, camera in hand.",
      thumb: "site_assets/travel_turtle.jpg" }
  ],
  skills: [
    { icon: "github", name: "GitHub", href: "https://github.com/mbhuvan-code",
      title: "mbhuvan-code (Maddie Bhuvan) · GitHub",
      meta: "Aug 4, 2026 — Search: a portfolio built as a Google search experience. Vanilla HTML, CSS, and JS." },
    { icon: "star", name: "Maddie Bhuvan", href: "skills/product.html",
      title: "Product",
      meta: "Discovery, user research, roadmapping, and KPI definition." },
    { icon: "star", name: "Maddie Bhuvan", href: "skills/technical.html",
      title: "Technical",
      meta: "Python and SQL, AI tooling and prompt design, Figma." },
    { icon: "star", name: "Maddie Bhuvan", href: "skills/how-i-work.html",
      title: "How I Work",
      meta: "Breaking down ambiguity, translating research to product." },
    { icon: "star", name: "Maddie Bhuvan", href: "skills/product.html#credentials",
      title: "Credentials",
      meta: "Two LinkedIn Learning credentials completed in 2026." }
  ],
  contact: [
    { icon: "linkedin", name: "LinkedIn", href: "https://linkedin.com/in/madhurum-bhuvan",
      title: "Madhurum (Maddie) Bhuvan | LinkedIn",
      meta: "Connect or send a message on LinkedIn.",
      thumb: "site_assets/headshot.jpg" },
    { icon: "mail", name: "Email", href: "mailto:mbhuvan@berkeley.edu",
      title: "mbhuvan@berkeley.edu",
      meta: "Opens a draft — the fastest way to reach her." },
    { icon: "github", name: "GitHub", href: "https://github.com/mbhuvan-code",
      title: "mbhuvan-code (Maddie Bhuvan) · GitHub",
      meta: "Search: a portfolio built as a Google search experience." }
  ]
};

const MENU_DOTS = '<svg class="r-menu" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>';

function sourceEntryHTML(s) {
  const ext = s.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
  return `<div class="src">
    <div class="src-head">
      <span class="src-fav">${FAVICONS[s.icon]}</span>
      <span>${s.name}</span>
      ${MENU_DOTS}
    </div>
    <div class="src-row">
      <div class="src-text">
        <a class="src-title" href="${s.href}"${ext}>${s.title}</a>
        <p class="src-snippet">${s.meta}</p>
      </div>
      ${s.thumb ? `<img class="src-thumb" src="${s.thumb}" alt="" />` : ""}
    </div>
  </div>`;
}

/* Build each section's source panel and citation chip from SECTION_SOURCES */
document.querySelectorAll(".section-panel").forEach(panel => {
  const list = SECTION_SOURCES[panel.dataset.section] || [];
  if (!list.length) return;

  const aside = document.createElement("aside");
  aside.className = "ai-sources";
  aside.setAttribute("aria-label", "Sources");
  aside.innerHTML = `<div class="src-list">${list.map(sourceEntryHTML).join("")}</div>`;
  const layout = panel.querySelector(".results-layout");
  layout.insertBefore(aside, panel.querySelector(".results-main"));

  const chip = panel.querySelector("[data-cite]");
  if (!chip) return;
  const first = list[0];
  chip.innerHTML = `<span class="cc-fav">${FAVICONS[first.icon]}</span>` +
    `<span>${first.name}</span>` +
    (list.length > 1 ? `<span class="cc-count">+${list.length - 1}</span>` : "");
  chip.setAttribute("aria-label", `Sources (${list.length})`);
  chip.hidden = false;
  let listEl = null;
  chip.addEventListener("click", () => {
    if (!listEl) {
      listEl = document.createElement("div");
      listEl.className = "cite-list";
      listEl.innerHTML = list.map(sourceEntryHTML).join("");
      chip.closest("p").insertAdjacentElement("afterend", listEl);
    } else {
      listEl.hidden = !listEl.hidden;
    }
    // A collapsed overview would clip the list; open the overview so the
    // list (and, in compact mode, the folded sources) is fully visible
    if (!listEl.hidden) {
      chip.closest(".ai-overview").dataset.open = "1";
      layoutPanel(chip.closest(".section-panel"));
    }
  });
});

/* ------------------------------------------------------------------ router */

const viewHome = document.getElementById("view-home");
const viewResults = document.getElementById("view-results");

/* Where a query lands when it scores against nothing: About, rather than a
   dead end. */
const FALLBACK_SECTION = "about";

/* A ?q= value resolves to one of three views, all of them shareable:
     no q                      -> homepage
     a section's own question  -> that section
     free text                 -> the section it scores against, or About
                                  when it scores against nothing, either way
                                  headed by the correction notice */
function stateFromSearch(search) {
  const q = new URLSearchParams(search).get("q");
  if (!q) return { section: null, query: null };
  for (const [id, s] of Object.entries(SECTIONS)) {
    if (s.slug.replace(/\+/g, " ") === q) return { section: id, query: null };
  }
  return { section: scoreQuery(q) || FALLBACK_SECTION, query: q };
}

/* Does `word` start a word in `q`? Anchored to a word start rather than a
   bare substring, so "dj" cannot fire inside a keysmash and "case" cannot
   fire inside "showcase". Still a prefix match past that point, because
   several keywords are deliberately stems ("certificat", "photo"). */
function startsWord(q, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^a-z0-9])" + escaped).test(q);
}

/* "outside of work", "besides work" and friends all ask about Interests,
   not Projects. Normalise the whole phrase to the one Interests keyword it
   means, which both removes the "work" that would have scored for Projects
   and lets every synonym score for Interests. */
const WORK_NEGATIONS = /\b(?:outside|besides|beyond|apart from|other than|away from)(?:\s+of)?\s+work\w*/g;

/* Best-scoring section for free text, or null when nothing matches.
   Score is how many of a section's keywords the query hits; ties keep
   KEYWORD_ROUTES order, so the old first-match precedence still holds. */
function scoreQuery(raw) {
  const q = (raw || "").toLowerCase().replace(WORK_NEGATIONS, "outside");
  let best = null;
  let bestScore = 0;
  for (const route of KEYWORD_ROUTES) {
    const score = route.words.filter(w => startsWord(q, w)).length;
    if (score > bestScore) {
      best = route.section;
      bestScore = score;
    }
  }
  return best;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Spaces as "+", the way the canonical slugs are written */
function encodeQ(query) {
  return encodeURIComponent(query).replace(/%20/g, "+");
}

/* Compact mode (below 1000px): the source panel folds into the AI Overview
   and is revealed together with the rest of the overview by "Show more". */
const compactMq = window.matchMedia("(max-width:999px)");

/* Put the source panel where the current layout wants it: beside the
   overview on desktop, inside it (before the Show more button) in compact. */
function placeSources(panel) {
  const aside = panel.querySelector(".ai-sources");
  if (!aside) return;
  const ov = panel.querySelector(".ai-overview");
  if (compactMq.matches) {
    if (aside.parentElement !== ov) ov.insertBefore(aside, ov.querySelector(".ai-ov-more"));
  } else if (aside.parentElement === ov) {
    panel.querySelector(".results-layout").insertBefore(aside, panel.querySelector(".results-main"));
  }
}

/* One place decides what the overview shows:
   - collapsed (body clipped + fade) while the body overflows and it has not
     been opened;
   - folded (sources hidden) while compact and not opened;
   - the Show more button whenever it still has something to reveal.
   Measured live every time, so it stays correct as the window resizes. */
function updateOverviewState(panel) {
  const ov = panel.querySelector(".ai-overview");
  if (!ov || !ov.offsetParent) return;
  const open = ov.dataset.open === "1";
  const bodyOverflow = ov.querySelector(".ai-ov-body").scrollHeight > 400;
  const foldedSources = compactMq.matches && !!panel.querySelector(".ai-sources");
  ov.classList.toggle("collapsed", bodyOverflow && !open);
  ov.classList.toggle("folded", compactMq.matches && !open);
  ov.querySelector(".ai-ov-more").hidden = open || !(bodyOverflow || foldedSources);
}

/* Render a state:
     (null, null)      homepage
     (section, null)   that section
     (section, query)  that section, headed by the correction notice */
function show(section, query) {
  document.querySelectorAll(".searchbox.open").forEach(b => b.classList.remove("open"));
  if (!section) {
    viewHome.hidden = false;
    viewResults.hidden = true;
    viewHome.querySelector(".searchbox input").value = "";
    document.title = HOME_TITLE;
    showCorrection(null);
  } else {
    viewHome.hidden = true;
    viewResults.hidden = false;
    document.querySelectorAll(".section-panel").forEach(p => {
      p.hidden = p.dataset.section !== section;
    });
    document.querySelectorAll(".results-nav a").forEach(a => {
      a.classList.toggle("on", a.dataset.section === section);
    });
    // the search box always shows what was actually searched for
    const typed = query || SECTIONS[section].q;
    viewResults.querySelector(".results-header .searchbox input").value = typed;
    document.title = typed + " - Google Search";
    showCorrection(query ? { section, query } : null);
    layoutPanel(document.querySelector(`.section-panel[data-section="${section}"]`));
  }
  window.scrollTo(0, 0);
}

/* "These are results for ..." above the results of a free-typed query. The
   line under it depends on why we are here: a query that scored says which
   search these results answer, while one that scored nothing says so
   plainly, having fallen back to About. */
function showCorrection(info) {
  document.querySelectorAll(".did-you-mean").forEach(el => el.remove());
  document.querySelectorAll(".results-count").forEach(c => { c.hidden = false; });
  if (!info) return;
  const s = SECTIONS[info.section];
  const matched = !!scoreQuery(info.query);
  const el = document.createElement("div");
  el.className = "did-you-mean";
  el.innerHTML =
    `<p>These are results for <a class="dym-fix" href="?q=${s.slug}">${escapeHTML(s.q)}</a></p>` +
    (matched
      ? `<p class="dym-instead">This is the most relevant when searching for ` +
        `<b><i>${escapeHTML(info.query)}</i></b></p>`
      : `<p class="dym-instead">Your search - <b>${escapeHTML(info.query)}</b> ` +
        `- did not match any documents.</p>`);
  const panel = document.querySelector(`.section-panel[data-section="${info.section}"]`);
  const count = panel.querySelector(".results-count");
  // "About N results" would contradict "did not match any documents"
  if (!matched) count.hidden = true;
  count.insertAdjacentElement("afterend", el);
}

/* Re-apply everything layout-dependent for the visible section. Hooked to
   both the resize event and the media query so the page keeps adjusting to
   the window, exactly like the CSS does. */
function relayout() {
  // keyed off the visible panel, not the URL, so it holds for any state
  const panel = [...document.querySelectorAll(".section-panel")].find(p => !p.hidden);
  if (panel) layoutPanel(panel);
}
compactMq.addEventListener("change", relayout);
window.addEventListener("resize", relayout);

/* Size the source panel for the current layout, recomputed on every resize.
   Desktop: the card is always bounded by the AI Overview's height, so it
   can never run past it and push the first result down. The list simply
   scrolls inside that box, with a fade marking anything below the cut.
   Compact: the panel sits inside the overview, full list, no scrolling. */
const PANEL_CHROME = 16; // 1px borders + 2px/12px vertical padding

function layoutSources(panel) {
  const aside = panel.querySelector(".ai-sources");
  if (!aside || !aside.offsetParent) return;
  const srcList = aside.querySelector(".src-list");

  if (aside.closest(".ai-overview")) { // compact: folded into the overview
    srcList.style.maxHeight = "";
    aside.classList.remove("clipped", "at-end");
    return;
  }

  const ov = panel.querySelector(".ai-overview");
  if (!ov) return;
  const avail = Math.max(160, ov.offsetHeight - PANEL_CHROME);
  srcList.style.maxHeight = avail + "px";
  aside.classList.toggle("clipped", srcList.scrollHeight > avail + 2);

  if (!srcList.dataset.scrollBound) {
    srcList.dataset.scrollBound = "1";
    srcList.addEventListener("scroll", () => markSourcesEnd(aside, srcList));
  }
  markSourcesEnd(aside, srcList);
}

/* Lift the fade once the last source is in view */
function markSourcesEnd(aside, srcList) {
  aside.classList.toggle(
    "at-end",
    srcList.scrollTop + srcList.clientHeight >= srcList.scrollHeight - 2
  );
}

/* Wire the overview's Show more once; what it reveals is decided live by
   updateOverviewState / layoutSources. */
function initOverview(panel) {
  const ov = panel.querySelector(".ai-overview");
  if (!ov || ov.dataset.init) return;
  ov.dataset.init = "1";
  ov.querySelector(".ai-ov-more").addEventListener("click", () => {
    ov.dataset.open = "1";
    layoutPanel(panel);
  });
}

/* Apply everything layout-dependent for one panel, in order. */
function layoutPanel(panel) {
  placeSources(panel);
  initOverview(panel);
  updateOverviewState(panel);
  layoutSources(panel);
}

/* Navigate to a state and record it in real browser history */
function navigate(section, query) {
  const url = query
    ? "?q=" + encodeQ(query)
    : (section ? "?q=" + SECTIONS[section].slug : location.pathname);
  history.pushState({ section, query: query || null }, "", url);
  show(section, query);
}

window.addEventListener("popstate", e => {
  const st = e.state && "query" in e.state ? e.state : stateFromSearch(location.search);
  show(st.section, st.query);
});

/* Direct landings on a shared ?q= URL start on that view */
const initial = stateFromSearch(location.search);
history.replaceState(initial, "");
show(initial.section, initial.query);

/* Links whose href is "?q=..." (tiles, filter row, cross-section links) and
   the mini wordmark ("./") are in-page navigations, not full page loads. */
document.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (href === "./" || href === "index.html") {
    e.preventDefault();
    navigate(null);
  } else if (href.startsWith("?q=")) {
    e.preventDefault();
    const st = stateFromSearch(href);
    navigate(st.section, st.query);
  }
});

/* ------------------------------------------------------------------ search */

/* A typed query keeps its own text in the URL and the search box. It lands
   on the section it scores against, or on About when it scores against
   nothing; either way the correction notice explains which it is. */
function routeQuery(raw) {
  const query = (raw || "").trim();
  if (!query) return;
  // typing a section's own question is that search, not a correction of it
  for (const [id, s] of Object.entries(SECTIONS)) {
    if (s.q === query.toLowerCase()) {
      navigate(id);
      return;
    }
  }
  navigate(scoreQuery(query) || FALLBACK_SECTION, query);
}

document.querySelectorAll("form[data-search]").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    routeQuery(form.querySelector("input").value);
  });
});

document.querySelectorAll(".sb-clear").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.closest("form").querySelector("input");
    input.value = "";
    input.focus();
  });
});

/* Homepage: suggestion dropdown, Google-autocomplete style. While it is
   open the shortcut tiles are hidden (see .shortcuts rule in style.css). */
(function initSuggestions() {
  const box = document.querySelector(".searchbox[data-suggest]");
  if (!box) return;
  const input = box.querySelector("input");

  const list = document.createElement("div");
  list.className = "suggestions";
  box.appendChild(list);

  const searchIcon = '<span class="sb-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="#9aa0a6"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg></span>';

  const bold = str => (str ? `<b>${escapeHTML(str)}</b>` : "");

  /* Rows for what has been typed so far: the suggestions containing it,
     with everything still to type in bold, the way Google does it. */
  function rowsFor(typed) {
    const needle = typed.trim().toLowerCase();
    return SEARCH_SUGGESTIONS
      .filter(s => s.text.toLowerCase().includes(needle))
      .map(s => {
        const at = needle ? s.text.toLowerCase().indexOf(needle) : -1;
        const label = at < 0
          ? escapeHTML(s.text)
          : bold(s.text.slice(0, at)) +
            escapeHTML(s.text.slice(at, at + needle.length)) +
            bold(s.text.slice(at + needle.length));
        return `<div class="suggestion" data-section="${s.section}">${searchIcon}<span>${label}</span></div>`;
      });
  }

  /* Refill the dropdown. With nothing left to suggest there is nothing to
     drop down, so it closes rather than opening an empty white box. */
  function render(open) {
    const rows = rowsFor(input.value);
    list.innerHTML = rows.join("");
    box.classList.toggle("open", !!open && rows.length > 0);
  }

  input.addEventListener("focus", () => render(true));
  input.addEventListener("input", () => render(true));
  box.addEventListener("click", e => {
    if (!list.contains(e.target)) render(true);
  });
  document.addEventListener("click", e => {
    if (!box.contains(e.target)) box.classList.remove("open");
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") box.classList.remove("open");
  });
  // mousedown so the click wins over the input losing focus; delegated so it
  // survives every rebuild of the rows
  list.addEventListener("mousedown", e => {
    const row = e.target.closest(".suggestion");
    if (!row) return;
    e.stopPropagation();
    navigate(row.dataset.section);
  });
  render(false);
})();

/* ---------------------------------------------------------- page behaviors */

/* Colour every .wordmark element letter by letter (spaces keep the flow) */
document.querySelectorAll(".wordmark[data-text]").forEach(el => {
  const text = el.dataset.text;
  let i = 0;
  el.innerHTML = [...text].map(ch => {
    if (ch === " ") return " ";
    const color = G_COLORS[i++ % G_COLORS.length];
    return `<span style="color:${color}">${ch}</span>`;
  }).join("");
});

/* Same-page anchor links: smooth-scroll to the target and flash it */
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.getElementById(a.getAttribute("href").slice(1));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.remove("flash");
  void target.offsetWidth; // restart the animation
  target.classList.add("flash");
});
