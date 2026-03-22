"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSovereign } from "@/components/SovereignProvider";

type StepKey = "income" | "expenses";

type InputStep = {
  id: "income" | "expenses";
  title: string;
  subtitle?: string;
  input: true;
  key: StepKey;
};

type StaticStep = {
  id: "hook" | "result" | "cta";
  title: string;
  subtitle?: string;
  input?: false;
};

type Step = InputStep | StaticStep;

type OnboardingData = {
  income: number;
  expenses: number;
};

const steps: Step[] = [
  {
    id: "hook",
    title: "Build Wealth Automatically",
    subtitle: "Velaryn turns small daily actions into long-term wealth.",
  },
  {
    id: "income",
    title: "What is your monthly income?",
    subtitle: "Use your steady monthly take-home amount.",
    input: true,
    key: "income",
  },
  {
    id: "expenses",
    title: "Monthly expenses?",
    subtitle: "Estimate your normal monthly burn.",
    input: true,
    key: "expenses",
  },
  {
    id: "result",
    title: "Your Wealth Projection",
    subtitle: "A simple long-range baseline from your current cash flow.",
  },
  {
    id: "cta",
    title: "Start Building",
    subtitle: "Enter your dashboard and begin your first command.",
  },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const { pref, updateProfile } = useSovereign();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({ income: 0, expenses: 0 });

  const step = steps[stepIndex];

  const next = () => setStepIndex((index) => Math.min(index + 1, steps.length - 1));

  const handleInput = (key: StepKey, value: string) => {
    const numericValue = Number(value);
    setData((prev) => ({
      ...prev,
      [key]: Number.isFinite(numericValue) ? numericValue : 0,
    }));
  };

  const projection = useMemo(() => {
    const yearlySurplus = Math.max(0, data.income - data.expenses) * 12;
    return yearlySurplus * 30;
  }, [data.expenses, data.income]);

  const persistOnboarding = () => {
    updateProfile({
      monthlyIncome: Math.max(0, data.income),
      monthlyExpenses: Math.max(0, data.expenses),
      monthlySurplus: Math.max(0, data.income - data.expenses),
    });

    localStorage.setItem("onboarded", "true");
    localStorage.setItem(
      "velaryn_sovereign_profile",
      JSON.stringify({
        locale: pref.locale,
        currency: pref.currency,
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      })
    );

    router.replace("/dashboard");
  };

  const canContinue =
    step.id === "income"
      ? data.income > 0
      : step.id === "expenses"
        ? data.expenses >= 0
        : true;

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div>
          <p className="smallcaps-label text-zinc-500">Step {stepIndex + 1} of {steps.length}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{step.title}</h1>
          {step.subtitle ? <p className="mt-2 text-zinc-400">{step.subtitle}</p> : null}
        </div>

        {step.input ? (
          <input
            type="number"
            inputMode="decimal"
            placeholder="Enter amount"
            className="w-full rounded-lg bg-white/10 p-3 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-amber-300/40"
            onChange={(e) => handleInput(step.key, e.target.value)}
            value={data[step.key] || ""}
          />
        ) : null}

        {step.id === "result" ? (
          <div className="rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/20">
            <p className="text-sm text-emerald-100">Your projected wealth:</p>
            <p className="mt-2 text-2xl font-bold text-white">${projection.toLocaleString()}</p>
            <p className="mt-2 text-xs text-zinc-400">Based on your current annual surplus over 30 years. This is directional, not guaranteed.</p>
          </div>
        ) : null}

        {step.id === "cta" ? (
          <button
            className="w-full rounded-xl bg-emerald-400 py-3 font-bold text-black"
            onClick={persistOnboarding}
          >
            Enter Dashboard
          </button>
        ) : null}

        {stepIndex < steps.length - 1 ? (
          <button
            onClick={next}
            disabled={!canContinue}
            className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}