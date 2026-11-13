(function(){

  var d=document.documentElement,q=new URLSearchParams(location.search);

  var def=d.getAttribute('data-default')||'dark';

  var t=q.get('theme')||localStorage.getItem('bh-lab-theme')||def;

  d.setAttribute('data-theme',t==='light'?'light':'dark');

  if(q.get('bare')==='1')d.classList.add('bare');

  if(q.get('static')==='1')d.classList.add('rm'); /* estado final sem animação, usado para capturas */

  document.addEventListener('DOMContentLoaded',function(){

    var b=document.querySelector('[data-theme-toggle]');

    if(b){var sync=function(){b.setAttribute('aria-pressed',d.getAttribute('data-theme')==='dark');b.setAttribute('aria-label',d.getAttribute('data-theme')==='dark'?'Ativar tema claro':'Ativar tema escuro')};sync();

      b.addEventListener('click',function(){var n=d.getAttribute('data-theme')==='dark'?'light':'dark';d.setAttribute('data-theme',n);localStorage.setItem('bh-lab-theme',n);sync()})}

    document.querySelectorAll('[data-demo-cta]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();

      var t=document.querySelector('.toast');if(!t)return;t.textContent='CTA demonstrativo do laboratório: nenhuma ação real é executada nesta página.';t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},3800)})});

    var rm=matchMedia('(prefers-reduced-motion: reduce)');if(rm.matches)d.classList.add('rm');

  });

})();

