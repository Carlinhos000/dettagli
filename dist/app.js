/* Dettagli interface. Profile data lives in site-data.js; motion in motion.js. */
(() => {
  'use strict';
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const data=window.DETTAGLI;
  const queueScrollUpdate=()=>window.dispatchEvent(new Event('site:refresh'));
  $('#year').textContent=new Date().getFullYear();
  if(data.address)$('#business-address').textContent=data.address;
  if(data.hours)$('#business-hours').textContent=data.hours;
  const webUrl=value=>{try{const url=new URL(value,location.href);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}};
  if(data.website&&webUrl(data.website)){
    $('#business-website-row').hidden=false;
    $('#business-website').href=webUrl(data.website);
    $('#business-website').textContent=data.website;
  }
  const cards=$$('.project-card');
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    $$('[data-filter]').forEach(item=>{item.classList.toggle('is-active',item===button);item.setAttribute('aria-pressed',String(item===button));});
    let count=0;
    cards.forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});
    $('#project-grid').classList.toggle('is-filtered',button.dataset.filter!=='all');
    $('#project-grid').scrollLeft=0;
    $('#project-count').textContent=`${count} ${count===1?'ambiente em exibição':'ambientes em exibição'}.`;
    queueScrollUpdate();
  }));
  const tabs=$$('[data-media-tab]');
  function selectTab(button){
    tabs.forEach(tab=>{const active=tab===button;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$('#'+tab.getAttribute('aria-controls')).hidden=!active;});
    queueScrollUpdate();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectTab(tab));
    tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[next]);tabs[next].focus();}});
  });
  if(data.videos?.length){
    for(const item of data.videos){
      const url=webUrl(item.src);if(!url)continue;
      const article=document.createElement('article'),video=document.createElement('video'),title=document.createElement('h3');
      video.src=url;video.controls=true;video.preload='none';video.playsInline=true;
      if(item.poster&&webUrl(item.poster))video.poster=webUrl(item.poster);
      title.textContent=item.title||'Filme do ambiente';
      article.append(video,title);$('#video-grid').append(article);
    }
    if($('#video-grid').children.length)$('.video-empty').hidden=true;
  }
  if(data.reviews?.length){
    const panel=$('#reviews-content');panel.replaceChildren();
    data.reviews.forEach(review=>{
      if(!review.text||!review.author)return;
      const quote=document.createElement('blockquote'),cite=document.createElement('cite');
      quote.textContent=review.text;cite.textContent=review.author;
      panel.append(quote,cite);
    });
    const source=document.createElement('a');source.className='text-link';source.href=data.maps;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Ver avaliações no Google';panel.append(source);
  }
  const projects=data.projects,projectDialog=$('#project-dialog');
  let currentProject=0,projectOpener;
  function renderProject(index){
    currentProject=(index+projects.length)%projects.length;
    const project=projects[currentProject];
    $('#dialog-photo').setAttribute('viewBox',project.viewBox);
    $('#dialog-photo').setAttribute('aria-label',project.label);
    $('#dialog-image-source').setAttribute('href',project.src);
    $('#dialog-image-source').setAttribute('height',project.height);
    $('#dialog-image-source').setAttribute('width',project.width || 1600);
    $('#dialog-photo').classList.toggle('photo-enhanced',Boolean(project.illustrative));
    $('.image-disclaimer',projectDialog).textContent=project.illustrative?'Releitura ilustrativa criada com IA a partir da referência fornecida.':'Imagem original fornecida para esta apresentação.';
    $('#project-dialog-title').textContent=project.name;
    $('#dialog-description').textContent=project.description;
    $('#dialog-material').textContent=project.label;
    $('#dialog-application').textContent=project.service;
    $('#dialog-index').textContent=`${String(currentProject+1).padStart(2,'0')} / ${projects.length}`;
    if(document.documentElement.classList.contains('motion-enabled'))$('#dialog-photo').animate([{opacity:.4},{opacity:1}],{duration:300});
  }
  $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    projectOpener=button;renderProject(Number(button.dataset.project));projectDialog.showModal();document.body.classList.add('modal-open');
  }));
  $('.dialog-close').addEventListener('click',()=>projectDialog.close());
  projectDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');projectOpener?.focus({preventScroll:true});});
  projectDialog.addEventListener('click',event=>{if(event.target===projectDialog){const rect=projectDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)projectDialog.close();}});
  $('#project-prev').addEventListener('click',()=>renderProject(currentProject-1));
  $('#project-next').addEventListener('click',()=>renderProject(currentProject+1));
  projectDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();renderProject(currentProject-1);}if(event.key==='ArrowRight'){event.preventDefault();renderProject(currentProject+1);}});
  $('#dialog-quote').addEventListener('click',()=>{
    const project=projects[currentProject];
    $('#environment').value=project.environment;$('#service').value=project.service;
    ['environment','service'].forEach(id=>{$('#'+id).removeAttribute('aria-invalid');$('#'+id+'-error').textContent='';});
    if(!$('#message').value.trim())$('#message').value=`Gostei do ambiente “${project.name}” e quero conversar sobre meu projeto.`;
    invalidateReadyMessage();projectDialog.close();
  });
  $$('[data-service]').forEach(link=>link.addEventListener('click',()=>{
    $('#service').value=link.dataset.service;$('#service').removeAttribute('aria-invalid');$('#service-error').textContent='';invalidateReadyMessage();
  }));
  function profileUrl(){
    if(location.protocol==='file:'||['localhost','127.0.0.1',''].includes(location.hostname))return data.maps;
    const url=new URL(location.href);url.search='';url.hash='';return url.href;
  }
  const profileText=()=>`${data.name}\nArquitetura, design de interiores e projetos residenciais.\n${data.phoneDisplay}\n${profileUrl()}\nLocalização: ${data.maps}`;
  const phoneDialog=$('#phone-dialog');let phoneOpener;
  function openPhone(){phoneOpener=document.activeElement;$('#phone-share').href=`https://wa.me/?text=${encodeURIComponent(profileText())}`;phoneDialog.showModal();document.body.classList.add('modal-open');}
  $('#send-phone').addEventListener('click',openPhone);
  $('[data-close-phone]').addEventListener('click',()=>phoneDialog.close());
  phoneDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');phoneOpener?.focus({preventScroll:true});});
  $('#share-profile').addEventListener('click',async()=>{
    const status=$('#profile-status');status.textContent='';
    if(navigator.share){try{await navigator.share({title:data.name,text:`${data.name} · ${data.phoneDisplay}`,url:profileUrl()});status.textContent='Compartilhamento concluído.';}catch(error){if(error.name!=='AbortError')openPhone();}}
    else if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(profileText());status.textContent='Perfil copiado. Cole na conversa ou aplicativo que preferir.';}catch{openPhone();}}
    else openPhone();
  });

  // No customer data is stored or sent by this site. The visitor sends in WhatsApp.
  const form = $('#quote-form');
  const submit = $('.form-submit');
  const formStatus = $('#form-status');
  const requiredFields = ['name', 'phone', 'environment', 'service'];
  const touched = new Set();
  const readyLink = $('#whatsapp-ready');
  let fileError = '';
  let selectedFile = null;
  let previewUrl = null;
  function invalidateReadyMessage() {
    readyLink.hidden = true;
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }
  function validate(id) {
    const input = $('#' + id);
    const value = input.value.trim();
    let error = '';
    if (!value) error = id === 'name' ? 'Informe seu nome.' : id === 'phone' ? 'Informe seu telefone ou WhatsApp.' : 'Selecione uma opção.';
    else if (id === 'name' && value.length < 2) error = 'Digite pelo menos 2 caracteres.';
    else if (id === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!/^\d{10,11}$/.test(digits) && !/^55\d{10,11}$/.test(digits)) error = 'Informe um telefone válido com DDD.';
    }
    $('#' + id + '-error').textContent = error;
    error ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
    return !error;
  }
  requiredFields.forEach(id => {
    const field = $('#' + id);
    field.addEventListener('blur', () => { touched.add(id); validate(id); });
    field.addEventListener('input', () => { if (touched.has(id)) validate(id); invalidateReadyMessage(); });
    field.addEventListener('change', () => { if (touched.has(id)) validate(id); invalidateReadyMessage(); });
  });
  $('#message').addEventListener('input', invalidateReadyMessage);
  function validateWebsite() {
    const input=$('#website'); let error='';
    if(input.value.trim()) { try {const url=new URL(input.value.trim()); if(!['https:','http:'].includes(url.protocol))throw new Error();}catch{error='Informe um endereço completo começando com https://.';} }
    $('#website-error').textContent=error;
    if(error) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');
    return !error;
  }
  $('#website').addEventListener('blur',validateWebsite);
  $('#website').addEventListener('input',()=>{invalidateReadyMessage();if($('#website').hasAttribute('aria-invalid'))validateWebsite();});
  const fileInput = $('#reference-file');
  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    selectedFile = null;
    fileError = '';
    fileInput.value = '';
    fileInput.removeAttribute('aria-invalid');
    $('#file-error').textContent = '';
    $('#file-preview').hidden = true;
    $('#file-thumb').hidden = true;
    $('#file-label').innerHTML = 'Adicionar imagem ou projeto<small>JPG, PNG, WebP ou PDF · até 10 MB</small>';
    $('#share-file').hidden = true;
    invalidateReadyMessage();
  }
  fileInput.addEventListener('change', () => {
    invalidateReadyMessage();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    selectedFile = null;
    const file = fileInput.files?.[0];
    fileError = '';
    $('#file-preview').hidden = true;
    $('#file-thumb').hidden = true;
    if (!file) { clearFile(); return; }
    if (!/\.(jpe?g|png|webp|pdf)$/i.test(file.name) || (file.type && !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type))) fileError = 'Escolha uma imagem JPG, PNG, WebP ou um PDF.';
    else if (file.size > 10 * 1024 * 1024) fileError = 'O arquivo deve ter no máximo 10 MB.';
    else if (!file.size) fileError = 'O arquivo está vazio. Escolha outra referência.';
    $('#file-error').textContent = fileError;
    if (fileError) {
      fileInput.setAttribute('aria-invalid', 'true');
      $('#file-preview').hidden = false;
      $('#file-name').textContent = file.name;
      $('#file-label').innerHTML = 'Escolha outra referência<small>Formato ou tamanho não permitido.</small>';
      return;
    }
    fileInput.removeAttribute('aria-invalid');
    selectedFile = file;
    $('#file-label').innerHTML = 'Referência selecionada<small>Você também pode escolher outro arquivo.</small>';
    $('#file-name').textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    $('#file-preview').hidden = false;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      $('#file-thumb').src = previewUrl;
      $('#file-thumb').hidden = false;
    }
    $('#share-file').hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
  });
  $('#remove-file').addEventListener('click', clearFile);
  $('#share-file').addEventListener('click', async () => {
    if (!selectedFile || !navigator.share) return;
    try {
      await navigator.share({ files: [selectedFile], title: 'Referência para meu projeto — Dettagli Arquitetura' });
      formStatus.className = 'form-status is-success';
      formStatus.textContent = 'A referência foi encaminhada ao compartilhamento do dispositivo.';
    } catch (error) {
      if (error.name !== 'AbortError') {
        formStatus.className = 'form-status is-error';
        formStatus.textContent = 'Não foi possível compartilhar por aqui. Anexe o arquivo diretamente na conversa do WhatsApp.';
      }
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const results = requiredFields.map(id => { touched.add(id); return validate(id); });
    const websiteValid = validateWebsite();
    if (results.includes(false) || fileError || !websiteValid) {
      formStatus.className = 'form-status is-error';
      formStatus.textContent = 'Revise os campos indicados para preparar seu orçamento.';
      const firstInvalid = requiredFields.find((id, index) => !results[index]);
      (firstInvalid ? $('#' + firstInvalid) : !websiteValid ? $('#website') : fileInput).focus();
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    $('span', submit).textContent = 'Preparando sua mensagem…';
    const lines = [
      'Olá, Dettagli Arquitetura! Gostaria de solicitar um orçamento.',
      '', `Nome: ${$('#name').value.trim()}`, `WhatsApp: ${$('#phone').value.trim()}`,
      `Ambiente: ${$('#environment').value}`, `Serviço: ${$('#service').value}`
    ];
    if ($('#website').value.trim()) lines.push(`Website ou referência: ${$('#website').value.trim()}`);
    if ($('#message').value.trim()) lines.push('', $('#message').value.trim());
    if (selectedFile) lines.push('', `Minha referência: ${selectedFile.name} (vou anexar o arquivo nesta conversa).`);
    const url = `https://wa.me/5571992545650?text=${encodeURIComponent(lines.join('\n'))}`;
    readyLink.href = url;
    readyLink.hidden = false;
    // This only opens a draft. Sending remains the visitor's explicit action.
    // The visitor opens the prepared conversation with the visible link below.
    requestAnimationFrame(() => {
      formStatus.className = 'form-status is-success';
      formStatus.textContent = selectedFile
        ? 'Mensagem pronta. Abra o WhatsApp pelo botão abaixo, anexe sua referência e confirme o envio.'
        : 'Mensagem pronta. Use o botão abaixo para revisar e enviar no WhatsApp.';
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      $('span', submit).textContent = 'Preparar orçamento pelo WhatsApp';
    });
  });
})();
