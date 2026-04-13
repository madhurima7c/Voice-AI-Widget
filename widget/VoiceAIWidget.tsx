// VoiceAIWidget.tsx — Framer Code Component
// Vectors: widget/voice-widget-vectors/Assets-voice/*.svg (paths inlined in this file).
// Active: grey loop (static) + accent stroke with GSAP stroke-dash loop while speaking.
// Glow: shadow preset at rest; orange blur/spread scales with mic or TTS level via GSAP ticker.
// GSAP: https://esm.sh/gsap@3

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

// ── Asset paths (from Figma exports) ──────────────────────────

/** default_loop.svg — viewBox 0 0 48 20 */
const PATH_DEFAULT_LOOP =
    "M1.5 6.07506C1.5 6.1481 1.77226 6.966 2.4775 8.25314C3.0985 9.38655 5.64412 9.20001 8.16155 9.02955C10.8717 8.84606 12.423 4.69712 14.5999 3.05855C15.5512 2.34252 16.8176 2.41067 18.0156 2.6836C18.6486 2.82781 19.1836 3.50238 19.5861 4.2886C22.0225 9.04882 20.5414 15.901 19.3761 17.9371C19.0626 18.4847 18.2821 18.5408 17.6721 18.481C17.062 18.4213 16.4784 18.076 16.1418 17.5999C14.2608 14.9401 15.9232 9.29243 17.3747 6.29519C18.6131 3.73805 21.0335 2.50549 22.4289 1.81346C23.0833 1.48893 23.712 1.4395 24.3082 1.56011C24.9043 1.68072 25.4702 2.02935 25.9803 3.29069C27.3041 6.56441 27.3778 9.75938 27.4687 10.7366C27.6125 12.2814 29.4224 8.40777 30.533 8.18093C31.197 8.04532 32.1106 8.488 32.623 9.02461C33.5961 10.0437 33.2421 11.7589 32.8513 12.7916C32.667 13.2787 32.0283 13.3794 31.6859 13.2058C30.9487 12.832 31.0289 11.2411 31.1548 9.77834C31.29 8.20732 32.3038 7.01548 33.2292 6.17602C34.1169 5.37085 35.3062 5.19303 36.2752 5.34372C37.2145 5.4898 37.2562 7.72053 37.3265 8.65589C37.3405 8.84199 37.3504 6.94698 37.5839 6.07158C37.8174 5.19617 38.2844 5.01555 38.6269 5.18447C39.3912 5.56141 39.4408 7.03007 39.8433 7.86146C42.3619 7.66563 44.6519 7.95989 46.5 8.49287"

/** active_loop.svg — viewBox 0 0 153 32 */
const PATH_ACTIVE_LOOP =
    "M1.5 9.30451C1.5 9.42912 2.40754 10.8244 4.75832 13.0201C6.82832 14.9535 15.3137 14.6353 23.7052 14.3445C32.7389 14.0315 37.91 6.95391 45.1664 4.15871C48.3373 2.93723 52.5586 3.0535 56.5519 3.51909C58.6619 3.76509 60.4455 4.91583 61.7868 6.25702C69.9083 14.3774 65.5 28 61.087 29.5397C59.7635 30.0014 57.4404 30.5696 55.4069 30.4676C53.3734 30.3657 51.4281 29.7766 50.3059 28.9646C44.0358 24.4272 49.5774 14.793 54.4158 9.68003C58.5438 5.31785 66.6116 3.21525 71.263 2.03472C73.4443 1.48111 75.54 1.3968 77.5272 1.60254C79.5144 1.80828 81.4008 2.403 83.101 4.55471C87.5137 10.1393 87.7592 15.5895 88.0624 17.2566C88.5417 19.8919 94.5747 13.2838 98.2767 12.8969C100.49 12.6655 103.535 13.4207 105.243 14.3361C108.487 16.0745 107.307 19.0004 106.004 20.7621C105.39 21.593 103.261 21.7649 102.12 21.4688C99.6622 20.831 99.9296 18.1172 100.349 15.6219C100.8 12.9419 104.179 10.9088 107.264 9.47675C110.223 8.10322 114.187 7.79987 117.417 8.05693C120.548 8.30613 120.687 12.1115 120.922 13.7071C120.968 14.0246 121.001 10.7919 121.78 9.29857C122.558 7.80523 124.115 7.49711 125.256 7.78527C127.804 8.42828 127.969 10.9336 129.311 12.3519C137.706 12.0178 145.34 12.5198 151.5 13.429"

