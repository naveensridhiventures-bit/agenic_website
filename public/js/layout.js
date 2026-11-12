(function(){
const page=document.body.dataset.page||'';
const links=[['home','/','Home'],['about','/about','About'],['products','/products','Products'],['partner','/partner','Partner'],['contact','/contact','Contact']];
const li=links.map(l=>`<li><a href="${l[1]}" class="${l[0]===page?'on':''}">${l[2]}</a></li>`).join('');
const ar='<svg class="i"><use href="#i-arrow"/></svg>';
document.body.insertAdjacentHTML('afterbegin',`<div id="prog"></div><div id="loader"><div class="in"><img src="/img/logo.png" alt="Agenic"><div class="bar"><i></i></div></div></div>
<nav class="top" id="nav"><div class="wrap">
 <a href="/" aria-label="Agenic home"><img class="logo" src="/img/logo.png" alt="Agenic Agritech India"></a>
 <ul id="menu">${li}<li class="mfoot"><a href="/contact" class="btn lime" style="font:600 15px Inter,sans-serif;color:var(--g9);padding:15px"><span>Enquire now</span></a>Agenic Agritech India Pvt Ltd<br>No. 58, 4th Street, Annai Nagar, Korattur,<br>Chennai &ndash; 600076</li></ul>
 <a href="/contact" class="btn pri sm nav mag"><span>Enquire now</span></a>
 <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" data-i="menu"></button>
</div></nav>`);
document.body.insertAdjacentHTML('beforeend',`<footer><div class="wrap">
 <div class="fg">
  <div><span class="plate"><img src="/img/logo.png" alt="Agenic"></span><p style="margin-top:22px;max-width:320px">Quality You Trust. Goodness You Deserve.</p></div>
  <div><h5>Company</h5><a href="/about">About us</a><a href="/products">Products</a><a href="/partner">Partner with us</a><a href="/contact">Contact</a></div>
  <div><h5>Partners</h5><a href="/partner">Become a vendor</a><a href="/partner">Become a dealer</a><a href="/products#partners">Our manufacturers</a></div>
  <div><h5>Reach us</h5><p>Agenic Agritech India Pvt Ltd<br>No. 58, 4th Street, Annai Nagar,<br>Korattur, Chennai &ndash; 600076</p></div>
 </div>
 <div class="big">Agenic</div>
 <div class="cp"><span>&copy; <span id="yr"></span> Agenic Agritech India Private Limited. All rights reserved.</span><span>Chennai, India</span></div>
</div></footer>`);
})();
