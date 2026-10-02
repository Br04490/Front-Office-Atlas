import { DraftAsset, DraftAssetHistoryItem } from '../types';
import { VERIFIED_DRAFT_ASSETS } from '../data/draftAssets';
import { TeamService } from './index';

export const DraftLedgerService = {
  getAvailableDraftYears: (): number[] => {
    return [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  },

  getAllPicks: (): DraftAsset[] => {
    return VERIFIED_DRAFT_ASSETS;
  },

  getPicksByYear: (year: number): DraftAsset[] => {
    return VERIFIED_DRAFT_ASSETS.filter((p) => p.year === year);
  },

  getPicksByTeam: (teamSlugOrId: string): DraftAsset[] => {
    return VERIFIED_DRAFT_ASSETS.filter((p) => {
      return (
        p.current_controller_id === teamSlugOrId ||
        p.original_team_id === teamSlugOrId ||
        p.current_owner_team_id === teamSlugOrId
      );
    });
  },

  getControlledPicksByTeam: (teamSlugOrId: string): DraftAsset[] => {
    return VERIFIED_DRAFT_ASSETS.filter((p) => {
      return (
        p.current_controller_id === teamSlugOrId ||
        p.current_owner_team_id === teamSlugOrId
      );
    });
  },

  getPickById: (id: string): DraftAsset | undefined => {
    return VERIFIED_DRAFT_ASSETS.find((p) => p.id === id);
  },

  /**
   * Evaluates the Ted Stepien Rule under NBA By-Laws § 7.03
   * Verifies that the franchise retains at least one first-round selection in consecutive future drafts.
   */
  evaluateStepienRule: (teamSlugOrId: string): {
    is_compliant: boolean;
    consecutive_firsts_retained: boolean;
    vulnerable_years: number[];
    notes: string;
    citation: string;
  } => {
    const controlled = DraftLedgerService.getControlledPicksByTeam(teamSlugOrId);
    const firstRoundYears = new Set(
      controlled.filter((p) => p.round === 1 && p.asset_type !== 'OUTGOING_PICK').map((p) => p.year)
    );

    const years = [2027, 2028, 2029, 2030, 2031, 2032];
    const vulnerableYears: number[] = [];

    for (let i = 0; i < years.length - 1; i++) {
      const yr1 = years[i];
      const yr2 = years[i + 1];
      if (!firstRoundYears.has(yr1) && !firstRoundYears.has(yr2)) {
        vulnerableYears.push(yr1, yr2);
      }
    }

    const isCompliant = vulnerableYears.length === 0;

    return {
      is_compliant: isCompliant,
      consecutive_firsts_retained: isCompliant,
      vulnerable_years: Array.from(new Set(vulnerableYears)),
      notes: isCompliant
        ? 'Franchise retains at least one first-round pick in every alternate future draft year.'
        : `Potential Stepien conflict detected in adjacent years: ${vulnerableYears.join(', ')}.`,
      citation: 'NBA By-Laws § 7.03 (Draft Protection & Stepien Rule)',
    };
  },
};
