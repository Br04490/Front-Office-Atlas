import {searchAtlas} from './atlas-query-engine.js';
import {queryNbaMetrics} from './nba360-metric-query.js';
export const queryAtlasRoster=(question,players,teams,previous=null,intelligence=null)=>queryNbaMetrics(question,players,teams,intelligence)||searchAtlas(question,players,teams,previous);
