// app/api/speak/route.ts
// Text → speech via ElevenLabs REST API (raw fetch).
// Avoids the `elevenlabs` package's generate() voice-id bug and makes 401s obvious in logs.

import { NextRequest, NextResponse } from "next/server"

const ELEVENLABS_API = "https://api.elevenlabs.io"

/** Vercel / dashboard paste often wraps secrets in quotes — strip once. */
function cleanEnv(value: string | undefined): string {
    let s = (value ?? "").trim()
    if (s.length >= 2) {
        const q = s[0]
        if ((q === '"' || q === "'") && s[s.length - 1] === q) {
            s = s.slice(1, -1).trim()
        }
    }
    return s
}

export async function POST(req: NextRequest) {
    const apiKey = cleanEnv(process.env.ELEVENLABS_API_KEY)
    const voiceId = cleanEnv(process.env.ELEVENLABS_VOICE_ID)

    if (!apiKey) {
        console.error("[speak] ELEVENLABS_API_KEY is empty after trim (check Vercel → Env → Production)")
        return NextResponse.json({ error: "TTS failed", reason: "missing_api_key" }, { status: 500 })
    }
    if (!voiceId) {
        console.error("[speak] ELEVENLABS_VOICE_ID is empty after trim")
        return NextResponse.json({ error: "TTS failed", reason: "missing_voice_id" }, { status: 500 })
    }

    console.log("[speak] ElevenLabs key chars=%d, voiceId chars=%d", apiKey.length, voiceId.length)

    try {
        const { text } = await req.json()

        if (!text?.trim()) {
            return NextResponse.json({ error: "No text" }, { status: 400 })
        }

        const safeText = text.slice(0, 500)

        const url = `${ELEVENLABS_API}/v1/text-to-speech/${encodeURIComponent(voiceId)}`
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
                Accept: "audio/mpeg",
            },
            body: JSON.stringify({
                text: safeText,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.85,
                    style: 0.2,
                    use_speaker_boost: true,
                },
            }),
        })

        if (!res.ok) {
            const errBody = await res.text()
            console.error("[speak] ElevenLabs HTTP", res.status, errBody.slice(0, 600))

            if (res.status === 401) {
                return NextResponse.json(
                    {
                        error: "TTS failed",
                        reason: "elevenlabs_unauthorized",
                        hint: "Invalid or revoked API key, or wrong value in Vercel. Create a new key at elevenlabs.io → Developers → API keys, enable Text to Speech permission, paste into ELEVENLABS_API_KEY (Production), redeploy.",
                    },
                    { status: 502 }
                )
            }
            if (res.status === 404) {
                return NextResponse.json(
                    {
                        error: "TTS failed",
                        reason: "voice_not_found",
                        hint: "Check ELEVENLABS_VOICE_ID matches the Voice ID in ElevenLabs → Voices.",
                    },
                    { status: 502 }
                )
            }

            return NextResponse.json(
                { error: "TTS failed", reason: "elevenlabs_http", status: res.status },
                { status: 502 }
            )
        }

        const arrayBuf = await res.arrayBuffer()
        const audioBuffer = Buffer.from(arrayBuf)

        if (audioBuffer.length === 0) {
            console.error("[speak] ElevenLabs returned empty body")
            return NextResponse.json({ error: "TTS failed", reason: "empty_audio" }, { status: 502 })
        }

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.length.toString(),
                "Cache-Control": "no-store",
            },
        })
    } catch (err) {
        console.error("[speak] Error:", err)
        return NextResponse.json({ error: "TTS failed", reason: "server_error" }, { status: 500 })
    }
}
