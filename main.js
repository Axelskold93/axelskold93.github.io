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


// --- Projects data ---
const projects = [
  {
   
  title: "Data Collection Platform",
  subtitle: "Public data processing & API platform",
  desc: "Platform for collecting, structuring and exposing external information via APIs. Built with a focus on robustness, scalability and operability. Developed during my internship.",
  tags: [".NET", "SQL Server", "Azure", "API"],
  category: "Backend",
  links: {}
},
  {
    title: "GearVault App for PC Gear",
    subtitle: "Inventory & Price Tracker",
    desc: "Web application for keeping track of your computer equipment and monitoring price developments over time. Built with Blazor WebAssembly and EF Core.",
    tags: [".NET", "EF Core", "AutoMapper", "SQL", "Blazor"],
    category: "Backend",
    links: { repo: "https://github.com/Axelskold93/GearVault" }
  },
  {
    title: "Degree Project API Performance",
    subtitle: "Measurable optimization of GET endpoints",
    desc: "Benchmark of async/sync, AsNoTracking, caching and query strategies. Focus on latency and allocations.",
    tags: ["BenchmarkDotNet", "ASP.NET", "Caching",],
    category: "Performance",
    links: { repo: "", demo: "assets/AxelSköld Examensarbete 2025.pdf" }
  },
  {
    title: "Vinterkyla: Shattered Realms",
    subtitle: "Unity-prototype",
    desc: "UI/Inventory-flows och mini-map components.",
    tags: ["Unity", "C#", "UI"],
    category: "GameDev",
    links: {}
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
  if (p.links?.demo) actions.push(`<a class="link" href="${p.links.demo}" target="_blank" rel="noreferrer">PDF ↗</a>`);

  return `
    <article class="project card">
      <div class="project__top">
        <div>
          <h3 class="project__title">${escapeHtml(p.title)}</h3>
          <div class="project__meta">${escapeHtml(p.subtitle || "")}</div>
        </div>
       <span class="tag tag--category">${escapeHtml(p.category || "")}</span>
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
const form = document.querySelector("form");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const res = await fetch(form.action, {
    method: form.method,
    body: data,
    headers: { 'Accept': 'application/json' }
  });

  if (res.ok) {
    form.reset();
    alert("Tack! Jag hör av mig 👍");
  } else {
    alert(`Något gick fel (${res.status}). Kolla Console.`);
  }
});
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
