import { useState } from 'react'
import Sidebar from './components/Sidebar'
import PaymentsHub from './screens/PaymentsHub'
import InvoiceDetail from './screens/InvoiceDetail'
import { INVOICES } from './data/invoices'

export default function App() {
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
    <div className="flex min-h-screen bg-deel-bg">
      <Sidebar />
      <main className="flex-1 flex overflow-auto">
        {selected ? (
          <InvoiceDetail
            invoice={selected}
            onBack={() => setSelected(null)}
            onRetrySuccess={handleRetrySuccess}
          />
        ) : (
          <PaymentsHub
            invoices={invoices}
            onSelect={setSelected}
          />
        )}
      </main>
    </div>
  )
}
