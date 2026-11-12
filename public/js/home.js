const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#yr').textContent=new Date().getFullYear();
// preloader + hero entrance
const start=()=>{$('#loader').classList.add('hide');document.body.classList.add('ready');document.documentElement.classList.add('ready')};
addEventListener('load',()=>setTimeout(start,1200));setTimeout(start,3500);
// ticker
const words=['Quality You Trust','FSSAI Licensed Partners','QR Traceable Packs','Fresh Batters','Retail & Institutional Supply','Goodness You Deserve','Made in Chennai'];
$('#tk').innerHTML=[...words,...words,...words,...words].map(w=>`<span>${w}</span>`).join('');
// nav behaviour + progress + parallax
const nav=$('#nav'),prog=$('#prog');let lastY=0;
addEventListener('scroll',()=>{const y=scrollY;nav.classList.toggle('s',y>30);nav.classList.toggle('h',y>lastY&&y>500&&!$('#menu').classList.contains('open'));lastY=y;prog.style.transform=`scaleX(${y/(document.body.scrollHeight-innerHeight)})`;if(!reduce)$('#stage').style.setProperty('--py',y*-.06+'px')},{passive:true});
const setMenu=o=>{$('#menu').classList.toggle('open',o);document.body.classList.toggle('menu-open',o);const b=$('#burger');b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');b.innerHTML=ic(o?'x':'menu')};
$('#burger').onclick=()=>setMenu(!$('#menu').classList.contains('open'));
$$('#menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
// active link
const secs=$$('section[id]');const lio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#menu a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>lio.observe(s));
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
const watch=()=>$$('.rv:not(.in)').forEach(el=>io.observe(el));watch();
// counters
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const el=e.target,t=+el.dataset.c,s=el.dataset.s||'',t0=performance.now();const f=n=>{const p=Math.min(1,(n-t0)/1800),v=Math.round(t*(1-Math.pow(1-p,4)));el.textContent=v+s;if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}));$$('[data-c]').forEach(el=>cio.observe(el));
// process line
new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){e.target.style.setProperty('--p',1);o.unobserve(e.target)}}),{threshold:.4}).observe($('#proc'));
// spotlight + magnetic + phone tilt
document.addEventListener('mousemove',e=>{const c=e.target.closest?.('.cat');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}
 if(reduce)return;$$('.mag').forEach(b=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)<90)b.style.transform=`translate(${dx*.18}px,${dy*.28}px)`;else b.style.transform=''});
 const st=$('#stage'),r=st.getBoundingClientRect();if(e.clientY>r.top&&e.clientY<r.bottom&&e.clientX>r.left-100&&e.clientX<r.right+100){const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;$('#tilt').style.transform=`rotateY(${x*26}deg) rotateX(${-y*18}deg)`}else $('#tilt').style.transform=''});
// FAQ
$$('.fq button').forEach(b=>b.onclick=()=>{const f=b.parentElement,o=f.classList.contains('o');$$('.fq').forEach(x=>x.classList.remove('o'));if(!o)f.classList.add('o')});
// products + vendors
const ini=n=>String(n).split(/\s+/).filter(w=>/^[A-Za-z0-9]/.test(w)).slice(0,2).map(w=>w[0].toUpperCase()).join('');
fetch('/api/products').then(r=>r.json()).then(list=>{
 $('#plist').innerHTML=list.map((p,i)=>`<a class="pc rv" style="--d:${i%3}" href="/p/${esc(p.id)}"><div class="im">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="mono">${esc(ini(p.name))}</div>`}<span class="badge">${esc(p.category)}</span></div><div class="bd"><h3>${esc(p.name)}</h3><p>${esc(p.tagline)}</p>${p.vendor?`<div class="by">Manufactured by ${esc(p.vendor.name)}</div>`:''}<div class="go"><span>View product details</span>${ic('arrow')}</div></div></a>`).join('')+`<div class="pc soon rv" style="--d:2"><div>${ic('spark')}<h3>More on the way</h3><p style="margin-top:8px">New Agenic products are launching soon.</p></div></div>`;watch()}).catch(()=>{});
fetch('/api/vendors').then(r=>r.json()).then(list=>{
 $('#vlist').innerHTML=list.map((v,i)=>`<div class="vc rv" style="--d:${i%3}"><div class="top"><div class="av ${v.logo?'lg':''}">${v.logo?`<img src="${esc(v.logo)}" alt="${esc(v.name)} logo">`:esc(v.name[0])}</div><div><h4>${esc(v.name)}</h4><small>${v.established?'Established '+esc(v.established):'Manufacturing partner'}</small></div></div>${v.about?`<p>${esc(v.about)}</p>`:''}<dl>${v.address?`<div>${ic('pin')}<span>${esc(v.address)}</span></div>`:''}${v.fssai?`<div>${ic('shield')}<span>FSSAI <b>${esc(v.fssai)}</b></span></div>`:''}${v.phone?`<div>${ic('phone')}<span>${esc(v.phone)}</span></div>`:''}${v.email?`<div>${ic('mail')}<span>${esc(v.email)}</span></div>`:''}</dl></div>`).join('');watch()}).catch(()=>{});
// prefill enquiry type
$$('[data-type]').forEach(a=>a.addEventListener('click',()=>{$('#e_type').value=a.dataset.type}));
// enquiry
$('#enq').onsubmit=async e=>{e.preventDefault();const n=$('#enote'),b=e.target.querySelector('button');b.disabled=true;n.style.color='';n.textContent='Sending...';
 try{const r=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('#e_name').value,org:$('#e_org').value,phone:$('#e_phone').value,email:$('#e_mail').value,type:$('#e_type').value,message:$('#e_msg').value})});if(!r.ok)throw 0;e.target.reset();n.textContent='Thank you. Your enquiry has been received and our team will contact you shortly.'}catch{n.style.color='#b3261e';n.textContent='Could not send right now. Please try again in a moment.'}b.disabled=false};

// ---- mobile: carousel dots ----
(function(){
 const setup=()=>{document.querySelectorAll('.hs').forEach(hs=>{
   if(hs.dataset.dots||hs.children.length<2||getComputedStyle(hs).display==='none')return;hs.dataset.dots=1;
   const d=document.createElement('div');d.className='dots';hs.after(d);
   const upd=()=>{const n=hs.children.length;d.innerHTML=Array.from({length:n},()=>'<i></i>').join('');const i=Math.round(hs.scrollLeft/(hs.scrollWidth-hs.clientWidth||1)*(n-1));[...d.children].forEach((x,k)=>x.classList.toggle('on',k===i))};
   upd();hs.addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});
   new MutationObserver(upd).observe(hs,{childList:true});
 })};
 setup();setTimeout(setup,1200);setTimeout(setup,3000);
})();
