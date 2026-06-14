# Voice AI — Full Phase Plan
**Date:** April 12, 2026
**Mode:** Cursor for backend · Framer component already added ✅

> **Cursor:** This file is the **source of truth** for phase order and tasks. Follow it for all Voice AI work unless the user explicitly overrides.
>
> **Cursor — audience:** The owner is a **product designer**, not a professional developer. They are **vibe-coding** with AI help. **Always explain steps in plain English** (what, why, outcome) before or alongside commands and file paths. Prefer short analogies (e.g. “API key = password for a service”) over jargon. Offer to run terminal steps for them when possible. Never assume they know what `curl`, SQL, or “deploy” imply without a one-line plain definition.
>
> **Secrets — never commit or share:** API keys live only in **`.env.local`** at the **repo root** on your machine (and later in **Vercel → Environment Variables** for production). That file is listed in **`.gitignore`** so Git won’t commit it — still never paste keys into chat, tickets, or screenshots. If the user asks *“Did you remember not to commit / share the env file?”* — confirm **yes**, and do not add secrets to any tracked file.

---

## Who this plan is for

You’re wiring a **voice widget on Framer** to a **small backend** (Next.js) that talks to paid APIs: speech-to-text, a smart reply using *your* written content, and text-to-speech in *your* voice.

**You don’t need to be a developer.** Each phase below has:

- **Plain English** — what this step is, in designer terms  
- **Why** — how it fits the product  
- **Do this** — the actual checklist / commands  

If something fails, paste the error into Cursor and ask what it means in simple terms.

### Tiny glossary (refer back anytime)

| Term | Plain English |
|------|----------------|
| **API key** | A secret string that lets *your* backend use a service (OpenAI, ElevenLabs, etc.) on your account. Like a password — never post it publicly. |
| **`.env.local`** | A private file on your machine that stores those secrets. The app reads it when running locally. It should **not** be committed to Git. |
| **Backend** | The server that Framer’s widget calls: transcribe audio → answer using your docs → return audio. |
| **Deploy** | Put that backend on the internet (e.g. Vercel) so Framer can reach it with a **URL**. |
| **Ingest** | Upload and “index” your text files so the AI can search them when answering (RAG). |
| **Vector / Supabase** | Your content gets turned into searchable chunks in a database so answers stay grounded in *your* words. |

---

## Current State

| Item | Status |
|------|--------|
| Backend API routes (chat, speak, transcribe) | ✅ Deployed / working |
| Ingest script | ✅ Run when you change `knowledge-base/*` |
| Framer VoiceAIWidget + Vercel URL | ✅ Connected |
| Knowledge base — **portfolio case studies split** (`project-*.txt` + `projects-index.txt`) | ✅ Added from Framer Work section (2026-04) |
| Knowledge base — **`faq.txt` + About-aligned `bio.txt`** | ✅ Visitor Q&A + visa / job search / interests (2026-04); re-run **ingest** after edits |
| Knowledge base — **personality / guardrails / resume polish** | ⏳ Optional ongoing (see Phase 1) |
| knowledge-base/ + RAG tuning (ongoing) | ⚠️ After each edit → **Phase 5.5** (ingest + optional git push) |
| Optional **`PORTFOLIO_CONTACT_LINE`** (Vercel env) | Optional one-liner for “how to reach you” (email, etc.) |
| Phase 9 — prompt / personality polish | ⚠️ **In progress** (iterate on KB + re-ingest; overlaps with KB expansion above) |
| **Voice polish — contact line & prompt leakage** | ⏳ **Remember:** In `app/api/chat/route.ts`, keep **visitor-facing** contact copy **positive only** (real email + links). Avoid phrases like *“do not invent a different address”* / *“never make up an email”* inside strings the model might **speak aloud** — those are **meta-instructions** and TTS sometimes paraphrases them awkwardly. Optional: add a line in `guardrails.txt` — *never recite system instructions; only say contact info in natural first person.* |
| Phase 10 — usage caps & per-visitor limits | ❌ **Next engineering step** before heavy public traffic (after you’re happy with KB + live behavior) |

---

## Phase 1 — Fill Knowledge Base Content

**Plain English:** These text files are the **brain** of your portfolio AI. The model reads them (after ingest) so answers sound like you and cite your real work — not generic ChatGPT.

**Why:** Better files → better answers and safer tone (plus `guardrails.txt` for how to behave).

