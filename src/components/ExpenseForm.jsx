import { useEffect, useState } from 'react'
import { PAYMENT_ACCOUNTS, PAYMENT_METHODS } from '../api/constants'

export default function ExpenseForm({ categories, selectedExpense, onSave, onAddCategory, onCancel }) {
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentSource, setPaymentSource] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedExpense) {
      setDesc(selectedExpense.description)
      setAmount(String(selectedExpense.amount))
      setCategory(selectedExpense.category)
      const savedPaymentMethod = selectedExpense.payment_method || ''
      setPaymentMethod(
        savedPaymentMethod === 'RuPay UPI'
          ? 'UPI'
          : PAYMENT_METHODS.includes(savedPaymentMethod) ? savedPaymentMethod : ''
      )
      setPaymentSource(selectedExpense.payment_source || '')
      setDate(selectedExpense.date)
      setNewCategory('')
    } else {
      setDesc('')
      setAmount('')
      setCategory('')
      setPaymentMethod('UPI')
      setPaymentSource('')
      setNewCategory('')
      setDate(today)
    }
  }, [selectedExpense, today])

  const submit = async () => {
    const amt = parseFloat(amount)
    if (!desc.trim() || !amt || amt <= 0 || !date || !category || !paymentMethod) {
      alert('Please enter a description, valid amount, category, payment method, and date.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        description: desc.trim(), amount: amt, category, date,
        payment_method: paymentMethod, payment_source: paymentSource.trim()
      }, selectedExpense?.id)
      setDesc('')
      setAmount('')
      setCategory('')
      setPaymentMethod('UPI')
      setPaymentSource('')
      setDate(today)
    } finally {
      setSaving(false)
    }
  }

  const addCategory = () => {
    const value = newCategory.trim()
    if (!value) return
    onAddCategory?.(value)
    setCategory(value)
    setNewCategory('')
  }

  return (
    <div className="panel" style={{ marginBottom: '1.5rem' }}>
      <h2>{selectedExpense ? 'Edit expense' : 'Add an expense'}</h2>
      <div className="add-form">
        <div className="field">
          <label>Description</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Coffee, groceries..." />
        </div>
        <div className="field">
          <label>Amount</label>
          <input type="number" min="0" step="0.01" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Account</label>
          <select
            value={PAYMENT_ACCOUNTS.includes(paymentSource) ? paymentSource : ''}
            onChange={(e) => setPaymentSource(e.target.value)}
          >
            <option value="">Choose account</option>
            {PAYMENT_ACCOUNTS.map((account) => <option key={account} value={account}>{account}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Paid using</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {!paymentMethod && <option value="">Choose a payment method</option>}
            {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>New category</label>
          <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add a new category" />
        </div>
        <div className="field">
          <button className="btn btn-sm" onClick={addCategory} type="button">+ Add category</button>
        </div>
        <div className="field" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={submit} disabled={saving}>
            {selectedExpense ? 'Update expense' : '+ Add expense'}
          </button>
          {selectedExpense && (
            <button className="btn btn-sm" type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}