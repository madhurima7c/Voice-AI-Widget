# Voice AI Widget

Framer **voice UI** + Next.js **backend** for a portfolio voice assistant: listen → transcribe → RAG chat → speak (cloned voice).

**Repository layout**

| Folder | What it is |
|--------|------------|
| **`widget/`** | `VoiceAIWidget.tsx` (paste into Framer as a code component) + `voice-widget-vectors/` (source SVGs; paths are inlined in the component). |
| **`voice-ai-backend/`** | Next.js app: `/api/transcribe`, `/api/chat`, `/api/speak`. Deploy to Vercel; point the widget **API Base URL** at that origin. |

## Quick start

### Backend

```bash
cd voice-ai-backend
cp .env.example .env.local
# Edit .env.local with your keys (see voice-ai-backend/README.md)
npm install
npm run ingest    # embeds knowledge-base/ into Supabase — run after editing .txt files
npm run dev       # http://localhost:3000
```

Deploy: connect this folder to Vercel, add the same env vars as in `.env.example`, redeploy after changes.

### Framer widget

1. Open **`widget/VoiceAIWidget.tsx`**, copy all code into a **Framer code component**.
2. Set **API Base URL** to your deployed backend (e.g. `https://your-app.vercel.app`), no `/api` suffix.
3. Publish the site.

## Docs

- Full phased plan: **`voice-ai-backend/PLAN.md`**
- Backend setup detail: **`voice-ai-backend/README.md`**

## Secrets

Never commit **`.env.local`** or API keys. Use Vercel **Environment Variables** for production.
