import http from "node:http";

const PORT = 8000;

// In-memory demo applications and passports
const mockPassports = {
  "pass-kemi-001": {
    id: "pass-kemi-001",
    applicantName: "Oluwakemi Adeyemi",
    businessName: "Kemi's Fabrics Ltd",
    cacNumber: "BN-0000001",
    score: 68,
    band: "B",
    components: [
      { name: "Cash Flow Stability", weight: 0.35, score: 72 },
      { name: "Ajo Savings Discipline", weight: 0.25, score: 85 },
      { name: "Business Track Record", weight: 0.2, score: 60 },
      { name: "Transaction Consistency", weight: 0.2, score: 55 },
    ],
    keyNumbers: {
      avgMonthlyInflow: 850000,
      monthsOfHistory: 11,
      consistency: "9 of 11 months above ₦500k",
      lowestBalance: 120000,
      freeCashFlow: 310000,
      repaymentCapacity: 145000,
    },
    ajo: {
      weeklyAmount: 25000,
      frequency: "weekly",
      monthsActive: 10,
      onTimeRecord: "10/11 months on time",
      verificationStatus: "collector-confirmed",
    },
    flags: ["One low-inflow month during market renovations (Nov 2023)"],
    indicativeRange: { min: 1000000, max: 2500000 },
    suggestedProduct: "Wema SME Micro-Working Capital",
    whyBullets: [
      "Consistent weekly Ajo savings confirmed by collector Mama Titi",
      "Active registered business with verifiable CAC record",
      "Average monthly inflow of ₦850,000 exceeds SME micro criteria",
    ],
    readinessChecklist: [
      { label: "CAC Registration Verified", ok: true },
      { label: "Collector-Confirmed Ajo History", ok: true },
      { label: "6+ Months Bank Statement", ok: true },
      {
        label: "Valid Tax Identification Number",
        ok: false,
        nextStep: "Submit TIN before final disbursement",
      },
    ],
    tips: [
      "Maintain monthly balance above ₦100,000 to qualify for Band A tier.",
    ],
    verificationTag: "Document-based & Collector Verified",
  },
  "pass-fatima-002": {
    id: "pass-fatima-002",
    applicantName: "Fatima Bello",
    businessName: "Bello Agro-Allied Enterprises",
    cacNumber: "RC-7819202",
    score: 84,
    band: "A",
    components: [
      { name: "Cash Flow Stability", weight: 0.35, score: 88 },
      { name: "Ajo Savings Discipline", weight: 0.25, score: 92 },
      { name: "Business Track Record", weight: 0.2, score: 80 },
      { name: "Transaction Consistency", weight: 0.2, score: 76 },
    ],
    keyNumbers: {
      avgMonthlyInflow: 1800000,
      monthsOfHistory: 12,
      consistency: "12 of 12 months above ₦1.2m",
      lowestBalance: 450000,
      freeCashFlow: 720000,
      repaymentCapacity: 380000,
    },
    ajo: {
      weeklyAmount: 50000,
      frequency: "weekly",
      monthsActive: 18,
      onTimeRecord: "18/18 months on time",
      verificationStatus: "collector-confirmed",
    },
    flags: [],
    indicativeRange: { min: 3000000, max: 5000000 },
    suggestedProduct: "Wema Agri-Growth Working Capital",
    whyBullets: [
      "Flawless 18-month Ajo record confirmed by collector Alhaja Risikat",
      "Strong positive free cash flow over 12 months",
      "CAC incorporated limited liability company",
    ],
    readinessChecklist: [
      { label: "CAC Registration Verified", ok: true },
      { label: "Collector-Confirmed Ajo History", ok: true },
      { label: "12 Months Statement Analysis", ok: true },
      { label: "Valid Tax Identification Number", ok: true },
    ],
    tips: [],
    verificationTag: "Source Verified & Collector Confirmed",
  },
  "pass-blessing-003": {
    id: "pass-blessing-003",
    applicantName: "Blessing Okon",
    businessName: "Calabar Kitchen & Catering",
    cacNumber: "BN-4402911",
    score: 52,
    band: "C",
    components: [
      { name: "Cash Flow Stability", weight: 0.35, score: 50 },
      { name: "Ajo Savings Discipline", weight: 0.25, score: 60 },
      { name: "Business Track Record", weight: 0.2, score: 50 },
      { name: "Transaction Consistency", weight: 0.2, score: 48 },
    ],
    keyNumbers: {
      avgMonthlyInflow: 480000,
      monthsOfHistory: 8,
      consistency: "5 of 8 months above ₦400k",
      lowestBalance: 40000,
      freeCashFlow: 110000,
      repaymentCapacity: 50000,
    },
    ajo: {
      weeklyAmount: 15000,
      frequency: "weekly",
      monthsActive: 6,
      onTimeRecord: "5/6 months on time",
      verificationStatus: "self-reported",
    },
    flags: ["Occasional seasonal cash dips during festive breaks"],
    indicativeRange: { min: 500000, max: 1000000 },
    suggestedProduct: "Wema Micro Trader Booster",
    whyBullets: [
      "Self-reported Ajo participation with steady market presence",
      "Positive operating balance across 8 months",
    ],
    readinessChecklist: [
      { label: "CAC Registration Verified", ok: true },
      {
        label: "Ajo Collector Confirmation",
        ok: false,
        nextStep: "Call collector to confirm contribution history",
      },
      { label: "Bank Statement Verified", ok: true },
    ],
    tips: ["Confirm collector details to boost risk band to B."],
    verificationTag: "Self-Reported",
  },
  "pass-ngozi-004": {
    id: "pass-ngozi-004",
    applicantName: "Ngozi Eze",
    businessName: "Enugu Beauty Emporium",
    cacNumber: "BN-9102834",
    score: 39,
    band: "D",
    components: [
      { name: "Cash Flow Stability", weight: 0.35, score: 38 },
      { name: "Ajo Savings Discipline", weight: 0.25, score: 35 },
      { name: "Business Track Record", weight: 0.2, score: 42 },
      { name: "Transaction Consistency", weight: 0.2, score: 40 },
    ],
    keyNumbers: {
      avgMonthlyInflow: 250000,
      monthsOfHistory: 6,
      consistency: "3 of 6 months above ₦200k",
      lowestBalance: 15000,
      freeCashFlow: 45000,
      repaymentCapacity: 20000,
    },
    ajo: {
      weeklyAmount: 10000,
      frequency: "weekly",
      monthsActive: 4,
      onTimeRecord: "3/4 months on time",
      verificationStatus: "not-confirmed",
    },
    flags: ["Multiple overdraft fee incidents", "Collector unreachable"],
    indicativeRange: { min: 250000, max: 500000 },
    suggestedProduct: "Wema Financial Literacy & Micro Starter",
    whyBullets: ["Active market stall with recent digital transaction adoption"],
    readinessChecklist: [
      { label: "CAC Registration Verified", ok: true },
      {
        label: "Collector Confirmation",
        ok: false,
        nextStep: "Need valid collector contact",
      },
    ],
    tips: ["Build 3 more consecutive months of steady inflows."],
    verificationTag: "Unverified",
  },
};

