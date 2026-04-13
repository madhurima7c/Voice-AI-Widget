-- Run this in Supabase → SQL Editor before running the ingestion script

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create the documents table
create table if not exists documents (
    id bigserial primary key,
    content text not null,
    source text,
    embedding vector(1536),      -- dimension matches text-embedding-3-small
    created_at timestamptz default now()
);

-- 3. Create an index for fast similarity search
create index if not exists documents_embedding_idx
    on documents
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- 4. Create the match function used by /api/chat
create or replace function match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
returns table (
    id bigint,
    content text,
    source text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        documents.id,
        documents.content,
        documents.source,
        1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where 1 - (documents.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
end;
$$;
