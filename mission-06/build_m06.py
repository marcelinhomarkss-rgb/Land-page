from pathlib import Path
import hashlib
import json

root = Path(r"C:\Users\Marks\Desktop\Land-Hero-Lab")
out = root / "mission-06"
out.mkdir(exist_ok=True)

# 1. Record and verify integrity of all preserved directories
preserved_dirs = [
    "concept-a", "concept-b", "concept-b2", "concept-c",
    "concept-n1", "concept-n2", "concept-n3",
    "shared", "assets", "mission-05"
]
preserved_hashes = {}
for d in preserved_dirs:
    dp = root / d
    if dp.exists():
        for p in sorted(dp.rglob("*")):
            if p.is_file():
                preserved_hashes[str(p.relative_to(root))] = hashlib.sha256(p.read_bytes()).hexdigest()

(out / "preserved-hashes.json").write_text(json.dumps(preserved_hashes, indent=2), encoding="utf-8")

FINAL_CSS = """/* impeccable-disable overused-font */
/* Birth Hub 360° — Missão 06 · N1 Final Candidate (Neon Editorial Cinematic)
   Folha de estilo isolada no laboratório. Preserva a identidade neon oficial (#00D4FF, #FF2D9B, #FFC107, #8B7DFF),
   elimina as três placas pretas brutas do Light Mode com superfície cromática editorial em camadas,
   integra o anel 360° nas 4 cores oficiais e eleva o Centro de Comando. */
@font-face {
  font-family: Sora;
  src: url('../assets/fonts/sora-latin.woff2') format('woff2');
  font-weight: 100 800;
  font-display: swap;
}
@font-face {
  font-family: Inter;
  src: url('../assets/fonts/inter-latin.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('../assets/fonts/ibm-plex-mono-400.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('../assets/fonts/ibm-plex-mono-500.ttf') format('truetype');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('../assets/fonts/ibm-plex-mono-600.ttf') format('truetype');
  font-weight: 600;
  font-display: swap;
}

:root {
  /* Paleta Neon Oficial Obrigatória */
  --cyan: #00D4FF;
  --pink: #FF2D9B;
  --gold: #FFC107;
  --iris: #8B7DFF;
  --ok: #22C55E;

  /* Superfícies e Tipografia — Dark Mode Oficial (#0D0D0D, sem branco/preto puro nos títulos) */
  --bg: #0D0D0D;
  --bg-elevated: #141724;
  --text: #C8D0EE;
  --strong: #F2F5FF;
  --muted: #9EA8CC;
  --rule: #2A2E42;
  --rule-strong: #3E4460;
  --tick: #7880A0;
  --atmo-cyan: rgba(0, 212, 255, 0.10);
  --atmo-iris: rgba(139, 125, 255, 0.12);
  --atmo-pink: rgba(255, 45, 155, 0.06);

  /* Superfície do Centro de Comando */
  --p-bg: #10131E;
  --p-band: #151928;
  --p-border: #333954;
  --p-border-subtle: #252A40;
  --p-strong: #F2F5FF;
  --p-text: #C8D0EE;
  --p-muted: #A6B1D8;

  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-io: cubic-bezier(0.65, 0, 0.35, 1);
  color-scheme: dark;
}

html[data-theme="light"] {
  /* Superfícies e Tipografia — Light Mode Oficial (#F4F7FB, sem preto puro #000000) */
  --bg: #F4F7FB;
  --bg-elevated: #E8EEF8;
  --text: #33406A;
  --strong: #19234A;
  --muted: #4E5B85;
  --rule: #CBD3E8;
  --rule-strong: #B0BCD9;
  --tick: #58638A;
  --atmo-cyan: rgba(0, 212, 255, 0.11);
  --atmo-iris: rgba(139, 125, 255, 0.12);
  --atmo-pink: rgba(255, 45, 155, 0.06);
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html {
  scrollbar-color: var(--iris) var(--bg);
  scroll-padding-top: 24px;
}

body {
  margin: 0;
  background-color: var(--bg);
  background-image:
    radial-gradient(48vw 42vw at 82% 24%, var(--atmo-iris), transparent 68%),
    radial-gradient(38vw 34vw at 14% 20%, var(--atmo-cyan), transparent 72%),
    radial-gradient(36vw 30vw at 18% 82%, var(--atmo-pink), transparent 75%);
  background-repeat: no-repeat;
  color: var(--text);
  font: 400 16px/1.55 Inter, system-ui, sans-serif;
  font-feature-settings: "cv05", "cv11", "ss01";
  letter-spacing: -0.011em;
  overflow-x: hidden;
}

button, a {
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
  cursor: pointer;
}

a {
  color: inherit;
  text-underline-offset: 5px;
}

button:active, .primary:active {
  transform: scale(0.98);
}

:focus-visible {
  outline: 3px solid var(--iris);
  outline-offset: 4px;
}

::selection {
  background: var(--pink);
  color: #0D0D0D;
}

.skip {
  position: absolute;
  top: -100px;
  left: 20px;
  background: var(--p-bg);
  color: var(--p-strong);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--cyan);
  z-index: 30;
  text-decoration: none;
  font-weight: 600;
}

.skip:focus {
  top: 12px;
}

/* ───────── HEADER EDITORIAL ───────── */
header {
  height: 76px;
  max-width: 1700px;
  margin: 0 auto;
  padding: 0 4.2%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--rule);
  position: relative;
  z-index: 10;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  text-decoration: none;
  font: 700 18px/1.2 Sora, sans-serif;
  letter-spacing: -0.02em;
  color: var(--strong);
}

.brand img {
  display: block;
  width: 36px;
  height: 36px;
}

.brand b {
  color: var(--pink);
  font-weight: 800;
}

html[data-theme="light"] .brand b {
  color: #B81160;
}

header nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  text-decoration: none;
  font: 500 14px/1.2 Inter, sans-serif;
  color: var(--text);
  border-radius: 999px;
  transition: color 0.2s var(--ease), background-color 0.2s var(--ease);
}

.nav-link code {
  font: 600 12px/1 'IBM Plex Mono', monospace;
  color: var(--iris);
  background: rgba(139, 125, 255, 0.14);
  padding: 4px 7px;
  border-radius: 999px;
}

html[data-theme="light"] .nav-link code {
  color: #4838C2;
  background: rgba(139, 125, 255, 0.16);
}

.nav-link:hover {
  color: var(--strong);
  background: rgba(139, 125, 255, 0.08);
}

.theme {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--strong);
  background: var(--bg-elevated);
  border: 1px solid var(--rule-strong);
  border-radius: 50%;
  transition: border-color 0.2s var(--ease), transform 0.2s var(--ease);
}

.theme:hover {
  border-color: var(--iris);
}

/* ───────── HERO GRID ASSIMÉTRICO ───────── */
.hero {
  position: relative;
  max-width: 1700px;
  margin: 0 auto;
  padding: 32px 4.2% 44px;
  min-height: 760px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  column-gap: 44px;
  align-items: start;
}

/* ───────── COLUNA ESQUERDA: NEON EDITORIAL ───────── */
.editorial {
  min-width: 0;
  position: relative;
  z-index: 3;
  padding-top: 4px;
}

h1 {
  margin: 0;
  font: 800 1rem/0.96 Sora, sans-serif;
  letter-spacing: -0.04em;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  flex-wrap: nowrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  max-width: 640px;
  padding: 4px 0 10px;
  border-bottom: 1px solid rgba(200, 208, 238, 0.10);
  position: relative;
}

.row:last-child {
  border-bottom: none;
}

.r1 { --word: var(--cyan); }
.r2 { --word: var(--iris); }
.r3 { --word: var(--gold); }

.w {
  display: inline-block;
  white-space: nowrap;
  color: var(--word);
  position: relative;
  letter-spacing: -0.04em;
  line-height: 0.94;
}

/* Escala tipográfica monumental calibrada para alinhamento editorial sem quebra órfã */
.r1 .w { font-size: clamp(64px, 8.2vw, 132px); }
.r2 .w { font-size: clamp(44px, 4.9vw, 78px); }
.r3 .w {
  font-size: clamp(54px, 6.4vw, 102px);
  text-decoration: underline;
  text-decoration-color: var(--gold);
  text-decoration-thickness: 4px;
  text-underline-offset: 8px;
  text-decoration-skip-ink: auto;
}

.tag {
  font: 600 clamp(15px, 1.15vw, 18px)/1.25 Sora, sans-serif;
  letter-spacing: -0.02em;
  color: var(--word);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
}

.tag::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--word);
  flex: none;
}

/* ───────── SOLUÇÃO LIGHT MODE PRINCIPAL (N1 FINAL CANDIDATE / ALT A):
   Estúdio Editorial Cromático em Camadas (Layered Chromatic Editorial Stage).
   Substitui os três retângulos pretos brutos e desconectados da Missão 05 por uma
   única superfície arquitetônica profunda (#0C1120 → #13182B) com iluminação radial
   localizada nas 3 cores (Ciano, Íris, Dourado), filetes divisórios de precisão e
   cápsulas sutis para as tags contextuais — preservando 100% da intensidade neon oficial. ───────── */
html[data-theme="light"] .editorial:not(.alt-capsules) h1 {
  background-color: #0D1222;
  background-image:
    radial-gradient(65% 55% at 18% 16%, rgba(0, 212, 255, 0.16), transparent 68%),
    radial-gradient(65% 55% at 50% 52%, rgba(139, 125, 255, 0.16), transparent 68%),
    radial-gradient(65% 55% at 28% 88%, rgba(255, 193, 7, 0.14), transparent 68%),
    linear-gradient(155deg, #0B101E 0%, #12172A 55%, #151424 100%);
  border: 1px solid #2B3454;
  border-radius: 20px;
  padding: 16px 24px 20px;
  box-shadow:
    0 24px 48px -22px rgba(13, 18, 34, 0.38),
    0 6px 16px -8px rgba(13, 18, 34, 0.18);
  gap: 0;
  max-width: 650px;
}

html[data-theme="light"] .editorial:not(.alt-capsules) .row {
  max-width: 100%;
  padding: 8px 0 12px;
  border-bottom: 1px solid rgba(200, 208, 238, 0.12);
}

html[data-theme="light"] .editorial:not(.alt-capsules) .row:first-child {
  padding-top: 2px;
}

html[data-theme="light"] .editorial:not(.alt-capsules) .row:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

html[data-theme="light"] .editorial:not(.alt-capsules) .tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 208, 238, 0.16);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: clamp(14px, 1.05vw, 16px);
}

/* ───────── ESTUDO COMPARATIVO LIGHT MODE ALTERNATIVA B (.alt-capsules):
   Prismas Cromáticos Individualizados sob cada palavra + Tags no Papel Claro ───────── */
html[data-theme="light"] .editorial.alt-capsules h1 {
  gap: 10px;
}

html[data-theme="light"] .editorial.alt-capsules .row {
  border-bottom: none;
  padding: 0;
  align-items: center;
  justify-content: flex-start;
}

html[data-theme="light"] .editorial.alt-capsules .w {
  padding: 0.06em 0.22em 0.12em;
  border-radius: 16px;
}

html[data-theme="light"] .editorial.alt-capsules .r1 .w {
  background: linear-gradient(135deg, #091826 0%, #0D1322 100%);
  border: 1px solid rgba(0, 212, 255, 0.45);
  box-shadow: 0 12px 24px -12px rgba(9, 24, 38, 0.32);
}

html[data-theme="light"] .editorial.alt-capsules .r2 .w {
  background: linear-gradient(135deg, #13102B 0%, #0E1222 100%);
  border: 1px solid rgba(139, 125, 255, 0.48);
  box-shadow: 0 12px 24px -12px rgba(19, 16, 43, 0.32);
}

html[data-theme="light"] .editorial.alt-capsules .r3 .w {
  background: linear-gradient(135deg, #1C1609 0%, #121320 100%);
  border: 1px solid rgba(255, 193, 7, 0.48);
  box-shadow: 0 12px 24px -12px rgba(28, 22, 9, 0.32);
}

html[data-theme="light"] .editorial.alt-capsules .tag {
  color: #19234A;
  background: #E8EEF9;
  border: 1px solid #C5D0EA;
  padding: 6px 13px;
  border-radius: 999px;
  margin-left: 0;
}

/* ───────── LEAD, PROPOSTA E CTAS ───────── */
.lead {
  max-width: 50ch;
  margin: 22px 0 0;
  font-size: clamp(16px, 1.15vw, 18px);
  line-height: 1.58;
  color: var(--text);
  text-wrap: pretty;
}

.lead strong {
  color: var(--strong);
  font-weight: 700;
}

.lead .hl-role {
  color: var(--strong);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--iris);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.acts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  margin-top: 24px;
}

.primary {
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 28px;
  background: var(--pink);
  color: #0D0D0D;
  font: 700 16px/1.2 Sora, sans-serif;
  letter-spacing: -0.01em;
  text-decoration: none;
  border-radius: 999px;
  box-shadow: 0 14px 28px -14px rgba(0, 0, 0, 0.55);
  transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 32px -14px rgba(0, 0, 0, 0.7);
}

.primary svg {
  transition: transform 0.22s var(--ease);
  flex: none;
}

.primary:hover svg {
  transform: translateX(4px);
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 4px;
  font: 600 15px/1.2 Inter, sans-serif;
  color: var(--strong);
  text-decoration: none;
  background:
    linear-gradient(var(--pink), var(--pink)) no-repeat 0 calc(100% - 6px) / 0% 2px,
    linear-gradient(var(--rule-strong), var(--rule-strong)) no-repeat 0 calc(100% - 6px) / 100% 1px;
  transition: background-size 0.3s var(--ease), color 0.2s var(--ease);
}

.secondary:hover {
  background-size: 100% 2px, 100% 1px;
}

.demo-note {
  font: 400 12px/1.45 'IBM Plex Mono', monospace;
  color: var(--muted);
  max-width: 52ch;
  margin: 16px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-note::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  flex: none;
}

.demo-note:target {
  outline: 2px solid var(--iris);
  outline-offset: 6px;
  color: var(--strong);
}

/* ───────── COLUNA DIREITA: ANEL 360° INTEGRADO + CENTRO DE COMANDO ───────── */
.stagewrap {
  position: relative;
  min-width: 0;
  padding-top: 64px;
  isolation: isolate;
}

/* Anel 360° — Assinatura Visual Integrada com as 4 cores oficiais */
.orbit {
  position: absolute;
  width: 310px;
  height: 310px;
  right: -8px;
  top: -34px;
  z-index: -1;
  pointer-events: none;
}

.orbit svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.o-arc {
  fill: none;
  stroke: url(#rg);
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}

.o-inner {
  fill: none;
  stroke: var(--tick);
  stroke-width: 1;
  stroke-dasharray: 4 8;
  opacity: 0.45;
}

.o-dot {
  fill: var(--pink);
}

.o-node-cyan {
  fill: var(--cyan);
}

.o-node-gold {
  fill: var(--gold);
}

.o-lbl {
  fill: var(--strong);
  font: 600 12px 'IBM Plex Mono', monospace;
  letter-spacing: 0.18em;
}

/* Ponte de Telemetria 360° — Conecta o Anel 360° ao Centro de Comando sem colisão */
.orbit-bridge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
  padding: 7px 14px;
  border-radius: 999px;
  background: #141828;
  border: 1px solid var(--p-border);
  color: var(--p-text);
  font: 500 12px/1.2 'IBM Plex Mono', monospace;
  letter-spacing: 0.04em;
  width: fit-content;
  max-width: 100%;
  box-shadow: 0 10px 22px -12px rgba(0, 0, 0, 0.55);
}

.orbit-caption {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--cyan);
  font-weight: 600;
}

.orbit-caption::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cyan);
  flex: none;
}

.orbit-pillars {
  color: var(--p-muted);
  white-space: nowrap;
}

/* ───────── PAINEL DO PRODUTO: CENTRO DE COMANDO ELEVADO ─────────
   Hierarquia arquitetônica limpa por faixas e divisórias (sem nested-cards). */
.plate {
  position: relative;
  margin: 0;
  background: var(--p-bg);
  border: 1px solid var(--p-border);
  border-top-color: var(--cyan);
  border-radius: 16px;
  color: var(--p-text);
  box-shadow: 0 32px 60px -28px rgba(0, 0, 0, 0.78);
  overflow: hidden;
}

html[data-theme="light"] .plate {
  box-shadow:
    0 32px 60px -26px rgba(19, 25, 48, 0.42),
    0 12px 24px -12px rgba(19, 25, 48, 0.20);
}

.p-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--p-band);
  border-bottom: 1px solid var(--p-border-subtle);
}

.p-bar img {
  width: 26px;
  height: 26px;
  flex: none;
}

.p-bar-titles {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.p-bar strong {
  font: 600 15px/1.2 Sora, sans-serif;
  color: var(--p-strong);
  letter-spacing: -0.01em;
}

.p-module-tag {
  font: 500 12px/1 'IBM Plex Mono', monospace;
  color: var(--cyan);
  background: rgba(0, 212, 255, 0.12);
  padding: 4px 8px;
  border-radius: 6px;
}

.sim {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 600 12px/1 'IBM Plex Mono', monospace;
  color: var(--gold);
  background: rgba(255, 193, 7, 0.12);
  padding: 5px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: none;
}

.sim::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
}

.p-main {
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Faixa 1: Stepper do Pipeline Comercial */
.p-pipeline {
  padding: 16px 20px 18px;
  border-bottom: 1px solid var(--p-border-subtle);
}

.product-context {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font: 500 12px/1.3 'IBM Plex Mono', monospace;
  color: var(--p-muted);
  margin-bottom: 14px;
}

.product-context span:last-child {
  color: var(--cyan);
}

.track {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 0;
  margin: 0;
  list-style: none;
  font: 500 12px/1.35 'IBM Plex Mono', monospace;
  color: var(--p-muted);
  position: relative;
}

.track li {
  position: relative;
  padding-top: 20px;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.track li::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #323750;
}

.track li:last-child::before {
  width: 10px;
}

.track li::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--p-bg);
  border: 2px solid #6E789E;
  transition: transform 0.3s var(--ease), background-color 0.3s var(--ease);
}

.track li:nth-child(-n+2) {
  color: var(--p-text);
}

.track li:nth-child(-n+2)::before {
  background: linear-gradient(90deg, var(--cyan), var(--iris));
}

.track li:nth-child(-n+2)::after {
  background: var(--cyan);
  border-color: var(--cyan);
}

.track [aria-current="step"] {
  color: var(--p-strong);
  font-weight: 600;
}

.track [aria-current="step"]::after {
  background: var(--iris);
  border-color: var(--p-strong);
  transform: scale(1.18);
}

/* Faixa 2: Oportunidade Ilustrativa & Chips de Estado */
.opp-card {
  padding: 16px 20px 18px;
  border-bottom: 1px solid var(--p-border-subtle);
}

.opp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.data-label {
  font: 500 12px/1.2 'IBM Plex Mono', monospace;
  letter-spacing: 0.08em;
  color: var(--p-muted);
}

.stage-pill {
  font: 600 12px/1 'IBM Plex Mono', monospace;
  color: var(--cyan);
  background: rgba(0, 212, 255, 0.12);
  padding: 4px 9px;
  border-radius: 999px;
}

.opp h2 {
  font: 700 clamp(21px, 1.7vw, 26px)/1.2 Sora, sans-serif;
  letter-spacing: -0.03em;
  margin: 4px 0 4px;
  color: var(--cyan);
}

.opp p {
  font: 400 13px/1.45 'IBM Plex Mono', monospace;
  margin: 0;
  color: var(--p-text);
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.chips span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: 500 12px/1.2 Inter, sans-serif;
  color: var(--p-strong);
  background: var(--p-band);
  padding: 6px 11px;
  border-radius: 999px;
}

.chips span::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  flex: none;
}

.chips span:nth-child(2)::before {
  background: var(--iris);
}

.chips .pending {
  color: var(--gold);
  background: rgba(255, 193, 7, 0.12);
}

.chips .pending::before {
  background: var(--gold);
}

/* Faixa 3: Copiloto IA com Destaque Executivo */
.ia {
  padding: 16px 20px;
  background: linear-gradient(160deg, rgba(139, 125, 255, 0.14) 0%, rgba(21, 25, 40, 0.65) 75%);
  border-bottom: 1px solid var(--p-border-subtle);
}

.ia-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.ia h3 {
  margin: 0;
  font: 600 16px/1.25 Sora, sans-serif;
  color: #B4AAFF;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ia h3::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 2px;
  transform: rotate(45deg);
  background: var(--iris);
  flex: none;
}

.ia h3 span {
  font: 500 12px/1 'IBM Plex Mono', monospace;
  color: var(--p-strong);
  background: rgba(139, 125, 255, 0.22);
  padding: 4px 8px;
  border-radius: 999px;
  margin-left: 4px;
}

.ia-flow {
  font: 500 12px/1 'IBM Plex Mono', monospace;
  color: var(--cyan);
}

.ia p {
  font: 600 15px/1.45 Inter, sans-serif;
  margin: 0 0 8px;
  color: var(--p-strong);
}

.ia small {
  display: block;
  font: 400 12px/1.35 'IBM Plex Mono', monospace;
  color: var(--p-muted);
}

/* Controles de Replay e Telemetria da Demonstração */
.demo-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
}

.replay {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #4E5675;
  background: var(--p-band);
  border-radius: 8px;
  color: var(--p-strong);
  min-height: 44px;
  padding: 8px 14px;
  font: 600 12px/1.2 Inter, sans-serif;
  transition: border-color 0.2s var(--ease), background-color 0.2s var(--ease), color 0.2s var(--ease);
}

.replay:hover {
  border-color: var(--cyan);
  color: var(--cyan);
  background: rgba(0, 212, 255, 0.08);
}

.scene-status {
  font: 500 12px/1.35 'IBM Plex Mono', monospace;
  color: var(--p-muted);
  text-align: right;
}

.plate figcaption {
  padding: 10px 20px;
  font: 400 12px/1.35 'IBM Plex Mono', monospace;
  background: #0C0E17;
  border-top: 1px solid var(--p-border-subtle);
  color: var(--p-muted);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* ───────── NAVEGAÇÃO CONTEXTUAL DOS 11 MÓDULOS ───────── */
#modules {
  max-width: 1700px;
  margin: 8px auto 32px;
  padding: 12px 4.2%;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

summary {
  cursor: pointer;
  padding: 12px 0;
  color: var(--strong);
  font: 600 16px/1.3 Sora, sans-serif;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

summary::after {
  content: '8 pilares + 3 complementares';
  font: 500 12px/1 'IBM Plex Mono', monospace;
  color: var(--muted);
}

#modules p {
  max-width: 68ch;
  margin: 4px 0 16px;
  font-size: 14px;
  color: var(--text);
}

.p-rail {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.p-rail li {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--rule);
  border-radius: 10px;
  color: var(--strong);
  font-weight: 500;
  font-size: 14px;
}

.p-rail li.on {
  border-color: var(--cyan);
}

.p-rail li.has-ia {
  border-color: var(--iris);
}

.p-rail code {
  font: 600 12px/1 'IBM Plex Mono', monospace;
  color: var(--cyan);
  background: rgba(0, 212, 255, 0.12);
  padding: 4px 7px;
  border-radius: 6px;
}

html[data-theme="light"] .p-rail code {
  color: #091724;
  background: rgba(0, 212, 255, 0.22);
}

.p-rail .sep {
  display: none;
}

/* ───────── RODAPÉ DO LABORATÓRIO ───────── */
footer {
  max-width: 1700px;
  margin: 0 auto 28px;
  padding: 0 4.2%;
  display: flex;
  align-items: center;
  gap: 16px 24px;
  flex-wrap: wrap;
  font-size: 13px;
}

footer a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

.motion {
  background: var(--bg-elevated);
  color: var(--strong);
  border: 1px solid var(--rule-strong);
  padding: 10px 16px;
  min-height: 44px;
  border-radius: 8px;
  font-weight: 500;
  margin-left: auto;
}

.motion:hover {
  border-color: var(--iris);
}

/* ───────── MOTION DESIGN CINEMATOGRÁFICO COREOGRAFADO ─────────
   Apenas transform, opacity, clip-path e stroke-dashoffset.
   Zero Layout Shift (CLS = 0). Todo o conteúdo permanece 100% visível no estado base. */
.playing .r1 {
  animation: word-reveal 0.68s var(--ease) 0.02s both;
}
.playing .r2 {
  animation: word-reveal 0.68s var(--ease) 0.12s both;
}
.playing .r3 {
  animation: word-reveal 0.68s var(--ease) 0.22s both;
}
.playing .lead {
  animation: fade-rise 0.65s var(--ease) 0.28s both;
}
.playing .acts {
  animation: fade-rise 0.65s var(--ease) 0.36s both;
}
.playing .o-ticks {
  transform-box: fill-box;
  transform-origin: center;
  animation: orbit-spin-in 1.15s var(--ease) 0.08s both;
}
.playing .o-arc {
  animation: arc-draw 1.2s var(--ease-io) 0.12s both;
}
.playing .o-dotg {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: dot-travel 1.2s var(--ease) 0.15s both;
}
.playing .orbit-bridge {
  animation: fade-rise 0.6s var(--ease) 0.2s both;
}
.playing .plate {
  animation: plate-enter 0.8s var(--ease) 0.16s both;
}
.playing .track li:nth-child(-n+2)::before {
  transform-origin: left center;
  animation: bar-draw 0.7s var(--ease) 0.42s both;
}
.playing .track [aria-current="step"]::after {
  animation: node-pulse 0.75s var(--ease) 0.65s both;
}
.playing .opp-card {
  animation: context-reveal 0.65s var(--ease) 0.48s both;
}
.playing .chips span:nth-child(1) {
  animation: context-reveal 0.5s var(--ease) 0.58s both;
}
.playing .chips span:nth-child(2) {
  animation: context-reveal 0.5s var(--ease) 0.66s both;
}
.playing .chips span:nth-child(3) {
  animation: context-reveal 0.5s var(--ease) 0.74s both;
}
.playing .ia {
  animation: ia-reveal 0.75s var(--ease) 0.78s both;
}

@keyframes word-reveal {
  from {
    clip-path: inset(0 0 28% 0);
    transform: translateY(14px);
    opacity: 0.35;
  }
  to {
    clip-path: inset(0);
    transform: none;
    opacity: 1;
  }
}

@keyframes bar-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fade-rise {
  from {
    opacity: 0.25;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes orbit-spin-in {
  from {
    transform: rotate(-32deg) scale(0.95);
    opacity: 0.3;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes arc-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}

@keyframes dot-travel {
  from {
    transform: rotate(-110deg);
    opacity: 0.2;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes plate-enter {
  from {
    opacity: 0.45;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes node-pulse {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.38); }
  100% { transform: scale(1.18); }
}

@keyframes context-reveal {
  from {
    opacity: 0.25;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes ia-reveal {
  from {
    opacity: 0.2;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Respeito integral a prefers-reduced-motion e modo manual reduzido */
html.reduced *,
html.reduced *::before,
html.reduced *::after {
  animation: none !important;
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* ───────── RESPONSIVIDADE: DESKTOP LARGO (>=1600px) ───────── */
@media (min-width: 1600px) {
  .hero {
    padding-top: 48px;
    min-height: 800px;
  }
  .stagewrap {
    padding-top: 84px;
  }
}

/* ───────── RESPONSIVIDADE: TABLET (<=1100px, ex: 768x1024) ───────── */
@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 0;
    min-height: 0;
    padding-top: 26px;
  }
  .editorial {
    max-width: 720px;
  }
  .row {
    max-width: 100%;
  }
  html[data-theme="light"] .editorial:not(.alt-capsules) h1 {
    max-width: 100%;
  }
  .r1 .w { font-size: clamp(72px, 12.2vw, 104px); }
  .r2 .w { font-size: clamp(48px, 8.2vw, 68px); }
  .r3 .w { font-size: clamp(60px, 10.2vw, 88px); }
  .lead {
    max-width: 54ch;
  }
  .stagewrap {
    padding-top: 48px;
    max-width: 720px;
    width: 100%;
    margin-top: 24px;
  }
  .orbit {
    width: 240px;
    height: 240px;
    top: -36px;
    right: 6px;
  }
  .p-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ───────── RESPONSIVIDADE: MOBILE (<=599px, ex: 390x844 e 360x780)
   Composição mobile própria: todas as 3 linhas mantêm palavra + tag alinhadas sem quebrar,
   CTA principal visível na primeira tela sem rolagem e pipeline sem quebras de sílaba. ───────── */
@media (max-width: 599px) {
  header {
    height: 62px;
    padding: 0 18px;
  }
  .brand {
    font-size: 16px;
    gap: 8px;
  }
  .brand img {
    width: 30px;
    height: 30px;
  }
  header nav {
    gap: 10px;
  }
  .nav-link {
    display: none;
  }
  .hero {
    padding: 16px 18px 28px;
  }
  h1 {
    gap: 4px;
  }
  .row {
    display: flex;
    flex-wrap: nowrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 0 8px;
  }
  .r1 .w { font-size: clamp(44px, 13.8vw, 58px); }
  .r2 .w { font-size: clamp(30px, 9.2vw, 40px); }
  .r3 .w {
    font-size: clamp(36px, 11.2vw, 48px);
    text-decoration-thickness: 3px;
    text-underline-offset: 5px;
  }
  .tag {
    font-size: 12px;
    line-height: 1.2;
    gap: 5px;
  }
  html[data-theme="light"] .editorial:not(.alt-capsules) h1 {
    padding: 12px 16px 14px;
    border-radius: 16px;
  }
  html[data-theme="light"] .editorial:not(.alt-capsules) .row {
    padding: 6px 0 9px;
  }
  html[data-theme="light"] .editorial:not(.alt-capsules) .tag {
    padding: 4px 9px;
    font-size: 12px;
  }
  html[data-theme="light"] .editorial.alt-capsules .row {
    flex-wrap: wrap;
  }
  html[data-theme="light"] .editorial.alt-capsules .w {
    border-radius: 12px;
    padding: 0.05em 0.18em 0.1em;
  }
  .lead {
    font-size: 15px;
    line-height: 1.48;
    margin-top: 14px;
  }
  .acts {
    margin-top: 16px;
    gap: 8px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .primary {
    min-height: 52px;
    font-size: 15px;
    padding: 12px 20px;
    width: 100%;
  }
  .secondary {
    justify-content: center;
    min-height: 44px;
    font-size: 14px;
  }
  .demo-note {
    font-size: 12px;
    margin-top: 10px;
  }
  .stagewrap {
    margin-top: 26px;
    padding-top: 44px;
  }
  .orbit {
    width: 156px;
    height: 156px;
    right: 0;
    top: -18px;
  }
  .orbit-bridge {
    padding: 6px 12px;
    font-size: 12px;
    margin-bottom: 8px;
  }
  .orbit-pillars {
    display: none;
  }
  .p-bar {
    padding: 12px 14px;
    gap: 8px;
  }
  .p-bar strong {
    font-size: 14px;
  }
  .p-module-tag {
    display: none;
  }
  .p-pipeline,
  .opp-card,
  .ia {
    padding: 14px;
  }
  /* Pipeline em pílulas conectadas no mobile: zero quebra de palavras ao meio */
  .track {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .track li {
    padding: 5px 10px 5px 22px;
    background: var(--p-band);
    border-radius: 999px;
    font-size: 12px;
    letter-spacing: 0;
  }
  .track li::before {
    display: none;
  }
  .track li::after {
    top: 50%;
    left: 7px;
    width: 8px;
    height: 8px;
    transform: translateY(-50%);
  }
  .track [aria-current="step"] {
    background: rgba(139, 125, 255, 0.18);
  }
  .track [aria-current="step"]::after {
    transform: translateY(-50%) scale(1.1);
  }
  .opp h2 {
    font-size: 21px;
  }
  .chips {
    gap: 6px;
  }
  .chips span {
    font-size: 12px;
    padding: 5px 10px;
  }
  .ia-flow {
    display: none;
  }
  .ia p {
    font-size: 14px;
  }
  .demo-controls {
    padding: 12px 14px;
    flex-wrap: wrap;
  }
  .plate figcaption {
    padding: 10px 14px;
    font-size: 12px;
  }
  #modules {
    padding: 12px 18px;
  }
  summary::after {
    display: none;
  }
  .p-rail {
    grid-template-columns: 1fr;
  }
  footer {
    padding: 0 18px;
    gap: 10px 16px;
  }
  .motion {
    margin-left: 0;
  }
}

@media (forced-colors: active) {
  .primary, .plate, .w, .tag {
    border: 1px solid CanvasText;
  }
  .w, .tag {
    color: CanvasText;
  }
  .orbit {
    display: none;
  }
}
"""

