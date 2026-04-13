// app/api/transcribe/route.ts
// Receives an audio blob, returns transcribed text via Deepgram Nova-2

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@deepgram/sdk"

function getDeepgram() {
    const key = process.env.DEEPGRAM_API_KEY
    if (!key) throw new Error("DEEPGRAM_API_KEY is not set")
    return createClient(key)
}

export async function POST(req: NextRequest) {
    try {
        const deepgram = getDeepgram()
        const formData = await req.formData()
        const audioFile = formData.get("audio") as File | null

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file" }, { status: 400 })
        }

        const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
        const declaredType = audioFile.type || "application/octet-stream"
        console.log("[transcribe] bytes=", audioBuffer.length, "type=", declaredType)

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                language: "en",
            }
        )

        if (error) {
            console.error("[transcribe] Deepgram error:", error)
            return NextResponse.json({ error: "Transcription failed", text: "" }, { status: 502 })
        }

        const text =
            result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ""

        if (!text.trim()) {
            console.warn("[transcribe] Empty transcript (audio may be silent or unsupported codec)")
        }

        return NextResponse.json({ text })
    } catch (err) {
        console.error("[transcribe] Error:", err)
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
    }
}
