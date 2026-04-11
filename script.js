const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Mobile drawer
const menuBtn = document.querySelector(".menu");
const drawer = document.getElementById("menu");

function setDrawer(open) {
  if (!menuBtn || !drawer) return;
  menuBtn.setAttribute("aria-expanded", String(open));
  drawer.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

if (menuBtn && drawer) {
  menuBtn.addEventListener("click", () => {
    const next = menuBtn.getAttribute("aria-expanded") !== "true";
    setDrawer(next);
  });

  drawer.addEventListener("click", (ev) => {
    const link = ev.target?.closest?.("a");
    if (!link) return;
    setDrawer(false);
  });

  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") setDrawer(false);
  });
}

// Active nav link while scrolling
const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav__link"));

function setActiveHash(hash) {
  for (const a of navLinks) a.classList.toggle("is-active", a.getAttribute("href") === hash);
}

const activeObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const hash = `#${visible.target.id}`;
    setActiveHash(hash);
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.35, 0.5, 0.65] }
);

for (const s of sections) activeObserver.observe(s);
setActiveHash(window.location.hash || "#accueil");

// Reveal on scroll
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -15% 0px" }
);
for (const el of revealEls) revealObserver.observe(el);