(out / "final-candidate.css").write_text(FINAL_CSS, encoding="utf-8")

def build_html(title: str, editorial_extra_class: str = "", default_theme: str = "dark") -> str:
    ed_cls = f'editorial {editorial_extra_class}'.strip()
    return f"""<!doctype html>
<html lang="pt-BR" data-theme="{default_theme}"><head><!-- impeccable-disable overused-font --><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<script>(() => {{ const q = new URLSearchParams(location.search); const t = q.get('theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; }})();</script>
<link rel="preload" href="../../assets/fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../../assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../final-candidate.css"><script src="../final-candidate.js" defer></script></head>
<body class="n1-final"><a class="skip" href="#content">Pular para o conteúdo</a>
<header><a class="brand" href="../../index.html" aria-label="Birth Hub 360° — Central do Laboratório"><img width="36" height="36" src="../../assets/brand/birthhub360-simbolo.svg" alt=""><span>Birth Hub <b>360°</b></span></a>
<nav aria-label="Principal"><a class="nav-link" href="#modules">Módulos <code>11</code></a><button class="theme" type="button" aria-label="Ativar tema claro" aria-pressed="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg></button></nav></header>
<main id="content"><section class="hero" aria-labelledby="headline">
<div class="{ed_cls}"><h1 id="headline"><span class="row r1"><span class="w">Dados</span><span class="tag">que conectam.</span></span><span class="row r2"><span class="w">Inteligência</span><span class="tag">que decide.</span></span><span class="row r3"><span class="w">Execução</span><span class="tag">que acontece.</span></span></h1>
<p class="lead"><strong>Birth Hub 360°</strong> é o sistema operacional de <span class="hl-role">Revenue Intelligence</span>: CRM, IA e cadência de vendas integrados em uma única visão executiva.</p>
<div class="acts"><a class="primary" href="#demo-note">Agendar demonstração <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a><a class="secondary" href="#modules">Conhecer os 11 módulos</a></div>
<p class="demo-note" id="demo-note" tabindex="-1">Protótipo de homologação · agendamento indisponível neste laboratório.</p></div>
<div class="stagewrap"><div class="orbit" aria-hidden="true">
        <svg viewBox="-220 -220 440 440">
          <defs><linearGradient id="rg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#00D4FF"/><stop offset="0.34" stop-color="#8B7DFF"/><stop offset="0.68" stop-color="#FF2D9B"/><stop offset="1" stop-color="#FFC107"/></linearGradient></defs>
          <g class="o-spin">
            <g class="o-ticks"><circle r="212" fill="none" stroke="var(--tick)" stroke-width="9" stroke-dasharray="1 8.25"/><circle r="212" fill="none" stroke="var(--tick)" stroke-width="18" stroke-dasharray="1.4 109.6"/></g>
          </g>
          <circle class="o-inner" r="162"/>
          <circle class="o-arc" r="188" pathLength="1" transform="rotate(-205)"/>
          <g class="o-dotg"><circle class="o-dot" r="6.5" cx="-170.4" cy="-79.4"/><circle class="o-node-cyan" r="4.5" cx="-64.3" cy="-176.7"/><circle class="o-node-gold" r="4.5" cx="162.8" cy="-94.0"/></g>
          <text class="o-lbl" x="0" y="-134" text-anchor="middle">360°</text>
        </svg>
      </div>
<div class="orbit-bridge" aria-hidden="true"><span class="orbit-caption">VISÃO INTEGRADA · 360°</span><span class="orbit-pillars">DADOS · IA · EXECUÇÃO</span></div>
<figure class="plate" aria-label="Demonstração ilustrativa do centro de comando">
<div class="p-bar"><img src="../../assets/brand/birthhub360-icone.svg" width="26" height="26" alt=""><div class="p-bar-titles"><strong>Centro de comando</strong><span class="p-module-tag">P01 · HUB COMERCIAL</span></div><span class="sim">Simulação</span></div>
<div class="p-main">
<div class="p-pipeline"><div class="product-context"><span>Pipeline comercial · Fluxo ativo</span><span>Etapa 03/05 · Visão 360°</span></div>
<ol class="track" aria-label="Etapas do pipeline"><li>Prospecção</li><li>Qualificação</li><li aria-current="step">Proposta</li><li>Negociação</li><li>Fechamento</li></ol></div>
<div class="opp-card"><div class="opp"><div class="opp-head"><span class="data-label">OPORTUNIDADE ILUSTRATIVA</span><span class="stage-pill">ETAPA ATUAL · PROPOSTA</span></div><h2>Oportunidade #1042</h2><p>Contexto unificado · CRM, IA e cadência sincronizados na operação</p></div>
<div class="chips"><span>Reunião técnica realizada</span><span>Proposta enviada</span><span class="pending">Retorno pendente</span></div></div>
<div class="ia"><div class="ia-head"><h3>Copiloto IA <span>Próxima ação</span></h3><span class="ia-flow">P06 · Inteligência</span></div><p>Retomar contato com o CFO e propor reunião executiva de implantação.</p><small>Recomendação ilustrativa · decisão do vendedor</small></div>
<div class="demo-controls"><button class="replay" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Reproduzir sequência</button><span class="scene-status" role="status">Contexto → decisão → ação</span></div></div>
<figcaption><span>Interface ilustrativa · dados simulados</span><span>11 módulos integrados</span></figcaption></figure></div>
</section><details id="modules"><summary>Explorar os 11 módulos</summary><p>Arquitetura modular do Birth Hub 360° preservada no laboratório. Esta visualização apresenta os 8 pilares operacionais e os 3 módulos complementares sem alterar a plataforma principal.</p><ul class="p-rail">
              <li class="on"><code>P01</code>Hub Comercial</li>
              <li><code>P02</code>Inteligência de Mercado</li>
              <li><code>P03</code>Orquestração de Vendas</li>
              <li><code>P04</code>Performance Comercial</li>
              <li><code>P05</code>Previsibilidade Comercial</li>
              <li class="has-ia"><code>P06</code>Inteligência Artificial</li>
              <li><code>P07</code>Automação &amp; Conectividade</li>
              <li><code>P08</code>Engajamento Comercial</li>
              <li class="sep"></li>
              <li><code>M09</code>Admin &amp; Operations</li>
              <li><code>M10</code>Mobile &amp; Field Sales</li>
              <li><code>M11</code>Social Selling</li>
            </ul></details></main>
<footer><a href="../../index.html">Laboratório · todos os itens</a><a href="../compare.html">Missão 06 · comparação</a><a href="../../mission-05/n1/index.html">N1 Missão 05</a><a href="../../concept-n1/index.html">N1 original</a><button class="motion" type="button" aria-pressed="false">Reduzir movimento</button></footer>
</body></html>"""

d_final = out / "n1-final"
d_final.mkdir(exist_ok=True)
(d_final / "index.html").write_text(
    build_html("N1 Final Candidate · Neon Editorial Cinematic · Birth Hub 360°", "", "dark"),
    encoding="utf-8"
)

d_alt_a = out / "light-alt-a"
d_alt_a.mkdir(exist_ok=True)
(d_alt_a / "index.html").write_text(
    build_html("Light Mode Alt A (Estúdio Editorial Cromático em Camadas — Vencedora) · Birth Hub 360°", "", "light"),
    encoding="utf-8"
)

d_alt_b = out / "light-alt-b"
d_alt_b.mkdir(exist_ok=True)
(d_alt_b / "index.html").write_text(
    build_html("Light Mode Alt B (Prismas Cromáticos Individuais) · Birth Hub 360°", "alt-capsules", "light"),
    encoding="utf-8"
)
print("Updated Mission 06 CSS and HTML files.")
