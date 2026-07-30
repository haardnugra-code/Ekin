/**
 * Default Kemensos RI Logo (Kementerian Sosial Republik Indonesia)
 * Official Vector SVG Data URI & Component
 */

export const KEMENSOS_LOGO_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <!-- HOUSE ROOF -->
  <path d="M 140 128 L 300 24 L 460 128" stroke="#282b28" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />

  <!-- PEN / FEATHER ON THE RIGHT -->
  <g fill="#282b28">
    <!-- Pen main body -->
    <path d="M 488 50 L 522 62 L 480 242 L 460 232 Z" />
    <!-- Pen cap clip -->
    <path d="M 518 72 L 538 78 L 522 130 L 508 125 Z" />
    <!-- Pen silver bands -->
    <line x1="482" y1="120" x2="505" y2="128" stroke="#ffffff" stroke-width="4" />
    <line x1="478" y1="135" x2="500" y2="143" stroke="#ffffff" stroke-width="4" />
    <!-- Pen nib pointing down -->
    <path d="M 475 242 L 452 290 L 482 274 Z" />
    <circle cx="468" cy="268" r="2.5" fill="#ffffff" />
    <line x1="468" y1="268" x2="455" y2="286" stroke="#ffffff" stroke-width="1.5" />
  </g>

  <!-- TEXT: Sekolah Rakyat -->
  <text x="300" y="160" text-anchor="middle" fill="#282b28" font-size="70" font-weight="900" font-family="'Fredoka', 'Comic Sans MS', 'Chalkboard SE', 'Casual', cursive, sans-serif" letter-spacing="1">Sekolah</text>
  <!-- Smile curve under 'o' -->
  <path d="M 285 163 Q 300 178 315 163" fill="none" stroke="#282b28" stroke-width="5.5" stroke-linecap="round" />
  <text x="300" y="238" text-anchor="middle" fill="#282b28" font-size="70" font-weight="900" font-family="'Fredoka', 'Comic Sans MS', 'Chalkboard SE', 'Casual', cursive, sans-serif" letter-spacing="1">Rakyat</text>

  <!-- OPEN BOOK AT BOTTOM -->
  <g fill="#282b28">
    <path d="M 300 282 C 235 230 150 230 120 270 C 172 286 240 286 300 305 Z" />
    <path d="M 300 282 C 365 230 450 230 480 270 C 428 286 360 286 300 305 Z" />
    <path d="M 300 282 L 300 305" stroke="#ffffff" stroke-width="3" />
  </g>

  <!-- TAGLINE: Cerdas Bersama, Tumbuh Setara -->
  <text x="300" y="352" text-anchor="middle" fill="#282b28" font-size="27" font-weight="900" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.5">Cerdas Bersama, Tumbuh Setara</text>
</svg>`;

export const DEFAULT_KEMENSOS_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(KEMENSOS_LOGO_SVG_STRING)}`;
