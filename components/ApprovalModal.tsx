"use client";

import { useState } from "react";

export default function ApprovalModal({ command, onApprove }: any) {
  const [loading, setLoading] = useState(false);

  const approve = async () => {
    setLoading(true);
    await onApprove(command);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-black p-6 rounded-xl border border-white/10">
        <p>Approve transfer of ${command.amount}?</p>
        <button onClick={approve} disabled={loading}>
          Confirm
        </button>
      </div>
    </div>
  );
}
