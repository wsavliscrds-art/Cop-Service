/* ============================================================
   Ícones em SVG inline (estilo linha, 24x24) e ilustração do hero.
   ============================================================ */

function svg(inner) {
  return `<svg class="ico-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const ICO = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  grid: svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
  bell: svg('<path d="M6 9a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 14V9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>'),
  chevronDown: svg('<path d="M6 9l6 6 6-6"/>'),
  chevronRight: svg('<path d="M9 6l6 6-6 6"/>'),
  collapse: svg('<path d="M15 6l-6 6 6 6"/>'),
  home: svg('<path d="M4 11 12 4l8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>'),
  inbox: svg('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 13h4l1.5 2h5L16 13h4"/>'),
  checkCircle: svg('<circle cx="12" cy="12" r="8"/><path d="M9 12.5 11 14.5 15.5 9.5"/>'),
  eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  device: svg('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>'),
  laptop: svg('<rect x="4" y="5" width="16" height="10" rx="1.5"/><path d="M2 19h20l-2-4H4l-2 4Z"/>'),
  key: svg('<circle cx="8" cy="15" r="4"/><path d="M11 12 20 3"/><path d="M16 8l2 2"/><path d="M19 5l2 2"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 2.5 15.5 0 18"/><path d="M12 3c-2.5 2.5-2.5 15.5 0 18"/>'),
  cloud: svg('<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 12.1 4 4 0 0 0 7 18Z"/>'),
  server: svg('<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r="1" fill="currentColor" stroke="none"/>'),
  users: svg('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14a5 5 0 0 1 5.5 5"/>'),
  shield: svg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  ticket: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10a2 2 0 0 0 0 4M21 10a2 2 0 0 1 0 4"/>'),
};

const ILLUSTRATION = `
<svg viewBox="0 0 320 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de colaborador no notebook">
  <defs>
    <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0" stop-color="#5B97F7"/>
      <stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="sleeveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5B97F7"/>
      <stop offset="1" stop-color="#2957D6"/>
    </linearGradient>
  </defs>

  <circle cx="168" cy="150" r="120" fill="#E4ECFC"/>

  <g transform="translate(54,54)">
    <circle r="24" fill="#ffffff" stroke="#E7EAF3" stroke-width="1.5"/>
    <path d="M-9 0.5 -2.5 7 11 -8" stroke="#16A34A" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g transform="translate(266,86)">
    <circle r="24" fill="#ffffff" stroke="#E7EAF3" stroke-width="1.5"/>
    <rect x="-11" y="-10" width="22" height="8" rx="2.5" fill="none" stroke="#2563EB" stroke-width="2.2"/>
    <rect x="-11" y="2" width="22" height="8" rx="2.5" fill="none" stroke="#2563EB" stroke-width="2.2"/>
    <circle cx="-6" cy="-6" r="1.3" fill="#2563EB"/>
    <circle cx="-6" cy="6" r="1.3" fill="#2563EB"/>
  </g>

  <ellipse cx="168" cy="258" rx="98" ry="8" fill="#C7D2E5" opacity="0.45"/>

  <!-- corpo / moletom -->
  <path d="M84 280c-4-64 33-106 84-106s88 42 84 106Z" fill="url(#hoodieGrad)"/>
  <path d="M147 178c7 9 27 9 34 0" stroke="#1B4FCB" stroke-width="4" fill="none" stroke-linecap="round"/>

  <!-- braços apoiados no teclado -->
  <path d="M104 246c9-25 30-38 64-38s55 13 64 38" stroke="url(#sleeveGrad)" stroke-width="23" fill="none" stroke-linecap="round"/>

  <!-- cabeça -->
  <circle cx="168" cy="128" r="37" fill="#EDBB92"/>
  <circle cx="133" cy="130" r="5" fill="#EDBB92"/>
  <circle cx="203" cy="130" r="5" fill="#EDBB92"/>

  <!-- cabelo -->
  <path d="M130 124c-2-28 17-47 38-47s40 19 38 47c-8-12-22-19-38-19s-30 7-38 19Z" fill="#2A211C"/>

  <!-- rosto -->
  <circle cx="155" cy="130" r="2.6" fill="#2A211C"/>
  <circle cx="181" cy="130" r="2.6" fill="#2A211C"/>
  <path d="M157 144c5 5 15 5 20 0" stroke="#B9835C" stroke-width="2.4" fill="none" stroke-linecap="round"/>

  <!-- notebook -->
  <g transform="translate(168,204)">
    <rect x="-54" y="-42" width="108" height="68" rx="6" fill="#0F172A"/>
    <rect x="-45" y="-33" width="90" height="50" rx="3" fill="#182A4D"/>
    <circle cx="0" cy="-8" r="10" fill="#2563EB"/>
    <path d="M-5 -8 -1.5 -4.5 6 -12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <rect x="110" y="228" width="116" height="15" rx="5" fill="#D7DEEA"/>
</svg>`;