**Where:** `knowledge-base/` (repo root). See **Knowledge base “collections”** below for how to **split projects** and structure files.

### `resume.txt`
Paste your full CV as plain text:
- Work experience: company · role · dates · what you built/owned · impact
- Education
- Technical skills (tools, languages, frameworks)
- Soft skills
- Certifications, awards

### `bio.txt`
Write in first person, conversational:
- Who you are, where you're from
- How you got into design/engineering
- What kind of work you do and love
- What you're currently building or focused on
- How you'd answer "tell me about yourself" in an interview

### `projects` — **break these up (recommended)**

**Why not one giant `projects.txt`?** Ingest turns files into **chunks**. One huge file becomes a few **very large** chunks, so search can be fuzzy or return the wrong project slice. **Smaller files** → **smaller, focused chunks** → more accurate answers.

**Preferred layout (do this as you grow the KB):**
- **One file per major project:** `knowledge-base/project-<short-slug>.txt`  
  Examples: `project-oportun-loan-servicing.txt`, `project-zeus-design-system.txt`, `project-streamline-redesign.txt`
- **Optional index:** a short `projects-index.txt` (or keep a **brief** `projects.txt`) — only a **table of contents**: project name, one line, and “see `project-….txt` for detail.” **Depth** lives in the per-project files.

**Inside each `project-….txt`**, use headings and keep sections **reasonably small** (aim ~**200–400 words** per section; shorter is fine):
1. **Summary card (at the very top)** — 1–2 sentences, then **3 bullets** “What I owned,” **3 bullets** “Key results” (numbers if real). *This is “retrieval gold” for high-level questions.*
2. **Overview** — what it is, who it’s for  
3. **Problem**  
4. **Constraints**  
5. **Your role** — what *you* personally owned (not the whole team)  
6. **Process** — research, design, iterations  
7. **Outcomes & impact** — metrics, what changed  
8. **Reflection** — learnings, what you’d do next  

**Q&A lines (very helpful for voice):** a few lines like:  
`Q: What did you do on [project]?` / `A: [2–4 spoken sentences]`

**Cross-project questions:** add a `faq.txt` (or a section in `projects-index.txt`) for things like: fintech work overall, proudest project, compare two projects — so search has explicit targets.

### `personality.txt` ← most important file
Write casually in first person — this makes the AI sound like YOU:
- How you think about design and engineering
- Opinions and takes you actually hold
- What excites you right now
- How you like to collaborate
- Phrases you naturally use
- What you want visitors to know that a resume doesn't capture

### `guardrails.txt`
Rules for tone and boundaries (off-topic, personal, inappropriate). Keep updating as you refine how you want the AI to feel.  
**Visitor-safe wording:** don’t load this file with lines that sound like *instructions to the model* (e.g. “never invent…”, “do not say…”) in a way TTS could **read aloud** — rephrase as how *you* want to sound, or keep strict rules in **`app/api/chat/route.ts`** only. See **Current State → Voice polish** and **Phase 9 → Contact line + TTS**.

### `ai-use.txt`
How you use AI as a **designer** (tools, learning, this widget as a project). Feeds “how do you use AI?” without inventing a job title. Re-ingest after edits.

> **Tip:** Can pull from your LinkedIn About, any existing bio on your portfolio, or just free-write for 10 minutes. Ask Cursor to help polish/structure if you share raw notes.

### Knowledge base “collections” (mental model — work together on this)

Think in **4–5 buckets** (they map to **files** in this repo, not separate databases):

| Collection | Job | Typical files |
|------------|-----|----------------|
| **Profile & bio** | Who you are, story, education, location, goals | `bio.txt`, parts of `resume.txt` |
| **Projects & case studies** | Deep work: problem, role, process, impact | `project-*.txt`, optional `projects-index.txt` / short `projects.txt` |
| **Experience & resume** | Timeline, roles, skills, tools, awards | `resume.txt` |
| **Personality & voice** | How you sound, opinions, what you care about | `personality.txt` |
| **Meta / behavior** | How the bot should behave (tone, boundaries) | `guardrails.txt` + **system prompt** in `app/api/chat/route.ts` — see *non-retrievable* note below |

### What this stack does **today** vs. **optional later (engineering)**

