from pathlib import Path
import re, hashlib, json
root=Path(__file__).resolve().parent.parent
out=root/'mission-05'
out.mkdir(exist_ok=True)
originals={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for d in ['concept-a','concept-b','concept-b2','concept-c','concept-n1','concept-n2','concept-n3','shared','assets'] for p in (root/d).rglob('*') if p.is_file()}
(out/'original-hashes.json').write_text(json.dumps(originals,indent=2))
for n in [1,2,3]:
 s=(root/f'concept-n{n}/index.html').read_text(encoding='utf-8-sig')
 orbit=re.search(r'<div class="(?:orbit|signature)" aria-hidden="true">(.*?)\n      </div>',s,re.S).group(0)
 rail=re.search(r'<ul class="p-rail".*?</ul>',s,re.S).group(0)
 rail=re.sub(r' style="[^"]*"','',rail)
 orbit=orbit.replace('../assets/','../../assets/')
 html=f'''<!doctype html>
<html lang="pt-BR" data-theme="dark"><head><!-- impeccable-disable overused-font --><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>N{n} refinado · Missão 05 · Birth Hub 360°</title>
<link rel="stylesheet" href="../refined.css"><script src="../experience.js" defer></script></head>
<body class="n{n}"><a class="skip" href="#content">Pular para o conteúdo</a>
<header><a class="brand" href="../index.html" aria-label="Birth Hub 360° — laboratório"><img width="36" height="36" src="../../assets/brand/birthhub360-simbolo.svg" alt=""><span>Birth Hub <b>360°</b></span></a>
<nav aria-label="Principal"><a href="#modules">Módulos</a><button class="theme" aria-label="Ativar tema claro" aria-pressed="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg></button></nav></header>
<main id="content"><section class="hero" aria-labelledby="headline">
<div class="editorial"><h1 id="headline"><span class="row r1"><span class="w">Dados</span><span class="tag">que conectam.</span></span><span class="row r2"><span class="w">Inteligência</span><span class="tag">que decide.</span></span><span class="row r3"><span class="w">Execução</span><span class="tag">que acontece.</span></span></h1>
<p class="lead"><strong>Birth Hub 360°</strong> é o sistema operacional de Revenue Intelligence: CRM, IA e cadência de vendas num só lugar.</p>
<div class="acts"><a class="primary" href="#demo-note">Agendar demonstração <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a><a class="secondary" href="#modules">Conhecer os 11 módulos</a></div>
<p class="demo-note" id="demo-note" tabindex="-1">Protótipo de avaliação · agendamento indisponível neste laboratório.</p></div>
<div class="stagewrap">{orbit}<div class="orbit-caption" aria-hidden="true">VISÃO INTEGRADA · 360°</div>
<figure class="plate" aria-label="Demonstração ilustrativa do centro de comando">
<div class="p-bar"><img src="../../assets/brand/birthhub360-icone.svg" width="28" height="28" alt=""><strong>Centro de comando</strong><span class="sim">Simulação</span></div>
<div class="p-main"><div class="product-context"><span>Pipeline comercial</span><span>Visão 360°</span></div>
<ol class="track" aria-label="Etapas do pipeline"><li>Prospecção</li><li>Qualificação</li><li aria-current="step">Proposta</li><li>Negociação</li><li>Fechamento</li></ol>
<div class="opp"><span class="data-label">OPORTUNIDADE ILUSTRATIVA</span><h2>Oportunidade #1042</h2><p>Etapa atual · Proposta</p></div>
<div class="chips"><span>Reunião técnica realizada</span><span>Proposta enviada</span><span class="pending">Retorno pendente</span></div>
<div class="ia"><h3>Copiloto IA <span>Próxima ação</span></h3><p>Retomar contato com o CFO e propor reunião executiva de implantação.</p><small>Recomendação ilustrativa · decisão do vendedor</small></div>
<div class="demo-controls"><button class="replay" type="button">Reproduzir sequência</button><span class="scene-status" role="status">Contexto → decisão → ação</span></div></div>
<figcaption>Interface ilustrativa · dados simulados</figcaption></figure></div>
</section><details id="modules"><summary>Explorar os 11 módulos</summary><p>Arquitetura apresentada no laboratório original. Esta visualização não altera os módulos da plataforma.</p>{rail}</details></main>
<footer><a href="../index.html">Missão 05 · comparação</a><a href="../../concept-n{n}/index.html">N{n} original</a><button class="motion" aria-pressed="false">Reduzir movimento</button></footer>
</body></html>'''
 d=out/f'n{n}';d.mkdir(exist_ok=True);(d/'index.html').write_text(html,encoding='utf-8')
