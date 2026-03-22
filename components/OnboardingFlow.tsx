"use client";

import { useState } from "react";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6">
      {step === 1 && <button onClick={() => setStep(2)}>Connect Bank (Plaid)</button>}
      {step === 2 && <button onClick={() => setStep(3)}>Verify Identity (KYC)</button>}
      {step === 3 && <button onClick={() => setStep(4)}>Activate Subscription</button>}
      {step === 4 && <p>You're ready</p>}
    </div>
  );
}
