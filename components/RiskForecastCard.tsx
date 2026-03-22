import { predictMistakes } from "@/lib/predictor";

type ForecastInput = {
  spending: number;
  income: number;
  cash: number;
};

type RiskForecastCardProps = {
  data: ForecastInput;
};

export function RiskForecastCard({ data }: RiskForecastCardProps) {
  const risks = predictMistakes(data);

  return (
    <div className="p-4 border rounded-xl">
      <h3>Future Risk Signals</h3>
      {risks.map((r, i) => (
        <p key={i}>{r}</p>
      ))}
    </div>
  );
}
