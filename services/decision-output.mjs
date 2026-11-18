import JSZip from 'jszip';
import pptxgen from 'pptxgenjs';

const specs=[
 {id:'ownership',title:'President and Ownership',accent:'2186C7',sections:['Decision and strategic value','Financial exposure and risk','Recommendation and approval']},
 {id:'general-manager',title:'General Manager',accent:'173B68',sections:['Roster and transaction context','Contracts, cap sheets and CBA checks','Alternatives and approval checklist']},
 {id:'coach',title:'Coach',accent:'3777A9',sections:['Basketball role and lineup impact','Matchups, play types and preparation','Coaching decision and missing evidence']},
 {id:'scout-analyst',title:'Scout and Analyst',accent:'256B88',sections:['Player and evidence summary','Statistics, shots and comparisons','Film references and recommendation']},
 {id:'player-development',title:'Player Development',accent:'2B8B8B',sections:['Individual context and strengths','Growth opportunities and support','Development plan and evidence needs']}
];
export const decisionFormats=specs.map(({id,title})=>({id,title}));
const clean=(value,max)=>String(value??'').trim().slice(0,max);
const addText=(slide,text,x,y,w,h,size=16,color='244769')=>slide.addText(text,{x,y,w,h,fontFace:'Aptos',fontSize:size,color,breakLine:false,margin:0.08,fit:'shrink'});
function deck(spec,decision){
 const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author='Front Office Atlas Crystal';pptx.subject='Internal basketball operations decision draft';pptx.title=`${spec.title} · ${decision.title}`;
 for(const [index,section] of spec.sections.entries()){
  const slide=pptx.addSlide();slide.background={color:'F1F9FF'};
  slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.14,h:7.5,line:{color:spec.accent},fill:{color:spec.accent}});
  addText(slide,'FRONT OFFICE ATLAS  /  INTERNAL REVIEW DRAFT',0.55,0.35,11.8,0.26,10,spec.accent);
  addText(slide,spec.title.toUpperCase(),0.55,0.82,11.8,0.28,12,spec.accent);
  addText(slide,section,0.55,1.25,11.8,0.65,28,'102B4D');
  addText(slide,`Decision: ${decision.title}`,0.6,2.0,11.6,0.35,16,'183B5A');
  addText(slide,`Author-supplied evidence · review required\n${decision.evidence}`,0.6,2.55,11.5,2.25,15);
  addText(slide,`Source notes · not independently verified\n${decision.sources||'No source notes supplied'}`,0.6,5.05,11.5,1.28,12,'476782');
  addText(slide,`${index+1} / ${spec.sections.length} · No contract, CBA, film or statistical value is inferred. Human approval required.`,0.55,6.92,11.9,0.24,9,'6B8499');
 }
 return pptx.write({outputType:'nodebuffer'});
}
export async function generateDecisionBundle(input){
 const title=clean(input?.title,120),evidence=clean(input?.evidence,4000),sources=clean(input?.sources,2000);
 if(!title||!evidence)throw Error('A decision title and reviewed evidence are required');
 const decision={title,evidence,sources},zip=new JSZip();
 for(const spec of specs)zip.file(`atlas-${spec.id}.pptx`,Buffer.from(await deck(spec,decision)));
 zip.file('manifest.json',JSON.stringify({title,formats:decisionFormats,sourceStatus:'author supplied; not independently verified',financialStatus:'not calculated',approvalStatus:'internal draft only'},null,2));
 return Buffer.from(await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
}
export async function decisionOutputApi(req,res){
 try{if(req.method!=='POST'){res.writeHead(405).end('POST required');return}let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>20000)throw Error('Request exceeds 20 KB');chunks.push(chunk)}const input=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');const data=await generateDecisionBundle(input);res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="atlas-five-decision-formats.zip"','Cache-Control':'no-store'}).end(data)}catch(error){res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}))}
}
