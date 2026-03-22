import { defaultRules } from "./defaultRules";

export function evaluateRules(state: any) {
  const triggered = [];

  for (const rule of defaultRules) {
    if (rule.condition(state)) {
      triggered.push({
        ruleId: rule.id,
        result: rule.action(state),
      });
    }
  }

  return triggered;
}
