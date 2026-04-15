# Voice AI Widget

**Single source of truth** for this feature: this repository. The portfolio monorepo ([`react-components-portfolio`](https://github.com/madhurima7c/react-components-portfolio)) only keeps a stub `voice-ai-backend/README.md` that links here — do not maintain a second copy of the backend there. **Vercel production deploys from this repo.**

Framer **voice UI** + Next.js **backend** for a portfolio voice assistant: listen → transcribe → RAG chat → speak (cloned voice).

**Repository layout**

| Folder / path | What it is |
|---------------|------------|
| **`widget/`** | `VoiceAIWidget.tsx` (paste into Framer as a code component) + `voice-widget-vectors/` (source SVGs; paths are inlined in the component). |
| **Repo root** (`app/`, `package.json`) | Next.js app: `/api/transcribe`, `/api/chat`, `/api/speak`. **Deploy this whole repo on Vercel** (root directory = `.` / leave blank). Point the widget **API Base URL** at that deployment’s origin. |

## Quick start — backend (repo root)

```bash
git clone https://github.com/madhurima7c/Voice-AI-Widget.git
cd Voice-AI-Widget
cp .env.example .env.local
# Edit .env.local with your keys (see BACKEND.md)
npm install
npm run ingest    # after editing knowledge-base/*.txt
npm run dev       # http://localhost:3000
```

### Vercel

Connect the **GitHub repo** with **Root Directory** left as the **repository root** (default). No `vercel.json` is required — Vercel detects Next.js from root `package.json` and `app/`. Add the same environment variables as in `.env.example`.

If an older Vercel project was set to **Root Directory = `voice-ai-backend`**, open **Project → Settings → General** and clear that field (or set it to `.`) so the build uses the hoisted layout.

### Framer widget

1. Open **`widget/VoiceAIWidget.tsx`**, copy into a Framer code component.
2. Set **API Base URL** to your deployed URL (e.g. `https://….vercel.app`), no `/api` suffix.
3. Publish the site.

## Docs

- Phased plan: **`PLAN.md`**
- Backend setup detail: **`BACKEND.md`**

## Secrets

Never commit **`.env.local`** or API keys. Use Vercel **Environment Variables** for production.
