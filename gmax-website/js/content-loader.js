'use strict';
async function loadGmaxContent(){const preview=new URLSearchParams(location.search).get('preview')==='1';try{const r=await fetch('data/content.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Content unavailable');let data=await r.json();if(preview){try{const draft=JSON.parse(localStorage.getItem('gmax-admin-draft-v1')||'null');if(draft)data=draft}catch(e){}}applyGmaxContent(data);applyGmaxSiteSettings(data);window['dispatchEvent'](new Event('gmax-content-ready'))}catch(e){console.warn('G-MAX content loader:',e.message)}}
function text(el,v){if(el&&v!=null)el.textContent=v}
function lines(el,v){if(!el||v==null)return;el.textContent='';String(v).split(/\r?\n/).forEach((line,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(line))})}
function applyGmaxContent(data){const h=data.homepage||{},about=data.about||{},contact=data.contact||{};document.querySelectorAll('.topbar-contact span').forEach((el,i)=>{if(i===0)text(el,contact.address);if(i===1)text(el,contact.email);if(i===2)text(el,contact.phone)});document.querySelectorAll('.footer-contact > a').forEach((el,i)=>{const span=el.querySelector('span');if(i===0){text(span,contact.address);el.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(contact.address||'')}if(i===1){text(span,contact.email);el.href='mailto:'+(contact.email||'')}if(i===2){text(span,contact.phone);el.href='tel:'+(contact.phone||'').replace(/\s/g,'')}});document.querySelectorAll('.footer-brand p').forEach(el=>text(el,h.about||about.description));const hero=document.querySelector('.hero-content');if(hero){const ps=hero.querySelectorAll('p');text(hero.querySelector('h1'),h.heroHeading);text(ps[0],h.heroSubtitle);text(ps[1],h.heroDescription)}document.querySelectorAll('.about-showcase-copy .about-lead,.about-page-copy > p').forEach(el=>text(el,h.about||about.description));document.querySelectorAll('[data-panel-content="mission"] p').forEach(el=>text(el,h.mission));document.querySelectorAll('[data-panel-content="vision"] p').forEach(el=>text(el,h.vision));document.querySelectorAll('.showcase-commitments ul').forEach(ul=>{ul.innerHTML='';(h.commitments||[]).forEach(v=>{const li=document.createElement('li');text(li,v);ul.appendChild(li)})});document.querySelectorAll('.services-page .service-card,.services-preview .service-card').forEach((card,i)=>{const s=(data.services||[])[i];if(!s)return;const ps=card.querySelectorAll('p');text(card.querySelector('h3'),s.name);const parts=String(s.description||'').split(/\r?\n/);text(ps[0],parts[0]||'');if(ps[1])text(ps[1],parts.slice(1).join(' '))});const pricing=data.pricing||{};['promo','volume','daily','mup'].forEach(key=>{const panel=document.getElementById(key);if(!panel)return;const tbody=panel.querySelector('tbody');if(!tbody)return;tbody.innerHTML='';(pricing[key]||[]).forEach(row=>{const tr=document.createElement('tr');[0,1,2].forEach(i=>{const td=document.createElement('td');text(td,row[i]||'');tr.appendChild(td)});tbody.appendChild(tr)})});const faq=data.faq||[],faqPage=document.querySelector('.faq-page');if(faqPage){faqPage.innerHTML='';faq.forEach((item,i)=>{const d=document.createElement('details');if(i===0)d.open=true;const s=document.createElement('summary');text(s,item.question);const plus=document.createElement('span');plus.setAttribute('aria-hidden','true');plus.textContent='+';s.appendChild(plus);const p=document.createElement('p');lines(p,item.answer);d.append(s,p);faqPage.appendChild(d);d.addEventListener('toggle',()=>{if(d.open)faqPage.querySelectorAll('details').forEach(o=>{if(o!==d)o.removeAttribute('open')})})})}const cd=document.querySelector('.contact-details');if(cd){const items=cd.querySelectorAll('.contact-item');if(items[0]){text(items[0].querySelector('a'),contact.address);items[0].querySelector('a').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(contact.address||'')}if(items[1]){text(items[1].querySelector('a'),contact.email);items[1].querySelector('a').href='mailto:'+(contact.email||'')}if(items[2]){text(items[2].querySelector('a'),contact.phone);items[2].querySelector('a').href='tel:'+(contact.phone||'').replace(/\s/g,'')}}document.querySelectorAll('.contact-note p').forEach(el=>text(el,h.about||about.description))}

