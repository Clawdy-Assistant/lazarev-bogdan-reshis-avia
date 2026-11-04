create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  verified_at timestamptz,
  failed_logins integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists email_codes (
  user_id uuid primary key references users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions(user_id);

create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits integer not null
);
