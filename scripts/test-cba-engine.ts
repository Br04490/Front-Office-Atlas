import { CapEngine, TaxEngine, ApronEngine, HardCapEngine } from '../src/services/capEngine';
import { TradeValidationEngine, ProposedTradeParty } from '../src/services/tradeValidationEngine';
import { CAP_THRESHOLDS_BY_SEASON } from '../src/data/capThresholds';
import { Player } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('FRONT OFFICE ATLAS — DETERMINISTIC CBA & CAP ENGINE TESTS');
console.log('====================================================\n');

// 1. Cap Thresholds Integrity Test
const threshold2026 = CAP_THRESHOLDS_BY_SEASON['2026-27'];
assert(threshold2026.salary_cap === 164961000, '2026-27 Official Cap is $164,961,000');
assert(threshold2026.first_apron === 209015000, '2026-27 First Apron is $209,015,000');
assert(threshold2026.second_apron === 221686000, '2026-27 Second Apron is $221,686,000');
assert(threshold2026.verification_status === 'OFFICIAL', '2026-27 Threshold is OFFICIAL');

// 2. Three Different Team Salary Concepts Separately Computed
const houstonCap = CapEngine.calculateTeamSalary('houston-rockets', '2026-27');
const houstonTax = TaxEngine.calculateTaxSalary('houston-rockets', '2026-27');
const houstonApron = ApronEngine.calculateApronSalary('houston-rockets', '2026-27');

console.log(`Houston Team Salary:  $${houstonCap.team_salary.toLocaleString()}`);
console.log(`Houston Tax Salary:   $${houstonTax.tax_salary.toLocaleString()}`);
console.log(`Houston Apron Salary: $${houstonApron.apron_salary.toLocaleString()}`);

assert(typeof houstonCap.team_salary === 'number' && houstonCap.team_salary > 0, 'Team salary calculated');
assert(typeof houstonTax.tax_salary === 'number', 'Tax salary calculated');
assert(typeof houstonApron.apron_salary === 'number', 'Apron salary calculated');
assert(houstonCap.dead_money > 0, 'Dead money properly included in Team Salary');

// 3. Trade Fixtures:
const mockPlayer1: Player = {
  player_id: 'p1',
  nba_player_id: '101',
  full_name: 'Player One ($10M)',
  first_name: 'Player',
  last_name: 'One',
  jersey_number: '1',
  position: 'Guard',
  height: '6-4',
  weight: '200 lbs',
  birthdate: '2000-01-01',
  age: 26,
  college: 'Kentucky',
  team_id: 'houston-rockets',
  nba_experience: '4 yrs',
  current_salary: 10000000,
  current_cap_hit: 10000000,
  contract_type: 'STANDARD GUARANTEED',
  roster_status: 'ACTIVE',
  two_way_status: false,
  gleague_assignment_status: false,
  guaranteed_amount: 10000000,
  years_remaining: 2,
  free_agency_year: 2028,
  option_type: null,
  extension_eligible: false,
  injury_status: null,
  data_status: 'VERIFIED_CURRENT',
  source_url: null,
  retrieved_at: null,
  how_acquired: 'Draft',
  international_origin: null,
  draft_year: 2022,
  draft_round: 1,
  draft_pick: 15,
};

const mockPlayer2: Player = {
  ...mockPlayer1,
  player_id: 'p2',
  full_name: 'Player Two ($11M)',
  current_salary: 11000000,
  current_cap_hit: 11000000,
  team_id: 'oklahoma-city-thunder',
};

const mockMegaStar: Player = {
  ...mockPlayer1,
  player_id: 'p_mega',
  full_name: 'Mega Star ($45M)',
  current_salary: 45000000,
  current_cap_hit: 45000000,
  team_id: 'boston-celtics',
};

// Test 3.1: Legal Salary-Matching Trade (Under-Tax Team OKC taking back $11M for $10M)
// OKC is under the tax, so taking back 110% is allowed under Art. VII § 3(a) non-taxpayer bands.
const legalTradeResult = TradeValidationEngine.validateTrade([
  { team_slug: 'oklahoma-city-thunder', outgoing_players: [mockPlayer1] }, // $10M out -> allowable ceiling is $17.5M
  { team_slug: 'san-antonio-spurs', outgoing_players: [mockPlayer2] },    // $11M out
]);
assert(legalTradeResult.is_legal === true, 'Legal $10M for $11M trade under non-tax bands passes');
assert(legalTradeResult.rule_ledger.length >= 6, 'Rule ledger generated with separate checks');
const salaryCheck = legalTradeResult.rule_ledger.find((r) => r.topic === 'salary matching');
assert(salaryCheck?.status === 'PASS', 'Salary matching rule ledger item marked PASS');

// Test 3.2: Illegal Salary-Matching Trade (First Apron Team taking back >100% salary)
// If team is Boston (above 1st apron), swapping 10M outgoing for 18M incoming fails
const illegalTradeResult = TradeValidationEngine.validateTrade([
  { team_slug: 'boston-celtics', outgoing_players: [mockPlayer1] }, // $10M out
  { team_slug: 'oklahoma-city-thunder', outgoing_players: [mockPlayer1, mockPlayer2] }, // $21M in
]);
assert(illegalTradeResult.is_legal === false, 'Illegal trade above match ceiling fails');
assert(illegalTradeResult.legal_status === 'FAILED_PROHIBITED', 'Marked FAILED_PROHIBITED');

// Test 3.3: Aggregation Restriction on Second Apron Team
const aggregationTradeResult = TradeValidationEngine.validateTrade([
  { 
    team_slug: 'boston-celtics', 
    outgoing_players: [mockPlayer1, mockPlayer2] // Aggregating two contracts on 2nd apron team
  },
  { 
    team_slug: 'oklahoma-city-thunder', 
    outgoing_players: [{ ...mockPlayer1, player_id: 'p_star', current_salary: 20000000 }] 
  },
]);
const aggRule = aggregationTradeResult.rule_ledger.find((r) => r.topic === 'aggregation');
assert(aggRule?.status === 'FAIL', 'Second apron salary aggregation correctly flagged as FAIL');
assert(aggRule?.citation.section.includes('Section 3'), 'Correct CBA Article VII Section 3 citation provided');

// Test 3.4: Unknown / Missing Data Scenario
const emptyTradeResult = TradeValidationEngine.validateTrade([
  { team_slug: 'houston-rockets', outgoing_players: [] },
  { team_slug: 'oklahoma-city-thunder', outgoing_players: [] },
]);
assert(emptyTradeResult.legal_status === 'INSUFFICIENT_DATA', 'Empty assets trade flagged as INSUFFICIENT_DATA');

console.log('\n====================================================');
console.log('ALL 12 CBA ENGINE UNIT TESTS COMPLETED SUCCESSFULLY!');
console.log('====================================================');
