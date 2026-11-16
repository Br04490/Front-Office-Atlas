// Source-backed rights events only. The remaining league ledger is unverified.
export const draftRightsEvents=[{
 id:'2029-second-det-chi-ranked-group',type:'conditional_rights_snapshot',verifiedAt:'2026-11-16',
 assets:['MIL:2029:2','DET:2029:2','NYK:2029:2'],
 rule:{type:'ranked_selection_allocation',ranking:'draft position, most favorable first',allocations:[{recipient:'DET',ranks:[1,2]},{recipient:'CHI',ranks:[3]}]},
 status:'conditional',tradeability:'unverified',
 evidence:[{url:'https://basketball.realgm.com/nba/teams/Milwaukee-Bucks/16/draft-picks',description:'Milwaukee future draft-pick ledger; describes the three-pick allocation and transaction chain'},{url:'https://www.nba.com/news/2026-offseason-trade-tracker',description:'NBA 2026 trade tracker; confirms Detroit received the second-best of DET/NYK/MIL via Memphis in July 2026'}],
 limitation:'The full historical transaction chain, current CBA tradeability, and future selection order are not independently reconstructed in Atlas.'
}];
