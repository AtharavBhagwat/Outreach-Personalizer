# Outreach Personalizer

AI-powered LinkedIn outreach — paste a job URL, get hiring manager + recruiter + team member with confidence scores and tailored messages.

## Deploy to Vercel in 5 minutes

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create outreach-personalizer --public --push
# or manually create repo on github.com and push
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework will auto-detect as **Next.js** ✓
4. Before deploying, add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
5. Click **Deploy**

That's it. Your app will be live at `your-project.vercel.app`.

---

## Run locally

```bash
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
# → http://localhost:3000
```

## How it works

1. **Job extraction** — Claude + web search fetches the LinkedIn job URL and extracts role, company, skills
2. **People discovery** — Claude searches for hiring manager, recruiter, and team member with confidence scoring based on signal strength (posted job = 85-95%, shared/reacted = 65-80%, title-match only = 20-40%)
3. **Message generation** — Claude writes 3 tailored 5-6 line messages personalized to each person found

## Stack

- **Next.js 14** (App Router)
- **Vercel** for hosting
- **Anthropic Claude** with web search for research + generation
- API key lives server-side only — never exposed to browser
