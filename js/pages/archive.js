/* 제품 메인 이미지 갤러리. 화살표·휠·터치로 한 제품씩 중앙에 맞춰 이동합니다. */
function archiveProjectEntry(product, index) {
  const productIndex = products.indexOf(product);
  return `
    <article class="archive-project" id="archive-project-${productIndex + 1}" aria-label="${index + 1}. ${productDisplayName(product)}">
      <a class="archive-project-link" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 상세페이지">
        <figure class="archive-image-wrap">
          <img class="archive-main-image" src="${versionMainImage(product.image)}" alt="${productDisplayName(product)} 제품 메인 이미지" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </figure>
        <div class="archive-project-info">
          <p class="archive-project-number">${formatProductNumber(product, productIndex)} / ${product.name}</p>
          <h2>${productDisplayName(product)}</h2>
          <p class="archive-project-price">${product.price}</p>
          <p class="archive-project-summary">${product.summary}</p>
        </div>
      </a>
    </article>`;
}

function renderArchive() {
  const archiveProducts = products;
  renderShell(`
    <aside class="page-side-index archive-filter" aria-label="Archive contents">
      <nav class="page-side-nav archive-section-nav">
        <header class="archive-heading">
          <h2 id="archive-title"><a href="#archive-gallery">Perfect Adult Product Archive</a></h2>
          <p>2026 Collection</p>
        </header>
      </nav>
    </aside>
    <main class="archive-page" id="archive-gallery" style="--archive-steps: ${Math.max(0, archiveProducts.length - 1)}">
      <section class="archive-stage" aria-labelledby="archive-title" aria-roledescription="carousel" tabindex="0">
        <div class="archive-gallery">${archiveProducts.map(archiveProjectEntry).join("")}</div>
        <nav class="archive-controls" aria-label="아카이브 이미지 탐색">
          <button class="archive-previous" type="button" aria-label="이전 이미지">←</button>
          <p class="archive-position" aria-live="polite" aria-atomic="true">01 / ${String(archiveProducts.length).padStart(2, "0")}</p>
          <button class="archive-next" type="button" aria-label="다음 이미지">→</button>
        </nav>
        <p class="archive-scroll-hint">Scroll to explore</p>
      </section>
    </main>`);
  bindArchiveGallery();
}

