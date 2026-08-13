const updateOctoformNavigation = () => {
  for (const sidebar of document.querySelectorAll('.md-sidebar')) {
    const links = [...sidebar.querySelectorAll('a.md-nav__link[href]')]
      .filter((link) => !link.closest('[hidden]'))
      .map((link) => link.href);
    const sparse = new Set(links).size <= 1;
    sidebar.classList.toggle('octoform-sidebar--sparse', sparse);
  }
};

if (typeof document$ !== 'undefined') {
  document$.subscribe(updateOctoformNavigation);
} else {
  document.addEventListener('DOMContentLoaded', updateOctoformNavigation);
}
