"use client";

import ForgeCard from "@/components/ForgeCard";

type CoachFeedProps = {
  messages: string[];
};

export function CoachFeed({ messages }: CoachFeedProps) {
  return (
    <ForgeCard title="Advisory Feed" className="rounded-[2rem] p-6">
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
            <p className="text-sm leading-6 text-white">{msg}</p>
          </div>
        ))}
      </div>
    </ForgeCard>
  );
}