const mockApplications = [
  {
    ref: "APP-0001",
    passportId: "pass-kemi-001",
    applicantName: "Oluwakemi Adeyemi",
    businessName: "Kemi's Fabrics Ltd",
    band: "B",
    score: 68,
    status: "submitted",
    submittedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  },
  {
    ref: "APP-0002",
    passportId: "pass-fatima-002",
    applicantName: "Fatima Bello",
    businessName: "Bello Agro-Allied Enterprises",
    band: "A",
    score: 84,
    status: "approved for processing",
    submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
  },
  {
    ref: "APP-0003",
    passportId: "pass-blessing-003",
    applicantName: "Blessing Okon",
    businessName: "Calabar Kitchen & Catering",
    band: "C",
    score: 52,
    status: "under review",
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
  },
  {
    ref: "APP-0004",
    passportId: "pass-ngozi-004",
    applicantName: "Ngozi Eze",
    businessName: "Enugu Beauty Emporium",
    band: "D",
    score: 39,
    status: "more info requested",
    submittedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hrs ago
  },
];

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // GET /health
  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // GET /api/applications
  if (req.method === "GET" && pathname === "/api/applications") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(mockApplications));
    return;
  }

  // Match /api/applications/:ref
  const appMatch = pathname.match(/^\/api\/applications\/([^/]+)$/);
  if (appMatch) {
    const ref = decodeURIComponent(appMatch[1]);
    const app = mockApplications.find((a) => a.ref === ref);

    if (!app) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: `Application "${ref}" not found` }));
      return;
    }

    if (req.method === "GET") {
      const passport = mockPassports[app.passportId] || null;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ application: app, passport }));
      return;
    }

    if (req.method === "PATCH") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.status) {
            app.status = parsed.status;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(app));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ detail: "Invalid JSON" }));
        }
      });
      return;
    }
  }

  // GET /api/passports/:id
  const passMatch = pathname.match(/^\/api\/passports\/([^/]+)$/);
  if (passMatch && req.method === "GET") {
    const id = decodeURIComponent(passMatch[1]);
    const passport = mockPassports[id];
    if (!passport) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: `Passport "${id}" not found` }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(passport));
    return;
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ detail: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Mock LoenHer API server listening on http://localhost:${PORT}`);
});
