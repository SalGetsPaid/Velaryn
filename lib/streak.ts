type StreakUser = {
  streak: number;
  lastActive?: string;
  [key: string]: unknown;
};

export function updateStreak(user: StreakUser) {
  const today = new Date().toDateString();

  if (user.lastActive === today) return user;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streak = user.lastActive === yesterday ? user.streak + 1 : 1;

  return {
    ...user,
    streak,
    lastActive: today,
  };
}
