"use client";

type CoachFeedProps = {
  messages: string[];
};

export function CoachFeed({ messages }: CoachFeedProps) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-400">AI Coach</p>
      {messages.map((msg, i) => (
        <div key={i} className="text-sm text-white">
          {msg}
        </div>
      ))}
    </div>
  );
}
