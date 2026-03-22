export function executeCommand(command: any) {
  return {
    status: "scheduled",
    amount: command.amount,
    eta: "2-3 days",
  };
}