- **Today:** Ingest reads every `.txt`/`.md` in `knowledge-base/`, chunks by paragraphs, stores rows in Supabase `documents` with `content`, `source`, `embedding`. **`match_documents`** returns top **K** by similarity only — **no** `category` or `project_slug` filter in SQL.
- **So:** Structure wins come from **better file split + clear headings + summary cards + Q&A** (above).  
- **Optional later (bigger build):** add metadata columns (e.g. `category`, `project_slug`, `section`) and update `match_documents` + `/api/chat` to filter or classify first. Only if you outgrow file-based structure.

### Seed content for real visitor questions (build the KB *toward* these)

**About you:** Who are you? Where are you based? What are you studying / when do you graduate? What roles are you looking for?

**Projects:** Tell me about [name]. What was your role? What was the impact? Proudest project? Compare A vs. B. Best example of product thinking / visual craft?

**Process & POV:** How do you approach a new problem? Design process? How do you work with PMs/engineers? How do you think about AI in design?

**Personality:** Outside design? Music? Teams you like? What you’re learning next?

Add matching **Q&A** chunks in the right files so voice questions hit strong matches.

### Non-retrievable “meta” (behavior, not visitor content)

- **Should live in code or env:** hard rules (banned phrases, max length, contact line) → **`app/api/chat/route.ts`** and optional **`PORTFOLIO_CONTACT_LINE`** in Vercel.  
- **In KB text:** only **speakable, first-person** guidance — not raw system-prompt text. If guardrails need strict machine rules, keep them in **code** or rephrase in KB as how Maddy would **say** a boundary, not a spec sheet.

### Owner pending — richer knowledge base (you)

**Still to do on your side:** Make the knowledge base **much more versatile** — add **more information** (you can draft and expand with **Claude in Cursor**), make tone and coverage **more dynamic**, and **feed it a lot of knowledge** (projects, opinions, process, FAQs, guardrails, anything the voice should know). Treat this as an ongoing content pass until answers feel complete and grounded; then re-run **ingest** (Phase 5 / 5.5) so Supabase matches what’s on disk.

---

## Phase 2 — Get API Keys + Create .env.local

**Plain English:** Each vendor (OpenAI, ElevenLabs, Deepgram, Supabase) gives you a **secret key**. You paste them into one local file so your backend can use those services **as you**.

**Why:** Without keys, nothing talks to speech, brains, or your database.

**Where:** `.env.local` at the **repo root**; **Git ignores it** (`.gitignore`). **Do not commit it, do not share it, do not paste keys into Slack/email/chat.** For production, use **Vercel → Environment Variables** — not files in the repo.

**Reminder:** You can ask Cursor *“Did we keep secrets out of Git?”* — answer should always be **yes**; secrets only in `.env.local` (your machine) and Vercel (hosted).

```env
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...         ← add after Phase 3
DEEPGRAM_API_KEY=...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...     ← use service_role key, not anon
```

**Where to get each:**

| Key | Link |
|-----|------|
| OpenAI | platform.openai.com → API Keys |
| ElevenLabs API key | elevenlabs.io → Settings → API Keys |
| ElevenLabs Voice ID | After Phase 3 — Voice Lab → your clone → copy ID |
| Deepgram | console.deepgram.com → Create API Key |
| Supabase URL + key | app.supabase.com → project → Settings → API |

**Layman note:** You can fill OpenAI + Deepgram + ElevenLabs (API key only) first; add Supabase and Voice ID after Phases 3–4.

**Billing preference (for now):** Prefer **month-to-month** paid tiers where available so you’re not locked into **yearly** contracts while the portfolio is still in flux. Some vendors (e.g. Cartesia) advertise a lower price **billed annually** — if you want **monthly only**, compare the **monthly** checkout price on each site. You can always revisit after traffic is stable.

---

## Phase 3 — Clone Your Voice on ElevenLabs

**Plain English:** You upload recordings of **your voice**. ElevenLabs creates a **voice profile**. You copy its **Voice ID** into `.env.local` so when the AI replies, it **sounds like you**.

**Goal:** Get your Voice ID so the backend speaks in your voice

### Steps
1. Sign up / log in at elevenlabs.io (Starter plan = $5/mo)
2. **Voice Lab → Add Voice → Instant Voice Clone**
3. Upload **5–10 minutes** of you speaking naturally
   - Best sources: Loom recording, Voice Memo, screen recording with narration
   - Must be clean audio — no background music, minimal noise
   - Speak conversationally (not reading) — vary tone and pace naturally
