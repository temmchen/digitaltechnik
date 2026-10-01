// drucken.js – druckt genau ein Blatt: Inhalt kommt auf eine eigene „Bühne“, alles andere wird ausgeblendet

export function drucke(html, titel = document.title) {
  let buehne = document.getElementById('druckbuehne');
  if (!buehne) {
    buehne = document.createElement('div');
    buehne.id = 'druckbuehne';
    document.body.appendChild(buehne);
  }
  buehne.innerHTML = html;
  document.body.classList.add('druckt');
  const alterTitel = document.title;
  document.title = titel; // wird beim Sichern als PDF zum Dateinamen
  const fertig = () => {
    document.body.classList.remove('druckt');
    buehne.innerHTML = '';
    document.title = alterTitel;
    window.removeEventListener('afterprint', fertig);
  };
  window.addEventListener('afterprint', fertig);
  window.print();
}
