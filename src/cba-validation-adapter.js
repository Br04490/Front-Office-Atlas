export function validateProposedMove(scenario,financial){
  if(!scenario.team||(!scenario.removed.length&&!scenario.added.length))return {status:'not_requested',checks:[]};
  const checks=[
    {name:'Salary matching',status:'unverified',needed:'Verified outgoing and incoming contract salary by season and transaction type'},
    {name:'Cap, tax and aprons',status:'unverified',needed:financial.cap?'Complete roster and non-player charges':'Official season thresholds and complete contract charges'},
    {name:'Trade and signing eligibility',status:'unverified',needed:'Effective date, contract restrictions, rights and applicable exceptions'},
    {name:'Roster limits and two-way treatment',status:'unverified',needed:'Effective date, roster classifications and applicable CBA rules'},
    {name:'Guarantees and dead money',status:'unverified',needed:'Contract terms and proposed transaction mechanism'}
  ];
  return {status:'unverified',checks,reference:'https://nbpa.com/cba',message:'No live CBA MCP or Opportunity Engine is connected. Atlas cannot determine legality or compliant alternatives yet.'};
}
