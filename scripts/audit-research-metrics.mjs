import fs from 'node:fs';
import snapshot from '../src/data/provider-snapshot.json' with {type:'json'};
import {researchAudit} from '../src/research-audit.js';
const rows=researchAudit(snapshot),output={generatedAt:new Date().toISOString(),sourceFiles:['docs/research/complete_basketball_analytics_thread.md','docs/research/atlas_metric_registry_seed.json'],totalResearchMetrics:rows.length,validatedModels:0,calculatedResearchValues:0,metrics:rows};
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/research-metric-audit.json',JSON.stringify(output,null,2));console.log(JSON.stringify({totalResearchMetrics:rows.length,validatedModels:0,calculatedResearchValues:0}));
