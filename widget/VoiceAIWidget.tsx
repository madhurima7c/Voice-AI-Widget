// VoiceAIWidget.tsx — Framer Code Component
// Vectors: portfolio-components/voice-widget-vectors/Assets-voice/*.svg (paths inlined where used).
// Active: GIF in `active-img.svg` photo rect + same paths (wire, handset) + orange dash; see `ACTIVE_IMG_PHOTO_RECT`.
// Glow: shadow preset at rest; orange blur/spread scales with mic or TTS level via GSAP ticker.
// GSAP: https://esm.sh/gsap@3

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"

// ── Asset paths (from Figma exports) ──────────────────────────
// Media (GIF / JPG / PNG): assign via Framer **Image** controls only — do not `import` local files here;
// Default state can use **SVG** (separate string control) for crisp vectors at any size.
// Framer’s bundler often cannot resolve `./voice-widget-vectors/...` and will show “unable to resolve”.

/** default_loop.svg — viewBox 0 0 48 20 */
const PATH_DEFAULT_LOOP =
    "M1.5 6.07506C1.5 6.1481 1.77226 6.966 2.4775 8.25314C3.0985 9.38655 5.64412 9.20001 8.16155 9.02955C10.8717 8.84606 12.423 4.69712 14.5999 3.05855C15.5512 2.34252 16.8176 2.41067 18.0156 2.6836C18.6486 2.82781 19.1836 3.50238 19.5861 4.2886C22.0225 9.04882 20.5414 15.901 19.3761 17.9371C19.0626 18.4847 18.2821 18.5408 17.6721 18.481C17.062 18.4213 16.4784 18.076 16.1418 17.5999C14.2608 14.9401 15.9232 9.29243 17.3747 6.29519C18.6131 3.73805 21.0335 2.50549 22.4289 1.81346C23.0833 1.48893 23.712 1.4395 24.3082 1.56011C24.9043 1.68072 25.4702 2.02935 25.9803 3.29069C27.3041 6.56441 27.3778 9.75938 27.4687 10.7366C27.6125 12.2814 29.4224 8.40777 30.533 8.18093C31.197 8.04532 32.1106 8.488 32.623 9.02461C33.5961 10.0437 33.2421 11.7589 32.8513 12.7916C32.667 13.2787 32.0283 13.3794 31.6859 13.2058C30.9487 12.832 31.0289 11.2411 31.1548 9.77834C31.29 8.20732 32.3038 7.01548 33.2292 6.17602C34.1169 5.37085 35.3062 5.19303 36.2752 5.34372C37.2145 5.4898 37.2562 7.72053 37.3265 8.65589C37.3405 8.84199 37.3504 6.94698 37.5839 6.07158C37.8174 5.19617 38.2844 5.01555 38.6269 5.18447C39.3912 5.56141 39.4408 7.03007 39.8433 7.86146C42.3619 7.66563 44.6519 7.95989 46.5 8.49287"

/** From `Assets-voice/active-img.svg` (viewBox 0 0 97 42): wire + handset `d` — photo `<rect>` replaced by Framer GIF (`ACTIVE_IMG_PHOTO_RECT`). */
const VB_ACTIVE_TELE = { w: 97, h: 42 }
const PATH_ACTIVE_TELE_WIRE =
    "M27 26.3824C27 26.4684 27.4128 27.4306 28.4822 28.9449C29.4239 30.2783 33.2839 30.0588 37.1012 29.8583C41.2106 29.6424 43.563 24.7613 46.8639 22.8336C48.3064 21.9912 50.2267 22.0714 52.0432 22.3925C53.0031 22.5621 53.8144 23.3557 54.4246 24.2807C58.1191 29.881 55.8733 37.9424 54.1062 40.3377C53.6309 40.9821 52.4474 41.048 51.5224 40.9777C50.5973 40.9074 49.7124 40.5011 49.2019 39.9411C46.3496 36.8118 48.8705 30.1676 51.0715 26.6414C52.9493 23.633 56.6194 22.1829 58.7353 21.3688C59.7276 20.987 60.6809 20.9288 61.5849 21.0707C62.4889 21.2126 63.347 21.6228 64.1204 23.1067C66.1278 26.9581 66.2395 30.7169 66.3774 31.8666C66.5955 33.684 69.3399 29.1268 71.0239 28.8599C72.0307 28.7004 73.4161 29.2212 74.1931 29.8525C75.6686 31.0514 75.1318 33.0692 74.5393 34.2842C74.2598 34.8572 73.2913 34.9758 72.7721 34.7716C71.6542 34.3317 71.7758 32.4601 71.9668 30.7392C72.1718 28.891 73.7091 27.4888 75.1123 26.5012C76.4583 25.5539 78.2618 25.3447 79.731 25.522C81.1553 25.6939 81.2186 28.3183 81.3251 29.4187C81.3464 29.6376 81.3614 27.4082 81.7155 26.3783C82.0695 25.3484 82.7776 25.1359 83.297 25.3347C84.456 25.7781 84.5311 27.506 85.1415 28.4841C88.9606 28.2537 92.433 28.5999 95.2353 29.2269"
