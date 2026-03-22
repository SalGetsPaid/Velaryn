export function TermsSummary() {
  return (
    <div className="text-sm text-zinc-300 space-y-4 leading-relaxed">
      <h3 className="text-base font-bold text-white">1. The Sovereign Fee</h3>
      <p>
        Memberships are billed via Google Play. We disclose that <strong>15% of your subscription</strong> is retained by Google for platform maintenance.
      </p>

      <h3 className="text-base font-bold text-white">2. Data Autonomy and Licensing</h3>
      <p>
        Velaryn may license <strong>anonymized, aggregated data</strong> (for example, &quot;10% of users are saving more&quot;) to institutional partners. We never sell your identity, bank numbers, or personal contact info. You may opt-out of anonymized sharing in Settings.
      </p>

      <h3 className="text-base font-bold text-white">3. The Emergency Purge</h3>
      <p>
        Per the 2026 Delete Act, you have the right to a total &quot;Blackout.&quot; Striking the Purge button deletes all Ledger history and severs all API bridges immediately.
      </p>
    </div>
  );
}
