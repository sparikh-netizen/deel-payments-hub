# Deel Payments Hub — Prototype

## Interview Context
This project is part of Shivam's interview process at Deel for the **PM, Client Payments** role.

**Process so far:**
- Completed an initial call with Eithan (positive feedback)
- Next stage: Product Exercise — 60-minute live presentation with **Slavic** (hiring manager)
- Submit assignment at: https://you.ashbyhq.com/Deel/assignment/fb0c54a9-ce9c-4778-a009-edb421bb0399
- Then schedule the live presentation via the link in the email

**What the panel cares about:**
1. How you design system states that reflect real money movement
2. How you reduce financial risk while preserving UX clarity
3. How you think about funding timelines and payout risk
4. How you communicate complex financial flows simply

**Format:** 60 min, discussion-style, no strict presentation length. Figma/diagrams/docs all fine. Clarity of thinking > visual polish.

**Deliverables:**
- Written case study response → `payroll_funding_case_study.md` (complete)
- Coded prototype → `https://deel-payments-hub.vercel.app` (complete)

---

## Case Study Brief (from PDF: Client UX PM Case Study)

### Context
PM for Client Payments at a global payroll platform. Clients fund payroll invoices before workers are paid via:
1. **Autopay / Direct Debit** — platform debits linked bank account
2. **Manual Bank Transfer** — client initiates from their bank

System must: reflect invoice & payment state clearly, inform client when funds arrive and when workers are paid, manage financial risk.

### Problem
Payroll has multiple states: Invoice issuance → Client payment intent → Funds in transit → Funds settlement → Worker payout → Potential returns/failures.

Collapsing states incorrectly (e.g. showing "Paid" too early) risks: financial exposure, advancing payroll without cleared funds, worker payout failures, client confusion, support burden.

### What to Deliver

**1. System Design**
State model for: Invoice status / Payment instruction status / Funding/settlement status / Worker payout status.
- Which states are user-facing vs internal only
- How they transition
- How they differ between direct debit and manual bank transfer

**2. Funding Timelines & Invoice Issuance**
- When invoices should be issued relative to payroll date
- When payment should be due
- How settlement timing impacts worker payout timing
- What happens if funds are late
- When to advance payroll vs when not to
- How to limit exposure and what internal controls to build

**3. UX Design — Payments Hub**
- How invoices are grouped (Action Required / In Progress / Completed)
- What status labels mean
- When to use red / yellow / green
- How worker payout timing is communicated
- How partial payments are handled
- Must include Figma sketch, diagram, or structured wireframe → **this prototype fulfils this requirement**

### Additional Data
- ACH settlement: 2–5 business days
- Wire settlement: same-day (cutoff dependent)
- Direct debit return window: up to several days
- Payroll date is fixed and legally sensitive
- Clients may be in multiple time zones
- Clients may have multiple invoices open simultaneously

---

## Purpose
A clickable UI prototype built for Shivam's interview with Deel.
Demonstrates a Payroll Funding Payments Hub — CFO-level product, not consumer.

## Locations
- **Local:** `/Users/shivamparikh/deel-payments-hub`
- **GitHub:** https://github.com/sparikh-netizen/deel-payments-hub
- **Live (Vercel):** https://deel-payments-hub.vercel.app
- Vercel auto-deploys on every push to `main`

## Stack
- React + Vite
- Tailwind CSS v3 (custom Deel colour tokens in `tailwind.config.js`)
- No backend — all data is static in `src/data/invoices.js`

## Structure
```
src/
  data/invoices.js          — all invoice mock data (single source of truth)
  screens/PaymentsHub.jsx   — hub view with 3 summary cards + grouped invoice list
  screens/InvoiceDetail.jsx — detail view for all 6 invoice statuses
  components/InvoiceCard.jsx
  components/StatusBadge.jsx
  components/Sidebar.jsx
  components/Timeline.jsx   — used on In Transit screen (Screen 3)
```

## 6 Screens
| Screen | Status | Invoice ID |
|--------|--------|------------|
| 1 | Payments Hub (default) | all invoices |
| 2 | Failed — direct debit failed, Retry CTA | inv-001 |
| 3 | In Transit — ACH, timeline component | inv-003 |
| 4 | On Hold — funds not cleared, animation | inv-002 |
| 5 | Partially Paid — progress bar, Top Up CTA | inv-004 |
| 6 | Workers Paid — completed, no CTA | inv-005 / inv-006 |

## Invoice Groups
- `action` — Action Required (red) — only inv-001 (Failed)
- `progress` — In Progress (blue) — inv-002 (On Hold), inv-003 (In Transit), inv-004 (Partial)
- `completed` — Completed (green) — inv-005, inv-006

## Key interactions
- Hub summary cards scroll smoothly to their section on click
- Clicking "Retry Payment" on Screen 2 transitions inv-001 to In Progress in the hub
- Screen 4 (On Hold) has a "Funds Cleared" trigger with animated date update

## Design tokens (Deel-style)
Defined in `tailwind.config.js` under `theme.extend.colors.deel`:
- Purple: `#6C5CE7` (primary CTA)
- Nav bg: `#1A1F36` (sidebar)
- Status colours: red `#EF4444`, yellow `#F59E0B`, blue `#3B82F6`, green `#10B981`

## Running locally
```bash
npm install
npm run dev
```
