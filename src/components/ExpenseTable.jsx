import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { CAT_COLORS, fmt } from '../api/constants'

export default function ExpenseTable({
  expenses,
  categories,
  onEdit,
  onDelete,
  selectedMonthLabel,
  showAllTime,
  onToggleAllTime
}) {
  const [filterCat, setFilterCat] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  let list = expenses
  if (filterCat) list = list.filter((e) => e.category === filterCat)
  if (filterDate) list = list.filter((e) => e.date === filterDate)
  if (search) list = list.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startingIndex = (safePage - 1) * pageSize
  const visibleExpenses = list.slice(startingIndex, startingIndex + pageSize)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  useEffect(() => {
    setPage(1)
  }, [filterCat, filterDate, search, pageSize])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handleExport = () => {
    const rows = list.map((e) => ({
      Date: e.date,
      Description: e.description,
      Category: e.category,
      Amount: e.amount,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="panel">
      <div className="table-toolbar">
        <div>
          <h2>Transactions {showAllTime ? '(All Time)' : `(${selectedMonthLabel || 'Selected Month'})`}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onToggleAllTime && (
            <button className="btn btn-sm" style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={onToggleAllTime}>
              {showAllTime ? 'Show Month Only' : 'Show All Time'}
            </button>
          )}
          <button className="btn btn-sm export-btn" onClick={handleExport} disabled={list.length === 0}>
            Export excel
          </button>
        </div>
      </div>
      <div className="filters">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <input placeholder="Search description..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr>
        </thead>
        <tbody>
          {visibleExpenses.map((e) => {
            const c = CAT_COLORS[e.category] || '#6b7280'
            return (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.description}</td>
                <td><span className="cat-pill" style={{ background: c + '22', color: c }}>{e.category}</span></td>
                <td className="amt">{fmt(e.amount)}</td>
                <td>
                  <button className="edit" style={{ marginRight: '0.5rem' }} onClick={() => onEdit(e)}>Edit</button>
                  <button className="del" onClick={() => onDelete(e.id)}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {list.length === 0 && (
        <div className="empty">No expenses found. Add your first one above!</div>
      )}

      {list.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ color: 'var(--muted, #6b7280)', fontSize: '0.9rem' }}>
            Showing {Math.min(startingIndex + 1, list.length)}-{Math.min(startingIndex + pageSize, list.length)} of {list.length}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted, #6b7280)', fontSize: '0.9rem' }}>
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button className="btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className="btn btn-sm"
                  onClick={() => setPage(pageNumber)}
                  style={{
                    minWidth: '2.25rem',
                    background: pageNumber === safePage ? 'var(--primary)' : 'var(--surface-hover)',
                    color: pageNumber === safePage ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                    opacity: pageNumber === safePage ? 1 : 0.9
                  }}
                >
                  {pageNumber}
                </button>
              ))}

              <button className="btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}