import { coachProfiles } from "./coachProfiles";

type CoachType = keyof typeof coachProfiles;

export function getCoachMessage(user: any, command: any) {
  let type: CoachType = "supportive";

  if (user?.streak === 0) type = "aggressive";
  if (user?.score > 10000) type = "analytical";

  const pool = coachProfiles[type];
  const message = pool[Math.floor(Math.random() * pool.length)];

  return `${message} -> ${command.label}`;
}
