// scripts/ingest.ts
// RAG Knowledge Base Ingestion Script
//
// Run with: npm run ingest
//
// What it does:
//   1. Reads all files from knowledge-base/ folder (resume, bio, projects, personality)
//   2. Optionally fetches README files from your GitHub repos
//   3. Chunks text into ~500-token segments with overlap
//   4. Embeds each chunk with OpenAI text-embedding-3-small
//   5. Upserts vectors into Supabase pgvector table
//
// Before running:
//   - Create knowledge-base/ folder with your content files (see README)
//   - Run the Supabase SQL setup (see README)
//   - Fill in your .env.local

import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import OpenAI from "openai"

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true })
dotenv.config({ quiet: true })

// ── Config ────────────────────────────────────────────────────

const CHUNK_SIZE = 500        // tokens (approximate via chars/4)
const CHUNK_OVERLAP = 80      // overlap between chunks
const EMBEDDING_MODEL = "text-embedding-3-small"
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "knowledge-base")

// GitHub repos to pull READMEs from (add your repos here)
const GITHUB_REPOS: string[] = [
    // "your-github-username/repo-name-1",
    // "your-github-username/repo-name-2",
]

function getOpenAI(): OpenAI {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY is missing — add it to .env.local")
    return new OpenAI({ apiKey: key })
}

function getSupabase(): SupabaseClient {
    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY
    if (!url || !serviceKey) {
        throw new Error("SUPABASE_URL or SUPABASE_SERVICE_KEY is missing — add them to .env.local")
    }
    return createClient(url, serviceKey)
}

// ── Helpers ───────────────────────────────────────────────────

function chunkText(text: string, source: string): { content: string; source: string }[] {
    const chunks: { content: string; source: string }[] = []
    const charChunkSize = CHUNK_SIZE * 4
    const charOverlap = CHUNK_OVERLAP * 4

    // Split on paragraph boundaries first for cleaner chunks
    const paragraphs = text.split(/\n\n+/)
    let currentChunk = ""

    for (const para of paragraphs) {
        if ((currentChunk + para).length > charChunkSize && currentChunk.length > 0) {
            chunks.push({ content: currentChunk.trim(), source })
            // Keep overlap from the end of current chunk
            currentChunk = currentChunk.slice(-charOverlap) + "\n\n" + para
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + para
        }
    }
    if (currentChunk.trim()) {
        chunks.push({ content: currentChunk.trim(), source })
    }

    return chunks
}

async function embedChunks(
    openai: OpenAI,
    chunks: { content: string; source: string }[]
) {
    const results = []
    // Batch in groups of 20 to respect rate limits
    for (let i = 0; i < chunks.length; i += 20) {
        const batch = chunks.slice(i, i + 20)
        const texts = batch.map((c) => c.content)

        const res = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: texts,
        })

        for (let j = 0; j < batch.length; j++) {
            results.push({
                content: batch[j].content,
                source: batch[j].source,
                embedding: res.data[j].embedding,
            })
        }

        console.log(`  Embedded ${Math.min(i + 20, chunks.length)}/${chunks.length} chunks...`)
    }
    return results
}

async function fetchGithubReadme(repo: string): Promise<string | null> {
    try {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github.raw",
        }
        if (process.env.GITHUB_TOKEN) {
            headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
        }

        const res = await fetch(
            `https://api.github.com/repos/${repo}/readme`,
            { headers }
        )
        if (!res.ok) return null
        return await res.text()
    } catch {
        return null
    }
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
    console.log("🚀 Starting knowledge base ingestion...\n")

    const openai = getOpenAI()
    const supabase = getSupabase()

    const allChunks: { content: string; source: string }[] = []

    // ── 1. Read local knowledge-base files
    if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
        const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter((f) =>
            [".txt", ".md"].includes(path.extname(f).toLowerCase())
        )

        for (const file of files) {
            const filePath = path.join(KNOWLEDGE_BASE_DIR, file)
            const content = fs.readFileSync(filePath, "utf-8")
            const chunks = chunkText(content, `file:${file}`)
            allChunks.push(...chunks)
            console.log(`📄 ${file}: ${chunks.length} chunks`)
        }
    } else {
        console.warn(`⚠️  knowledge-base/ folder not found. Create it and add your content files.`)
    }

    // ── 2. Fetch GitHub READMEs
    if (GITHUB_REPOS.length > 0) {
        console.log("\n📦 Fetching GitHub READMEs...")
        for (const repo of GITHUB_REPOS) {
            const readme = await fetchGithubReadme(repo)
            if (readme) {
                const chunks = chunkText(readme, `github:${repo}`)
                allChunks.push(...chunks)
                console.log(`  ✓ ${repo}: ${chunks.length} chunks`)
            } else {
                console.log(`  ✗ ${repo}: Could not fetch README`)
            }
        }
    }

    if (allChunks.length === 0) {
        console.error("\n❌ No content to ingest. Add files to knowledge-base/ folder.")
        process.exit(1)
    }

    console.log(`\n📊 Total chunks to embed: ${allChunks.length}`)

    // ── 3. Embed all chunks
    console.log("\n🔮 Generating embeddings...")
    const embedded = await embedChunks(openai, allChunks)

    // ── 4. Upsert into Supabase
    console.log("\n💾 Upserting into Supabase...")

    // Clear existing documents first (re-ingestion wipes old data)
    const { error: deleteError } = await supabase.from("documents").delete().neq("id", 0)
    if (deleteError) {
        console.warn("  Warning: Could not clear old documents:", deleteError.message)
    }

    // Insert in batches of 50
    for (let i = 0; i < embedded.length; i += 50) {
        const batch = embedded.slice(i, i + 50)
        const { error } = await supabase.from("documents").insert(
            batch.map((doc) => ({
                content: doc.content,
                source: doc.source,
                embedding: doc.embedding,
            }))
        )
        if (error) {
            console.error("  ❌ Insert error:", error.message)
        } else {
            console.log(`  Inserted ${Math.min(i + 50, embedded.length)}/${embedded.length}`)
        }
    }

    console.log("\n✅ Ingestion complete!")
    console.log(`   ${embedded.length} chunks stored in Supabase`)
}

main().catch((err) => {
    console.error("Fatal error:", err)
    process.exit(1)
})
