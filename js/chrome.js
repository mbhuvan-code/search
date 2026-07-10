/* ==========================================================================
   chrome.js
   Renders the Chrome window furniture on every page:
   window dots, browser tab strip (one tab per section), "+" button,
   and the toolbar with back/forward/reload and a decorative omnibox.
   Also colours .wordmark elements and wires the AI Overview anchor links.

   To rename a section or change tab order, edit CHROME_TABS below.

   Each page declares its context on <body>:
     data-tab    which tab is active ("home", "about", "projects", ...)
     data-root   path prefix back to the site root ("" on top-level pages,
                 "../" on detail pages inside projects/, interests/, skills/)
     data-parent the section results page a detail page belongs to
                 (e.g. "projects.html"); makes the toolbar back arrow work
     data-path   clean path shown in the omnibox on detail pages
                 (e.g. "projects/knosy")
   ========================================================================== */

const CHROME_TABS = [
  { id: "home",      title: "Home",      href: "index.html",     q: "" },
  { id: "about",     title: "About Me",  href: "about.html",     q: "who is maddie?" },
  { id: "projects",  title: "Projects",  href: "projects.html",  q: "what experiences does maddie have?" },
  { id: "interests", title: "Interests", href: "interests.html", q: "what is maddie interested in?" },
  { id: "skills",    title: "Skills",    href: "skills.html",    q: "what are maddie's skills?" },
  { id: "contact",   title: "Contact",   href: "contact.html",   q: "how can i contact maddie?" }
];

/* Google colour rotation used for the wordmark letters */
const G_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853"];

const ICONS = {
  star: '<svg class="tab-fav" viewBox="0 0 24 24" width="13" height="13" fill="#F4B400" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M4 13h12.2l-5.6 5.6L12 20l8-8-8-8-1.4 1.4 5.6 5.6H4z"/></svg>',
  reload: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="#5f6368" aria-hidden="true"><path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9z"/></svg>'
};

function renderChromeTop() {
  const mount = document.getElementById("chrome-top");
  if (!mount) return;
  const body = document.body;
  const active = body.dataset.tab || "home";
  const root = body.dataset.root || "";
  const parent = body.dataset.parent || "";
  const path = body.dataset.path || "";
  const current = CHROME_TABS.find(t => t.id === active) || CHROME_TABS[0];

  const tabsHtml = CHROME_TABS.map(t => `
    <a class="tab${t.id === active ? " active" : ""}" href="${root}${t.href}" title="${t.title}">
      ${ICONS.star}
      <span class="tab-title">${t.title}</span>
      <span class="tab-close" data-decorative>${ICONS.close}</span>
    </a>`).join("");

  // Detail pages show their clean path; section pages show the fake query URL.
  let omni;
  if (path) {
    omni = `${ICONS.lock}<span>mbhuvan-code.github.io/search/${path}</span>`;
  } else if (current.q) {
    omni = `${ICONS.lock}<span>google.com/search?q=${current.q.replace(/ /g, "+")}</span>`;
  } else {
    omni = `${ICONS.lock}<span>Ask Google or type a URL</span>`;
  }

  // The toolbar back arrow behaves like the real browser back button.
  // With no history (direct landing), it falls back to the parent
  // results page on detail pages, or the homepage elsewhere.
  const backBtn = `<button class="tb-btn" id="tb-back" type="button" title="Back">${ICONS.back}</button>`;

  mount.innerHTML = `
    <div class="tabstrip">
      <div class="win-dots" aria-hidden="true"><span class="r"></span><span class="y"></span><span class="g"></span></div>
      <div class="tabs">${tabsHtml}</div>
      <button class="new-tab" type="button" title="New tab" onclick="location.href='${root}index.html'">${ICONS.plus}</button>
    </div>
    <div class="toolbar">
      ${backBtn}
      <span class="tb-btn">${ICONS.fwd}</span>
      <span class="tb-btn">${ICONS.reload}</span>
      <div class="omnibox${current.q || path ? "" : " empty"}">${omni}</div>
      <span class="tb-btn">${ICONS.star.replace('class="tab-fav" ', "").replace('fill="#F4B400"', 'fill="#5f6368" width="16" height="16"')}</span>
      <span class="tb-avatar">M</span>
    </div>`;

  // The "x" on each tab is decorative: swallow the click so it does not navigate.
  mount.querySelectorAll("[data-decorative]").forEach(el => {
    el.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); });
  });

  mount.querySelector("#tb-back").addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = root + (parent || "index.html");
  });
}

/* Colour every .wordmark element letter by letter (spaces keep the flow) */
function paintWordmarks() {
  document.querySelectorAll(".wordmark[data-text]").forEach(el => {
    const text = el.dataset.text;
    let i = 0;
    el.innerHTML = [...text].map(ch => {
      if (ch === " ") return " ";
      const color = G_COLORS[i++ % G_COLORS.length];
      return `<span style="color:${color}">${ch}</span>`;
    }).join("");
  });
}

/* Same-page anchor links: smooth-scroll to the target and flash it */
function wireAnchorLinks() {
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
    history.replaceState(null, "", a.getAttribute("href"));
  });
}

renderChromeTop();
paintWordmarks();
wireAnchorLinks();
