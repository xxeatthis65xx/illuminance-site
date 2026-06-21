/* ============================================================
   Illuminance Wedding Films — shared site script
   Renders content from /content/*.json so everything is editable
   through the /admin dashboard. You normally never edit this file.
   ============================================================ */

const LOGO = "./images/logo.png";
const SKY_BG = {
  dawn:   "linear-gradient(180deg,#a9bcd6,#dcc6b0)",
  golden: "linear-gradient(180deg,#e8a64c,#c8602a)",
  star:   "linear-gradient(180deg,#16264a,#0a1020)",
  ever:   "linear-gradient(160deg,#2a1830,#7a3a5a)"
};
const checkSVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
const PAGE = document.body.dataset.page || "home";

/* ---------- intro (home only) ---------- */
(function(){
  const intro=document.getElementById('intro');
  if(!intro) return;
  const introLogo=document.getElementById('introLogo');
  if(introLogo) introLogo.src=LOGO;
  const shine=intro.querySelector('.intro-shine');
  if(shine){ shine.style.webkitMaskImage='url('+LOGO+')'; shine.style.maskImage='url('+LOGO+')'; }
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduce){ intro.remove(); return; }
  document.body.classList.add('intro-lock');
  setTimeout(()=>{ intro.classList.add('done'); document.body.classList.remove('intro-lock'); },2600);
  intro.addEventListener('transitionend',()=>intro.remove(),{once:true});
  setTimeout(()=>{ if(document.body.contains(intro)) intro.remove(); },4200);
})();

/* ---------- nav ---------- */
const nav=document.getElementById('nav');
if(nav) addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
const burger=document.getElementById('burger'), menu=document.getElementById('menu');
if(burger&&menu){
  burger.addEventListener('click',()=>menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
}
const yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

/* ---------- helpers ---------- */
async function load(path){
  const res=await fetch(path,{cache:"no-store"});
  if(!res.ok) throw new Error("Could not load "+path);
  return res.json();
}
function imgPath(p){
  if(!p) return "";
  if(/^https?:/.test(p) || p.startsWith('/') || p.startsWith('./') || p.startsWith('images/')) return p;
  return './images/'+p;
}
function ytEmbed(url){
  if(!url) return "";
  let id="";
  const m=url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if(m) id=m[1];
  return id?("https://www.youtube.com/embed/"+id):"";
}
function slugify(s){
  return (s||"").toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function setSocials(s){
  document.querySelectorAll('.js-ig').forEach(a=>{if(s.instagram)a.href=s.instagram});
  document.querySelectorAll('.js-yt').forEach(a=>{if(s.youtube)a.href=s.youtube});
  document.querySelectorAll('.js-fb').forEach(a=>{if(s.facebook)a.href=s.facebook});
}

/* ---------- reveal on scroll ---------- */
function wireReveal(){
  const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}

/* ---------- hero ---------- */
function renderHero(site){
  const t=document.getElementById('heroTitle'); if(t) t.textContent=site.heroTitle||"Remember Your Wedding";
  const s=document.getElementById('heroSub'); if(s) s.textContent=site.heroSubtitle||"";
  const e=document.getElementById('heroEyebrow'); if(e) e.textContent=site.heroEyebrow||"";
  const media=document.getElementById('heroMedia');
  if(media){
    const embed=ytEmbed(site.heroVideo);
    if(embed){
      media.innerHTML='<iframe src="'+embed+'" title="Wedding film" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>';
    }
  }
}

/* ---------- about ---------- */
function renderAbout(site){
  const q=document.getElementById('aboutQuote'); if(q) q.textContent='"'+(site.aboutQuote||"")+'"';
  const so=document.getElementById('aboutSignoff'); if(so) so.textContent='— '+(site.aboutSignoff||"Hunter Sites");
  const copy=document.getElementById('aboutCopy');
  if(copy && Array.isArray(site.bio)) copy.innerHTML=site.bio.map(p=>'<p>'+p+'</p>').join('');
}

/* ---------- portfolio ---------- */
function coupleTile(c){
  const hasImg=!!c.photo;
  const inner=`
    <span class="story__num"></span>
    <span class="story__name">${c.name||""}</span>
    <span class="story__meta">${c.venue || c.date || "View Story"}</span>`;
  const pos=c.photoFocus&&c.photoFocus!=='center'?`;background-position:${c.photoFocus}`:"";
  const style=hasImg?` style="background-image:url('${imgPath(c.photo)}')${pos}"`:"";
  const href='./story.html?couple='+encodeURIComponent(slugify(c.name));
  return `<a class="story reveal" href="${href}"${style}>${inner}</a>`;
}
function renderPortfolio(couples, container, limit){
  if(!container) return;
  const list=limit?couples.slice(0,limit):couples;
  container.innerHTML=list.map(coupleTile).join('');
  container.querySelectorAll('.story__num').forEach((el,i)=>el.textContent=String(i+1).padStart(2,'0'));
}

/* ---------- gallery + lightbox ---------- */
let GAL_IMAGES=[], lbIndex=0;
function ensureLightbox(){
  if(document.getElementById('lightbox')) return;
  const lb=document.createElement('div');
  lb.className='lightbox'; lb.id='lightbox';
  lb.innerHTML=`
    <button class="lightbox__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <button class="lightbox__nav prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button>
    <img alt="">
    <button class="lightbox__nav next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button>`;
  document.body.appendChild(lb);
  const img=lb.querySelector('img');
  const show=i=>{lbIndex=(i+GAL_IMAGES.length)%GAL_IMAGES.length; img.src=GAL_IMAGES[lbIndex];};
  lb.querySelector('.lightbox__close').onclick=()=>lb.classList.remove('open');
  lb.querySelector('.prev').onclick=e=>{e.stopPropagation();show(lbIndex-1);};
  lb.querySelector('.next').onclick=e=>{e.stopPropagation();show(lbIndex+1);};
  lb.addEventListener('click',e=>{if(e.target===lb)lb.classList.remove('open');});
  addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')lb.classList.remove('open');
    if(e.key==='ArrowLeft')show(lbIndex-1);
    if(e.key==='ArrowRight')show(lbIndex+1);
  });
  lb._show=show;
}
function renderGallery(photos, container, limit){
  if(!container) return;
  const list=limit?photos.slice(0,limit):photos;
  GAL_IMAGES=[];
  container.innerHTML=list.map((p,i)=>{
    const size=p.size==='tall'?'tall':p.size==='wide'?'wide':'';
    const focus=p.position||p.focus;
    const pos=focus&&focus!=='center'?`;background-position:${focus}`:"";
    if(p.image){
      const idx=GAL_IMAGES.length; GAL_IMAGES.push(imgPath(p.image));
      return `<div class="gtile has-img reveal ${size}" data-lb="${idx}" style="background-image:url('${imgPath(p.image)}')${pos}"><span></span></div>`;
    }
    return `<div class="gtile reveal ${size}"><span>Photo ${i+1}</span></div>`;
  }).join('');
  if(GAL_IMAGES.length){
    ensureLightbox();
    const lb=document.getElementById('lightbox');
    container.querySelectorAll('[data-lb]').forEach(t=>{
      t.style.cursor='pointer';
      t.onclick=()=>{lb._show(+t.dataset.lb); lb.classList.add('open');};
    });
  }
}

