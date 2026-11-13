# Assessment B — originais (fonte + detector)

Escopo: concept-n1, concept-n2 e concept-n3. Avaliação independente do parecer visual. Sem inspeção de navegador nesta subavaliação: a sessão visual é controlada pelo agente principal. Não declarar ausência de colisões, conformidade WCAG, FPS ou Core Web Vitals a partir deste relatório.

## Ferramenta

Skill e executável Impeccable: 4.8.2 (`impeccable.cmd --version`). O arquivo scripts/VERSION contém 0.1.21, versão do pacote/launcher; não confundir com a versão que o executável informa.

Detector executado nos três HTML originais; saída integral em original-detector.json. Cinco avisos, todos advisory: nested-cards em N1/N2/N3; shape-assembled-illustration e codex-grid-background em N2. Nenhum desses avisos equivale a erro de acessibilidade ou defeito automático da identidade neon. O painel contém uma recomendação como agrupamento funcional, portanto nested-cards é contextual; o anel 360° é gráfico de marca solicitado, portanto o aviso SVG não deve resultar na sua remoção. A grade ornamental N2 é candidata a simplificação, não um bloqueio técnico.

## Problemas confirmados em fonte

- P1 / Layout N2: .stagewrap é absoluto, left:max(45vw,610px), enquanto .type ocupa até 660px e os títulos têm white-space:nowrap. Não há reserva de espaço que impeça painel e títulos de ocuparem a mesma área. Fonte: N2 linhas 62, 65, 95. A colisão final exige medição no navegador.
- P1 / Identidade N1 e N3: Execução usa --ink (neutro de texto), contrariando a decisão cromática obrigatória. Substituir por papel neon e garantir superfície contrastante no Light.
- P2 / Comunicação: .deck repete a frase inteira no mobile, logo após as três palavras; .tag é oculto. Integrar os complementos às palavras preserva semanticamente a frase sem duplicação.
- P2 / Movimento: N2 mantém rotação infinita de três grupos orbitais, nó orbital e pulse; N3 gira símbolo e duas órbitas continuamente. Não há pausa exposta. Reduzir a uma entrada finita e estados sob demanda. WCAG 2.2.2 deve ser avaliada no render para movimento automático >5s apresentado com conteúdo.
- P2 / Preferência dinâmica: shared/theme.js aplica a classe rm apenas ao carregar; não escuta mudança de prefers-reduced-motion. O CSS global encurta animações, mas os listeners JS de scroll e ponteiro continuam se a preferência mudar após carga. Usar change e desligar/reduzir a resposta JS.
- P2 / Resiliência: localStorage.getItem/setItem são usados sem try/catch. Contextos que bloqueiam storage podem interromper inicialização/alternância de tema. Manter tema funcional sem persistência nesses casos.
- P2 / Conteúdo progressivo: elementos principais partem de opacity:0 e dependem de animações para aparecer; CTA inicia após ~1,3–1,4s, IA após ~2,5–2,75s. Estado base visível e entrada curta evitam esconder mensagem essencial.
- P2 / Legibilidade mobile: pipeline torna labels não atuais transparentes e painel N3 expõe módulos como códigos sem nomes. Reduzir o painel a uma narrativa comercial legível, em vez de uma miniatura dos onze módulos.
- P2 / Barra de laboratório: lab-bar contém 7 links em N3, min-height 36px e nenhum wrap; medir clipping no viewport 390px. 36px não viola automaticamente WCAG 2.5.8, mas fica aquém do alvo de conforto de 44px.
- P3 / Semântica: figure role=img torna o painel uma imagem com descrição única, sem leitura detalhada dos textos. Adequado a uma ilustração estática; se forem acrescentados controles de demonstração, remover role=img e usar group/figure com legenda e estados acessíveis.

## Pontos preserváveis

Fontes locais, assets SVG locais, HTML estático sem framework; tema explícito com aria-pressed e label de ação; :focus-visible definido; CTA com 56–58px; disclosure de simulação e toast role=status; listeners passivos e requestAnimationFrame agrupando escrita; ausência de métricas de desempenho alegadas.

## Próxima validação necessária

Render de 1440×900, 768px e 390×844, ambos os temas; retângulos de texto/painel/CTA, overflow sem mascaramento, contraste calculado, navegação teclado, tema e CTA, reduced motion real, sequência animada observada e capturada. Não atribuir pontuação técnica final antes dessas evidências.

Questions skipped: o proprietário já definiu as correções e autorizou a execução; esta é uma subavaliação técnica, não pedido de nova direção.
