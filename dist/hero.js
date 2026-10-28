/* Layered architectural hero. Manual, keyboard-accessible carousel; no autoplay. */
(() => {
  'use strict';
  const hero=document.querySelector('.hero-architectural');
  if(!hero)return;
  const primary=hero.querySelector('.hero-primary');
  const alternates=[...hero.querySelectorAll('.hero-alternate')];
  const hotspots=hero.querySelector('.hero-hotspots');
  const counter=hero.querySelector('#hero-counter');
  const description=hero.querySelector('#hero-description');
  const descriptions=['Arquitetura e interiores que traduzem quem você é.','Do primeiro traço aos detalhes que fazem uma casa ser sua.','Espaços que acolhem. Escolhas com intenção.'];
  let current=0;
  function show(index){
    current=(index+3)%3;
    hero.dataset.slide=String(current);
    primary.setAttribute('aria-hidden',String(current!==0));
    alternates.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(current!==i+1)));
    hotspots.inert=current!==0;
    hotspots.setAttribute('aria-hidden',String(current!==0));
    counter.textContent=`${String(current+1).padStart(2,'0')} / 03`;
    description.textContent=descriptions[current];
  }
  hero.querySelector('[data-hero-prev]').addEventListener('click',()=>show(current-1));
  hero.querySelector('[data-hero-next]').addEventListener('click',()=>show(current+1));
  hero.querySelector('#hero-visual').addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}
    if(event.key==='Home'){event.preventDefault();show(0);}
    if(event.key==='End'){event.preventDefault();show(2);}
  });
  hero.querySelector('#hero-menu').addEventListener('click',()=>document.querySelector('.menu-toggle').click());
  show(0);
})();