/* ---------- couple story (detail page) ---------- */
function clipCard(clip){
  const src=imgPath(clip&&(clip.video||clip.file));
  if(!src) return '';
  const poster=clip.poster?` poster="${imgPath(clip.poster)}"`:'';
  return `<div class="clip reveal"><video src="${src}"${poster} autoplay muted loop playsinline preload="metadata"></video></div>`;
}
function renderStory(couples){
  const root=document.getElementById('storyRoot');
  if(!root) return;
  const slug=new URLSearchParams(location.search).get('couple');
  const c=couples.find(x=>slugify(x.name)===slug);
  if(!c){
    root.innerHTML='<div class="subhead reveal"><span class="label">Real Weddings</span><h1>Story Not Found</h1><p>This wedding may have moved.</p></div><div class="view-all reveal"><a class="btn-ghost" href="./portfolio.html">All Weddings</a></div>';
    return;
  }
  document.title=c.name+' — Illuminance Wedding Films';
  const meta=[c.date,c.venue].filter(Boolean).join(' · ');
  const embed=ytEmbed(c.film);
  const filmHTML=embed?`<div class="story-film reveal"><iframe src="${embed}" title="${c.name} film" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`:'';
  const storyHTML=c.story?`<div class="story-copy reveal">${c.story.split(/\n\n+/).map(p=>'<p>'+p+'</p>').join('')}</div>`:'';
  const clips=(c.clips||[]).map(clipCard).filter(Boolean).join('');
  const clipsHTML=clips?`<div class="clip-grid reveal">${clips}</div>`:'';
  const hasPhotos=(c.photos||[]).some(p=>p.image);
  root.innerHTML=`
    <div class="subhead reveal">
      <span class="label">Their Story</span>
      <h1>${c.name}</h1>
      ${meta?`<p>${meta}</p>`:''}
    </div>
    ${filmHTML}
    ${storyHTML}
    ${clipsHTML}
    ${hasPhotos?'<div class="grid-gallery" id="storyGallery"></div>':''}
    <div class="view-all reveal" style="margin-top:70px"><a class="btn-ghost" href="./portfolio.html">View All Weddings</a></div>`;
  if(hasPhotos) renderGallery(c.photos||[], document.getElementById('storyGallery'), 0);
}

