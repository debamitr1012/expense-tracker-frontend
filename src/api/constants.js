export const CATEGORIES = [
  'Food', 'Transport', 'Rent', 'Electricity',
  'Shopping', 'Groceries', 'Entertainment', 'Miscellaneous'
]

export const PAYMENT_METHODS = [
  'UPI', 'Credit Card', 'Debit Card', 'Cash'
]

export const PAYMENT_ACCOUNTS = [
  'ICICI Bank', 'Axis Bank', 'HDFC Bank', 'Yes Bank'
]

export const CAT_COLORS = {
  'Food': '#f59e0b',
  'Transport': '#3b82f6',
  'Rent': '#ef4444',
  'Electricity': '#eab308',
  'Shopping': '#ec4899',
  'Groceries': '#10b981',
  'Entertainment': '#8b5cf6',
  'Miscellaneous': '#6b7280'
}

export const fmt = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
