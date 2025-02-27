
window.addEventListener('DOMContentLoaded', async event => {
  const r = await fetch("../pagefind/locales.json");
  const translations = await r.json();
  const lang = document.getElementsByTagName('html')[0].getAttribute('lang')
  document.title = translations[lang].app_name + ' ' + translations[lang].menu_help;
  document.body.insertAdjacentHTML('afterbegin', '<span id="search"></span>');
  new PagefindUI({
    element: '#search',
    showSubResults: true,
    excerptLength: 60,
    translations: translations[lang],
  });
})
