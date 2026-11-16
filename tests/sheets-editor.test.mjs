import test from 'node:test';
import assert from 'node:assert/strict';
import {formatSheetText} from '../src/sheets-editor.js';
import {validateSheetFile} from '../services/sheet-extract.mjs';

test('Automated Sheets supports reviewable formatting without fabricating edits',()=>{
 assert.equal(formatSheetText('alpha\nbeta','make this a bullet list').text,'• alpha\n• beta');
 assert.equal(formatSheetText('alpha\nbeta','number the lines').text,'1. alpha\n2. beta');
 assert.equal(formatSheetText('alpha cap','replace alpha with beta').text,'beta cap');
 assert.match(formatSheetText('alpha','rewrite this as a legal agreement').error,/not supported/);
});
test('upload validation rejects unsupported or mislabeled documents',()=>{
 assert.equal(validateSheetFile('scan.png',Buffer.from('image')) ,'.png');
 assert.throws(()=>validateSheetFile('file.exe',Buffer.from('x')),/Unsupported/);
 assert.throws(()=>validateSheetFile('fake.pdf',Buffer.from('not pdf')),/valid PDF/);
 assert.throws(()=>validateSheetFile('empty.docx',Buffer.alloc(0)),/between 1 byte/);
});
