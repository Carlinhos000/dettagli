import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.vcf':'text/vcard','.mp4':'video/mp4'};
const port=Number(process.env.PORT)||8765;
http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
 if(file!==path.resolve(root)&&!file.startsWith(root)){res.writeHead(403).end();return;}
 if(file===path.resolve(root))file=path.join(root,'index.html');
 fs.stat(file,(error,stat)=>{
   if(error||!stat.isFile()){res.writeHead(404).end();return;}
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
   fs.createReadStream(file).pipe(res);
 });
}).listen(port,'127.0.0.1',()=>console.log(`Dettagli: http://127.0.0.1:${port}/?motion=full`));
