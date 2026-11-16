const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sheetEditor={section:'',name:'',text:'',original:'',method:'',status:'',busy:false,sections:{}};
export function sheetEditorPanel(section){
 if(sheetEditor.section!==section){if(sheetEditor.section)sheetEditor.sections[sheetEditor.section]={name:sheetEditor.name,text:sheetEditor.text,original:sheetEditor.original,method:sheetEditor.method,status:sheetEditor.status};Object.assign(sheetEditor,{section,name:'',text:'',original:'',status:'',method:'',...sheetEditor.sections[section]})}
 return `<div class="sheet-editor"><div class="sheet-editor-head"><div><small>DOCUMENT WORKSPACE</small><h3>Upload, scan & edit</h3></div><span>LOCAL PREVIEW</span></div><p>Upload a PDF, Word, Excel, PowerPoint, text file, or screenshot. Extracted text becomes editable here. Check scan accuracy before using it.</p><div class="sheet-file-actions"><label class="ws-small">Upload file<input id="sheet-source-file" type="file" accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.md,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff" hidden></label><label class="ws-small">Upload screenshot<input id="sheet-source-image" type="file" accept="image/*" capture="environment" hidden></label></div><label class="sheet-consent"><input id="sheet-source-permission" type="checkbox"> I am authorized to use this document for this local preview.</label><div id="sheet-extract-status" role="status">${escape(sheetEditor.status)}</div>${sheetEditor.name?`<div class="sheet-source-label">${escape(sheetEditor.name)} · ${escape(sheetEditor.method)}</div>`:''}<label class="ws-field">EDITABLE CONTENT<textarea id="sheet-editable-text" placeholder="Upload a file or paste text here to start editing.">${escape(sheetEditor.text)}</textarea></label><label class="ws-field">MAKE IT LIKE THIS<textarea id="sheet-instruction" placeholder="Try: make this a bullet list; number the lines; uppercase headings; replace OLD with NEW"></textarea></label><div class="sheet-editor-actions"><button class="ws-small" data-sheet-action="format">Apply instruction</button><button class="ws-small" data-sheet-action="reset">Restore extracted text</button><button class="ws-small" data-sheet-action="download">Download edited text</button></div><p class="sheet-editor-help">Supported instructions: bullet list, numbered list, uppercase, lowercase, title case, and “replace X with Y.” Other requests can be edited directly in the text box.</p></div>`
}
export function formatSheetText(text,instruction){
 const ask=instruction.trim();if(!ask)return {error:'Enter an instruction first.'};
 const replace=ask.match(/^replace\s+["“]?(.+?)["”]?\s+with\s+["“]?(.+?)["”]?$/i);
 if(replace){const from=replace[1].replace(/["“”]$/,'').trim(),to=replace[2].replace(/["“”]$/,'').trim();if(!from)return {error:'Name the text to replace.'};return {text:text.split(from).join(to)}}
 if(/\b(bullet|bulleted)\b/i.test(ask))return {text:text.split('\n').map(x=>x.trim()?`• ${x.trim().replace(/^(?:[-•]|\d+[.)])\s*/,'')}`:'').join('\n')};
 if(/\b(number|numbered|numbering)\b/i.test(ask)){let n=0;return {text:text.split('\n').map(x=>x.trim()?`${++n}. ${x.trim().replace(/^(?:[-•]|\d+[.)])\s*/,'')}`:'').join('\n')}}
 if(/\b(uppercase|all caps|capital letters)\b/i.test(ask))return {text:text.toUpperCase()};
 if(/\b(lowercase|lower case)\b/i.test(ask))return {text:text.toLowerCase()};
 if(/\btitle case\b/i.test(ask))return {text:text.replace(/\b\p{L}[\p{L}']*/gu,x=>x[0].toUpperCase()+x.slice(1).toLowerCase())};
 return {error:'That instruction is not supported yet. Edit the content directly or use one of the examples below.'};
}
export async function sheetSourceFile(file){
 const status=document.querySelector('#sheet-extract-status');
 const permission=document.querySelector('#sheet-source-permission')?.checked;
 if(!permission){if(status)status.textContent='Confirm document permission before uploading.';return}
 if(file.size>25*1024*1024){if(status)status.textContent='File exceeds the 25 MB limit.';return}
 if(status)status.textContent='Reading and extracting text…';
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  const response=await fetch('/api/sheets/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,data:btoa(binary),authorized:true})});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Extraction failed');
  sheetEditor.name=file.name;sheetEditor.text=result.text;sheetEditor.original=result.text;sheetEditor.method=result.method;
  const label=document.querySelector('.sheet-source-label');if(label)label.textContent=`${file.name} · ${result.method}`;else status.insertAdjacentHTML('afterend',`<div class="sheet-source-label">${escape(file.name)} · ${escape(result.method)}</div>`);
  const editor=document.querySelector('#sheet-editable-text');if(editor)editor.value=result.text;
  if(status)status.textContent='Text extracted. Review it before use.';
 }catch(error){if(status)status.textContent=error.message}
}
export function sheetEditorAction(action){
 const editor=document.querySelector('#sheet-editable-text'),status=document.querySelector('#sheet-extract-status');if(!editor)return;
 if(action==='format'){const result=formatSheetText(editor.value,document.querySelector('#sheet-instruction')?.value||'');if(result.error){status.textContent=result.error;return}editor.value=result.text;sheetEditor.text=result.text;status.textContent='Instruction applied. Review the result.'}
 if(action==='reset'){editor.value=sheetEditor.original;sheetEditor.text=editor.value;status.textContent=sheetEditor.original?'Extracted text restored.':'No extracted text to restore.'}
 if(action==='download'){const blob=new Blob([editor.value],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=(sheetEditor.name.replace(/\.[^.]+$/,'')||'atlas-document')+'-edited.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Edited text downloaded.'}
}
