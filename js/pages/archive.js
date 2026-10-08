/*
  [아카이브 페이지 구조]
  - Contemporary Art Daily처럼 대표 이미지, 하단 설명, 우측 세로 이미지 열로 구성합니다.
  - 기존 큰 이미지 아카이브는 about.html로 이동했습니다.
*/
function archiveProjectEntry(product, projectIndex) {
  const projectLooks = archiveLooks.filter((look) => look.product.id === product.id);
  const mainLook = projectLooks[0];
  const mainImage = versionMainImage(mainLook ? mainLook.src : product.image);
  const sideImages = [
    ...projectLooks.slice(1).map((look) => ({
      src: versionMainImage(look.src),
      alt: `${productDisplayName(product)} worn view`,
    })),
    {
      src: versionMainImage(product.image),
      alt: `${productDisplayName(product)} product image`,
    },
  ];
  const productIndex = products.indexOf(product);
  const sideMarkup = sideImages
    .map(
      (image) => `
        <a class="archive-side-image-link" href="product.html?id=${product.id}" aria-label="${image.alt} 상세페이지">
          <img class="archive-side-image" src="${image.src}" alt="${image.alt}">
        </a>`,
    )
    .join("");

  return `
    <article class="archive-project" id="archive-project-${productIndex + 1}">
      <div class="archive-project-main">
        <a class="archive-main-image-link" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 상세페이지">
          <img class="archive-main-image" src="${mainImage}" alt="${productDisplayName(product)} archive image">
        </a>
        <div class="archive-project-caption">
          <p class="archive-project-number">${formatProductNumber(product, productIndex)}</p>
          <div class="archive-project-title">
            <h2>${productDisplayName(product)}</h2>
            <p>${product.name}</p>
          </div>
          <p class="archive-project-price">${product.price}</p>
          <p class="archive-project-summary">${product.summary}</p>
        </div>
      </div>
      <aside class="archive-project-side" aria-label="${productDisplayName(product)} related images">
        ${sideMarkup}
      </aside>
    </article>`;
}

function renderArchive() {
  document.body.classList.add("menus-hidden");

  const archiveProducts = products.filter((product) =>
    archiveLooks.some((look) => look.product.id === product.id),
  );
  const projects = archiveProducts
    .map((product, index) => archiveProjectEntry(product, index))
    .join("");
  const navItems = archiveProducts
    .map((product) => {
      const productIndex = products.indexOf(product);
      return `<a href="#archive-project-${productIndex + 1}">${formatProductNumber(product, productIndex)} ${productDisplayName(product)}</a>`;
    })
    .join("");

  renderShell(`
    <main class="archive-page">
      <aside class="archive-filter" aria-label="Archive filters">
        <nav class="archive-section-nav">
          ${navItems}
        </nav>
      </aside>
      <section class="archive-index" aria-labelledby="archive-title">
        <header class="archive-index-header">
          <h1 id="archive-title">Perfect Adult Product Archive</h1>
          <p>Worn product images and product systems arranged as an exhibition index.</p>
          <p>01—${String(archiveProducts.length).padStart(2, "0")}</p>
        </header>
        <div class="archive-projects">${projects}</div>
      </section>
    </main>`);

  bindArchiveSideNav();
}

function bindArchiveSideNav() {
  const links = [...document.querySelectorAll(".archive-section-nav a")];
  if (!links.length) return;

  const targets = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  const setActive = (activeLink) => {
    links.forEach((link) => link.classList.toggle("is-active", link === activeLink));
  };

  links.forEach((link) => link.addEventListener("click", () => setActive(link)));

  if (!("IntersectionObserver" in window)) {
    setActive(links[0]);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleEntry) return;

      const matched = targets.find((item) => item.target === visibleEntry.target);
      if (matched) setActive(matched.link);
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0, 0.2, 0.6, 1],
    },
  );

  targets.forEach(({ target }) => observer.observe(target));
  setActive(links[0]);
}


renderArchive();
fitToMonitor();
bindMenuToggle();
window.addEventListener("resize", fitToMonitor);