const PATH_ACTIVE_TELE_HANDSET =
    "M27.2246 21.7827C27.3696 21.7617 27.6076 21.8045 27.9992 22.0002C28.9991 22.5001 29 21.5003 29.5 22.5003C29.9019 23.3054 29.654 25.7272 29.5428 26.6433C29.2603 27.0772 28.9079 27.4874 28.5594 27.8394C28.2758 28.1259 27.7727 28.7036 27.0653 29.0023C26.7058 29.154 26.1862 29.2776 25.6675 29.3185C25.1713 29.3576 24.4884 29.3374 23.9107 29.0326C23.8257 28.9878 23.7284 28.9449 23.5569 28.865C23.4076 28.7954 23.214 28.703 23.0289 28.5893C22.7434 28.4137 22.0247 27.9137 22.1174 27.004C22.1985 26.2078 22.487 25.1608 23.0937 24.2085C23.2574 23.9515 23.4847 23.5622 23.7052 23.2731C23.9319 22.9759 24.2972 22.5772 24.8598 22.4226L25.0537 22.3802C25.2886 22.3436 25.635 22.3413 25.9829 22.5434C26.2121 22.6767 26.4198 22.7843 26.601 22.8348C26.6848 22.8581 26.7308 22.8603 26.7502 22.8594C26.7785 22.8422 26.8061 22.8252 26.8301 22.8109C26.8602 22.7929 26.886 22.7776 26.9109 22.7624C26.9608 22.7319 26.9956 22.7087 27.0224 22.6892C27.0285 22.6847 27.0333 22.6798 27.0378 22.6763C27.0423 22.6621 27.0492 22.6443 27.0554 22.6225C27.0833 22.5241 27.1158 22.3862 27.1508 22.211C27.1765 22.082 27.1993 21.9379 27.2246 21.7827ZM27.6017 10.2453C27.9262 10.2628 28.2048 10.4342 28.3743 10.6838C28.8648 10.9062 29.3332 11.2251 29.7072 11.6511C29.9701 11.9506 30.4897 12.4691 30.7633 13.1483C30.8976 13.4816 31.1017 13.9343 31.2727 14.5183C30.3933 14.6379 29.0984 15.3752 28.5992 15.791C28.1267 16.1847 27.522 16.8831 27.2093 17.2539C27.0157 17.2336 26.7052 17.1966 26.3762 17.0693C25.6149 16.7748 25.0661 16.2245 24.7475 15.5434C24.6825 15.4043 24.5972 15.2475 24.4843 15.0354C24.3791 14.8378 24.2552 14.6021 24.149 14.3583C23.9679 13.9428 23.6859 13.1858 23.9845 12.4464L24.1032 12.1848C24.4087 11.5806 24.9156 11.026 25.6228 10.7289C26.075 10.5389 26.479 10.4174 26.8004 10.3441C27.0886 10.2784 27.3857 10.2337 27.6017 10.2453Z"

const VB_DEFAULT = { w: 48, h: 20 }

const ACCENT_DEFAULT = "#FB5219"
/** Active state end-call circle (hover uses slightly darker red). */
const END_CALL_BTN_BG = "#ED4D17"
const END_CALL_BTN_BG_HOVER = "#cf4214"
const CARD_BG = "#ffffff"
/** Matches `active-img.svg` wire stroke `#CACACA`. */
const LOOP_GREY_DEFAULT = "#CACACA"
const NAME_COLOR = "#000000"
const SUBTEXT_COLOR = "#9E9E9E"
const TIMER_COLOR = "#9E9E9E"

/** Fallback shadows when Framer Box Shadow is empty — set real values in Properties. */
const DEFAULT_CARD_SHADOW =
    "0px 2px 8px 0px rgba(0,0,0,0.06), 0px 10px 20px -8px rgba(251,82,25,0.10)"
/** Appended while hovering the default pill — subtle extra depth (works with Framer shadows too). */
const DEFAULT_CARD_SHADOW_HOVER_EXTRA =
    "0px 6px 16px -4px rgba(0,0,0,0.07), 0px 12px 26px -8px rgba(251,82,25,0.11)"
const DEFAULT_ACTIVE_CARD_SHADOW =
    "0px 2px 10px 0px rgba(0,0,0,0.07), 0px 10px 22px -8px rgba(251,82,25,0.10)"

const DEFAULT_TOOLTIP_SHADOW =
    "0px 10px 28px rgba(0,0,0,0.12), 0px 2px 10px rgba(0,0,0,0.08)"
const DEFAULT_TOOLTIP_TEXT = "This is a voice call; it may hallucinate."

/**
 * Framer `ControlType.BoxShadow` may hand us a CSS string (fallback default)
 * or a structured `BoxShadow | BoxShadow[]` object once the user edits in the
 * property panel.  This normalises either shape into a valid CSS box-shadow.
 */
