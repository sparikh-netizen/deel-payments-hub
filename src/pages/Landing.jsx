import { Link } from 'react-router-dom'
import StateFlowDiagram from '../components/StateFlowDiagram'
import TimelineDiagram from '../components/TimelineDiagram'
import RiskTiers from '../components/RiskTiers'

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', color: '#111', fontSize: 14, lineHeight: 1.6 }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Payroll Funding Experience — Product Case Study</span>
          <Link to="/prototype" style={{ fontSize: 13, fontWeight: 600, color: '#6E3FF3', textDecoration: 'none' }}>
            Open Prototype →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* Title block */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>
            Payroll Funding Experience
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>
            PM, Client Payments · Shivam Parikh · Deel 2026
          </p>
          <Link
            to="/prototype"
            style={{
              display: 'inline-block',
              background: '#6E3FF3',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Open Payments Hub Prototype →
          </Link>
        </div>

        <HR />

        {/* 1. Problem Statement */}
        <Section n="1." title="Problem Statement">
          <P>
            The core problem is state collapse: showing "Paid" before funds have cleared exposes the
            platform to financial risk, causes worker payout failures, and increases support burden.
          </P>
          <P>
            The design principle is: every status must reflect where money actually is, not what the
            client has done. Clicking "Pay Now" is not the same as funds arriving.
          </P>
          <P>Clients can fund invoices via two methods:</P>
          <Table
            headers={['Method', 'How it works']}
            rows={[
              ['Autopay / Direct Debit', 'Platform pulls funds from a linked bank account on the due date'],
              ['Manual Bank Transfer',   'Client initiates payment from their bank (ACH push or wire)'],
            ]}
          />
          <P mt={16}>Settlement characteristics that the system must account for:</P>
          <Table
            headers={['Rail', 'Settlement time', 'Return / reversal risk']}
            rows={[
              ['ACH debit / push', '2–5 business days', 'Return window stays open post-settlement'],
              ['Wire transfer',    'Same day (cutoff dependent)', 'Final on receipt — no return window'],
              ['Direct debit',    '2–5 business days', 'Reversible for up to several days'],
            ]}
          />
        </Section>

        <HR />

        {/* 2. System Design */}
        <Section n="2." title="System Design — State Model">
          <P>
            Four tracks, loosely coupled with hard dependencies. Funding is the source of truth.
            Payout reads from funding, not invoice. Invoice is a derived abstraction.
            Payment instruction is input into funding — not a confirmation of it.
          </P>
          <P>
            If the funding track reverts (e.g. ACH return after settlement), it cascades:
            invoice is flagged, payout is blocked or clawed back, client is notified.
          </P>

          <StateFlowDiagram />

          <SubSection title="2.5  Direct Debit vs Manual Transfer">
            <Table
              headers={['', 'Direct Debit', 'Manual Transfer']}
              rows={[
                ['Initiator',             'Platform pulls',             'Client pushes'],
                ['Settlement',            '2–5 business days',          'ACH: 2–5 days / Wire: same day'],
                ['Return risk',           'Higher — reversible post-settlement', 'Wire = none. ACH push = medium'],
                ['Invoice after action',  'Moves to Payment Initiated', 'Stays Issued until funds confirmed'],
                ['Advance implication',   'Needs return-window buffer', 'Wire = safe on receipt. ACH = same caution as debit'],
              ]}
            />
          </SubSection>
        </Section>

        <HR />

        {/* 3. Funding Timelines */}
        <Section n="3." title="Funding Timelines &amp; Invoice Issuance">
          <P>
            Invoices must be issued far enough in advance to allow for settlement before payroll
            execution. All deadlines use the payout country's banking timezone, not the client's
            local time. Windows are configurable per client and country.
          </P>

          <TimelineDiagram />

          <SubSection title="3.2  Late funds escalation">
            <Table
              headers={['Milestone', 'Action']}
              rows={[
                ['T‑2, ACH not settled',    'Urgent notification to client. Invoice → Overdue. Payout → On Hold. Internal alert to ops.'],
                ['T‑1, still not settled',  'Escalation to AM or CS. Platform decides on advance eligibility. If no advance: client notified of delay.'],
                ['T‑0, no funds received',  'Payroll not executed. Formal client communication. Late payment recorded on risk profile.'],
              ]}
            />
            <P mt={12} muted>Workers are not notified by the platform — that is the client's responsibility.</P>
          </SubSection>
        </Section>

        <HR />

        {/* 4. Risk Framework */}
        <Section n="4." title="Risk Framework">
          <P>
            Advancing payroll is a credit decision. Advance eligibility is determined by a
            deterministic rule engine gated on client tier, settlement status, and return window
            state. Manual overrides are available to risk/ops with full audit logging.
          </P>

          <SubSection title="4.1  Advance decision">
            <Table
              headers={['Condition', 'Advance?']}
              rows={[
                ['12+ months clean history, invoice within limit, funds in transit', 'Yes'],
                ['Client under 3 months on platform',                                'No'],
                ['Recent return or failed payment on account',                       'No'],
                ['Invoice exceeds pre-approved limit',                               'No'],
                ['Funds not yet submitted to bank network',                          'No'],
                ['Outstanding overdue invoices on account',                          'No'],
              ]}
            />
          </SubSection>

          <SubSection title="4.2  Client exposure tiers">
            <RiskTiers />
          </SubSection>

          <SubSection title="4.3  Internal controls">
            <Table
              headers={['Control', 'Description']}
              rows={[
                ['Return window hold',        'ACH debits held until return window closes, unless Tier 3/4 within pre-approved limit'],
                ['Reconciliation trigger',    'Amount mismatch flags invoice for manual review before payout runs'],
                ['Partial settlement block',  'Default blocks all payouts until fully settled. Proportional payout opt-in for Tier 3+ only'],
                ['Debit retry policy',        'One retry within 24 hours. Second failure locks invoice and requires manual intervention'],
                ['Exposure cap',              'Total live advances monitored in real time against a finance-set ceiling'],
                ['Audit log',                 'Every state transition logged with timestamp, trigger type, and operator ID if manual'],
              ]}
            />
          </SubSection>
        </Section>

        <HR />

        {/* 5. UX Design */}
        <Section n="5." title="UX Design — Payments Hub">
          <P>
            Invoices are grouped by what the client needs to do, not by payment method or date.
            Colour signals action urgency. Every open invoice surfaces two dates: when payment is due
            and when workers will be paid. Green is never used until funds have actually settled.
          </P>

          <SubSection title="5.1  Invoice grouping">
            <Table
              headers={['Group', 'Colour', 'Meaning']}
              rows={[
                ['Action Required', 'Red',  'Client must act. Failed debit, overdue invoice, or partial top-up needed.'],
                ['In Progress',     'Blue', 'Client has acted. Platform is processing. No action needed.'],
                ['Completed',       'Green','Fully settled and paid. Archived after 90 days.'],
              ]}
            />
          </SubSection>

          <SubSection title="5.2  Status labels and colour system">
            <Table
              headers={['Label', 'Colour', 'Trigger condition']}
              rows={[
                ['Payment Due',           'Yellow',       'Invoice issued, within normal window'],
                ['Action Required',       'Red',          'Overdue or direct debit failed'],
                ['Payment Initiated',     'Blue',         'Client acted; funds not yet in transit'],
                ['In Transit',            'Blue',         'Bank confirmed; funds moving'],
                ['Cleared — Reversible',  'Green outline','ACH settled; return window still open'],
                ['Cleared — Final',       'Green filled', 'Wire settled, or ACH return window closed'],
                ['Payout Scheduled',      'Green outline','Funds cleared; payout date confirmed'],
                ['Workers Paid',          'Green filled', 'Payout executed to all workers'],
                ['On Hold',               'Yellow',       'Funds not yet cleared; payout paused'],
                ['Partially Paid',        'Yellow',       'Partial funds received; remainder outstanding'],
                ['Failed',               'Red',          'Payment or payout failed — action required'],
              ]}
            />
          </SubSection>

          <SubSection title="5.3  Payout timing communication">
            <P>
              Every open invoice shows two dates prominently: Payment due by and Workers paid by.
              If funds arrive late, the workers paid by date updates dynamically with a plain
              explanation. If payout is on hold: "Once funds clear, workers will be paid within
              1 business day."
            </P>
          </SubSection>

          <SubSection title="5.4  Partial payments">
            <P>
              Default behaviour is to block all payouts until fully settled. Client is shown amount
              received vs amount outstanding and prompted to top up. Proportional payout (pro-rata
              across worker list) is an opt-in feature for Tier 3+ clients only — partial payouts
              create reconciliation complexity and worker confusion.
            </P>
          </SubSection>

          <SubSection title="5.5  Prototype">
            <P>
              A clickable React prototype covering all six invoice states is available at the link
              below. Screens: Hub default view, Failed (direct debit), In Transit (ACH with
              timeline), On Hold, Partially Paid (progress bar), Workers Paid.
            </P>
            <div style={{ marginTop: 16 }}>
              <Link
                to="/prototype"
                style={{
                  display: 'inline-block',
                  background: '#6E3FF3',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 16px',
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                Open Payments Hub Prototype →
              </Link>
            </div>
          </SubSection>
        </Section>

      </div>
    </div>
  )
}

/* ── Shared layout primitives ── */

function Section({ n, title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
        {n} {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function P({ children, mt, muted }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.6, color: muted ? '#6B7280' : '#111', marginTop: mt || 0, marginBottom: 12 }}>
      {children}
    </p>
  )
}

function HR() {
  return <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: 48 }} />
}

function Table({ headers, rows }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'auto' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: j === 0 ? '#111' : '#374151', verticalAlign: 'top' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
