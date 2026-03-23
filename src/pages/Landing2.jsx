import { Link } from 'react-router-dom'
import TimelineDiagram from '../components/TimelineDiagram'

const TRANSITIONS = `INVOICE:   Draft → Issued → Payment Initiated → Paid
                                             → Overdue
                       Payment Initiated → Issued (reverted on failure)
                                        → Partially Paid

PAYMENT:   Pending → Submitted → In Transit → Settled (internal)
                                            → Failed
                                            → Returned

FUNDING:   Awaiting Funds → Fully Settled — Reversible (ACH, window open)
                                          → Fully Settled — Final (wire or window closed)
                          → Partially Settled
                          → Settlement at Risk → Failed Settlement

PAYOUT:    Scheduled → Processing → Paid
                     → On Hold → Processing (once funds clear)
                     → Failed → Partially Paid`

export default function Landing2() {
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
        <div style={{ marginBottom: 0 }}>
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
            The core problem is state collapse. When a platform shows "Paid" the moment a client
            clicks a button — before funds have actually cleared — it creates a false reality.
            Workers get paid from money that hasn't arrived. If the payment reverses, the platform
            absorbs the loss, not the client.
          </P>
          <P>
            This risk is especially acute for Deel. In EOR arrangements, Deel is the legal employer.
            If payroll doesn't run because funds didn't clear in time, the legal exposure falls on
            Deel — not the client who missed the deadline. The system design has to account for
            that asymmetry.
          </P>
          <P>
            The design principle that follows from this: every status must reflect where money
            actually is, not what the client has done. Clicking "Pay Now" is an instruction, not
            a transfer. Funds arriving in transit is movement, not settlement. Settlement is final
            only when the return window closes — and for ACH, that window stays open for days after
            the money appears to have landed.
          </P>
        </Section>

        <HR />

        {/* 2. System Design */}
        <Section n="2." title="System Design — State Model">
          <P>
            Payroll funding involves four distinct tracks: invoice status, payment instruction,
            funding/settlement, and worker payout. They're loosely coupled — each has its own
            lifecycle — but with hard dependencies that only flow one direction.
          </P>
          <P>
            Funding is the source of truth. Nothing downstream moves without it. Payout reads
            from funding, not from invoice. Invoice status is a derived abstraction — it reflects
            the state of the other tracks, it does not drive them. Payment instruction is an
            input into funding, not a confirmation of it.
          </P>
          <P>
            This hierarchy matters when things go wrong. If the funding track reverts — an ACH
            debit reverses three days after it appeared to settle — it cascades upward: the invoice
            is flagged, any scheduled payout is blocked or clawed back, and the client is notified.
            The system can only do that correctly if the tracks were never conflated in the first place.
          </P>

          <SubSection title="The ACH / Wire distinction">
            <P>
              Not all settled funds are equal. A wire is final on receipt — there is no return window.
              An ACH settlement looks identical in the platform but remains reversible for several
              days afterward. Treating them the same is where financial exposure gets created.
            </P>
            <P>
              The funding track models this with two distinct final states: Fully Settled — Reversible
              (ACH received, window still open) and Fully Settled — Final (wire received, or ACH
              window closed). Payout scheduling, advance eligibility, and the colour system in the
              client UI all differentiate between these two states. Green — the colour that signals
              resolution — is never applied until settlement is final.
            </P>
          </SubSection>

          <SubSection title="Direct debit vs manual transfer">
            <P>
              The two payment rails create different risk profiles and different client experiences.
              With direct debit, Deel initiates the pull — the client's involvement ends once autopay
              is configured. With manual transfer, the client pushes funds and Deel waits. The
              invoice behaves differently in each case: a direct debit instruction moves the invoice
              to Payment Initiated immediately (the client has authorised it), while a manual
              transfer keeps the invoice at Issued until funds are confirmed in transit. The advance
              eligibility logic also diverges — a wire on receipt is safe to advance against;
              an ACH push carries the same return risk as a direct debit and requires the same caution.
            </P>
          </SubSection>

          <SubSection title="State transition map">
            <pre style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: '#374151',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 4,
              padding: '14px 16px',
              overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              margin: 0,
            }}>
              {TRANSITIONS}
            </pre>
          </SubSection>
        </Section>

        <HR />

        {/* 3. Funding Timelines */}
        <Section n="3." title="Funding Timelines &amp; Invoice Issuance">
          <P>
            Payroll execution is fixed and legally sensitive. The invoice issuance window works
            backward from that date, accounting for the settlement time of the payment rail the
            client uses. For ACH — whether debit or push — invoices go out at T‑7 with payment
            due at T‑5, leaving a two-day buffer after expected settlement before payroll runs.
            For wire, the window compresses to T‑3 issuance and T‑2 due, because wire settlement
            is same-day and final. All deadlines are calculated in the payout country's banking
            timezone, not the client's local time.
          </P>

          <TimelineDiagram />

          <SubSection title="When funds are late">
            <P>
              At T‑2, if ACH funds haven't settled, the invoice moves to Overdue, the payout
              moves to On Hold, and the client receives an urgent notification. Ops are alerted
              internally. At T‑1, if funds still haven't arrived, account management escalates
              and the platform evaluates whether the client qualifies for an advance. If not,
              the client is notified their workers' pay date will slip. At T‑0 with no funds,
              payroll doesn't execute — this is recorded on the client's risk profile and triggers
              formal communication from Deel. Workers are not notified by the platform; that
              is the client's responsibility.
            </P>
          </SubSection>
        </Section>

        <HR />

        {/* 4. Risk Framework */}
        <Section n="4." title="Risk Framework">
          <P>
            "Advancing payroll" is commonly misread as extending credit to the client. It's not.
            The client's funds are already submitted to the bank network — the money is in motion.
            What Deel is deciding is whether to pay workers before ACH settlement is final, which
            means absorbing the reversal risk during the return window. It's a settlement risk
            decision, not a lending decision.
          </P>
          <P>
            That distinction matters for how you design the controls. The question isn't "does
            this client have the ability to pay?" — they've already initiated payment. The question
            is "if this ACH reverses in three days, what is Deel's exposure and can we absorb it?"
          </P>
          <P>
            For EOR clients, Deel already holds a security deposit covering 1–1.5 months of total
            charges. That deposit is a natural buffer against advance risk and should factor into
            tier classification and exposure calculations — particularly for established EOR
            relationships where the deposit has been validated over multiple payroll cycles.
          </P>

          <SubSection title="Client exposure tiers">
            <P>
              Advance eligibility is tiered by client tenure and payment history. New clients —
              under three months or within their first three payrolls — are not eligible for any
              advance. There is no payment history to underwrite against, and Deel's exposure on
              a reversal would be fully unhedged. Established clients (3–12 months, clean history)
              can be advanced up to one day on in-transit funds only. Trusted clients (12+ months,
              no returns or failures) can be advanced up to two days on submitted funds. Enterprise
              clients operate under contracted SLA terms.
            </P>
            <P>
              Tiers are reviewed quarterly and downgraded immediately on any failed payment or return.
              A single return event revokes advance eligibility until the next quarterly review.
            </P>
          </SubSection>

          <SubSection title="Internal controls">
            <P>
              The advance decision is made by a deterministic rule engine — tier, settlement status,
              return window state. Manual overrides are available to risk and ops for Tier 3+
              clients where the hold is timing-related rather than a risk signal, but every override
              is logged with operator ID and reason.
            </P>
            <P>Beyond the advance logic, four controls matter most:</P>
            <ul style={{ paddingLeft: 20, margin: '8px 0 0', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              <li><strong style={{ color: '#111' }}>Amount mismatch flagging.</strong> Any partial receipt triggers a manual review before payout runs. The system does not attempt to reconcile automatically.</li>
              <li><strong style={{ color: '#111' }}>Partial settlement block.</strong> Default is to block all payouts until the invoice is fully settled. Proportional payout — splitting workers' pay pro-rata against received funds — is an opt-in feature for Tier 3+ clients only. It creates reconciliation complexity and worker confusion; it should not be the default.</li>
              <li><strong style={{ color: '#111' }}>Debit retry policy.</strong> One retry within 24 hours of a failed debit. A second failure locks the invoice and requires manual intervention — automated retry beyond that point tends to compound failures and damage the banking relationship.</li>
              <li><strong style={{ color: '#111' }}>Real-time exposure cap.</strong> Total live advances are monitored against a finance-set ceiling. This is not a PM decision — the ceiling is set by finance based on Deel's own settlement risk tolerance — but the PM is responsible for ensuring the system surfaces that cap to risk/ops in real time.</li>
            </ul>
          </SubSection>
        </Section>

        <HR />

        {/* 5. UX Design */}
        <Section n="5." title="UX Design — Payments Hub">
          <P>
            The hub is a CFO-level tool, not a consumer payments screen. Clients may have multiple
            invoices open across multiple countries simultaneously. The design has to surface what
            needs action without burying it in status noise.
          </P>
          <P>
            The colour system does one job: communicate urgency. Red means the client must act.
            Yellow means something is waiting or at risk but no action is needed yet. Blue means
            the process is in motion. Green means it is resolved. Green is never applied until
            funds have actually settled — not when the client initiates payment, not when funds
            are in transit, not when ACH has landed but the return window is still open. That
            single rule prevents the most common failure mode in payments UX: false reassurance.
          </P>

          <SubSection title="Invoice grouping">
            <P>
              Invoices are grouped by what the client needs to do, not by payment method, date,
              or country. Action Required (red) means the client must act — a failed debit, an
              overdue invoice, a partial payment that needs topping up. In Progress (blue) means
              the client has acted and the platform is processing — no action needed. Completed
              (green) means fully settled and workers paid. A client with twelve open invoices
              across six countries should be able to see at a glance whether any of them need
              their attention.
            </P>
          </SubSection>

          <SubSection title="Status labels and colour reference">
            <StatusTable />
          </SubSection>

          <SubSection title="Payout timing">
            <P>
              Every open invoice surfaces two dates prominently: when payment is due and when
              workers will be paid. These are not fine print — they are the two numbers a CFO
              actually cares about. If funds arrive late, the workers paid by date updates
              dynamically with a plain explanation. If payout is on hold, the message is direct:
              "Once funds clear, workers will be paid within 1 business day." No jargon, no
              hedging, no passive voice.
            </P>
          </SubSection>

          <SubSection title="Prototype">
            <P>
              A clickable React prototype covering all six invoice states is available via the
              link in the page header. Screens: Hub default view, Failed (direct debit),
              In Transit (ACH with settlement timeline), On Hold (animated funds-cleared trigger),
              Partially Paid (progress bar with top-up CTA), Workers Paid (completed state).
            </P>
          </SubSection>
        </Section>

      </div>
    </div>
  )
}

