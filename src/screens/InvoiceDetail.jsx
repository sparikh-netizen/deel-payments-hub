import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import Timeline from '../components/Timeline'

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)

function InfoRow({ label, value, tooltip }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-deel-border last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-deel-muted">{label}</span>
        {tooltip && (
          <div className="tooltip-wrapper">
            <svg className="w-3.5 h-3.5 text-deel-muted cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
            </svg>
            <div className="tooltip-box">{tooltip}</div>
          </div>
        )}
      </div>
      <span className="text-sm font-semibold text-deel-text">{value}</span>
    </div>
  )
}

function ScreenFailed({ invoice, onBack, onRetry }) {
  return (
    <div className="flex-1 p-8 max-w-2xl">
      <BackButton onBack={onBack} />
      <Header invoice={invoice} />

      <div className="bg-deel-red-bg border border-deel-red-border rounded-xl px-5 py-4 mb-6 flex gap-3">
        <svg className="w-5 h-5 text-deel-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-deel-red">Direct debit returned by your bank</p>
          <p className="text-sm text-red-600 mt-0.5">Your bank declined the direct debit attempt for this payroll cycle. Please retry or use an alternative payment method.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card px-5 py-1 mb-6">
        <InfoRow label="Invoice amount"       value={fmt(invoice.amount)} />
        <InfoRow label="Payment due"          value={invoice.dueDate} tooltip="CET — Berlin banking timezone" />
        <InfoRow label="Revised workers paid by" value="23 Mar 2026 (revised)" tooltip="Updated due to payment failure" />
        <InfoRow label="Workers"              value={`${invoice.workerCount} employees`} />
        <InfoRow label="Payment method"       value={invoice.paymentMethod} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-deel-purple hover:bg-deel-purple-light transition-colors text-white font-semibold py-3 rounded-xl text-sm"
        >
          Retry Payment
        </button>
        <button className="flex-1 border border-deel-border hover:bg-gray-50 transition-colors text-deel-text font-semibold py-3 rounded-xl text-sm">
          Pay by Bank Transfer
        </button>
      </div>
    </div>
  )
}

function ScreenInTransit({ invoice, onBack }) {
  return (
    <div className="flex-1 p-8 max-w-2xl">
      <BackButton onBack={onBack} />
      <Header invoice={invoice} />

      <div className="bg-deel-blue-bg border border-deel-blue-border rounded-xl px-5 py-4 mb-6 flex gap-3">
        <svg className="w-5 h-5 text-deel-blue shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-deel-blue">Funds are on their way</p>
          <p className="text-sm text-blue-600 mt-0.5">Your ACH transfer is being processed. No action is needed — workers will be paid automatically once funds clear.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card px-5 py-1 mb-6">
        <InfoRow label="Amount"                value={fmt(invoice.amount)} />
        <InfoRow label="Payment initiated"     value={invoice.dueDate} tooltip="CET — Berlin banking timezone" />
        <InfoRow label="Estimated settlement"  value={invoice.estimatedSettlement} tooltip="Settlement in NL banking timezone (CET)" />
        <InfoRow label="Workers paid by"       value={invoice.workersPaidBy} />
        <InfoRow label="Workers"               value={`${invoice.workerCount} employees`} />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-card px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-deel-muted mb-5">Payment Progress</p>
        <Timeline steps={invoice.timeline} />
      </div>
    </div>
  )
}

