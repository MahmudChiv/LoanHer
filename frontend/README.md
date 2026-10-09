# LoanHer Frontend — Wema Bank SME Loan Desk

Next.js (App Router, TypeScript, Tailwind CSS) frontend for LoanHer.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_URL` to point to your FastAPI backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Routes
- `/` — Landing page
- `/officer` — Wema Bank Officer Dashboard (Live Application Queue)
- `/officer/[ref]` — Application Detail & Wema Credit Review Actions
- `/passport/[id]` — Applicant Loan Passport View
