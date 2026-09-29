'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const tabs = [...document.querySelectorAll('.pricing-tab')];
const panels = [...document.querySelectorAll('.price-panel')];

function activateTab(tab, moveFocus = false) {
  const panel = document.getElementById(tab.dataset.target);
  if (!panel) return;

  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });

  panels.forEach((item) => {
    const active = item === panel;
    item.classList.toggle('active', active);
    item.hidden = !active;
  });

  if (moveFocus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    activateTab(tabs[next], true);
  });
});

document.querySelectorAll('.faq-list details, .faq-page details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    detail.parentElement.querySelectorAll('details').forEach((other) => {
      if (other !== detail) other.removeAttribute('open');
    });
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
