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

// TP : manifeste Documents/tp/tp-manifest.json (premiere / seconde + nomenclature "Thème — TP n")
function tpEncodePathSegments(rel) {
  return String(rel)
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function tpBuildHref(bundle, rel) {
  const base = String(bundle).replace(/\/+$/, "");
  const prefix = base
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `./${prefix}/${tpEncodePathSegments(rel)}`;
}

function tpLabelFromRel(rel) {
  const last = String(rel).split("/").pop() || String(rel);
  return last.replace(/\.pdf$/i, "");
}

function tpBuildMountList(section) {
  const bundle = section?.bundle;
  const items = Array.isArray(section?.items) ? section.items : [];
  if (!bundle || !items.length) {
    const p = document.createElement("p");
    p.className = "card__p";
    p.textContent = "Aucun PDF pour l’instant.";
    return p;
  }
  const ul = document.createElement("ul");
  ul.className = "list tp-pdf-list";
  for (const it of items) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "link";
    a.href = tpBuildHref(bundle, it.rel);
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = it.label || tpLabelFromRel(it.rel);
    a.title = it.rel.replace(/\//g, " › ");
    li.appendChild(a);
    ul.appendChild(li);
  }
  return ul;
}

async function loadTpPdfs() {
  const y1 = document.getElementById("tp-mount-y1");
  const y2 = document.getElementById("tp-mount-y2");
  if (!y1 || !y2) return;

  const setBusy = (on) => {
    y1.setAttribute("aria-busy", on ? "true" : "false");
    y2.setAttribute("aria-busy", on ? "true" : "false");
  };

  const showError = (msg) => {
    const p = document.createElement("p");
    p.className = "card__p";
    p.textContent = msg;
    y1.replaceChildren(p);
    y2.replaceChildren();
    setBusy(false);
  };

  try {
    const res = await fetch("./Documents/tp/tp-manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.premiere && data.seconde) {
      y1.replaceChildren(tpBuildMountList(data.premiere));
      y2.replaceChildren(tpBuildMountList(data.seconde));
      setBusy(false);
      return;
    }

    throw new Error("Format de manifeste inconnu");
  } catch {
    showError(
      "Impossible de charger la liste des TP (ouvre le site via un serveur local). Vérifie Documents/tp/tp-manifest.json."
    );
  }
}

loadTpPdfs();
