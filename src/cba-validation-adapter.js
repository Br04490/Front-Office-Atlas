export function validateProposedMove(scenario,financial){
  if(!scenario.team||(!scenario.removed.length&&!scenario.added.length&&!scenario.transfers?.length&&!scenario.contractAssumptions?.length&&!scenario.rotationAssumptions?.length))return {status:'not_requested',checks:[]};
  const checks=[
    {name:'Salary matching',status:'unverified',needed:'Verified outgoing and incoming contract salary by season and transaction type'},
    {name:'Cap, tax and aprons',status:'unverified',needed:financial.cap?'Complete roster and non-player charges':'Official season thresholds and complete contract charges'},
    {name:'Trade and signing eligibility',status:'unverified',needed:'Effective date, contract restrictions, rights and applicable exceptions'},
    {name:'Roster limits and two-way treatment',status:'unverified',needed:'Effective date, roster classifications and applicable CBA rules'},
    {name:'Guarantees and dead money',status:'unverified',needed:'Contract terms and proposed transaction mechanism'}
  ];
  return {status:'unverified',checks,reference:'https://nbpa.com/cba',message:'Eligibility not yet verified. Atlas needs contract terms, timing, roster classification and the applicable CBA provision before determining legality. Explore different players, a different date, or a different move type as hypothetical alternatives.'};
}
