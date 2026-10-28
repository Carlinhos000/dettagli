# Dettagli Arquitetura

Site institucional estático para arquitetura, design de interiores e projetos residenciais.

## Abrir e hospedar

- `dist/index.html`: site para hospedagem, com imagens, fontes e bibliotecas locais.
- Em uma hospedagem estática, use `dist` como pasta de publicação; não há instalação nem build obrigatório.
- `npm run build` gera a versão portátil `dettagli-arquitetura.html`, com os recursos incorporados. Esse arquivo é gerado localmente e fica fora do controle do Git para evitar duplicar todos os assets.

Com Node.js instalado, `npm run dev` inicia a prévia local. Os scripts usam apenas bibliotecas nativas do Node; não há dependências para instalar. Depois de alterar o conteúdo em `dist`, rode `npm run build` para atualizar a versão portátil.

## Conteúdo e imagens

O ZIP fornecido em 27/10/2026 contém 13 imagens JPEG. Todas estão preservadas em `dist/assets/dettagli/`. A galeria mantém os 13 ambientes; as imagens principais receberam releituras ilustrativas em alta definição, criadas com IA a partir das referências. O enquadramento é feito por SVG no navegador.

As oito novas imagens estão em `dist/assets/dettagli/editorial/`, em WebP otimizado (1672 × 941). Incluem a casa da hero, duas salas, quarto, fachada, piscina, casa em madeira e reforma. As releituras são identificadas como ilustrativas. Os demais registros conservam as imagens originais. Títulos da galeria são descritivos, sem inventar nomes de obras, localização, clientes ou autoria comprovada. Consulte `IMAGE-DIRECTION.md` para direção, origem e prompts.

A nova hero reproduz a composição visual da referência: imagem de fundo, texto HTML “DETTAGLI” e uma segunda camada da mesma fotografia, recortada em CSS sobre o telhado e a chaminé. `atelier.css` contém o layout e a paleta mineral quente; `hero.js` controla a galeria manual de três cenas, com navegação pelo teclado. A composição tem recorte específico para celular. As cores de todas as seções foram atualizadas para off-white, areia, grafite e bronze.

O perfil indicado pelo cliente é https://maps.app.goo.gl/RmzsuSSKnyjgzzHk6. O telefone verificado é **(71) 99254-5650**. A visualização acessível do perfil não informou endereço completo, horário, website nem avaliações. Esses dados não foram inventados.

## Completar o perfil

Edite `dist/site-data.js` para adicionar dados confirmados:

```js
address: '',
hours: '',
website: '',
reviews: [], // { author: 'Nome autorizado', text: 'Avaliação real' }
videos: []   // { title: 'Título', src: './assets/filme.mp4', poster: './assets/capa.jpg' }
```

A aba de vídeos tem suporte a arquivos reais, controles nativos, poster e reprodução sem autoplay. Como o ZIP não trouxe vídeos, mostra um estado informativo. Endereço, horário e website, quando preenchidos, aparecem no contato. As avaliações reais substituem a apresentação inicial da seção. O link do Google Maps já funciona.

Para trocar uma imagem por uma foto original em alta resolução, atualize também o `viewBox` do SVG para as dimensões/enquadramento corretos. Os dados das imagens ampliadas estão em `site-data.js`.

## Estrutura e movimento

Mantém a sequência reconstruída dos códigos Tilda e do vídeo enviados: abertura em faixas, menu em seis painéis (três no celular), três expansões consecutivas de imagens no scroll, títulos com revelação de caracteres, composição editorial com deslocamento de 860 px em desktop, parallax, panorâmicas com texto contínuo, mosaico com colunas em ±600 px, janela central que expande até 2000 × 1200 px, entrada dos diferenciais, galerias por arraste/setas, pontos interativos, máscara de expansão, progresso das sete etapas e imagem de encerramento.

`motion.js` usa GSAP/ScrollTrigger locais. A rolagem é nativa. O site respeita `prefers-reduced-motion`, com controle visível para mudar a preferência; `?motion=full` ativa a apresentação animada e `?motion=reduced` reduz o movimento. A versão portátil também respeita a preferência do dispositivo. Não foram incluídos rastreadores do código de referência.

## Contato e formulário

- Filtros funcionais e visualização ampliada dos 13 ambientes.
- Formulário com validação de nome, telefone, ambiente, serviço e URL opcional.
- Referências JPG/PNG/WebP/PDF de até 10 MB ficam no dispositivo. O visitante deve anexá-las à conversa do WhatsApp.
- A ação prepara uma mensagem. O visitante abre o WhatsApp e confirma o envio; nenhum dado é enviado automaticamente nem armazenado pelo site.
- Compartilhamento nativo quando disponível, com alternativa por cópia/WhatsApp.
- Envio para smartphone abre opções de compartilhamento e download de contato vCard.

## Validação desta revisão

Verificados no navegador: animações em desktop, menu, filtros, navegação entre ambientes, orçamento inválido/válido com mensagem para o número correto, área de vídeos, modal de smartphone, mobile em 390 px, tablet em 820 px e modo de movimento reduzido. Sem erros de JavaScript nos cenários revisados. Conferência estática de IDs, âncoras, assets, referências de acessibilidade, scripts e ausência dos dados comerciais antigos.

