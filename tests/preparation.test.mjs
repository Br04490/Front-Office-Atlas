import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.ATLAS_PREP_TTL_MS='180';
const {preparationApi,presentationApi}=await import('../services/preparation.mjs');
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/presentations')presentationApi(req,res);else preparationApi(req,res,url)});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
async function create(){const response=await fetch(`${base}/api/preparations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'trade',team:'HOU',notes:'Test proposal',source:'unit test'})});assert.equal(response.status,202);return response.json()}
test('temporary packet is real, discard removes its content, and expiry clears unaccepted content',async()=>{
 const job=await create();await new Promise(resolve=>setTimeout(resolve,20));const ready=await(await fetch(`${base}/api/preparations/${job.id}`)).json();assert.equal(ready.status,'READY_FOR_REVIEW');assert.equal(ready.packet.documents.length,3);
 const discarded=await(await fetch(`${base}/api/preparations/${job.id}/discard`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).json();assert.equal(discarded.status,'DISCARDED');assert.equal(discarded.packet,null);
 const canceling=await create();const canceled=await(await fetch(`${base}/api/preparations/${canceling.id}/cancel`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).json();assert.equal(canceled.status,'CANCELED');assert.equal(canceled.packet,null);
 const expiring=await create();await new Promise(resolve=>setTimeout(resolve,230));const expired=await(await fetch(`${base}/api/preparations/${expiring.id}`)).json();assert.equal(expired.status,'EXPIRED');assert.equal(expired.packet,null);
});
test('PowerPoint endpoint returns a real ZIP-based PPTX',async()=>{const response=await fetch(`${base}/api/presentations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({draft:'GENERAL MANAGER\n\nSOURCE EVIDENCE\nAuthor supplied example'})});assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,2).toString(),'PK');assert.ok(bytes.length>10000)});
test.after(()=>server.close());
