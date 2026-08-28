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
  upload: svg('<path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><path d="M12 15V3M7 8l5-5 5 5"/>'),
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

  <!-- selo: sorriso na lupa (azul) -->
  <g transform="translate(292,124)">
    <rect x="-20" y="-20" width="40" height="40" rx="12" fill="#ffffff"/>
    <path d="M-4 12 l6 8 4 -4 z" fill="#ffffff"/>
    <circle cx="-2" cy="-2" r="10" fill="none" stroke="#2563EB" stroke-width="2.6"/>
    <circle cx="-5" cy="-4" r="1.5" fill="#2563EB"/>
    <circle cx="1" cy="-4" r="1.5" fill="#2563EB"/>
    <path d="M-6 1 c2.5 3 6 3 8 0" stroke="#2563EB" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M6 6 l7 7" stroke="#2563EB" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  </g>

  <!-- braço de trás (manga curta) -->
  <path d="M150 172 C120 176 100 190 96 206" stroke="url(#sleeveGrad)" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M120 200 C110 204 102 210 100 214" stroke="#F1C098" stroke-width="15" fill="none" stroke-linecap="round"/>

  <!-- pescoço -->
  <rect x="156" y="118" width="20" height="26" rx="9" fill="#E7A97F"/>

  <!-- camisa polo / corpo -->
  <path d="M96 224 C94 178 120 152 166 152 C212 152 238 178 236 224 Z" fill="url(#hoodieGrad)"/>
  <!-- ombros / mangas -->
  <path d="M120 160 C112 166 106 178 104 190 L128 184 Z" fill="#F2933B"/>
  <path d="M212 160 C220 166 226 178 228 190 L204 184 Z" fill="#F2933B"/>
  <!-- gola em V -->
  <path d="M150 154 L166 178 L182 154 Z" fill="#E7A97F"/>
  <path d="M148 153 L166 176 L156 158 Z" fill="#F2933B"/>
  <path d="M184 153 L166 176 L176 158 Z" fill="#F2933B"/>
  <!-- carcela e botões -->
  <path d="M163 176 L163 198 M169 176 L169 198" stroke="#D65F13" stroke-width="1.6" fill="none"/>
  <circle cx="166" cy="184" r="1.6" fill="#D65F13"/>
  <circle cx="166" cy="193" r="1.6" fill="#D65F13"/>
  <!-- logo COP -->
  <text x="182" y="192" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff">COP</text>
  <path d="M182 196 H208" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>

  <!-- cabeça -->
  <path d="M140 94 C140 72 150 60 166 60 C182 60 192 74 192 94 C192 112 181 122 166 122 C151 122 140 112 140 94 Z" fill="#F1C098"/>
  <!-- orelha -->
  <circle cx="191" cy="98" r="5" fill="#E7A97F"/>
  <!-- cabelo (topete volumoso) -->
  <path d="M138 96 C132 60 156 44 178 52 C196 59 198 78 194 92 C190 80 182 74 172 74 C176 66 172 60 166 60 C156 60 150 70 148 82 C146 76 142 76 140 84 C138 88 137 92 138 96 Z" fill="#20304F"/>
  <path d="M150 58 C160 52 172 54 180 62 C170 58 160 60 154 66 Z" fill="#2C4166"/>
  <!-- sobrancelhas -->
  <path d="M150 86 c3 -2 8 -2 11 0" stroke="#20304F" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M172 86 c3 -2 7 -2 10 0" stroke="#20304F" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <!-- olhos -->
  <circle cx="156" cy="94" r="2.8" fill="#2A2622"/>
  <circle cx="177" cy="94" r="2.8" fill="#2A2622"/>
  <!-- nariz -->
  <path d="M167 98 c2 4 2 6 -2 7" stroke="#DDA079" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- sorriso -->
  <path d="M158 110 c5 4 13 4 18 -0.5" stroke="#C6795A" stroke-width="2.6" fill="none" stroke-linecap="round"/>

  <!-- notebook (frente) -->
  <g transform="translate(120,206)">
    <path d="M-46 20 L46 20 L54 32 L-54 32 Z" fill="#3A4763"/>
    <rect x="-42" y="-24" width="84" height="48" rx="6" fill="#2A374F"/>
    <rect x="-35" y="-17" width="70" height="36" rx="3" fill="#1C2942"/>
    <circle cx="0" cy="1" r="7.5" fill="#C7D0E0"/>
  </g>

  <!-- braço da frente sobre o notebook -->
  <path d="M186 176 C198 194 184 210 156 212" stroke="url(#sleeveGrad)" stroke-width="21" fill="none" stroke-linecap="round"/>
  <path d="M172 206 C164 210 158 212 152 213" stroke="#F1C098" stroke-width="15" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="212" r="8" fill="#F1C098"/>
</svg>`;
