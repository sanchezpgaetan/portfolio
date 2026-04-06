/* ─── Tab navigation ─── */
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const tabs   = Array.from(document.querySelectorAll(".tab"));
const yearEl = document.getElementById("year");

function setActivePanel(panelId) {
  for (const panel of panels) {
    const show = panel.id === panelId;
    panel.hidden = !show;
    if (show) {
      // Trigger scroll reveal for newly visible panel
      setTimeout(() => observePanel(panel), 30);
    }
  }
  for (const tab of tabs) {
    const isActive = tab.dataset.target === panelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  }
}

function setHash(panelId) {
  const next = `#${panelId}`;
  if (window.location.hash !== next) window.location.hash = next;
}

function initFromHash() {
  const hash    = window.location.hash.replace("#", "").trim();
  const panelId = hash || "accueil";
  if (panels.some(p => p.id === panelId)) setActivePanel(panelId);
  else setActivePanel("accueil");
}

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    const panelId = tab.dataset.target;
    setActivePanel(panelId);
    setHash(panelId);
  });
}

document.addEventListener("click", (ev) => {
  const target = ev.target?.closest?.("[data-nav-link]");
  if (!target) return;
  const href    = target.getAttribute("href") || "";
  const panelId = href.replace("#", "");
  if (!panelId) return;
  ev.preventDefault();
  setActivePanel(panelId);
  setHash(panelId);
});

window.addEventListener("hashchange", initFromHash);
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ─── Scroll reveal (IntersectionObserver) ─── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

function observePanel(panel) {
  const elements = panel.querySelectorAll(".reveal");
  for (const el of elements) {
    // Reset so animation re-triggers when switching tabs
    el.classList.remove("visible");
    revealObserver.observe(el);
  }
}

/* ─── Init ─── */
initFromHash();

// Also observe the initially visible panel immediately
const activePanel = panels.find(p => !p.hidden);
if (activePanel) {
  setTimeout(() => observePanel(activePanel), 60);
}
