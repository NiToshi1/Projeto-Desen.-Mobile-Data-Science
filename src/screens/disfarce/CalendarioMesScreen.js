import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderGoogleCalendar from '../../components/HeaderGoogleCalendar';
import GoogleCalendarDrawerModal from './GoogleCalendarDrawerModal';
import ConfiguracoesDisfarceModal from './ConfiguracoesDisfarceModal';
import NovoEventoModal from './NovoEventoModal';
import DetalheEventoModal from './DetalheEventoModal';
import {
  gradeDoMes,
  hoje,
  inicioDaSemana,
  mesmoDia,
  paraIso,
  deIso,
  rotuloDia,
  rotuloIntervalo,
  somarDias,
  somarMeses,
  tituloMes,
} from '../../utils/datas';

// ============================================================
// Tela 1: Calendário (Disfarce) — reproduz o Google Agenda.
// Visualizações: Programação, Dia, 3 Dias, Semana e Mês.
// Setas e botão "Hoje" navegam; a busca procura em todos os eventos;
// as categorias do menu lateral (Minhas agendas) mostram/ocultam eventos.
// Permite abrir menu lateral, novo evento, detalhes e configurações (PIN 1234).
// ============================================================

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const porDataEHora = (a, b) =>
  a.data === b.data
    ? (a.horaInicio || '').localeCompare(b.horaInicio || '')
    : a.data.localeCompare(b.data);

