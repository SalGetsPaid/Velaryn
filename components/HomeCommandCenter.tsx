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
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <NextActionCard action={action} onExecute={onExecute} />
        <SocialProofBanner count={count} />
      </div>

      <div className="space-y-5">
        <CoachFeed messages={messages} />
        <div className="grid gap-5 sm:grid-cols-2">
          <StreakCard streak={streak} />
          <IdentityCard streak={streak} />
        </div>
      </div>
    </div>
  );
}
