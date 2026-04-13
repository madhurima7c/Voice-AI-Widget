export default function Home() {
    return (
        <main>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Voice AI backend</h1>
            <p style={{ color: "#444", maxWidth: 520, lineHeight: 1.5 }}>
                This deployment only exposes API routes for the Framer voice widget. A 404 on the homepage was
                normal before; you’re seeing this page now so Vercel preview isn’t confusing.
            </p>
            <ul style={{ marginTop: 16 }}>
                <li>
                    <code>/api/chat</code> — RAG + reply
                </li>
                <li>
                    <code>/api/speak</code> — text → audio
                </li>
                <li>
                    <code>/api/transcribe</code> — audio → text
                </li>
            </ul>
            <p style={{ marginTop: 24, fontSize: 14, color: "#666" }}>
                In Framer, set <strong>API Base URL</strong> to this site’s origin (no <code>/api</code> suffix).
            </p>
        </main>
    )
}
