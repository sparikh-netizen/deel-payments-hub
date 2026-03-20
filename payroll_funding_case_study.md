# Payroll Funding Experience — Case Study
**Role:** Product Manager, Client Payments
**Scope:** End-to-end invoice issuance, payment collection, and worker payout clarity

---

## 1. Executive Summary

The core problem is state collapse: showing "Paid" before funds have cleared exposes the platform to financial risk, causes worker payout failures, and creates client confusion.

The design principle is: every status must reflect where money actually is, not what the client has done. Clicking "Pay Now" is not the same as funds arriving.

---

## 2. System Design — State Model

Four tracks, loosely coupled with hard dependencies.

**Source of truth hierarchy:**
- Funding = source of truth for money. Nothing downstream moves without it.
- Payout = source of truth for execution. Reads from funding, not invoice.
- Invoice = derived abstraction. Reflects the other tracks, not the other way around.
- Payment instruction = input into funding. Not the same as funds arriving.

**Dependency types:**
- Gated: payout cannot reach "Scheduled" until funding is "Fully Settled" (or advance criteria met). Invoice cannot reach "Paid" until funding confirms settlement.
- Derived: invoice status updates as a consequence of funding and payment instruction states.
- Informational: payment instruction states are surfaced to clients for visibility but do not trigger payout or invoice changes.

If the funding track reverts (e.g. ACH return), it cascades: invoice is flagged, payout is blocked or clawed back, client is notified.

---

### 2.1 Invoice Status

| State | Client-facing | Description |
|---|---|---|
| Draft | No | Generating internally |
| Issued | Yes | Sent to client, no payment yet |
| Payment Initiated | Yes | Client has acted. Client-action state, not financial state — signals intent, not money movement. |
| Partially Paid | Yes | Funds received but below total |
| Paid | Yes | Full funds settled and confirmed |
| Overdue | Yes | Due date passed, no funds |
| Cancelled | Yes | Invoice voided |

### 2.2 Payment Instruction Status

| State | Client-facing | Description |
|---|---|---|
| Pending | Yes | Received, not yet submitted to bank |
| Submitted | Yes | Sent to bank network |
| In Transit | Yes | Bank confirmed, funds moving |
| Settled | No | Funds received in platform account |
| Failed | Yes | Bank rejected the instruction |
| Returned | Yes | Funds came in then reversed |

### 2.3 Funding / Settlement Status (internal)

| State | Description |
|---|---|
| Awaiting Funds | No cleared funds yet |
| Partially Settled | Some funds received |
| Fully Settled — Reversible | ACH received, return window still open |
| Fully Settled — Final | Wire received, or ACH return window closed |
| Settlement at Risk | Funds overdue within window |
| Failed Settlement | Funds not received, payroll date at risk |

ACH settled and wire settled are not the same. A wire is final on receipt. ACH can reverse days later. Advance eligibility and UX signals should reflect this.

### 2.4 Worker Payout Status

| State | Client-facing | Description |
|---|---|---|
| Scheduled | Yes | Funds secured, payout date confirmed |
| Processing | Yes | Instructions sent to payment rails |
| Paid | Yes | Workers received funds |
| On Hold | Yes | Funds not cleared, payout paused |
| Failed | Yes | Payout failed for one or more workers |
| Partially Paid | Yes | Some workers paid, others held or failed |

---

### 2.5 State Transitions

```
Invoice Issued
  → Client acts → Payment Instruction: Pending → Submitted → In Transit
  → Funding: Awaiting Funds → Fully Settled
  → Invoice: Payment Initiated → Paid
  → Payout: Scheduled → Processing → Paid

Failure paths:
  Payment fails → Invoice reverts to Issued (with alert)
  Funds late    → Payout moves to On Hold, client notified with revised date
  ACH return    → Funding reverts → Invoice flagged → payout clawed back if not executed
```

### 2.6 Direct Debit vs Manual Transfer

| | Direct Debit | Manual Transfer |
|---|---|---|
| Who initiates | Platform pulls | Client pushes |
| Settlement | 2-5 business days | ACH: 2-5 days / Wire: same day |
| Return risk | Higher — reversible post-settlement | Lower for wire, medium for ACH push |
| Invoice after initiation | Moves to Payment Initiated | Stays at Issued until funds confirmed |
| Advance risk implication | Needs return window buffer | Wire = safe to advance; ACH push = same caution as debit |

---

## 3. Funding Timelines

### 3.1 Invoice Issuance Windows

| | ACH | Wire |
|---|---|---|
| Invoice issued | T-7 | T-3 |
| Payment due | T-5 | T-2 |
| Latest settlement | T-2 | T-1 |
| Payroll execution | T-0 | T-0 |

Windows are configurable per client and country. All deadlines use the payout country's banking timezone, not the client's local time. For wires, the platform should warn clients at least 2 hours before the receiving bank's cutoff if an invoice is still unpaid.

### 3.2 Late Funds Escalation