/* ---------- packages (home) ---------- */
function renderPackages(packages){
  const list=document.getElementById('pkgList');
  if(!list) return;
  list.innerHTML=packages.map(p=>`
    <div class="pkg-panel">
      <div class="pkg-panel__bg" style="background:var(--sky-${p.sky})"></div>
      ${p.stars?'<div class="pkg-panel__stars"></div>':''}
      <div class="pkg-panel__scrim"></div>
      <div class="wrap reveal">
        <div class="pkg-card">
          <div class="pkg-intro" style="background:${SKY_BG[p.sky]||'#1a1916'}">
            <div class="pkg-intro__in">
              ${p.badge?`<span class="pkg-badge">${p.badge}</span>`:''}
              <div class="pkg-name">${p.name}</div>
              <p class="pkg-tagline">${p.tagline||""}</p>
              <div class="pkg-price">$${p.price}<small>starting</small></div>
            </div>
          </div>
          <div class="pkg-detail">
            <ul class="pkg-features${(p.features||[]).length>6?' two':''}">${(p.features||[]).map(f=>`<li>${checkSVG}<span>${f}</span></li>`).join('')}</ul>
            <div class="pkg-save">${p.save||""}</div>
            <button class="pkg-cta" data-pkg="${p.name}">Inquire About ${p.name}</button>
          </div>
        </div>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-pkg]').forEach(b=>b.addEventListener('click',()=>pickPackage(b.dataset.pkg)));
}
function pickPackage(name){
  const sel=document.querySelector('select[name=package]');
  if(sel)[...sel.options].forEach(o=>{if(o.text.startsWith(name))sel.value=o.value;});
  const c=document.getElementById('contact'); if(c) c.scrollIntoView({behavior:'smooth'});
}

/* ---------- contact add-ons (home) ---------- */
function renderAddons(addons){
  const wrap=document.getElementById('addons'); if(!wrap) return;
  const subtotal=document.getElementById('subtotal');
  wrap.innerHTML=addons.map(a=>`<label class="addon"><input type="checkbox" name="addons" value="${a.name} ($${a.price})" data-price="${a.price}"><span>${a.name}</span><span class="price">$${a.price}</span></label>`).join('');
  wrap.addEventListener('change',()=>{
    let t=0; wrap.querySelectorAll('input:checked').forEach(c=>t+=+c.dataset.price);
    if(subtotal) subtotal.innerHTML='Add-ons selected: <b>$'+t.toLocaleString()+'</b>';
  });
}
function wireForm(){
  const form=document.getElementById('form'), thanks=document.getElementById('thanks');
  if(!form) return;
  form.addEventListener('submit',e=>{
    if(form.getAttribute('action').includes('YOUR_FORM_ID')){
      e.preventDefault(); form.style.display='none';
      if(thanks){thanks.classList.add('show'); thanks.scrollIntoView({behavior:'smooth',block:'center'});}
    }
  });
}

/* ---------- boot ---------- */
(async function(){
  try{
    const site=await load('./content/site.json');
    setSocials(site);
    if(PAGE==='home'){ renderHero(site); renderAbout(site); }

    if(PAGE==='home'){
      const [pf,gl,pk]=await Promise.all([load('./content/portfolio.json'),load('./content/gallery.json'),load('./content/packages.json')]);
      renderPortfolio(pf.couples||[], document.getElementById('storiesPreview'), 4);
      renderGallery(gl.photos||[], document.getElementById('galleryPreview'), 5);
      renderPackages(pk.packages||[]);
      renderAddons(pk.addons||[]);
      wireForm();
    } else if(PAGE==='portfolio'){
      const pf=await load('./content/portfolio.json');
      renderPortfolio(pf.couples||[], document.getElementById('storiesFull'), 0);
    } else if(PAGE==='gallery'){
      const gl=await load('./content/gallery.json');
      renderGallery(gl.photos||[], document.getElementById('galleryFull'), 0);
    } else if(PAGE==='story'){
      const pf=await load('./content/portfolio.json');
      renderStory(pf.couples||[]);
    }
  }catch(err){
    console.error(err);
    const note=document.getElementById('loadError');
    if(note) note.style.display='block';
  }
  wireReveal();
})();
