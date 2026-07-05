-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the knowledge base table
create table "public"."knowledge_base" (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    content text not null,
    embedding vector(384), -- Using sentence-transformers/all-MiniLM-L6-v2 which has 384 dimensions
    category text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table "public"."knowledge_base" enable row level security;

-- Only authenticated users can read the knowledge base
create policy "Knowledge base is viewable by authenticated users"
on "public"."knowledge_base" for select
to authenticated
using (true);

-- Only admins can insert/update/delete (assuming role check)
create policy "Knowledge base is editable by admins"
on "public"."knowledge_base" for all
to authenticated
using ( (select role from profiles where id = auth.uid()) = 'admin' );

-- Create a function to search for articles using vector distance (cosine similarity)
create or replace function match_articles (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_base.id,
    knowledge_base.title,
    knowledge_base.content,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;