function ScreenOnHold({ invoice, onBack }) {
  const [cleared, setCleared] = useState(false)

  return (
    <div className="flex-1 p-8 max-w-2xl">
      <BackButton onBack={onBack} />
      <Header invoice={invoice} />

      <div
        className={`border rounded-xl px-5 py-4 mb-6 flex gap-3 transition-colors duration-700
          ${cleared
            ? 'bg-deel-green-bg border-deel-green-border animate-funds-cleared'
            : 'bg-deel-yellow-bg border-deel-yellow-border'
          }`}
      >
        <svg className={`w-5 h-5 shrink-0 mt-0.5 transition-colors duration-700 ${cleared ? 'text-deel-green' : 'text-deel-yellow'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {cleared
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          }
        </svg>
        <div>
          <p className={`text-sm font-semibold transition-colors duration-700 ${cleared ? 'text-deel-green' : 'text-deel-yellow'}`}>
            {cleared ? 'Funds cleared — workers will be paid within 1 business day' : 'Payout paused — funds not yet cleared'}
          </p>
          <p className={`text-sm mt-0.5 transition-colors duration-700 ${cleared ? 'text-green-700' : 'text-yellow-700'}`}>
            {cleared
              ? 'Payment is now processing. Workers paid by: 23 Mar 2026.'
              : 'Once funds clear, workers will be paid within 1 business day.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card px-5 py-1 mb-6">
        <InfoRow label="Invoice amount"          value={fmt(invoice.amount)} />
        <InfoRow label="Payment due"             value={invoice.dueDate} tooltip="CET — Berlin banking timezone" />
        <InfoRow label="Workers paid by (revised)" value={cleared ? '23 Mar 2026' : invoice.revisedWorkersPaidBy} />
        <InfoRow label="Workers"                 value={`${invoice.workerCount} employees`} />
      </div>

      {/* Demo trigger */}
      {!cleared && (
        <button
          onClick={() => setCleared(true)}
          className="w-full border-2 border-dashed border-deel-border hover:border-deel-purple text-deel-muted hover:text-deel-purple transition-colors py-3 rounded-xl text-sm font-medium"
        >
          ▶ Simulate "Funds Cleared" trigger
        </button>
      )}
    </div>
  )
}

function ScreenPartial({ invoice, onBack }) {
  const pct = Math.round((invoice.amountReceived / invoice.amount) * 100)
  const outstanding = invoice.amount - invoice.amountReceived

  return (
    <div className="flex-1 p-8 max-w-2xl">
      <BackButton onBack={onBack} />
      <Header invoice={invoice} />

      <div className="bg-white rounded-xl shadow-card px-5 py-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-deel-muted">Amount received</span>
          <span className="font-semibold text-deel-green">{fmt(invoice.amountReceived)}</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-deel-yellow to-amber-400 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-deel-muted">
          <span>{pct}% received</span>
          <span>{fmt(outstanding)} outstanding</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card px-5 py-1 mb-6">
        <InfoRow label="Total invoice"    value={fmt(invoice.amount)} />
        <InfoRow label="Amount received"  value={fmt(invoice.amountReceived)} />
        <InfoRow label="Outstanding"      value={fmt(outstanding)} />
        <InfoRow label="Payment due"      value={invoice.dueDate} tooltip="CET — Berlin banking timezone" />
        <InfoRow label="Workers"          value={`${invoice.workerCount} employees`} />
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-deel-purple hover:bg-deel-purple-light transition-colors text-white font-semibold py-3 rounded-xl text-sm">
          Top Up Remaining Balance
        </button>
        <div className="tooltip-wrapper flex-1">
          <button className="w-full border border-deel-border hover:bg-gray-50 transition-colors text-deel-text font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5">
            Request Proportional Payout
            <svg className="w-3.5 h-3.5 text-deel-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
            </svg>
          </button>
          <div className="tooltip-box" style={{ bottom: 'calc(100% + 10px)', whiteSpace: 'normal', width: '220px', left: '50%' }}>
            {invoice.workersPaidCount} of {invoice.workerCount} workers would be paid proportionally based on funds received ({pct}% of total).
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenPaid({ invoice, onBack }) {
  return (
    <div className="flex-1 p-8 max-w-2xl">
      <BackButton onBack={onBack} />
      <Header invoice={invoice} />

      <div className="bg-deel-green-bg border border-deel-green-border rounded-xl px-5 py-4 mb-6 flex gap-3">
        <svg className="w-5 h-5 text-deel-green shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-deel-green">All workers have been paid</p>
          <p className="text-sm text-green-700 mt-0.5">This payroll cycle is complete. No further action required.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card px-5 py-1">
        <InfoRow label="Total paid"        value={fmt(invoice.amount)} />
        <InfoRow label="Settlement date"   value={invoice.settlementDate} tooltip="CET — Berlin banking timezone" />
        <InfoRow label="Payout date"       value={invoice.payoutDate} />
        <InfoRow label="Workers paid"      value={`${invoice.workerCount} employees`} />
        <InfoRow label="Payment method"    value={invoice.paymentMethod} />
      </div>
    </div>
  )
}

function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-deel-muted hover:text-deel-text transition-colors mb-5 group"
    >
      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Payments Hub
    </button>
  )
}

function Header({ invoice }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-deel-muted uppercase tracking-wide mb-1">{invoice.company}</p>
          <h1 className="text-xl font-bold text-deel-text">{invoice.payrollName}</h1>
        </div>
        <StatusBadge status={invoice.status} size="lg" />
      </div>
    </div>
  )
}

export default function InvoiceDetail({ invoice, onBack, onRetrySuccess }) {
  if (!invoice) return null

  const handleRetry = () => {
    onRetrySuccess(invoice.id)
    onBack()
  }

  return (
    <>
      {invoice.status === 'failed'     && <ScreenFailed     invoice={invoice} onBack={onBack} onRetry={handleRetry} />}
      {invoice.status === 'in_transit' && <ScreenInTransit  invoice={invoice} onBack={onBack} />}
      {invoice.status === 'on_hold'    && <ScreenOnHold     invoice={invoice} onBack={onBack} />}
      {invoice.status === 'partial'    && <ScreenPartial    invoice={invoice} onBack={onBack} />}
      {invoice.status === 'paid'       && <ScreenPaid       invoice={invoice} onBack={onBack} />}
    </>
  )
}
