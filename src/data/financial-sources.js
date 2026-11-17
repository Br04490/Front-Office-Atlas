// Official league thresholds are separate from team/player financial records.
// No player contracts or non-player allocations are connected.
export const financialSources={
  thresholds:{
   '2023-24':{cap:136_021_000,minimum:122_418_000,tax:165_294_000,firstApron:172_346_000,secondApron:182_794_000,kind:'official_announced',source:'https://pr.nba.com/nba-salary-cap-for-2023-24-season-set-at-136-021-million/',announcedAt:'2023-06-30',verifiedAt:'2026-11-16'},
   '2024-25':{cap:140_588_000,minimum:126_529_000,tax:170_814_000,firstApron:178_132_000,secondApron:188_931_000,kind:'official_announced',source:'https://pr.nba.com/2024-25-nba-season-salary-cap/',announcedAt:'2024-06-30',verifiedAt:'2026-11-16'},
   '2025-26':{cap:154_647_000,minimum:139_182_000,tax:187_895_000,firstApron:195_945_000,secondApron:207_824_000,kind:'official_announced',source:'https://pr.nba.com/nba-salary-cap-2025-26-season',announcedAt:'2025-06-30',verifiedAt:'2026-11-16'},
   '2026-27':{
    cap:164_961_000,
    minimum:148_465_000,
    tax:200_428_000,
    firstApron:209_015_000,
    secondApron:221_686_000,
    kind:'official_announced',
    source:'https://pr.nba.com/2026-27-salary-cap/',
    announcedAt:'2026-06-30',
    verifiedAt:'2026-11-15'
  }},
  contracts:{},
  allocationCoverage:{},
  nonPlayerAllocations:{},
  hardCaps:{},
  status:'official_thresholds_only',
  sources:['https://pr.nba.com/nba-salary-cap-for-2023-24-season-set-at-136-021-million/','https://pr.nba.com/2024-25-nba-season-salary-cap/','https://pr.nba.com/nba-salary-cap-2025-26-season','https://pr.nba.com/2026-27-salary-cap/']
};