4. Name it (e.g. "Madhurima Portfolio")
5. Save → copy the **Voice ID**
6. Add to `.env.local` as `ELEVENLABS_VOICE_ID`
7. Test in ElevenLabs playground before moving on

> **10 min of audio gives noticeably better quality than 5 min**

---

## Phase 4 — Set Up Supabase (Vector Database)

**Plain English:** Supabase is a **hosted database**. You run a one-time **SQL script** (provided in the repo) that creates a table to hold **searchable chunks** of your knowledge files. Think: **private search index** for your portfolio content.

**Goal:** Create the table that stores your knowledge base as searchable vectors

### Steps
1. Go to app.supabase.com → New project (free tier is enough)
2. Wait for project to provision (~1 min)
3. **SQL Editor** → paste and run `scripts/supabase-setup.sql`
   - Enables `pgvector` extension
   - Creates `documents` table with `embedding vector(1536)` column
   - Creates `match_documents()` RPC function used by `/api/chat`
4. **Settings → API** → copy:
   - Project URL → `SUPABASE_URL` in `.env.local`
   - `service_role` key (NOT the `anon` key) → `SUPABASE_SERVICE_KEY`

**Layman note:** The SQL file is copy-paste — you don’t need to write SQL. **Service role** = full access for your backend only; keep it secret like any API key.

---

## Phase 5 — Run Ingestion

**Plain English:** **Ingest** = read everything in `knowledge-base/`, chop it into pieces, turn them into embeddings, and **save into Supabase**. After this, `/api/chat` can **pull relevant chunks** when someone asks a question.

**Goal:** Embed your knowledge base and store vectors in Supabase  
**Requires:** Phases 1–4 complete, `.env.local` filled in

Ask Cursor to run this from the **repo root**, or in Terminal:

```bash
cd Voice-AI-Widget   # repo root
npm run ingest
```

**Expected output (example — counts change with your files):**
```
🚀 Starting knowledge base ingestion...
📄 resume.txt: 5 chunks
📄 bio.txt: 2 chunks
📄 project-oportun-loan-servicing.txt: 3 chunks
📄 project-zeus-design-system.txt: 2 chunks
📄 personality.txt: 3 chunks
🔮 Generating embeddings...
  Embedded …/… chunks…
💾 Upserting into Supabase…
✅ Ingestion complete! … chunks stored
```
(If you still use a single `projects.txt`, you’ll see one line for that file until you split into `project-*.txt`.)

**If it fails:** Check that all `.env.local` keys are set, Supabase SQL has been run, and OpenAI key has credits.

> Re-run `npm run ingest` any time you update the knowledge-base files. It clears and re-embeds everything.

---

## Phase 5.5 — After you edit in Cursor: where things go (short)

**Plain English:** Two different “publishes”: **code** vs. **searchable knowledge**. Don’t mix them up.

| What you changed | What to do | Where it ends up |
|------------------|------------|------------------|
| **`knowledge-base/*.txt`** only | From **repo root**: run **`npm run ingest`** (needs `.env.local` with OpenAI + Supabase keys). | **Supabase** — embeddings overwrite/refresh the `documents` table your chat API already queries. Nothing “uploads” to Vercel for text. |
| **Backend code** (routes, `middleware`, etc.) | Commit → **`git push`** to your GitHub repo (if the project uses Git). | **Vercel** — if the repo is connected, Vercel **rebuilds and deploys** automatically (or run **`vercel --prod`** from the folder). |
| **Both** | Ingest first or last; order rarely matters, but **always ingest after KB edits** so live answers match your files. | Supabase (vectors) + Vercel (code). |

**Layman:** Think of **Git/Vercel** as “the app’s brain surgery” and **ingest/Supabase** as “refreshing the library the AI reads from.” Editing `.txt` without ingest = visitors still hear the **old** library.

**Optional:** If the repo is **private** and you prefer not to commit certain `.txt` files, keep them local only and still run ingest — vectors live in **Supabase**, not in Git. (Then be careful cloning on a new machine without those files.)

---

## Phase 6 — Test Locally

**Plain English:** Run the backend **on your computer** first. **curl** = a way to send a test request from the terminal (Cursor can run it for you). You’re checking: **chat** replies, **speak** returns audio, **transcribe** turns speech into text.

