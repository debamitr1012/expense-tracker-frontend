import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { fmt } from '../api/constants'
import ThemeToggle from '../components/ThemeToggle'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`
}

export default function PaymentReport() {
  const [expenses, setExpenses] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentMonth().slice(0, 4))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await api.get('/expenses')
        setExpenses(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load expenses')
      } finally {
        setLoading(false)
      }
    }
    loadExpenses()
  }, [])

  const monthOptions = useMemo(() => {
    const months = new Set([getCurrentMonth()])
    expenses.forEach((expense) => {
      if (expense?.date) months.add(expense.date.slice(0, 7))
    })
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [expenses])

  const yearOptions = useMemo(
    () => Array.from(new Set(monthOptions.map((month) => month.slice(0, 4)))).sort((a, b) => b.localeCompare(a)),
    [monthOptions]
  )

  const monthsInSelectedYear = monthOptions.filter((month) => month.startsWith(selectedYear))

  const handleYearChange = (year) => {
    setSelectedYear(year)
    const latestMonth = monthOptions.find((month) => month.startsWith(year))
    if (latestMonth) setSelectedMonth(latestMonth)
  }

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense?.date?.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  )

  const paymentBreakdown = useMemo(() => {
    const groups = new Map()
    for (const expense of monthExpenses) {
      const method = expense.payment_method || 'Not specified'
      const source = expense.payment_source?.trim() || 'Account not specified'
      const key = `${method}\u0000${source}`
      const group = groups.get(key) || { method, source, total: 0, count: 0 }
      group.total += Number(expense.amount) || 0
      group.count += 1
      groups.set(key, group)
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total)
  }, [monthExpenses])

  const monthTotal = monthExpenses.reduce((total, expense) => total + (Number(expense.amount) || 0), 0)

  return (
    <>
      <div className="topbar">
        <div className="brand">💰 <span>ExpenseFlow</span></div>
        <div className="userbox">
          <ThemeToggle />
          <Link className="btn btn-sm" to="/">Dashboard</Link>
          <Link className="btn btn-sm" to="/monthly">Monthly report</Link>
        </div>
      </div>

      <main className="container">
        <section className="panel" style={{ marginBottom: '1.5rem' }}>
          <div className="table-toolbar">
            <h2>Payment breakdown</h2>
            <div className="filters" style={{ marginBottom: 0 }}>
              <select
                aria-label="Select year"
                value={selectedYear}
                onChange={(event) => handleYearChange(event.target.value)}
              >
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <select
                aria-label="Select month"
                value={selectedMonth.slice(5, 7)}
                onChange={(event) => setSelectedMonth(`${selectedYear}-${event.target.value}`)}
              >
                {monthsInSelectedYear.map((month) => (
                  <option key={month} value={month.slice(5, 7)}>
                    {MONTH_NAMES[Number(month.slice(5, 7)) - 1]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-row">
              <span>Total spent in {formatMonthLabel(selectedMonth)}</span>
              <strong>{fmt(monthTotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Transactions</span>
              <strong>{monthExpenses.length}</strong>
            </div>
          </div>
        </section>

        {loading && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>Loading...</p>}
        {error && <p className="err" style={{ textAlign: 'center', padding: '2rem' }}>{error}</p>}

        {!loading && !error && (
          <>
            <section className="panel" style={{ marginBottom: '1.5rem' }}>
              <h2>Where the money went</h2>
              {paymentBreakdown.length ? paymentBreakdown.map((group) => {
                const share = monthTotal ? (group.total / monthTotal) * 100 : 0
                return (
                  <div className="payment-row" key={`${group.method}-${group.source}`}>
                    <strong>{group.method}</strong>
                    <span className="payment-amount">{fmt(group.total)}</span>
                    <span className="payment-meta">{group.source} · {group.count} {group.count === 1 ? 'transaction' : 'transactions'} · {share.toFixed(1)}%</span>
                    <span aria-hidden="true" style={{ gridColumn: '1 / -1', height: '4px', background: 'var(--surface-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                      <span style={{ display: 'block', width: `${share}%`, height: '100%', background: 'var(--green)' }} />
                    </span>
                  </div>
                )
              }) : <p className="empty">No expenses recorded for this month.</p>}
            </section>

            <section className="panel">
              <h2>{formatMonthLabel(selectedMonth)} transactions</h2>
              {monthExpenses.length ? (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>Date</th><th>Description</th><th>Paid using</th><th>Account</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {monthExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.date}</td>
                          <td>{expense.description}</td>
                          <td>{expense.payment_method || 'Not specified'}</td>
                          <td>{expense.payment_source || '—'}</td>
                          <td className="amt">{fmt(expense.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="empty">Add expenses from the dashboard to see them here.</p>}
            </section>
          </>
        )}
      </main>
    </>
  )
}