const VB_DEFAULT = { w: 48, h: 20 }
const VB_ACTIVE = { w: 153, h: 32 }

const ACCENT_DEFAULT = "#FB5219"
const CARD_BG = "#ffffff"
const LOOP_GREY_DEFAULT = "#C5C5C5"
const NAME_COLOR = "#000000"
const SUBTEXT_COLOR = "#9E9E9E"
const TIMER_COLOR = "#9E9E9E"

/** Subtle default shadows (tweak in Framer via BoxShadow controls). */
const DEFAULT_CARD_SHADOW =
    "0px 2px 8px 0px rgba(0,0,0,0.06), 0px 10px 20px -8px rgba(251,82,25,0.10)"
const DEFAULT_ACTIVE_CARD_SHADOW =
    "0px 2px 10px 0px rgba(0,0,0,0.07), 0px 10px 22px -8px rgba(251,82,25,0.10)"

/** Maps Framer `ControlType.Font` to a React/CSS text style object. */
function framerFontToStyle(font: Record<string, unknown> | undefined): CSSProperties {
    if (!font || typeof font !== "object") return {}
    const keys = [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "fontStyle",
        "letterSpacing",
        "lineHeight",
        "textAlign",
        "textTransform",
        "fontVariant",
    ] as const
    const o: Record<string, unknown> = {}
    for (const k of keys) {
        const v = font[k]
        if (v !== undefined && v !== null && v !== "") o[k] = v
    }
    return o as CSSProperties
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const h = hex.replace("#", "")
    if (h.length !== 6) return null
    const n = parseInt(h, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbaAccent(accent: string, a: number) {
    const rgb = hexToRgb(accent)
    if (!rgb) return `rgba(251, 82, 25, ${a})`
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`
}

/** Extra bottom glow while speaking — kept subtle; strength from Framer enum. */
function talkingGlowLayer(accent: string, level: number, strength: number): string {
    if (strength <= 0) return ""
    const t = Math.max(0, Math.min(1, level)) * strength
    const blur = 6 + t * 16
    const spread = -6 + t * 8
    const y = 3 + t * 5
    const alpha = 0.03 + t * 0.12
    return `0 ${y}px ${blur}px ${spread}px ${rgbaAccent(accent, alpha)}`
}

function talkingCardShadow(base: string, accent: string, level: number, strength: number): string {
    const extra = talkingGlowLayer(accent, level, strength)
    return extra ? `${base}, ${extra}` : base
}

/** Avoid `https://host//api/...` and trim spaces (common Framer paste issues). */
function normalizeApiBase(raw: string): string {
    let u = String(raw ?? "").trim()
    if (!u) return ""
    u = u.replace(/\/+$/, "")
    return u
}

/** Safari often has no WebM/Opus — use MP4/AAC so Deepgram gets a real container. */
function pickMediaRecorderFormat(): { mimeType: string; fileName: string } {
    const tries: { mime: string; name: string }[] = [
        { mime: "audio/webm;codecs=opus", name: "recording.webm" },
        { mime: "audio/webm", name: "recording.webm" },
        { mime: "audio/mp4;codecs=mp4a.40.2", name: "recording.m4a" },
        { mime: "audio/mp4", name: "recording.m4a" },
        { mime: "audio/ogg;codecs=opus", name: "recording.ogg" },
    ]
    for (const { mime, name } of tries) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
            return { mimeType: mime, fileName: name }
        }
    }
    return { mimeType: "", fileName: "recording.m4a" }
}

function formatCallTime(totalSec: number) {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

// ── GSAP ──────────────────────────────────────────────────────

let gsapInstance: any = null
let gsapLoading: Promise<any> | null = null

function loadGsap(): Promise<any> {
    if (gsapInstance) return Promise.resolve(gsapInstance)
    if (gsapLoading) return gsapLoading
    gsapLoading = import("https://esm.sh/gsap@3").then((mod) => {
        gsapInstance = mod.gsap ?? mod.default
        return gsapInstance
    })
    return gsapLoading
}

function useGsap() {
    const [gsap, setGsap] = useState<any>(null)
    useEffect(() => {
        loadGsap().then(setGsap)
    }, [])
    return gsap
}

// ── cross.svg — viewBox 0 0 17 17 ─────────────────────────────

function IconCrossFromAsset({ size = 17 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden>
            <path
                d="M1.46289 2.08984C1.94138 2.57962 4.33154 4.73359 6.47838 6.87503C8.15686 8.5493 10.6397 10.8287 12.8796 12.8659C13.3536 13.2901 13.7595 13.6624 14.1206 14.0062C14.4817 14.35 14.7857 14.654 15.1498 14.5074"
                stroke="currentColor"
                strokeWidth="2.92419"
                strokeLinecap="round"
            />
            <path
                d="M1.71484 15.0146C2.20976 14.5415 4.38947 12.1748 6.55401 10.0512C8.24634 8.39094 10.5525 5.93287 12.6137 3.71515C13.0431 3.24577 13.4198 2.84394 13.7674 2.48659C14.1151 2.12924 14.4224 1.82855 14.2797 1.46286"
                stroke="currentColor"
                strokeWidth="2.92419"
                strokeLinecap="round"
            />
        </svg>
    )
}

// ── Default: static vector (no GSAP) ──────────────────────────

function DefaultLoopVector({ accentColor, height = 22 }: { accentColor: string; height?: number }) {
    const scale = height / VB_DEFAULT.h
    return (
        <svg
            width={VB_DEFAULT.w * scale}
            height={height}
            viewBox={`0 0 ${VB_DEFAULT.w} ${VB_DEFAULT.h}`}
            fill="none"
            style={{ overflow: "visible", flexShrink: 0 }}
            aria-hidden
        >
            <path
                d={PATH_DEFAULT_LOOP}
                stroke={accentColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

// ── Active: grey base + accent dash loop while voiceActive ───

function ActiveLoopWave({
    greyColor,
    accentColor,
    gsap,
    voiceActive,
}: {
    greyColor: string
    accentColor: string
    gsap: any
    voiceActive: boolean
}) {
    const accentRef = useRef<SVGPathElement>(null)
    const tlRef = useRef<any>(null)

    useEffect(() => {
        const path = accentRef.current
        if (!gsap || !path) return

        tlRef.current?.kill()
        tlRef.current = null
        gsap.killTweensOf(path)

        if (!voiceActive) {
            gsap.killTweensOf(path)
            path.removeAttribute("stroke-dasharray")
            path.removeAttribute("stroke-dashoffset")
            gsap.set(path, { opacity: 0 })
            return
        }

        const len = path.getTotalLength() || 400
        const dashSeg = Math.max(8, len * 0.12)
        const gap = len
        path.style.strokeDasharray = `${dashSeg} ${gap}`
        gsap.set(path, { strokeDashoffset: 0, opacity: 1 })

        const tl = gsap.timeline({ repeat: -1 })
        tl.to(path, {
            strokeDashoffset: -(len + dashSeg),
            duration: 2.4,
            ease: "none",
        })
        tlRef.current = tl

        return () => {
            tlRef.current?.kill()
            tlRef.current = null
        }
    }, [voiceActive, gsap, accentColor])

    const h = 30

    return (
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
            <svg
                width="100%"
                height={h}
                viewBox={`0 0 ${VB_ACTIVE.w} ${VB_ACTIVE.h}`}
                preserveAspectRatio="xMinYMid meet"
                fill="none"
                style={{ overflow: "visible", maxWidth: "100%" }}
                aria-hidden
            >
                <path
                    d={PATH_ACTIVE_LOOP}
                    stroke={greyColor}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    ref={accentRef}
                    d={PATH_ACTIVE_LOOP}
                    stroke={accentColor}
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────

interface Message {
    id: string
    role: "user" | "assistant"
    text: string
}

type SpeakingGlowKey = "Off" | "Subtle" | "Low"

const SPEAKING_GLOW_MULT: Record<SpeakingGlowKey, number> = {
    Off: 0,
    Subtle: 0.5,
    Low: 0.85,
}

export default function VoiceAIWidget({
    apiBaseUrl = "https://voice-ai-backend-one.vercel.app",
    agentName = "Assistant",
    agentSubtitle = "Audio call",
    greetingMessage = "Hey, how can I help you today?",
    accentColor = ACCENT_DEFAULT,
    loopGreyColor = LOOP_GREY_DEFAULT,
    defaultCardShadow = DEFAULT_CARD_SHADOW,
    activeCardShadow = DEFAULT_ACTIVE_CARD_SHADOW,
    speakingGlowWhileTalking = "Subtle",
    defaultCardBackground = CARD_BG,
    activeCardBackground = CARD_BG,
    defaultNameFont,
    defaultSubtitleFont,
    activeTimerFont,
    defaultNameColor = NAME_COLOR,
    defaultSubtitleColor = SUBTEXT_COLOR,
    activeTimerColor = TIMER_COLOR,
    activeEndCallIconColor = "#ffffff",
}: {
    apiBaseUrl?: string
    agentName?: string
    agentSubtitle?: string
    greetingMessage?: string
    accentColor?: string
    loopGreyColor?: string
    defaultCardShadow?: string
    activeCardShadow?: string
    speakingGlowWhileTalking?: SpeakingGlowKey
    defaultCardBackground?: string
    activeCardBackground?: string
    defaultNameFont?: Record<string, unknown>
    defaultSubtitleFont?: Record<string, unknown>
    activeTimerFont?: Record<string, unknown>
    defaultNameColor?: string
    defaultSubtitleColor?: string
    activeTimerColor?: string
    activeEndCallIconColor?: string
}) {
    const gsap = useGsap()
    const apiBase = normalizeApiBase(apiBaseUrl)

    const nameFontStyle = framerFontToStyle(defaultNameFont)
    const subtitleFontStyle = framerFontToStyle(defaultSubtitleFont)
    const timerFontStyle = framerFontToStyle(activeTimerFont)

    const glowStrength =
        SPEAKING_GLOW_MULT[
            speakingGlowWhileTalking === "Off" || speakingGlowWhileTalking === "Subtle" || speakingGlowWhileTalking === "Low"
                ? speakingGlowWhileTalking
                : "Subtle"
        ] ?? 0.5

    const [phase, setPhase] = useState<"default" | "active">("default")
    const [elapsedSec, setElapsedSec] = useState(0)
    const [isVoiceActive, setIsVoiceActive] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [micError, setMicError] = useState(false)
    const messagesRef = useRef<Message[]>([])
    messagesRef.current = messages

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const currentAudioRef = useRef<HTMLAudioElement | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const greetingStartedRef = useRef(false)
    const streamRef = useRef<MediaStream | null>(null)
    const phaseRef = useRef(phase)
    const listenAbortRef = useRef<AbortController | null>(null)
    const listenRafRef = useRef<number | null>(null)
    const handleSubmitRef = useRef<(text: string) => Promise<void>>(async () => {})
    const listenOnceRef = useRef<() => void>(() => {})
    const ttsRafRef = useRef<number | null>(null)
    const ttsCtxRef = useRef<AudioContext | null>(null)

    const isVoiceActiveRef = useRef(false)
    const voiceLevelRef = useRef(0)
    const smoothedLevelRef = useRef(0)
    const idleBaseShadowRef = useRef("")

    useEffect(() => {
        phaseRef.current = phase
    }, [phase])

    useEffect(() => {
        isVoiceActiveRef.current = isVoiceActive
    }, [isVoiceActive])

    useEffect(() => {
        const s = (activeCardShadow ?? "").trim()
        idleBaseShadowRef.current = s || DEFAULT_ACTIVE_CARD_SHADOW
    }, [activeCardShadow])

    // Call timer
    useEffect(() => {
        if (phase !== "active") return
        setElapsedSec(0)
        const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [phase])

    // Active card entrance
    useEffect(() => {
        if (!gsap || !cardRef.current || phase !== "active") return
        gsap.fromTo(
            cardRef.current,
            { scaleX: 0.96, opacity: 0.92 },
            { scaleX: 1, opacity: 1, duration: 0.42, ease: "power3.out", transformOrigin: "left center" }
        )
    }, [phase, gsap])

    // Audio-synced glow (GSAP ticker → boxShadow on active card)
    useEffect(() => {
        if (!gsap || !cardRef.current) return
        const el = cardRef.current

        const tick = () => {
            if (phaseRef.current !== "active" || !el.isConnected) return

            const target = isVoiceActiveRef.current ? voiceLevelRef.current : 0
            const prev = smoothedLevelRef.current
            smoothedLevelRef.current = prev + (target - prev) * 0.18

            const lv = smoothedLevelRef.current
            const base = idleBaseShadowRef.current

            if (glowStrength > 0 && lv > 0.02) {
                el.style.boxShadow = talkingCardShadow(base, accentColor, lv, glowStrength)
            } else {
                el.style.boxShadow = base
            }
        }

        gsap.ticker.add(tick)
        return () => {
            gsap.ticker.remove(tick)
            if (el) el.style.boxShadow = idleBaseShadowRef.current
        }
    }, [gsap, accentColor, phase, glowStrength])

    const endCall = useCallback(() => {
        listenAbortRef.current?.abort()
        listenAbortRef.current = null
        if (listenRafRef.current != null) {
            cancelAnimationFrame(listenRafRef.current)
            listenRafRef.current = null
        }
        if (ttsRafRef.current != null) {
            cancelAnimationFrame(ttsRafRef.current)
            ttsRafRef.current = null
        }
        ttsCtxRef.current?.close().catch(() => {})
        ttsCtxRef.current = null

        currentAudioRef.current?.pause()
        currentAudioRef.current = null
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop()
        }
        mediaRecorderRef.current = null
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        voiceLevelRef.current = 0
        smoothedLevelRef.current = 0
        setIsVoiceActive(false)
        setPhase("default")
        setMicError(false)
        greetingStartedRef.current = false
        setMessages([])
    }, [])

    const playAudioFromBlob = useCallback(
        (blob: Blob, onEnded?: () => void) => {
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            currentAudioRef.current = audio
            setIsVoiceActive(true)

            let ctx: AudioContext | null = null
            const stopTtsMeter = () => {
                if (ttsRafRef.current != null) {
                    cancelAnimationFrame(ttsRafRef.current)
                    ttsRafRef.current = null
                }
                voiceLevelRef.current = 0
                ctx?.close().catch(() => {})
                ctx = null
                ttsCtxRef.current = null
            }

            const done = () => {
                stopTtsMeter()
                setIsVoiceActive(false)
                URL.revokeObjectURL(url)
                onEnded?.()
            }

            audio.onended = done
            audio.onerror = done

            audio
                .play()
                .then(() => {
                    try {
                        ctx = new AudioContext()
                        ttsCtxRef.current = ctx
                        if (ctx.state === "suspended") ctx.resume().catch(() => {})
                        const source = ctx.createMediaElementSource(audio)
                        const analyser = ctx.createAnalyser()
                        analyser.fftSize = 256
                        analyser.smoothingTimeConstant = 0.65
                        source.connect(analyser)
                        analyser.connect(ctx.destination)

                        const freq = new Uint8Array(analyser.frequencyBinCount)

                        const meter = () => {
                            if (audio.paused || audio.ended) return
                            analyser.getByteFrequencyData(freq)
                            let s = 0
                            for (let i = 0; i < freq.length; i++) s += freq[i]
                            const avg = s / freq.length / 255
                            voiceLevelRef.current = Math.min(1, Math.pow(avg, 0.65) * 2.2)
                            ttsRafRef.current = requestAnimationFrame(meter)
                        }
                        meter()
                    } catch {
                        voiceLevelRef.current = 0.35
                    }
                })
                .catch(() => {
                    stopTtsMeter()
                    setIsVoiceActive(false)
                    URL.revokeObjectURL(url)
                    onEnded?.()
                })
        },
        []
    )

    const listenOnce = useCallback(() => {
        if (phaseRef.current !== "active") return
        const stream = streamRef.current
        if (!stream) return

        listenAbortRef.current?.abort()
        const abort = new AbortController()
        listenAbortRef.current = abort

        let ctx: AudioContext | null = null
        const cleanupCtx = () => {
            if (ctx) {
                ctx.close().catch(() => {})
                ctx = null
            }
        }

        const { mimeType: preferredMime, fileName: recordingFileName } = pickMediaRecorderFormat()

        try {
            ctx = new AudioContext()
            if (ctx.state === "suspended") ctx.resume().catch(() => {})
        } catch {
            return
        }

        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        analyser.smoothingTimeConstant = 0.82
        source.connect(analyser)

        const recorder =
            preferredMime !== ""
                ? new MediaRecorder(stream, { mimeType: preferredMime })
                : new MediaRecorder(stream)
        mediaRecorderRef.current = recorder
        const chunks: Blob[] = []
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data)
        }

        let speechStarted = false
        let silenceStart: number | null = null
        const SILENCE_MS = 1450
        const MIN_RMS = 0.022
        const MAX_CAPTURE_MS = 60000
        const MAX_IDLE_MS = 38000
        const startT = performance.now()
        const buf = new Uint8Array(analyser.fftSize)

        let captureFinished = false
        const finishCapture = () => {
            if (captureFinished) return
            captureFinished = true
            if (listenRafRef.current != null) {
                cancelAnimationFrame(listenRafRef.current)
                listenRafRef.current = null
            }
            if (recorder.state === "recording") {
                try {
                    recorder.requestData()
                } catch {
                    /* ignore */
                }
                recorder.stop()
            }
        }

        recorder.onstop = async () => {
            cleanupCtx()
            voiceLevelRef.current = 0
            if (abort.signal.aborted || phaseRef.current !== "active") return
            const blobType = recorder.mimeType || preferredMime || "audio/webm"
            const blob = new Blob(chunks, { type: blobType })
            const outName = recordingFileName
            if (blob.size < 800) {
                console.warn("[VoiceAI] Recording too small after stop — try speaking a bit longer.", blob.size, "bytes")
                listenOnceRef.current()
                return
            }
            try {
                const fd = new FormData()
                fd.append("audio", blob, outName)
                const res = await fetch(`${apiBase}/api/transcribe`, { method: "POST", mode: "cors", body: fd })
                if (!res.ok) {
                    const err = await res.text().catch(() => "")
                    console.error("[VoiceAI] /api/transcribe failed:", res.status, err.slice(0, 400))
                    throw new Error("transcribe")
                }
                const data = await res.json()
                const text = data.text as string | undefined
                if (text?.trim()) {
                    await handleSubmitRef.current(text)
                } else {
                    console.warn(
                        "[VoiceAI] Transcribe returned empty text. Check Vercel logs for Deepgram; try Chrome if you use Safari."
                    )
                    listenOnceRef.current()
                }
            } catch (e) {
                console.error("[VoiceAI] transcribe pipeline:", e)
                if (phaseRef.current === "active") listenOnceRef.current()
            }
        }

        setIsVoiceActive(true)
        recorder.start(250)

        const tick = () => {
            if (abort.signal.aborted || phaseRef.current !== "active") {
                if (!captureFinished && recorder.state === "recording") recorder.stop()
                voiceLevelRef.current = 0
                return
            }
            analyser.getByteTimeDomainData(buf)
            let sum = 0
            for (let i = 0; i < buf.length; i++) {
                const n = (buf[i] - 128) / 128
                sum += n * n
            }
            const rms = Math.sqrt(sum / buf.length)
            const now = performance.now()

            voiceLevelRef.current = Math.min(1, rms / 0.09)

            if (rms > MIN_RMS) {
                speechStarted = true
                silenceStart = null
            } else if (speechStarted) {
                if (silenceStart === null) silenceStart = now
                if (now - silenceStart >= SILENCE_MS) {
                    setIsVoiceActive(false)
                    voiceLevelRef.current = 0
                    finishCapture()
                    return
                }
            }

            if (now - startT > MAX_CAPTURE_MS && speechStarted) {
                setIsVoiceActive(false)
                voiceLevelRef.current = 0
                finishCapture()
                return
            }

            if (!speechStarted && now - startT > MAX_IDLE_MS) {
                setIsVoiceActive(false)
                voiceLevelRef.current = 0
                finishCapture()
                return
            }

            listenRafRef.current = requestAnimationFrame(tick)
        }

        listenRafRef.current = requestAnimationFrame(tick)
    }, [apiBase])

    listenOnceRef.current = listenOnce

    const handleSubmit = useCallback(
        async (text: string) => {
            const trimmed = text.trim()
            if (!trimmed || phaseRef.current !== "active") return

            setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: trimmed }])
            setIsVoiceActive(false)
            voiceLevelRef.current = 0

            const goListen = () => {
                if (phaseRef.current === "active") listenOnceRef.current()
            }

            try {
                const chatRes = await fetch(`${apiBase}/api/chat`, {
                    method: "POST",
                    mode: "cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: trimmed,
                        history: messagesRef.current.map((m) => ({ role: m.role, content: m.text })),
                    }),
                })
                if (!chatRes.ok) {
                    const err = await chatRes.text().catch(() => "")
                    console.error("[VoiceAI] /api/chat", chatRes.status, err.slice(0, 200))
                    throw new Error("chat")
                }
                const { reply } = await chatRes.json()

                const speakRes = await fetch(`${apiBase}/api/speak`, {
                    method: "POST",
                    mode: "cors",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: reply }),
                })
                if (!speakRes.ok) {
                    const err = await speakRes.text().catch(() => "")
                    console.error("[VoiceAI] /api/speak", speakRes.status, err.slice(0, 200))
                    throw new Error("speak")
                }
                const ct = (speakRes.headers.get("content-type") || "").toLowerCase()
                if (ct.includes("application/json")) {
                    const j = await speakRes.json().catch(() => ({}))
                    console.error("[VoiceAI] /api/speak returned JSON (TTS error):", j)
                    throw new Error("speak-json")
                }
                const blob = await speakRes.blob()
                setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: "assistant", text: reply }])
                playAudioFromBlob(blob, goListen)
            } catch (e) {
                console.error("[VoiceAI]", e)
                goListen()
            }
        },
        [apiBase, playAudioFromBlob]
    )

    handleSubmitRef.current = handleSubmit

    const startCall = useCallback(async () => {
        if (!apiBase) {
            console.error(
                "[VoiceAI] API Base URL is empty. In Framer → Properties, set API Base URL (no trailing slash), e.g. https://voice-ai-backend-one.vercel.app"
            )
            return
        }
        setPhase("active")
        setMicError(false)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
        } catch {
            setMicError(true)
            return
        }

        const goListen = () => {
            if (phaseRef.current === "active") listenOnceRef.current()
        }

        if (!greetingMessage?.trim()) {
            goListen()
            return
        }
        if (greetingStartedRef.current) {
            goListen()
            return
        }
        greetingStartedRef.current = true
        try {
            const res = await fetch(`${apiBase}/api/speak`, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: greetingMessage }),
            })
            if (!res.ok) {
                const err = await res.text().catch(() => "")
                console.error("[VoiceAI] /api/speak (greeting)", res.status, err.slice(0, 200))
                goListen()
                return
            }
            const ct = (res.headers.get("content-type") || "").toLowerCase()
            if (ct.includes("application/json")) {
                const j = await res.json().catch(() => ({}))
                console.error("[VoiceAI] greeting TTS error:", j)
                goListen()
                return
            }
            const blob = await res.blob()
            playAudioFromBlob(blob, goListen)
        } catch (e) {
            console.error("[VoiceAI] greeting fetch failed:", e)
            goListen()
        }
    }, [apiBase, greetingMessage, playAudioFromBlob])

    const defaultShadow = (defaultCardShadow ?? "").trim() || DEFAULT_CARD_SHADOW

    if (phase === "default") {
        return (
            <button
                type="button"
                aria-label={`Start audio call with ${agentName}`}
                onClick={startCall}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 20px 11px 14px",
                    background: defaultCardBackground,
                    border: "none",
                    borderRadius: 14,
                    cursor: "pointer",
                    boxShadow: defaultShadow,
                }}
            >
                <DefaultLoopVector accentColor={accentColor} height={22} />
                <div style={{ textAlign: "left" }}>
                    <div style={{ ...nameFontStyle, color: defaultNameColor, lineHeight: nameFontStyle.lineHeight ?? 1.15 }}>
                        {agentName}
                    </div>
                    <div style={{ ...subtitleFontStyle, color: defaultSubtitleColor, marginTop: 2 }}>
                        {agentSubtitle}
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div
            ref={cardRef}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px 10px 12px",
                background: activeCardBackground,
                borderRadius: 14,
                boxShadow: (activeCardShadow ?? "").trim() || DEFAULT_ACTIVE_CARD_SHADOW,
                minWidth: 300,
                width: "max-content",
                maxWidth: "min(400px, 92vw)",
                boxSizing: "border-box",
            }}
        >
            <ActiveLoopWave
                greyColor={loopGreyColor}
                accentColor={accentColor}
                gsap={gsap}
                voiceActive={isVoiceActive}
            />

            <div
                style={{
                    ...timerFontStyle,
                    color: activeTimerColor,
                    flexShrink: 0,
                    minWidth: 48,
                    textAlign: (timerFontStyle.textAlign as CSSProperties["textAlign"]) ?? "right",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {formatCallTime(elapsedSec)}
            </div>

            <button
                type="button"
                aria-label="End call"
                onClick={endCall}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: accentColor,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activeEndCallIconColor,
                    flexShrink: 0,
                }}
            >
                <IconCrossFromAsset size={15} />
            </button>

            {micError && (
                <span
                    style={{
                        position: "absolute",
                        left: 12,
                        bottom: -18,
                        fontSize: 11,
                        color: "#ef4444",
                        whiteSpace: "nowrap",
                        fontFamily: subtitleFontStyle.fontFamily ?? "ui-sans-serif, system-ui, sans-serif",
                    }}
                >
                    Allow microphone access
                </span>
            )}
        </div>
    )
}

