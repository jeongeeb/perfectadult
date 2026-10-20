/* 제품 메인 이미지 갤러리. 화살표·휠·터치로 한 제품씩 중앙에 맞춰 이동합니다. */
function archiveCaptionMarkup(product) {
  const productIndex = products.indexOf(product);
  const summary = product.summary.replace(/^수행\s*규약\s*[:：]?\s*/, "");
  return `
    <p class="archive-project-number"><span class="archive-item-number">${formatProductNumber(product, productIndex)}</span> / <span class="archive-item-name">${product.name}</span></p>
    <h2>${productDisplayName(product)}</h2>
    <p class="archive-project-summary">${summary}</p>`;
}

function archiveProjectEntry(product, index) {
  const productIndex = products.indexOf(product);
  return `
    <article class="archive-project" id="archive-project-${productIndex + 1}" data-product-id="${product.id}" aria-label="${index + 1}. ${productDisplayName(product)}">
      <a class="archive-project-link" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 상세페이지">
        <figure class="archive-image-wrap">
          <img class="archive-main-image" src="${versionMainImage(product.image)}" alt="${productDisplayName(product)} 제품 메인 이미지" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        </figure>
        <div class="archive-project-info" data-product-id="${product.id}">${archiveCaptionMarkup(product)}</div>
      </a>
    </article>`;
}

