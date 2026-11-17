import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {teams} from '../src/data/teams.js';
import {openWarehouse,importSnapshots,coverage,readSnapshot} from '../data-pipeline/src/warehouse.mjs';

test('warehouse imports sourced facts idempotently and preserves null domains',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-warehouse-'));
  const db=openWarehouse(path.join(dir,'test.sqlite3'));
  try{
    const source='https://example.org/authorized.csv';
    const players={schemaVersion:1,rights:{authorizedForAtlas:true},sourceFiles:[{name:'test',sourceUrl:source,sha256:'abc'}],players:{123:{seasons:{'2026-27':{metrics:{points:{value:10,unit:'points per game',source,verifiedAt:'2026-11-16',kind:'provider_reported'}}}}}}};
    const teamSeasons=Object.fromEntries(teams.map(team=>[team.abbr,{team:team.abbr,season:'2026-27',wins:1,losses:0,games:1,pointsPerGame:110,opponentPointsPerGame:100,offRatingEstimated:110,defRatingEstimated:100,netRatingEstimated:10,paceEstimated:100,source,verifiedAt:'2026-11-16'}]));
    const teamData={schemaVersion:1,season:'2026-27',teamSeasons,teamGames:{HOU:[{date:'2026-11-15',opponent:'DAL',home:true,result:'W',points:110,opponentPoints:100,pointDiff:10,rebounds:40,assists:25,source,verifiedAt:'2026-11-16'}]}};
    importSnapshots(db,players,teamData);
    importSnapshots(db,players,teamData);
    assert.equal(coverage(db).playerMetricValues,1);
    assert.equal(coverage(db).teamSeasons,30);
    assert.equal(coverage(db).teamGames,1);
    assert.equal(readSnapshot(db).players.players[123].seasons['2026-27'].metrics.points.value,10);
    assert.equal(readSnapshot(db).players.shotEvents.length,0);
    teamData.teamGames.HOU[0].pointDiff=11;
    assert.throws(()=>importSnapshots(db,players,teamData),/Invalid team game result/);
    assert.equal(coverage(db).teamGames,1);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
