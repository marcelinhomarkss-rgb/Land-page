# BIRTHUB 360° — MISSÃO 04 · Relatório dos estudos N1/N2/N3

Escopo: somente `C:\Users\Marks\Desktop\Land-Hero-Lab\`. Nenhuma integração com a landing oficial, login, plataforma, rotas ou backend. Conceitos A, B, C e B V2 preservados.

## A. Resumo executivo

Foram criados três estudos independentes a partir da estrutura editorial do B V2:

- `concept-n1/index.html` — Neon Editorial
- `concept-n2/index.html` — Neon Cinematic
- `concept-n3/index.html` — Neon Signature

O problema central do B V2 — neon oficial reduzido a detalhes — foi atacado com cor semântica e presença tipográfica/estrutural: ciano para dados/conexão, rosa para conversão/ação, íris para inteligência e dourado como assinatura/execução. A amostragem de pixels mostra que o ciano e o rosa saíram de quase zero no B V2 para presença relevante nas três propostas, especialmente no dark.

Evidências principais:

- 12 capturas obrigatórias em `shots-n/` + tablet dark/light.
- Comparativo navegável: `compare-neon.html`.
- Índice atualizado: `index.html`.
- Métricas de layout/interação: `shots-n/metrics.json`, `shots-n/interactions.json`.
- Amostragem de cor: `shots-n/pixels.json`, `shots/pixels-b2.json`, `shots-n/pixels-tablet-light.json`.
- Motion: sequências JPEG em `shots-n/*-motion-*` e filmstrips `shots-n/*-filmstrip.png`.
- Auditoria Impeccable final: `shots-n/impeccable-final.json` — exit 0, somente advisories.

## B. N1 — Neon Editorial

Preview: `http://localhost:5400/concept-n1/index.html` · Dark/Light pelo botão do topo · Captura estática: `?theme=dark|light&static=1`.

Tese executada: capa editorial com neon como tinta de precisão. Sora monumental permanece protagonista; ciano/íris/dourado/rosa aparecem em palavras, régua, rail de módulos, pipeline, status e recomendação do Copiloto IA. O anel 360° é uma assinatura orbital precisa, não uma nuvem decorativa.

Pontos fortes medidos:

- Melhor equilíbrio entre sofisticação editorial e performance.
- Desktop 1440×900: sem overflow horizontal; CTA em y≈632–690; placa do produto em y≈504–879, dentro da primeira tela.
- Mobile 390×844: CTA em y≈397–453, acima da dobra; sem overflow.
- Pixel desktop dark: ciano 2,77%, rosa 1,19%, íris 2,73% da amostra; B V2 tinha ciano 0,03% e rosa 0,09%.
- Interações: toast demonstrativo, toggle de tema, foco visível, parallax de pointer/scroll e reduced-motion verificados.

Ressalva: no light, ciano fica deliberadamente contido por contraste; a presença neon migra para rosa/íris/dourado e superfícies.

## C. N2 — Neon Cinematic

Preview: `http://localhost:5400/concept-n2/index.html`.

Tese executada: cena de Revenue Intelligence. Campos atmosféricos, halos cromáticos, anel 360° como fonte de energia, placa dimensional com iluminação controlada e revelação coreografada. É a proposta de maior impacto cinematográfico.

Pontos fortes medidos:

- Maior presença rosa no dark: desktop 5,18%, mobile 8,28% da amostra; ciano ≈3%.
- Anel com desenho progressivo, arcos e nós luminosos; placa com perspectiva/rotação e parallax mais expressivo.
- Desktop: placa do produto em y≈158–578; CTA em y≈629–687; sem overflow.
- Mobile: CTA em y≈397–453; sem overflow.

Ressalvas: maior custo visual/perceptual — mais sombras coloridas, filtros e camadas; detector mantém advisories de ilustração SVG e grid decorativo; é a mais dependente de motion para entregar a tese.

## D. N3 — Neon Signature

Preview: `http://localhost:5400/concept-n3/index.html`.

Tese executada: assinatura gráfica autoral. Grid assimétrico, campos de cor, marca 360° integrada ao miolo do Hero e nós semânticos ligando dados/inteligência/execução. É a interpretação mais diferenciada de um hero SaaS.

Pontos fortes medidos:

- Melhor identidade de marca e originalidade na matriz.
- Assinatura usa os quatro neon com papéis distintos; mobile dark: ciano 2,61%, rosa 5,31%, íris 3,14%.
- Produto continua protagonista: placa em y≈331–680 no desktop; CTA em y≈708–766, ainda dentro de 900 px.
- Mobile: CTA em y≈427–483; sem overflow.

Ressalvas: composição mais arriscada; CTA desktop mais baixo que N1/N2; microcopy técnica menor exige atenção em acessibilidade; depende de boa execução para não parecer poster experimental.

## E. Comparação com B V2

O que mudou de fato:

- Neon: B V2 tinha ciano/rosa quase ausentes na amostragem; N1/N2/N3 restauram presença reconhecível sem virar fundo neon genérico.
- Tipografia: os títulos deixaram de depender de branco quase puro e passaram a carregar cor semântica por palavra.
- Produto: a placa ampliou hierarquia — rail dos 11 módulos, pipeline, oportunidade ilustrativa, chips de estado e recomendação do Copiloto IA — sempre marcada como simulação.
- Motion: B V2 já tinha base; os estudos adicionam entrada orquestrada, desenho/rotação do anel, revelação da placa, parallax pointer/scroll e estados reduced-motion.
- Mobile: CTA principal permanece acima da dobra; mobile deixou de ser só redução do desktop, com composição empilhada própria.

Continua igual: mensagem institucional preservada; CTAs demonstrativos; nenhum dado comercial inventado; conceitos anteriores intactos.

## F. Auditoria Impeccable

Ferramenta: Impeccable instalada no laboratório, versão reportada 4.8.2. Fluxo usado: `context`, `concept-seed`, `surface-brief` e `detect --json`. Contexto de produto registrado em `PRODUCT.md`; briefs em `.impeccable/surfaces/`.

Auditoria final executada após as últimas edições de UI:

- Comando: `impeccable detect --json concept-n1/index.html concept-n2/index.html concept-n3/index.html index.html compare-neon.html`
- Resultado: exit 0.
- Findings restantes: 5 advisories, nenhum warning primário.
  - `nested-cards` em N1/N2/N3 — superfícies do painel simulado; mantido como advisory porque a demonstração de produto precisa de agrupamento visual.
  - `shape-assembled-illustration` e `codex-grid-background` em N2 — ilustração SVG/grid intencionais da tese cinematográfica; advisory, não falha.
- Waivers inline documentados: `dark-glow` e `overused-font` foram desligados por arquivo porque o brief exige identidade neon oficial e a tipografia de marca usa Sora/Inter/IBM Plex Mono. Não foi usado para esconder warnings de layout/acessibilidade.

## G. Testes de animação

Implementado e verificado em navegador real via CDP:

- Entrada: stagger de palavras, lead, CTAs, header e placa.
- Anel 360°: desenho/rotação/orbit conforme a linguagem de cada proposta.
- Produto: pipeline, estados, chips e card de IA entram em sequência.
- Microinterações: hover/focus dos CTAs, toggle de tema, toast demonstrativo.
- Parallax: `--px` variou de `0` para `0.320`; `--sp` para `0.667`–`0.690` após scroll/pointer em N1/N2/N3.
- Reduced motion: com `prefers-reduced-motion`, `html.rm` foi aplicado e `document.getAnimations()` retornou 0 nas três propostas.
- Evidência de movimento: `shots-n/n1-motion-desktop-dark/` (103 frames), `n1-motion-mobile-dark` (145), `n2-motion-desktop-dark` (60), `n2-motion-mobile-dark` (222), `n3-motion-desktop-dark` (127), `n3-motion-mobile-dark` (296), mais filmstrips PNG.

Limitação honesta: não havia encoder GIF/WebP disponível no ambiente; a evidência de motion é por sequências de frames JPEG + filmstrips navegáveis em `compare-neon.html`.

## H. Responsividade

Métricas executadas (`shots-n/metrics.json`, `shots-n/interactions.json`):

- Desktop 1440×900: `overflowX=false` nas três propostas e temas.
- Mobile 390×844: `overflowX=false`; CTA principal totalmente acima da dobra em todos os casos.
- Tablet 768×1024: capturas dark via CDP e light via headless Chrome; métricas dark sem overflow e CTA dentro da viewport.
- Placas de produto desktop dentro da primeira tela: N1 bottom≈879, N2 bottom≈578, N3 bottom≈680.
- Fontes: Sora e Inter carregadas; IBM Plex Mono com faces carregadas na pilha de dados.

Observação: N3 coloca o CTA mais abaixo no desktop por causa da assinatura; continua visível sem rolagem, mas é o ponto a observar na avaliação.

## I. Matriz comparativa

Notas de 0 a 10. B V2 entra como referência do problema anterior.

| Critério | B V2 | N1 | N2 | N3 |
|---|---:|---:|---:|---:|
| Presença das cores neon | 4 | 8 | 9 | 9 |
| Identidade Birthub 360° | 7 | 9 | 9 | 10 |
| Originalidade | 7 | 8 | 8 | 10 |
| Impacto visual | 6 | 8 | 10 | 9 |
| Sofisticação | 8 | 9 | 8 | 8 |
| Qualidade tipográfica | 8 | 9 | 8 | 8 |
| Coerência composicional | 8 | 9 | 8 | 8 |
| Presença do produto | 7 | 8 | 9 | 8 |
| Clareza comercial | 8 | 9 | 8 | 8 |
| Cinematografia | 5 | 7 | 10 | 8 |
| Responsividade | 8 | 9 | 8 | 8 |
| Acessibilidade | 8 | 8 | 7 | 7 |
| Performance | 8 | 9 | 7 | 8 |
| Potencial para orientar a landing | 7 | 9 | 8 | 9 |

Leitura da matriz: N1 é o equilíbrio mais seguro; N2 maximiza impacto/cinematografia com custo de performance/acessibilidade; N3 maximiza identidade/autoria com maior risco composicional.

## J. Parecer criativo

Sem escolher vencedor: se o critério for homologar uma direção que preserve editorial, neon e performance com menor risco, N1 é a leitura mais controlada. Se a prioridade for o momento "uau" cinematográfico e a landing puder sustentar motion mais rico, N2 entrega a experiência mais memorável. Se a prioridade for uma assinatura impossível de confundir com SaaS genérico, N3 é a mais autoral.

Minha recomendação de avaliação: comparar primeiro N1 × N3 no desktop dark/light; usar N2 como referência de teto cinematográfico e fonte de motion para o vencedor.

## K. Problemas remanescentes

- Dourado continua discreto na amostragem de pixels; é intencional como assinatura/execução, mas pode precisar de um marcador mais frequente se a marca quiser ouro mais presente.
- Light mode: ciano fica contido por contraste em N1/N3; verificar se a marca aceita rosa/íris como principais portadores no claro.
- N2 concentra advisories de ilustração/grid e é a mais pesada em sombras/filtros.
- N3 usa microcopy técnica pequena; revisar tamanhos mínimos antes de produção.
- O painel do produto é simulação ilustrativa; nenhuma tela real dos 11 módulos foi capturada.
- Motion foi evidenciado por frames/filmstrips, não por vídeo contínuo.
- Tablet light foi capturado como still adicional; as métricas de tablet completas são dark.

## L. Confirmação de isolamento

Arquivos criados/editados somente dentro do laboratório:

- `concept-n1/index.html`, `concept-n2/index.html`, `concept-n3/index.html`
- `index.html`, `compare-neon.html`
- `shared/theme.js` — apenas correção de encoding do toast demonstrativo (`laboratório/ação/página`)
- `shots-n/*` — capturas, métricas, filmstrips, scripts de captura/análise e este relatório
- `PRODUCT.md`, `.impeccable/surfaces/*`

Não houve modificação em `C:\Users\Marks\Desktop\Land\`, login, plataforma, rotas, backend ou assets oficiais. Não houve commit, merge, push ou deploy. Conceitos A, B, C e B V2 permanecem preservados como referência.