**Goal:** Verify all 3 API endpoints work before deploying

```bash
cd Voice-AI-Widget   # repo root
npm run dev
# Server running at http://localhost:3000
```

**Test chat (RAG + LLM):**  
*Layman:* “Send a fake visitor question and see JSON with a text reply.”

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What projects have you worked on?", "history": []}'
# Should return: {"reply": "I've worked on..."}
```

**Test speak (your cloned voice):**  
*Layman:* “Ask the server to turn text into an MP3 using your ElevenLabs voice.”

```bash
curl -X POST http://localhost:3000/api/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hi! How is it going?"}' \
  --output test.mp3
open test.mp3
# Should play back in your voice
```

**Test transcribe (STT):**  
*Layman:* “Send a short recording file; get back the words it heard.”

```bash
# Record a short audio file first, then:
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
# Should return: {"text": "what you said"}
```

✅ All 3 working = ready to deploy

---

## Phase 7 — Deploy to Vercel

**Plain English:** **Vercel** hosts your Next.js app on the internet. You get a **https URL**. You paste the **same env vars** into Vercel’s dashboard (or CLI) so production behaves like your laptop.

**Goal:** Get a live public URL for the backend

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Deploy from repo root (Next.js app lives here)
cd Voice-AI-Widget
vercel

# Add all env vars
vercel env add OPENAI_API_KEY production
vercel env add ELEVENLABS_API_KEY production
vercel env add ELEVENLABS_VOICE_ID production
vercel env add DEEPGRAM_API_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production

# Final production deploy
vercel --prod
```

Or add env vars via **Vercel Dashboard → project → Settings → Environment Variables** if you prefer the UI (often easier if you’re not comfy with CLI).

**Copy your production URL** — e.g. `https://voice-ai-backend-xyz.vercel.app`

---

## Phase 8 — Connect Framer Component

**Plain English:** In Framer, the widget has a field for **where the backend lives**. You set it to your **Vercel URL** so the published site can call **your** APIs.

**Goal:** Wire the live backend URL into the widget you've already added to Framer

1. Open your **Portfolio 2024** Framer project
2. Select the **VoiceAIWidget** component on the canvas
3. In the right panel, set **API Base URL** → your Vercel URL (full `https://...`, no typos)
4. Set copy as needed: **Name**, **Subtitle**, **Greeting** (text sent to `/api/speak` on call start), **Accent**, typography/colors, optional **Card shadow (CSS)** if you have exact Figma values
5. Vectors are **inline in the code component** (not URLs). To change marks, edit `PATH_*` constants in `VoiceAIWidget.tsx` or ask Cursor to merge SVG exports from `portfolio-components/voice-widget-vectors/`
6. **Publish** your Framer site
7. Test the full flow live: open call → hear greeting → talk naturally (mic is on; silence ends your turn) → hear reply → **X** to end

---

## Phase 9 — Polish + Go Live

**Plain English:** Small copy and behavior tweaks in code (system prompt), then **redeploy** so the live site picks them up.

### Tune the system prompt + knowledge base
- **`knowledge-base/`** — bio, projects, `ai-use.txt`, `personality.txt`, `guardrails.txt` (then **`npm run ingest`**).
- **`app/api/chat/route.ts`** — system prompt rules (grounding, tone, banned phrases).
- **Contact line + TTS (important):** The default `contactLineForPrompt()` / system-prompt strings should **not** include “meta” warnings the bot could **repeat out loud** (e.g. *“do not invent a different address”*, *“never make up an email”*). Put **anti-hallucination** rules in a way that guides the model without sounding like a script to visitors — and use **`PORTFOLIO_CONTACT_LINE`** for a clean, speakable one-liner if needed. Mirror the same idea in **`guardrails.txt`** / **`personality.txt`** so KB chunks don’t train awkward phrasing.
- **Vercel env (optional):** `PORTFOLIO_CONTACT_LINE` — single sentence if you want a **specific email or CTA** spoken verbatim (otherwise defaults to LinkedIn + madhurima.me + phone).

### Redeploy after changes
```bash
vercel --prod
```

### Optional tweaks (anytime)
- **Better voice model** — swap `eleven_turbo_v2_5` → `eleven_multilingual_v2` in `/api/speak`
- **Add GitHub repos** — add your repo slugs to `GITHUB_REPOS` in `ingest.ts`, re-run ingestion
- **Conversation history** — currently last 6 turns, adjust `history.slice(-6)` in `/api/chat`

