"use strict";

/* ===== Tiện ích ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* bỏ qua */ } }
};

const dyn = () => TEXT;

/* ===== 1. Ngày mở hồ sơ = hôm nay ===== */
const today = new Date();
$("#openDate").textContent = today.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
$("#openDate").setAttribute("datetime", today.toISOString().slice(0, 10));

/* ===== 2. Ảnh dự phòng (ảnh nghiêng / ảnh THPT chưa có) ===== */
function watchImage(img, onFail) {
  if (img.complete && img.naturalWidth === 0) onFail();
  else img.addEventListener("error", onFail, { once: true });
}
$$("img[data-fallback]").forEach(img => watchImage(img, () => {
  img.src = img.dataset.fallback;          // chưa có ảnh nghiêng → dùng ảnh cận cảnh từ ảnh chính diện
  img.classList.add("is-closeup");
}));
$$("img[data-missing]").forEach(img => watchImage(img, () => img.closest(".polaroid").classList.add("is-missing")));

/* ===== 4. Màn mở đầu: bật đèn bàn ===== */
const intro = $("#intro");
const tagline = $("#tagline");
const TAGLINE = tagline.textContent.trim();
const taglineText = () => TAGLINE;

function typeTagline() {
  const text = taglineText();
  if (reduceMotion) { tagline.textContent = text; return; }
  let i = 0;
  tagline.textContent = "";
  tagline.classList.add("typing");
  (function step() {
    i++;
    tagline.textContent = text.slice(0, i);
    if (i < text.length) setTimeout(step, text[i - 1] === "." || text[i - 1] === "," ? 220 : 32 + Math.random() * 30);
    else setTimeout(() => tagline.classList.remove("typing"), 1200);
  })();
}

function closeIntro() {
  intro.classList.add("is-on");
  store.set("introSeen", "1");
  setTimeout(() => {
    intro.classList.add("is-gone");
    document.body.classList.remove("no-scroll");
    typeTagline();
  }, reduceMotion ? 0 : 650);
}

const skipIntro = store.get("introSeen") || /[?&]skipintro/.test(location.search);
if (skipIntro) {
  intro.classList.add("is-skipped", "is-gone");
} else {
  document.body.classList.add("no-scroll");
  $("#introBtn").addEventListener("click", closeIntro);
  $("#introBtn").focus();
}

/* ===== 5. Menu mobile + tiếng gõ khi chuyển mục ===== */
const menuBtn = $("#menuBtn");
const navList = $("#navList");
function setMenu(open) {
  navList.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "✕" : "☰";
}
menuBtn.addEventListener("click", () => setMenu(!navList.classList.contains("open")));
$$('a[href^="#"]').forEach(link => link.addEventListener("click", () => { setMenu(false); }));

