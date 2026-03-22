"use client";

import { NextActionCard } from "./NextActionCard";
import { CoachFeed } from "./CoachFeed";
import { SocialProofBanner } from "./SocialProofBanner";
import { StreakCard } from "./StreakCard";
import { IdentityCard } from "./IdentityCard";

type HomeCommandCenterProps = {
  action: any;
  messages: string[];
  count: number;
  streak: number;
  onExecute: (action: any) => void;
};

export default function HomeCommandCenter({ action, messages, count, streak, onExecute }: HomeCommandCenterProps) {
  return (
    <div className="space-y-4 p-4 max-w-xl mx-auto">
      <NextActionCard action={action} onExecute={onExecute} />
      <SocialProofBanner count={count} />
      <CoachFeed messages={messages} />
      <StreakCard streak={streak} />
      <IdentityCard streak={streak} />
    </div>
  );
}