/* ── Status table — earns its place as a genuine reference ── */

const STATUS_ROWS = [
  { label: 'Payment Due',          colour: 'Yellow',        dot: '#F59E0B', trigger: 'Invoice issued and within the normal payment window' },
  { label: 'Action Required',      colour: 'Red',           dot: '#EF4444', trigger: 'Invoice overdue or direct debit failed' },
  { label: 'Payment Initiated',    colour: 'Blue',          dot: '#3B82F6', trigger: 'Client acted; funds not yet in transit' },
  { label: 'In Transit',           colour: 'Blue',          dot: '#3B82F6', trigger: 'Bank confirmed; funds are moving' },
  { label: 'Cleared — Reversible', colour: 'Green outline', dot: '#10B981', trigger: 'ACH settled; return window still open' },
  { label: 'Cleared — Final',      colour: 'Green filled',  dot: '#10B981', trigger: 'Wire settled, or ACH return window has closed' },
  { label: 'Payout Scheduled',     colour: 'Green outline', dot: '#10B981', trigger: 'Funds cleared; worker payout date confirmed' },
  { label: 'Workers Paid',         colour: 'Green filled',  dot: '#10B981', trigger: 'Payout executed to all workers' },
  { label: 'On Hold',              colour: 'Yellow',        dot: '#F59E0B', trigger: 'Funds not yet cleared; payout paused' },
  { label: 'Partially Paid',       colour: 'Yellow',        dot: '#F59E0B', trigger: 'Partial funds received; remainder outstanding' },
  { label: 'Failed',               colour: 'Red',           dot: '#EF4444', trigger: 'Payment or payout failed — action required' },
]

function StatusTable() {
  return (
    <div style={{ marginTop: 12, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            <th style={TH}>Status label</th>
            <th style={TH}>Colour</th>
            <th style={TH}>Trigger condition</th>
          </tr>
        </thead>
        <tbody>
          {STATUS_ROWS.map(row => (
            <tr key={row.label}>
              <td style={{ ...TD, color: '#111', fontWeight: 500 }}>{row.label}</td>
              <td style={TD}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.dot, display: 'inline-block', flexShrink: 0 }} />
                  {row.colour}
                </span>
              </td>
              <td style={{ ...TD, color: '#374151' }}>{row.trigger}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TH = { padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }
const TD = { padding: '8px 12px', border: '1px solid #E5E7EB', verticalAlign: 'top' }

/* ── Layout primitives ── */

function Section({ n, title, children }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
        {n} {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function P({ children }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#111', margin: '0 0 14px' }}>
      {children}
    </p>
  )
}

function HR() {
  return <div style={{ borderTop: '1px solid #E5E7EB', margin: '48px 0' }} />
}
