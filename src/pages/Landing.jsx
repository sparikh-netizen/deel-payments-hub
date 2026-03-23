import { Link } from 'react-router-dom'

const TRANSITIONS = `INVOICE:  Draft -> Issued -> Payment Initiated -> Paid
                                               -> Overdue
                           -> Issued (reverted on failure)
                           -> Partially Paid

PAYMENT:  Pending -> Submitted -> In Transit -> Settled (internal)
                                            -> Failed / Returned

FUNDING:  Awaiting Funds -> Fully Settled - Reversible (ACH, window open)
                                          - Final (wire or window closed)
                        -> Partially Settled
                        -> Settlement at Risk -> Failed Settlement

PAYOUT:   Scheduled -> Processing -> Paid
                    -> On Hold -> Processing (once cleared)
                    -> Failed -> Partially Paid`

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

        {/* How I read this brief */}
        <Section title="How I read this brief">
          <P>
            The actual problem is simple: clients think they've paid, the platform doesn't have the
            money yet, and workers are waiting. That gap between what a client did and where the money
            actually is — that's where payout failures, support escalations, and wrongful advances
            all come from.
          </P>
          <P>
            So the question I started with wasn't "what should the UI look like." It was: at every
            point in the payment lifecycle, does the system know where money is, and does the client
            know what that means for their workers?
          </P>
          <P bold>Why this matters for the business:</P>
          <P>
            Payroll is the highest-trust transaction a client makes on the platform. A single payout
            failure — workers not getting paid on time — can end the relationship. Beyond churn,
            there are three concrete cost drivers this design addresses:
          </P>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#111' }}>Payout failures drive direct revenue risk.</strong> A client who misses
              payroll because funding wasn't clear in time will blame the platform, not their bank.
              Reducing funding failures by even a small percentage materially reduces churn in the
              highest-LTV client segment.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#111' }}>CS escalations are expensive and scale badly.</strong> "Where is my
              payment" and "why haven't my workers been paid" are the most common payment-related
              contacts. Every one of those is a manual touch that doesn't need to exist if the client
              has the right information at the right time. Reducing escalations per invoice by 20–30%
              through better status visibility and self-serve recovery paths translates directly to
              ops cost savings.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: '#111' }}>Wrongful advances are a direct P&L hit.</strong> Advancing payroll on
              funds that subsequently reverse (ACH return) is a loss the platform absorbs. The risk
              tier model and the Reversible vs Final funding distinction exist specifically to limit
              this exposure without blocking payroll for clients who are genuinely reliable.
            </li>
            <li>
              <strong style={{ color: '#111' }}>Self-serve resolution reduces time-to-resolution on failures.</strong> When
              a direct debit fails today, a client's next move is often to call support. If the hub
              surfaces the retry option and the wire recovery path immediately, a meaningful share of
              those failures resolve without any human involvement.
            </li>
          </ul>
        </Section>

        <HR />

        {/* 1. Problem Statement */}
        <Section n="1." title="The Problem: State Collapse">
          <P>
            The most common failure is showing "Paid" too early. A client clicks pay, the invoice
            updates, and the platform schedules payout — but the money hasn't arrived. When the ACH
            return comes in two days later, you're unwinding a payout that already went out.
          </P>
          <P>
            The rule applied throughout: every status must reflect where money actually is, not what
            the client has done.
          </P>
          <Table
            headers={['Failure Mode', 'Root Cause', 'Impact']}
            rows={[
              ['Payout delay',           'Payout scheduled before funds cleared',     'Worker dissatisfaction, client churn'],
              ['Wrongful advance',        'Advanced on unconfirmed funds',             'Direct financial loss on returns'],
              ['CS escalation',           "Client doesn't understand payment status",  'Ops cost, client frustration'],
              ['Partial payout confusion','No clear default when partial funds arrive','Worker complaints, reconciliation overhead'],
            ]}
          />
        </Section>

        <HR />

        {/* 2. System Design */}
        <Section n="2." title="System Design: State Model">
          <SubSection title="Why four tracks">
            <P>
              Money moves through four distinct stages: issuance, instruction, settlement,
              disbursement. Each can fail independently. Collapsing them means you can't gate
              downstream actions correctly and you can't tell a client exactly where things stand.
            </P>
            <P>
              The hierarchy: Funding is the source of truth for whether money exists. Payout reads
              from funding, not from the invoice. Invoice is derived — it reflects what happened
              across the other tracks and has no independent knowledge of whether money moved.
              Payment instruction is an input into funding, not a confirmation that funds arrived.
            </P>
            <P>
              If funding reverts (ACH return, for example), the cascade fires: invoice gets flagged,
              payout gets blocked or clawed back, client gets notified. The invoice doesn't stay
              "Paid" just because it looked settled for a moment.
            </P>
            <P>Dependency types across tracks:</P>
            <ul style={{ paddingLeft: 20, margin: '0 0 12px', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              <li><strong style={{ color: '#111' }}>Gated</strong> — payout can't reach Scheduled until funding is Fully Settled (or advance criteria are met). Invoice can't reach Paid until funding confirms settlement.</li>
              <li><strong style={{ color: '#111' }}>Derived</strong> — invoice status is a consequence of the other tracks, not an independent state.</li>
              <li><strong style={{ color: '#111' }}>Informational</strong> — payment instruction states are shown to clients for visibility but don't gate anything downstream.</li>
            </ul>
          </SubSection>

          <SubSection title="2.1  Invoice Status">
            <P>
              Invoice status is what clients see. It's derived from the other tracks, which is why
              it needs to be precise. The invoice can only reach Paid when Funding confirms
              settlement. Payment Initiated is kept as a distinct state because it represents a real
              moment: the client acted, but money hasn't moved.
            </P>
            <Table
              headers={['State', 'Client-facing', 'Description']}
              rows={[
                ['Draft',             'No',  'Generating internally'],
                ['Issued',            'Yes', 'Sent to client, no payment yet'],
                ['Payment Initiated', 'Yes', 'Client acted, intent confirmed, money not yet moving'],
                ['Partially Paid',    'Yes', 'Funds received but below total'],
                ['Paid',              'Yes', 'Full funds settled and confirmed'],
                ['Overdue',           'Yes', 'Due date passed, no funds received'],
                ['Cancelled',         'Yes', 'Invoice voided'],
              ]}
            />
          </SubSection>

          <SubSection title="2.2  Payment Instruction Status">
            <P>
              Informational track. Shown to clients so they understand where their payment is in the
              banking network, but it doesn't trigger invoice or payout changes on its own.
            </P>
            <Table
              headers={['State', 'Client-facing', 'Description']}
              rows={[
                ['Pending',   'Yes', 'Received, not yet submitted to bank'],
                ['Submitted', 'Yes', 'Sent to bank network'],
                ['In Transit','Yes', 'Bank confirmed, funds moving'],
                ['Settled',   'No',  'Funds received in platform account'],
                ['Failed',    'Yes', 'Bank rejected the instruction'],
                ['Returned',  'Yes', 'Funds came in then reversed'],
              ]}
            />
          </SubSection>

          <SubSection title="2.3  Funding / Settlement Status (internal)">
            <P>
              The gate between money arriving and workers being paid. The key decision was splitting
              Fully Settled into Reversible and Final. A wire is done the moment it arrives. ACH
              looks settled but can be reversed for several days. Treating them identically means
              advancing payroll on funds that could be clawed back the next morning.
            </P>
            <Table
              headers={['State', 'Description']}
              rows={[
                ['Awaiting Funds',              'No cleared funds yet'],
                ['Partially Settled',           'Some funds received, remainder outstanding'],
                ['Fully Settled — Reversible',  'ACH received, return window still open'],
                ['Fully Settled — Final',       'Wire received, or ACH return window closed'],
                ['Settlement at Risk',          'Funds expected but not arrived within window'],
                ['Failed Settlement',           'Funds not received, payroll date at risk'],
              ]}
            />
          </SubSection>

          <SubSection title="2.4  Worker Payout Status">
            <Table
              headers={['State', 'Client-facing', 'Description']}
              rows={[
                ['Scheduled',     'Yes', 'Funds secured, payout date confirmed'],
                ['Processing',    'Yes', 'Instructions sent to payment rails'],
                ['Paid',          'Yes', 'Workers received funds'],
                ['On Hold',       'Yes', 'Funds not cleared, payout paused'],
                ['Failed',        'Yes', 'Payout failed for one or more workers'],
                ['Partially Paid','Yes', 'Some workers paid, others held or failed'],
              ]}
            />
          </SubSection>

          <SubSection title="2.5  State Transitions">
            <pre style={{
              fontSize: 12, lineHeight: 1.7, color: '#374151',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              borderRadius: 4, padding: '14px 16px', overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', margin: 0,
            }}>
              {TRANSITIONS}
            </pre>
          </SubSection>

          <SubSection title="2.6  Direct Debit vs Manual Transfer">
            <P>
              Direct debit gives the platform control over timing. Manual transfer puts that in the
              client's hands, which means more variability and more conservative advance policies.
            </P>
            <Table
              headers={['', 'Direct Debit', 'Manual Transfer']}
              rows={[
                ['Who initiates',        'Platform pulls',                      'Client pushes'],
                ['Settlement',           '2–5 business days',                   'ACH: 2–5 days / Wire: same day'],
                ['Return risk',          'Higher, reversible post-settlement',  'Lower for wire, medium for ACH push'],
                ['Invoice after action', 'Moves to Payment Initiated',          'Stays at Issued until funds confirmed'],
                ['Advance implication',  'Needs return window buffer',          'Wire is lower risk; ACH push same caution as debit'],
              ]}
            />
          </SubSection>
        </Section>

        <HR />

        {/* 3. Funding Timelines */}
        <Section n="3." title="Funding Timelines">
          <P>
            Most late payout failures aren't caused by clients refusing to pay. They happen because
            clients don't know when they need to pay, or they process the invoice on their normal AP
            cycle without realising the settlement window has already closed.
          </P>

          <SubSection title="3.1  Invoice Issuance and Payment Due Dates">
            <P>
              All invoices are issued when payroll is locked and approved. The payroll date is fixed.
              What varies by client is the payment due date, set based on the payment method they
              have on file.
            </P>
            <P>
              Take a concrete example: invoice issued 15 March, workers paid 31 March.
            </P>
            <P bold>Client has direct debit on file:</P>
            <P muted>The platform initiates the debit automatically. No client action needed.</P>
            <Table
              headers={['Event', 'Date']}
              rows={[
                ['Invoice issued',            '15 March (payroll locked)'],
                ['Platform initiates debit',  '24 March'],
                ['Latest expected settlement','29 March (5 business days, worst case)'],
                ['Reconciliation buffer',     '29–30 March'],
                ['Workers paid',              '31 March'],
              ]}
            />
            <P bold mt={20}>Client pays by manual transfer:</P>
            <P muted>Due date set conservatively on worst-case ACH. Wire funds arrive earlier and payout date pulls forward.</P>
            <Table
              headers={['Event', 'Date']}
              rows={[
                ['Invoice issued',                    '15 March (payroll locked)'],
                ['Payment due (shown to client)',      '24 March'],
                ['Latest ACH settlement expected',    '29 March'],
                ['Wire recovery deadline',            '30 March before bank cutoff'],
                ['Workers paid',                      '31 March'],
              ]}
            />
            <P mt={12}>
              The wire recovery path matters. If a client misses the 24 March due date, the platform
              should immediately surface the option: "You can still make payroll by sending a wire
              before [cutoff time] on 30 March." This gives the client a self-serve recovery path
              and reduces payout failures without ops involvement.
            </P>
            <P muted>
              All deadlines are shown in the client's local timezone with the payout country's
              banking timezone noted. A client in Singapore paying a German payroll needs to know
              the German banking cutoff, not just a date.
            </P>
          </SubSection>

          <SubSection title="3.2  What Happens When Funds Are Late">
            <Table
              headers={['Milestone', 'Action']}
              rows={[
                ['Due date, no funds received',      'Urgent notification to client. Invoice → Overdue. Payout → On Hold. Wire recovery path surfaced. Internal alert to ops.'],
                ['2 days before payroll, still nothing', 'Escalation to AM or CS. Advance eligibility assessed against tier. Client notified of likely delay.'],
                ['Payroll date, no funds',           'Payroll not executed. Formal communication with revised timeline. Late payment logged on risk profile.'],
              ]}
            />
            <P mt={12} muted>
              If funds arrive late but still clear before the payroll date, payout executes as
              normal. The late arrival is still logged — it feeds into tier review. Workers aren't
              notified by the platform; that's on the client.
            </P>
          </SubSection>
        </Section>

        <HR />

        {/* 4. Risk Framework */}
        <Section n="4." title="Risk Framework">
          <SubSection title="Advancing payroll is a credit decision">
            <P>
              The temptation is to advance liberally to protect the worker experience. The problem
              is ACH returns are real, and advancing on funds that come back the next day is a
              direct loss. The framework ties advance eligibility to demonstrated client reliability
              and uses the Reversible vs Final funding distinction to set a hard ceiling on what
              can be advanced.
            </P>
            <P>
              <strong>Advance:</strong> 12+ months clean history, invoice within pre-approved limit,
              funds in transit or debit submitted within normal window.
            </P>
            <P>
              <strong>Don't advance:</strong> new client (under 3 months), recent return or failure
              on record, invoice over limit, funds not submitted to bank yet, outstanding overdue
              invoices.
            </P>
          </SubSection>

          <SubSection title="4.1  Exposure Tiers">
            <P muted>Upgrades are manual and require a review period. Downgrades on failure are automatic and immediate.</P>
            <Table
              headers={['Tier', 'Criteria', 'Advance Policy']}
              rows={[
                ['Tier 1 — New',        'Under 3 months or first 3 payrolls',    'No advance'],
                ['Tier 2 — Established','3–12 months, clean history',            'Up to 1 business day, in-transit funds only'],
                ['Tier 3 — Trusted',    '12+ months, no returns',                'Up to 2 business days, submitted funds'],
                ['Tier 4 — Enterprise', 'Contracted SLA',                        'Terms per contract'],
              ]}
            />
          </SubSection>

          <SubSection title="4.2  Internal Controls">
            <ul style={{ paddingLeft: 20, margin: '8px 0 0', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Return window hold</strong> — ACH debits held until return window closes, unless Tier 3/4 within limit.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Reconciliation trigger</strong> — amount mismatch flags invoice for manual review before payout runs.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Partial settlement block</strong> — default blocks all payouts until fully settled. A worker getting 60% of their salary with no explanation is a worse outcome than a short delay. Proportional payout unlockable for Tier 3+ opt-in.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Payout hold logic</strong> — gated by deterministic rule engine (tier, settlement status, return window). Manual override for risk/ops on Tier 3+ timing-related holds. All overrides logged.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Debit retry</strong> — one retry within 24 hours. Second failure locks the invoice.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Exposure cap</strong> — total live advances monitored against a finance-set ceiling in real time.</li>
              <li><strong style={{ color: '#111' }}>Audit log</strong> — every state transition logged with timestamp, trigger type, and operator ID.</li>
            </ul>
          </SubSection>
        </Section>

        <HR />

        {/* 5. UX */}
        <Section n="5." title="UX: Payments Hub">
          <SubSection title="The real problem is escalation prevention">
            <P>
              Clients call support when something unexpected happens and they don't know what to do.
              The hub needs to get ahead of those moments. Three things in order of priority: make
              the required action obvious, make the expected payout date visible at all times, make
              failure self-recoverable.
            </P>
            <P>
              If those work, CS contacts per invoice go down and self-serve resolution rate goes up.
            </P>
          </SubSection>

          <SubSection title="5.1  Invoice Grouping">
            <ul style={{ paddingLeft: 20, margin: '8px 0 0', fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>Action Required</strong> — client needs to act now: fix a failed debit, initiate payment, top up a partial.</li>
              <li style={{ marginBottom: 6 }}><strong style={{ color: '#111' }}>In Progress</strong> — client has acted, platform is processing. Status and dates visible.</li>
              <li><strong style={{ color: '#111' }}>Completed</strong> — settled and paid. Archived after 90 days, always searchable.</li>
            </ul>
          </SubSection>

          <SubSection title="5.2  Status Labels and Colour System">
            <P>
              Green doesn't appear until funds have actually settled. Payment Initiated is blue.
              The Reversible vs Final distinction carries into the UX: ACH-settled funds show
              Cleared — Reversible (green outlined); wire or post-return-window funds show
              Cleared — Final (green filled). This surfaces the real risk position without asking
              clients to understand ACH mechanics.
            </P>
            <Table
              headers={['Label', 'Colour', 'When']}
              rows={[
                ['Payment Due',          'Yellow',        'Issued, within normal window'],
                ['Action Required',      'Red',           'Overdue or debit failed'],
                ['Payment Initiated',    'Blue',          'Client acted, not yet in transit'],
                ['In Transit',           'Blue',          'Bank confirmed funds moving'],
                ['Cleared — Reversible', 'Green outline', 'ACH settled, return window open'],
                ['Cleared — Final',      'Green filled',  'Wire settled or ACH window closed'],
                ['Payout Scheduled',     'Green outline', 'Funds cleared, date confirmed'],
                ['Workers Paid',         'Green filled',  'Payout executed'],
                ['On Hold',              'Yellow',        'Funds not cleared'],
                ['Partially Paid',       'Yellow',        'Partial funds received'],
                ['Failed',               'Red',           'Payment or payout failed'],
              ]}
            />
            <P mt={12} muted>Red = act now. Yellow = watch this. Blue = moving. Green = done.</P>
          </SubSection>

          <SubSection title="5.3  Payout Timing">
            <P>
              Every open invoice shows two dates: <strong>Payment due by</strong> and <strong>Workers paid by</strong>.
              When funds arrive late, the workers paid by date updates with a plain explanation.
              The client doesn't need to call to find out what changed. This single thing probably
              does more to reduce "where is my payment" contacts than anything else.
            </P>
            <P muted>On Hold: "Once funds clear, workers will be paid within 1 business day."</P>
          </SubSection>

          <SubSection title="5.4  Partial Payments">
            <P>
              Default is block until fully settled. Proportional payout (pro-rata across worker
              list) unlockable for Tier 3+ clients who opt in. Worker prioritisation is a v2
              consideration.
            </P>
          </SubSection>
        </Section>

        <HR />

        {/* 6. What I'd Test First */}
        <Section n="6." title="What I'd Test First">
          <Table
            headers={['Assumption', "How I'd test it"]}
            rows={[
              [
                'T-7 doesn't create unnecessary friction for established clients',
                'Track late payment rate by issuance timing. Tighten window for Tier 3+ if failure rates are similar at T-5.',
              ],
              [
                'Dynamic payout date reduces support contacts',
                'A/B test on late invoices: static date vs dynamic date. Measure contacts per late invoice.',
              ],
              [
                'Blocking partial payouts is the right default',
                'Track opt-in rate for proportional payout among Tier 3+ clients. High opt-in signals the default needs rethinking.',
              ],
              [
                'Tier 2 advance criteria are calibrated right',
                'Monitor return rate on Tier 2 advances. If materially higher than Tier 3, tighten criteria.',
              ],
            ]}
          />
        </Section>

        <HR />

        {/* Appendix */}
        <Section title="Appendix">
          <SubSection title="A. State Transition Map">
            <pre style={{
              fontSize: 12, lineHeight: 1.7, color: '#374151',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              borderRadius: 4, padding: '14px 16px', overflowX: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', margin: 0,
            }}>
              {TRANSITIONS}
            </pre>
          </SubSection>

          <SubSection title="B. Rail Comparison">
            <Table
              headers={['', 'ACH Debit', 'ACH Push', 'Wire']}
              rows={[
                ['Settlement',      '2–5 days',                '2–5 days',   'Same day'],
                ['Return window',   'Several days',            'Lower risk', 'None'],
                ['Invoice lead',    'T-7',                     'T-7',        'T-3'],
                ['Advance eligible','Tier 2+, in window',      'Tier 2+',    'Tier 1+, on receipt'],
                ['Client effort',   'Low (automated)',         'High',       'High'],
              ]}
            />
          </SubSection>
        </Section>

      </div>
    </div>
  )
}

/* ── Layout primitives ── */

function Section({ n, title, children }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
        {n ? `${n} ${title}` : title}
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

function P({ children, mt, muted, bold }) {
  return (
    <p style={{
      fontSize: 14,
      lineHeight: 1.6,
      color: muted ? '#6B7280' : '#111',
      fontWeight: bold ? 600 : 400,
      marginTop: mt || 0,
      marginBottom: 12,
    }}>
      {children}
    </p>
  )
}

function HR() {
  return <div style={{ borderTop: '1px solid #E5E7EB', margin: '48px 0' }} />
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
