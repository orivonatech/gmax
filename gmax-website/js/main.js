'use strict';

const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.site-nav');
const header=document.querySelector('.site-header');

if(menuButton&&navigation){
  menuButton.addEventListener('click',()=>{
    const open=navigation.classList.toggle('open');
    menuButton.classList.toggle('is-open',open);
    menuButton.setAttribute('aria-expanded',String(open));
  });
  navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    navigation.classList.remove('open');
    menuButton.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded','false');
  }));
}

document.querySelectorAll('[data-mission-vision]').forEach(group=>{
  const toggles=group.querySelectorAll('.mission-vision-toggle');
  const panels=group.querySelectorAll('.mission-vision-panel');

  toggles.forEach(toggle=>{
    toggle.addEventListener('click',()=>{
      const target=toggle.dataset.panel;
      const isOpen=toggle.getAttribute('aria-expanded')==='true';

      toggles.forEach(item=>{
        item.setAttribute('aria-expanded','false');
      });
      panels.forEach(panel=>{
        panel.hidden=true;
      });

      if(!isOpen){
        toggle.setAttribute('aria-expanded','true');
        const panel=group.querySelector('[data-panel-content="'+target+'"]');
        if(panel) panel.hidden=false;
      }
    });
  });
});

document.querySelectorAll('.pricing-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.pricing-tab,.price-panel').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.pricing-tab').forEach(item=>item.setAttribute('aria-selected','false'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected','true');
  const panel=document.getElementById(tab.dataset.target);
  if(panel) panel.classList.add('active');
}));

document.querySelectorAll('.faq-page details').forEach(detail=>detail.addEventListener('toggle',()=>{
  if(detail.open){
    detail.parentElement.querySelectorAll('details').forEach(other=>{
      if(other!==detail) other.removeAttribute('open');
    });
  }
}));

if(header){
  const updateHeader=()=>header.classList.toggle('is-scrolled',window.scrollY>8);
  updateHeader();
  window.addEventListener('scroll',updateHeader,{passive:true});
}

const revealItems=document.querySelectorAll('.service-card,.promo-image,.everywhere-image,.pricing-table-wrap,.faq-page details,.contact-item,.contact-note,.about-page-image');
revealItems.forEach((item,index)=>{
  item.classList.add('js-reveal');
  item.style.transitionDelay=Math.min(index*35,280)+'ms';
});

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12});
  revealItems.forEach(item=>observer.observe(item));
}else{
  revealItems.forEach(item=>item.classList.add('is-visible'));
}

document.getElementById('year')?.append(new Date().getFullYear());
