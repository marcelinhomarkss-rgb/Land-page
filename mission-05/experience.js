(() => {
 const root=document.documentElement, q=new URLSearchParams(location.search), media=matchMedia('(prefers-reduced-motion: reduce)');
 let stored;try{stored=localStorage.getItem('birthub-m05-theme')}catch{}
 root.dataset.theme=q.get('theme')==='light'?'light':q.get('theme')==='dark'?'dark':stored||'dark';
 const toggle=document.querySelector('.theme'), motion=document.querySelector('.motion'), status=document.querySelector('.scene-status');
 let timer, manual=q.get('motion')==='reduce';
 const reduced=()=>media.matches||manual;
 function sync(){root.classList.toggle('reduced',reduced());motion.setAttribute('aria-pressed',String(reduced()));motion.textContent=reduced()?'Movimento reduzido':'Reduzir movimento';toggle.setAttribute('aria-pressed',String(root.dataset.theme==='dark'));toggle.setAttribute('aria-label',root.dataset.theme==='dark'?'Ativar tema claro':'Ativar tema escuro');}
 function play(){clearTimeout(timer);document.body.classList.remove('playing');if(reduced()){status.textContent='Sequência completa · sem movimento';return}void document.body.offsetWidth;document.body.classList.add('playing');status.textContent='Contexto → recomendação';timer=setTimeout(()=>{status.textContent='Recomendação disponível';document.body.classList.remove('playing')},1500)}
 toggle.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('birthub-m05-theme',root.dataset.theme)}catch{}sync()});
 motion.addEventListener('click',()=>{manual=!manual;sync();play()});media.addEventListener('change',()=>{sync();play()});
 document.querySelector('.replay').addEventListener('click',play);
 document.querySelectorAll('a[href="#modules"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('#modules').open=true}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);document.body.classList.remove('playing');status.textContent='Recomendação disponível'}});
 const qa=document.createElement('output');qa.hidden=true;qa.id='qa-evidence';document.body.append(qa);
 const metrics={cls:0,longTasks:0,longTaskMs:0,lcp:null};
 function record(){qa.textContent=JSON.stringify({...metrics,viewport:[innerWidth,innerHeight],reduced:reduced()})}
 try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)metrics.cls+=e.value;record()}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries()){metrics.longTasks++;metrics.longTaskMs+=e.duration}record()}).observe({type:'longtask',buffered:true});new PerformanceObserver(list=>{metrics.lcp=list.getEntries().at(-1).startTime;record()}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
 sync();play();record();
})();
