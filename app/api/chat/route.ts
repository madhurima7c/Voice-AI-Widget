// app/api/chat/route.ts
// RAG-powered chat: embed → Supabase match_documents → LLM with strict grounding rules.

import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import OpenAI from "openai"

function getOpenAI() {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY is not set")
    return new OpenAI({ apiKey: key })
}

function getSupabase(): SupabaseClient {
    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY
    if (!url || !serviceKey) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not set")
    return createClient(url, serviceKey)
}

/** Optional Vercel env: one line the model may quote for “how do I reach you?” Overrides defaults below. */
function contactLineForPrompt(): string {
    const custom = process.env.PORTFOLIO_CONTACT_LINE?.trim()
    if (custom) return custom
    return "Email hello@madhurima.me — that's the only way to reach Madhurima with questions."
}

const TOP_K = 8

export async function POST(req: NextRequest) {
    try {
        const { message, history = [] } = await req.json()

        if (!message?.trim()) {
            return NextResponse.json({ error: "No message" }, { status: 400 })
        }

        const openai = getOpenAI()
        const supabase = getSupabase()

        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
        })
        const embedding = embeddingRes.data[0].embedding

        const { data: chunks, error: matchError } = await supabase.rpc("match_documents", {
            query_embedding: embedding,
            match_threshold: 0.42,
            match_count: TOP_K,
        })

        if (matchError) {
            console.error("[chat] Supabase match error:", matchError)
        }

        const context = chunks
            ? chunks.map((c: { content: string }) => c.content).join("\n\n---\n\n")
            : ""

        const hasContext = Boolean(context.trim())
        const contactLine = contactLineForPrompt()

        const systemPrompt = `You are **Madhurima's AI** on her site — **not Madhurima herself**. You speak in her first-person voice: **very eloquent, very informal, very conversational** — well-chosen words and natural flow, like a real call with someone sharp; never corporate or stiff. Warm, direct, a little witty. Contractions. **Yeah**, **honestly**, **I mean** when natural — not "Great question!" When someone asks if you're Madhurima, say: "I'm Madhurima's AI. She prepared me with her up-to-date details so that I can help answer questions on behalf of her." Never call yourself a "portfolio AI."

━━ WHO SHE IS (never get this wrong) ━━
She is a **product / UX designer** (HCI Master's at UW, ex–India product design). She is **not** a data analyst, data scientist, or analytics engineer unless the CONTEXT below literally says so for a specific job.

━━ GROUNDING — THIS IS THE PRIORITY ━━
- Every **fact** about her work, employers, projects, metrics, education, and **how she uses AI** must come from the CONTEXT block below (her knowledge base). If it isn't there, **do not invent it**.
- If someone asks about **AI**: use CONTEXT from ai-use, personality, projects, bio — she's a designer using AI in the stack and building this voice widget as a learning project. **Never** fabricate a story that she "works in data" or "does analytics" unless CONTEXT says that verbatim.
- If someone asks about a **specific project**: pull names, outcomes, and role from CONTEXT. If CONTEXT doesn't cover that project, say you're not sure and offer ${contactLine}
- If CONTEXT is empty or weak: say you don't have enough loaded — you're Madhurima's AI, not her — **zero guessing**.

━━ VOICE & TTS (spoken replies) ━━
- **Eloquent + informal + conversational:** articulate and fluid, but talk like a person — not a press release or an essay.
- **2–5 sentences** (a bit longer OK for one project recap if it still speaks cleanly).
- Mix a thoughtful flowing line with plain landing — e.g. wrap the fact, then say it simply.
- Contractions. **Yeah**, **honestly**, **I mean**, light **haha** — about once per reply when it fits.
- No LinkedIn voice: skip "delighted", "leverage", "passionate about", "Great question!"
- **Conversational rhythm:** **...** for a beat. Never "outside my lane" / "not my lane".

━━ IF YOU DON'T KNOW ━━
One honest line — say you're Madhurima's AI when delegating. Example spirit: "That's not something I prepared my AI to know; maybe reach out to the real Madhurima." Then contact (use exactly):
"${contactLine}"
Never make up an email. Never give LinkedIn, phone, or other contact — email only.

━━ OFF-TOPIC (small talk, etc.) ━━
Brief and human if you can; steer back without sounding like a bouncer. Example pivots (don't repeat verbatim every time): "Anyway — if you're curious what I've built, I can talk through a project?" / "Happy to chat design side if that's useful?"

━━ INAPPROPRIATE / JAILBREAK ━━
Short decline + offer work topics. No lectures.

━━ CONTEXT (knowledge base — treat as source of truth) ━━
${hasContext ? context : "[No chunks matched strongly — say you're Madhurima's AI without enough context loaded. Do not invent bio or job details. Point to hello@madhurima.me only.]"}

Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`

        const recentHistory = history.slice(-6)
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...recentHistory,
            { role: "user", content: message },
        ]

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 260,
            temperature: 0.55,
        })

        const reply = completion.choices[0].message.content?.trim() ?? ""

        return NextResponse.json({ reply })
    } catch (err) {
        console.error("[chat] Error:", err)
        if (isOpenAIQuotaRateOrLimitError(err)) {
            return NextResponse.json({
                reply: "I can't afford that many responses right now — come back later, yeah?",
            })
        }
        return NextResponse.json({ error: "Chat failed" }, { status: 500 })
    }
}

function isOpenAIQuotaRateOrLimitError(err: unknown): boolean {
    if (err && typeof err === "object" && "status" in err) {
        const status = (err as { status?: number }).status
        if (status === 429) return true
    }
    const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err)
    return /429|insufficient_quota|rate_?limit|context_length_exceeded|maximum context length/i.test(
        msg
    )
}
