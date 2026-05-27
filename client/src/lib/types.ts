export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

export interface BudgetsResponse {
  budgets: Budget[];
}