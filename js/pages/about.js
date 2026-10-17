/*
  [About 비교용 룩북]
  - 왼쪽: archiveLooks 순서의 착용 이미지 목록
  - 오른쪽: 선택한 착용 이미지와 해당 제품의 정면 컷
  - 아카이브 페이지의 구성과 데이터 순서는 변경하지 않습니다.
*/
function aboutThumbnailMarkup(look, index) {
  const filename = look.src.split("/").pop();
  return `
    <button class="about-look-thumbnail${index === 0 ? " is-active" : ""}" type="button"
      data-look-index="${index}" aria-label="LOOK ${String(index + 1).padStart(2, "0")} ${productDisplayName(look.product)} 크게 보기"
      aria-pressed="${index === 0}" aria-controls="about-viewer">
      <img src="${versionMainImage(`assets/lookbook-thumbnails/${filename}`)}" alt="${productDisplayName(look.product)} 착용 이미지"
        ${index < 6 ? 'loading="eager"' : 'loading="lazy"'} decoding="async">
    </button>`;
}

function renderAbout() {
  const firstLook = archiveLooks[0];
  if (!firstLook) return;
  const product = firstLook.product;
  renderShell(`
    <main class="about-page">
      <section class="about-look-list" aria-labelledby="about-title">
        <header class="about-list-heading">
          <h2 id="about-title">PERFECT ADULT / LOOKBOOK</h2>
          <p>2026 COLLECTION</p>
        </header>
        <div class="about-thumbnail-grid">${archiveLooks.map(aboutThumbnailMarkup).join("")}</div>
      </section>
      <section class="about-viewer" id="about-viewer" aria-label="착용 이미지 크게 보기" aria-roledescription="carousel" tabindex="0">
        <figure class="about-main-figure">
          <img class="about-main-image" src="${versionMainImage(firstLook.src)}" alt="${productDisplayName(product)} 착용 이미지"
            fetchpriority="high" decoding="async" draggable="false">
        </figure>
        <a class="about-product-cut" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 제품 상세보기">
          <img src="${versionMainImage(product.image)}" alt="${productDisplayName(product)} 제품 정면 컷" decoding="async">
        </a>
        <footer class="about-viewer-footer">
          <div class="about-current-product">
            <p class="about-product-number">${formatProductNumber(product, products.indexOf(product))}</p>
            <h2 class="about-product-name">${productDisplayName(product)}</h2>
          </div>
          <nav class="about-viewer-controls" aria-label="룩북 이미지 탐색">
            <button class="about-previous" type="button" aria-label="이전 착용 이미지">←</button>
            <p class="about-look-position" aria-live="polite" aria-atomic="true">01 / ${String(archiveLooks.length).padStart(2, "0")}</p>
            <button class="about-next" type="button" aria-label="다음 착용 이미지">→</button>
          </nav>
        </footer>
        <p class="about-load-status" role="status"></p>
      </section>
    </main>`);
  bindAboutLookbook();
}

function bindAboutLookbook() {
  const viewer = document.querySelector(".about-viewer");
  const list = document.querySelector(".about-thumbnail-grid");
  const image = viewer.querySelector(".about-main-image");
  const figure = viewer.querySelector(".about-main-figure");
  const productLink = viewer.querySelector(".about-product-cut");
  const productImage = productLink.querySelector("img");
  const productNumber = viewer.querySelector(".about-product-number");
  const productName = viewer.querySelector(".about-product-name");
  const position = viewer.querySelector(".about-look-position");
  const status = viewer.querySelector(".about-load-status");
  const thumbnails = [...list.querySelectorAll(".about-look-thumbnail")];
  let currentIndex = 0;
  let requestedIndex = 0;
  let requestId = 0;
  let touchStart = null;

  const revealThumbnail = (index) => {
    const thumbnail = thumbnails[index];
    const listRect = list.getBoundingClientRect();
    const itemRect = thumbnail.getBoundingClientRect();
    if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.top - listRect.top;
    }
  };

  const showLook = (index) => {
    const target = (index + archiveLooks.length) % archiveLooks.length;
    requestedIndex = target;
    const token = ++requestId;
    if (target === currentIndex) {
      viewer.classList.remove("is-loading");
      viewer.setAttribute("aria-busy", "false");
      status.textContent = "";
      return;
    }
    const look = archiveLooks[target];
    const pending = new Image();
    const pendingProduct = new Image();
    viewer.classList.add("is-loading");
    viewer.setAttribute("aria-busy", "true");
    status.textContent = "";

    let loaded = 0;
    const commit = () => {
      if (++loaded !== 2 || token !== requestId) return;
      const product = look.product;
      image.src = pending.src;
      image.alt = `${productDisplayName(product)} 착용 이미지`;
      productImage.src = pendingProduct.src;
      productImage.alt = `${productDisplayName(product)} 제품 정면 컷`;
      productLink.href = `product.html?id=${product.id}`;
      productLink.setAttribute("aria-label", `${productDisplayName(product)} 제품 상세보기`);
      productNumber.textContent = formatProductNumber(product, products.indexOf(product));
      productName.textContent = productDisplayName(product);
      position.textContent = `${String(target + 1).padStart(2, "0")} / ${String(archiveLooks.length).padStart(2, "0")}`;
      thumbnails.forEach((thumbnail, itemIndex) => {
        const isActive = itemIndex === target;
        thumbnail.classList.toggle("is-active", isActive);
        thumbnail.setAttribute("aria-pressed", String(isActive));
      });
      currentIndex = target;
      viewer.classList.remove("is-loading");
      viewer.setAttribute("aria-busy", "false");
      revealThumbnail(target);
    };
    const fail = () => {
      if (token !== requestId) return;
      // Invalidate the other image's callback as well.
      requestId += 1;
      requestedIndex = currentIndex;
      viewer.classList.remove("is-loading");
      viewer.setAttribute("aria-busy", "false");
      status.textContent = "이미지를 불러오지 못했습니다. 다시 선택해 주세요.";
    };
    pending.onload = commit;
    pendingProduct.onload = commit;
    pending.onerror = fail;
    pendingProduct.onerror = fail;
    pending.src = versionMainImage(look.src);
    pendingProduct.src = versionMainImage(look.product.image);
  };

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => showLook(index));
  });
  viewer.querySelector(".about-previous").addEventListener("click", () => showLook(requestedIndex - 1));
  viewer.querySelector(".about-next").addEventListener("click", () => showLook(requestedIndex + 1));
  viewer.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") showLook(0);
    else if (event.key === "End") showLook(archiveLooks.length - 1);
    else showLook(requestedIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  figure.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    touchStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  figure.addEventListener("pointerup", (event) => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      showLook(requestedIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });
  figure.addEventListener("pointercancel", () => { touchStart = null; });
}

renderAbout();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
