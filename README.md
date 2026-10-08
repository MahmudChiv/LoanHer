# LoanHer — Loan Passport for Women-Led SMEs

> **Hackaholics 7.0 prototype · Wema Bank · 2-day build**

---

## Overview

LoanHer is a WhatsApp-based loan-readiness tool that helps women-led small
businesses in Nigeria understand their financial standing before approaching a
bank.  A customer simply sends a WhatsApp message, answers a few questions
about her ajo/esusu savings group, uploads a bank statement, and receives a
**Loan Passport** — a clear, one-page summary of her financial health.  She
can then send that Passport directly to a Wema Bank officer, who sees it
immediately on a dashboard.  No branch visit required to start the
conversation.

---

## The Problem

Many women-led micro and small businesses in Nigeria are profitable and
creditworthy, but they are locked out of formal lending because they lack the
documentation that traditional credit scoring demands.  Their savings discipline
shows up in informal ajo groups, their income shows up in mobile money
transfers, and their business reputation lives in their community — none of
which is visible to a bank officer looking at a standard application form.

## The Solution

LoanHer translates informal financial behaviour into a language banks
understand.  It asks simple WhatsApp questions, cross-references ajo
participation with the collector, and runs a lightweight analysis on the
applicant's bank statement to produce a **Loan Passport** with a readiness
band (A–D), key financial numbers, and a personalised action checklist.

---

## How It Works (6 Steps)

1. **WhatsApp chat** — The applicant messages the LoanHer bot and answers
   questions about her business and ajo group.
2. **Ajo confirmed by collector** — The bot contacts the ajo group leader to
   verify the applicant's savings history.
3. **Statement upload** — The applicant sends a photo or PDF of her bank
   statement via WhatsApp.
4. **Passport generated** — The backend scores the applicant across four
   dimensions (statement, ajo, CAC registration, consistency) and builds her
   Loan Passport.
5. **Send to Wema** — The applicant taps a button on her Passport page to
   submit to Wema Bank with one click.
6. **Officer dashboard** — A Wema Bank officer sees all incoming applications
   sorted by readiness band and can update each application's status.

---

## Architecture

```
WhatsApp (applicant / collector)
        │
        ▼ inbound message
┌───────────────────┐
│  Twilio webhook   │  POST /webhook
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────────┐
│       FastAPI backend (Render)        │
│                                       │
│  app/                                 │
│  ├── main.py        CORS + routers    │
│  ├── config.py      env vars          │
│  ├── store.py       in-memory state   │
│  ├── api/routes/    HTTP endpoints    │
│  └── services/      business logic   │
└────────────────┬──────────────────────┘
                 │  JSON over HTTPS
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│ Passport page│   │ Officer dashboard│
│ /passport/id │   │ /officer         │
│  (Next.js)   │   │  (Next.js)       │
└──────────────┘   └──────────────────┘
      (Vercel)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| WhatsApp messaging | Twilio WhatsApp sandbox |
| Backend API | Python · FastAPI · uvicorn |
| In-memory state | Python dicts (single Render worker) |
| Frontend | Next.js 15 · TypeScript · Tailwind CSS |
| Backend hosting | Render (free tier) |
| Frontend hosting | Vercel |
| Local webhook testing | ngrok |

---

## Project Structure

```
LoanHer/
├── backend/
│   ├── app/
│   │   ├── main.py             FastAPI app, CORS, routers
│   │   ├── config.py           pydantic-settings Settings
│   │   ├── store.py            in-memory state dicts
│   │   ├── api/routes/         HTTP route handlers
│   │   ├── services/           business logic (stubs)
│   │   └── models/schemas.py   Pydantic models
│   ├── tests/
│   │   └── test_health.py      GET /health test
│   ├── scripts/
│   │   └── generate_statement.py  synthetic statement generator
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml          ruff + pytest config
│   └── .env.example
├── frontend/                   Next.js app (App Router, TypeScript, Tailwind)
│   ├── src/app/
│   │   ├── page.tsx            landing page
│   │   ├── passport/[id]/      Passport view
│   │   └── officer/            Officer dashboard
│   ├── src/components/
│   ├── src/lib/api.ts          typed fetch helpers
│   ├── src/types/index.ts      TypeScript types
│   └── .env.example
├── data/
│   ├── README.md               fixture file documentation
│   └── statement/              generated PDF statements
├── docs/                       architecture diagrams, pitch deck
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

## Getting Started

### Backend

```bash
# 1. Activate the virtual environment
source .loanHerVenv/bin/activate      # Linux / macOS
# .loanHerVenv\Scripts\activate       # Windows

# 2. Install dependencies
pip install -r backend/requirements-dev.txt

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your Twilio credentials

# 4. Start the API server (run from backend/)
cd backend
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/health  should return {"status": "ok"}
```

### Frontend

```bash
# 1. Install dependencies (run from frontend/)
cd frontend
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local if your backend runs on a different port

# 3. Start the dev server
npm run dev
# → http://localhost:3000
```

### Testing the Twilio Webhook Locally

```bash
# Install ngrok (https://ngrok.com/download)
ngrok http 8000

# Copy the HTTPS forwarding URL, e.g. https://abc123.ngrok.io
# In the Twilio console → Messaging → Try it out → WhatsApp sandbox,
# set the "When a message comes in" webhook to:
#   https://abc123.ngrok.io/webhook
```

### Running Tests and Linting

```bash
# From backend/ (with venv active):
pytest                  # run test suite
ruff check .            # lint
ruff format .           # auto-format
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | placeholder |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | placeholder |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender | `whatsapp:+14155238886` |
| `FRONTEND_URL` | URL of the Next.js app | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `DEMO_RESET_SECRET` | Secret for `/api/demo/reset` | `change_me` |
| `DATA_DIR` | Path to the `/data` directory | `../data` |
| `ENVIRONMENT` | `development` or `production` | `development` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Live Links

| Resource | URL |
|----------|-----|
| Frontend | _TBD — Vercel URL here_ |
| Backend API | _TBD — Render URL here_ |
| Loom demo | _TBD — Loom link here_ |

---

## Honest Limits

This is a **hackathon prototype**. Before any real deployment:

- **Dummy data only** — CAC lookups, statement analysis, and identity checks
  are all mocked with fictional data. No real financial data is used.
- **Simulated statement analysis** — The "AI analysis" is a deterministic
  heuristic running against a synthetic PDF, not a real ML model.
- **Document-based, not source-verified** — The Passport score is based on
  documents submitted by the applicant; data has not been independently
  verified from primary sources.
- **No persistence** — All state lives in Python dicts and is wiped on server
  restart.
- **Single worker** — The Render deployment runs one uvicorn worker; not
  suitable for concurrent load.
- **No KYC or AML** — This tool does not perform regulatory identity or
  anti-money-laundering checks.

---

## Team

| Name | Role |
|------|------|
| _TBD_ | Backend |
| _TBD_ | Frontend |
| _TBD_ | Product / Design |
