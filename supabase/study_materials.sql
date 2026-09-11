create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  youtube_url text,
  forms_url text,
  chapter text not null default '2-1',
  user_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.study_materials
add column if not exists youtube_url text;

alter table public.study_materials
add column if not exists forms_url text;

alter table public.study_materials enable row level security;

create policy "authenticated can read study_materials"
on public.study_materials
for select
to authenticated
using (true);

create policy "admin can insert study_materials"
on public.study_materials
for insert
to authenticated
with check (auth.jwt() ->> 'email' = 'kanri@example.com');

create policy "admin can delete study_materials"
on public.study_materials
for delete
to authenticated
using (auth.jwt() ->> 'email' = 'kanri@example.com');

insert into storage.buckets (id, name, public)
values ('study-images', 'study-images', true)
on conflict (id) do nothing;

create policy "public can read study-images"
on storage.objects
for select
to public
using (bucket_id = 'study-images');

create policy "admin can upload study-images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'study-images'
  and auth.jwt() ->> 'email' = 'kanri@example.com'
);

create policy "admin can delete study-images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'study-images'
  and auth.jwt() ->> 'email' = 'kanri@example.com'
);
