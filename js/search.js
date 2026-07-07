/* ==========================================================================
   search.js
   Homepage autocomplete suggestions + static keyword routing.
   No AI, no API: a query is matched against keyword lists and the browser
   navigates to the closest section page. Unmatched queries go to About Me.

   To tweak routing, edit KEYWORD_ROUTES (first match wins, top to bottom).
   ========================================================================== */

const SEARCH_SUGGESTIONS = [
  { text: "Who is Maddie?",                       href: "about.html" },
  { text: "What experiences does Maddie have?",   href: "projects.html" },
  { text: "What is Maddie interested in?",        href: "interests.html" },
  { text: "What are Maddie's skills?",            href: "skills.html" },
  { text: "How can I contact Maddie?",            href: "contact.html" }
];

const KEYWORD_ROUTES = [
  { href: "interests.html", words: ["interest", "hobby", "dance", "music", "dj", "travel", "photo", "concert", "fun"] },
  { href: "projects.html",  words: ["project", "experience", "work", "intern", "built", "build", "ship", "knosy", "hackbubu", "goodwill", "blue shield", "jpmorgan", "jpmc", "startup", "case", "hackathon"] },
  { href: "skills.html",    words: ["skill", "credential", "certificat", "tool", "sql", "python", "figma", "roadmap", "agile", "excel", "research"] },
  { href: "contact.html",   words: ["contact", "email", "reach", "linkedin", "resume", "hire", "touch"] },
  { href: "about.html",     words: ["about", "who", "maddie", "madhurum", "bio", "berkeley", "background"] }
];

function routeQuery(raw) {
  const q = (raw || "").toLowerCase();
  for (const route of KEYWORD_ROUTES) {
    if (route.words.some(w => q.includes(w))) {
      location.href = route.href;
      return;
    }
  }
  location.href = "about.html"; // default when nothing matches
}

/* Any search form marked with data-search routes on submit */
document.querySelectorAll("form[data-search]").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    routeQuery(form.querySelector("input").value);
  });
});

/* Homepage: suggestion dropdown, Google-autocomplete style */
(function initSuggestions() {
  const box = document.querySelector(".searchbox[data-suggest]");
  if (!box) return;
  const input = box.querySelector("input");

  const list = document.createElement("div");
  list.className = "suggestions";
  const searchIcon = '<span class="sb-icon"><svg viewBox="0 0 24 24" width="17" height="17" fill="#9aa0a6"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg></span>';
  list.innerHTML = SEARCH_SUGGESTIONS.map(s =>
    `<div class="suggestion" data-href="${s.href}">${searchIcon}<span>${s.text}</span></div>`
  ).join("");
  box.appendChild(list);

  input.addEventListener("focus", () => box.classList.add("open"));
  document.addEventListener("click", e => {
    if (!box.contains(e.target)) box.classList.remove("open");
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") box.classList.remove("open");
  });
  // mousedown so the click wins over the input losing focus
  list.querySelectorAll(".suggestion").forEach(row => {
    row.addEventListener("mousedown", () => { location.href = row.dataset.href; });
  });
})();
