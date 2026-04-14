# This folder is no longer the app root

The Next.js backend was **moved to the repository root** (`app/`, `package.json`, `middleware.ts`, etc.) so Vercel can build without a nested “Root Directory”.

- **Develop & deploy:** use the repo root (`npm install`, `npm run dev`, connect Vercel to the repo with default root).
- **Docs:** see **`../README.md`**, **`../PLAN.md`**, and **`../BACKEND.md`**.

You can delete this folder locally if you only need a clean clone; it is not required for the app to run.
