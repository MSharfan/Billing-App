import { load, save } from "./localStorage";
import { v4 as uuidv4 } from "uuid";

const KEY = "accounts";

const getBase = () => {
  const data = load(KEY, { income: [], expense: [] });

  // Defensive normalization: ensure we always return an object with
  // `income` and `expense` as arrays so callers can safely push items.
  if (!data || typeof data !== "object") return { income: [], expense: [] };
  if (!Array.isArray(data.income)) data.income = [];
  if (!Array.isArray(data.expense)) data.expense = [];
  return data;
};

export function addIncomeFromBill({ billNo, amount, note }) {
  const data = getBase();

  data.income.push({
    id: uuidv4(),
    date: new Date().toISOString(),
    amount: Number(amount),
    source: "bill",
    ref: billNo,
    note,
  });

  save(KEY, data);
}

export function addExpense({ amount, category, note }) {
  const data = getBase();

  data.expense.push({
    id: uuidv4(),
    date: new Date().toISOString(),
    amount: Number(amount),
    category,
    note,
  });

  save(KEY, data);
}

export function getAccounts() {
  return getBase();
}


export function getAccounts() {
  return getBase();
}

