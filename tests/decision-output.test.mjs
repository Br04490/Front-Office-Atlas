import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {generateDecisionBundle,decisionFormats} from '../services/decision-output.mjs';
import {executionContent,executionState} from '../src/execution-ui.js';

test('one sourced decision generates five distinct locked PPTX packages',async()=>{
 const bytes=await generateDecisionBundle({title:'Fixture decision',evidence:'Author-supplied basketball observation.',sources:'https://example.org/authorized-fixture'});
 const zip=await JSZip.loadAsync(bytes),names=Object.keys(zip.files).filter(name=>name.endsWith('.pptx'));
 assert.equal(names.length,5);assert.equal(decisionFormats.length,5);
 for(const name of names){const pptx=await zip.file(name).async('nodebuffer');assert.equal(pptx.subarray(0,2).toString(),'PK');assert.ok(pptx.length>10000)}
 const manifest=JSON.parse(await zip.file('manifest.json').async('string'));
 assert.equal(manifest.approvalStatus,'internal draft only');assert.equal(manifest.financialStatus,'not calculated');
});
test('decision package rejects missing evidence and keeps planner controls',async()=>{
 await assert.rejects(generateDecisionBundle({title:'Fixture'}),/evidence/);
 const html=executionContent('PRESENTATION & VIDEO STUDIO',()=>'',()=>''),count=(html.match(/data-ex-export="all-five"/g)||[]).length;
 assert.equal(count,1);assert.match(html,/DECISION TITLE/);
 assert.equal(executionState.audiences.has('General Manager'),true);
});
