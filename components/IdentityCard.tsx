import { getIdentityMessage } from "@/lib/identity";

export function IdentityCard({ streak }: any) {
  return (
    <div className="p-4 border rounded-xl">
      <p className="text-sm">{getIdentityMessage(streak)}</p>
    </div>
  );
}
