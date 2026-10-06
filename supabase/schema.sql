-- ScamShield 서버 저장 설계안 (Supabase/Postgres)
-- 현재 MVP는 기록을 브라우저(localStorage)에만 저장하며 이 스키마를 쓰지 않는다.
-- 기기 간 동기화가 필요해지면 lib/storage.ts와 같은 인터페이스로 이 테이블을 붙인다.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null default '데모 사용자',
  created_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id) on delete cascade,
  -- 개인정보 보호: 원문 전체 대신 마스킹된 미리보기를 저장
  preview text not null,
  score int not null check (score between 0 and 100),
  level text not null check (level in ('low', 'caution', 'high', 'very-high')),
  scam_type text not null,
  source text not null default 'text' check (source in ('text', 'image')),
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists risk_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  matches jsonb not null default '[]'::jsonb
);

create table if not exists safety_guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  phrases jsonb not null default '[]'::jsonb,
  tip text not null
);

create table if not exists saved_guides (
  user_id uuid not null references users (id) on delete cascade,
  guide_id uuid not null references safety_guides (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, guide_id)
);

create index if not exists analyses_user_created_idx on analyses (user_id, created_at desc);
create index if not exists risk_signals_analysis_idx on risk_signals (analysis_id);
