(function () {
  const buttons = Array.from(document.querySelectorAll('.source-button'));
  const frame = document.getElementById('community-frame');
  const currentSourceName = document.getElementById('current-source-name');
  const openSourceLink = document.getElementById('open-source-link');

  function activate(button) {
    buttons.forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');

    const url = button.dataset.url;
    const name = button.dataset.name || button.textContent.trim();

    if (url) {
      frame.src = url;
      openSourceLink.href = url;
    }

    currentSourceName.textContent = name;
    openSourceLink.setAttribute('aria-label', `${name} 새 창에서 열기`);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => activate(button));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(button);
      }
    });
  });
})();
