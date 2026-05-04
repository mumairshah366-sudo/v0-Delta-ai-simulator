# Delta — AI-Powered Organisational Decision Simulator

> Predict how your team will react to any decision before you announce it.

![Delta](https://img.shields.io/badge/Built%20with-v0-black) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black) ![Track](https://img.shields.io/badge/Hackathon-Track%202-purple)

## What is Delta?

Delta helps managers simulate how their team will react to organisational decisions — before announcing them.

Add your team members with context (role, seniority, status, NPS score, personal notes). Describe a decision. Delta predicts how each individual will react, where resistance will come from, and how to roll it out effectively.

**Live Demo:** [v0-orgsim-ai-simulator.vercel.app](https://v0-orgsim-ai-simulator.vercel.app)

---

## The Problem

Every manager has announced a decision that landed badly. Not because it was wrong — but because they didn't know how their team would react.

Current options:
- **Do nothing** — announce it and deal with the fallout
- **Hire consultants** — weeks of stakeholder interviews
- **Run surveys** — slow, biased, politically answered

Delta replaces all of that with a 5-minute simulation.

---

## How It Works

1. **Add your team** — name, role, department, seniority, status (PIP, promoted, no raise, etc.), NPS score, and personal notes
2. **Describe your decision** — in plain English
3. **Run the simulation** — Delta predicts individual reactions
4. **Record what actually happened** — Delta learns and improves over time

---

## What Makes Delta Different

### Three Real Data Layers

Predictions are grounded in real datasets — not just LLM guesswork:

| Data Source | What it provides |
|-------------|-----------------|
| **Glassdoor (28M+ reviews via Bright Data)** | Role-level sentiment and resistance baselines |
| **IBM HR Attrition Dataset (1,470 employees)** | Status multipliers — how PIP, no raise, etc. affect behaviour |
| **Mental Health at Work Survey** | How change affects different employee profiles |

### Mubit Memory Layer

Every simulation you run is stored as organisational memory via Mubit. Every outcome you record calibrates future predictions. The 10th decision you simulate is more accurate than the first.

### Individual Predictions

Delta doesn't give you averages. It predicts how **each specific person** will react based on their unique context — their tenure, their status, their relationship to the decision maker, their NPS score.

---

## Features

- **Individual reaction cards** — Supportive / Neutral / Resistant with confidence scores
- **Overall risk score** — 0-100 with severity rating and explanation
- **Watch Out flags** — highlights high-risk individuals automatically
- **Leadership briefing** — specific advice for whoever is implementing the decision
- **Rollout strategy** — sequencing advice based on team composition
- **Outcome recording** — record what actually happened to improve future predictions
- **Mubit memory** — persistent org memory that improves accuracy over time
- **Bulk employee upload** — Excel/CSV import with template download
- **Company context** — paste policies, culture notes, recent announcements
- **Past simulations timeline** — full history of decisions and their outcomes
- **Department and individual scope** — simulate company-wide, department-level, or individual decisions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | v0 by Vercel |
| Framework | Next.js (App Router) |
| Deployment | Vercel |
| AI Model | Vercel AI Gateway |
| Memory | Mubit |
| Data Enrichment | Bright Data (Glassdoor dataset) |
| Styling | Tailwind CSS + shadcn/ui |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Vercel account
- Vercel AI Gateway API key
- Mubit account and API key

### Installation

```bash
git clone https://github.com/mumairshah366-sudo/v0-Delta-ai-simulator
cd v0-Delta-ai-simulator
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
VERCEL_AI_GATEWAY_KEY=your_vercel_ai_gateway_key
MUBIT_API_KEY=your_mubit_api_key
```

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

```bash
vercel deploy
```

Or connect your GitHub repo to Vercel for automatic deployments on every push.

---

## Data Sources

Delta's intelligence engine is powered by real datasets:

- **Bright Data Glassdoor Dataset** — 28M+ company reviews filtered by role and sentiment
- **IBM HR Analytics Dataset** — 1,470 employee records with attrition and satisfaction data
- **Mental Health at Work Survey** — workplace stress patterns during organisational change

---

## Roadmap

- [ ] PDF/document upload for company context
- [ ] Live Bright Data API integration
- [ ] Change management document generator
- [ ] LinkedIn employee profile enrichment
- [ ] Slack/Teams integration
- [ ] World Values Survey cultural calibration
- [ ] Mobile app

---

## Built At

Built at the **Vercel Agent Tracks Hackathon** (May 2026) — Track 2: v0 + MCPs.

Built in under 4 hours by [@mumairshah366](https://github.com/mumairshah366-sudo).

---

## License

MIT
