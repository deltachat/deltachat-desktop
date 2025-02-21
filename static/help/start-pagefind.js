
window.addEventListener('DOMContentLoaded', async event => {
  const r = await fetch("./pagefind/locale.json");
  const translations = await r.json();
  document.title = translations.app_name + ' ' + translations.menu_help;
  new PagefindUI({
    element: '#search',
    showSubResults: true,
    excerptLength: 60,
    translations
  });
})
