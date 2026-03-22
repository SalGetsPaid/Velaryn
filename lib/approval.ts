type ApprovalCommand = {
  amount?: number;
};

export function requiresApproval(command: ApprovalCommand) {
  const amount = command.amount ?? 0;
  return amount > 100;
}
