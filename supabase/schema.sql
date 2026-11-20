-- Esquema do banco do Agenda Inteligente (Supabase / Postgres).
-- Rode uma vez em: Supabase > SQL Editor > New query > Run.
-- É seguro rodar de novo: usa "if not exists" e recria as políticas.

create table if not exists public.guardioes (
  id bigint generated always as identity primary key,
  nome text not null,
  parentesco text,
  telefone text not null,
  prioridade boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.ocorrencias (
  id bigint generated always as identity primary key,
  data_ocorrencia timestamptz not null default now(),
  tipo_violencia text,
  local text,
  descricao text,
  nivel_perigo smallint not null check (nivel_perigo between 1 and 10),
  criado_em timestamptz not null default now()
);

create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  titulo text not null,
  data date not null,
  hora_inicio time,
  hora_fim time,
  local text,
  descricao text,
  cor text,
  categoria text
);

alter table public.guardioes   enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.eventos     enable row level security;

-- ATENÇÃO (protótipo acadêmico): o app não tem login, então estas políticas
-- liberam leitura e escrita para quem tiver a chave pública (anon).
-- Em produção, use autenticação e políticas por usuário (auth.uid()).
drop policy if exists "proto_guardioes"   on public.guardioes;
drop policy if exists "proto_ocorrencias" on public.ocorrencias;
drop policy if exists "proto_eventos"     on public.eventos;

create policy "proto_guardioes"   on public.guardioes   for all to anon using (true) with check (true);
create policy "proto_ocorrencias" on public.ocorrencias for all to anon using (true) with check (true);
create policy "proto_eventos"     on public.eventos     for all to anon using (true) with check (true);
