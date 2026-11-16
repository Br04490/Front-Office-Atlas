import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {preparationApi,presentationApi} from './services/preparation.mjs';
import {sheetExtractApi} from './services/sheet-extract.mjs';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost:3000');
 if(url.pathname==='/api/sheets/extract'){if(req.headers.origin&&!['http://localhost:3000','http://127.0.0.1:3000'].includes(req.headers.origin)){res.writeHead(403).end('Origin denied');return}sheetExtractApi(req,res);return}
 if(url.pathname==='/api/presentations'){if(req.headers.origin&&!['http://localhost:3000','http://127.0.0.1:3000'].includes(req.headers.origin)){res.writeHead(403).end('Origin denied');return}presentationApi(req,res);return}
 if(url.pathname.startsWith('/api/preparations')){if(req.headers.origin&&!['http://localhost:3000','http://127.0.0.1:3000'].includes(req.headers.origin)){res.writeHead(403).end('Origin denied');return}preparationApi(req,res,url);return}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname))}catch{res.writeHead(400).end('Bad path');return}
 const relative=path.relative(root,file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(part=>part.startsWith('.'))&&file!==root||relative.startsWith('node_modules')||relative.startsWith('services')){res.writeHead(403).end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data)});
}).listen(3000,'127.0.0.1',()=>console.log('Local: http://localhost:3000'));
