/*
  [BOOK 이미지·글 수정 위치]
  1. GPT에서 만든 책 이미지를 assets/book 폴더에 저장하고 WebP로 변환합니다.
  2. 아래 slides의 src를 "assets/book/파일명.webp"로 변경합니다.
  3. 새 이미지에는 crop을 지우거나 "full"로 설정합니다. 사진을 자르지 않고 전체 표시합니다.
  4. imageRatio는 이미지의 가로 ÷ 세로입니다. 예: 1600 × 1000 사진 = 1.6.
     로딩 후 실제 이미지 비율도 자동 적용됩니다.
  5. 이미지 수는 slides 항목을 추가·삭제하면 됩니다. 번호·화살표가 자동으로 맞춰집니다.

  현재는 기존 지침서 이미지 assets/manual/2.webp의 두 펼침면을 각각 보여줍니다.
  원본 이미지는 변경하지 않으며 CSS로 왼쪽/오른쪽 절반만 표시합니다.
*/
const bookPublication = {
  title: "聖人用品指針",
  englishTitle: "PERFECT ADULT / BOOK",
  year: "2026",
  englishDescription: "A guide to becoming the adult society expects.",
  koreanDescription: "사회가 기대하는 완벽한 어른이 되기 위한 지침서.",
  slides: [
    {
      src: "assets/manual/2.webp",
      alt: "지침서 76–77쪽, 말실수 방지용 혀 보정 장치 설명",
      caption: "말실수 방지용 혀 보정 장치 · 76–77",
      imageRatio: 853.5 / 921,
      crop: "left",
    },
    {
      src: "assets/manual/2.webp",
      alt: "지침서 제6강령, 침묵지강 펼침면",
      caption: "제6강령 · 침묵지강",
      imageRatio: 853.5 / 921,
      crop: "right",
    },
  ],
};

function renderBook() {
  const { slides } = bookPublication;
  renderShell(`
    <main class="book-page">
      <section class="book-publication" aria-labelledby="book-title">
        <div class="book-gallery" aria-label="지침서 책 이미지" aria-roledescription="carousel">
          <div class="book-images">
            ${slides.map((slide, index) => `
              <button class="book-slide" type="button" data-book-slide="${index}"
                aria-label="${slide.alt}. 다음 이미지 보기" ${index ? "hidden" : ""}>
                <span class="book-image-window" data-crop="${slide.crop || "full"}"
                  style="--book-image-ratio: ${slide.imageRatio || 1.5}">
                  <img src="${versionMainImage(slide.src)}" alt="${slide.alt}"
                    ${index ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">
                </span>
              </button>`).join("")}
          </div>
          <nav class="book-controls" aria-label="책 이미지 탐색" ${slides.length < 2 ? "hidden" : ""}>
            <button class="book-previous" type="button" aria-label="이전 책 이미지">
              <img src="assets/graphics/gallery-chevron.svg" alt="" aria-hidden="true">
            </button>
            <button class="book-next" type="button" aria-label="다음 책 이미지">
              <img src="assets/graphics/gallery-chevron.svg" alt="" aria-hidden="true">
            </button>
          </nav>
        </div>
        <div class="book-caption">
          <div class="book-caption-top">
            <h1 id="book-title">${bookPublication.englishTitle}</h1>
            <p>${bookPublication.year}</p>
            <p class="book-position" aria-live="polite" aria-atomic="true"></p>
          </div>
          <p class="book-name" lang="ko">${bookPublication.title}</p>
          <div class="book-description">
            <p lang="en">${bookPublication.englishDescription}</p>
            <p lang="ko">${bookPublication.koreanDescription}</p>
          </div>
          <p class="book-image-caption"></p>
        </div>
      </section>
    </main>`);
  bindBookGallery();
}

function bindBookGallery() {
  const gallery = document.querySelector(".book-gallery");
  const slides = [...gallery.querySelectorAll(".book-slide")];
  const position = document.querySelector(".book-position");
  const caption = document.querySelector(".book-image-caption");
  let current = 0;
  let pointer = null;
  let suppressClickUntil = 0;
  if (!slides.length) return;

  const show = (index) => {
    const moveFocus = slides[current] === document.activeElement;
    current = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== current; });
    position.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    caption.textContent = bookPublication.slides[current].caption || "";
    preloadImage(slides[(current + 1) % slides.length].querySelector("img"));
    if (moveFocus) slides[current].focus({ preventScroll: true });
  };
  // 스와이프 뒤에 발생하는 터치 click이 같은 이미지를 한 번 더 넘기지 않게 합니다.
  const navigate = (direction) => {
    if (performance.now() >= suppressClickUntil) show(current + direction);
  };

  // 실제 이미지 크기로 비율을 맞춥니다. crop은 기존 두 펼침면의 미리보기에만 사용합니다.
  slides.forEach((slide) => {
    const image = slide.querySelector("img");
    const imageWindow = slide.querySelector(".book-image-window");
    const fit = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const cropWidth = imageWindow.dataset.crop === "full" ? 1 : 0.5;
      imageWindow.style.setProperty("--book-image-ratio", image.naturalWidth * cropWidth / image.naturalHeight);
    };
    image.addEventListener("load", fit);
    if (image.complete) fit();
    slide.addEventListener("click", () => navigate(1));
  });
  gallery.querySelector(".book-previous").addEventListener("click", () => navigate(-1));
  gallery.querySelector(".book-next").addEventListener("click", () => navigate(1));
  gallery.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const actions = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in actions)) return;
    event.preventDefault();
    show(actions[event.key]);
  });
  gallery.addEventListener("pointerdown", (event) => {
    pointer = event.pointerType === "touch" && event.isPrimary
      ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
  });
  gallery.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    suppressClickUntil = performance.now() + 400;
    show(current + (dx < 0 ? 1 : -1));
  });
  gallery.addEventListener("pointercancel", () => { pointer = null; });
  show(0);
}

renderBook();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
