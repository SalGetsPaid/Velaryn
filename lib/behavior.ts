export function calculateBehaviorScore(user: any) {
  let score = 100;

  if (user.streak === 0) score -= 30;
  if (user.lastActiveDays > 2) score -= 40;
  if (user.actionsTaken < 3) score -= 20;

  return score;
}