/* ===== 6. Cuộn: thanh tiến trình, nút lên đầu, mục đang xem ===== */
const progress = $("#progress");
const toTop = $("#toTop");
const sections = $$("main section[id]");
const navLinks = $$(".nav__link");
function onScroll() {
  const scrolled = document.documentElement.scrollTop;
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${total > 0 ? (scrolled / total) * 100 : 0}%`;
  toTop.classList.toggle("show", scrolled > 500);
  let current = "";
  sections.forEach(sec => { if (scrolled >= sec.offsetTop - 140) current = sec.id; });
  navLinks.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => { scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

/* ===== 7. Thanh "hung khí" chạy khi cuộn tới ===== */
const bagObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $(".bag__bar span", entry.target).style.width = `${entry.target.dataset.level}%`;
    bagObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });
$$(".bag").forEach(bag => bagObserver.observe(bag));

/* ===== 8. Kính lúp phân tích: soi tới đâu, ghi chú hiện tới đó ===== */
const lens = $("#lens");
const LENS_R = 78;
let activeInspect = null;
let lastPointer = "mouse";

function clipNotes(el, x, y, r) {
  $$(".note", el).forEach(note => {
    const box = note.getBoundingClientRect();
    note.style.clipPath = `circle(${r}px at ${x - box.left}px ${y - box.top}px)`;
  });
}
function leaveInspect() {
  if (!activeInspect) return;
  clipNotes(activeInspect, -999, -999, 0);
  activeInspect = null;
  lens.classList.remove("is-on");
  document.body.classList.remove("has-lens");
}
document.addEventListener("pointermove", e => {
  lastPointer = e.pointerType;
  if (e.pointerType !== "mouse" || !canHover) return;
  const el = e.target.closest(".inspect");
  if (el !== activeInspect) leaveInspect();
  if (!el) return;
  if (!activeInspect) { activeInspect = el; lens.classList.add("is-on"); document.body.classList.add("has-lens"); }
  lens.style.translate = `${e.clientX}px ${e.clientY}px`;
  clipNotes(el, e.clientX, e.clientY, LENS_R);
}, { passive: true });
document.addEventListener("pointerleave", leaveInspect);
addEventListener("scroll", leaveInspect, { passive: true });
document.addEventListener("pointerdown", e => { lastPointer = e.pointerType; });

// Màn hình cảm ứng: chạm để hiện toàn bộ ghi chú
$$(".inspect").forEach(el => {
  el.addEventListener("click", e => {
    if (lastPointer === "mouse") return;
    if (!el.classList.contains("is-revealed")) {
      el.classList.add("is-revealed");
      if (el.matches(".evidence")) e.stopImmediatePropagation();   // lần chạm đầu: soi ghi chú, lần sau: mở ảnh
    } else if (!el.matches(".evidence")) {
      el.classList.remove("is-revealed");
    }
  });
});

/* ===== 9. Thanh trượt mức độ nguy hiểm ===== */
const threatBox = $("#threatBox");
const threatRange = $("#threatRange");
const threatLabel = $("#threatLabel");
const LEVELS = ["LOW", "GUARDED", "HIGH", "CRITICAL"];
function renderThreat(level, fromUser) {
  threatBox.dataset.level = level;
  threatLabel.textContent = LEVELS[level];
  threatRange.setAttribute("aria-valuetext", LEVELS[level]);
  $$(".findings li").forEach(li => {
    const hidden = Number(li.dataset.min) > level;
    const wasHidden = li.classList.contains("is-redacted");
    li.classList.toggle("is-redacted", hidden);
    li.setAttribute("aria-hidden", String(hidden));
    li.classList.toggle("is-new", fromUser && wasHidden && !hidden);
  });
  $("#threatCount").textContent = $$(".findings li:not(.is-redacted)").length;
  document.body.classList.toggle("is-critical", level === 3);
}
threatRange.addEventListener("input", () => renderThreat(Number(threatRange.value), true));
renderThreat(0, false);

/* ===== 10. Lọc vụ án ===== */
const filters = $$(".filter");
filters.forEach(btn => btn.addEventListener("click", () => {
  filters.forEach(b => b.classList.toggle("is-active", b === btn));
  const type = btn.dataset.filter;
  $$(".case").forEach(c => c.classList.toggle("is-hidden", type !== "all" && c.dataset.category !== type));
}));

/* ===== 11. Modal hồ sơ vụ án ===== */
const modal = $("#modal");
let modalOpener = null;
function openModal(id, opener) {
  const data = dyn().projects[id];
  $("#modalCase").textContent = data.no;
  $("#modalTitle").textContent = data.title;
  $("#modalMeta").textContent = data.meta;
  $("#modalDesc").textContent = data.desc;
  $("#modalRoleTitle").textContent = dyn().roleLabel;
  $("#modalList").innerHTML = data.points.map(p => `<li>${p}</li>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modalOpener = opener;
  document.body.classList.add("no-scroll");
  $("#modalClose").focus();
}
function closeModal() {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (modalOpener) modalOpener.focus();
}
$$("[data-modal]").forEach(btn => btn.addEventListener("click", () => openModal(btn.dataset.modal, btn)));
$("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

/* ===== 12. Lightbox tang vật ===== */
const lightbox = $("#lightbox");
const lbImg = $("#lbImg");
const lbCaption = $("#lbCaption");
let lbImages = [], lbIndex = 0, lbKey = "", lbOpener = null;
function renderLightbox() {
  const title = dyn().projects[lbKey].title;
  lbImg.src = lbImages[lbIndex];
  lbImg.alt = `${title} (${lbIndex + 1}/${lbImages.length})`;
  lbCaption.textContent = `${dyn().photoOf} · ${title} · ${lbIndex + 1} / ${lbImages.length}`;
  const single = lbImages.length < 2;
  $("#lbPrev").hidden = single;
  $("#lbNext").hidden = single;
}
function openLightbox(btn) {
  lbImages = btn.dataset.images.split(",");
  lbKey = btn.dataset.titleKey;
  lbIndex = 0;
  lbOpener = btn;
  renderLightbox();
  leaveInspect();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  $("#lbClose").focus();
}
function closeLightbox() {
  if (!lightbox.classList.contains("open")) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  if (lbOpener) lbOpener.focus();
}
function stepLightbox(step) {
  lbIndex = (lbIndex + step + lbImages.length) % lbImages.length;
  renderLightbox();
}
$$("[data-images]").forEach(btn => btn.addEventListener("click", () => openLightbox(btn)));
$("#lbClose").addEventListener("click", closeLightbox);
$("#lbPrev").addEventListener("click", () => stepLightbox(-1));
$("#lbNext").addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeLightbox(); setMenu(false); }
  if (lightbox.classList.contains("open")) {
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  }
});