function boxShadowToCSS(v: unknown): string {
    if (!v) return ""
    if (typeof v === "string") return v
    const one = (s: Record<string, unknown>): string => {
        const x = Number(s.x ?? s.offsetX ?? 0)
        const y = Number(s.y ?? s.offsetY ?? 0)
        const blur = Number(s.blur ?? s.blurRadius ?? 0)
        const spread = Number(s.spread ?? s.spreadRadius ?? 0)
        const color = String(s.color ?? "rgba(0,0,0,0.1)")
        const inset =
            s.inset === true || s.type === "innerShadow" ? "inset " : ""
        return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`
    }
    if (Array.isArray(v)) return v.map((s) => one(s as Record<string, unknown>)).join(", ")
    if (typeof v === "object") return one(v as Record<string, unknown>)
    return String(v)
}

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

/** Framer `ControlType.Image` → usable `src` string (GIF/PNG/JPG; Framer shape varies by version). */
function framerImageSrc(img: unknown, depth = 0): string | undefined {
    if (depth > 6) return undefined
    if (img == null || img === "") return undefined
    if (typeof img === "string") {
        const t = img.trim()
        return t || undefined
    }
    if (typeof img === "object" && img !== null) {
        const o = img as Record<string, unknown>
        const tryStr = (v: unknown): string | undefined =>
            typeof v === "string" && v.trim() ? v.trim() : undefined
        const direct =
            tryStr(o.src) ??
            tryStr(o.url) ??
            tryStr(o.value) ??
            tryStr(o.href) ??
            tryStr(o.path) ??
            tryStr(o.filename)
        if (direct) return direct
        const nested = o.image ?? o.file ?? o.asset ?? o.default
        if (nested != null && nested !== o) {
            const inner = framerImageSrc(nested, depth + 1)
            if (inner) return inner
        }
    }
    return undefined
}

/** True if the string is inline SVG markup (not a URL). */
function isInlineSvgMarkup(s: string): boolean {
    return /^\s*<svg\b/i.test(s)
}

/**
 * Ensures the root &lt;svg&gt; scales inside the avatar slot (vector crispness, no raster blur).
 * Skips if a `style=` is already present near the opening tag.
 */
function injectSvgSlotSizing(svgMarkup: string): string {
    const t = svgMarkup.trim()
    if (!/^<svg\b/i.test(t)) return t
    const headLen = Math.min(2000, t.length)
    if (/\sstyle\s*=/i.test(t.slice(0, headLen))) return t
    return t.replace(/^<svg\b([^>]*)>/i, (_m, attrs: string) => {
        const a = attrs ?? ""
        const par = /\spreserveAspectRatio\s*=/i.test(a) ? "" : ` preserveAspectRatio="xMidYMid meet"`
        return `<svg${a} style="max-width:100%;max-height:100%;width:auto;height:auto;display:block"${par}>`
    })
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
            style={{ overflow: "visible", flexShrink: 0, display: "block" }}
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

// ── info-icon.svg — viewBox 0 0 13 13 ─────────────────────────

function IconInfoFromAsset({ size = 13, stroke = "#8A8A8A", fill = "#8A8A8A" }: { size?: number; stroke?: string; fill?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden>
            <rect x="0.5" y="0.5" width="12" height="12" rx="6" stroke={stroke} />
            <path
                d="M6.97602 8.5696L7.52202 8.8582V8.9674H5.41602V8.8582L5.96202 8.5696V5.6212L5.41602 5.4106V5.3092L6.97602 4.8412V8.5696ZM6.44562 4.4356C6.27402 4.4356 6.12842 4.3784 6.00882 4.264C5.88922 4.1444 5.82942 4.0014 5.82942 3.835C5.82942 3.6738 5.88922 3.536 6.00882 3.4216C6.12842 3.3072 6.27402 3.25 6.44562 3.25C6.62242 3.25 6.77062 3.3072 6.89022 3.4216C7.01502 3.536 7.07742 3.6738 7.07742 3.835C7.07742 4.0014 7.01502 4.1444 6.89022 4.264C6.77062 4.3784 6.62242 4.4356 6.44562 4.4356Z"
                fill={fill}
            />
        </svg>
    )
}

// ── Active: `active-img.svg` layout — photo rect (0,0 37×36) → Framer GIF; paths + dash unchanged on top ───

/** Embedded portrait rect in `active-img.svg` (the `<rect fill="url(#pattern…)"/>` we replace with HTML+GIF). */
const ACTIVE_IMG_PHOTO_RECT = { x: 0, y: 0, w: 37, h: 36, rx: 18 }

/**
 * Fetch + patch GIF loop (same as browser hook). Returns blob: URL or original `src`
 * for non-GIF / failures. Caller must revoke blob: URLs when discarding.
 */
async function prepareLoopingGifUrl(src: string): Promise<string> {
    try {
        const r = await fetch(src, { mode: "cors", cache: "force-cache" })
        const buf = await r.arrayBuffer()
        const bytes = new Uint8Array(buf)
        if (
            bytes.length < 14 ||
            String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== "GIF"
        ) {
            return src
        }
        let patched = false
        for (let i = 0; i < bytes.length - 18; i++) {
            if (bytes[i] === 0x21 && bytes[i + 1] === 0xff && bytes[i + 2] === 0x0b) {
                const label = String.fromCharCode(...Array.from(bytes.slice(i + 3, i + 14)))
                if (label === "NETSCAPE2.0") {
                    bytes[i + 16] = 0
                    bytes[i + 17] = 0
                    patched = true
                    break
                }
            }
        }
        if (!patched) {
            const flags = bytes[10]
            const hasGCT = (flags & 0x80) !== 0
            const gctSize = hasGCT ? 3 * (1 << ((flags & 0x07) + 1)) : 0
            const ins = 6 + 7 + gctSize
            const block = new Uint8Array([
                0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00,
            ])
            const out = new Uint8Array(bytes.length + block.length)
            out.set(bytes.slice(0, ins))
            out.set(block, ins)
            out.set(bytes.slice(ins), ins + block.length)
            return URL.createObjectURL(new Blob([out], { type: "image/gif" }))
        }
        return URL.createObjectURL(new Blob([bytes], { type: "image/gif" }))
    } catch {
        return src
    }
}

function revokeIfBlob(url: string | undefined) {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
}

/**
 * If `warm` matches `src`, uses prepared URL immediately (no second fetch).
 * Only revokes blob URLs created by this hook — not `warm.url` (owned by prefetcher).
 */
function useLoopingGif(src: string | undefined, warm: { forSrc: string; url: string } | null): string | undefined {
    const ownedRef = useRef<string | undefined>(undefined)
    const [blobUrl, setBlobUrl] = useState<string | undefined>(() =>
        src && warm?.forSrc === src ? warm.url : undefined
    )
    useEffect(() => {
        ownedRef.current = undefined
        if (!src) {
            setBlobUrl(undefined)
            return
        }
        if (warm?.forSrc === src && warm.url) {
            setBlobUrl(warm.url)
            return
        }
        let cancelled = false
        void prepareLoopingGifUrl(src).then((u) => {
            if (cancelled) {
                revokeIfBlob(u)
                return
            }
            setBlobUrl(u)
            if (u.startsWith("blob:")) ownedRef.current = u
        })
        return () => {
            cancelled = true
            if (ownedRef.current) {
                URL.revokeObjectURL(ownedRef.current)
                ownedRef.current = undefined
            }
        }
    }, [src, warm?.forSrc, warm?.url])
    return blobUrl
}

/**
 * Full `active-img.svg` composition: GIF in the exact circle slot, wire + handset from file, orange dash on wire.
 */
function ActiveCallArtwork({
    heightPx,
    gifSrc,
    warmLoopingGif,
    gifGrayscale,
    cardBackground,
    greyColor,
    accentColor,
    gsap,
    accentLoop,
}: {
    heightPx: number
    gifSrc: string | undefined
    /** Prefetched blob / URL for the same `gifSrc` — skips duplicate fetch when active. */
    warmLoopingGif: { forSrc: string; url: string } | null
    gifGrayscale: boolean
    cardBackground: string
    greyColor: string
    accentColor: string
    gsap: any
    accentLoop: boolean
}) {
    const accentRef = useRef<SVGPathElement>(null)
    const tlRef = useRef<any>(null)
    const warm =
        gifSrc && warmLoopingGif?.forSrc === gifSrc && warmLoopingGif.url ? warmLoopingGif : null
    const loopingGifSrc = useLoopingGif(gifSrc, warm)

    useEffect(() => {
        const path = accentRef.current
        if (!gsap || !path) return

        tlRef.current?.kill()
        tlRef.current = null
        gsap.killTweensOf(path)

        if (!accentLoop) {
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
    }, [accentLoop, gsap, accentColor])

    const vb = VB_ACTIVE_TELE
    const svgW = heightPx * (vb.w / vb.h)
    const sx = svgW / vb.w
    const sy = heightPx / vb.h
    const r = ACTIVE_IMG_PHOTO_RECT
    const photoLeft = r.x * sx
    const photoTop = r.y * sy
    const photoW = r.w * sx
    const photoH = r.h * sy
    const photoRadius = Math.min(photoW, photoH) / 2

    return (
        <div
            style={{
                position: "relative",
                width: svgW,
                height: heightPx,
                flexShrink: 0,
                overflow: "visible",
                lineHeight: 0,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    left: photoLeft,
                    top: photoTop,
                    width: photoW,
                    height: photoH,
                    borderRadius: photoRadius,
                    overflow: "hidden",
                    background: cardBackground,
                    zIndex: 1,
                    boxSizing: "border-box",
                }}
            >
                {loopingGifSrc ? (
                    <img
                        key={loopingGifSrc}
                        src={loopingGifSrc}
                        alt=""
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "50% 50%",
                            display: "block",
                            filter: gifGrayscale ? "grayscale(1)" : "none",
                        }}
                    />
                ) : (
                    <div
                        aria-hidden
                        style={{
                            width: "100%",
                            height: "100%",
                            background:
                                "linear-gradient(145deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.07) 100%)",
                            border: "1px dashed rgba(0,0,0,0.12)",
                            boxSizing: "border-box",
                        }}
                    />
                )}
            </div>
            <svg
                width={svgW}
                height={heightPx}
                viewBox={`0 0 ${vb.w} ${vb.h}`}
                fill="none"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 2,
                    display: "block",
                    overflow: "visible",
                    pointerEvents: "none",
                }}
                aria-hidden
            >
                <path
                    d={PATH_ACTIVE_TELE_WIRE}
                    stroke={greyColor}
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill="none"
                />
                <path d={PATH_ACTIVE_TELE_HANDSET} fill={accentColor} />
                <path
                    ref={accentRef}
                    d={PATH_ACTIVE_TELE_WIRE}
                    stroke={accentColor}
                    strokeWidth={2.8}
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

type SpeakingGlowKey = "Off" | "Subtle" | "Low" | "Dark"

/** Multiplier on voice-synced accent glow (see `talkingGlowLayer`). */
const SPEAKING_GLOW_MULT: Record<SpeakingGlowKey, number> = {
    Off: 0,
    Subtle: 0.5,
    Low: 1.0,
    Dark: 1.28,
}

export default function VoiceAIWidget({
    apiBaseUrl = "https://voice-ai-backend-one.vercel.app",
    agentName = "Madhurima",
    agentSubtitle = "Audio call",
    greetingMessage = "Hey, how can I help you? I'm Madhurima.",
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
    defaultAvatar,
    defaultAvatarSvg = "",
    defaultAvatarSize = 64,
    activeCallAvatar,
    activeCallGifGrayscale = true,
    tooltipText = DEFAULT_TOOLTIP_TEXT,
    tooltipShadow = DEFAULT_TOOLTIP_SHADOW,
    tooltipFont,
    tooltipTextColor = "#6B6B6B",
    tooltipBackgroundColor = "#ffffff",
    tooltipMaxWidth = 220,
    tooltipPadding = "10px 12px",
    tooltipBubbleOffsetX = 0,
    tooltipBubbleOffsetY = 0,
    infoIconStroke = "#8A8A8A",
    infoIconFill = "#8A8A8A",
}: {
    apiBaseUrl?: string
    agentName?: string
    agentSubtitle?: string
    greetingMessage?: string
    accentColor?: string
    loopGreyColor?: string
    defaultCardShadow?: unknown
    activeCardShadow?: unknown
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
    /** Framer Image: default pill portrait / composite (raster). Ignored if `defaultAvatarSvg` is set. */
    defaultAvatar?: unknown
    /** SVG URL or pasted `<svg>…</svg>` for crisp default avatar (default only). */
    defaultAvatarSvg?: string
    defaultAvatarSize?: number
    /** Framer Image: GIF/still **inside the circle only** (telephone + cord = code, from `active-img.svg`). */
    activeCallAvatar?: unknown
    /** When true, `filter: grayscale(1)` on the circle GIF (handset/wire stay full color). */
    activeCallGifGrayscale?: boolean
    tooltipText?: string
    tooltipShadow?: unknown
    tooltipFont?: Record<string, unknown>
    tooltipTextColor?: string
    tooltipBackgroundColor?: string
    tooltipMaxWidth?: number
    tooltipPadding?: string
    /** Horizontal px — moves the bubble only; pointer stays centered on the icon. */
    tooltipBubbleOffsetX?: number
    /** Vertical px — moves the bubble only; pointer stays fixed. Negative = up (avoids top clip). */
    tooltipBubbleOffsetY?: number
    infoIconStroke?: string
    infoIconFill?: string
}) {
    const gsap = useGsap()
    const apiBase = normalizeApiBase(apiBaseUrl)

    const nameFontStyle = framerFontToStyle(defaultNameFont)
    const subtitleFontStyle = framerFontToStyle(defaultSubtitleFont)
    const timerFontStyle = framerFontToStyle(activeTimerFont)
    const tooltipFontStyle = framerFontToStyle(tooltipFont)

    const defaultAvatarSrc = framerImageSrc(defaultAvatar)
    const activeCallAvatarSrc = framerImageSrc(activeCallAvatar)

    const activeGifSrcRef = useRef<string | undefined>(undefined)
    activeGifSrcRef.current = activeCallAvatarSrc
    const prefetchGifInFlightRef = useRef<string | null>(null)
    const [warmLoopingGif, setWarmLoopingGif] = useState<{ forSrc: string; url: string } | null>(null)

    const prefetchActiveCallGif = useCallback(() => {
        const s = activeCallAvatarSrc?.trim()
        if (!s) return
        if (typeof navigator !== "undefined") {
            const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
            if (conn?.saveData) return
        }
        if (prefetchGifInFlightRef.current === s) return
        prefetchGifInFlightRef.current = s
        void prepareLoopingGifUrl(s).then((url) => {
            prefetchGifInFlightRef.current = null
            if (activeGifSrcRef.current !== s) {
                revokeIfBlob(url)
                return
            }
            setWarmLoopingGif((prev) => {
                if (prev?.forSrc === s) {
                    revokeIfBlob(url)
                    return prev
                }
                if (prev?.url.startsWith("blob:")) revokeIfBlob(prev.url)
                return { forSrc: s, url }
            })
        })
    }, [activeCallAvatarSrc])

    useEffect(() => {
        const s = activeCallAvatarSrc?.trim()
        setWarmLoopingGif((prev) => {
            if (!s) {
                if (prev?.url.startsWith("blob:")) revokeIfBlob(prev.url)
                return null
            }
            if (prev && prev.forSrc !== s) {
                if (prev.url.startsWith("blob:")) revokeIfBlob(prev.url)
                return null
            }
            return prev
        })
    }, [activeCallAvatarSrc])

    const defaultSvgTrim = (defaultAvatarSvg ?? "")
        .trim()
        .replace(/^\s*<\?xml[^?]*\?>\s*/i, "")
    const useDefaultSvg = defaultSvgTrim.length > 0
    const defaultSvgIsInline = useDefaultSvg && isInlineSvgMarkup(defaultSvgTrim)
    const defaultSvgInlineHtml = useMemo(
        () => (defaultSvgIsInline ? injectSvgSlotSizing(defaultSvgTrim) : ""),
        [defaultSvgIsInline, defaultSvgTrim]
    )

    const glowMode: SpeakingGlowKey =
        speakingGlowWhileTalking === "Off" ||
        speakingGlowWhileTalking === "Subtle" ||
        speakingGlowWhileTalking === "Low" ||
        speakingGlowWhileTalking === "Dark"
            ? speakingGlowWhileTalking
            : "Subtle"
    const glowStrength = SPEAKING_GLOW_MULT[glowMode] ?? 0.5

    const [phase, setPhase] = useState<"default" | "active">("default")
    const [elapsedSec, setElapsedSec] = useState(0)
    const [isVoiceActive, setIsVoiceActive] = useState(false)
    const [infoTooltipOpen, setInfoTooltipOpen] = useState(false)
    const [defaultCardHovered, setDefaultCardHovered] = useState(false)
    const [endCallHovered, setEndCallHovered] = useState(false)
    const infoTipLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const openInfoTooltip = useCallback(() => {
        if (infoTipLeaveTimerRef.current != null) {
            clearTimeout(infoTipLeaveTimerRef.current)
            infoTipLeaveTimerRef.current = null
        }
        setInfoTooltipOpen(true)
    }, [])

    const scheduleCloseInfoTooltip = useCallback(() => {
        if (infoTipLeaveTimerRef.current != null) clearTimeout(infoTipLeaveTimerRef.current)
        infoTipLeaveTimerRef.current = setTimeout(() => {
            infoTipLeaveTimerRef.current = null
            setInfoTooltipOpen(false)
        }, 200)
    }, [])

    useEffect(() => {
        return () => {
            if (infoTipLeaveTimerRef.current != null) clearTimeout(infoTipLeaveTimerRef.current)
        }
    }, [])
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
        if (phase === "active") setInfoTooltipOpen(false)
    }, [phase])

    useEffect(() => {
        isVoiceActiveRef.current = isVoiceActive
    }, [isVoiceActive])

    useEffect(() => {
        const s = boxShadowToCSS(activeCardShadow).trim()
        idleBaseShadowRef.current = s || DEFAULT_ACTIVE_CARD_SHADOW
    }, [activeCardShadow])

    // Call timer
    useEffect(() => {
        if (phase !== "active") return
        setElapsedSec(0)
        const id = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [phase])

    // Active card entrance — “boop”: small → full with elastic overshoot
    useEffect(() => {
        if (!gsap || !cardRef.current || phase !== "active") return
        const el = cardRef.current
        gsap.killTweensOf(el)
        gsap.fromTo(
            el,
            { scale: 0.78, opacity: 1 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.72,
                ease: "elastic.out(1, 0.52)",
                transformOrigin: "50% 50%",
            }
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
        setEndCallHovered(false)
        prefetchGifInFlightRef.current = null
        setWarmLoopingGif((prev) => {
            if (prev?.url.startsWith("blob:")) revokeIfBlob(prev.url)
            return null
        })
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
        queueMicrotask(() => prefetchActiveCallGif())

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
    }, [apiBase, greetingMessage, playAudioFromBlob, prefetchActiveCallGif])

    const defaultShadow = boxShadowToCSS(defaultCardShadow).trim() || DEFAULT_CARD_SHADOW
    const defaultShadowInteractive = defaultCardHovered
        ? `${defaultShadow}, ${DEFAULT_CARD_SHADOW_HOVER_EXTRA}`
        : defaultShadow
    const defaultCardHeight = defaultAvatarSize + 12

    if (phase === "default") {
        return (
            <div
                role="button"
                tabIndex={0}
                aria-label={`Start audio call with ${agentName}`}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-voice-ai-no-call]")) return
                    startCall()
                }}
                onKeyDown={(e) => {
                    if ((e.target as HTMLElement).closest("[data-voice-ai-no-call]")) return
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        startCall()
                    }
                }}
                onMouseEnter={() => {
                    setDefaultCardHovered(true)
                    prefetchActiveCallGif()
                }}
                onMouseLeave={() => setDefaultCardHovered(false)}
                style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 14,
                    boxShadow: defaultShadowInteractive,
                    background: defaultCardBackground,
                    overflow: "visible",
                    cursor: "pointer",
                    outline: "none",
                    transition: "box-shadow 0.22s ease",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        padding: "6px 32px 6px 8px",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: defaultAvatarSize,
                            height: defaultAvatarSize,
                            flexShrink: 0,
                            alignSelf: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "visible",
                            transform: "translateY(-3px)",
                        }}
                    >
                        {useDefaultSvg || defaultAvatarSrc ? (
                            <>
                                <div
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: defaultAvatarSize,
                                        height: defaultAvatarSize,
                                        borderRadius: "50%",
                                        background: defaultCardBackground,
                                        zIndex: 0,
                                    }}
                                />
                                {useDefaultSvg ? (
                                    defaultSvgIsInline ? (
                                        <span
                                            style={{
                                                position: "relative",
                                                zIndex: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                maxWidth: defaultAvatarSize,
                                                maxHeight: defaultAvatarSize,
                                                lineHeight: 0,
                                                overflow: "visible",
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: defaultSvgInlineHtml,
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={defaultSvgTrim}
                                            alt=""
                                            loading="eager"
                                            decoding="async"
                                            style={{
                                                position: "relative",
                                                zIndex: 1,
                                                maxWidth: defaultAvatarSize,
                                                maxHeight: defaultAvatarSize,
                                                width: "auto",
                                                height: "auto",
                                                objectFit: "contain",
                                                objectPosition: "50% 45%",
                                                display: "block",
                                            }}
                                            draggable={false}
                                        />
                                    )
                                ) : (
                                    <img
                                        src={defaultAvatarSrc}
                                        alt=""
                                        style={{
                                            position: "relative",
                                            zIndex: 1,
                                            maxWidth: defaultAvatarSize,
                                            maxHeight: defaultAvatarSize,
                                            width: "auto",
                                            height: "auto",
                                            objectFit: "contain",
                                            objectPosition: "50% 45%",
                                            display: "block",
                                        }}
                                        draggable={false}
                                    />
                                )}
                            </>
                        ) : (
                            <DefaultLoopVector accentColor={accentColor} height={22} />
                        )}
                    </div>
                    <div
                        style={{
                            textAlign: "left",
                            minWidth: 0,
                            alignSelf: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                ...nameFontStyle,
                                color: defaultNameColor,
                                lineHeight: nameFontStyle.lineHeight ?? 1.08,
                            }}
                        >
                            {agentName}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                columnGap: 4,
                                rowGap: 2,
                                marginTop: 1,
                            }}
                        >
                            <span
                                style={{
                                    ...subtitleFontStyle,
                                    color: defaultSubtitleColor,
                                    lineHeight: subtitleFontStyle.lineHeight ?? 1.12,
                                }}
                            >
                                {agentSubtitle}
                            </span>
                            <div
                                data-voice-ai-no-call
                                style={{
                                    position: "relative",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    flexShrink: 0,
                                    zIndex: 6,
                                    cursor: "default",
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseEnter={openInfoTooltip}
                                onMouseLeave={scheduleCloseInfoTooltip}
                            >
                                <span
                                    role="button"
                                    tabIndex={0}
                                    id="voice-ai-widget-info-trigger"
                                    aria-describedby={
                                        infoTooltipOpen ? "voice-ai-widget-disclaimer" : undefined
                                    }
                                    onFocus={openInfoTooltip}
                                    onBlur={scheduleCloseInfoTooltip}
                                    onKeyDown={(e) => {
                                        e.stopPropagation()
                                        if (e.key === "Escape") setInfoTooltipOpen(false)
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        lineHeight: 0,
                                    }}
                                >
                                    <IconInfoFromAsset
                                        size={13}
                                        stroke={infoIconStroke}
                                        fill={infoIconFill}
                                    />
                                </span>
                                {infoTooltipOpen && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseEnter={openInfoTooltip}
                                        onMouseLeave={scheduleCloseInfoTooltip}
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            bottom: "calc(100% + 8px)",
                                            transform: "translateX(-50%)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            zIndex: 50,
                                            pointerEvents: "auto",
                                        }}
                                    >
                                        <div
                                            id="voice-ai-widget-disclaimer"
                                            role="tooltip"
                                            style={{
                                                ...(tooltipFontStyle as CSSProperties),
                                                maxWidth: tooltipMaxWidth,
                                                width: "max-content",
                                                boxSizing: "border-box",
                                                padding: tooltipPadding,
                                                background: tooltipBackgroundColor,
                                                color: tooltipTextColor,
                                                borderRadius: 10,
                                                boxShadow: boxShadowToCSS(tooltipShadow) || DEFAULT_TOOLTIP_SHADOW,
                                                textAlign: "left",
                                                lineHeight: 1.35,
                                                transform: `translate(${Number(tooltipBubbleOffsetX) || 0}px, ${Number(tooltipBubbleOffsetY) || 0}px)`,
                                            }}
                                        >
                                            {tooltipText}
                                        </div>
                                        <div
                                            aria-hidden
                                            style={{
                                                width: 16,
                                                height: 7,
                                                marginTop: -2,
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                filter: "drop-shadow(0px 3px 3px rgba(0,0,0,0.10))",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 0,
                                                    height: 0,
                                                    marginLeft: 2,
                                                    borderLeft: "6px solid transparent",
                                                    borderRight: "6px solid transparent",
                                                    borderTop: `6px solid ${tooltipBackgroundColor}`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={cardRef}
            style={{
                position: "relative",
                display: "inline-block",
                borderRadius: 14,
                boxShadow: boxShadowToCSS(activeCardShadow).trim() || DEFAULT_ACTIVE_CARD_SHADOW,
                width: "max-content",
                maxWidth: "min(400px, 100%)",
                boxSizing: "border-box",
                overflow: "visible",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    padding: "0px 14px 0px 12px",
                    height: defaultCardHeight,
                    background: activeCardBackground,
                    borderRadius: 14,
                    overflow: "visible",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    <ActiveCallArtwork
                        heightPx={Math.round(defaultAvatarSize * 0.72)}
                        gifSrc={activeCallAvatarSrc}
                        warmLoopingGif={warmLoopingGif}
                        gifGrayscale={activeCallGifGrayscale}
                        cardBackground={activeCardBackground}
                        greyColor={loopGreyColor}
                        accentColor={accentColor}
                        gsap={gsap}
                        accentLoop
                    />
                </div>

                <div
                    style={{
                        ...timerFontStyle,
                        color: activeTimerColor,
                        flexShrink: 0,
                        minWidth: 48,
                        marginLeft: 10,
                        textAlign: (timerFontStyle.textAlign as CSSProperties["textAlign"]) ?? "right",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {formatCallTime(elapsedSec)}
                </div>

                <div style={{ flex: 1, minWidth: 4 }} aria-hidden />

                <button
                    type="button"
                    aria-label="End call"
                    onClick={endCall}
                    onMouseEnter={() => setEndCallHovered(true)}
                    onMouseLeave={() => setEndCallHovered(false)}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: endCallHovered ? END_CALL_BTN_BG_HOVER : END_CALL_BTN_BG,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: activeEndCallIconColor,
                        flexShrink: 0,
                        marginLeft: 10,
                        transition: "background-color 0.15s ease",
                    }}
                >
                    <IconCrossFromAsset size={15} />
                </button>
            </div>

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
        defaultValue: "Hey, how can I help you? I'm Madhurima.",
    },
    agentName: { type: ControlType.String, title: "Name", defaultValue: "Madhurima" },
    agentSubtitle: { type: ControlType.String, title: "Subtitle", defaultValue: "Audio call" },

    accentColor: {
        type: ControlType.Color,
        title: "Accent (handset, glow, wire dash)",
        defaultValue: ACCENT_DEFAULT,
        description: "End call uses **#ED4D17** (fixed) with a darker hover.",
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
        options: ["Off", "Subtle", "Low", "Dark"],
        optionTitles: ["Off", "Subtle", "Low", "Dark"],
        defaultValue: "Subtle",
        description:
            "**Subtle** — light pulse. **Low** — full-strength glow (1.0×). **Dark** — stronger still. **Off** — only **Active · shadows**.",
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
            lineHeight: 1.08,
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
            lineHeight: 1.12,
            textAlign: "left",
            variant: "Regular",
        },
    },
    defaultSubtitleColor: {
        type: ControlType.Color,
        title: "Default · subtitle color",
        defaultValue: SUBTEXT_COLOR,
    },

    defaultAvatar: {
        type: ControlType.Image,
        title: "Default · image",
        description:
            "Raster (PNG/JPG/WebP). Centered in the slot; **`overflow: visible`**, `object-fit: contain`. **Ignored** when **Default · SVG** is set. If both empty, the orange **loop** shows.",
    },
    defaultAvatarSvg: {
        type: ControlType.String,
        title: "Default · SVG",
        defaultValue: "",
        placeholder: "https://…/avatar.svg or paste <svg>…</svg>",
        displayTextArea: true,
        description:
            "Optional **vector** avatar (sharp at any size). Paste **inline `<svg>…</svg>`** or a **URL** to an SVG file / `data:image/svg+xml,…`. Overrides **Default · image** when non-empty.",
    },
    defaultAvatarSize: {
        type: ControlType.Number,
        title: "Avatar size (default + active circle)",
        defaultValue: 64,
        min: 36,
        max: 96,
        step: 1,
        displayStepper: true,
        description: "Diameter of the **default** portrait slot and the **active** GIF circle; `active-img.svg` scales with this value.",
    },

    activeCallAvatar: {
        type: ControlType.Image,
        title: "Active · circle GIF",
        description:
            "Fills the **same slot** as the embedded photo in `Assets-voice/active-img.svg` (rect 37×36, rx 18). Wire + handset stay from that SVG in code; **orange dash** animates on the wire. **Avatar size** sets scale. Empty = dashed placeholder.",
    },
    activeCallGifGrayscale: {
        type: ControlType.Boolean,
        title: "Active · B&W filter on GIF",
        defaultValue: true,
        description:
            "When on, applies **`grayscale(1)`** to the **circle GIF only**; inline handset/wire from `active-img.svg` stay full color.",
    },

    tooltipText: {
        type: ControlType.String,
        title: "Tooltip · text",
        defaultValue: DEFAULT_TOOLTIP_TEXT,
        displayTextArea: true,
    },
    tooltipShadow: {
        type: ControlType.BoxShadow,
        title: "Tooltip · shadow",
        defaultValue: DEFAULT_TOOLTIP_SHADOW,
    },
    tooltipFont: {
        type: ControlType.Font,
        title: "Tooltip · text style",
        controls: "extended",
        defaultFontType: "sans-serif",
        displayTextAlignment: true,
        defaultValue: {
            fontSize: 12,
            letterSpacing: 0,
            lineHeight: 1.35,
            textAlign: "left",
            variant: "Regular",
        },
    },
    tooltipTextColor: {
        type: ControlType.Color,
        title: "Tooltip · text color",
        defaultValue: "#6B6B6B",
    },
    tooltipBackgroundColor: {
        type: ControlType.Color,
        title: "Tooltip · fill",
        defaultValue: "#ffffff",
    },
    tooltipMaxWidth: {
        type: ControlType.Number,
        title: "Tooltip · max width (px)",
        defaultValue: 220,
        min: 140,
        max: 360,
        step: 4,
    },
    tooltipPadding: {
        type: ControlType.String,
        title: "Tooltip · padding (CSS)",
        defaultValue: "10px 12px",
    },
    tooltipBubbleOffsetY: {
        type: ControlType.Number,
        title: "Tooltip · bubble ↑↓ (px)",
        defaultValue: 0,
        min: -120,
        max: 120,
        step: 1,
        displayStepper: true,
        description:
            "Moves the **rounded text box** only; the **▼** pointer stays on the **i** icon. Use **negative** values to shift the bubble **up** when the top is cut off.",
    },
    tooltipBubbleOffsetX: {
        type: ControlType.Number,
        title: "Tooltip · bubble ←→ (px)",
        defaultValue: 0,
        min: -120,
        max: 120,
        step: 1,
        displayStepper: true,
        description: "Slides the bubble horizontally; the pointer stays centered under the icon.",
    },
    infoIconStroke: {
        type: ControlType.Color,
        title: "Info icon · ring color",
        defaultValue: "#8A8A8A",
    },
    infoIconFill: {
        type: ControlType.Color,
        title: "Info icon · “i” fill",
        defaultValue: "#8A8A8A",
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
