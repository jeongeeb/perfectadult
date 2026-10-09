/*
  [아카이브 페이지 구조]
  - 컬렉션 목록처럼 이미지를 나열하고, 이미지 아래에 제품 정보를 행으로 구성합니다.
  - 기존 큰 이미지 아카이브는 about.html로 이동했습니다.
*/
function archiveProjectEntry(product) {
  const projectLooks = archiveLooks.filter((look) => look.product.id === product.id);
  const mainLook = projectLooks[0];
  const mainImage = versionMainImage(mainLook ? mainLook.src : product.image);
  const productIndex = products.indexOf(product);

  return `
    <article class="archive-project" id="archive-project-${productIndex + 1}">
      <a class="archive-project-link" href="product.html?id=${product.id}" aria-label="${productDisplayName(product)} 상세페이지">
        <figure class="archive-image-wrap">
          <img class="archive-main-image" src="${mainImage}" alt="${productDisplayName(product)} archive image">
        </figure>
        <div class="archive-project-info">
          <p class="archive-project-number">${formatProductNumber(product, productIndex)}</p>
          <div class="archive-project-name">
            <h2>${productDisplayName(product)}</h2>
            <p>${product.name}</p>
          </div>
          <p class="archive-project-price">${product.price}</p>
          <p class="archive-project-summary">${product.summary}</p>
        </div>
      </a>
    </article>`;
}

function renderArchive() {
  document.body.classList.add("menus-hidden");

  const archiveProducts = products.filter((product) =>
    archiveLooks.some((look) => look.product.id === product.id),
  );
  const projects = archiveProducts
    .map((product) => archiveProjectEntry(product))
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
          <p>Worn product images and product systems arranged as a collection list.</p>
          <p>01—${String(archiveProducts.length).padStart(2, "0")}</p>
        </header>
        <div class="archive-grid-list">${projects}</div>
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
