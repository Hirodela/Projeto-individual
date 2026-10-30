const filterButtons = document.querySelectorAll(".filter-button");
const cards = document.querySelectorAll(".publication-card");
const searchInput = document.querySelector("#search-posts");
const noResults = document.querySelector("#no-results");
let activeCategory = "Todas";

function filterPublications() {
  const term = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category || "";
    const title = card.dataset.title || "";
    const text = card.textContent || "";
    const matchesCategory = activeCategory === "Todas" || category === activeCategory;
    const matchesSearch = `${title} ${text}`.toLocaleLowerCase("pt-BR").includes(term);
    const visible = matchesCategory && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (noResults) noResults.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter || "Todas";
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    filterPublications();
  });
});

searchInput?.addEventListener("input", filterPublications);