/* ===== 13. Hồ sơ mật (mức lương kỳ vọng): khóa mã số ===== */
const PASSCODE = "2011";               // ngày + tháng sinh 20/11
const vault = $("#vaultBox");
const lockDisplay = $("#lockDisplay");
const slots = $$("i", lockDisplay);
let code = "";

function renderCode() { slots.forEach((s, i) => { s.textContent = code[i] ? "•" : ""; }); }
function unlockVault() {
  if (vault.classList.contains("is-open")) return;
  slots.forEach((s, i) => { s.textContent = PASSCODE[i]; });
  showToast(dyn().unlocked);
  setTimeout(() => {
    vault.classList.add("is-open");
    $("#sealedContent").hidden = false;
  }, 350);
}
function submitCode() {
  if (code === PASSCODE) return unlockVault();
  lockDisplay.classList.remove("is-error");
  void lockDisplay.offsetWidth;          // chạy lại animation rung
  lockDisplay.classList.add("is-error");
  showToast(dyn().wrongCode);
  setTimeout(() => { code = ""; renderCode(); lockDisplay.classList.remove("is-error"); }, 700);
}
function pressKey(k) {
  if (vault.classList.contains("is-open")) return;
  if (k === "del") code = code.slice(0, -1);
  else if (k === "ok") return submitCode();
  else if (code.length < 4) code += k;
  renderCode();
  if (code.length === 4) setTimeout(submitCode, 220);
}
$$("#keypad button").forEach(b => b.addEventListener("click", () => pressKey(b.dataset.k)));
$("#lock").addEventListener("keydown", e => {
  if (/^\d$/.test(e.key)) { e.preventDefault(); pressKey(e.key); }
  if (e.key === "Backspace") { e.preventDefault(); pressKey("del"); }
  if (e.key === "Enter" && e.target.matches(".lock")) pressKey("ok");
});
$("#lock").tabIndex = -1;


/* ===== 14. Phiếu triệu tập + kiểm tra dữ liệu → mở email ===== */
const form = $("#contactForm");
const message = $("#message");
const status = $("#formStatus");
const rules = {
  name: v => !v.trim() ? dyn().err.nameEmpty : v.trim().length < 2 ? dyn().err.nameShort : "",
  email: v => !v.trim() ? dyn().err.emailEmpty : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? dyn().err.emailBad : "",
  message: v => !v.trim() ? dyn().err.msgEmpty : v.trim().length < 10 ? dyn().err.msgShort : ""
};
function validateField(name) {
  const input = form.elements[name];
  const error = rules[name](input.value);
  const field = input.closest(".field");
  $(`#${name}Err`).textContent = error;
  field.classList.toggle("invalid", Boolean(error));
  field.classList.toggle("valid", !error);
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}
Object.keys(rules).forEach(name => form.elements[name].addEventListener("blur", () => validateField(name)));
message.addEventListener("input", () => { $("#count").textContent = `${message.value.length}/300`; });
form.addEventListener("submit", e => {
  e.preventDefault();
  const ok = Object.keys(rules).map(validateField).every(Boolean);
  if (!ok) {
    status.style.color = "var(--red)";
    status.textContent = dyn().err.fixForm;
    return;
  }
  // Không gửi thật: chỉ đóng dấu và báo đã ghi nhận
  const name = form.elements.name.value.trim();
  status.style.color = "var(--green)";
  status.textContent = dyn().sent(name);
  form.classList.add("is-sent");
  showToast(dyn().sentToast);
  form.reset();
  $("#count").textContent = "0/300";
  $$(".field", form).forEach(f => f.classList.remove("valid", "invalid"));
  setTimeout(() => form.classList.remove("is-sent"), 3500);
});

/* ===== 15. Toast + sao chép email ===== */
const toast = $("#toast");
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
$("#copyEmail").addEventListener("click", async () => {
  const email = "thultm1931@ut.edu.vn";
  try {
    await navigator.clipboard.writeText(email);
    showToast(dyn().copied);
  } catch {
    const tmp = document.createElement("textarea");
    tmp.value = email;
    document.body.append(tmp);
    tmp.select();
    const ok = document.execCommand("copy");
    tmp.remove();
    showToast(ok ? dyn().copied : dyn().copyFail);
  }
});

/* ===== 16. Hiện dần khi cuộn ===== */
const revealEls = $$(".sec-head, .profile, .mo__col, .history, .threat, .case, .vault, .cert, .witness, .warrant > *");
if (!reduceMotion) {
  revealEls.forEach((el, i) => { el.classList.add("reveal"); if (el.matches(".case, .witness")) el.style.transitionDelay = `${(i % 3) * 90}ms`; });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("in");
      revealObserver.unobserve(el);
      setTimeout(() => { el.classList.remove("reveal", "in"); el.style.transitionDelay = ""; }, 900);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach(el => revealObserver.observe(el));
}

