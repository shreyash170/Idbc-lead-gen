# IDBI Smart Lead Engine — Track 02 PoC

**Behavioral & Transaction-Driven Lead Generation for Retail Lending**

Live Demo: https://frontend-ek1apoz7u-shreyash170s-projects.vercel.app
Backend API: https://idbc-lead-gen.onrender.com/api/leads

> Note: The backend runs on Render's free tier and may take 30–60 seconds to
> wake up if it hasn't been used recently. If the dashboard shows no leads on
> first load, please wait a moment and refresh.

---

## Problem Statement

Bank's retail lending relies on traditional metrics, resulting in low
conversions and limited insight into customer intent. A data-driven approach
is needed to identify eligible, quantifiable repayment capacity, and
genuinely interested prospects using transaction and behavioral insights.

**Expected Outcome:** Generate high-quality leads with a conversion rate
exceeding 30%, while enabling accurate assessment of borrowers' actual
income levels to support prudent underwriting for Personal Loans, Home
Loans, Mortgage Loans, and Auto Loans.

---

## Our Approach

Instead of relying only on declared income and static credit scores, we
combine three signal groups into a single, explainable **Lead Score (0–100)**:

1. **Transactional Behavior** — UPI transaction volume, average account
   balance, spending patterns
2. **Financial Stability** — savings rate, existing loan burden, credit
   card utilization
3. **Loan Intent Signals** — branch visits, loan page searches, active
   inquiries by loan type

This produces two outputs per customer:
- An **estimated actual income**, blended from declared salary and
  behavioral spending signals — more resistant to under-reporting than
  salary slips alone
- A **Lead Score** with a plain-language breakdown of *why* that score was
  given, so relationship managers can trust and act on it rather than
  treating it as a black box

## Architecture

```
Synthetic Data Generator (Faker.js)
            │
            ▼
   Node.js / Express API
   ├── /api/leads        → ranked, filterable lead list + summary stats
   └── /api/leads/:id     → single customer detail with full score breakdown
            │
            ▼
     React Dashboard (RM-facing)
   ├── Filter by loan type & minimum score
   ├── Score distribution histogram
   └── Detail drawer with score explainability
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | React |
| Synthetic Data | Faker.js (300 generated customer profiles) |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

## Running Locally

### Backend
```bash
cd backend
npm install
node data/generateData.js   # generates synthetic dataset (run once)
node server.js               # starts API on port 5050
```

### Frontend
```bash
cd frontend
npm install
npm start                    # runs on port 3000
```

By default, the frontend points to the deployed Render backend. To test
against your local backend instead, change `API_BASE` in
`frontend/src/App.js` to `http://localhost:5050/api/leads`.

## Sample Results (on synthetic data)

- 300 synthetic customer profiles generated
- 217 leads scored above the 60-point threshold
- Predicted conversion rate exceeding the 30% target benchmark
- Every lead comes with a transparent, human-readable explanation
  (e.g. "Strong repayment capacity", "High loan intent signal")

## Why This Approach Solves the Problem

- **Higher conversion quality:** intent signals (branch visits, active
  searches) are weighted heavily, filtering out browsers from genuine
  prospects
- **Better underwriting inputs:** the estimated income figure blends
  declared salary with real transaction behavior, reducing reliance on
  self-reported numbers alone
- **Explainability by design:** every score ships with reasons attached,
  so RMs and credit teams can audit and trust the output — a requirement
  for real banking deployment, not just a hackathon nicety
- **Loan-type aware:** scoring and filtering work across Personal, Home,
  Auto, and Mortgage loans as required by the problem statement

## Path to Production

This PoC currently runs on synthetic data. In a bank sandbox environment,
the same scoring architecture would plug directly into:

- **UPI/Account Aggregator APIs** in place of the synthetic transaction feed
- **Core banking salary credit data** in place of the declared salary field
- **CRM/branch visit logs** in place of the simulated intent signal
- A **trained ML classifier** (logistic regression / gradient boosting) in
  place of the current rule-weighted scoring, once labeled historical
  conversion data is available for training

## Team

Shreyash Gupta
Shalu Jawla
Anjali Parashar
Deepak Kumar

## Future Scope

- Replace rule-based scoring with a trained ML model once real
  conversion-labeled data is available
- Android companion app for relationship managers (push alerts on
  high-score leads)
- Integration with IDBI's sandbox APIs (GST, UPI, AA, EPFO) for real
  alternate-data ingestioǹ