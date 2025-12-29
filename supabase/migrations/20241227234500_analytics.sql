-- Create analytics_visits table
alter table posts add column if not exists view_count int default 0;

create table if not exists analytics_visits (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete set null,
  page_path text not null,
  visitor_hash text,
  view_duration int default 0,
  referrer text,
  device_type text,
  browser text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_analytics_post_id on analytics_visits(post_id);
create index if not exists idx_analytics_created_at on analytics_visits(created_at);
create index if not exists idx_analytics_visitor_hash on analytics_visits(visitor_hash);

-- Enable RLS
alter table analytics_visits enable row level security;

-- Policies
create policy "Anonymous can insert visits" 
on analytics_visits for insert 
to anon, authenticated 
with check (true);

create policy "Admins can view visits" 
on analytics_visits for select 
to authenticated 
using (
    exists (
        select 1 from profiles 
        where profiles.id = auth.uid() 
        and profiles.role = 'admin'
    )
);


-- Function to record visit and increment counter atomically
create or replace function record_visit(
  p_post_id uuid,
  p_path text,
  p_hash text,
  p_referrer text,
  p_device text,
  p_browser text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  -- Insert visit
  insert into analytics_visits (post_id, page_path, visitor_hash, referrer, device_type, browser)
  values (p_post_id, p_path, p_hash, p_referrer, p_device, p_browser)
  returning id into v_id;

  -- Increment post view count if post_id is present
  if p_post_id is not null then
    update posts set view_count = coalesce(view_count, 0) + 1 where id = p_post_id;
  end if;

  return v_id;
end;
$$;

-- Function to increment view duration (heartbeat)
create or replace function increment_view_duration(visit_id uuid, seconds int)
returns void
language plpgsql
security definer
as $$
begin
  update analytics_visits
  set view_duration = view_duration + seconds
  where id = visit_id;
end;
$$;