**Next (required):** **Phase 10** — caps, per-visitor limits, and spend protection. Do **not** skip it once the widget is **public**; it is the **last and critical** phase in this plan.

---

## Phase 10 — Usage caps, per-visitor limits, and spend protection *(final phase — important)*

**Plain English:** As soon as strangers can use the voice widget, **one person or a bot** can burn your **OpenAI / ElevenLabs / Deepgram** budget in hours. This phase is **not** optional polish — it is how you **keep costs predictable** and **fair** across ~100 visitors/month. You will **revisit and tune** numbers over time (start conservative, watch dashboards and logs, then adjust).

**Why it’s last:** You need a **working** backend (Phases 1–8) and a **live** or nearly live site (Phase 9) before per-visitor limits and logging are meaningful. **Ideal:** ship Phase 10 in the **same release window** as going public, or immediately after — not “whenever.”

**Goals:** (1) **Per-visitor** fairness — no single user eats the whole month. (2) **Track** usage so you can **backtrack** cost. (3) **Soft UX** before the hard stop. (4) **Friendly words** — never blame the visitor.

**Prerequisite:** Phases 1–9 complete (or at minimum APIs deployed and Framer pointed at production).

### Strategy for ~100 visitors/month (recommended for you)

**Per-visitor limits are the better primary lever** at this scale: you expect **roughly 100 people**, not millions. If each person has a **small cap** (per **session** and/or per **day**), then:

- **One** chatty visitor or bot can’t eat the whole month’s **ElevenLabs / OpenAI / Deepgram** budget.  
- Costs scale more **linearly** with “how many humans showed up,” not “how obsessed was the loudest user.”

**Still keep provider hard caps** — those are the **absolute ceiling** for the whole site. Per-visitor caps sit **under** that.

**Rough planning math (illustration — tune from real usage):**

1. Note your **monthly included** TTS budget (e.g. credits or minutes shown on ElevenLabs) and a **comfortable $ cap** on OpenAI/Deepgram.  
2. **Divide** by **~100** to get a **naïve average** “fair share” per visitor **if everyone used equally** (reality: many use zero; a few use more — that’s why per-visitor caps matter).  
3. Set **per-visitor** limits **conservatively** at first — e.g. max **N assistant turns** or **N speak calls** per **day** per `visitorId`, plus **burst** rate limits per minute.  
4. After 2–4 weeks, **revisit** logs: if you’re always under budget, you can **raise** N slightly; if you’re tight, **lower** N or shorten replies before raising prices.

### 1. Provider-side hard caps (do first — no code)
- **OpenAI:** monthly **hard budget** / cap in billing.  
- **ElevenLabs:** monthly **credit or spend** limits on the key or account.  
- **Deepgram:** **alerts / limits** if available.  
These are the **last line of defense** for your wallet — keep them **below** what you’re willing to lose in a bad month.

### 2. Backend: per-visitor limits + “backtrack” to minimize expense
- **Stable visitor id:** In the Framer widget, generate once → **`localStorage`** → send on every call as a header (e.g. `X-Visitor-Id`) plus you still have **IP** as a fallback / combo for abuse.  
- **Rate limits (burst protection):** e.g. max **N requests per minute** per id + per IP on `/api/chat`, `/api/speak`, `/api/transcribe` (`@upstash/ratelimit` + Redis is a common Vercel pairing). Stops scripts from hammering you.  
- **Daily / weekly fair-use quotas:** e.g. max **M assistant replies** or **M minutes of STT** or **M speak calls** per `visitorId` per **day** — store counters in **Upstash** or **Supabase**. Tune **M** from real data.  
- **Log cost proxies per request:** persist **rough units** you can sum later: e.g. **input/output tokens** from OpenAI (chat), **audio duration** (transcribe), **character count** (speak text). Aggregate **by visitorId** and **by day** so you can **revisit** caps with evidence.  
- **Revisit on a schedule:** once a month, compare logs to bills → lower quotas or raise provider caps — **iterate**, don’t “set and forget.”

### 3. Two thresholds: “almost at limit” (soft) vs “at limit” (hard)

