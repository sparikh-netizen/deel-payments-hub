import { Link } from 'react-router-dom'
import StateFlowDiagram from '../components/StateFlowDiagram'
import TimelineDiagram from '../components/TimelineDiagram'
import RiskTiers from '../components/RiskTiers'

const NAV = [
  { id: 'brief',    label: '01 Brief' },
  { id: 'system',   label: '02 System Design' },
  { id: 'timelines',label: '03 Timelines' },
  { id: 'risk',     label: '04 Risk' },
  { id: 'ux',       label: '05 UX' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-deel-text font-sans">

      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-deel-text">
            Shivam Parikh <span className="text-deel-muted font-normal">· PM, Client Payments</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-xs font-medium text-deel-muted hover:text-deel-text transition-colors"
              >
                {n.label}
              </button>
            ))}
            <Link
              to="/prototype"
              className="ml-2 text-xs font-semibold bg-deel-purple text-white px-3.5 py-1.5 rounded-lg hover:bg-deel-purple-light transition-colors"
            >
              View Prototype →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-deel-purple mb-4">
          Product Exercise · Deel
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          Designing the Payroll<br />Funding Experience
        </h1>
        <p className="text-lg text-deel-muted max-w-xl leading-relaxed mb-10">
          A state model, funding timeline, and risk framework for end-to-end invoice issuance,
          payment collection, and worker payout clarity.
        </p>
        <Link
          to="/prototype"
          className="inline-flex items-center gap-2 bg-deel-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-deel-purple-light transition-colors text-sm"
        >
          View Payments Hub Prototype
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>

      <div className="border-t border-gray-100" />

      {/* ── 01 Brief ── */}
      <section id="brief" className="max-w-4xl mx-auto px-6 py-20">
        <SectionLabel n="01" label="The Brief" />
        <h2 className="text-2xl font-bold mb-4">The problem is state collapse.</h2>
        <p className="text-deel-muted leading-relaxed max-w-2xl mb-10">
          Showing "Paid" before funds have cleared exposes the platform to financial risk,
          causes worker payout failures, and creates client confusion. Every status must
          reflect where money actually is — not what the client has done.
          Clicking "Pay Now" is not the same as funds arriving.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard
            title="Two payment methods"
            items={[
              'Autopay via Direct Debit — platform pulls from linked bank account',
              'Manual Bank Transfer — client initiates (ACH push or wire)',
            ]}
          />
          <InfoCard
            title="Five stages that must stay distinct"
            items={[
              'Invoice issuance',
              'Client payment intent',
              'Funds in transit',
              'Funds settlement',
              'Worker payout execution',
            ]}
          />
          <InfoCard
            title="What goes wrong without this"
            items={[
              'Platform advances payroll without cleared funds',
              'ACH returns after payout already executed',
              'Clients confused by status that doesn\'t match their bank',
              'Support burden from "where are my workers\' payments?"',
            ]}
          />
          <InfoCard
            title="Settlement realities"
            items={[
              'ACH: 2–5 business days, return window stays open',
              'Wire: same-day, final on receipt',
              'Direct debit: reversible for up to several days',
              'Payroll date is fixed and legally sensitive',
            ]}
          />
        </div>
      </section>

      <Divider />

      {/* ── 02 System Design ── */}
      <section id="system" className="max-w-4xl mx-auto px-6 py-20">
        <SectionLabel n="02" label="System Design" />
        <h2 className="text-2xl font-bold mb-2">Four tracks. One dependency chain.</h2>
        <p className="text-deel-muted leading-relaxed max-w-2xl mb-12">
          Funding is the source of truth. Payout reads from funding, not invoice.
          Invoice is a derived abstraction. Payment instruction is input into funding — not a
          confirmation of it.
        </p>

        <StateFlowDiagram />

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Direct Debit</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Initiator',        'Platform pulls'],
                  ['Settlement',       '2–5 business days'],
                  ['Return risk',      'Higher — reversible post-settlement'],
                  ['Invoice after act','Moves to Payment Initiated'],
                  ['Advance policy',   'Needs return-window buffer'],
                ].map(([k,v]) => (
                  <tr key={k}>
                    <td className="py-2.5 pr-4 text-deel-muted w-40">{k}</td>
                    <td className="py-2.5 text-deel-text">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Manual Bank Transfer</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Initiator',        'Client pushes'],
                  ['Settlement',       'ACH: 2–5 days / Wire: same day'],
                  ['Return risk',      'Wire = none. ACH push = medium'],
                  ['Invoice after act','Stays at Issued until funds confirmed'],
                  ['Advance policy',   'Wire = safe on receipt. ACH = same caution as debit'],
                ].map(([k,v]) => (
                  <tr key={k}>
                    <td className="py-2.5 pr-4 text-deel-muted w-40">{k}</td>
                    <td className="py-2.5 text-deel-text">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 03 Funding Timelines ── */}
      <section id="timelines" className="max-w-4xl mx-auto px-6 py-20">
        <SectionLabel n="03" label="Funding Timelines" />
        <h2 className="text-2xl font-bold mb-2">Invoice issuance windows.</h2>
        <p className="text-deel-muted leading-relaxed max-w-2xl mb-12">
          All deadlines use the payout country's banking timezone, not the client's local time.
          Windows are configurable per client and country.
        </p>

        <TimelineDiagram />

        <div className="mt-14">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-5">Late funds escalation</h3>
          <div className="space-y-3">
            {[
              { milestone: 'T‑2, ACH not settled', action: 'Urgent notification to client. Invoice → Overdue. Payout → On Hold. Internal alert to ops.' },
              { milestone: 'T‑1, still not settled', action: 'Escalation to AM or CS. Platform decides on advance. If no advance: client notified of delay.' },
              { milestone: 'T‑0, no funds', action: 'Payroll not executed. Formal client communication. Late payment recorded on risk profile.' },
            ].map(row => (
              <div key={row.milestone} className="flex gap-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <span className="font-mono text-sm font-semibold text-deel-red w-36 shrink-0">{row.milestone}</span>
                <span className="text-sm text-deel-muted">{row.action}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-deel-muted mt-4">
            Workers are not notified by the platform — that is the client's responsibility.
          </p>
        </div>
      </section>

      <Divider />

      {/* ── 04 Risk Framework ── */}
      <section id="risk" className="max-w-4xl mx-auto px-6 py-20">
        <SectionLabel n="04" label="Risk Framework" />
        <h2 className="text-2xl font-bold mb-2">Advancing payroll is a credit decision.</h2>
        <p className="text-deel-muted leading-relaxed max-w-2xl mb-12">
          The platform should not advance based on client action alone. Advance eligibility is
          determined by a deterministic rule engine — tier, settlement status, return window.
          Manual overrides are available to risk/ops with full audit logging.
        </p>

        <RiskTiers />

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Advance when</h3>
            <ul className="space-y-2 text-sm text-deel-text">
              {[
                'Client has 12+ months clean history',
                'Invoice is within pre-approved limit',
                'Funds confirmed in transit or debit submitted within normal window',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-deel-green mt-0.5">✓</span>{i}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Do not advance when</h3>
            <ul className="space-y-2 text-sm text-deel-text">
              {[
                'Client is new (under 3 months)',
                'Recent return or failed payment on account',
                'Invoice exceeds pre-approved limit',
                'Funds not yet submitted to bank network',
                'Client has outstanding overdue invoices',
              ].map(i => <li key={i} className="flex gap-2"><span className="text-deel-red mt-0.5">✕</span>{i}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Internal controls</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['Return window hold',       'ACH debits held until window closes, unless Tier 3/4 within limit'],
              ['Reconciliation trigger',   'Amount mismatch flags invoice for manual review before payout runs'],
              ['Partial settlement block', 'Default blocks all payouts until fully settled. Proportional payout opt-in for Tier 3+ only'],
              ['Debit retry',              'One retry within 24h. Second failure locks invoice, requires manual intervention'],
              ['Exposure cap',             'Total live advances monitored in real time against finance-set ceiling'],
              ['Audit log',               'Every state transition logged with timestamp, trigger type, and operator ID'],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold mb-1">{title}</p>
                <p className="text-xs text-deel-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 05 UX Design ── */}
      <section id="ux" className="max-w-4xl mx-auto px-6 py-20">
        <SectionLabel n="05" label="UX Design" />
        <h2 className="text-2xl font-bold mb-2">Payments Hub.</h2>
        <p className="text-deel-muted leading-relaxed max-w-2xl mb-12">
          Invoices are grouped by what the client needs to do, not by payment method or date.
          Colour signals action urgency. Dates always show two things: when payment is due,
          and when workers will be paid.
        </p>

        {/* Grouping */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Action Required', color: 'bg-red-50 border-deel-red', dot: 'bg-deel-red', desc: 'Client must do something. Failed debit, overdue invoice, partial top-up needed.' },
            { label: 'In Progress',     color: 'bg-blue-50 border-deel-blue', dot: 'bg-deel-blue', desc: 'Client has acted. Platform is processing. No action needed from the client.' },
            { label: 'Completed',       color: 'bg-green-50 border-deel-green', dot: 'bg-deel-green', desc: 'Settled and paid. Archived after 90 days.' },
          ].map(g => (
            <div key={g.label} className={`p-5 rounded-xl border-l-4 ${g.color} bg-opacity-40`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${g.dot}`} />
                <span className="text-sm font-semibold">{g.label}</span>
              </div>
              <p className="text-xs text-deel-muted leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* Colour system */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Colour system</h3>
        <p className="text-sm text-deel-muted mb-5">Green is never used until funds have actually settled.</p>
        <div className="space-y-2 mb-12">
          {[
            { badge: 'Payment Due',           color: 'bg-yellow-100 text-yellow-800', rule: 'Issued, within normal window' },
            { badge: 'Action Required',        color: 'bg-red-100 text-red-700',      rule: 'Overdue or debit failed' },
            { badge: 'Payment Initiated',      color: 'bg-blue-100 text-blue-700',    rule: 'Client acted, not yet in transit' },
            { badge: 'In Transit',             color: 'bg-blue-100 text-blue-700',    rule: 'Bank confirmed funds moving' },
            { badge: 'Cleared — Reversible',   color: 'bg-green-100 text-green-700 border border-green-300', rule: 'ACH settled, return window still open' },
            { badge: 'Cleared — Final',        color: 'bg-green-100 text-green-700', rule: 'Wire settled, or ACH return window closed' },
            { badge: 'Payout Scheduled',       color: 'bg-green-100 text-green-700 border border-green-300', rule: 'Funds cleared, payout date confirmed' },
            { badge: 'Workers Paid',           color: 'bg-green-500 text-white',      rule: 'Payout executed' },
            { badge: 'On Hold',                color: 'bg-yellow-100 text-yellow-800',rule: 'Funds not cleared' },
            { badge: 'Partially Paid',         color: 'bg-yellow-100 text-yellow-800',rule: 'Partial funds received' },
            { badge: 'Failed',                 color: 'bg-red-100 text-red-700',      rule: 'Payment or payout failed — action required' },
          ].map(row => (
            <div key={row.badge} className="flex items-center gap-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-48 text-center shrink-0 ${row.color}`}>{row.badge}</span>
              <span className="text-sm text-deel-muted">{row.rule}</span>
            </div>
          ))}
        </div>

        {/* Partial payments */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-deel-muted mb-4">Partial payments</h3>
        <p className="text-sm text-deel-muted leading-relaxed max-w-2xl mb-10">
          Default behaviour is to block all payouts until fully settled — partial payouts create
          reconciliation complexity and worker confusion. Client is shown amount received vs outstanding
          and prompted to top up. Proportional payout (pro-rata across worker list) is an opt-in
          feature for Tier 3+ clients only.
        </p>

        {/* Prototype CTA */}
        <div className="rounded-2xl border border-deel-purple/20 bg-deel-purple-dim p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-deel-purple mb-1">Interactive Prototype</p>
            <h3 className="text-xl font-bold mb-2">Payments Hub — all 6 screens</h3>
            <p className="text-sm text-deel-muted max-w-sm">
              Clickable prototype built in React. Covers Hub, Failed, In Transit, On Hold,
              Partially Paid, and Workers Paid — with live state transitions.
            </p>
          </div>
          <Link
            to="/prototype"
            className="shrink-0 inline-flex items-center gap-2 bg-deel-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-deel-purple-light transition-colors text-sm whitespace-nowrap"
          >
            Open Prototype
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-deel-muted">Shivam Parikh · PM, Client Payments · Deel 2026</span>
          <Link to="/prototype" className="text-xs font-semibold text-deel-purple hover:text-deel-purple-light transition-colors">
            View Prototype →
          </Link>
        </div>
      </footer>

    </div>
  )
}

/* ── Small shared components ── */

function SectionLabel({ n, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-xs font-bold text-deel-purple">{n}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-deel-muted">{label}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100 max-w-4xl mx-auto px-6" />
}

function InfoCard({ title, items }) {
  return (
    <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold mb-3">{title}</p>
      <ul className="space-y-1.5">
        {items.map(i => (
          <li key={i} className="text-sm text-deel-muted flex gap-2">
            <span className="text-gray-300 mt-0.5 shrink-0">—</span>
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
