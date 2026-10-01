'use strict';

function makeFooterLogoTransparent(){
  document.querySelectorAll('.footer-logo img').forEach(img=>{
    if(img.dataset.transparentProcessed==='1')return;
    const process=()=>{
      if(!img.naturalWidth||!img.naturalHeight)return;
      try{
        const canvas=document.createElement('canvas');
        canvas.width=img.naturalWidth;
        canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});
        if(!ctx)return;
        ctx.drawImage(img,0,0);
        const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
        const data=imageData.data;
        for(let i=0;i<data.length;i+=4){
          const r=data[i],g=data[i+1],b=data[i+2];
          const brightness=(r+g+b)/3;
          const chroma=Math.max(r,g,b)-Math.min(r,g,b);
          if(brightness>=225&&chroma<18)data[i+3]=0;
        }
        ctx.putImageData(imageData,0,0);
        img.src=canvas.toDataURL('image/png');
        img.dataset.transparentProcessed='1';
      }catch(e){
        console.warn('G-MAX footer logo transparency:',e.message);
      }
    };
    if(img.complete)process();
    else img.addEventListener('load',process,{once:true});
  });
}

function initGmaxInteractions(){
  makeFooterLogoTransparent();
  const menuButton=document.querySelector('.menu-toggle');
  const navigation=document.querySelector('.site-nav');
  const header=document.querySelector('.site-header');

  if(menuButton&&navigation&&!menuButton.dataset.bound){
    menuButton.dataset.bound='1';
    menuButton.addEventListener('click',()=>{
      const open=navigation.classList.toggle('open');
      menuButton.classList.toggle('is-open',open);
      menuButton.setAttribute('aria-expanded',String(open));
      menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    });
    navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      navigation.classList.remove('open');
      menuButton.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded','false');
      menuButton.setAttribute('aria-label','Open navigation');
    }));
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape' && navigation.classList.contains('open')){
        navigation.classList.remove('open');
        menuButton.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded','false');
        menuButton.setAttribute('aria-label','Open navigation');
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-mission-vision]').forEach(group=>{
    const toggles=group.querySelectorAll('.mission-vision-toggle');
    const panels=group.querySelectorAll('.mission-vision-panel');
    toggles.forEach(toggle=>{
      if(toggle.dataset.bound==='1')return;
      toggle.dataset.bound='1';
      toggle.addEventListener('click',()=>{
        const target=toggle.dataset.panel;
        const isOpen=toggle.getAttribute('aria-expanded')==='true';
        toggles.forEach(item=>item.setAttribute('aria-expanded','false'));
        panels.forEach(panel=>panel.hidden=true);
        if(!isOpen){
          toggle.setAttribute('aria-expanded','true');
          const panel=group.querySelector('[data-panel-content="'+target+'"]');
          if(panel)panel.hidden=false;
        }
      });
    });
  });

  document.querySelectorAll('.pricing-tab').forEach(tab=>{
    if(tab.dataset.bound==='1')return;
    tab.dataset.bound='1';
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.pricing-tab,.price-panel').forEach(el=>el.classList.remove('active'));
      document.querySelectorAll('.pricing-tab').forEach(item=>item.setAttribute('aria-selected','false'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const panel=document.getElementById(tab.dataset.target);
      if(panel)panel.classList.add('active');
    });
  });

  document.querySelectorAll('.faq-page details').forEach(detail=>{
    if(detail.dataset.bound==='1')return;
    detail.dataset.bound='1';
    detail.addEventListener('toggle',()=>{
      if(detail.open)detail.parentElement.querySelectorAll('details').forEach(other=>{
        if(other!==detail)other.removeAttribute('open');
      });
    });
  });

  if(header&&!header.dataset.bound){
    header.dataset.bound='1';
    const updateHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>8);
    updateHeader();
    window.addEventListener('scroll',updateHeader,{passive:true});
  }

  const scrollDownButton=document.querySelector('.scroll-down-widget');
  if(scrollDownButton&&!scrollDownButton.dataset.bound){
    scrollDownButton.dataset.bound='1';
    scrollDownButton.addEventListener('click',()=>{
      const nextSection=document.querySelector('#about')||document.querySelector('main > section:nth-of-type(2)');
      if(nextSection)nextSection.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  const revealItems=document.querySelectorAll('.service-card,.promo-image,.everywhere-image,.pricing-table-wrap,.faq-page details,.contact-item,.contact-note,.about-page-image');
  revealItems.forEach((item,index)=>{
    if(!item.classList.contains('js-reveal')){
      item.classList.add('js-reveal');
      item.style.transitionDelay=Math.min(index*35,280)+'ms';
    }
  });
  if('IntersectionObserver' in window){
    if(!window.gmaxRevealObserver){
      window.gmaxRevealObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            window.gmaxRevealObserver.unobserve(entry.target);
          }
        });
      },{threshold:.12});
    }
    revealItems.forEach(item=>window.gmaxRevealObserver.observe(item));
  }else revealItems.forEach(item=>item.classList.add('is-visible'));

  const updateActiveNav=()=>{
    const links=[...document.querySelectorAll('.site-nav a[href^="#"]')];
    const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
    let current='home';
    const marker=window.scrollY+window.innerHeight*.25;
    sections.forEach(section=>{if(section.offsetTop<=marker)current=section.id});
    links.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+current));
  };
  if(!window.gmaxNavBound){
    window.gmaxNavBound=true;
    window.addEventListener('scroll',updateActiveNav,{passive:true});
  }
  updateActiveNav();
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('year')?.append(new Date().getFullYear());
  initGmaxInteractions();
});
window.addEventListener('gmax-content-ready',initGmaxInteractions);
