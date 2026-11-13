# MISSÃO 05 · Relatório de Refinamento — N1/N2/N3

Escopo: somente `C:\Users\Marks\Desktop\Land-Hero-Lab\`. Sem commits, push ou deploy; a versão publicada no GitHub Pages permanece como referência intacta.

## Arquitetura do refinamento

- `build.py` gera três páginas independentes (`n1/`, `n2/`, `n3/`) reutilizando o SVG do anel e o rail dos 11 módulos extraídos dos originais preservados.
- `refined.css`: folha única e isolada — não acumula correções sobre os conceitos anteriores.
- `experience.js`: tema, movimento reduzido, replay de sequência e telemetria (`#qa-evidence`: CLS, long tasks, LCP).
- Originais verificados por hash: 19 arquivos em `concept-a/b/b2/c/n1/n2/n3`, `shared/` e `assets/` — **0 alterados** (`original-hashes.json`).

## Problemas endereçados

| Problema | Solução aplicada |
|---|---|
| "Execução" quase branca/preta | Papéis cromáticos distintos por proposta: N1 dourado oficial; N2 rosa; N3 rosa com sublinhado dourado. No Light, `.row` recebe placa escura local (`#0D0D0D`) para manter os neons oficiais legíveis. |
| Redundância título × frase | Cada `.row` agora carrega a palavra-chave + tag contextual ("que conectam.", "que decide.", "que acontece.") — a frase institucional está semanticamente dentro do próprio H1, sem parágrafo repetido. |
| Sobreposição N2 | Grid de duas colunas com `perspective` no stage; título e painel em áreas separadas. Métricas: `collision=false` nos 18 cenários. |
| Painel denso | Prioriza pipeline (5 etapas), oportunidade ilustrativa, chips de estado e Copiloto IA. Os 11 módulos saíram do hero para `<details id="modules">` — sob demanda, sem miniaturizar a plataforma. |
| Motion não verificado | Entrada finita orquestrada (`.playing`), replay manual, `prefers-reduced-motion` e `?motion=reduce`. Evidência real: screencast com 55–83 frames por proposta + filmstrips. |

## Evidências executadas

- **18 cenários** (3 propostas × dark/light × desktop/tablet/mobile): `browser-metrics.json` — `collision=false` e `overflow=false` em todos; CTA máximo inferior em 728 px (desktop) e 559–575 px (mobile, acima da dobra).
- **15 testes de interação**: toggle de tema, foco visível no CTA, `<details>` dos módulos abrindo com 11 itens, replay re-disparando `.playing`, reduced-motion zerando animações.
- **Motion**: `evidence/motion-n{1,2,3}/frame-*.jpg` + `motion-n{1,2,3}-filmstrip.png` — entrada real filmada via CDP screencast.
- **Performance** (`#qa-evidence`): CLS ≈ 0,0027, 1 long task de 87 ms, LCP ≈ 152 ms no desktop.
- **Capturas**: 24 JPGs em `evidence/` (18 cenários + produto mobile dark/light).

## Auditoria Impeccable

- Detector original (conceitos N1/N2/N3): 5 advisories, exit 0.
- Detector final (`mission-05/n*/index.html`): **exit 0, 1 advisory** — `shape-assembled-illustration` no N2 (SVG do anel cinematográfico, intencional).
- Corrigidos nesta rodada: `cramped-padding` (3/página), `undersized-ui-text` (7/página), `tiny-text` (1/página) — todos os textos funcionais ≥ 11 px e corpo ≥ 12 px.
- `overused-font` (Inter): waiver inline documentado — Inter é a tipografia de marca obrigatória.

## Resultados por proposta

- **N1 (direção principal)**: editorial mais limpo; H1 com três cores oficiais + tags; painel dentro da primeira tela (bottom ≈ 889 px). Melhor equilíbrio legibilidade/impacto.
- **N2 (alternativa corrigida)**: colisões eliminadas via grid; conserva anel técnico, halo e profundidade. Plate mantém `rotateY(-3deg)` contido.
- **N3 (referência autoral)**: assinatura circular multicolorida preservada sem girar/cortar o logotipo;Execução em rosa + sublinhado dourado.

## Problemas remanescentes

- O painel mobile excede a primeira tela (bottom ≈ 1350 px) — intencional: o Hero mobile prioriza proposta de valor + CTA; o produto aparece na sequência.
- `.track` mobile a 11 px quebra rótulos longos em duas linhas dentro das colunas — legível, mas vale revisão se a marca preferir abreviações.
- N2 segue com advisory de ilustração SVG e é a proposta visualmente mais densa.
- Motion é entrada finita (por decisão de performance); não há loop ambiente — coerente com `prefers-reduced-motion`.

## Confirmação de isolamento

- Originais A, B, B V2, C, N1, N2, N3, `shared/` e `assets/` intactos (hashes verificados).
- Nenhum commit, push ou deploy realizado; GitHub Pages não foi atualizado.
- Versão publicada: https://marcelinhomarkss-rgb.github.io/Land-page/ (referência da Missão 04).
