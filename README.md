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

Deploy: connect the **GitHub repo root** (not only `voice-ai-backend/`) to Vercel. The repo includes **`vercel.json`** plus a root **`package.json`** that lists `next` (same version as the backend) so Vercel’s Next.js detector succeeds; install runs at the **root** and under **`voice-ai-backend/`**, and `next build` runs in `voice-ai-backend/`. Add the same env vars as in `voice-ai-backend/.env.example`. Optional alternative: in Vercel → Project → Settings → General, set **Root Directory** to `voice-ai-backend` and you can remove the root shim / custom overrides if you prefer.

### Framer widget

1. Open **`widget/VoiceAIWidget.tsx`**, copy all code into a **Framer code component**.
2. Set **API Base URL** to your deployed backend (e.g. `https://your-app.vercel.app`), no `/api` suffix.
3. Publish the site.

## Docs

- Full phased plan: **`voice-ai-backend/PLAN.md`**
- Backend setup detail: **`voice-ai-backend/README.md`**

## Secrets

Never commit **`.env.local`** or API keys. Use Vercel **Environment Variables** for production.
