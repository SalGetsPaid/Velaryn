export interface TransactionCategory {
  amount: number;
  category?: string[];
}

export interface AccountData {
  balances?: { current: number };
  type: string;
}

export interface AnalysisResult {
  netWorth: number;
  income: number;
  expenses: number;
  cash: number;
  categoryMap: Record<string, number>;
}

export interface TransactionAnalysis {
  income: number;
  spending: number;
  cash: number;
  savings: number;
  netWorth: number;
}

export function analyzeTransactions(transactions: TransactionCategory[]): TransactionAnalysis {
  let income = 0;
  let spending = 0;

  transactions.forEach((transaction) => {
    if (transaction.amount < 0) {
      income += Math.abs(transaction.amount);
      return;
    }

    spending += transaction.amount;
  });

  const cash = income - spending;
  const savings = cash;

  return {
    income,
    spending,
    cash,
    savings,
    netWorth: cash,
  };
}

export function analyzeData(transactions: TransactionCategory[], accounts: AccountData[]): AnalysisResult {
  let income = 0;
  let expenses = 0;
  let cash = 0;

  const categoryMap: Record<string, number> = {};

  // Accounts → Net Worth
  let assets = 0;
  let liabilities = 0;

  accounts.forEach((acc) => {
    const balance = acc.balances?.current || 0;

    if (balance >= 0) assets += balance;
    else liabilities += balance;

    if (acc.type === "depository") cash += balance;
  });

  // Transactions → Behavior
  transactions.forEach((tx) => {
    const amount = tx.amount;
    const category = tx.category?.[0] || "Other";

    if (amount > 0) {
      expenses += amount;
      categoryMap[category] = (categoryMap[category] || 0) + amount;
    } else {
      income += Math.abs(amount);
    }
  });

  const netWorth = assets + liabilities;

  return {
    netWorth,
    income,
    expenses,
    cash,
    categoryMap,
  };
}
