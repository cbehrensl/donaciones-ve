create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  city text,
  region text,
  country text,
  is_mobile boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;
-- No public read/write access. Solamente inserciones mediante service role o un webhook seguro.
