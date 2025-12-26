import { load, save } from "./localStorage";
import { v4 as uuidv4 } from "uuid";

const KEY = "accounts";

const getBase = () =>
  load(KEY, { income: [], expense: [] });

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
