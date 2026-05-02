import { NextRequest, NextResponse } from 'next/server'

const DELTA_DATA_ENGINE = `
=== DELTA INTELLIGENCE ENGINE ===
Powered by: Bright Data (Glassdoor 28M+ reviews sample), 
IBM HR Dataset (1,470 employees), Mental Health at Work Survey

--- ENGINEERING (57 reviews analysed) ---
Average satisfaction: 3.9/5 | Dissatisfied: 9% | Satisfied: 75%
Culture rating: 3.8/5 | Leadership trust: 3.4/5
Top complaints: "Lay-offs, trend chasers not trend setters, risk averse"
What engaged engineers value: "Working from home, friendly coworkers, great work life balance"

--- PRODUCT (16 reviews analysed) ---
Average satisfaction: 3.6/5 | Dissatisfied: 19% | Satisfied: 62%
Culture rating: 3.6/5 | Leadership trust: 3.2/5
Top complaints: "Old Boys Club, success is about who you know not what you do"
What engaged PMs value: "Great opportunities, good company direction"

--- SALES (24 reviews analysed) ---
Average satisfaction: 3.8/5 | Dissatisfied: 21% | Satisfied: 58%
Culture rating: 4.1/5 | Leadership trust: 3.7/5
Top complaints: "Low pay, bad senior executives, too focused on outsourcing"
What engaged sales value: "Good pay, flexible hours, bonus structure"

--- MARKETING (3 reviews analysed) ---
Average satisfaction: 5.0/5 | Dissatisfied: 0% | Satisfied: 100%
Culture rating: 4.5/5 | Leadership trust: 4.5/5
What engaged marketers value: "Great work environment, supportive team, learning opportunities"

--- HR (8 reviews analysed) ---
Average satisfaction: 4.4/5 | Dissatisfied: 0% | Satisfied: 100%
Culture rating: 4.6/5 | Leadership trust: 4.4/5
What engaged HR value: "Open door policy, growth opportunities, great culture"

--- FINANCE (7 reviews analysed) ---
Average satisfaction: 4.0/5 | Dissatisfied: 14% | Satisfied: 86%
Culture rating: 3.5/5 | Leadership trust: 2.8/5
Top complaints: "Continual layoffs, management turnover, no backfilling"

--- DESIGN (5 reviews analysed) ---
Average satisfaction: 4.0/5 | Dissatisfied: 0% | Satisfied: 60%
Culture rating: 3.8/5 | Leadership trust: 3.5/5
What engaged designers value: "Low pressure, stress-free, approachable founders"

--- CUSTOMER SUCCESS (35 reviews analysed) ---
Average satisfaction: 3.5/5 | Dissatisfied: 23% | Satisfied: 57%
Culture rating: 3.2/5 | Leadership trust: 3.0/5
Top complaints: "Short staffed, thrown to wolves, no support"

--- OPERATIONS (5 reviews analysed) ---
Average satisfaction: 3.4/5 | Dissatisfied: 20% | Satisfied: 60%
Culture rating: 4.0/5 | Leadership trust: 3.5/5
Top complaints: "Low compensation, zero advancement opportunities"

--- IBM HR ATTRITION PATTERNS (1,470 employees) ---
- No promotion in 2+ years: 2.1x higher resistance to change
- Low job satisfaction (1-2/4): 2.8x higher resistance to mandates
- High job involvement: 67% lower resistance to change
- Sales roles: highest attrition rate (17.5%)
- HR roles: lowest attrition rate (5.1%)
- Employees aged 18-25: 3x more likely to leave during major change

--- MENTAL HEALTH AT WORK SURVEY ---
- 70% of tech workers report work interferes with mental health during change
- Employees who feel unsupported: 4x more likely to resist mandates
- Remote workers: 23% more likely to feel disconnected during org changes
- Open mental health culture = 40% faster change adoption
`

export async function POST(req: NextRequest) {
  const { members, decision, scope, dri, companyContext } = await req.json()

  // Fetch Mubit memory for context
  let mubitContext = ''
  try {
    const mubitResponse = await fetch('https://api.mubit.ai/v1/control/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MUBIT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        run_id: 'orgsim-m7t6ed-quickstart',
        project_id: 'proj-bbd21702-891f-4dce-b5c5-9116c92fbe93',
        query: decision,
        mode: 'agent_routed',
        limit: 5
      })
    })
    if (mubitResponse.ok) {
      const mubitData = await mubitResponse.json()
      const answer = mubitData.final_answer || mubitData.results
      if (answer) {
        mubitContext = `\n\nPREVIOUS SIMULATION HISTORY (from Delta memory):\n${JSON.stringify(answer)}\nUse this history to improve prediction accuracy.`
      }
    }
  } catch {
    // Mubit recall failed silently
  }

  const systemPrompt = `You are an organisational psychology simulator. 
You predict how individual employees will react to company decisions 
based on their personal context. Analyse each person's status, seniority, 
NPS score, notes, time at company, and relationship to the DRI.
Return ONLY valid JSON with no markdown or explanation:
{
  "members": [
    {
      "name": "string",
      "role": "string", 
      "reaction": "Supportive or Neutral or Resistant",
      "confidence": 0-100,