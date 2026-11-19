// Intervalo em milissegundos. Os textos dos destaques são editados na index.html.
(() => {
  const root = document.querySelector(".hero-carousel");
  if (!root) return;
  const slides = [...root.querySelectorAll(".hero-slide")];
  const dots = [...root.querySelectorAll("[data-hero-dot]")];
  const status = root.querySelector("[data-hero-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 5000;
  let current = 0;
  let inView = true;
  let timer = null;
  let generation = 0;

  function schedule() {
    clearTimeout(timer);
    timer = null;
    if (
      reducedMotion.matches ||
      !inView ||
      document.hidden ||
      document.querySelector("dialog[open]")
    )
      return;
    timer = setTimeout(() => show(current + 1, false), interval);
  }
  async function prepare(index) {
    const image = slides[index].querySelector("img");
    if (image.dataset.src) {
      image.loading = "eager";
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
    try {
      await image.decode();
    } catch {
      /* Mantém a navegação se uma imagem não carregar. */
    }
  }
  async function show(next, manual) {
    const target = (next + slides.length) % slides.length;
    const token = ++generation;
    clearTimeout(timer);
    await prepare(target);
    if (token !== generation) return;
    slides.forEach((slide, index) => {
      const active = index === target;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
      dots[index].setAttribute("aria-current", String(active));
    });
    current = target;
    if (manual) {
      const title = slides[current]
        .querySelector(".hero-title")
        .textContent.replace(/\s+/g, " ")
        .trim();
      status.textContent = `Destaque ${current + 1} de ${slides.length}: ${title}`;
    }
    // Tanto a troca automática quanto o clique iniciam uma nova contagem completa.
    schedule();
    prepare((current + 1) % slides.length);
  }

  root.querySelector(".hero-controls").hidden = false;
  dots.forEach((dot, index) => dot.addEventListener("click", () => show(index, true)));
  document.addEventListener("visibilitychange", schedule);
  document.querySelector("dialog")?.addEventListener("close", schedule);
  reducedMotion.addEventListener("change", schedule);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0.15;
        schedule();
      },
      { threshold: [0, 0.15] },
    ).observe(root);
  }
  schedule();
  if ("requestIdleCallback" in window) requestIdleCallback(() => prepare(1), { timeout: 2000 });
  else setTimeout(() => prepare(1), 1200);
})();
