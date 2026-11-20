import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const privateRoot=path.join(root,'.atlas-private');
fs.mkdirSync(privateRoot,{recursive:true});
const out=fs.mkdtempSync(path.join(privateRoot,'pages-review-'));
const tracked=execFileSync('git',['ls-files','-z','index.html','src'],{cwd:root}).toString('utf8').split('\0').filter(Boolean);
for(const relative of tracked){
  if(relative.startsWith('src/assets/players/'))continue;
  const source=path.join(root,relative),target=path.join(out,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(source,target);
}
const manifest=path.join(out,'src/data/players.json');
const players=JSON.parse(fs.readFileSync(manifest,'utf8'));
for(const player of players.players){
  player.photoUrl=null;
  player.thumbnailUrl=null;
  player.imageDisplayStatus='permission_pending';
}
fs.writeFileSync(manifest,JSON.stringify(players));
fs.writeFileSync(path.join(out,'src/components/player-photo.js'),`const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));\nexport function playerPhoto(player,className='roster-photo'){return \`<span class="\${esc(className)} photo-unavailable"><span class="photo-silhouette"></span><span class="photo-fallback">PHOTO PENDING</span></span>\`};\nexport function escapePlayerText(value){return esc(value)}\n`);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'REVIEW_LIMITATIONS.txt'),'Static Crystal design review. The live Atlas warehouse, NCAA/provider imports, contracts, shot events, server actions and player photographs are not published here. Use the local Preview for those functions. Source: https://github.com/Br04490/Front-Office-Atlas/tree/codex/atlas-complete-data-operations-2026-11-18\n');
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else files.push(file)}}
walk(out);
if(files.some(file=>file.includes(`${path.sep}players${path.sep}260x190${path.sep}`)))throw Error('Player photo asset entered public review bundle');
if(players.players.some(player=>player.photoUrl||player.thumbnailUrl||player.imageDisplayStatus==='show_local_thumbnail'))throw Error('Unapproved photo reference entered public review bundle');
console.log(JSON.stringify({directory:out,files:files.length,players:players.players.length,excludedPhotoAssets:true}));
