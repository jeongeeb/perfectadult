/* 제품마다 첫 archiveLooks 착용컷을 사용하며, 스크롤 위치로 크기와 투명도를 보간합니다. */
function archiveProjectEntry(product, index) {
  const look = archiveLooks.find((item) => item.product.id === product.id);
  const productIndex = products.indexOf(product);
  return `
    <article class="archive-project" id="archive-project-${productIndex + 1}" aria-label="${index + 1}. ${productDisplayName(product)}">
      <a class="archive-project-link" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 상세페이지">
        <figure class="archive-image-wrap">
          <img class="archive-main-image" src="${versionMainImage(look ? look.src : product.image)}" alt="${productDisplayName(product)} 착용 이미지" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
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
  const archiveProducts = products.filter((product) =>
    archiveLooks.some((look) => look.product.id === product.id),
  );
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
  const goTo = (index) => {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    const { top, step } = metrics();
    window.scrollTo({ top: top + target * step, behavior: reducedMotion.matches ? "instant" : "smooth" });
  };
  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      if (compact.matches || index === activeIndex) return;
      event.preventDefault();
      goTo(index);
    });
  });
  stage.addEventListener("keydown", (event) => {
    if (compact.matches || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const directions = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key in directions) {
      event.preventDefault();
      goTo(activeIndex + directions[event.key]);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : cards.length - 1);
    }
  });
  window.addEventListener("scroll", requestUpdate, { passive: true });
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
