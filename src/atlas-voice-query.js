import {searchAtlas} from './atlas-query-engine.js';
export const queryAtlasRoster=(question,players,teams,previous=null)=>searchAtlas(question,players,teams,previous);
