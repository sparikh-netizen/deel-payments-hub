# Deel Payments Hub — Prototype

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
