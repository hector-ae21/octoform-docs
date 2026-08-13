const updateOctoformNavigation = () => {
  for (const sidebar of document.querySelectorAll('.md-sidebar')) {
    const primaryNavigation = sidebar.querySelector('.md-nav--primary.md-nav--lifted');
    const activeTopLevelItem = primaryNavigation?.querySelector(
      ':scope > .md-nav__list > .md-nav__item--active',
    );
    const links = [...sidebar.querySelectorAll('a.md-nav__link[href]')]
      .filter((link) => !link.closest('[hidden]'))
      .map((link) => link.href);
    const sparse = activeTopLevelItem
      ? !activeTopLevelItem.classList.contains('md-nav__item--nested')
      : new Set(links).size <= 1;
    sidebar.classList.toggle('octoform-sidebar--sparse', sparse);
  }
};

if (typeof document$ !== 'undefined') {
  document$.subscribe(updateOctoformNavigation);
} else {
  document.addEventListener('DOMContentLoaded', updateOctoformNavigation);
}
