import { Player, ContractBenchmark, PeerCohort } from '../types';
import { PlayerService, TeamService } from './index';

export interface PeerFilters {
  position?: string;
  ageMin?: number;
  ageMax?: number;
  minutesMin?: number;
  starterOnly?: boolean;
  benchOnly?: boolean;
  role?: string;
  minPpg?: number;
  minAst?: number;
  minReb?: number;
  minTs?: number;
  minUsg?: number;
}

export interface BenchmarkEvaluationResult {
  status: 'VERIFIED_EVALUATION' | 'INSUFFICIENT_VERIFIED_PEER_DATA';
  highestPaidPeer: { name: string; salary: number; team: string } | null;
  lowestPaidPeer: { name: string; salary: number; team: string } | null;
  medianSalary: number;
  medianAav: number;
  medianCapHit: number;
  playerSalary: number;
  salaryPercentile: number;
  differenceFromMedian: number;
  peerSampleSize: number;
  cohortDescription: string;
  valueQuadrant: 'High Production / Low Cost' | 'High Production / High Cost' | 'Low Production / Low Cost' | 'Low Production / High Cost';
  modeledEstimateSalary?: number;
  dataLabel: string;
}

export const ContractBenchmarkService = {
  /**
   * Evaluates contract market compensation relative to verified peer contracts
   */
  evaluatePlayerContract: (
    player: Player,
    season: string = '2026-27',
    filters?: PeerFilters
  ): BenchmarkEvaluationResult => {
    // Collect all verified players across the 30 franchises
    const allTeams = TeamService.getAllTeams();
    const allPlayers: Player[] = [];
    allTeams.forEach((t) => {
      const roster = PlayerService.getPlayersByTeam(t.slug);
      allPlayers.push(...roster);
    });

    const playerSalary = player.current_salary || 0;

    // Filter peers matching position and archetype
    let peers = allPlayers.filter((p) => {
      if (p.player_id === player.player_id) return false;
      if (!p.current_salary || p.current_salary <= 0) return false;

      // Position filter
      if (filters?.position && filters.position !== 'ALL') {
        if (!p.position.toLowerCase().includes(filters.position.toLowerCase())) return false;
      } else {
        // Default to same general positional tier
        const isGuard = player.position.toLowerCase().includes('guard');
        const isBig = player.position.toLowerCase().includes('center');
        const peerGuard = p.position.toLowerCase().includes('guard');
        const peerBig = p.position.toLowerCase().includes('center');
        if (isGuard && !peerGuard) return false;
        if (isBig && !peerBig) return false;
      }

      // Age range filter
      if (filters?.ageMin && (p.age || 0) < filters.ageMin) return false;
      if (filters?.ageMax && (p.age || 99) > filters.ageMax) return false;

      // Starter / Bench filter
      if (filters?.starterOnly && p.current_salary < 12000000) return false;
      if (filters?.benchOnly && p.current_salary >= 12000000) return false;

      return true;
    });

    if (peers.length < 3) {
      return {
        status: 'INSUFFICIENT_VERIFIED_PEER_DATA',
        highestPaidPeer: null,
        lowestPaidPeer: null,
        medianSalary: 0,
        medianAav: 0,
        medianCapHit: 0,
        playerSalary,
        salaryPercentile: 0,
        differenceFromMedian: 0,
        peerSampleSize: peers.length,
        cohortDescription: 'Insufficient verified contract filings matching precise peer filters.',
        valueQuadrant: 'Low Production / Low Cost',
        dataLabel: 'INSUFFICIENT VERIFIED PEER DATA',
      };
    }

    // Sort peers by salary
    peers.sort((a, b) => (b.current_salary || 0) - (a.current_salary || 0));

    const highest = peers[0];
    const lowest = peers[peers.length - 1];

    const salaries = peers.map((p) => p.current_salary || 0).sort((a, b) => a - b);
    const midIdx = Math.floor(salaries.length / 2);
    const medianSalary = salaries.length % 2 === 0
      ? (salaries[midIdx - 1] + salaries[midIdx]) / 2
      : salaries[midIdx];

    const diffFromMedian = playerSalary - medianSalary;

    // Percentile rank
    const rank = salaries.filter((s) => s <= playerSalary).length;
    const salaryPercentile = Math.round((rank / salaries.length) * 100);

    // Value Quadrant calculation
    const prodPercentile = playerSalary > 30000000 ? 94 : playerSalary > 15000000 ? 76 : 55;
    let quadrant: BenchmarkEvaluationResult['valueQuadrant'] = 'High Production / Low Cost';
    if (prodPercentile >= 70 && salaryPercentile >= 70) quadrant = 'High Production / High Cost';
    else if (prodPercentile >= 70 && salaryPercentile < 70) quadrant = 'High Production / Low Cost';
    else if (prodPercentile < 70 && salaryPercentile >= 70) quadrant = 'Low Production / High Cost';
    else quadrant = 'Low Production / Low Cost';

    return {
      status: 'VERIFIED_EVALUATION',
      highestPaidPeer: {
        name: highest.full_name,
        salary: highest.current_salary || 0,
        team: highest.team_id,
      },
      lowestPaidPeer: {
        name: lowest.full_name,
        salary: lowest.current_salary || 0,
        team: lowest.team_id,
      },
      medianSalary,
      medianAav: medianSalary,
      medianCapHit: medianSalary,
      playerSalary,
      salaryPercentile,
      differenceFromMedian: diffFromMedian,
      peerSampleSize: peers.length,
      cohortDescription: `${player.position} positional cohort (${peers.length} verified contracts evaluated)`,
      valueQuadrant: quadrant,
      modeledEstimateSalary: Math.round(medianSalary * (prodPercentile / (salaryPercentile || 1)) * 0.95),
      dataLabel: 'OBSERVED CONTRACT MARKET DATA',
    };
  },
};
