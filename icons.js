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
  moon: svg('<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>'),
  logout: svg('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 12h10M17 9l3 3-3 3"/>'),
  edit: svg('<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M13.5 6.5l3 3"/>'),
  trash: svg('<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>'),
  userPlus: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><path d="M18 8v6M15 11h6"/>'),
  briefcase: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>'),
  forward: svg('<path d="M4 6v12M9 12h11M15 7l5 5-5 5"/>'),
  building: svg('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>'),
};

const ILLUSTRATION = `
<svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de colaborador no notebook">
  <defs>
    <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#FDA94D"/>
      <stop offset="1" stop-color="#EA580C"/>
    </linearGradient>
    <linearGradient id="sleeveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FB923C"/>
      <stop offset="1" stop-color="#F97316"/>
    </linearGradient>
  </defs>

  <!-- fundo -->
  <circle cx="198" cy="112" r="104" fill="#EBEFF8"/>
  <path d="M150 20 A96 96 0 0 1 294 92" stroke="#DCE3F0" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>
  <ellipse cx="172" cy="224" rx="128" ry="10" fill="#D6DCEA" opacity="0.5"/>
  <rect x="24" y="214" width="296" height="9" rx="4.5" fill="#DBE1EE"/>

  <!-- planta -->
  <g transform="translate(272,190)">
    <path d="M6 34 L34 34 L30 12 L10 12 Z" fill="#E08A5C"/>
    <rect x="4" y="6" width="32" height="9" rx="3.5" fill="#EE9E74"/>
    <path d="M20 10 C10 -16 -6 -14 4 8 Z" fill="#3FAE8D"/>
    <path d="M20 10 C30 -18 46 -14 36 8 Z" fill="#57C29E"/>
    <path d="M20 12 C18 -20 22 -22 22 12 Z" fill="#2F9678"/>
  </g>

  <!-- selo: check (verde) -->
  <g transform="translate(52,70)">
    <rect x="-20" y="-20" width="40" height="40" rx="12" fill="#ffffff"/>
    <circle r="12" fill="#E8F6EE"/>
    <path d="M-6 0.5 -1.5 5 8 -6" stroke="#22A05A" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- selo: scan (azul) -->
  <g transform="translate(258,58)">
    <rect x="-20" y="-20" width="40" height="40" rx="12" fill="#ffffff"/>
    <path d="M-11 -6 v-3 a2 2 0 0 1 2 -2 h3 M6 -11 h3 a2 2 0 0 1 2 2 v3 M11 6 v3 a2 2 0 0 1 -2 2 h-3 M-6 11 h-3 a2 2 0 0 1 -2 -2 v-3" stroke="#2563EB" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <rect x="-9" y="-1.6" width="18" height="3.2" rx="1.6" fill="#2563EB"/>
  </g>

  <!-- selo: chat sorriso (turquesa) -->
  <g transform="translate(292,124)">
    <rect x="-20" y="-20" width="40" height="40" rx="12" fill="#ffffff"/>
    <path d="M-12 -3 a12 10 0 1 1 5 8 l-6 2 1.6 -6 A10 9 0 0 1 -12 -3 Z" fill="#12B5A8"/>
    <circle cx="-3" cy="-2" r="1.6" fill="#fff"/>
    <circle cx="4" cy="-2" r="1.6" fill="#fff"/>
    <path d="M-4 3 c2.5 3 6.5 3 9 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>

  <!-- braço de trás (apoiado) -->
  <path d="M150 168 C120 176 96 190 92 206" stroke="url(#sleeveGrad)" stroke-width="21" fill="none" stroke-linecap="round"/>

  <!-- moletom / corpo -->
  <path d="M96 224 C92 176 116 148 150 148 C184 148 208 176 204 224 Z" fill="url(#hoodieGrad)"/>
  <!-- capuz atrás do pescoço -->
  <path d="M130 152 C138 168 162 168 170 152 C166 142 134 142 130 152 Z" fill="#C2410C"/>
  <!-- cordões -->
  <path d="M147 158 L145 178 M156 158 L158 178" stroke="#FBE7D3" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <!-- logo sea -->
  <circle cx="150" cy="192" r="7" fill="#ffffff" opacity="0.95"/>
  <text x="163" y="196" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="11" font-weight="800" fill="#ffffff" opacity="0.95">sea</text>

  <!-- pescoço -->
  <rect x="140" y="120" width="20" height="24" rx="8" fill="#E7A97F"/>

  <!-- cabeça -->
  <path d="M126 96 C126 74 136 62 152 62 C170 62 180 78 178 98 C177 114 166 124 152 124 C137 124 126 112 126 96 Z" fill="#F1C098"/>
  <!-- orelha -->
  <circle cx="129" cy="100" r="5" fill="#E7A97F"/>
  <!-- cabelo -->
  <path d="M124 100 C118 66 140 50 158 54 C176 58 182 76 178 92 C176 82 170 74 160 72 C150 88 134 84 130 104 C127 103 125 102 124 100 Z" fill="#233B5E"/>
  <path d="M158 54 C150 55 143 60 140 70 C149 63 158 63 165 68 C163 60 161 56 158 54 Z" fill="#2E4A73"/>
  <!-- rosto (3/4 virado à direita) -->
  <path d="M160 84 c3 -1 6 -1 8 1" stroke="#233B5E" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="165" cy="92" r="2.6" fill="#2A2622"/>
  <path d="M174 96 c2 3 2 5 -1 6" stroke="#DDA079" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M160 108 c4 3 9 3 12 -0.5" stroke="#C6795A" stroke-width="2.4" fill="none" stroke-linecap="round"/>

  <!-- notebook (frente) -->
  <g transform="translate(118,204)">
    <path d="M-44 22 L44 22 L52 32 L-52 32 Z" fill="#33415F"/>
    <rect x="-40" y="-22" width="80" height="46" rx="6" fill="#28344E"/>
    <rect x="-33" y="-15" width="66" height="34" rx="3" fill="#1B2740"/>
    <circle cx="0" cy="2" r="8.5" fill="#2563EB"/>
    <path d="M-4 2 -1 5 5.5 -3.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- braço da frente sobre o notebook -->
  <path d="M176 172 C186 190 176 206 150 210" stroke="url(#sleeveGrad)" stroke-width="20" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="210" r="8" fill="#F1C098"/>
</svg>`;
