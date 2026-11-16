import {researchMetrics} from './provider-model.js';
const methodologicalIssues={
 SCE:['Overall rTS overlaps self-created PPP and unassisted makes; revise or test correlation.','Heuristic weights lack held-out calibration.'],
 OBG:['Defender distance is an indirect gravity proxy; validate against tracked defensive response.','Teammate rim lift is confounded by lineups and role.'],
 PCOE:['Expected bad-pass turnover model must be fitted on a separate training sample.','Pass destination and free-throw assist definitions need a shared source.'],
 DVMS:['Position entropy measures assignment variety, not stopper quality.','Expected matchup points and screen navigation require validated attribution.'],
 RDPP:['The transcript adds contested-rebound percentage to box-outs per 75 before standardizing; the seed proposes separate z-scores.','Rim deterrence on/off needs lineup and opponent adjustment.'],
 TWPE:['Offensive and defensive events use different possession denominators.','Weights and double-counted extra-possession outcomes need validation.'],
 UNI:['The transcript labels prior-only output as complete impact; a fitted stint model is required for UNI.','Luck adjustment, regularization and point scale require held-out calibration.'],
 UNI_WAR:['Replacement level and points-per-win constants are draft assumptions, not validated values.'],
 'Custom True Creation Index':['Potential assists are chances, not points; coefficients need conversion and validation.'],
 'Two-Way Havoc Rate':['Event weights are heuristic and can overlap within one possession.'],
 'Context-Adjusted True Shooting':['Expected TS model must be trained and tested out of sample.']
};
export function researchAudit(snapshot){const sourceNames=new Set((snapshot?.metricDefinitions||[]).map(x=>x.id));return researchMetrics.map(metric=>{const missing=metric.dependencies.filter(id=>!sourceNames.has(id));const key=metric.symbol==='UNI_WAR'?'UNI_WAR':metric.symbol;return {id:metric.id,symbol:metric.symbol,name:metric.name,draftEquation:metric.draftEquation,status:'research_unvalidated',calculatedValues:0,availableDependencies:metric.dependencies.filter(id=>sourceNames.has(id)),missingDependencies:missing,blockers:[...methodologicalIssues[key]||[],...(metric.dependencies.length?missing.length?[`${missing.length} required inputs are absent from the permitted ACB snapshot.`]:[]:['Input lineage and denominators are not registered in this snapshot.']),'No validated same-competition cohort, fitted model or held-out result is available.'],sourceDocument:metric.sourceDocument}})}
