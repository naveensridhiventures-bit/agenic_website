const $ = s => document.querySelector(s);
window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('hide'), 700));
$('#yr').textContent = new Date().getFullYear();
const nav = $('#nav'); addEventListener('scroll', () => nav.classList.toggle('s', scrollY > 30));
$('#burger').onclick = () => $('#menu').classList.toggle('open');
document.querySelectorAll('#menu a').forEach(a => a.onclick = () => $('#menu').classList.remove('open'));
const words = ['Fresh Batter','Dosa Mix','Idly Mix','FMCG Essentials','Hygienic','FSSAI Licensed','Farm Fresh','Quality You Trust'];
$('#mq').innerHTML = [...words, ...words].map(w => `${w}<span>✦</span>`).join('');
// falling leaves
const hero = $('.hero');
for (let i = 0; i < 12; i++) { const l = document.createElement('div'); l.className = 'leaf'; l.textContent = ['🍃','🌿','🌱'][i % 3]; l.style.left = Math.random() * 100 + '%'; l.style.animationDuration = 14 + Math.random() * 14 + 's'; l.style.animationDelay = -Math.random() * 20 + 's'; l.style.fontSize = 16 + Math.random() * 22 + 'px'; hero.appendChild(l); }
// reveal + counters
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const observe = () => document.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
observe();
document.querySelectorAll('[data-c]').forEach(el => { const t = +el.dataset.c, s = el.dataset.s || ''; let n = 0; const step = () => { n += Math.ceil(t / 60); if (n >= t) n = t; el.textContent = n + s; if (n < t) requestAnimationFrame(step); }; setTimeout(step, 900); });
// tilt
document.addEventListener('mousemove', e => { const c = e.target.closest?.('.card'); if (!c) return; const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `translateY(-10px) perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`; });
document.addEventListener('mouseout', e => { const c = e.target.closest?.('.card'); if (c) c.style.transform = ''; });
// products
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fetch('/api/products').then(r => r.json()).then(list => {
  $('#plist').innerHTML = list.map((p, i) => `
  <a class="card pcard rv d${i % 3}" href="/p/${esc(p.id)}">
    <div class="pimg">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : `<span class="em">${esc(p.emoji)}</span>`}<span class="badge">${esc(p.category)}</span></div>
    <div class="pbody"><h3>${esc(p.name)}</h3><p>${esc(p.tagline)}</p>${p.vendor ? `<div class="by">By ${esc(p.vendor.name)}</div>` : ''}<div class="go">View details <span>→</span></div></div>
  </a>`).join('') + `<div class="card soon rv"><div><div style="font-size:56px">✨</div><h3>More coming soon</h3><p>New Agenic products are on the way.</p></div></div>`;
  observe();
});
