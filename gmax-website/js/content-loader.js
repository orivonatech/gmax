'use strict';
async function loadGmaxContent(){const preview=new URLSearchParams(location.search).get('preview')==='1';try{const r=await fetch('data/content.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Content unavailable');let data=await r.json();if(preview){try{const draft=JSON.parse(localStorage.getItem('gmax-admin-draft-v1')||'null');if(draft)data=draft}catch(e){}}applyGmaxSiteSettings(data);optimizePublicImages();window['dispatchEvent'](new Event('gmax-content-ready'))}catch(e){console.warn('G-MAX content loader:',e.message)}}
function text(el,v){if(el&&v!=null)el.textContent=v}
function lines(el,v){if(!el||v==null)return;el.textContent='';String(v).split(/\r?\n/).forEach((line,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(line))})}
function applyGmaxContent(data){const h=data.homepage||{},about=data.about||{},contact=data.contact||{},contactPage=data.contactPage||{};document.querySelectorAll('.topbar-contact span').forEach((el,i)=>{if(i===0)text(el,contact.address);if(i===1)text(el,contact.email);if(i===2)text(el,contact.phone)});document.querySelectorAll('.footer-contact > a').forEach((el,i)=>{const span=el.querySelector('span');if(i===0){text(span,contact.address);el.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(contact.address||'')}if(i===1){text(span,contact.email);el.href='mailto:'+(contact.email||'')}if(i===2){text(span,contact.phone);el.href='tel:'+(contact.phone||'').replace(/\s/g,'')}});document.querySelectorAll('.footer-brand p').forEach(el=>text(el,h.about||about.description));const hero=document.querySelector('.hero-content');if(hero&&!Array.isArray(h.heroSlides)){const ps=hero.querySelectorAll('p');text(hero.querySelector('h1'),h.heroHeading);text(ps[0],h.heroSubtitle);text(ps[1],h.heroDescription)}document.querySelectorAll('.about-showcase-copy .about-lead,.about-page-copy > p').forEach(el=>text(el,h.about||about.description));document.querySelectorAll('[data-panel-content="mission"] p').forEach(el=>text(el,h.mission));document.querySelectorAll('[data-panel-content="vision"] p').forEach(el=>text(el,h.vision));document.querySelectorAll('.showcase-commitments ul').forEach(ul=>{ul.innerHTML='';(h.commitments||[]).forEach(v=>{const li=document.createElement('li');text(li,v);ul.appendChild(li)})});document.querySelectorAll('.services-page .service-card,.services-preview .service-card').forEach((card,i)=>{const s=(data.services||[])[i];if(!s)return;const ps=card.querySelectorAll('p');text(card.querySelector('h3'),s.name);const parts=String(s.description||'').split(/\r?\n/);text(ps[0],parts[0]||'');if(ps[1])text(ps[1],parts.slice(1).join(' '));let link=card.querySelector('.service-read-more');if(s.url&&!link){link=document.createElement('a');link.className='service-read-more';card.appendChild(link)}if(link){link.textContent=s.linkLabel||'Read More';link.href=s.url;link.style.display=s.url?'inline-flex':'none'}});const pricing=data.pricing||{};['promo','volume','daily','mup'].forEach(key=>{const panel=document.getElementById(key);if(!panel)return;const tbody=panel.querySelector('tbody');if(!tbody)return;tbody.innerHTML='';(pricing[key]||[]).forEach(row=>{const tr=document.createElement('tr');[0,1,2].forEach(i=>{const td=document.createElement('td');text(td,row[i]||'');tr.appendChild(td)});tbody.appendChild(tr)})});const faq=data.faq||[],faqPage=document.querySelector('#faq .faq-page');if(faqPage){faqPage.innerHTML='';faq.forEach((item,i)=>{const d=document.createElement('details');if(i===0)d.open=true;const s=document.createElement('summary');text(s,item.question);const plus=document.createElement('span');plus.setAttribute('aria-hidden','true');plus.textContent='+';s.appendChild(plus);const p=document.createElement('p');lines(p,item.answer);d.append(s,p);faqPage.appendChild(d)})}const cd=document.querySelector('#contact .contact-details');if(cd){const intro=cd.querySelector('.contact-intro');if(intro)text(intro,contactPage?.intro||'Have a question, project, or service request? Send us a message and our team will get back to you.')}bindContactForms(contact.email||'sales@gmax.co.rw');}

