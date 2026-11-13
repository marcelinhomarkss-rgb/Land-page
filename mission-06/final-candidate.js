(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let stored;
  try {
    stored = localStorage.getItem('birthub-m06-theme');
  } catch {}
  root.dataset.theme =
    q.get('theme') === 'light'
      ? 'light'
      : q.get('theme') === 'dark'
      ? 'dark'
      : stored || 'dark';

  const toggle = document.querySelector('.theme');
  const motion = document.querySelector('.motion');
  const status = document.querySelector('.scene-status');
  let timers = [];
  let manual = q.get('motion') === 'reduce';
  const reduced = () => media.matches || manual;

  function clearTimers() {
    while (timers.length) clearTimeout(timers.pop());
  }

  function sync() {
    const isReduced = reduced();
    root.classList.toggle('reduced', isReduced);
    motion.setAttribute('aria-pressed', String(isReduced));
    motion.textContent = isReduced ? 'Movimento reduzido' : 'Reduzir movimento';
    const isDark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute(
      'aria-label',
      isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
    );
  }

  function play() {
    clearTimers();
    document.body.classList.remove('playing');
    if (reduced()) {
      status.textContent = 'Sequência completa · sem movimento';
      return;
    }
    void document.body.offsetWidth;
    document.body.classList.add('playing');
    status.textContent = '1/3 · Sincronizando dados 360°';
    timers.push(
      setTimeout(() => {
        status.textContent = '2/3 · Analisando oportunidade #1042';
      }, 520),
      setTimeout(() => {
        status.textContent = '3/3 · Recomendação IA ativa';
      }, 1020),
      setTimeout(() => {
        status.textContent = 'Contexto → decisão → ação';
        document.body.classList.remove('playing');
      }, 1650)
    );
  }

  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('birthub-m06-theme', root.dataset.theme);
    } catch {}
    sync();
  });

  motion.addEventListener('click', () => {
    manual = !manual;
    sync();
    play();
  });

  media.addEventListener('change', () => {
    sync();
    play();
  });

  document.querySelector('.replay').addEventListener('click', play);

  document.querySelectorAll('a[href="#modules"]').forEach((a) =>
    a.addEventListener('click', () => {
      const m = document.querySelector('#modules');
      if (m) m.open = true;
    })
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimers();
      document.body.classList.remove('playing');
      status.textContent = 'Contexto → decisão → ação';
    }
  });

  const qa = document.createElement('output');
  qa.hidden = true;
  qa.id = 'qa-evidence';
  document.body.append(qa);
  const metrics = { cls: 0, longTasks: 0, longTaskMs: 0, lcp: null };
  function record() {
    qa.textContent = JSON.stringify({
      ...metrics,
      viewport: [innerWidth, innerHeight],
      reduced: reduced()
    });
  }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) metrics.cls += e.value;
      }
      record();
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        metrics.longTasks++;
        metrics.longTaskMs += e.duration;
      }
      record();
    }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((list) => {
      metrics.lcp = list.getEntries().at(-1).startTime;
      record();
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  sync();
  play();
  record();
})();
