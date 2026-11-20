// ============================================================
// Acesso ao banco (Supabase). Todas as telas leem e gravam por aqui.
// Tabelas (veja supabase/schema.sql): eventos, ocorrencias, guardioes.
// Erros viram Error com mensagem em português, para as telas usarem try/catch.
// ============================================================
import { supabase, bancoConfigurado } from './supabase';

function tabela(nome) {
  if (!bancoConfigurado) {
    throw new Error('Banco de dados não configurado. Preencha o arquivo .env e reinicie o app.');
  }
  return supabase.from(nome);
}

// Executa uma consulta do Supabase e devolve só os dados (ou lança erro).
async function executar(consulta) {
  let resposta;
  try {
    resposta = await consulta;
  } catch {
    throw new Error('Não foi possível conectar ao banco de dados.');
  }
  if (resposta.error) {
    throw new Error(resposta.error.message || 'Erro no banco de dados.');
  }
  return resposta.data;
}

// ---------- Eventos da agenda (disfarce) ----------
const hhmm = (t) => (t ? String(t).slice(0, 5) : ''); // "09:00:00" -> "09:00"

const deEvento = (r) => ({
  id: r.id,
  titulo: r.titulo,
  data: r.data,
  horaInicio: hhmm(r.hora_inicio),
  horaFim: hhmm(r.hora_fim),
  local: r.local || '',
  descricao: r.descricao || '',
  cor: r.cor || undefined,
  categoria: r.categoria || undefined,
});

export async function listarEventos() {
  const linhas = await executar(tabela('eventos').select('*').order('data').order('hora_inicio'));
  return linhas.map(deEvento);
}

export async function criarEvento(e) {
  const linha = await executar(
    tabela('eventos')
      .insert({
        titulo: e.titulo,
        data: e.data,
        hora_inicio: e.horaInicio || null,
        hora_fim: e.horaFim || null,
        local: e.local || null,
        descricao: e.descricao || null,
        cor: e.cor || null,
        categoria: e.categoria || null,
      })
      .select()
      .single()
  );
  return deEvento(linha);
}

export const removerEvento = (id) => executar(tabela('eventos').delete().eq('id', id));

// ---------- Ocorrências (Espaço Seguro) ----------
export const listarOcorrencias = () =>
  executar(tabela('ocorrencias').select('*').order('data_ocorrencia', { ascending: false }));

export const criarOcorrencia = (o) =>
  executar(
    tabela('ocorrencias')
      .insert({
        nivel_perigo: o.nivel_perigo,
        descricao: o.descricao || null,
        local: o.local || null,
        data_ocorrencia: new Date().toISOString(),
      })
      .select()
      .single()
  );

export const removerOcorrencia = (id) => executar(tabela('ocorrencias').delete().eq('id', id));

// ---------- Guardiões (contatos de confiança) ----------
export const listarGuardioes = () =>
  executar(
    tabela('guardioes')
      .select('*')
      .order('prioridade', { ascending: false })
      .order('criado_em', { ascending: true })
  );

export async function criarGuardiao(g) {
  // Só um guardião pode ser "Chamar primeiro": ao marcar um novo, desmarca os outros.
  if (g.prioridade) await executar(tabela('guardioes').update({ prioridade: false }).eq('prioridade', true));
  return executar(
    tabela('guardioes')
      .insert({
        nome: g.nome,
        parentesco: g.parentesco || null,
        telefone: g.telefone,
        prioridade: Boolean(g.prioridade),
      })
      .select()
      .single()
  );
}

export async function definirPrioridadeGuardiao(id, prioridade) {
  if (prioridade) await executar(tabela('guardioes').update({ prioridade: false }).eq('prioridade', true));
  await executar(tabela('guardioes').update({ prioridade }).eq('id', id));
}

export const removerGuardiao = (id) => executar(tabela('guardioes').delete().eq('id', id));