function renderArchive() {
  document.documentElement.classList.add("archive-scroll");
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
        <div class="archive-gallery">
          <div class="archive-composition">
            <div class="archive-images">${archiveProducts.map(archiveProjectEntry).join("")}</div>
            <div class="archive-captions">
              ${archiveProducts.map((product) => `<a class="archive-project-info" data-product-id="${product.id}" href="product.html?id=${product.id}" aria-hidden="true" tabindex="-1">${archiveCaptionMarkup(product)}</a>`).join("")}
            </div>
          </div>
        </div>
        <nav class="archive-controls" aria-label="아카이브 이미지 탐색">
          <button class="archive-previous" type="button" aria-label="이전 이미지"><img src="assets/graphics/gallery-chevron.svg" alt="" aria-hidden="true"></button>
          <p class="archive-position" aria-live="polite" aria-atomic="true">01 / ${String(archiveProducts.length).padStart(2, "0")}</p>
          <button class="archive-next" type="button" aria-label="다음 이미지"><img src="assets/graphics/gallery-chevron.svg" alt="" aria-hidden="true"></button>
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
  const captions = [...page.querySelectorAll(".archive-captions .archive-project-info")];
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
  let wrapProgress = null;
  let wrapFrame = 0;
  let autoplayTimer;

  // [자동 전환 간격] 3000ms = 3초. 수동으로 넘긴 뒤에도 새 제품을 3초 보여줍니다.
  const AUTOPLAY_DELAY = 3000;
  // 작은 트랙패드 움직임은 모아 판단하고, 관성 중에는 다음 제품으로 재이동하지 않습니다.
  const WHEEL_THRESHOLD = 36;
  const GESTURE_PAUSE = 180;
  const WRAP_DURATION = 420;
  const normalize = (index) => ((index % cards.length) + cards.length) % cards.length;
  // 1번 왼쪽에는 16번, 16번 오른쪽에는 1번이 오도록 가장 가까운 순환 거리를 구합니다.
  const circularDistance = (index, progress) =>
    normalize(index - progress + cards.length / 2) - cards.length / 2;

  const metrics = () => ({
    top: page.getBoundingClientRect().top + window.scrollY,
    step: Math.max(1, (page.offsetHeight - stage.offsetHeight) / Math.max(1, cards.length - 1)),
  });
  const scrollProgress = () => {
    const { top, step } = metrics();
    return Math.max(0, Math.min(cards.length - 1, (window.scrollY - top) / step));
  };

  const update = () => {
    frame = 0;
    // 낮은 가로 화면에서는 각 이미지를 일반 문서 흐름으로 표시합니다.
    if (compact.matches) {
      if (wrapProgress !== null) {
        window.cancelAnimationFrame(wrapFrame);
        wrapFrame = 0;
        wrapProgress = null;
        isNavigating = false;
      }
      cards.forEach((card) => {
        card.removeAttribute("aria-hidden");
        card.querySelector("a").tabIndex = 0;
      });
      captions.forEach((caption) => {
        caption.setAttribute("aria-hidden", "true");
        caption.tabIndex = -1;
      });
      activeIndex = -1;
      return;
    }
    const progress = wrapProgress ?? scrollProgress();
    const current = normalize(Math.round(progress));
    if (!isNavigating) targetIndex = current;
    const visualProgress = reducedMotion.matches ? current : progress;
    // [옆 이미지 간격] 아래 0.60은 모바일 너비의 60%, 0.37은 PC 너비의 37%.
    const spacing = window.innerWidth * (window.innerWidth <= 760 ? 0.60 : 0.37);

    cards.forEach((card, index) => {
      const distance = circularDistance(index, visualProgress);
      const depth = Math.min(Math.abs(distance), 1);
      const visible = Math.abs(distance) < 1.8;
      // [옆 이미지 크기] 아래 scale의 0.54는 54% 축소 = 중앙 크기의 46%.
      // translate의 depth * 24는 옆 이미지를 중앙보다 24px 아래에 배치합니다.
      card.style.transform = `translate(-50%, -50%) translate(${distance * spacing}px, ${depth * 24}px) scale(${1 - depth * 0.54})`;
      // [옆 이미지 투명도] 아래 0.80은 80% 투명 = 불투명도 20%. 키우면 더 흐려집니다.
      card.style.opacity = visible ? String((1 - depth * 0.80) * Math.min(1, (1.8 - Math.abs(distance)) / 0.8)) : "0";
      card.style.visibility = visible ? "visible" : "hidden";
      card.style.zIndex = String(10 - Math.min(9, Math.round(Math.abs(distance) * 3)));
    });
    // 설명은 이미지와 별도 영역에 겹쳐 두고, 이동 없이 사라졌다가 나타납니다.
    captions.forEach((caption, index) => {
      const distance = Math.abs(circularDistance(index, visualProgress));
      caption.style.opacity = String(Math.max(0, 1 - distance * 2));
      caption.style.visibility = distance < 0.5 ? "visible" : "hidden";
    });

    if (current === activeIndex) return;
    activeIndex = current;
    cards.forEach((card, index) => {
      const isActive = index === current;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-hidden", String(!isActive));
      card.querySelector("a").tabIndex = isActive ? 0 : -1;
    });
    captions.forEach((caption, index) => {
      const isActive = index === current;
      caption.setAttribute("aria-hidden", String(!isActive));
      caption.tabIndex = isActive ? 0 : -1;
    });
    // 다음 이미지가 중앙에 오기 전에 미리 읽습니다.
    [-1, 0, 1, 2].forEach((offset) => {
      preloadImage(cards[normalize(current + offset)].querySelector("img"));
    });
    previous.disabled = cards.length < 2;
    next.disabled = cards.length < 2;
    position.textContent = `${String(current + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  };

  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  const finishNavigation = () => {
    window.clearTimeout(navigationTimer);
    isNavigating = false;
    requestUpdate();
    restartAutoplay();
  };
  const goTo = (index) => {
    window.clearTimeout(autoplayTimer);
    const target = normalize(index);
    const wasWrapping = wrapProgress !== null;
    const from = wrapProgress ?? scrollProgress();
    const distance = circularDistance(target, from);
    const destination = from + distance;
    const crossesBoundary = destination < -0.001 || destination > cards.length - 1 + 0.001;
    const { top, step } = metrics();
    window.cancelAnimationFrame(wrapFrame);
    wrapFrame = 0;
    wrapProgress = null;
    targetIndex = target;
    scrollTarget = top + target * step;
    window.clearTimeout(navigationTimer);
    isNavigating = true;
    if ((crossesBoundary || wasWrapping) && !reducedMotion.matches) {
      // 경계에서는 옆 한 장만 애니메이션한 뒤 실제 페이지 스크롤 위치를 즉시 맞춥니다.
      // 1→16 이동 때문에 중간 15개 제품이 한꺼번에 지나가지 않도록 합니다.
      scrollPageTo(window.scrollY, "instant");
      wrapProgress = from;
      const started = performance.now();
      const animate = (now) => {
        const elapsed = Math.min(1, (now - started) / WRAP_DURATION);
        wrapProgress = from + distance * (1 - (1 - elapsed) ** 3);
        requestUpdate();
        if (elapsed < 1) wrapFrame = window.requestAnimationFrame(animate);
        else {
          wrapFrame = 0;
          wrapProgress = null;
          scrollPageTo(scrollTarget, "instant");
          finishNavigation();
        }
      };
      wrapFrame = window.requestAnimationFrame(animate);
      return;
    }
    scrollPageTo(scrollTarget, reducedMotion.matches || crossesBoundary ? "instant" : "smooth");
    if (Math.abs(window.scrollY - scrollTarget) < 1) finishNavigation();
    else navigationTimer = window.setTimeout(finishNavigation, 1200);
  };
  const inGallery = () => {
    const { top, step } = metrics();
    return window.scrollY >= top - 1 && window.scrollY <= top + step * (cards.length - 1) + 1;
  };

  // 하단 설명을 읽거나 다른 탭을 보는 동안은 멈춥니다. 갤러리로 돌아오면 다시 시작합니다.
  const canAutoplay = () => cards.length > 1 && !compact.matches && !reducedMotion.matches &&
    !document.hidden && !touch && !isNavigating && inGallery();
  const restartAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    if (!canAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      if (canAutoplay()) goTo(targetIndex + 1);
    }, AUTOPLAY_DELAY);
  };

  // 한 제스처 = 한 제품. 마지막 제품의 다음 아래 스크롤은 하단 로고/설명으로 이어집니다.
  window.addEventListener("wheel", (event) => {
    if (compact.matches || event.defaultPrevented || event.ctrlKey || event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !inGallery()) return;
    const element = event.target instanceof Element ? event.target : null;
    if (element?.closest("input, textarea, select, [contenteditable='true']")) return;
    const sidebar = element?.closest(".page-side-index");
    if (sidebar && sidebar.scrollHeight > sidebar.clientHeight) return;
    restartAutoplay();

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
    // 새 제스처일 때만 하단으로 빠져나갑니다. 마지막 제품에 도착한 관성은 위에서 차단합니다.
    if (direction > 0 && targetIndex === cards.length - 1 && scrollProgress() >= cards.length - 1 - 0.01) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const delta = event.deltaY * unit;
    wheelDistance = Math.sign(wheelDistance) === direction ? wheelDistance + delta : delta;
    if (Math.abs(wheelDistance) < WHEEL_THRESHOLD) return;
    wheelConsumed = true;
    wheelDistance = 0;
    goTo(targetIndex + direction);
  }, { passive: false, capture: true });

  // 세로 스와이프 한 번에 한 제품씩 순환하며 확대 제스처는 유지합니다.
  stage.addEventListener("touchstart", (event) => {
    if (compact.matches || event.touches.length !== 1 || !inGallery()) { touch = null; return; }
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, index: targetIndex, consumed: false };
    restartAutoplay();
  }, { passive: true });
  stage.addEventListener("touchmove", (event) => {
    if (!touch || event.touches.length !== 1) { touch = null; return; }
    if (touch.consumed) { event.preventDefault(); return; }
    const dx = event.touches[0].clientX - touch.x;
    const dy = touch.y - event.touches[0].clientY;
    if (Math.abs(dy) < 10 || Math.abs(dx) > Math.abs(dy)) return;
    const direction = Math.sign(dy);
    if (direction > 0 && touch.index === cards.length - 1) { touch = null; return; }
    const target = normalize(touch.index + direction);
    if (target === touch.index) return;
    event.preventDefault();
    if (Math.abs(dy) < 48) return;
    touch.consumed = true;
    goTo(target);
  }, { passive: false });
  const endTouch = () => { touch = null; restartAutoplay(); };
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
      if ((event.key === "ArrowDown" || event.key === "PageDown") && targetIndex === cards.length - 1) {
        const footer = document.getElementById("project-footer");
        if (footer) scrollPageTo(footer.getBoundingClientRect().top + window.scrollY, reducedMotion.matches ? "instant" : "smooth");
        return;
      }
      goTo(targetIndex + directions[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : cards.length - 1);
    }
  });
  window.addEventListener("scroll", () => {
    if (wrapProgress === null && isNavigating && Math.abs(window.scrollY - scrollTarget) < 1) finishNavigation();
    requestUpdate();
    restartAutoplay();
    window.clearTimeout(settleTimer);
    // 스크롤바 조작이나 뒤로 가기로 이동한 경우에도 정지 후 가장 가까운 제품에 맞춥니다.
    settleTimer = window.setTimeout(() => {
      if (compact.matches || isNavigating || !inGallery()) return;
      const { top, step } = metrics();
      const nearest = Math.round((window.scrollY - top) / step);
      if (Math.abs(window.scrollY - (top + nearest * step)) > 1) goTo(nearest);
    }, GESTURE_PAUSE);
  }, { passive: true });
  const refreshGallery = () => { requestUpdate(); restartAutoplay(); };
  window.addEventListener("resize", refreshGallery);
  window.addEventListener("pageshow", refreshGallery);
  document.addEventListener("visibilitychange", restartAutoplay);
  listenToMediaQueryChange(reducedMotion, refreshGallery);
  listenToMediaQueryChange(compact, refreshGallery);
  update();
  restartAutoplay();
}

renderArchive();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
