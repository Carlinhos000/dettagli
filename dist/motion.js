/* Choreography reconstructed from the supplied Tilda export and reference film.
 * Native scrolling; CSS sticky stages; reversible GSAP ScrollTrigger timelines.
 * Reference gestures: video-dive, random-rise, opposing ±600px columns,
 * 360×374 center mask, 15s directional marquees and staggered fixed overlays.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const toggle = $('.motion-toggle');
  let preference;
  // The animated preview is an explicit choice from this brief. The regular
  // website still follows the operating system unless a visitor chooses otherwise.
  const preferenceKey = 'dettagli-motion-v1';
  try { preference = localStorage.getItem(preferenceKey); } catch (_) {}
  const explicit = new URLSearchParams(location.search).get('motion');
  if (explicit === 'full' || explicit === 'reduced') preference = explicit;
  else if (!preference && ['full', 'reduced'].includes(root.dataset.motion)) preference = root.dataset.motion;
  let enabled = preference ? preference === 'full' : !media.matches;
  let context;
  let entranceContext;
  let resizeFrame;
  let marqueeTweens = [];

  // Keep a single, intelligible accessible heading; decorative glyphs are hidden
  // from the accessibility tree. Words remain unbroken at every breakpoint.
  $$('.random-rise').forEach(heading => {
    const accessible = heading.cloneNode(true);
    accessible.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    heading.setAttribute('aria-label', accessible.textContent.replace(/\s+/g, ' ').trim());
    function split(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(word => {
            if (!word) return;
            if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(' ')); return; }
            const wrapper = document.createElement('span');
            wrapper.className = 'word'; wrapper.setAttribute('aria-hidden', 'true');
            [...word].forEach(letter => {
              const clip = document.createElement('span'); clip.className = 'char-clip';
              const glyph = document.createElement('span'); glyph.className = 'char'; glyph.textContent = letter;
              clip.append(glyph); wrapper.append(clip);
            });
            fragment.append(wrapper);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE) split(child);
      });
    }
    split(heading);
  });

  function updateHeader() {
    const about = $('.about-editorial');
    const pastIntro = about.getBoundingClientRect().top <= innerHeight * .2;
    $('.site-header').classList.toggle('is-scrolled', pastIntro);
    $('.site-header').classList.toggle('is-between', scrollY > 120 && !pastIntro);
    $('.site-header').classList.remove('is-mineral');
  }
  addEventListener('scroll', updateHeader, {passive:true});

  function setControl() {
    toggle.setAttribute('aria-pressed', String(enabled));
    $('.motion-toggle-label').textContent = enabled ? 'Pausar animações' : 'Ativar animações';
    $('.motion-toggle-icon').textContent = enabled ? 'Ⅱ' : '▷';
    toggle.title = enabled ? 'Exibir a versão com menos movimento' : 'Ativar a experiência de rolagem cinematográfica';
  }

  function createMotion() {
    if (entranceContext) { entranceContext.revert(); entranceContext=null; }
    if (context) context.revert();
    marqueeTweens = [];
    if (!window.gsap || !window.ScrollTrigger) enabled = false;
    root.classList.toggle('motion-enabled', enabled);
    root.classList.toggle('motion-reduced', !enabled);
    root.dataset.motionState = enabled ? 'initializing' : 'reduced';
    setControl();
    updateHeader();
    if (!enabled) {
      $$('.process-step').forEach(e => e.classList.add('is-current'));
      $('.process-list').style.setProperty('--progress', 1);
      window.dispatchEvent(new CustomEvent('site:motion-change',{detail:{enabled:false}}));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    context = gsap.context(() => {
      const narrow = innerWidth <= 600;
      const scrollScene = (selector, extra = {}) => ({
        trigger: selector, start: 'top top', end: 'bottom bottom', scrub: .65,
        invalidateOnRefresh: true,
        onUpdate: self => { $(selector).dataset.scrollProgress = self.progress.toFixed(3); },
        ...extra
      });
      gsap.to('.scroll-cue .icon',{y:7,duration:1.8,yoyo:true,repeat:-1,ease:'sine.inOut',
        scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',toggleActions:'play pause resume pause'}});
      // Three consecutive image dives from the rendered export. Source trigger
      // windows: 500-1005, 750-1177 and 1000-1343 px, shifted after the first plane.
      gsap.to('.hero-scene',{scale:1.045,ease:'none',
        scrollTrigger:{trigger:'.opening',start:'top top',end:'+=1000',scrub:true}});
      const openingStage = $('.opening-stage');
      gsap.set('.portal-plane',{width:10,height:1});
      gsap.set('.portal-image',{width:1,height:1,autoAlpha:0});
      gsap.set('.portal-image .photo',{scale:1.8});
      gsap.set('.portal-label,.portal-caption',{autoAlpha:0});
      const open = gsap.timeline({scrollTrigger:scrollScene('.opening',{scrub:true}),defaults:{ease:'none'}});
      open.to('.portal-plane',{height:()=>openingStage.clientHeight,duration:500},0)
        .to('.portal-plane',{width:()=>openingStage.clientWidth,duration:500},500)
        .to('.hero-bottom,.hero-topline,.hero-hotspots,.hero-footnote',{autoAlpha:0,duration:220},420)
        .to('.portal-label',{autoAlpha:1,duration:100},850)
        .to('.portal-label',{autoAlpha:0,duration:180},1150);
      const windows = [[950,505],[1200,427],[1450,343]];
      $$('.portal-image').forEach((image,i)=>{
        const [at,distance]=windows[i];
        open.to(image,{autoAlpha:1,duration:1},at)
          .to(image,{width:()=>openingStage.clientWidth,height:()=>openingStage.clientHeight,duration:distance},at)
          .to(image.querySelector('.photo'),{scale:1,duration:distance},at);
      });
      open.to('.portal-caption',{autoAlpha:1,duration:150},1795)
        .to('.scene-progress span',{scaleX:1,duration:2010},0);

      gsap.from('.credibility > div', {y:28,autoAlpha:0,stagger:.12,duration:.9,
        scrollTrigger:{trigger:'.credibility',start:'top 88%',toggleActions:'play none none reverse'}});

      // Same randomized 120% vertical glyph reveal as uc-random-rise in the export.
      if (innerWidth > 960) $$('.random-rise').forEach(heading => {
        gsap.fromTo(heading.querySelectorAll('.char'), {yPercent:120}, {
          yPercent:0, duration:1, stagger:{each:.05,from:'random'}, ease:'power3.out',
          scrollTrigger:{trigger:heading,start:'top 92%',end:'top 55%',scrub:true,invalidateOnRefresh:true}
        });
      });
      if (innerWidth > 960) {
        gsap.to('[data-editorial-drift]',{y:860,ease:'none',
          scrollTrigger:{trigger:'.about-editorial',start:'top center-=400',end:'+=2000',scrub:1,invalidateOnRefresh:true}});
      } else {
        $$('.random-rise').forEach(heading=>gsap.from(heading,{y:22,autoAlpha:0,duration:.8,ease:'power3.out',
          scrollTrigger:{trigger:heading,start:'top 92%',toggleActions:'play none none reverse'}}));
      }
      $$('[data-parallax]').forEach(element => {
        const shift = Number(element.dataset.parallax) * (narrow ? .32 : 1);
        gsap.fromTo(element, {y:0}, {y:shift,ease:'none',
          scrollTrigger:{trigger:element.parentElement,start:'top bottom',end:'bottom top',scrub:1,invalidateOnRefresh:true}});
      });
      $$('.reveal').forEach(element => {
        gsap.from(element, {y:32,autoAlpha:0,duration:1,ease:'power3.out',
          scrollTrigger:{trigger:element,start:'top 94%',toggleActions:'play none none reverse'}});
      });

      $$('.reference-panorama').forEach(section => {
        gsap.fromTo(section.querySelector('.panorama-media'),{y:-45,scale:1.1},{y:45,scale:1,ease:'none',
          scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true}});
      });

      if (innerWidth > 640) {
      const mask = gsap.timeline({scrollTrigger:scrollScene('.mask-scene'),defaults:{ease:'none'}});
      const baseMask = () => {
        const stage = $('.mask-stage');
        const w = innerWidth < 960 ? 300 : innerWidth < 1200 ? 400 : 360;
        const h = innerWidth < 960 ? 400 : innerWidth < 1200 ? 500 : 374;
        return `inset(${Math.max(0,(stage.clientHeight-h)/2)}px ${Math.max(0,(stage.clientWidth-w)/2)}px)`;
      };
      mask.fromTo('.mask-image',{clipPath:baseMask},{clipPath:'inset(0px 0px)',duration:.78},.05)
        .to('.mask-heading',{autoAlpha:0,duration:.25},.12)
        .fromTo('.mask-scene .marquee',{autoAlpha:0,y:60},{autoAlpha:1,y:0,duration:.18},.78)
        .to({}, {duration:.04}, .96);

      } else {
        gsap.set('.mask-image',{clipPath:'inset(0px 0px)'});
      }

      // uc-image-tr: transparent center window, 2000 x 1200 final size,
      // left/right columns move -600/+600, 1.1s scrub. Cards share this stage.
      const mosaic = gsap.timeline({scrollTrigger:scrollScene('.reference-mosaic',{scrub:1.1}),defaults:{ease:'none'}});
      gsap.set('.reference-mosaic .quality-note',{autoAlpha:0});
      mosaic.to('.dive-left',{y:-600,duration:.6},0)
        .to('.dive-right',{y:600,duration:.6},0)
        .to('.reference-mosaic .dive-stage',{'--center-w':()=>Math.max(2000,innerWidth+100)+'px','--window-h':()=>Math.max(1200,innerHeight+100)+'px',duration:.6},0)
        .fromTo('.mosaic-backdrop .photo',{scale:1.15},{scale:1,duration:.7},0)
        .fromTo('.reference-mosaic .marquee',{autoAlpha:0,y:80},{autoAlpha:1,y:0,duration:.15},.42)
        .to('.reference-mosaic .marquee',{bottom:narrow?'80%':'76%',duration:.3},.55);
      $$('.reference-mosaic .quality-note').forEach((note,i)=>{
        const y = narrow ? (i%2?25:0) : [0,65,-15,0,70,15][i];
        mosaic.fromTo(note,{y:y+300,autoAlpha:0},{y,autoAlpha:1,duration:.2,ease:'power2.out'},.6+i*.04);
      });
      mosaic.to('.mosaic-backdrop',{scale:()=>innerWidth>960?.88:1,y:()=>innerWidth>960?-36:0,duration:.45},.55)
        .to({}, {duration:.1}, 1);

      const process = $('.process-list');
      ScrollTrigger.create({trigger:process,start:'top 65%',end:'bottom 65%',scrub:true,
        onUpdate:self=>{
          process.style.setProperty('--progress',self.progress.toFixed(4));
          $$('.process-step').forEach((step,i)=>step.classList.toggle('is-current',self.progress>=(i+.1)/$('.process-step').length));
        }});
      $$('.process-step').forEach(step => gsap.from(step,{autoAlpha:.35,y:35,duration:.8,
        scrollTrigger:{trigger:step,start:'top 88%',end:'top 55%',scrub:true}}));

      const closing = gsap.timeline({scrollTrigger:scrollScene('.closing-scene'),defaults:{ease:'none'}});
      closing.fromTo('.closing-image',{clipPath:narrow?'inset(20% 15%)':'inset(26% 34%)',scale:1.12},{clipPath:'inset(0% 0%)',scale:1,duration:.7},0)
        .fromTo('.closing-copy',{autoAlpha:0},{autoAlpha:1,duration:.25},.55)
        .fromTo('.closing-scene .marquee',{autoAlpha:0,y:50},{autoAlpha:1,y:0,duration:.2},.8);

      // A complete repeat takes 15 seconds, matching the supplied marquee.
      $$('.marquee-track').forEach(track => {
        const tween = gsap.fromTo(track,{xPercent:-25},{xPercent:-50,duration:15,repeat:-1,ease:'none',paused:true});
        marqueeTweens.push({tween, element:track.parentElement.parentElement});
        ScrollTrigger.create({trigger:track.parentElement.parentElement,start:'top bottom',end:'bottom top',
          onToggle:self=>self.isActive&&!document.hidden?tween.resume():tween.pause(),
          onUpdate:self=>{tween.timeScale(self.direction===1?1:-1);if(tween.totalTime()<16)tween.totalTime(1500);}
        });
      });
    });
    ScrollTrigger.refresh();
    root.dataset.motionState = 'running';
    window.dispatchEvent(new CustomEvent('site:motion-change',{detail:{enabled:true}}));
  }

  toggle.addEventListener('click', () => {
    // Preserve the visible section when reducing the height of pinned sequences.
    const stages = $$('main > section');
    const visible = stages.find(el => {const r=el.getBoundingClientRect();return r.top<=innerHeight*.4&&r.bottom>innerHeight*.4;});
    const relative = visible ? Math.max(0, (scrollY-visible.offsetTop)/Math.max(1,visible.offsetHeight-innerHeight)) : 0;
    enabled=!enabled; preference=enabled?'full':'reduced';
    try {localStorage.setItem(preferenceKey,preference);} catch (_) {}
    createMotion();
    if(visible)scrollTo({top:visible.offsetTop+relative*Math.max(0,visible.offsetHeight-innerHeight),behavior:'instant'});
  });
  media.addEventListener('change',()=>{if(!preference){enabled=!media.matches;createMotion();}});
  window.addEventListener('site:refresh',()=>{if(enabled&&window.ScrollTrigger)ScrollTrigger.refresh();});
  // Refresh dimensions after images/fonts settle, without resetting the timelines.
  addEventListener('load',()=>{if(enabled&&window.ScrollTrigger)ScrollTrigger.refresh();});
  let previousWidth=innerWidth;
  addEventListener('resize',()=>{
    if(Math.abs(previousWidth-innerWidth)<20)return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{previousWidth=innerWidth;createMotion();});
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)marqueeTweens.forEach(({tween})=>tween.pause());
    else if(enabled&&window.ScrollTrigger){
      marqueeTweens.forEach(({tween,element})=>{const r=element.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)tween.resume();});
      ScrollTrigger.refresh();
    }
  });
  window.addEventListener('site:enter',()=>{
    if(!enabled||!window.gsap)return;
    entranceContext=gsap.context(()=>gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.hero-brand',{y:55,autoAlpha:0,duration:1.1},0)
      .from('.hero h1',{y:35,autoAlpha:0,duration:1},.15)
      .from('.hero-bottom',{y:25,autoAlpha:0,duration:.9},.3));
  },{once:true});
  createMotion();
  document.fonts?.ready.then(()=>{if(enabled&&window.ScrollTrigger)ScrollTrigger.refresh();});
})();