| Stage | Purpose | What to do in the product |
|--------|---------|-----------------------------|
| **Soft (e.g. ~80–90% of their personal quota)** | Warn before cut-off; better UX | API returns extra fields, e.g. `warning: true`, `remainingTurns: 2` (names are up to you). Widget can show a **small, calm line** under the wave (“A couple more back-and-forths today — then I’ll need a break.”) **or** let the **next spoken reply** include one short humble sentence (see copy below). |
| **Hard (100% of quota or global kill-switch)** | Stop spend from this visitor | API returns **200 + spoken `reply`** where possible (same pattern as OpenAI quota handling in `/api/chat`) — **not** a scary browser error. Optionally **auto-end call** in the widget after playing the message. |

### 4. Copy ideas (spoken + human — no jargon)

**Soft warning (almost at limit)** — warm, not alarming:
- “Heads up — I can only do a couple more back-and-forths today, then I’ll need to sign off. What’s the last thing you want to cover?”
- “I’m running low on airtime here — one or two more questions and then I’ll let you go. What matters most?”

**Hard stop (at limit)** — aligned with **`guardrails.txt`** / quota tone:
- “I can’t do more voice back-and-forth right now — thanks for stopping by. Come back later, or reach me through madhurima.me / LinkedIn if it’s work-related.”
- Variations: same **humble** energy as *“I can’t afford that many responses right now — come back later, yeah?”* — **never** “you used too many tokens.”

**Optional:** After the hard message, widget shows a **tiny text hint**: “Voice session limit reached for today.”

### 5. UX improvements (make it feel designed, not broken)
- **Predictability:** If you use **remaining turns**, the soft warning makes the cutoff feel **fair**, not random.  
- **Visual:** Subtle **subtitle or caption** on the active card (muted color) when `warning` is true — don’t rely on audio alone (some users miss a word).  
- **Graceful close:** After hard stop TTS ends, **end call** automatically or pulse the **X** — fewer stuck states.  
- **Email escape hatch:** Hard message includes **one** contact path so serious leads aren’t lost.  
- **Privacy:** If you store `visitorId` or counts, add a one-liner on the site **Privacy** / **About** (“anonymous session limits to keep the demo sustainable”).

### 6. Implementation pointers
- **Rate limiting + counters:** `@upstash/ratelimit`, Upstash Redis, or Supabase table `visitor_usage (visitor_id, date, chat_count, …)`.  
- **API shape:** e.g. `{ reply, warning?, remainingTurns?, limitReached? }` from `/api/chat`; mirror pattern for speak/transcribe if you cap those separately.  
- **Guardrails:** When you implement soft warnings, add a line in **`guardrails.txt`** so any **LLM-generated** side comments stay consistent — server-driven fixed strings are OK too for the hard stop.

**Cursor:** When implementing **Phase 10**, prioritize **provider caps + per-id rate limits** first (biggest bang), then **daily quotas + soft warnings**, then **detailed logging** for ongoing **revisit**-and-tune.

---

## Summary Checklist

- [ ] **Phase 1** — Fill `resume.txt`, `bio.txt`, **`ai-use.txt`**, `personality.txt`, `guardrails.txt`; **split projects** into `project-<slug>.txt` (see Phase 1 + *Knowledge base “collections”*); optional `projects-index.txt`, `faq.txt`
- [ ] **Phase 1 (owner pending)** — Expand KB: more versatile, more knowledge, dynamic tone; use Claude in Cursor to draft/structure; keep iterating until answers feel complete
- [ ] **Phase 5.5** — After Cursor edits: **ingest → Supabase** for any `.txt` change; **git push → Vercel** for any code change (see table above)
- [ ] **Phase 2** — Create `.env.local` with all 6 keys
- [ ] **Phase 3** — Clone voice on ElevenLabs, get Voice ID
- [ ] **Phase 4** — Create Supabase project, run SQL setup
- [ ] **Phase 5** — Run `npm run ingest`, verify chunks stored
- [ ] **Phase 6** — Test all 3 endpoints locally
- [ ] **Phase 7** — Deploy to Vercel, add env vars
- [ ] **Phase 8** — Set API URL in Framer component, publish site
- [ ] **Phase 9** — Tune system prompt, polish, go live
- [ ] **Phase 10** — **Final / critical:** provider hard caps; per-visitor quotas + rate limits (~100 visitors/mo); logging to backtrack cost; soft “almost at limit” + hard-stop copy + widget UX (full section above)