addPropertyControls(VoiceAIWidget, {
    apiBaseUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://voice-ai-backend-one.vercel.app",
        placeholder: "https://…",
        description: "Origin only — no `/api`. No trailing slash.",
    },
    greetingMessage: {
        type: ControlType.String,
        title: "Greeting",
        defaultValue: "Hey, how can I help you today?",
    },
        agentName: { type: ControlType.String, title: "Name", defaultValue: "Assistant" },
    agentSubtitle: { type: ControlType.String, title: "Subtitle", defaultValue: "Audio call" },

    accentColor: {
        type: ControlType.Color,
        title: "Accent (loop, button, glow tint)",
        defaultValue: ACCENT_DEFAULT,
    },
    loopGreyColor: {
        type: ControlType.Color,
        title: "Active · loop (grey base)",
        defaultValue: LOOP_GREY_DEFAULT,
    },

    defaultCardShadow: {
        type: ControlType.BoxShadow,
        title: "Default · shadows",
        defaultValue: DEFAULT_CARD_SHADOW,
    },
    activeCardShadow: {
        type: ControlType.BoxShadow,
        title: "Active · shadows",
        defaultValue: DEFAULT_ACTIVE_CARD_SHADOW,
    },
    speakingGlowWhileTalking: {
        type: ControlType.Enum,
        title: "Active · extra glow while speaking",
        options: ["Off", "Subtle", "Low"],
        optionTitles: ["Off", "Subtle", "Low"],
        defaultValue: "Subtle",
        description: "Adds a small accent glow on top of **Active · shadows** during mic / TTS. Use **Off** if you only want your BoxShadow layers.",
    },

    defaultCardBackground: {
        type: ControlType.Color,
        title: "Default · card fill",
        defaultValue: CARD_BG,
    },
    defaultNameFont: {
        type: ControlType.Font,
        title: "Default · name font",
        controls: "extended",
        defaultFontType: "serif",
        displayTextAlignment: true,
        defaultValue: {
            fontSize: 17,
            letterSpacing: 0,
            lineHeight: 1.15,
            textAlign: "left",
        },
    },
    defaultNameColor: {
        type: ControlType.Color,
        title: "Default · name color",
        defaultValue: NAME_COLOR,
    },
    defaultSubtitleFont: {
        type: ControlType.Font,
        title: "Default · subtitle font",
        controls: "extended",
        defaultFontType: "sans-serif",
        displayTextAlignment: true,
        defaultValue: {
            fontSize: 15,
            letterSpacing: 0,
            lineHeight: 1.2,
            textAlign: "left",
            variant: "Regular",
        },
    },
    defaultSubtitleColor: {
        type: ControlType.Color,
        title: "Default · subtitle color",
        defaultValue: SUBTEXT_COLOR,
    },

    activeCardBackground: {
        type: ControlType.Color,
        title: "Active · card fill",
        defaultValue: CARD_BG,
    },
    activeTimerFont: {
        type: ControlType.Font,
        title: "Active · timer font",
        controls: "extended",
        defaultFontType: "monospace",
        displayTextAlignment: true,
        defaultValue: {
            fontSize: 15,
            letterSpacing: 0,
            lineHeight: 1.2,
            textAlign: "right",
            variant: "Medium",
        },
    },
    activeTimerColor: {
        type: ControlType.Color,
        title: "Active · timer color",
        defaultValue: TIMER_COLOR,
    },
    activeEndCallIconColor: {
        type: ControlType.Color,
        title: "Active · end call icon",
        defaultValue: "#ffffff",
    },
})
