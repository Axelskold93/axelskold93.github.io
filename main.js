// --- Theme (persisted) ---
const themeBtn = document.getElementById("themeBtn");
const THEME_KEY = "axel_portfolio_theme";

function applyTheme(theme) {
  if (theme === "light") document.body.setAttribute("data-theme", "light");
  else document.body.removeAttribute("data-theme");
}
const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme || "dark");

themeBtn?.addEventListener("click", () => {
  const isLight = document.body.getAttribute("data-theme") === "light";
  const next = isLight ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// --- Footer year ---
document.getElementById("year").textContent = new Date().getFullYear();

// --- Fake send + copy email ---
const fakeSend = document.getElementById("fakeSend");
const sendHint = document.getElementById("sendHint");
fakeSend?.addEventListener("click", () => {
  sendHint.hidden = false;
  setTimeout(() => (sendHint.hidden = true), 2500);
});

document.getElementById("copyEmail")?.addEventListener("click", async () => {
  const email = "axel@example.com"; // <-- byt till din riktiga
  try {
    await navigator.clipboard.writeText(email);
    sendHint.hidden = false;
    sendHint.textContent = "✅ Mail kopierat!";
    setTimeout(() => {
      sendHint.hidden = true;
      sendHint.textContent = "✅ Klart! (Den här knappen skickar inget än.)";
    }, 2000);
  } catch {
    alert("Kunde inte kopiera automatiskt. Mail: " + email);
  }
});

// --- Projects data ---
const projects = [
  {
    title: "Capoit",
    subtitle: "PIIT-scraping + API-ekosystem",
    desc: "Scraping, normalisering och API-lager. Fokus på robusthet och driftbarhet.",
    tags: [".NET", "SQL Server", "Azure", "API"],
    category: "Backend",
    links: {
      repo: "https://github.com/",
      demo: ""
    }
  },
  {
    title: "GearVault",
    subtitle: "Inventarie & prisbevakning",
    desc: "Monolit i .NET med dataåtkomst via EF Core/Dapper. Byggd för prestanda och tydlig modellering.",
    tags: [".NET", "EF Core", "Dapper", "SQL"],
    category: "Backend",
    links: { repo: "https://github.com/" }
  },
  {
    title: "Examensarbete — API Performance",
    subtitle: "Mätbar optimering av GET-endpoints",
    desc: "Benchmark av async/sync, AsNoTracking, caching och query-strategier. Fokus på latency och allocations.",
    tags: ["BenchmarkDotNet", "ASP.NET", "Caching", "Perf"],
    category: "Performance",
    links: { repo: "https://github.com/", demo: "" }
  },
  {
    title: "Vinterkyla: Shattered Realms",
    subtitle: "Unity-prototyp",
    desc: "UI/Inventory-flöden och komponenter. Fokus på struktur och spelbara prototyper.",
    tags: ["Unity", "C#", "UI"],
    category: "GameDev",
    links: { repo: "https://github.com/" }
  }
];

// --- Filtering / searching ---
const grid = document.getElementById("projectGrid");
const filtersEl = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");

const categories = ["All", ...new Set(projects.map(p => p.category))];
let activeCategory = "All";
let searchTerm = "";

function createFilters() {
  filtersEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filterBtn";
    btn.type = "button";
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", String(cat === activeCategory));
    btn.addEventListener("click", () => {
      activeCategory = cat;
      // update aria-pressed
      [...filtersEl.querySelectorAll("button")].forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      render();
    });
    filtersEl.appendChild(btn);
  });
}

function projectMatches(p) {
  const inCat = activeCategory === "All" || p.category === activeCategory;
  if (!inCat) return false;

  if (!searchTerm) return true;

  const hay = [
    p.title, p.subtitle, p.desc, p.category,
    ...(p.tags || [])
  ].join(" ").toLowerCase();

  return hay.includes(searchTerm);
}

function projectCard(p) {
  const tagHtml = (p.tags || [])
    .slice(0, 6)
    .map(t => `<span class="tag ${t === ".NET" || t === "Perf" ? "tag--accent" : ""}">${escapeHtml(t)}</span>`)
    .join("");

  const actions = [];
  if (p.links?.repo) actions.push(`<a class="link" href="${p.links.repo}" target="_blank" rel="noreferrer">Repo ↗</a>`);
  if (p.links?.demo) actions.push(`<a class="link" href="${p.links.demo}" target="_blank" rel="noreferrer">Demo ↗</a>`);

  return `
    <article class="project card">
      <div class="project__top">
        <div>
          <h3 class="project__title">${escapeHtml(p.title)}</h3>
          <div class="project__meta">${escapeHtml(p.subtitle || p.category)}</div>
        </div>
        <div class="project__meta">${escapeHtml(p.category)}</div>
      </div>

      <p class="project__desc">${escapeHtml(p.desc || "")}</p>

      <div class="tags">${tagHtml}</div>

      ${actions.length ? `<div class="project__actions">${actions.join("")}</div>` : ""}
    </article>
  `;
}

function render() {
  const items = projects.filter(projectMatches);

  if (!items.length) {
    grid.innerHTML = `
      <div class="card" style="padding:16px">
        <strong>Inga träffar.</strong>
        <div class="muted micro">Testa att rensa söktext eller välj “All”.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(projectCard).join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

createFilters();
render();

searchInput?.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  render();
});
