export interface SkillCornerShot {
  id: string;
  shooterId: number;
  period: number;
  startGameClock: number | null;
  possessionId: string | null;
  location: number[] | null;
  closestDefDist: number | null;
  shotType: string | null;
  shotQuality: number | null;
  outcome: boolean;
  fouled: boolean;
  contested: boolean | null;
}

export interface SkillCornerGame {
  shots: SkillCornerShot[];
  picks: { screenerId: number | null }[];
  drives: { ballhandlerId: number | null }[];
}

// Identity cross-checks: Real Madrid's official player announcements and profiles.
const verifiedPlayers = new Map<string, number>([
  ['203458', 34832], // Alex Len
  ['1626168', 34838], // Trey Lyles
]);

export function getSkillCornerPlayerId(nbaPlayerId: string | null): number | undefined {
  return nbaPlayerId ? verifiedPlayers.get(nbaPlayerId) : undefined;
}

export function selectSkillCornerEvents(game: SkillCornerGame, playerId: number) {
  return {
    shots: game.shots.filter((shot) => shot.shooterId === playerId),
    screens: game.picks.filter((pick) => pick.screenerId === playerId).length,
    drives: game.drives.filter((drive) => drive.ballhandlerId === playerId).length,
  };
}

export async function loadSkillCornerEvents(playerId: number) {
  const game: SkillCornerGame = (await import('../../data/video-studio/skillcorner/data/matches/184439/184439_dynamic_events.json')).default;
  return selectSkillCornerEvents(game, playerId);
}
