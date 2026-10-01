// widgets.js – setzt die interaktiven Werkzeuge der Themen in eine Seite ein

import { WIDGETS } from '../themen/index.js';

export function montiereWidgets(wurzel) {
  wurzel.querySelectorAll('.widget[data-widget]').forEach((el) => {
    const f = WIDGETS[el.dataset.widget];
    if (!f || el.dataset.bereit) return;
    el.dataset.bereit = '1';
    try {
      f(el);
    } catch (err) {
      el.innerHTML = '<p class="w-meldung">Dieses Werkzeug konnte nicht geladen werden.</p>';
      console.error(err);
    }
  });
}
