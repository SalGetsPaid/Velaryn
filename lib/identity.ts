export function getIdentityMessage(streak: number) {
  if (streak > 30) return "You are a disciplined wealth builder.";
  if (streak > 7) return "You're building strong financial habits.";
  return "You're getting started-consistency is key.";
}