| Milestone | Action |
|---|---|
| T-2, ACH not settled | Urgent notification to client. Invoice → Overdue. Payout → On Hold. Internal alert to ops. |
| T-1, still not settled | Escalation to AM or CS. Platform decides on advance (see Section 4). If no advance: client notified of delay. |
| T-0, no funds | Payroll not executed. Formal client communication. Late payment recorded on risk profile. |

Workers are not notified by the platform — that is the client's responsibility.

---

## 4. Risk Framework

### 4.1 Advance Decision

Advancing payroll is a credit decision.

**Advance when:** client has 12+ months clean history, invoice is within pre-approved limit, funds are confirmed in transit or debit submitted within normal window.

**Do not advance when:** client is new (under 3 months), recent return or failed payment, invoice exceeds limit, funds not yet submitted to bank network, client has outstanding overdue invoices.

### 4.2 Exposure Tiers

| Tier | Criteria | Advance Policy |
|---|---|---|
| Tier 1 — New | Under 3 months or first 3 payrolls | No advance |
| Tier 2 — Established | 3-12 months, clean history | Up to 1 day, in-transit funds only |
| Tier 3 — Trusted | 12+ months, no returns | Up to 2 days, submitted funds |
| Tier 4 — Enterprise | Contracted SLA | Terms per contract |

Tiers reviewed quarterly. Immediate downgrade on failed payment or return.

### 4.3 Internal Controls

- **Return window hold:** ACH debits held until return window closes, unless Tier 3/4 within limit.
- **Reconciliation trigger:** Amount mismatch flags invoice for manual review before payout runs.
- **Partial settlement block:** Default is block all payouts until fully settled. Proportional payout available to Tier 3+ opt-in only — partial payouts create reconciliation complexity and worker confusion.
- **Payout hold logic:** Gated by deterministic rule engine (tier, settlement status, return window). Manual override available to risk/ops for Tier 3+ where hold is timing-related, not a risk signal. All overrides logged with operator ID and reason.
- **Debit retry:** One retry within 24 hours. Second failure locks invoice, requires manual intervention.
- **Exposure cap:** Total live advances monitored in real time against a finance-set ceiling.
- **Audit log:** Every state transition logged with timestamp, trigger type, and operator ID if manual.

---

## 5. UX — Payments Hub

*Prototype presented separately. Screens: Hub default view, Failed, In Transit, On Hold, Partially Paid, Workers Paid.*

### 5.1 Invoice Grouping

- **Action Required** — client must do something (failed debit, overdue invoice, partial top-up needed)
- **In Progress** — client has acted, platform is processing, no action needed
- **Completed** — settled and paid, archived after 90 days

### 5.2 Status Labels and Colour System

| Label | Colour | Trigger |
|---|---|---|
| Payment Due | Yellow | Issued, within normal window |
| Action Required | Red | Overdue or debit failed |
| Payment Initiated | Blue | Client acted, not yet in transit |
| In Transit | Blue | Bank confirmed funds moving |
| Cleared — Reversible | Green (outlined) | ACH settled, return window open |
| Cleared — Final | Green (filled) | Wire settled or ACH window closed |
| Payout Scheduled | Green (outlined) | Funds cleared, date confirmed |
| Workers Paid | Green (filled) | Payout executed |
| On Hold | Yellow | Funds not cleared |
| Partially Paid | Yellow | Partial funds received |
| Failed | Red | Payment or payout failed |

Red = action needed or failure. Yellow = waiting or at risk. Blue = in motion, no action. Green = resolved. Green is never used until funds have actually settled.

### 5.3 Payout Timing

Every open invoice shows two dates: **Payment due by** and **Workers paid by**. If funds arrive late, the workers paid by date updates dynamically with a plain explanation. If payout is on hold: "Once funds clear, workers will be paid within 1 business day."

### 5.4 Partial Payments

Default: block all payouts until fully settled. Client is shown amount received vs outstanding and prompted to top up. Proportional payout (pro-rata across worker list) is unlockable for Tier 3+ clients who opt in. Worker prioritisation is a v2 consideration.

---

## 6. Appendix

### A. State Transition Map

```
INVOICE:   Draft → Issued → Payment Initiated → Paid
                                              → Overdue
                          → Issued (reverted on failure)
                          → Partially Paid

PAYMENT:   Pending → Submitted → In Transit → Settled (internal)
                                           → Failed / Returned

FUNDING:   Awaiting Funds → Fully Settled — Reversible (ACH, window open)
                                          — Final (wire or window closed)
                         → Partially Settled
                         → Settlement at Risk → Failed Settlement

PAYOUT:    Scheduled → Processing → Paid
                     → On Hold → Processing (once cleared)
                     → Failed → Partially Paid
```

### B. Rail Comparison

| | ACH Debit | ACH Push | Wire |
|---|---|---|---|
| Settlement | 2-5 days | 2-5 days | Same day |
| Return window | Several days | Lower risk | None |
| Invoice lead time | T-7 | T-7 | T-3 |
| Advance eligible | Tier 2+, in window | Tier 2+ | Tier 1+, on receipt |
| Client effort | Low (automated) | High | High |

---

*Figma prototype presented live alongside this document.*
