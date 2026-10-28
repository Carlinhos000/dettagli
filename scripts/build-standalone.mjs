import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const output=fileURLToPath(new URL('../dettagli-arquitetura.html',import.meta.url));
const mime=f=>/\.jpe?g$/.test(f)?'image/jpeg':/\.webp$/.test(f)?'image/webp':/\.svg$/.test(f)?'image/svg+xml':/\.vcf$/.test(f)?'text/vcard':'font/ttf';
const uri=f=>`data:${mime(f)};base64,${fs.readFileSync(root+f).toString('base64')}`;
let html=fs.readFileSync(root+'index.html','utf8');
html=html.replace(/<link rel="preload"[^>]+>/g,'');
html=html.replace(/<link rel="stylesheet" href="\.\/([^"]+)">/g,(_,file)=>{
 let css=fs.readFileSync(root+file,'utf8');
 if(file==='assets/fonts.css')css=css.replace(/url\(\.\/([^\)]+)\)/g,(_,font)=>`url(${uri('assets/'+font)})`);
 return `<style>${css}</style>`;
});
let scripts='';
html=html.replace(/<script defer src="\.\/([^"]+)"><\/script>/g,(_,file)=>{scripts+=`<script>${fs.readFileSync(root+file,'utf8').replaceAll('</script','<\\/script')}</script>`;return '';});
html=html.replace('</body>',()=>scripts+'</body>');
for(const ref of new Set([...html.matchAll(/\.\/assets\/[a-z0-9-./]+\.(?:jpg|webp|svg|vcf)/gi)].map(m=>m[0])))html=html.split(ref).join(uri(ref.slice(2)));
fs.writeFileSync(output,html);
console.log(`Built ${output} (${(Buffer.byteLength(html)/1048576).toFixed(1)} MB).`);
