/*
  [제품 상세페이지 기능 지도]
  - prepareDetailOpening: 처음 보이는 큰 제품명과 그래픽
  - bindDetailInfoToggle: 도장 클릭 시 제품 설명 열기/닫기
  - bindStampAttention: 도장이 처음 보일 때 배경 노란빛, 클릭/3회 반복 후 종료
  - bindPurchaseModal: BUY NOW/ADD TO CART 팝업과 수량 계산
  - renderDetail: 상세페이지 전체 HTML 출력
  제품명/가격/설명은 js/shared/data.js의 products에서 바꿉니다.
*/
function prepareDetailOpening() {
  const opening = document.querySelector(".detail-opening");
  if (!opening) return;
  // 모바일은 PC 오프닝 대신 상세 이미지부터 바로 보여줍니다.
  if (window.matchMedia("(max-width: 760px)").matches) {
    opening.remove();
    return;
  }

  const graphic = opening.querySelector(".detail-opening-graphic");
  const candidates = graphic.dataset.graphicCandidates.split("|");

  findFirstImage(candidates, (src) => {
    graphic.src = src;
    opening.classList.add("has-opening-graphic");
  });

  window.setTimeout(() => {
    opening.classList.add("is-hiding");
  }, DETAIL_OPENING_VISIBLE_TIME);

  window.setTimeout(() => {
    opening.remove();
  }, DETAIL_OPENING_VISIBLE_TIME + DETAIL_OPENING_FADE_TIME);
}

function bindDetailInfoToggle() {
  const toggle = document.querySelector(".detail-description-toggle");
  const panel = document.querySelector(".detail-description-body");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.classList.toggle("is-open", isOpen);
      panel.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen.toString());
      toggle.textContent = `${isOpen ? "-" : "+"} description`;
      panel.closest(".detail-description-collapse")?.classList.toggle("is-open", isOpen);
      panel.setAttribute("aria-hidden", (!isOpen).toString());
      panel.inert = !isOpen;
    });
  }

  const stampToggle = document.querySelector(".detail-info-toggle");
  const stampPanel = document.querySelector(".detail-info-overlay");
  if (!stampToggle || !stampPanel) return;

  stampToggle.addEventListener("click", () => {
    const isOpen = stampToggle.classList.toggle("is-open");
    stampPanel.classList.toggle("is-open", isOpen);
    stampToggle.setAttribute("aria-expanded", isOpen.toString());
    stampPanel.setAttribute("aria-hidden", (!isOpen).toString());
  });
  bindStampAttention(stampToggle);
}

// 도장이 실제로 보일 때 한 번만 시작합니다. 모바일의 긴 상세 이미지 아래에서도 동작합니다.
function bindStampAttention(stamp) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;
  let started = false;
  let finished = false;
  let observer;
  const stop = () => {
    finished = true;
    stamp.classList.remove("is-stamp-attention");
    observer?.disconnect();
  };
  const start = () => {
    if (started || finished) return;
    started = true;
    stamp.classList.add("is-stamp-attention");
    observer?.disconnect();
  };

  stamp.addEventListener("click", stop, { once: true });
  stamp.addEventListener("animationend", (event) => {
    if (event.animationName === "stamp-attention-glow") stop();
  });
  listenToMediaQueryChange(reducedMotion, (event) => {
    if (event.matches) stop();
  });
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) start();
    }, { threshold: 0.25 });
    observer.observe(stamp);
  } else {
    start();
  }
}

function detailLine(label, text) {
  if (!text) return "";
  return `<p><strong class="detail-description-label">${label}</strong> <span>${text}</span></p>`;
}

