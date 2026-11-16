import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const allowed=new Set(['.pdf','.docx','.xlsx','.pptx','.txt','.csv','.md','.png','.jpg','.jpeg','.webp','.bmp','.tif','.tiff']);
const limit=25*1024*1024;
function python(){
 if(process.env.ATLAS_PYTHON)return process.env.ATLAS_PYTHON;
 if(process.platform==='win32'){
  const bundled=path.resolve(process.execPath,'..','..','..','python','python.exe');
  if(fs.existsSync(bundled))return bundled;
  const root='C:\\Program Files\\WindowsApps';
  try{for(const name of fs.readdirSync(root).filter(x=>x.startsWith('OpenAI.CodexPrimaryRuntime.')).sort().reverse()){
   const exe=path.join(root,name,'dependencies','python','python.exe');if(fs.existsSync(exe))return exe;
  }}catch{}
 }
 return process.platform==='win32'?'python':'python3';
}
export function validateSheetFile(name,buffer){
 const ext=path.extname(String(name||'')).toLowerCase();
 if(!allowed.has(ext))throw new Error('Unsupported file type. Use PDF, DOCX, TXT, CSV, or an image.');
 if(!Buffer.isBuffer(buffer)||!buffer.length||buffer.length>limit)throw new Error('File must be between 1 byte and 25 MB.');
 if(ext==='.pdf'&&!buffer.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('This file is not a valid PDF.');
 if(['.docx','.xlsx','.pptx'].includes(ext)&&!buffer.subarray(0,2).equals(Buffer.from('PK')))throw new Error('This file is not a valid Office document.');
 return ext;
}
export async function extractSheetFile(name,buffer){
 const ext=validateSheetFile(name,buffer);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-sheet-'));
 const file=path.join(dir,'source'+ext);
 try{
  fs.writeFileSync(file,buffer,{flag:'wx'});
  return await new Promise((resolve,reject)=>{
   const child=spawn(python(),[path.join(import.meta.dirname,'sheet-extract.py'),file],{windowsHide:true,stdio:['ignore','pipe','pipe']});
   let out='',err='';const timer=setTimeout(()=>child.kill(),120000);
   child.stdout.on('data',x=>{out+=x;if(out.length>1500000)child.kill()});
   child.stderr.on('data',x=>{err+=x});
   child.on('error',reject);child.on('close',()=>{clearTimeout(timer);try{const result=JSON.parse(out.trim());if(result.error)reject(new Error(result.error));else resolve(result)}catch(e){reject(new Error(err.trim()||e.message))}});
  });
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
export function sheetExtractApi(req,res){
 if(req.method!=='POST'){res.writeHead(405).end();return}
 let chunks=[],size=0;
 req.on('data',x=>{size+=x.length;if(size>35*1024*1024){req.destroy();return}chunks.push(x)});
 req.on('end',async()=>{
  try{
   const input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
   if(!input.authorized)throw new Error('Confirm that you are authorized to use this file.');
   const buffer=Buffer.from(input.data||'','base64');
   const result=await extractSheetFile(input.name,buffer);
   res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(result));
  }catch(error){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify({error:error.message}))}
 });
}
