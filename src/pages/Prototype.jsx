import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PaymentsHub from '../screens/PaymentsHub'
import InvoiceDetail from '../screens/InvoiceDetail'
import { INVOICES } from '../data/invoices'

export default function Prototype() {
  const [invoices, setInvoices] = useState(INVOICES)
  const [selected, setSelected] = useState(null)

  const handleRetrySuccess = (id) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'in_transit',
              group: 'progress',
              estimatedSettlement: '23 Mar 2026',
              timeline: [
                { label: 'Payment Initiated', done: true },
                { label: 'In Transit',        done: true, active: true },
                { label: 'Funds Cleared',     done: false },
                { label: 'Workers Paid',      done: false },
              ],
            }
          : inv
      )
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back bar */}
      <div className="bg-white border-b border-deel-border px-6 py-3 flex items-center gap-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-deel-muted hover:text-deel-text transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to case study
        </Link>
        <span className="text-deel-border">|</span>
        <span className="text-sm font-medium text-deel-text">Payments Hub — Prototype</span>
      </div>

      <div className="flex flex-1 bg-deel-bg overflow-auto">
        <Sidebar />
        <main className="flex-1 flex overflow-auto">
          {selected ? (
            <InvoiceDetail
              invoice={selected}
              onBack={() => setSelected(null)}
              onRetrySuccess={handleRetrySuccess}
            />
          ) : (
            <PaymentsHub invoices={invoices} onSelect={setSelected} />
          )}
        </main>
      </div>
    </div>
  )
}
