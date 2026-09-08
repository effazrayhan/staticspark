-- Static Spark: Supabase schema
-- Run this once in the Supabase SQL editor.

create table if not exists cards (
  id bigint generated always as identity primary key,
  quote text not null,
  author text,
  image_path text not null,       -- path inside the 'cards' storage bucket
  position int not null default 0, -- drag/drop order, lower = posts first
  status text not null default 'ready', -- ready | posted
  posted_platforms jsonb not null default '[]', -- e.g. ["facebook","instagram","threads"]
  created_at timestamptz not null default now(),
  posted_at timestamptz
);

create index if not exists cards_status_position_idx on cards (status, position);

-- Storage bucket for rendered card PNGs. Create via dashboard or:
-- select storage.create_bucket('cards', public := true);
