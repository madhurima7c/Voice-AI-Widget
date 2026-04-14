# Voice AI Backend

Next.js API backend for the Framer voice AI widget. **Run all commands from the repository root** (where `package.json` and `app/` live).

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up Supabase
1. Create a project at https://app.supabase.com
2. Go to **SQL Editor** and run the contents of `scripts/supabase-setup.sql`
3. Copy your project URL and service_role key into `.env.local`

### 4. Set up ElevenLabs voice clone
1. Create account at https://elevenlabs.io
2. Go to **Voice Lab → Add Voice → Instant Voice Clone**
3. Upload 5–10 minutes of you speaking naturally
4. Copy the Voice ID into `.env.local`

### 5. Build your knowledge base

Use the `knowledge-base/` folder at the repo root and add or edit text files:

```
knowledge-base/
  resume.txt          ← paste your resume as plain text
  bio.txt             ← your bio, background, what you're about
  projects.txt        ← descriptions of your key projects
  personality.txt     ← how you talk, opinions, things you care about
```

**Tip for `personality.txt`:** Write it in first person, as if you're telling someone about yourself in a casual conversation. Include phrases you naturally use, your opinions on design/tech, what excites you, what you're working toward.

Also add your GitHub repos to the `GITHUB_REPOS` array in `scripts/ingest.ts`.

### 6. Run ingestion
The script loads environment variables from `.env.local` (and `.env`) automatically.

```bash
npm run ingest
```

This embeds all your content and stores it in Supabase. **Editing `knowledge-base/*.txt` does not update Supabase by itself** — you must run `npm run ingest` again (locally, with `.env.local` set) so new chunks and vectors are written. Vercel deploys do not run ingest unless you add a custom build step.

### 7. Test locally
```bash
npm run dev
# APIs available at http://localhost:3000/api/
```

### 8. Deploy to Vercel
```bash
npx vercel
# Add all env vars in Vercel dashboard → Settings → Environment Variables
```

Copy the deployed URL (e.g. `https://voice-ai-backend.vercel.app`) and paste it into the **API Base URL** field of the Framer component.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transcribe` | POST | Audio blob → text (Deepgram STT) |
| `/api/chat` | POST | Text → AI reply (RAG + GPT-4o-mini) |
| `/api/speak` | POST | Text → audio mp3 (ElevenLabs TTS) |

---

## Adding the Framer Component

1. In Framer: **Assets → Code → +** → paste `VoiceAIWidget.tsx`
2. Save the component
3. Drag it onto any page
4. In the right panel, set **API Base URL** to your Vercel deployment URL
5. Set your name, subtitle, avatar URL, accent color
6. Publish your Framer site
