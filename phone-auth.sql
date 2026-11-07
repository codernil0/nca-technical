-- Run once in the Supabase SQL Editor.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.admin_email_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.admin_email_allowlist enable row level security;
revoke all on public.admin_email_allowlist from anon, authenticated;
insert into public.admin_email_allowlist (email)
values ('thecodernca@gmail.com')
on conflict (email) do nothing;

create or replace function public.assign_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role text := 'user';
begin
  if exists (
    select 1 from public.admin_email_allowlist
    where lower(email) = lower(new.email)
  ) then
    assigned_role := 'admin';
  end if;
  insert into public.user_roles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
  after insert on auth.users
  for each row execute procedure public.assign_default_user_role();

-- Remove the former phone-based admin allowlist, if present.
drop table if exists public.admin_phone_allowlist;

-- Ensure only the approved email has the administrator role.
update public.user_roles ur
set role = case when exists (
  select 1 from auth.users u
  join public.admin_email_allowlist a on lower(a.email) = lower(u.email)
  where u.id = ur.user_id
) then 'admin' else 'user' end;
