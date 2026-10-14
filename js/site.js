// Shared site touches: nav shadow once you scroll, and the current section highlighted in the nav.
(function () {
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = [...document.querySelectorAll('.nav-links a[href*="#"]')];
  const map = new Map(links.map(a => [a.hash.slice(1), a]));
  const secs = [...map.keys()].map(id => document.getElementById(id)).filter(Boolean);
  if (!secs.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = map.get(e.target.id); if (a) a.classList.add('on'); }
  }), { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach(s => io.observe(s));
})();
