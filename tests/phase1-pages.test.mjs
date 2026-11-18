import test from 'node:test';
import assert from 'node:assert/strict';
import {phase1View,phase1Directory,phase1Team} from '../src/components/phase1-pages.js';
import {openProfile,playerProfile,selectProfileTab} from '../src/components/player-profile.js';
const record={pool:'NCAA_D1',provider_team_id:'fixture',official_name:'Fixture University',conference:'Sample',campus_region:'West',city:'Fixture City',state_code:'CA',players:[{key:'NCAA_D1:fixture:p1',pool:'NCAA_D1',name:'Fixture Athlete',position:'G',jersey:'1',photoStatus:'pending'}],official_roster_count:2,roster_completeness:'incomplete',roster_source_url:'https://example.org/roster',verified_at:'2026-11-18',headCoach:{name:'Fixture Coach',title:'Head Coach',bioUrl:'https://example.org/coach',verifiedAt:'2026-11-18'}};
test('Phase 1 browse pages show source-backed roster counts and photo pending',()=>{
 phase1View.query='';phase1View.conference='All';phase1View.region='All';
 const data={teams:[record]};
 assert.match(phase1Directory('NCAA_D1',data),/Fixture University/);
 assert.match(phase1Team('NCAA_D1',data,'fixture'),/1 imported \/ 2 officially listed/);
 assert.match(phase1Team('NCAA_D1',data,'fixture'),/PHOTO PENDING/);
 assert.match(phase1Team('NCAA_D1',data,'fixture'),/Fixture Coach/);
 assert.match(phase1Directory('G_LEAGUE',{teams:[]}),/No authorized current teams/);
});
test('external athlete opens the existing profile shell with eligibility tab and no invented stats',()=>{
 const player={...record.players[0],pool:'NCAA_D1',teamName:'Fixture University',verifiedAt:'2026-11-18',bioUrl:'https://example.org/bio',metrics:{}};
 openProfile(player.key);const html=playerProfile(player,[],{});
 assert.match(html,/class="player-profile"/);assert.match(html,/Eligibility \/ NIL/);assert.match(html,/No verified player statistics connected/);
 selectProfileTab('shots');assert.match(playerProfile(player,[],{}),/No authorized source records/);
});
