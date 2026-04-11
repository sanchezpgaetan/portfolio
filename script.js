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
const navLinks = Array.from(document.querySelectorAll(".nav__link, .drawer__link"));

function setActiveHash(hash) {
  for (const a of navLinks) a.classList.toggle("is-active", a.getAttribute("href") === hash);
}

function updateActiveHash() {
  const scrollPosition = window.scrollY + 120;
  let current = "#accueil";

  for (const section of sections) {
    if (section.offsetTop <= scrollPosition) {
      current = `#${section.id}`;
    }
  }

  setActiveHash(current);
}

window.addEventListener("scroll", updateActiveHash);
window.addEventListener("load", updateActiveHash);
window.addEventListener("hashchange", () => setActiveHash(window.location.hash || "#accueil"));

for (const link of navLinks) {
  link.addEventListener("click", () => setTimeout(updateActiveHash, 120));
}

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
