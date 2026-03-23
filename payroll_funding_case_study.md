# Payroll Funding Experience - Case Study
**Shivam Parikh** | Product Manager, Client Payments | [View Prototype](https://deel-payments-hub.vercel.app/)

---

## How I read this brief

The actual problem is simple: clients think they've paid, the platform doesn't have the money yet, and workers are waiting. That gap between what a client did and where the money actually is - that's where payout failures, support escalations, and wrongful advances all come from.

So the question I started with wasn't "what should the UI look like." It was: at every point in the payment lifecycle, does the system know where money is, and does the client know what that means for their workers?

**Why this matters for the business:**

Payroll is the highest-trust transaction a client makes on the platform. A single payout failure - workers not getting paid on time - can end the relationship. Beyond churn, there are three concrete cost drivers this design addresses:

**Payout failures drive direct revenue risk.** A client who misses payroll because funding wasn't clear in time will blame the platform, not their bank. Reducing funding failures by even a small percentage materially reduces churn in the highest-LTV client segment.

**CS escalations are expensive and scale badly.** "Where is my payment" and "why haven't my workers been paid" are the most common payment-related contacts. Every one of those is a manual touch that doesn't need to exist if the client has the right information at the right time. Reducing escalations per invoice by 20-30% through better status visibility and self-serve recovery paths translates directly to ops cost savings.

**Wrongful advances are a direct P&L hit.** Advancing payroll on funds that subsequently reverse (ACH return) is a loss the platform absorbs. The risk tier model and the Reversible vs Final funding distinction exist specifically to limit this exposure without blocking payroll for clients who are genuinely reliable.

**Self-serve resolution reduces time-to-resolution on failures.** When a direct debit fails today, a client's next move is often to call support. If the hub surfaces the retry option and the wire recovery path immediately, a meaningful share of those failures resolve without any human involvement.

---

## 1. The Problem: State Collapse

The most common failure is showing "Paid" too early. A client clicks pay, the invoice updates, and the platform schedules payout - but the money hasn't arrived. When the ACH return comes in two days later, you're unwinding a payout that already went out.

The rule I applied throughout: every status must reflect where money actually is, not what the client has done.

| Failure Mode | Root Cause | Impact |
|---|---|---|
| Payout delay | Payout scheduled before funds cleared | Worker dissatisfaction, client churn |
| Wrongful advance | Advanced on unconfirmed funds | Direct financial loss on returns |
| CS escalation | Client doesn't understand payment status | Ops cost, client frustration |
| Partial payout confusion | No clear default when partial funds arrive | Worker complaints, reconciliation overhead |

---

## 2. System Design: State Model

### Why four tracks

Money moves through four distinct stages: issuance, instruction, settlement, disbursement. Each can fail independently. Collapsing them means you can't gate downstream actions correctly and you can't tell a client exactly where things stand.

The hierarchy: Funding is the source of truth for whether money exists. Payout reads from funding, not from the invoice. Invoice is derived - it reflects what happened across the other tracks and has no independent knowledge of whether money moved. Payment instruction is an input into funding, not a confirmation that funds arrived.

If funding reverts (ACH return, for example), the cascade fires: invoice gets flagged, payout gets blocked or clawed back, client gets notified. The invoice doesn't stay "Paid" just because it looked settled for a moment.

Dependency types across tracks:
- **Gated** - payout can't reach Scheduled until funding is Fully Settled (or advance criteria are met). Invoice can't reach Paid until funding confirms settlement.
- **Derived** - invoice status is a consequence of the other tracks, not an independent state.
- **Informational** - payment instruction states are shown to clients for visibility but don't gate anything downstream.

---

### 2.1 Invoice Status

Invoice status is what clients see. It's derived from the other tracks, which is why it needs to be precise. The invoice has no way of knowing whether the bank accepted the instruction, whether funds cleared, or whether a return came in. All of that lives in the payment and funding tracks. So Invoice can only reach Paid when Funding confirms settlement.

Payment Initiated is kept as a distinct state because it represents a real moment: the client acted, but money hasn't moved. It's a client-action state, not a financial one.

| State | Client-facing | Description |
|---|---|---|
| Draft | No | Generating internally |
| Issued | Yes | Sent to client, no payment yet |
| Payment Initiated | Yes | Client acted, intent confirmed, money not yet moving |
| Partially Paid | Yes | Funds received but below total |
| Paid | Yes | Full funds settled and confirmed |
| Overdue | Yes | Due date passed, no funds received |
| Cancelled | Yes | Invoice voided |

### 2.2 Payment Instruction Status

Informational track. Shown to clients so they understand where their payment is in the banking network, but it doesn't trigger invoice or payout changes on its own.

| State | Client-facing | Description |
|---|---|---|
| Pending | Yes | Received, not yet submitted to bank |
| Submitted | Yes | Sent to bank network |
| In Transit | Yes | Bank confirmed, funds moving |
| Settled | No | Funds received in platform account |
| Failed | Yes | Bank rejected the instruction |
| Returned | Yes | Funds came in then reversed |

### 2.3 Funding / Settlement Status (internal)

The gate between money arriving and workers being paid. The key decision was splitting Fully Settled into Reversible and Final. A wire is done the moment it arrives. ACH looks settled but can be reversed for several days. Treating them identically means advancing payroll on funds that could be clawed back the next morning.

| State | Description |
|---|---|
| Awaiting Funds | No cleared funds yet |
| Partially Settled | Some funds received, remainder outstanding |
| Fully Settled - Reversible | ACH received, return window still open |
| Fully Settled - Final | Wire received, or ACH return window closed |
| Settlement at Risk | Funds expected but not arrived within window |
| Failed Settlement | Funds not received, payroll date at risk |

### 2.4 Worker Payout Status

| State | Client-facing | Description |
|---|---|---|
| Scheduled | Yes | Funds secured, payout date confirmed |
| Processing | Yes | Instructions sent to payment rails |
| Paid | Yes | Workers received funds |
| On Hold | Yes | Funds not cleared, payout paused |
| Failed | Yes | Payout failed for one or more workers |
| Partially Paid | Yes | Some workers paid, others held or failed |

### 2.5 State Transitions

```
Invoice Issued
  -> Client acts -> Payment Instruction: Pending -> Submitted -> In Transit
  -> Funding: Awaiting Funds -> Fully Settled
  -> Invoice: Payment Initiated -> Paid
  -> Payout: Scheduled -> Processing -> Paid

Failure paths:
  Payment fails  -> Invoice reverts to Issued (with alert)
  Funds late     -> Payout moves to On Hold, client gets revised date
  ACH return     -> Funding reverts -> Invoice flagged -> payout clawed back if not executed
```

### 2.6 Direct Debit vs Manual Transfer

Direct debit gives the platform control over timing. Manual transfer puts that in the client's hands, which means more variability and more conservative advance policies.

| | Direct Debit | Manual Transfer |
|---|---|---|
| Who initiates | Platform pulls | Client pushes |
| Settlement | 2-5 business days | ACH: 2-5 days / Wire: same day |
| Return risk | Higher, reversible post-settlement | Lower for wire, medium for ACH push |
| Invoice after initiation | Moves to Payment Initiated | Stays at Issued until funds confirmed |
| Advance implication | Needs return window buffer | Wire is lower risk; ACH push same caution as debit |

---

## 3. Funding Timelines

Most late payout failures aren't caused by clients refusing to pay. They happen because clients don't know when they need to pay, or they process the invoice on their normal AP cycle without realising the settlement window has already closed.

### 3.1 Invoice Issuance and Payment Due Dates

All invoices are issued at the same point: when payroll is locked and approved. The payroll date is fixed. What varies by client is the payment due date, which is set based on the payment method they have on file.

Take a concrete example: invoice issued 15 March, workers paid 31 March.

**Client has direct debit on file:**
The platform initiates the debit automatically on the due date. No client action needed.

| Event | Date |
|---|---|
| Invoice issued | 15 March (payroll locked) |
| Platform initiates debit | 24 March |
| Latest expected settlement | 29 March (5 business days, worst case) |
| Reconciliation buffer | 29-30 March |
| Workers paid | 31 March |

**Client pays by manual transfer (no direct debit on file):**
The platform doesn't know upfront whether the client will send via ACH push or wire. The due date is set conservatively based on worst-case ACH settlement. If the client sends a wire instead, funds arrive earlier and the payout date can pull forward.

| Event | Date |
|---|---|
| Invoice issued | 15 March (payroll locked) |
| Payment due (shown to client) | 24 March |
| Latest ACH settlement expected | 29 March |
| Wire recovery deadline | 30 March before bank cutoff |
| Workers paid | 31 March |

The wire recovery path matters. If a client misses the 24 March due date, the platform should immediately surface the option: "You can still make payroll by sending a wire before [cutoff time] on 30 March." This gives the client a self-serve recovery path and reduces payout failures without ops involvement.

All deadlines are shown to clients in their local timezone with the payout country's banking timezone noted. A client in Singapore paying a German payroll needs to know the German banking cutoff, not just a date.

### 3.2 What Happens When Funds Are Late

| Milestone | Action |
|---|---|
| Due date, no funds received | Urgent notification to client. Invoice -> Overdue. Payout -> On Hold. Wire recovery path surfaced. Internal alert to ops. |
| 2 days before payroll, still nothing | Escalation to AM or CS. Advance eligibility assessed against tier. Client notified of likely delay. |
| Payroll date, no funds | Payroll not executed. Formal communication to client with revised timeline. Late payment logged on risk profile. |

If funds arrive late but still clear before the payroll date, payout executes as normal. The late arrival is still logged on the client's risk profile - it feeds into tier review.

Workers aren't notified by the platform. That's on the client.

---

## 4. Risk Framework

### Advancing payroll is a credit decision

The temptation is to advance liberally to protect the worker experience. The problem is ACH returns are real, and advancing on funds that come back the next day is a direct loss. The framework ties advance eligibility to demonstrated client reliability and uses the Reversible vs Final funding distinction to set a hard ceiling on what can be advanced.

**Advance:** 12+ months clean history, invoice within pre-approved limit, funds in transit or debit submitted within normal window.

**Don't advance:** new client (under 3 months), recent return or failure on record, invoice over limit, funds not submitted to bank yet, outstanding overdue invoices.

### 4.1 Exposure Tiers

Upgrades are manual and require a review period. Downgrades on failure are automatic and immediate.

| Tier | Criteria | Advance Policy |
|---|---|---|
| Tier 1 - New | Under 3 months or first 3 payrolls | No advance |
| Tier 2 - Established | 3-12 months, clean history | Up to 1 business day, in-transit funds only |
| Tier 3 - Trusted | 12+ months, no returns | Up to 2 business days, submitted funds |
| Tier 4 - Enterprise | Contracted SLA | Terms per contract |

### 4.2 Internal Controls

- **Return window hold** - ACH debits held until return window closes, unless Tier 3/4 within limit.
- **Reconciliation trigger** - amount mismatch flags invoice for manual review before payout runs.
- **Partial settlement block** - default is block all payouts until fully settled. A worker getting 60% of their salary with no explanation is a worse outcome than a short delay. Proportional payout unlockable for Tier 3+ opt-in.
- **Payout hold logic** - gated by deterministic rule engine (tier, settlement status, return window). Manual override for risk/ops on Tier 3+ timing-related holds. All overrides logged.
- **Debit retry** - one retry within 24 hours. Second failure locks the invoice.
- **Exposure cap** - total live advances monitored against a finance-set ceiling in real time.
- **Audit log** - every state transition logged with timestamp, trigger type, and operator ID.

---

## 5. UX: Payments Hub

### The real problem is escalation prevention

Clients call support when something unexpected happens and they don't know what to do. The hub needs to get ahead of those moments. Three things in order of priority: make the required action obvious, make the expected payout date visible at all times, make failure self-recoverable.

If those work, CS contacts per invoice go down and self-serve resolution rate goes up.

### 5.1 Invoice Grouping

- **Action Required** - client needs to act now: fix a failed debit, initiate payment, top up a partial.
- **In Progress** - client has acted, platform is processing. Status and dates visible.
- **Completed** - settled and paid. Archived after 90 days, always searchable.

### 5.2 Status Labels and Colour System

Green doesn't appear until funds have actually settled. Payment Initiated is blue. The Reversible vs Final distinction carries into the UX: ACH-settled funds show Cleared - Reversible (green outlined); wire or post-return-window funds show Cleared - Final (green filled). This surfaces the real risk position without asking clients to understand ACH mechanics.

| Label | Colour | When |
|---|---|---|
| Payment Due | Yellow | Issued, within normal window |
| Action Required | Red | Overdue or debit failed |
| Payment Initiated | Blue | Client acted, not yet in transit |
| In Transit | Blue | Bank confirmed funds moving |
| Cleared - Reversible | Green (outlined) | ACH settled, return window open |
| Cleared - Final | Green (filled) | Wire settled or ACH window closed |
| Payout Scheduled | Green (outlined) | Funds cleared, date confirmed |
| Workers Paid | Green (filled) | Payout executed |
| On Hold | Yellow | Funds not cleared |
| Partially Paid | Yellow | Partial funds received |
| Failed | Red | Payment or payout failed |

Red = act now. Yellow = watch this. Blue = moving. Green = done.

### 5.3 Payout Timing

Every open invoice shows two dates: **Payment due by** and **Workers paid by**. When funds arrive late, the workers paid by date updates with a plain explanation. The client doesn't need to call to find out what changed. This single thing probably does more to reduce "where is my payment" contacts than anything else.

On Hold: "Once funds clear, workers will be paid within 1 business day."

### 5.4 Partial Payments

Default is block until fully settled. Proportional payout (pro-rata across worker list) unlockable for Tier 3+ clients who opt in. Worker prioritisation is a v2 consideration.

---

## 6. What I'd Test First

| Assumption | How I'd test it |
|---|---|
| T-7 doesn't create unnecessary friction for established clients | Track late payment rate by issuance timing. Tighten window for Tier 3+ if failure rates are similar at T-5. |
| Dynamic payout date reduces support contacts | A/B test on late invoices: static date vs dynamic date. Measure contacts per late invoice. |
| Blocking partial payouts is the right default | Track opt-in rate for proportional payout among Tier 3+ clients. High opt-in signals the default needs rethinking. |
| Tier 2 advance criteria are calibrated right | Monitor return rate on Tier 2 advances. If materially higher than Tier 3, tighten criteria. |

---

## Appendix

### A. State Transition Map

```
INVOICE:  Draft -> Issued -> Payment Initiated -> Paid
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
                    -> Failed -> Partially Paid
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

*Prototype available at: https://deel-payments-hub.vercel.app/prototype*