function productDetailMarkup(product) {
  const detail = product.detail || {};
  const features = (detail.features || [])
    .map((feature) => `<li>${feature}</li>`)
    .join("");

  return `
    <div class="detail-product-details">
      <div class="detail-description-header">
        <p>Product details</p>
        <button class="detail-description-toggle is-open" type="button" aria-expanded="true" aria-controls="detail-description-body">- description</button>
      </div>
      <div class="detail-description-collapse is-open">
      <div class="detail-description-body is-open" id="detail-description-body" aria-hidden="false">
        <div class="detail-description-content">
        ${detailLine("대응 강령 :", product.name)}
        ${detailLine("사회표준 지침 :", detail.standard)}
        ${detailLine("수행 규약 :", detail.code)}
        ${detailLine("주의사항 :", detail.caution)}
        ${detailLine("제품화 방향 :", detail.direction)}
        ${detail.description ? `<p>${detail.description}</p>` : ""}
        ${features ? `<p><strong class="detail-description-label">*제품 주요 기능</strong></p><ul>${features}</ul>` : ""}
        </div>
      </div>
      </div>
    </div>`;
}

function productDoctrineLabel(productIndex) {
  const labels = [
    "제1-1강령",
    "제1-2강령",
    "제1-3강령",
    "제2-1강령",
    "제2-2강령",
    "제2-3강령",
    "제3-1강령",
    "제3-2강령",
    "제3-3강령",
    "제4-1강령",
    "제5-1강령",
    "제5-2강령",
    "제6-1강령",
    "제6-2강령",
    "제6-3강령",
    "최종강령",
  ];
  return labels[productIndex] || `제${productIndex + 1}강령`;
}

function productQuoteMarkup(product, productIndex) {
  const detail = product.detail || {};
  const isLongQuote = (detail.standard || "").length > 28;
  const shouldFitQuote = ["silent-helmet", "calm-capsule", "adult-tool-16"].includes(product.id);
  return `
    <section class="detail-info-overlay${isLongQuote ? " is-long-quote" : ""}" id="detail-info-overlay"${shouldFitQuote ? ' data-fit-quote' : ""} aria-hidden="true">
      <div class="detail-quote-grid">
        <p class="detail-quote-standard">“${detail.standard || ""}”</p>
      </div>
    </section>`;
}

function prepareProductStampQuoteFit() {
  // 모바일은 모든 제품, PC는 기존 4·6·16번 문구를 화면 안에 맞춥니다.
  const overlay = document.querySelector(".detail-info-overlay");
  if (!overlay) return;
  const grid = overlay.querySelector(".detail-quote-grid");
  const quote = overlay.querySelector(".detail-quote-standard");
  let frame = 0;

  const fit = () => {
    frame = 0;
    overlay.style.removeProperty("font-size");
    grid.style.removeProperty("max-width");
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    if (!mobile && !overlay.hasAttribute("data-fit-quote")) return;
    const style = window.getComputedStyle(overlay);
    const maxSize = Number.parseFloat(style.fontSize);
    // 글자 외곽선과 서체의 돌출 부분까지 화면 안에 들어오도록 여유를 둡니다.
    const safety = Number.parseFloat(style.webkitTextStrokeWidth || "0") * 2 + 4;
    const height = overlay.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - safety;
    const width = overlay.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - safety;
    if (height <= 0 || width <= 0 || !grid.offsetWidth) return;
    // 모바일은 가로 압축 없이 표시하므로 외곽선 여유만큼 실제 문구 영역도 줄입니다.
    if (mobile) grid.style.maxWidth = `${Math.floor(width)}px`;
    const scaleX = grid.getBoundingClientRect().width / grid.offsetWidth;
    const fits = () => Math.max(grid.scrollHeight, quote.scrollHeight) <= height &&
      Math.max(grid.scrollWidth, quote.scrollWidth) * scaleX <= width;
    if (fits()) return;

    let low = 1;
    let high = maxSize;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const size = (low + high) / 2;
      overlay.style.fontSize = `${size}px`;
      if (fits()) low = size;
      else high = size;
    }
    overlay.style.fontSize = `${Math.floor(low * 10) / 10}px`;
  };
  const requestFit = () => {
    if (!frame) frame = window.requestAnimationFrame(fit);
  };
  // 화면 크기 및 웹폰트 로딩 후 실제 글자 크기를 기준으로 다시 계산합니다.
  window.addEventListener("resize", requestFit);
  window.visualViewport?.addEventListener("resize", requestFit);
  document.fonts?.ready.then(requestFit);
  requestFit();
}