function CartaoEvento({ evento, aoAbrir, mostrarData }) {
  const cor = evento.cor || '#1A73E8';
  return (
    <TouchableOpacity
      style={[styles.cartaoEvento, { borderLeftColor: cor }]}
      onPress={() => aoAbrir(evento)}
      activeOpacity={0.8}
    >
      <View style={styles.eventoInfo}>
        <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
        <View style={styles.eventoLinha}>
          <Ionicons name="time-outline" size={14} color="#5F6368" />
          <Text style={styles.eventoHorario}>
            {mostrarData ? `${rotuloDia(deIso(evento.data))} · ` : ''}
            {evento.horaInicio || '--:--'} - {evento.horaFim || '--:--'}
          </Text>
        </View>
        {evento.local ? (
          <View style={styles.eventoLinha}>
            <Ionicons name="location-outline" size={14} color="#5F6368" />
            <Text style={styles.eventoLocal} numberOfLines={1}>
              {evento.local}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.categoriaBadge, { backgroundColor: `${cor}15` }]}>
        <Text style={[styles.categoriaTexto, { color: cor }]}>{evento.categoria || 'Geral'}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Um dia com os seus eventos (usado em Dia, 3 Dias, Semana e abaixo da grade do mês).
function SecaoDia({ data, eventos, aoAbrir, aoEscolher, vazioDetalhado }) {
  const ehHoje = mesmoDia(data, hoje());
  return (
    <View style={styles.secaoEventos}>
      <TouchableOpacity
        style={styles.secaoTituloContainer}
        onPress={aoEscolher}
        disabled={!aoEscolher}
        activeOpacity={0.7}
      >
        <Text style={[styles.secaoTitulo, ehHoje && styles.secaoTituloHoje]}>
          {rotuloDia(data)}
          {ehHoje ? ' · Hoje' : ''}
        </Text>
        <Text style={styles.secaoContador}>
          {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </TouchableOpacity>

      {eventos.length === 0 ? (
        vazioDetalhado ? (
          <View style={styles.semEventosCard}>
            <Ionicons name="sunny-outline" size={32} color="#9AA0A6" />
            <Text style={styles.semEventosTexto}>Nenhum evento agendado para este dia</Text>
            <Text style={styles.semEventosSub}>Toque no botão + para criar um novo compromisso</Text>
          </View>
        ) : (
          <Text style={styles.semEventosLinha}>Sem eventos</Text>
        )
      ) : (
        eventos.map((ev) => <CartaoEvento key={ev.id} evento={ev} aoAbrir={aoAbrir} />)
      )}
    </View>
  );
}

export default function CalendarioMesScreen({ navigation = {} }) {
  const todosEventos = useSelector((state) => state.agenda.eventos);

  const [dataFoco, setDataFoco] = useState(hoje);
  const [visualizacao, setVisualizacao] = useState('Mês');
  const [categoriasOcultas, setCategoriasOcultas] = useState([]);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termo, setTermo] = useState('');

  const [menuAberto, setMenuAberto] = useState(false);
  const [configuracoesAbertas, setConfiguracoesAbertas] = useState(false);
  const [novoEventoAberto, setNovoEventoAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  // Só os eventos das agendas (categorias) que estão marcadas, em ordem de data e hora.
  const eventos = useMemo(
    () =>
      todosEventos
        .filter((ev) => !categoriasOcultas.includes(ev.categoria))
        .slice()
        .sort(porDataEHora),
    [todosEventos, categoriasOcultas]
  );

  const eventosDoDia = (data) => eventos.filter((ev) => ev.data === paraIso(data));
  const datasComEvento = useMemo(() => new Set(eventos.map((ev) => ev.data)), [eventos]);

  // Anterior / próximo respeitam a visualização: mês pula 1 mês, semana 7 dias etc.
  const mover = (sentido) => {
    switch (visualizacao) {
      case 'Mês':
        return setDataFoco((d) => somarMeses(d, sentido));
      case 'Semana':
        return setDataFoco((d) => somarDias(d, 7 * sentido));
      case '3 Dias':
        return setDataFoco((d) => somarDias(d, 3 * sentido));
      default:
        return setDataFoco((d) => somarDias(d, sentido));
    }
  };

  const alternarCategoria = (categoria) =>
    setCategoriasOcultas((atuais) =>
      atuais.includes(categoria) ? atuais.filter((c) => c !== categoria) : [...atuais, categoria]
    );

  const fecharBusca = () => {
    setBuscaAberta(false);
    setTermo('');
  };

  const rotuloPeriodo = (() => {
    if (visualizacao === 'Mês') return 'Mês';
    if (visualizacao === 'Semana') {
      const ini = inicioDaSemana(dataFoco);
      return rotuloIntervalo(ini, somarDias(ini, 6));
    }
    if (visualizacao === '3 Dias') return rotuloIntervalo(dataFoco, somarDias(dataFoco, 2));
    if (visualizacao === 'Programação') return `A partir de ${rotuloIntervalo(dataFoco, dataFoco).split(' – ')[0]}`;
    return rotuloDia(dataFoco);
  })();

  const termoLimpo = termo.trim().toLowerCase();
  const resultadosBusca = termoLimpo
    ? eventos.filter((ev) =>
        [ev.titulo, ev.local, ev.descricao, ev.categoria]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(termoLimpo))
      )
    : [];

  const abrirEvento = (ev) => setEventoSelecionado(ev);

  const renderConteudo = () => {
    if (buscaAberta && termoLimpo) {
      return (
        <View style={styles.secaoEventos}>
          <Text style={styles.secaoTitulo}>
            {resultadosBusca.length} {resultadosBusca.length === 1 ? 'resultado' : 'resultados'}
          </Text>
          <View style={{ height: 12 }} />
          {resultadosBusca.map((ev) => (
            <CartaoEvento key={ev.id} evento={ev} aoAbrir={abrirEvento} mostrarData />
          ))}
          {resultadosBusca.length === 0 && (
            <Text style={styles.semEventosLinha}>Nenhum evento encontrado.</Text>
          )}
        </View>
      );
    }

    if (visualizacao === 'Mês') {
      return (
        <>
          <View style={styles.linhaDiasSemana}>
            {DIAS_SEMANA.map((dia, idx) => (
              <Text key={idx} style={styles.textoDiaSemana}>
                {dia}
              </Text>
            ))}
          </View>
          <View style={styles.gradeMes}>
            {gradeDoMes(dataFoco).map((data, index) => {
              if (!data) return <View key={`v${index}`} style={styles.celulaVazia} />;
              const selecionado = mesmoDia(data, dataFoco);
              const ehHoje = mesmoDia(data, hoje());
              return (
                <TouchableOpacity
                  key={paraIso(data)}
                  style={[
                    styles.celulaDia,
                    ehHoje && !selecionado && styles.celulaHoje,
                    selecionado && styles.celulaSelecionada,
                  ]}
                  onPress={() => setDataFoco(data)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.textoDia,
                      ehHoje && !selecionado && styles.textoDiaHoje,
                      selecionado && styles.textoDiaSelecionado,
                    ]}
                  >
                    {data.getDate()}
                  </Text>
                  {datasComEvento.has(paraIso(data)) && (
                    <View
                      style={[styles.marcadorEvento, selecionado && styles.marcadorEventoSelecionado]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <SecaoDia
            data={dataFoco}
            eventos={eventosDoDia(dataFoco)}
            aoAbrir={abrirEvento}
            vazioDetalhado
          />
        </>
      );
    }

    if (visualizacao === 'Programação') {
      const proximos = eventos.filter((ev) => ev.data >= paraIso(dataFoco));
      const datas = [...new Set(proximos.map((ev) => ev.data))];
      if (datas.length === 0) {
        return (
          <View style={styles.secaoEventos}>
            <View style={styles.semEventosCard}>
              <Ionicons name="calendar-outline" size={32} color="#9AA0A6" />
              <Text style={styles.semEventosTexto}>Nenhum evento a partir desta data</Text>
              <Text style={styles.semEventosSub}>Toque no botão + para criar um novo compromisso</Text>
            </View>
          </View>
        );
      }
      return datas.map((iso) => (
        <SecaoDia
          key={iso}
          data={deIso(iso)}
          eventos={proximos.filter((ev) => ev.data === iso)}
          aoAbrir={abrirEvento}
        />
      ));
    }

    const quantidade = visualizacao === 'Dia' ? 1 : visualizacao === '3 Dias' ? 3 : 7;
    const inicio = visualizacao === 'Semana' ? inicioDaSemana(dataFoco) : dataFoco;
    return Array.from({ length: quantidade }, (_, i) => {
      const data = somarDias(inicio, i);
      return (
        <SecaoDia
          key={paraIso(data)}
          data={data}
          eventos={eventosDoDia(data)}
          aoAbrir={abrirEvento}
          aoEscolher={quantidade > 1 ? () => setDataFoco(data) : undefined}
          vazioDetalhado={quantidade === 1}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGoogleCalendar
        navigation={navigation}
        titulo={tituloMes(dataFoco)}
        aoAbrirMenu={() => setMenuAberto(true)}
        aoAbrirPerfil={() => setConfiguracoesAbertas(true)}
        aoBuscar={() => (buscaAberta ? fecharBusca() : setBuscaAberta(true))}
        aoIrParaHoje={() => setDataFoco(hoje())}
      />

      {buscaAberta ? (
        <View style={styles.barraBusca}>
          <Ionicons name="search" size={18} color="#5F6368" />
          <TextInput
            style={styles.inputBusca}
            value={termo}
            onChangeText={setTermo}
            placeholder="Buscar eventos"
            placeholderTextColor="#9AA0A6"
            autoFocus
          />
          <TouchableOpacity onPress={fecharBusca} hitSlop={10}>
            <Ionicons name="close" size={20} color="#5F6368" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.barraPeriodo}>
          <TouchableOpacity onPress={() => mover(-1)} hitSlop={10} style={styles.setaPeriodo}>
            <Ionicons name="chevron-back" size={22} color="#5F6368" />
          </TouchableOpacity>
          <View style={styles.rotuloPeriodoCaixa}>
            <Text style={styles.rotuloPeriodoVisao}>{visualizacao}</Text>
            {visualizacao !== 'Mês' && <Text style={styles.rotuloPeriodoTexto}>{rotuloPeriodo}</Text>}
          </View>
          <TouchableOpacity onPress={() => mover(1)} hitSlop={10} style={styles.setaPeriodo}>
            <Ionicons name="chevron-forward" size={22} color="#5F6368" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {renderConteudo()}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Botão Flutuante (FAB) do Google Calendar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setNovoEventoAberto(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modais de Suporte do Disfarce */}
      <GoogleCalendarDrawerModal
        visivel={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        aoAbrirConfiguracoes={() => setConfiguracoesAbertas(true)}
        visualizacaoAtual={visualizacao}
        aoSelecionarVisualizacao={setVisualizacao}
        categoriasOcultas={categoriasOcultas}
        aoAlternarCategoria={alternarCategoria}
      />

      <ConfiguracoesDisfarceModal
        visivel={configuracoesAbertas}
        aoFechar={() => setConfiguracoesAbertas(false)}
      />

      {/* A key remonta o modal a cada abertura: a data volta a ser o dia selecionado e os campos limpam. */}
      <NovoEventoModal
        key={`${paraIso(dataFoco)}-${novoEventoAberto}`}
        visivel={novoEventoAberto}
        dataPadrao={paraIso(dataFoco)}
        aoFechar={() => setNovoEventoAberto(false)}
      />

      <DetalheEventoModal
        evento={eventoSelecionado}
        visivel={!!eventoSelecionado}
        aoFechar={() => setEventoSelecionado(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  conteudo: {
    flex: 1,
  },
  barraPeriodo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  setaPeriodo: {
    padding: 8,
    borderRadius: 20,
  },
  rotuloPeriodoCaixa: {
    alignItems: 'center',
  },
  rotuloPeriodoVisao: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A73E8',
  },
  rotuloPeriodoTexto: {
    fontSize: 12,
    color: '#5F6368',
  },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginVertical: 8,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F3F4',
  },
  inputBusca: {
    flex: 1,
    fontSize: 14,
    color: '#202124',
  },
  linhaDiasSemana: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  textoDiaSemana: {
    fontSize: 12,
    fontWeight: '600',
    color: '#70757A',
    width: 36,
    textAlign: 'center',
  },
  gradeMes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  celulaVazia: {
    width: `${100 / 7}%`,
    height: 44,
  },
  celulaDia: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginVertical: 2,
  },
  celulaHoje: {
    borderWidth: 1.5,
    borderColor: '#1A73E8',
  },
  celulaSelecionada: {
    backgroundColor: '#1A73E8',
  },
  textoDia: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
  },
  textoDiaHoje: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  textoDiaSelecionado: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  marcadorEvento: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A73E8',
    marginTop: 2,
  },
  marcadorEventoSelecionado: {
    backgroundColor: '#FFFFFF',
  },
  secaoEventos: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  secaoTituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
  },
  secaoTituloHoje: {
    color: '#1A73E8',
  },
  secaoContador: {
    fontSize: 12,
    color: '#70757A',
  },
  semEventosCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 6,
  },
  semEventosTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4043',
    marginTop: 10,
  },
  semEventosSub: {
    fontSize: 12,
    color: '#70757A',
    marginTop: 4,
    textAlign: 'center',
  },
  semEventosLinha: {
    fontSize: 13,
    color: '#9AA0A6',
    marginBottom: 8,
  },
  cartaoEvento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventoInfo: {
    flex: 1,
    gap: 4,
  },
  eventoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
  },
  eventoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventoHorario: {
    fontSize: 13,
    color: '#5F6368',
  },
  eventoLocal: {
    fontSize: 12,
    color: '#70757A',
  },
  categoriaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
