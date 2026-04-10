-- Enable RLS (example policies for Supabase/Postgres)
alter table if exists portfolio enable row level security;
alter table if exists paper_order enable row level security;
alter table if exists paper_trade enable row level security;
alter table if exists research_summary enable row level security;

create policy if not exists portfolio_owner_select on portfolio
for select using (user_id = auth.uid());

create policy if not exists portfolio_owner_modify on portfolio
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Service role must be restricted to controlled maintenance jobs only.