function productDisplayName(product) {
  return productTitleWithoutNumber(product.title);
}

function productDisplayPrice(product) {
  return product.price.replace(/^([\d,]+)\s*KRW$/, "KRW $1");
}

function bindPurchaseModal(product) {
  const modal = document.querySelector(".purchase-modal");
  const dialog = modal?.querySelector(".purchase-dialog");
  const modeLabel = modal?.querySelector(".purchase-mode");
  const message = modal?.querySelector(".purchase-message");
  const quantityValue = modal?.querySelector(".purchase-quantity-value");
  const total = modal?.querySelector(".purchase-total-value");
  const confirm = modal?.querySelector(".purchase-confirm");
  const status = modal?.querySelector(".purchase-status");
  const actionButtons = document.querySelectorAll("[data-purchase-action]");
  if (
    !modal ||
    !dialog ||
    !modeLabel ||
    !message ||
    !quantityValue ||
    !total ||
    !confirm ||
    !status
  ) {
    return;
  }

  const unitPrice = Number(product.price.replace(/[^0-9]/g, ""));
  let quantity = 1;
  let mode = "cart";
  let returnFocus = null;

  const updateTotal = () => {
    quantityValue.textContent = quantity.toString();
    total.textContent = `${(unitPrice * quantity).toLocaleString("ko-KR")} KRW`;
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    returnFocus?.focus();
  };

  const openModal = (nextMode, trigger) => {
    mode = nextMode;
    quantity = 1;
    returnFocus = trigger;
    status.textContent = "";
    status.classList.remove("is-visible");
    modeLabel.textContent =
      mode === "buy" ? "PURCHASE INFORMATION" : "CART INFORMATION";
    message.textContent =
      mode === "buy"
        ? "주문 내용을 확인하세요. 현재 사이트는 전시용 프로토타입으로 실제 결제 시스템은 아직 연결되어 있지 않습니다."
        : "선택한 제품과 수량을 확인한 뒤 장바구니에 추가할 수 있습니다.";
    confirm.textContent = mode === "buy" ? "CONTINUE" : "ADD TO CART";
    confirm.dataset.state = "action";
    updateTotal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => dialog.focus(), 0);
  };

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.purchaseAction, button);
    });
  });

  modal.querySelectorAll("[data-purchase-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.querySelector("[data-quantity='minus']")?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateTotal();
  });

  modal.querySelector("[data-quantity='plus']")?.addEventListener("click", () => {
    quantity = Math.min(99, quantity + 1);
    updateTotal();
  });

  confirm.addEventListener("click", () => {
    if (confirm.dataset.state === "close") {
      closeModal();
      return;
    }

    status.textContent =
      mode === "buy"
        ? "CHECKOUT CONNECTION PENDING / 결제 시스템 연결 전입니다."
        : `${quantity}개 제품이 장바구니에 추가되었습니다. / ADDED TO CART`;
    status.classList.add("is-visible");
    confirm.textContent = "CLOSE";
    confirm.dataset.state = "close";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function prepareDetailPageImage() {
  const gallery = document.querySelector(".detail-page-gallery");
  const fallback = document.querySelector(".detail-fallback-gallery");
  const layout = document.querySelector(".detail-layout");
  const relatedProducts = document.querySelector(".detail-related-products");
  const image = gallery?.querySelector(".detail-scroll-image");
  if (!gallery || !image || !layout) return;

  const candidates = image.dataset.detailCandidates.split("|");

  const releaseDetailControlsAt = (relatedTop) => {
    const panel = document.querySelector(".detail-panel");
    const actions = document.querySelector(".detail-actions");
    const infoToggle = document.querySelector(".detail-info-toggle");
    const infoOverlay = document.querySelector(".detail-product-details");
    const quoteOverlay = document.querySelector(".detail-info-overlay");
    if (!actions) return;

    const updateControlPosition = () => {
      // 모바일은 이미지 → 도장 → 설명의 일반 흐름이므로 PC 고정/해제 계산을 건너뜁니다.
      if (window.matchMedia("(max-width: 760px)").matches) {
        [panel, actions, infoToggle, infoOverlay, quoteOverlay].forEach((element) => {
          element?.classList.remove("is-released");
        });
        panel?.style.removeProperty("top");
        actions.style.removeProperty("top");
        return;
      }
      const scale = window.innerWidth / DESIGN_WIDTH;
      const releaseScrollY = Math.max(
        0,
        relatedTop * scale - window.innerHeight - 50 * scale,
      );
      const isReleased = window.scrollY >= releaseScrollY;

      panel?.classList.toggle("is-released", isReleased);
      actions.classList.toggle("is-released", isReleased);
      infoToggle?.classList.toggle("is-released", isReleased);
      infoOverlay?.classList.toggle("is-released", isReleased);
      quoteOverlay?.classList.toggle("is-released", isReleased);

      if (isReleased) {
        if (panel) panel.style.top = `${releaseScrollY + 146 * scale}px`;
        actions.style.top = `${releaseScrollY + 230 * scale}px`;
      } else {
        panel?.style.removeProperty("top");
        actions.style.removeProperty("top");
      }
    };

    window.addEventListener("scroll", updateControlPosition, { passive: true });
    window.addEventListener("resize", updateControlPosition);
    updateControlPosition();
  };

  const showRelatedProducts = (detailHeight) => {
    const relatedTop = 145 + detailHeight + 140;
    const pageHeight = relatedTop + 2100;
    layout.style.setProperty("--detail-related-top", `${relatedTop}px`);
    layout.style.setProperty("--detail-page-height", `${pageHeight}px`);
    layout.classList.add("has-related-products");
    if (relatedProducts) relatedProducts.hidden = false;
    releaseDetailControlsAt(relatedTop);
  };

  findFirstImage(
    candidates,
    (src, loadedImage) => {
      const detailHeight =
        loadedImage.naturalWidth > 0
          ? (635 * loadedImage.naturalHeight) / loadedImage.naturalWidth
          : 880;
      image.src = src;
      gallery.hidden = false;
      fallback.hidden = true;
      layout.classList.add("has-scroll-gallery");
      showRelatedProducts(detailHeight);
    },
    () => showRelatedProducts(910),
  );
}


function renderDetail() {
  document.body.classList.add("menus-hidden");

  const params = new URLSearchParams(window.location.search);
  const product =
    products.find((item) => item.id === params.get("id")) || products[0];
  const productIndex = Math.max(products.indexOf(product), 0);
  const fallbackGallery = `<section class="detail-gallery detail-fallback-gallery" aria-label="Product images">
        <div class="detail-hero"><img src="${product.image}" alt="${product.name}"></div>
        <div class="detail-closeup"><img src="${product.image}" alt="${product.name} close view"></div>
      </section>`;
  const relatedTiles = productTilesMarkup();
  const openingTitleParts = product.name
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const longestOpeningTitle = Math.max(
    ...openingTitleParts.map((part) => part.length),
  );
  const openingTitleSizeClass =
    longestOpeningTitle > 11
      ? "is-long"
      : longestOpeningTitle > 7
        ? "is-medium"
        : "";
  const openingTitle = openingTitleParts
    .map((part) => `<span class="detail-opening-title-line">${part}</span>`)
    .join("");

  renderShell(`
    <main class="detail-layout">
      <section class="detail-opening" aria-hidden="true">
        <img class="detail-opening-graphic" alt="" data-graphic-candidates="${detailOpeningImageCandidates(product, productIndex).join("|")}">
        <p class="detail-opening-title ${openingTitleSizeClass}">${openingTitle}</p>
      </section>
      <section class="detail-gallery detail-gallery-scroll detail-page-gallery" aria-label="Product detail image" hidden>
        <img class="detail-scroll-image" alt="${product.name} scroll detail" data-detail-candidates="${detailPageImageCandidates(product, productIndex).join("|")}">
      </section>
      ${fallbackGallery}
      <button class="detail-info-toggle" type="button" aria-label="강령 문구 보기" aria-controls="detail-info-overlay" aria-expanded="false">
        <span class="detail-stamp-glow" aria-hidden="true"></span>
        <img class="detail-info-stamp detail-info-stamp-red" src="assets/display/stamp_red.webp" alt="">
        <img class="detail-info-stamp detail-info-stamp-gray" src="assets/display/stamp_gray.webp" alt="">
      </button>
      ${productQuoteMarkup(product, productIndex)}
      <div class="detail-actions">
        <div class="detail-purchase-meta">
          <p class="detail-purchase-number">${formatProductNumber(product, productIndex)}</p>
          <p class="detail-purchase-name">${productDisplayName(product)}</p>
          <p class="detail-purchase-price">${productDisplayPrice(product)}</p>
        </div>
        ${productDetailMarkup(product)}
        <div class="detail-action-buttons">
          <button class="buy" type="button" data-purchase-action="buy">BUY NOW</button>
          <button type="button" data-purchase-action="cart">ADD TO CART</button>
        </div>
      </div>
      <div class="purchase-modal" aria-hidden="true">
        <button class="purchase-backdrop" type="button" data-purchase-close aria-label="Close purchase information"></button>
        <section class="purchase-dialog" role="dialog" aria-modal="true" aria-labelledby="purchase-product-name" tabindex="-1">
          <header class="purchase-dialog-header">
            <p class="purchase-mode">CART INFORMATION</p>
            <button type="button" data-purchase-close aria-label="Close">X</button>
          </header>
          <div class="purchase-dialog-body">
            <div class="purchase-product-image">
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="purchase-product-info">
              <p>${formatProductNumber(product, productIndex)}</p>
              <h2 id="purchase-product-name">${product.name}</h2>
              <p>${productTitleWithoutNumber(product.title)}</p>
              <dl>
                <div><dt>PRICE</dt><dd>${product.price}</dd></div>
                <div class="purchase-quantity-row">
                  <dt>QUANTITY</dt>
                  <dd>
                    <button type="button" data-quantity="minus" aria-label="Decrease quantity">−</button>
                    <span class="purchase-quantity-value">1</span>
                    <button type="button" data-quantity="plus" aria-label="Increase quantity">+</button>
                  </dd>
                </div>
                <div><dt>TOTAL</dt><dd class="purchase-total-value">${product.price}</dd></div>
              </dl>
              <p class="purchase-message"></p>
            </div>
          </div>
          <p class="purchase-status" aria-live="polite"></p>
          <footer class="purchase-dialog-footer">
            <button type="button" data-purchase-close>CANCEL</button>
            <button class="purchase-confirm" type="button">ADD TO CART</button>
          </footer>
        </section>
      </div>
      <section class="detail-related-products" aria-label="Perfect Adult collection" hidden>
        <p class="detail-related-message" id="detail-related-message"><em>[Become socially optimized.]</em></p>
        <div class="detail-related-grid">${relatedTiles}</div>
      </section>
    </main>`);
  prepareDetailPageImage();
  prepareProductHoverImages();
  prepareDetailOpening();
  bindDetailInfoToggle();
  prepareProductStampQuoteFit();
  bindPurchaseModal(product);
}

renderDetail();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
