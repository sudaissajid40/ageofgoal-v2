/**
 * Age of Goal v2 - Tactical Round Mapping
 * Converts numerical round indexes into professional sports labels.
 */

export function getRoundLabel(teamsInRound: number): string {
  if (teamsInRound <= 2) return 'Grand Finale';
  if (teamsInRound <= 4) return 'Semi-Finals';
  if (teamsInRound <= 8) return 'Quarter-Finals';
  return `Round of ${teamsInRound}`;
}

export function formatMatchRound(round: string | number): string {
  if (typeof round === 'string' && isNaN(Number(round))) return round;
  
  const roundNum = Number(round);
  // Optional: Add logic to convert round number to labels if the team count is known
  return `Stage ${roundNum}`;
}
