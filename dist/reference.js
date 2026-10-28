/* UI behaviors translated from the user's export: stairs, tm-slider, mt-slider,
   300 ms tabs, 50 px swipes, 20 s carousel interval and 30 s interaction pause. */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const motion = () => document.documentElement.classList.contains('motion-enabled');
  const animate = (element, frames, options) => {
    if (motion() && element.animate) return element.animate(frames, options);
    return null;
  };
  const refresh = () => window.dispatchEvent(new Event('site:refresh'));
  function navigate(link) {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    const top = link.hash === '#experiencia' && motion()
      ? $('.opening').offsetTop + 800
      : target.getBoundingClientRect().top + scrollY - (link.hash === '#inicio' ? 0 : 95);
    window.dispatchEvent(new Event('site:cancel-scroll'));
    window.scrollTo({top:Math.max(0,top),behavior:motion()?'smooth':'instant'});
    try { history.pushState(null,'',link.hash); } catch (_) {}
    if (!target.matches('button,a,input,select,textarea')) target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
  }

  // Native dialog supplies focus trapping and Escape; panels supply choreography.
  const menu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  const menuContent = $('.menu-content', menu);
  const menuLines = $$('.menu-stairs>span', menu);
  let menuTween, menuOpener, afterClose;
  function closeMenu(callback) {
    if (!menu.open) { callback?.(); return; }
    afterClose = callback;
    menuTween?.kill();
    menuButton.setAttribute('aria-expanded','false');
    const finish = () => menu.close();
    if (!motion() || !window.gsap) { finish(); return; }
    menuTween = gsap.timeline({onComplete:finish})
      .to(menuContent,{opacity:0,duration:.25,ease:'power2.in'})
      .to(menuLines.filter(el=>getComputedStyle(el).display!=='none'),{scaleY:0,duration:.5,stagger:.2,ease:'power2.inOut'},.3);
  }
  function openMenu() {
    if (menu.open) return;
    menuOpener = document.activeElement;
    afterClose = null;
    menuTween?.kill();
    menu.showModal();
    document.body.classList.add('modal-open');
    menuButton.setAttribute('aria-expanded','true');
    const visibleLines = menuLines.filter(el=>getComputedStyle(el).display!=='none');
    if (motion() && window.gsap) {
      menuTween = gsap.timeline()
        .fromTo(visibleLines,{scaleY:0},{scaleY:1,duration:.5,stagger:.2,ease:'power2.inOut'},.1)
        .fromTo(menuContent,{opacity:0},{opacity:1,duration:.25},.1+(visibleLines.length-1)*.2+.5);
    } else {
      menuContent.style.opacity='1';
      menuLines.forEach(el=>el.style.transform='scaleY(1)');
    }
  }
  menuButton.addEventListener('click',()=>menu.open?closeMenu():openMenu());
  $('[data-close-menu]',menu).addEventListener('click',()=>closeMenu());
  menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
  menu.addEventListener('close',()=>{
    menuTween?.kill();
    document.body.classList.remove('modal-open');
    menuButton.setAttribute('aria-expanded','false');
    const callback=afterClose; afterClose=null;
    if(callback)callback(); else menuOpener?.focus({preventScroll:true});
  });
  $$('a[href^="#"]',menu).forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault(); closeMenu(()=>navigate(link));
  }));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link||link.closest('#mobile-menu')||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    if(!document.getElementById(link.hash.slice(1)))return;
    event.preventDefault();navigate(link);
  });

  // Two cross-fade gallery structures with pointer, swipe and keyboard controls.
  $$('[data-gallery]').forEach(gallery=>{
    const slides=$$('.gallery-slide',gallery), stage=$('.gallery-stage',gallery);
    const dots=$$('[data-gallery-to]',gallery);
    let index=0, pointerStart=null, dragged=false, initialized=false;
    let galleryAnimations=[];
    window.addEventListener('site:motion-change',()=>{
      if(!motion()){galleryAnimations.forEach(animation=>animation?.cancel());galleryAnimations=[];}
    });
    function show(next) {
      index=(next+slides.length)%slides.length;
      slides.forEach((slide,i)=>{
        const active=i===index;
        slide.classList.toggle('is-active',active);
        slide.inert=!active;
        slide.setAttribute('aria-hidden',String(!active));
      });
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
      $('[data-gallery-index]',gallery).textContent=String(index+1).padStart(2,'0');
      galleryAnimations.forEach(animation=>animation?.cancel());
      galleryAnimations=[];
      if(initialized&&motion()){
        const slide=slides[index], photo=$('.photo,img',slide), caption=$('.gallery-caption,.split-copy',slide);
        if(photo)galleryAnimations.push(animate(photo,[{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:1000,easing:'cubic-bezier(.22,1,.36,1)'}));
        if(caption)galleryAnimations.push(animate(caption,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'}));
      }
      initialized=true;
    }
    $('[data-gallery-prev]',gallery).addEventListener('click',()=>show(index-1));
    $('[data-gallery-next]',gallery).addEventListener('click',()=>show(index+1));
    dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.galleryTo))));
    stage.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();show(index+(event.key==='ArrowLeft'?-1:1));}
      if(event.key==='Home'){event.preventDefault();show(0);}
      if(event.key==='End'){event.preventDefault();show(slides.length-1);}
    });
    stage.addEventListener('pointerdown',event=>{
      if(event.button!==0||event.target.closest('a,button'))return;
      pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};dragged=false;
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointerup',event=>{
      if(!pointerStart||event.pointerId!==pointerStart.id)return;
      const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){dragged=true;show(index+(dx<0?1:-1));}
      pointerStart=null;
      if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    });
    stage.addEventListener('pointercancel',()=>{pointerStart=null;});
    stage.addEventListener('click',event=>{if(dragged){event.preventDefault();dragged=false;}},true);
    if(gallery.classList.contains('reference-gallery-split')){
      let resizeFrame;
      const measure=()=>{
        stage.style.height='';
        const copyHeight=Math.max(...slides.map(slide=>$('.split-copy',slide).scrollHeight));
        const imageHeight=innerWidth<=600?$('.split-photo',slides[0]).offsetHeight:0;
        stage.style.height=Math.max(stage.offsetHeight,imageHeight+copyHeight)+'px';
        refresh();
      };
      window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);});
      document.fonts?.ready.then(measure);
      measure();
    }
    show(0);
  });

  // Card gallery retains native scrolling and links, with optional source autoplay.
  $$('[data-card-gallery]').forEach(gallery=>{
    const track=$('[data-card-track]',gallery),cards=[...track.children];
    const previous=$('[data-card-prev]',gallery),next=$('[data-card-next]',gallery),play=$('[data-card-play]',gallery);
    let index=0, timer, restartTimer, frame, drag=null, dragged=false, userPaused=false, visible=false, hovered=false;
    function update() {
      const first=cards[0].offsetLeft;
      index=cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-first-track.scrollLeft)<Math.abs(cards[best].offsetLeft-first-track.scrollLeft)?i:best,0);
      $('[data-card-status]',gallery).textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      previous.disabled=track.scrollLeft<2;
      next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
    }
    function stop(){clearInterval(timer);timer=null;}
    function schedule(){
      stop();
      const allowed=!userPaused&&motion();
      play.setAttribute('aria-pressed',String(allowed));
      play.setAttribute('aria-label',allowed?'Pausar avanço automático':'Ativar avanço automático');
      play.textContent=allowed?'Ⅱ':'▷';
      play.disabled=!motion();
      if(allowed&&visible&&!document.hidden&&!hovered&&(!gallery.contains(document.activeElement)||document.activeElement===play))timer=setInterval(()=>{
        const atEnd=track.scrollLeft+track.clientWidth>=track.scrollWidth-3;
        go(atEnd?0:index+1,false);
      },20000);
    }
    function pauseForInteraction(){stop();clearTimeout(restartTimer);restartTimer=setTimeout(schedule,30000);}
    function go(target,manual=true){
      const i=Math.max(0,Math.min(cards.length-1,target));
      track.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:motion()?'smooth':'instant'});
      if(manual)pauseForInteraction();
    }
    previous.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
    play.addEventListener('click',()=>{userPaused=!userPaused;clearTimeout(restartTimer);schedule();});
    track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
    track.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();go(index+(event.key==='ArrowLeft'?-1:1));}
    });
    track.addEventListener('pointerdown',event=>{
      pauseForInteraction();
      if(event.pointerType!=='mouse'||event.button!==0)return;
      drag={x:event.clientX,left:track.scrollLeft,id:event.pointerId};dragged=false;
    });
    track.addEventListener('pointermove',event=>{
      if(!drag)return;
      const distance=event.clientX-drag.x;
      if(Math.abs(distance)>5){
        dragged=true;track.classList.add('is-dragging');
        track.setPointerCapture(event.pointerId);track.scrollLeft=drag.left-distance;
      }
    });
    function endDrag(event){
      if(!drag)return;drag=null;track.classList.remove('is-dragging');
      if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
      update();
    }
    track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);
    track.addEventListener('dragstart',event=>event.preventDefault());
    track.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
    gallery.addEventListener('mouseenter',()=>{hovered=true;stop();});
    gallery.addEventListener('mouseleave',()=>{hovered=false;pauseForInteraction();});
    gallery.addEventListener('focusin',stop);gallery.addEventListener('focusout',pauseForInteraction);
    document.addEventListener('visibilitychange',schedule);
    window.addEventListener('site:motion-change',schedule);
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(gallery);
    else {visible=true;schedule();}
    window.addEventListener('resize',update); update();
  });

  // The plan and material tabs use the supplied 300 ms content transition.
  $$('[data-plan]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.plan);
    $$('[data-plan]').forEach(item=>{const selected=Number(item.dataset.plan)===index;item.classList.toggle('is-active',selected);item.setAttribute('aria-pressed',String(selected));});
    $$('.plan-copy-stack article').forEach((panel,i)=>{
      panel.hidden=i!==index;
      if(i===index)animate(panel,[{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
    });
  }));
  // Source help-pop pointer hint; never replaces the native pointer or focus.
  const cursor=$('.reference-cursor');
  let cursorFrame;
  $$('[data-project]').forEach(button=>{
    button.addEventListener('pointerenter',event=>{
      if(event.pointerType==='mouse'&&innerWidth>1200&&motion())cursor.classList.add('is-visible');
    });
    button.addEventListener('pointermove',event=>{
      if(!cursor.classList.contains('is-visible'))return;
      cancelAnimationFrame(cursorFrame);
      cursorFrame=requestAnimationFrame(()=>cursor.style.transform=`translate(${event.clientX-50}px,${event.clientY-50}px)`);
    });
    button.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
    button.addEventListener('click',()=>cursor.classList.remove('is-visible'));
  });
  window.addEventListener('site:motion-change',()=>cursor.classList.remove('is-visible'));

  // Keep native wheel, touch and keyboard scrolling. GSAP's scrub smooths the
  // artwork, without capping a wheel gesture to 225px or fighting browser input.

  // The opening is a skippable brand sequence, not a simulated loading meter.
  const intro=$('#brand-intro');
  let introTimer, closingTimer, introFinished=false;
  function finishIntro(){
    if(introFinished)return;introFinished=true;
    clearTimeout(introTimer);clearTimeout(closingTimer);
    intro.close();document.body.classList.remove('modal-open');
    window.dispatchEvent(new Event('site:enter'));
  }
  $('.intro-skip',intro).addEventListener('click',finishIntro);
  intro.addEventListener('cancel',event=>{event.preventDefault();finishIntro();});
  window.addEventListener('site:motion-change',()=>{if(!motion()&&intro.open)finishIntro();});
  if(motion()&&scrollY<80&&(!location.hash||location.hash==='#inicio')){
    intro.showModal();document.body.classList.add('modal-open');
    introTimer=setTimeout(()=>{intro.classList.add('is-ending');closingTimer=setTimeout(finishIntro,800);},6000);
  }else finishIntro();
  document.fonts?.ready.then(refresh);
})();