function bindContactForms(recipient){
  document.querySelectorAll('.contact-form').forEach(form=>{
    if(form.dataset.bound==='1')return;
    form.dataset.bound='1';
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const status=form.querySelector('.contact-form-status');
      const data=new FormData(form);
      const name=String(data.get('name')||'').trim();
      const email=String(data.get('email')||'').trim();
      const phone=String(data.get('phone')||'').trim();
      const subject=String(data.get('subject')||'').trim();
      const message=String(data.get('message')||'').trim();
      if(!name||!email||!subject||!message||!form.checkValidity()){
        form.reportValidity();
        if(status){status.className='contact-form-status is-error';status.textContent='Please complete the required fields with a valid email address.'}
        return;
      }
      const body=[
        'Name: '+name,
        'Email: '+email,
        phone?'Phone: '+phone:'',
        '',
        message
      ].filter(Boolean).join('\n');
      const mailSubject=subject+' — G-MAX Website';
      window.location.href='mailto:'+recipient+'?subject='+encodeURIComponent(mailSubject)+'&body='+encodeURIComponent(body);
      if(status){status.className='contact-form-status is-success';status.textContent='Your email app is opening with the message ready to send.'}
    });
  });
}

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
function optimizePublicImages(){document.querySelectorAll('#homepage-builder img').forEach((img,i)=>{img.loading=i===0?'eager':'lazy';img.decoding='async'})}
function renderHomepageLayout(data){
  if(!location.pathname.endsWith('/index.html') && location.pathname!=='/' && location.pathname!=='')return;
  const root=document.getElementById('homepage-builder');if(!root)return;
  const h=data.homepage||{}, st=h.sectionTitles||{};
  const layout=Array.isArray(h.layout)&&h.layout.length?h.layout:[
    {id:'hero',type:'hero',label:'Hero',enabled:true},
    {id:'about',type:'about',label:'About G-MAX',enabled:true},
    {id:'commitments',type:'commitments',label:'Core Commitments',enabled:true},
    {id:'services',type:'services',label:'Our Services',enabled:true},
    {id:'everywhere',type:'everywhere',label:'We are everywhere',enabled:true},
    {id:'pricing',type:'pricing',label:'Pricing',enabled:true},
    {id:'faq',type:'faq',label:'FAQ',enabled:true},
    {id:'contact',type:'contact',label:'Contact Us',enabled:true}
  ];
  root.innerHTML='';
  layout.filter(sec=>sec && sec.enabled!==false).forEach(sec=>{
    const type=sec.type||'custom';
    if(type==='hero'){
      const el=document.createElement('section');el.id='hero';el.className='hero';
      el.innerHTML='<div class="hero-overlay"></div><div class="hero-carousel" data-hero-carousel><div class="hero-slides" data-hero-slides></div><button class="hero-carousel-arrow hero-carousel-prev" type="button" aria-label="Previous slide"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><button class="hero-carousel-arrow hero-carousel-next" type="button" aria-label="Next slide"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button><div class="hero-carousel-dots" data-hero-dots aria-label="Hero slides"></div></div>';root.appendChild(el);
    }else if(type==='about'){
      const el=document.createElement('section');el.id='about';el.className='section about-showcase';
      el.innerHTML='<div class="container about-showcase-grid"><div class="promo-grid" aria-label="G-MAX promotional images"><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div><div class="promo-image"><img alt="G-MAX promotional image"></div></div><div class="about-showcase-copy"><h2></h2><p class="about-lead"></p><div class="mission-vision"><div class="mission-vision-controls"><button type="button" class="mission-vision-toggle" data-panel="mission" aria-expanded="false"><span aria-hidden="true">+</span> Our Mission</button><button type="button" class="mission-vision-toggle" data-panel="vision" aria-expanded="false"><span aria-hidden="true">+</span> Our Vision</button></div><div class="mission-vision-panel" data-panel-content="mission" hidden><p></p></div><div class="mission-vision-panel" data-panel-content="vision" hidden><p></p></div></div><div class="showcase-commitments"><h3></h3><ul></ul></div></div></div>';root.appendChild(el);
    }else if(type==='commitments'){
      const el=document.createElement('section');el.className='section commitments-section';
      el.innerHTML='<div class="container"><div class="showcase-commitments"><h3></h3><ul></ul></div></div>';root.appendChild(el);
    }else if(type==='services'){
      const el=document.createElement('section');el.id='services';el.className='section services-preview';
      el.innerHTML='<div class="container services-showcase"><h2 class="services-showcase-title"></h2><div class="service-grid"></div></div>';root.appendChild(el);
    }else if(type==='everywhere'){
      const el=document.createElement('section');el.className='section everywhere-showcase';
      el.innerHTML='<div class="container everywhere-grid"><div class="everywhere-image single"><img alt="G-MAX promotional image"></div><div class="everywhere-copy"><h2></h2><p></p><p></p></div></div>';root.appendChild(el);
    }else if(type==='pricing'){
      const el=document.createElement('section');el.id='pricing';el.innerHTML='<section class="page-hero"><div><h1>Pricing</h1></div></section><section class="content-page"><div class="container pricing-page"><div class="pricing-tabs" role="tablist" aria-label="G-MAX packages"><button class="pricing-tab active" role="tab" aria-selected="true" data-target="promo">PROMO</button><button class="pricing-tab" role="tab" aria-selected="false" data-target="volume">Volume parks/Agahebuzo</button><button class="pricing-tab" role="tab" aria-selected="false" data-target="daily">Daily parks</button><button class="pricing-tab" role="tab" aria-selected="false" data-target="mup">Monthly Unlimited Pack(MUP)</button></div><div id="promo" class="price-panel active" role="tabpanel"><div class="pricing-table-wrap"><table class="pricing-table"><thead><tr><th>Plans</th><th>Validity</th><th>Bundles</th></tr></thead><tbody></tbody></table></div></div><div id="volume" class="price-panel" role="tabpanel"><div class="pricing-table-wrap"><table class="pricing-table"><thead><tr><th>Plans</th><th>Validity</th><th>Bundles</th></tr></thead><tbody></tbody></table></div></div><div id="daily" class="price-panel" role="tabpanel"><div class="pricing-table-wrap"><table class="pricing-table"><thead><tr><th>Plans</th><th>Validity</th><th>Bundles</th></tr></thead><tbody></tbody></table></div></div><div id="mup" class="price-panel" role="tabpanel"><div class="pricing-table-wrap"><table class="pricing-table"><thead><tr><th>Plans</th><th>Validity</th><th>Bundles</th></tr></thead><tbody></tbody></table></div></div></div></section>';root.appendChild(el);
    }else if(type==='faq'){
      const el=document.createElement('section');el.id='faq';el.innerHTML='<section class="page-hero"><div><h1>Frequently Asked Questions</h1></div></section><section class="content-page"><div class="container faq-page"></div></section>';root.appendChild(el);
    }else if(type==='contact'){
      const el=document.createElement('section');el.id='contact';el.innerHTML='<section class="page-hero"><div><h1>Contact Us</h1></div></section><section class="content-page"><div class="container contact-grid"><div class="contact-details"><h2>G-MAX LTD</h2><p class="contact-intro">Have a question, project, or service request? Send us a message and our team will get back to you.</p></div><div class="contact-form-wrap"><h3 class="contact-form-title">Send us a message</h3><form class="contact-form" novalidate><div class="contact-field"><label for="contact-name">Name</label><input id="contact-name" name="name" type="text" autocomplete="name" required></div><div class="contact-field"><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" autocomplete="email" required></div><div class="contact-field"><label for="contact-phone">Phone <span>(optional)</span></label><input id="contact-phone" name="phone" type="tel" autocomplete="tel"></div><div class="contact-field"><label for="contact-subject">Subject</label><input id="contact-subject" name="subject" type="text" required></div><div class="contact-field contact-field-full"><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="6" required></textarea></div><div class="contact-submit"><button class="btn" type="submit">Send Message</button><p class="contact-form-status" aria-live="polite"></p></div></form></div></div></section></section>';root.appendChild(el);
    }else{
      const el=document.createElement('section');el.id=String(sec.id||'custom-section').replace(/[^a-zA-Z0-9_-]/g,'-');el.className='section custom-section';
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
function renderHeroCarousel(data){
  const root=document.querySelector('.hero[data-carousel-ready]')||document.querySelector('.hero');
  if(!root)return;
  const h=data.homepage||{};
  const configured=Array.isArray(h.heroSlides)?h.heroSlides.filter(slide=>slide&&typeof slide==='object'&&(slide.title||slide.subtitle||slide.description)):[]; 
  const slides=configured.length?configured:[{title:h.heroHeading||'',subtitle:h.heroSubtitle||'',description:h.heroDescription||'',buttonLabel:(h.heroButton||{}).label||'Read More',url:(h.heroButton||{}).url||'#services'}];
  const track=root.querySelector('[data-hero-slides]'),dots=root.querySelector('[data-hero-dots]');
  if(!track||!dots)return;

  if(root._heroTimer)clearInterval(root._heroTimer);
  root._heroTimer=null;
  root._heroIndex=0;
  root._heroPaused=false;

  track.innerHTML='';
  dots.innerHTML='';

  slides.forEach((slide,index)=>{
    const item=document.createElement('article');
    item.className='hero-slide'+(index===0?' is-active':'');
    item.setAttribute('aria-hidden',index===0?'false':'true');
    const content=document.createElement('div');
    content.className='container hero-content';
    const title=document.createElement('h1');text(title,slide.title||'');
    const sub=document.createElement('p');text(sub,slide.subtitle||'');
    const desc=document.createElement('p');lines(desc,slide.description||'');
    content.append(title,sub,desc);
    if(slide.buttonLabel&&slide.url){
      const a=document.createElement('a');
      a.className='btn btn-outline hero-read-more';
      a.href=slide.url;
      a.textContent=slide.buttonLabel;
      content.appendChild(a);
    }
    item.appendChild(content);
    track.appendChild(item);

    const dot=document.createElement('button');
    dot.type='button';
    dot.className='hero-carousel-dot'+(index===0?' is-active':'');
    dot.setAttribute('aria-label','Go to slide '+(index+1));
    dot.setAttribute('aria-selected',index===0?'true':'false');
    dot.dataset.index=index;
    dots.appendChild(dot);
  });

  const setSlide=(next)=>{
    const total=slides.length;
    root._heroIndex=(next+total)%total;
    track.querySelectorAll('.hero-slide').forEach((slide,index)=>{
      const active=index===root._heroIndex;
      slide.classList.toggle('is-active',active);
      slide.setAttribute('aria-hidden',active?'false':'true');
    });
    dots.querySelectorAll('.hero-carousel-dot').forEach((dot,index)=>{
      const active=index===root._heroIndex;
      dot.classList.toggle('is-active',active);
      dot.setAttribute('aria-selected',active?'true':'false');
    });
  };

  const startAuto=()=>{
    if(slides.length<2||root._heroPaused||document.hidden)return;
    clearInterval(root._heroTimer);
    root._heroTimer=setInterval(()=>setSlide(root._heroIndex+1),6000);
  };
  const stopAuto=()=>{
    clearInterval(root._heroTimer);
    root._heroTimer=null;
  };

  const prev=root.querySelector('.hero-carousel-prev');
  const next=root.querySelector('.hero-carousel-next');
  if(prev)prev.onclick=()=>{setSlide(root._heroIndex-1);stopAuto();startAuto()};
  if(next)next.onclick=()=>{setSlide(root._heroIndex+1);stopAuto();startAuto()};
  dots.querySelectorAll('.hero-carousel-dot').forEach(dot=>{
    dot.onclick=()=>{setSlide(Number(dot.dataset.index));stopAuto();startAuto()};
  });

  const pause=()=>{root._heroPaused=true;stopAuto()};
  const resume=()=>{root._heroPaused=false;startAuto()};
  root.onmouseenter=pause;
  root.onmouseleave=resume;
  root.onfocusin=pause;
  root.onfocusout=resume;

  root.onkeydown=(event)=>{
    if(event.key==='ArrowLeft'){event.preventDefault();setSlide(root._heroIndex-1);stopAuto();startAuto()}
    if(event.key==='ArrowRight'){event.preventDefault();setSlide(root._heroIndex+1);stopAuto();startAuto()}
  };
  root.tabIndex=0;

  let touchStartX=0;
  root.ontouchstart=(event)=>{touchStartX=event.changedTouches[0]?.clientX||0};
  root.ontouchend=(event)=>{
    const endX=event.changedTouches[0]?.clientX||0;
    const delta=endX-touchStartX;
    if(Math.abs(delta)>45){
      setSlide(root._heroIndex+(delta<0?1:-1));
      stopAuto();startAuto();
    }
  };

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopAuto();
    else if(!root._heroPaused)startAuto();
  },{once:false});

  root.dataset.carouselReady='1';
  startAuto();
}
function applyGmaxSeo(s){
  const seo=s.seo||{},fallbackTitle=(s.brandName||'G-MAX')+' | '+(s.tagline||'Always Ahead');
  const title=seo.title||fallbackTitle,description=seo.description||'';
  document.title=title;
  const setMeta=(name,content,property)=>{
    if(!content)return;
    let el=document.head.querySelector(property?'meta[property="'+property+'"]':'meta[name="'+name+'"]');
    if(!el){el=document.createElement('meta');if(property)el.setAttribute('property',property);else el.setAttribute('name',name);document.head.appendChild(el)}
    el.setAttribute('content',content);
  };
  setMeta('description',description);
  setMeta('robots',seo.robots||'index,follow');
  setMeta('theme-color',seo.themeColor||(s.colors&&s.colors.secondary)||'#111111');
  setMeta('',title,'og:title');
  setMeta('',seo.ogDescription||description,'og:description');
  setMeta('',seo.ogImage||'','og:image');
  setMeta('',seo.canonicalUrl||location.href,'og:url');
  setMeta('', 'website','og:type');
  let canonical=document.head.querySelector('link[rel="canonical"]');
  if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}
  canonical.href=seo.canonicalUrl||'https://gmax.co.rw/';
}

function applyGmaxSiteSettings(data){
  const s=data.site||{}, h=data.homepage||{};
  renderHomepageLayout(data);
  renderHeroCarousel(data);
  applyGmaxContent(data);
  const root=document.documentElement;
  const colors=s.colors||{};
  if(colors.primary)root.style.setProperty('--blue',colors.primary);
  if(colors.secondary)root.style.setProperty('--navy',colors.secondary);
  if(colors.accent)root.style.setProperty('--orange',colors.accent);
  if(colors.success)root.style.setProperty('--green',colors.success);
  applyGmaxSeo(s);
  document.querySelectorAll('.logo img,.footer-logo img').forEach(img=>{if(s.logo)img.src=s.logo;img.alt=s.brandName||'G-MAX'});
  let fav=document.querySelector('link[rel="icon"]');
  if(!fav){fav=document.createElement('link');fav.rel='icon';document.head.appendChild(fav)}
  if(s.favicon)fav.href=s.favicon;
  const nav=(s.nav&&s.nav.length?s.nav:[{label:'Home',url:'#home',visible:true},{label:'About Us',url:'#about',visible:true},{label:'Services',url:'#services',visible:true},{label:'FAQ',url:'#faq',visible:true},{label:'Pricing',url:'#pricing',visible:true},{label:'Contact Us',url:'#contact',visible:true}]);
  document.querySelectorAll('.site-nav a').forEach((a,i)=>{const n=nav[i];if(!n)return;a.textContent=n.label||a.textContent;a.href=n.url||a.href;a.style.display=n.visible===false?'none':''});document.querySelectorAll('.footer-nav a').forEach(a=>{const n=nav.find(x=>x.url===a.getAttribute('href'));if(n){a.textContent=n.label;a.style.display=n.visible===false?'none':''}});
  const social=s.social||[];
  const ci=s.contactIcons||{};const iconMap=[ci.address||'fa-solid fa-location-dot',ci.email||'fa-regular fa-envelope',ci.phone||'fa-solid fa-phone'];document.querySelectorAll('.topbar-contact i,.footer-contact > a > i').forEach((el,i)=>{if(iconMap[i%3])el.className=iconMap[i%3]});
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
  if(btn){if(hb.label&&hb.url){btn.textContent=hb.label;btn.href=hb.url;btn.style.display=''}else{btn.style.display='none'}}
  const media=data.images||[];const mediaByRole=role=>{const item=media.find(x=>x&&x.role===role);return item||{}};
  const promo=Array.isArray(h.images)&&h.images.length?h.images:(data.images||[]).filter(x=>/^promo[1-3]$/.test(x?.role||'')).map(x=>x.path).filter(Boolean);
  document.querySelectorAll('.promo-grid img').forEach((img,i)=>{if(promo[i])img.src=promo[i];const meta=mediaByRole('promo'+(i+1));img.alt=meta.alt||'G-MAX promotional image'});
  const ev=h.everywhere||{};
  const evImg=document.querySelector('.everywhere-image img');if(evImg&&ev.image)evImg.src=ev.image;if(evImg)evImg.alt=mediaByRole('everywhere').alt||'G-MAX connectivity coverage';
  const evCopy=document.querySelector('.everywhere-copy');if(evCopy){const ps=evCopy.querySelectorAll('p');text(evCopy.querySelector('h2'),ev.title||'We are everywhere');if(ps[0])text(ps[0],ev.subtitle||'');if(ps[1])text(ps[1],ev.description||'');}
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
      if(service.url){
        const link=document.createElement('a');
        link.className='service-read-more';
        link.href=service.url;
        link.textContent=service.linkLabel||'Read More';
        card.appendChild(link);
      }
      grid.appendChild(card);
    });
  });
  const pricingPage=data.pricingPage||{},faqPageData=data.faqPage||{},contactPage=data.contactPage||{};
  text(document.querySelector('#pricing .page-hero h1'),pricingPage.pageTitle||'Pricing');
    text(document.querySelector('#faq .page-hero h1'),faqPageData.pageTitle||'Frequently Asked Questions');
  text(document.querySelector('#contact .page-hero h1'),contactPage.pageTitle||'Contact Us');
  text(document.querySelector('#contact .contact-details h2'),contactPage.sectionTitle||'G-MAX LTD');
  const about=data.about||{};const st=h.sectionTitles||{};text(document.querySelector('.about-showcase-copy h2'),st.about||'About G-MAX');text(document.querySelector('.showcase-commitments h3'),st.commitments||'Our Core Commitments');text(document.querySelector('.services-showcase-title'),st.services||'Our Services');
  const aboutImg=document.querySelector('.about-page-image img');if(aboutImg&&about.image)aboutImg.src=about.image;if(aboutImg)aboutImg.alt=mediaByRole('about').alt||'G-MAX office';
  const pageTitles={
    '.page-hero h1':about.pageTitle||'About Us',
  };
  if(location.pathname.endsWith('/about.html')){text(document.querySelector('.page-hero h1'),about.pageTitle||'About Us');text(document.querySelector('.about-page-copy h2'),about.sectionTitle||'G-MAX LTD')}
  if(location.pathname.endsWith('/faq.html')){text(document.querySelector('.page-hero h1'),data.faqPage?.pageTitle||'Frequently Asked Questions')}
  if(location.pathname.endsWith('/contact.html')){text(document.querySelector('.page-hero h1'),data.contactPage?.pageTitle||'Contact Us');text(document.querySelector('.contact-details h2'),data.contactPage?.sectionTitle||'G-MAX LTD')}
  const footer=document.querySelector('.copyright');if(footer&&s.footerCopyright)footer.textContent=s.footerCopyright.replace('{year}',new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded',loadGmaxContent);