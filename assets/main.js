const menu = document.querySelector(".menu"),
  nav = document.querySelector("nav");
menu.addEventListener("click", () => {
  let open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", open);
  nav.classList.toggle("open", open);
  menu.textContent = open ? "Fechar ×" : "Menu ☰";
});
const dialog = document.querySelector("dialog");
document.querySelectorAll("[data-client]").forEach((b) =>
  b.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.showModal();
  }),
);
document.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      dialog.close();
  }
});
document.querySelector("[data-password]").addEventListener("click", (e) => {
  const p = document.querySelector("#senha");
  p.type = p.type === "password" ? "text" : "password";
  e.currentTarget.textContent = p.type === "password" ? "Mostrar" : "Ocultar";
  e.currentTarget.setAttribute("aria-pressed", p.type === "text");
});
document.querySelectorAll("form").forEach((f) =>
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    f.querySelector("[role=status]").textContent =
      f.id === "login"
        ? "Demonstração: o portal ainda não está conectado. Nenhuma credencial foi enviada."
        : "Mensagem validada nesta demonstração. O envio será habilitado após a configuração do atendimento.";
    f.reset();
  }),
);
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.textContent = "Menu ☰";
  }),
);
dialog.addEventListener("close", () => {
  const f = dialog.querySelector("form");
  f.reset();
  f.querySelector("[role=status]").textContent = "";
  document.querySelector("#senha").type = "password";
  const b = document.querySelector("[data-password]");
  b.textContent = "Mostrar";
  b.setAttribute("aria-pressed", "false");
});

// Leitura resumida dos cards apenas no celular. Sem JS, o texto completo permanece visível.
const compactCards = window.matchMedia("(max-width: 620px)");
const institutionalCards = [...document.querySelectorAll(".institutional-card")];
function setCardReading(card, expanded) {
  const short = card.querySelector(".institutional-summary");
  const full = card.querySelector(".institutional-details");
  const button = card.querySelector(".institutional-toggle");
  short.hidden = !compactCards.matches || expanded;
  full.hidden = compactCards.matches && !expanded;
  button.hidden = !compactCards.matches;
  button.setAttribute("aria-expanded", String(expanded));
  button.querySelector("[data-read-label]").textContent = expanded ? "Ler menos" : "Ler mais";
  button.querySelector("[data-read-icon]").textContent = expanded ? "−" : "+";
  button.setAttribute(
    "aria-label",
    `${expanded ? "Ler menos" : "Ler mais"} sobre ${button.dataset.cardTitle}`,
  );
}
institutionalCards.forEach((card) => {
  const button = card.querySelector(".institutional-toggle");
  button.addEventListener("click", () =>
    setCardReading(card, button.getAttribute("aria-expanded") !== "true"),
  );
});
function updateCardLayout() {
  institutionalCards.forEach((card) => setCardReading(card, !compactCards.matches));
}
compactCards.addEventListener("change", updateCardLayout);
updateCardLayout();

// Os perfis são configurados em social-config.js; nunca usar links genéricos da plataforma.
const socialHosts = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com"],
};
document.querySelectorAll("[data-social]").forEach((link) => {
  const configured = window.MSX_SOCIAL_PROFILES?.[link.dataset.social];
  if (configured) {
    try {
      const url = new URL(configured);
      if (
        url.protocol === "https:" &&
        socialHosts[link.dataset.social].includes(url.hostname) &&
        url.pathname.length > 1
      ) {
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-disabled");
        const label = link.dataset.social === "instagram" ? "Instagram" : "Facebook";
        link.setAttribute("aria-label", `${label} da MSX (abre em nova aba)`);
        link.title = `${label} da MSX`;
        link.querySelector("[data-social-state]").hidden = true;
      }
    } catch {
      /* Perfil ausente ou inválido: manter o estado Em breve. */
    }
  }
  link.addEventListener("click", (event) => {
    if (link.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
});
