import { initAuth } from './auth.js';

window.initLegacyApp = function() {
  // Aquí podríamos cargar app.js dinámicamente si quisiéramos, pero por ahora asumiremos que está cargado.
  // Ya que app.js tiene side-effects, es mejor dejar que se cargue de forma clásica después de api.js.
  // En app.js original, llama a loadData() en el scope global.
  if (typeof window.loadData === 'function') {
    window.loadData();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
