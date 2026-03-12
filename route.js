import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Helper: call Claude with optional web search
async function callClaude({ system, user, webSearch = true, maxTokens = 1200 }) {
  const params = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: user }],
  }
  if (system) params.system = system
  if (webSearch) params.tools = [{ type: 'web_search_20250305', name: 'web_search' }]

  const response = await client.messages.create(params)
  return response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
}

// Helper: safely parse JSON from Claude output
function parseJSON(text) {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

export async function POST(req) {
  try {
    const { linkedinUrl } = await req.json()

    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com')) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    // ── Phase 1: Extract job details ────────────────────────────────────────
    const jobText = await callClaude({
      system: 'You extract job details from LinkedIn URLs using web search. Return ONLY valid JSON, no markdown backticks.',
      user: `Fetch and analyze this LinkedIn job posting: ${linkedinUrl}

Search for this URL directly. Extract:
- company_name: the hiring company
- role_title: exact job title
- location: job location or remote
- short_description: 2-sentence summary of the role
- key_skills: array of 4-5 key required skills
- seniority_level: IC/Manager/Director/VP level

Return ONLY JSON: {"company_name":"","role_title":"","location":"","short_description":"","key_skills":[],"seniority_level":""}`,
    })

    const job = parseJSON(jobText)

    // ── Phase 2: Find 3 people with confidence scores ───────────────────────
    const peopleText = await callClaude({
      system: `You are a talent intelligence researcher. Find real people on LinkedIn related to a job posting.
Confidence scoring rules:
- Posted the job / directly tagged in job announcement: 85-95%
- Shared or reacted to related posts / mentioned as recruiter for this role: 65-80%
- Active recruiter or HM at company, no direct post signal found: 40-55%
- Found only via title+company search, no engagement signal: 20-38%
Return ONLY valid JSON. No markdown.`,
      user: `LinkedIn job URL: ${linkedinUrl}
Company: ${job.company_name}
Role: ${job.role_title}

Search for:
1. HIRING MANAGER: A Director, VP, or senior leader at ${job.company_name} who oversees the ${job.role_title} function. Did they post or announce this opening on LinkedIn?
2. RECRUITER: A Talent Acquisition or HR person at ${job.company_name}. Did they post this job on LinkedIn?
3. TEAM MEMBER: A current ${job.role_title} or similar IC at ${job.company_name}.

For each, note the exact signal found explaining the confidence score.

Return this JSON:
{
  "hiring_manager": {
    "name": "Full Name",
    "title": "Exact LinkedIn Title",
    "linkedin_url": "https://www.linkedin.com/in/handle",
    "confidence": 82,
    "signal": "one sentence explaining confidence score evidence"
  },
  "recruiter": {
    "name": "Full Name",
    "title": "Exact LinkedIn Title",
    "linkedin_url": "https://www.linkedin.com/in/handle",
    "confidence": 71,
    "signal": "one sentence explaining confidence score evidence"
  },
  "team_member": {
    "name": "Full Name",
    "title": "Exact LinkedIn Title",
    "linkedin_url": "https://www.linkedin.com/in/handle",
    "confidence": 44,
    "signal": "one sentence explaining confidence score evidence"
  }
}`,
    })

    const people = parseJSON(peopleText)

    // ── Phase 3: Generate personalized messages ─────────────────────────────
    const msgText = await callClaude({
      system: `You write sharp, 5-6 line cold outreach messages for job seekers. Human, non-cringe, never start with "I hope this finds you well." 
Reference the specific person by name. Be specific to the company. Return ONLY valid JSON.`,
      user: `Job: ${job.role_title} at ${job.company_name}
Location: ${job.location}
Summary: ${job.short_description}
Key skills: ${(job.key_skills || []).join(', ')}

People:
- Hiring Manager: ${people.hiring_manager?.name}, ${people.hiring_manager?.title}
- Recruiter: ${people.recruiter?.name}, ${people.recruiter?.title}
- Team Member: ${people.team_member?.name}, ${people.team_member?.title}

Write 3 outreach messages, max 5-6 lines each:

{
  "hiring_manager": {
    "subject": "short subject line",
    "body": "5-6 line message to ${people.hiring_manager?.name}. Senior/impact focused. Reference their team leadership. End with soft ask for 15 min chat."
  },
  "recruiter": {
    "subject": "short subject line",
    "body": "5-6 line message to ${people.recruiter?.name}. Lead with role fit. Brief on skills. Easy to forward. Professional tone."
  },
  "team_member": {
    "subject": "short subject line",
    "body": "5-6 line message to ${people.team_member?.name}. Peer tone. Curious about their work. No resume dump. Genuine question."
  }
}`,
      webSearch: false,
    })

    const messages = parseJSON(msgText)

    return NextResponse.json({ job, people, messages })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong. Try a public LinkedIn job URL.' },
      { status: 500 }
    )
  }
}