function bindArchiveGallery() {
  const page = document.querySelector(".archive-page");
  const stage = page.querySelector(".archive-stage");
  const cards = [...page.querySelectorAll(".archive-project")];
  const previous = page.querySelector(".archive-previous");
  const next = page.querySelector(".archive-next");
  const position = page.querySelector(".archive-position");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-height: 560px)");
  if (!cards.length) return;
  page.classList.add("is-enhanced");
  let activeIndex = -1;
  let frame = 0;
  let targetIndex = 0;
  let isNavigating = false;
  let scrollTarget = 0;
  let navigationTimer;
  let settleTimer;
  let wheelTimer;
  let wheelDistance = 0;
  let wheelConsumed = false;
  let touch = null;

  // 작은 트랙패드 움직임은 모아 판단하고, 관성 중에는 다음 제품으로 재이동하지 않습니다.
  const WHEEL_THRESHOLD = 36;
  const GESTURE_PAUSE = 180;

  const metrics = () => ({
    top: page.getBoundingClientRect().top + window.scrollY,
    step: Math.max(1, (page.offsetHeight - stage.offsetHeight) / Math.max(1, cards.length - 1)),
  });

  const update = () => {
    frame = 0;
    // 낮은 가로 화면에서는 각 이미지를 일반 문서 흐름으로 표시합니다.
    if (compact.matches) {
      cards.forEach((card) => {
        card.removeAttribute("aria-hidden");
        card.querySelector("a").tabIndex = 0;
      });
      activeIndex = -1;
      return;
    }
    const { top, step } = metrics();
    const progress = Math.max(0, Math.min(cards.length - 1, (window.scrollY - top) / step));
    const current = Math.round(progress);
    if (!isNavigating) targetIndex = current;
    const visualProgress = reducedMotion.matches ? current : progress;
    const spacing = window.innerWidth * (window.innerWidth <= 760 ? 0.60 : 0.37);

    cards.forEach((card, index) => {
      const distance = index - visualProgress;
      const depth = Math.min(Math.abs(distance), 1);
      const visible = Math.abs(distance) < 1.8;
      // 중앙은 크게, 앞뒤 이미지는 46% 크기와 20% 불투명도로 배치합니다.
      card.style.transform = `translate(-50%, -50%) translate(${distance * spacing}px, ${depth * 24}px) scale(${1 - depth * 0.54})`;
      card.style.opacity = visible ? String((1 - depth * 0.80) * Math.min(1, (1.8 - Math.abs(distance)) / 0.8)) : "0";
      card.style.visibility = visible ? "visible" : "hidden";
      card.style.zIndex = String(10 - Math.min(9, Math.round(Math.abs(distance) * 3)));
      card.style.setProperty("--caption-opacity", String(Math.max(0, 1 - Math.abs(distance) * 2)));
    });

    if (current === activeIndex) return;
    activeIndex = current;
    cards.forEach((card, index) => {
      const isActive = index === current;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-hidden", String(!isActive));
      card.querySelector("a").tabIndex = isActive ? 0 : -1;
    });
    // 다음 이미지가 중앙에 오기 전에 미리 읽습니다.
    cards.slice(Math.max(0, current - 1), current + 3).forEach((card) => {
      card.querySelector("img").loading = "eager";
    });
    previous.disabled = current === 0;
    next.disabled = current === cards.length - 1;
    position.textContent = `${String(current + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const finishNavigation = () => {
    window.clearTimeout(navigationTimer);
    isNavigating = false;
    requestUpdate();
  };
  const goTo = (index) => {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    const { top, step } = metrics();
    targetIndex = target;
    scrollTarget = top + target * step;
    window.clearTimeout(navigationTimer);
    isNavigating = true;
    window.scrollTo({ top: scrollTarget, behavior: reducedMotion.matches ? "instant" : "smooth" });
    if (Math.abs(window.scrollY - scrollTarget) < 1) finishNavigation();
    else navigationTimer = window.setTimeout(finishNavigation, 1200);
  };
  const inGallery = () => {
    const { top, step } = metrics();
    return window.scrollY >= top - 1 && window.scrollY <= top + step * (cards.length - 1) + 1;
  };

  // 휠과 트랙패드 한 제스처 = 화살표 한 번. 첫/마지막 제품 밖으로는 일반 스크롤 허용.
  window.addEventListener("wheel", (event) => {
    if (compact.matches || event.defaultPrevented || event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !inGallery()) return;
    const element = event.target instanceof Element ? event.target : null;
    if (element?.closest("input, textarea, select, [contenteditable='true']")) return;
    const sidebar = element?.closest(".page-side-index");
    if (sidebar && sidebar.scrollHeight > sidebar.clientHeight) return;

    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => {
      wheelConsumed = false;
      wheelDistance = 0;
    }, GESTURE_PAUSE);
    if (wheelConsumed || isNavigating) {
      event.preventDefault();
      wheelConsumed = true;
      return;
    }
    const direction = Math.sign(event.deltaY);
    if ((targetIndex === 0 && direction < 0) ||
        (targetIndex === cards.length - 1 && direction > 0)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const delta = event.deltaY * unit;
    wheelDistance = Math.sign(wheelDistance) === direction ? wheelDistance + delta : delta;
    if (Math.abs(wheelDistance) < WHEEL_THRESHOLD) return;
    wheelConsumed = true;
    wheelDistance = 0;
    goTo(targetIndex + direction);
  }, { passive: false, capture: true });

  // 세로 스와이프 한 번에 한 제품씩 이동하며, 확대 제스처와 양 끝의 일반 스크롤은 유지합니다.
  stage.addEventListener("touchstart", (event) => {
    if (compact.matches || event.touches.length !== 1 || !inGallery()) { touch = null; return; }
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, index: targetIndex, consumed: false };
  }, { passive: true });
  stage.addEventListener("touchmove", (event) => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    if (touch.consumed) { event.preventDefault(); return; }
    const dx = event.touches[0].clientX - touch.x;
    const dy = touch.y - event.touches[0].clientY;
    if (Math.abs(dy) < 10 || Math.abs(dx) > Math.abs(dy)) return;
    const direction = Math.sign(dy);
    const target = Math.max(0, Math.min(cards.length - 1, touch.index + direction));
    if (target === touch.index) return;
    event.preventDefault();
    if (Math.abs(dy) < 48) return;
    touch.consumed = true;
    goTo(target);
  }, { passive: false });
  const endTouch = () => { touch = null; };
  stage.addEventListener("touchend", endTouch);
  stage.addEventListener("touchcancel", endTouch);

  previous.addEventListener("click", () => goTo(targetIndex - 1));
  next.addEventListener("click", () => goTo(targetIndex + 1));
  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      if (compact.matches || index === activeIndex) return;
      event.preventDefault();
      goTo(index);
    });
  });
  stage.addEventListener("keydown", (event) => {
    if (compact.matches || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const directions = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
    if (event.key in directions) {
      event.preventDefault();
      goTo(targetIndex + directions[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : cards.length - 1);
    }
  });
  window.addEventListener("scroll", () => {
    if (isNavigating && Math.abs(window.scrollY - scrollTarget) < 1) finishNavigation();
    requestUpdate();
    window.clearTimeout(settleTimer);
    // 스크롤바 조작이나 뒤로 가기로 이동한 경우에도 정지 후 가장 가까운 제품에 맞춥니다.
    settleTimer = window.setTimeout(() => {
      if (compact.matches || isNavigating || !inGallery()) return;
      const { top, step } = metrics();
      const nearest = Math.round((window.scrollY - top) / step);
      if (Math.abs(window.scrollY - (top + nearest * step)) > 1) goTo(nearest);
    }, GESTURE_PAUSE);
  }, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("pageshow", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);
  compact.addEventListener("change", requestUpdate);
  update();
}

renderArchive();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
