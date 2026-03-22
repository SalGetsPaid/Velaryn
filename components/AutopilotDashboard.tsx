import { defaultRules } from "@/lib/defaultRules";

export default function AutopilotDashboard() {
  return (
    <div className="p-4 border rounded-xl">
      <h2 className="text-lg">Autopilot Rules</h2>

      {defaultRules.map((rule) => (
        <div key={rule.id} className="mt-2">
          <p>{rule.name}</p>
        </div>
      ))}
    </div>
  );
}