function bindMissionVision(){
  document.querySelectorAll('.mission-vision-toggle').forEach(btn=>{
    if(btn.dataset.bound==='1')return;
    btn.dataset.bound='1';
    btn.addEventListener('click',()=>{
      const key=btn.dataset.panel;
      const open=btn.getAttribute('aria-expanded')==='true';
      document.querySelectorAll('.mission-vision-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
      document.querySelectorAll('.mission-vision-panel').forEach(p=>p.hidden=true);
      if(!open){btn.setAttribute('aria-expanded','true');const panel=document.querySelector('[data-panel-content="'+key+'"]');if(panel)panel.hidden=false}
    });
  });
}
function renderHomepageLayout(data){
  if(!location.pathname.endsWith('/index.html') && location.pathname!=='/' && location.pathname!=='')return;
  const root=document.getElementById('homepage-builder');if(!root)return;
  const h=data.homepage||{}, st=h.sectionTitles||{};
  const layout=Array.isArray(h.layout)&&h.layout.length?h.layout:[
    {id:'hero',type:'hero',label:'Hero',enabled:true},
    {id:'about',type:'about',label:'About G-MAX',enabled:true},
    {id:'commitments',type:'commitments',label:'Core Commitments',enabled:true},
    {id:'services',type:'services',label:'Our Services',enabled:true},
    {id:'everywhere',type:'everywhere',label:'We are everywhere',enabled:true}
  ];
  root.innerHTML='';
  layout.filter(sec=>sec && sec.enabled!==false).forEach(sec=>{
    const type=sec.type||'custom';
    if(type==='hero'){
      const el=document.createElement('section');el.id='hero';el.className='hero';
      el.innerHTML='<div class="hero-overlay"></div><div class="container hero-content"><h1></h1><p></p><p></p><a class="btn btn-outline hero-read-more" href=""></a></div>';root.appendChild(el);
    }else if(type==='about'){
      const el=document.createElement('section');el.id='about';el.className='section about-showcase';
      el.innerHTML='<div class="container about-showcase-grid"><div class="promo-grid" aria-label="G-MAX promotional images"><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div></div><div class="about-showcase-copy"><h2></h2><p class="about-lead"></p><div class="mission-vision"><div class="mission-vision-controls"><button type="button" class="mission-vision-toggle" data-panel="mission" aria-expanded="false"><span aria-hidden="true">+</span> Our Mission</button><button type="button" class="mission-vision-toggle" data-panel="vision" aria-expanded="false"><span aria-hidden="true">+</span> Our Vision</button></div><div class="mission-vision-panel" data-panel-content="mission" hidden><p></p></div><div class="mission-vision-panel" data-panel-content="vision" hidden><p></p></div></div></div></div>';root.appendChild(el);
    }else if(type==='commitments'){
      const el=document.createElement('section');el.className='section commitments-section';
      el.innerHTML='<div class="container"><div class="showcase-commitments"><h3></h3><ul></ul></div></div>';root.appendChild(el);
    }else if(type==='services'){
      const el=document.createElement('section');el.id='services';el.className='section services-preview';
      el.innerHTML='<div class="container services-showcase"><h2 class="services-showcase-title"></h2><div class="service-grid"></div></div>';root.appendChild(el);
    }else if(type==='everywhere'){
      const el=document.createElement('section');el.className='section everywhere-showcase';
      el.innerHTML='<div class="container everywhere-grid"><div class="everywhere-image single"><img alt="G-MAX promotional image"></div><div class="everywhere-copy"><h2></h2><p></p><p></p></div></div>';root.appendChild(el);
    }else{
      const el=document.createElement('section');el.className='section custom-section';
      const wrap=document.createElement('div');wrap.className='container custom-section-inner';
      const title=document.createElement('h2');text(title,sec.title||sec.label||'New Section');wrap.appendChild(title);
      if(sec.subtitle){const sub=document.createElement('p');sub.className='custom-section-subtitle';text(sub,sec.subtitle);wrap.appendChild(sub)}
      if(sec.text){const p=document.createElement('p');p.className='custom-section-text';lines(p,sec.text);wrap.appendChild(p)}
      if(sec.image){const img=document.createElement('img');img.className='custom-section-image';img.src=sec.image;img.alt=sec.title||'G-MAX section image';wrap.appendChild(img)}
      if(sec.buttonLabel){const a=document.createElement('a');a.className='btn btn-outline custom-section-button';a.textContent=sec.buttonLabel;a.href=sec.buttonUrl||'#';wrap.appendChild(a)}
      el.appendChild(wrap);root.appendChild(el);
    }
  });
  bindMissionVision();
}
function applyGmaxSiteSettings(data){
  const s=data.site||{}, h=data.homepage||{};
  renderHomepageLayout(data);
  const root=document.documentElement;
  const colors=s.colors||{};
  if(colors.primary)root.style.setProperty('--blue',colors.primary);
  if(colors.secondary)root.style.setProperty('--navy',colors.secondary);
  if(colors.accent)root.style.setProperty('--orange',colors.accent);
  if(colors.success)root.style.setProperty('--green',colors.success);
  document.title=(s.brandName||'G-MAX')+' | '+(s.tagline||'Always Ahead');
  document.querySelectorAll('.logo img,.footer-logo img').forEach(img=>{if(s.logo)img.src=s.logo;img.alt=s.brandName||'G-MAX'});
  let fav=document.querySelector('link[rel="icon"]');
  if(!fav){fav=document.createElement('link');fav.rel='icon';document.head.appendChild(fav)}
  if(s.favicon)fav.href=s.favicon;
  const nav=(s.nav&&s.nav.length?s.nav:[{label:'Home',url:'#home',visible:true},{label:'About Us',url:'#about',visible:true},{label:'Services',url:'#services',visible:true},{label:'FAQ',url:'#faq',visible:true},{label:'Pricing',url:'#pricing',visible:true},{label:'Contact Us',url:'#contact',visible:true}]);
  document.querySelectorAll('.site-nav a').forEach((a,i)=>{const n=nav[i];if(!n)return;a.textContent=n.label||a.textContent;a.href=n.url||a.href;a.style.display=n.visible===false?'none':''});document.querySelectorAll('.footer-nav a').forEach(a=>{const n=nav.find(x=>x.url===a.getAttribute('href'));if(n){a.textContent=n.label;a.style.display=n.visible===false?'none':''}});
  const social=s.social||[];
  const ci=s.contactIcons||{};const iconMap=[ci.address||'fa-solid fa-location-dot',ci.email||'fa-regular fa-envelope',ci.phone||'fa-solid fa-phone'];document.querySelectorAll('.topbar-contact i,.footer-contact > a > i,.contact-item > i').forEach((el,i)=>{if(iconMap[i%3])el.className=iconMap[i%3]});
  document.querySelectorAll('.topbar-social span,.footer-social span').forEach((el,i)=>{
    const item=social[i];if(!item)return;
    el.style.display=item.visible===false?'none':'';
    el.innerHTML='<i class="'+(item.icon||'fa-brands fa-globe')+'"></i>';
    el.title=item.name||'Social media';
    el.onclick=()=>{if(item.url)window.open(item.url,'_blank','noopener,noreferrer')};
    el.style.cursor=item.url?'pointer':'default';
  });
  const wa=s.whatsapp||{};
  document.querySelectorAll('.whatsapp-widget').forEach(el=>{
    el.style.display=wa.enabled===false?'none':'';
    const number=String(wa.number||'').replace(/\D/g,'');
    if(number)el.href='https://wa.me/'+number;
    const span=el.querySelector('span');if(span&&wa.label)span.textContent=wa.label;
  });
  const sd=s.scrollDown||{};
  document.querySelectorAll('.scroll-down-widget').forEach(el=>{
    el.style.display=sd.enabled===false?'none':'';
    const i=el.querySelector('i');if(i&&sd.icon)i.className=sd.icon;
  });
  const hero=document.querySelector('.hero');
  if(hero&&h.heroImage){hero.style.backgroundImage='url("'+h.heroImage.replace(/"/g,'&quot;')+'")'}
  const hb=h.heroButton||{};
  const btn=document.querySelector('.hero-read-more');
  if(btn){if(hb.label)btn.textContent=hb.label;if(hb.url)btn.href=hb.url}
  const promo=h.images||[];
  document.querySelectorAll('.promo-grid img').forEach((img,i)=>{if(promo[i])img.src=promo[i]});
  const ev=h.everywhere||{};
  const evImg=document.querySelector('.everywhere-image img');if(evImg&&ev.image)evImg.src=ev.image;
  const evCopy=document.querySelector('.everywhere-copy');if(evCopy){const ps=evCopy.querySelectorAll('p');text(evCopy.querySelector('h2'),ev.title);if(ps[0])text(ps[0],ev.subtitle);if(ps[1])text(ps[1],ev.description)}
  document.querySelectorAll('.services-page .service-grid,.services-preview .service-grid').forEach(grid=>{
    grid.innerHTML='';
    (data.services||[]).forEach(service=>{
      const card=document.createElement('article');card.className='service-card';
      const icon=document.createElement('div');icon.className='service-icon';
      const i=document.createElement('i');i.className=service.icon||'fa-solid fa-circle';i.setAttribute('aria-hidden','true');icon.appendChild(i);
      const h=document.createElement('h3');text(h,service.name);
      const parts=String(service.description||'').split(/\r?\n/);
      const p1=document.createElement('p');text(p1,parts[0]||'');
      card.append(icon,h,p1);
      if(parts.length>1){const p2=document.createElement('p');text(p2,parts.slice(1).join(' '));card.appendChild(p2)}
      grid.appendChild(card);
    });
  });
  const about=data.about||{};const st=h.sectionTitles||{};text(document.querySelector('.about-showcase-copy h2'),st.about);text(document.querySelector('.showcase-commitments h3'),st.commitments);text(document.querySelector('.services-showcase-title'),st.services);
  const aboutImg=document.querySelector('.about-page-image img');if(aboutImg&&about.image)aboutImg.src=about.image;
  const pageTitles={
    '.page-hero h1':about.pageTitle||'About Us',
  };
  if(location.pathname.endsWith('/about.html')){text(document.querySelector('.page-hero h1'),about.pageTitle||'About Us');text(document.querySelector('.about-page-copy h2'),about.sectionTitle||'G-MAX LTD')}
  if(location.pathname.endsWith('/pricing.html')){text(document.querySelector('.page-hero h1'),data.pricingPage?.pageTitle||'Pricing');text(document.querySelector('.pricing-discover h2'),data.pricingPage?.sectionTitle||'Discover Our Best Packages')}
  if(location.pathname.endsWith('/faq.html')){text(document.querySelector('.page-hero h1'),data.faqPage?.pageTitle||'Frequently Asked Questions')}
  if(location.pathname.endsWith('/contact.html')){text(document.querySelector('.page-hero h1'),data.contactPage?.pageTitle||'Contact Us');text(document.querySelector('.contact-details h2'),data.contactPage?.sectionTitle||'G-MAX LTD')}
  const footer=document.querySelector('.copyright');if(footer&&s.footerCopyright)footer.textContent=s.footerCopyright.replace('{year}',new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded',loadGmaxContent);