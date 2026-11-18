import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openWarehouse,coverage,readSnapshot} from '../data-pipeline/src/warehouse.mjs';
import {importContractRows} from '../data-pipeline/src/contract-import.mjs';
import {contractCoverage} from '../data-pipeline/src/contract-coverage.mjs';
const roster=[{nbaPlayerId:123,team:'HOU'}];
const rights={authorizedForAtlas:true,rightsBasis:'Explicit fixture permission',roster};
const contract={nba_player_id:123,team:'HOU',season:'2026-27',contract_type:'standard',base_salary_usd:'1000000',cap_hit_usd:'900000',cash_paid_usd:'1000000',guaranteed_usd:'500000',no_trade:'0',source_url:'https://example.org/contract',verified_at:'2026-11-16'};
test('authorized multi-year contract rows distinguish cap, cash, salary and guarantees',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-contracts-'));const db=openWarehouse(path.join(dir,'data.sqlite3'));
  try{
    assert.throws(()=>importContractRows(db,[contract],{...rights,authorizedForAtlas:false}),/permission/);
    importContractRows(db,[contract],rights);
    importContractRows(db,[contract],rights);
    importContractRows(db,[{...contract,season:'2027-28',cap_hit_usd:'1100000'}],rights);
    assert.equal(coverage(db).contractYears,2);
    const current=readSnapshot(db).players.contracts[123]['2026-27'];
    assert.equal(current.cap,900000);
    assert.equal(current.cashPaid,1000000);
    assert.equal(current.guaranteed,500000);
    assert.equal(readSnapshot(db).players.contracts[123]['2027-28'].cap,1100000);
    assert.throws(()=>importContractRows(db,[{...contract,source_url:'https://example.org/other',cap_hit_usd:'800000'}],rights),/Conflicting cap hit/);
    assert.throws(()=>importContractRows(db,[{...contract,team:'BOS'}],rights),/Current roster team mismatch/);
    assert.throws(()=>importContractRows(db,[{...contract,source_url:'https://example.org/same-value'}],rights),/duplicate contract source/);
    const audit=contractCoverage(db,roster,'2026-27');
    assert.equal(audit.contractRows,1);assert.equal(audit.pricedPlayers,1);assert.equal(audit.teams.find(team=>team.team==='HOU').knownPlayerCapSubtotal,900000);
    assert.equal(audit.teamSalaryComplete,false);
    assert.equal(coverage(db).contractYears,2);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
