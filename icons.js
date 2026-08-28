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
<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de colaborador no notebook">
  <defs>
    <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4C8DF6"/>
      <stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <circle cx="170" cy="140" r="112" fill="#E4ECFC"/>
  <g transform="translate(58,46)">
    <circle r="23" fill="#ffffff" stroke="#E5E7EB" stroke-width="1.5"/>
    <path d="M-8 0l6 6 12-12" stroke="#16A34A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g transform="translate(258,78)">
    <circle r="23" fill="#ffffff" stroke="#E5E7EB" stroke-width="1.5"/>
    <rect x="-10" y="-9" width="20" height="7" rx="2" fill="none" stroke="#2563EB" stroke-width="2"/>
    <rect x="-10" y="2" width="20" height="7" rx="2" fill="none" stroke="#2563EB" stroke-width="2"/>
  </g>
  <g transform="translate(170,238)">
    <path d="M-88 0c0-57 39-98 88-98s88 41 88 98Z" fill="url(#hoodieGrad)"/>
    <path d="M-20 -97c8 10 32 10 40 0" stroke="#1d4ed8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-62 -8c10-21 31-31 62-31s52 10 62 31" stroke="#2E6BE0" stroke-width="20" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="-146" r="35" fill="#E8B48C"/>
    <path d="M-35 -151c0-25 16-41 35-41s35 16 35 41c-10-8-21-13-35-13s-25 5-35 13Z" fill="#2b2320"/>
  </g>
  <g transform="translate(170,228)">
    <rect x="-58" y="-40" width="116" height="72" rx="7" fill="#ffffff" stroke="#D8DEE9" stroke-width="2"/>
    <rect x="-48" y="-31" width="96" height="52" rx="3" fill="#0F172A"/>
    <circle cx="0" cy="-5" r="11" fill="#2563EB"/>
    <path d="M-5 -5l3 3 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="-66" y="34" width="132" height="11" rx="4" fill="#C7D2E5"/>
  </g>
</svg>`;
