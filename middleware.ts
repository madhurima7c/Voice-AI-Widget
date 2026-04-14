import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** CORS for Framer (browser) → Vercel API. Preflight must return 204 or fetch fails silently in the widget. */
const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
}

export function middleware(request: NextRequest) {
    if (!request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next()
    }
    if (request.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: cors })
    }
    const res = NextResponse.next()
    Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v))
    return res
}

export const config = {
    matcher: "/api/:path*",
}
