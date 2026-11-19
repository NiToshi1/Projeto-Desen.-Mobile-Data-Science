# Guia do Fernando — passo a passo

Este guia leva você, do começo ao fim, pelas partes que são suas no projeto **Agenda Inteligente**.
Cada parte termina com um **commit seu**. Siga na ordem. Tempo total estimado: **3 a 4 horas**.

> **Todo o código deste guia foi testado** (TypeScript, lint, 19 testes da API e uso real no navegador).
> Se algo não bater com o que está escrito aqui, **pare e avise o Nicolas** em vez de improvisar.

| Parte | O que você faz | Commit |
|---|---|---|
| 0 | Preparar o computador e rodar o projeto | — |
| 1 | Cadastro e exclusão de **serviços de apoio** na tela (fecha o seu CRUD) | `Adiciona cadastro e exclusão de serviços de apoio` |
| 2 | Fazer confirmações e avisos funcionarem **no navegador** | `Corrige alertas e confirmações no navegador` |
| 3 | Testes automáticos dos seus CRUDs (serviços e eventos) | `Adiciona testes da API de serviços e eventos` |
| 4 | Notebook: rodar, conferir e escrever a análise com suas palavras (+ terceiro modelo, opcional) | `Revisa análise exploratória e modelagem no notebook` |
| 5 | Atualizar o Kanban (já criado no GitHub Projects) e gerar a imagem | `Adiciona imagem do Kanban` |
| 6 | Registrar o seu uso de IA no `USO_IA.md` | `Registra uso de IA do Fernando` |
| 7 | Enviar tudo para o GitHub | — |

**O que é seu no projeto** (conforme a matriz de responsabilidades do `README.md`): os CRUDs de **Contatos, Serviços de apoio e Eventos**,
e no notebook a **análise exploratória, a modelagem e a avaliação**.

---

## Antes de você começar (quem faz: Nicolas)

O Nicolas precisa ter feito **commit e push** de tudo que está pronto até agora. Se você clonar antes, vai faltar código (o Data Science,
o card do app e este guia). Confirme com ele: o último commit no GitHub deve ser posterior ao de hoje, 18/11.

Enquanto você trabalha, o Nicolas **não mexe** em `data-science/notebook.ipynb`, `api/test/` e `src/screens/seguro/EspacoSeguroScreen.js`,
para os dois não gerarem conflito.

---

## Parte 0 — Preparar o computador

### 0.1 O que precisa estar instalado

| Programa | Para quê | Como conferir |
|---|---|---|
| **Git** | versionar | `git --version` |
| **Node.js 20 ou mais novo** (já vem com o `npm`) | app e API | `node --version` |
| **Python 3.10 ou mais novo** | só o notebook (Parte 4) | `python --version` |

Use o terminal que preferir (PowerShell, Git Bash ou o terminal do VS Code).

### 0.2 Aceitar o convite do GitHub

O Nicolas precisa ter te convidado como colaborador (Settings → Collaborators). Abra o e-mail ou as notificações do GitHub e **aceite o convite**.
Sem isso você não consegue enviar (push).

### 0.3 Baixar o projeto

```bash
git clone https://github.com/NiToshi1/Projeto-Desen.-Mobile-Data-Science.git
cd Projeto-Desen.-Mobile-Data-Science
```

### 0.4 Configurar seu nome e e-mail no Git

**Isso é o mais importante para o seu commit contar como seu.** O e-mail tem que ser o mesmo da sua conta do GitHub
(ou o e-mail `noreply` do GitHub, que aparece em Settings → Emails).

```bash
git config user.name "Fernando Vinicius"
git config user.email "SEU_EMAIL_DO_GITHUB"
git config user.email        # confira se mostrou o e-mail certo
```

### 0.5 Criar a sua branch

Assim o seu trabalho fica separado até você enviar.

```bash
git checkout -b fernando/servicos-testes-notebook
```

### 0.6 Instalar as dependências

```bash
npm install            # na raiz do projeto (demora alguns minutos)
cd api
npm install
cd ..
```

### 0.7 Rodar a API e conferir os testes

```bash
cd api
npm test
```

**Como saber que deu certo:** no final aparece `ℹ pass 14` e `ℹ fail 0`.

### 0.8 Rodar o app no navegador

Use **dois terminais** abertos ao mesmo tempo.

| Terminal 1 (API) | Terminal 2 (app) |
|---|---|
| `cd api` e depois `npm start` | na raiz: `npm run web` |

Quando o terminal 2 mostrar o endereço `http://localhost:8081`, abra no Chrome. Depois aperte **F12** e clique no ícone de celular
(*Toggle device toolbar*) para ver no formato de telefone.

**Como entrar no Espaço Seguro:** menu (☰) → **Configurações** → role até o fim → **Diagnóstico de Sincronização** → digite o PIN **1234**.

**Dois avisos importantes:**

1. Se você usa a extensão **Dark Reader** no Chrome, desative-a para `localhost`. Ela escurece o app e causa um aviso vermelho
   ("A tree hydrated...") que **não é erro do projeto**.
2. Hoje, no navegador, as confirmações de **excluir** e os avisos de erro **não aparecem** (o `Alert.alert` não funciona na web).
   No celular funciona normalmente. A **Parte 2** corrige isso. Até lá, não estranhe que excluir "não faz nada" no navegador.

---

## Parte 1 — Cadastro e exclusão de serviços de apoio

**Por que isso importa:** o enunciado pede "pelo menos Create e Read de cada CRUD integrados via API real". Nos seus três CRUDs,
Contatos e Eventos já estão completos, mas **Serviços de apoio só tem leitura na tela**: a API tem as 5 rotas, mas o app não permite cadastrar nem excluir.
Vamos fechar essa lacuna.

### 1.1 `src/services/api.js` — duas funções novas

Abra `src/services/api.js`. Procure esta linha:

```js
export const listarServicos = () => requisitar('/servicos');
```

**Logo depois dela**, cole:

```js
export const criarServico = (dados) => post('/servicos', dados);
export const removerServico = (id) => del('/servicos', id);
```

### 1.2 `src/store/ocorrenciasSlice.js` — guardar os serviços no Redux

Abra `src/store/ocorrenciasSlice.js`. São **três** colagens.

**(a) Duas funções novas.** Procure o final da função `excluirContato`:

```js
export const excluirContato = createAsyncThunk('contatos/excluir', async (id) => {
  await api.removerContato(id);
  return id;
});
```

**Logo depois dela** (deixe uma linha em branco), cole:

```js
export const salvarServico = createAsyncThunk(
  'servicos/salvar',
  async (servico, { getState, rejectWithValue }) => {
    const criado = await api.criarServico(servico);
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return criado;
  }
);

export const excluirServico = createAsyncThunk('servicos/excluir', async (id) => {
  await api.removerServico(id);
  return id;
});
```

**(b) Duas reações novas.** Mais abaixo, dentro do `extraReducers`, procure:

```js
      .addCase(excluirContato.fulfilled, (state, action) => {
        state.contatos = state.contatos.filter((c) => c.id !== action.payload);
      })
```

**Logo depois**, cole:

```js
      .addCase(salvarServico.fulfilled, (state, action) => {
        state.servicosApoio.push(action.payload);
      })
      .addCase(excluirServico.fulfilled, (state, action) => {
        state.servicosApoio = state.servicosApoio.filter((s) => s.id !== action.payload);
        // A API apaga em cascata os encaminhamentos que usavam o serviço: espelhamos isso aqui.
        state.ocorrencias.forEach((oc) => {
          oc.encaminhamentos = oc.encaminhamentos.filter((e) => e.servicoId !== action.payload);
        });
      })
```

**(c) Tratamento de erro.** No fim do `extraReducers`, **troque** esta linha:

```js
      .addCase(excluirContato.rejected, registrarErro);
```

**por estas três** (repare que só a última termina em `;`):

```js
      .addCase(excluirContato.rejected, registrarErro)
      .addCase(salvarServico.rejected, registrarErro)
      .addCase(excluirServico.rejected, registrarErro);
```

### 1.3 Criar a tela de cadastro

Crie o arquivo novo **`src/screens/seguro/NovoServicoModal.js`** com este conteúdo **inteiro**:

```js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { salvarServico } from '../../store/ocorrenciasSlice';
import BotaoSaidaRapida from '../../components/BotaoSaidaRapida';

// Cadastro de um serviço de apoio (Create do CRUD de Serviços).
export default function NovoServicoModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [atendimento24h, setAtendimento24h] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Dados incompletos', 'Informe pelo menos o nome e o telefone do serviço.');
      return;
    }

    const novoServico = {
      nome: nome.trim(),
      tipo: tipo.trim() || 'Serviço de apoio',
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      descricao: descricao.trim(),
      atendimento_24h: atendimento24h,
    };

    try {
      await dispatch(salvarServico(novoServico)).unwrap();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
      return;
    }
    setNome('');
    setTipo('');
    setTelefone('');
    setEndereco('');
    setDescricao('');
    setAtendimento24h(false);
    aoFechar();
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoFechar}>
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Novo Serviço de Apoio</Text>
          <View style={styles.acoesHeader}>
            <BotaoSaidaRapida />
            <TouchableOpacity onPress={handleSalvar} style={styles.botaoSalvar}>
              <Text style={styles.textoSalvar}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          <View style={styles.secao}>
            <Text style={styles.label}>Nome do serviço</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Casa da Mulher Brasileira"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Tipo de atendimento</Text>
            <TextInput
              style={styles.input}
              value={tipo}
              onChangeText={setTipo}
              placeholder="Ex: Acolhimento psicológico e jurídico"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(43) 3333-3333"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="O que o serviço oferece"
              placeholderTextColor="#64748B"
              multiline
            />
          </View>

          <View style={styles.cardSwitch}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.tituloSwitch}>Atendimento 24 horas</Text>
              <Text style={styles.subSwitch}>Marque se o serviço atende a qualquer hora do dia ou da noite.</Text>
            </View>
            <Switch
              value={atendimento24h}
              onValueChange={setAtendimento24h}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={atendimento24h ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  botaoFechar: { padding: 8 },
  headerTitulo: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  acoesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoSalvar: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  textoSalvar: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  conteudo: { flex: 1, padding: 20 },
  secao: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  inputMultilinha: { minHeight: 90, textAlignVertical: 'top' },
  cardSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  tituloSwitch: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  subSwitch: { fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 16 },
});
```

### 1.4 `src/screens/seguro/EspacoSeguroScreen.js` — botão, lixeira e a tela

Abra `src/screens/seguro/EspacoSeguroScreen.js`. São **sete** mudanças pequenas, de cima para baixo.

**(a)** No `import { ... } from '../../store';` do topo, **troque**:

```js
  excluirContato,
  alternarPrioridadeContato,
```

**por:**

```js
  excluirContato,
  excluirServico,
  alternarPrioridadeContato,
```

**(b) Importar a nova tela.** **Troque** esta linha:

```js
import NovoContatoModal from './NovoContatoModal';
```

**por:**

```js
import NovoContatoModal from './NovoContatoModal';
import NovoServicoModal from './NovoServicoModal';
```

**(c) Estado que abre/fecha a tela.** **Troque**:

```js
  const [modalNovoContato, setModalNovoContato] = useState(false);
```

**por:**

```js
  const [modalNovoContato, setModalNovoContato] = useState(false);
  const [modalNovoServico, setModalNovoServico] = useState(false);
```

**(d) Função que pergunta antes de excluir.** Procure a linha abaixo e cole o bloco novo **imediatamente antes dela**:

```js
  const totalEvidencias = ocorrencias.reduce(
```

Bloco novo (vai acima da linha `const totalEvidencias`):

```js
  const handleExcluirServico = (id, nome) => {
    Alert.alert(
      'Remover serviço',
      `Deseja remover "${nome}" da rede de apoio? Os encaminhamentos feitos para ele também serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => dispatch(excluirServico(id)),
        },
      ]
    );
  };
```

**(e) Botão "Adicionar Serviço de Apoio".** Procure o título da seção:

```jsx
              <Text style={styles.secaoHeaderTitulo}>
                Serviços Especializados em Londrina - PR
              </Text>
            </View>
```

**Logo depois do `</View>` desse bloco**, cole:

```jsx
            <TouchableOpacity
              style={styles.btnAdicionarGuardião}
              onPress={() => setModalNovoServico(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.txtAdicionarGuardião}>Adicionar Serviço de Apoio</Text>
            </TouchableOpacity>
```

**(f) Lixeira em cada card de serviço.** Dentro do `servicosApoio.map(...)`, procure o selo "24 HORAS":

```jsx
                  {srv.atendimento_24h && (
                    <View style={styles.badge24h}>
                      <Text style={styles.txt24h}>24 HORAS</Text>
                    </View>
                  )}
```

**Logo depois dele**, cole:

```jsx
                  <TouchableOpacity
                    style={styles.btnExcluirContato}
                    onPress={() => handleExcluirServico(srv.id, srv.nome)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
```

**(g) Mostrar a tela de cadastro.** Perto do fim do arquivo, procure:

```jsx
      <NovoContatoModal
        visivel={modalNovoContato}
        aoFechar={() => setModalNovoContato(false)}
      />
```

**Logo depois**, cole:

```jsx
      <NovoServicoModal
        visivel={modalNovoServico}
        aoFechar={() => setModalNovoServico(false)}
      />
```

### 1.5 Pequeno ajuste visual (opcional, recomendado)

Se você cadastrar um serviço **sem endereço**, aparece um ícone de localização solto. Para esconder a linha quando o endereço estiver vazio, **troque**:

```jsx
                <View style={styles.servicoLinha}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" />
                  <Text style={styles.servicoTextoLinha}>{srv.endereco}</Text>
                </View>
```

**por:**

```jsx
                {srv.endereco ? (
                  <View style={styles.servicoLinha}>
                    <Ionicons name="location-outline" size={14} color="#94A3B8" />
                    <Text style={styles.servicoTextoLinha}>{srv.endereco}</Text>
                  </View>
                ) : null}
```

### 1.6 Conferir

Na raiz do projeto:

```bash
npx tsc --noEmit
npx expo lint
```

**Como saber que deu certo:** os dois terminam **sem mostrar nenhum erro** (silêncio é bom sinal).

Agora teste na tela (API e app rodando, como no passo 0.8):

1. Entre no Espaço Seguro → aba **Rede de Apoio**.
2. Role até **Adicionar Serviço de Apoio** e toque.
3. Preencha **Nome** e **Telefone** (os outros campos são opcionais) → **Salvar**.
4. O serviço novo aparece no fim da lista. Confirme também na API: abra `http://localhost:3333/servicos` no navegador.
5. Toque na **lixeira** do serviço novo. **No celular** aparece a confirmação; **no navegador ainda não** (isso é a Parte 2).

### 1.7 Commit

```bash
git add src/services/api.js src/store/ocorrenciasSlice.js src/screens/seguro/NovoServicoModal.js src/screens/seguro/EspacoSeguroScreen.js
git status
git commit -m "Adiciona cadastro e exclusão de serviços de apoio"
```

---

## Parte 2 — Confirmações e avisos que funcionam no navegador

**O problema:** no navegador, `Alert.alert(...)` é uma função vazia. Por isso as confirmações de excluir e os avisos de campo obrigatório
só funcionam no celular. Vamos criar uma função `alertar(...)` que usa o alerta nativo no celular e `window.confirm`/`window.alert` na web.

### 2.1 Criar a função

Crie a pasta e o arquivo **`src/utils/alerta.js`** com este conteúdo:

```js
import { Alert, Platform } from 'react-native';

// No celular usa o Alert nativo. No navegador (react-native-web) o Alert.alert não faz
// nada, então aqui usamos window.confirm / window.alert para que confirmações de
// exclusão e avisos de validação também funcionem ao testar pelo navegador.
//
// Uso (igual ao Alert.alert):
//   alertar('Título', 'Mensagem');
//   alertar('Excluir', 'Tem certeza?', [
//     { text: 'Cancelar', style: 'cancel' },
//     { text: 'Excluir', style: 'destructive', onPress: () => ... },
//   ]);
export function alertar(titulo, mensagem, botoes) {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, mensagem, botoes);
    return;
  }
  const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
  const confirmacao = botoes?.some((b) => b.style === 'cancel');
  if (confirmacao) {
    // pergunta com OK/Cancelar: executa o botão que não é "cancelar" se a pessoa confirmar
    if (window.confirm(texto)) {
      botoes.find((b) => b.style !== 'cancel')?.onPress?.();
    }
    return;
  }
  window.alert(texto);
  botoes?.[0]?.onPress?.();
}
```

### 2.2 Trocar `Alert.alert` por `alertar` automaticamente

São 14 usos em 6 arquivos (contando os que você acabou de criar). Em vez de trocar à mão, use este script de uso único.
Crie o arquivo **`scripts/trocar-alert.js`** com este conteúdo:

```js
// Script de uso único: troca Alert.alert(...) por alertar(...) nos 5 arquivos que usam Alert.
// Rodar na raiz do projeto:  node scripts/trocar-alert.js   (depois pode apagar este arquivo)
const fs = require('fs');
const path = require('path');

const arquivos = [
  'src/screens/disfarce/DetalheEventoModal.js',
  'src/screens/disfarce/NovoEventoModal.js',
  'src/screens/seguro/EspacoSeguroScreen.js',
  'src/screens/seguro/NovaOcorrenciaModal.js',
  'src/screens/seguro/NovoContatoModal.js',
  'src/screens/seguro/NovoServicoModal.js',
];

for (const rel of arquivos) {
  const caminho = path.join(__dirname, '..', rel);
  let s = fs.readFileSync(caminho, 'utf8');
  if (!s.includes('Alert.alert(')) {
    console.log('sem Alert.alert (nada a fazer):', rel);
    continue;
  }
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  const subidas = '../'.repeat(rel.split('/').length - 2); // até a pasta src
  s = s.replace(/Alert\.alert\(/g, 'alertar(');
  s = s.replace(/^ {2}Alert,\r?\n/m, ''); // tira "Alert," do import do react-native
  s = s.replace(/(\} from 'react-native';\r?\n)/, `$1import { alertar } from '${subidas}utils/alerta';${eol}`);
  fs.writeFileSync(caminho, s);
  console.log('ok:', rel);
}
```

Rode **na raiz do projeto**:

```bash
node scripts/trocar-alert.js
```

**Como saber que deu certo:** aparecem 6 linhas `ok: src/screens/...`.

Agora **apague o arquivo `scripts/trocar-alert.js`** (ele não faz mais sentido depois de rodar): pelo VS Code (botão direito → Delete),
ou com `rm scripts/trocar-alert.js` (Git Bash) / `del scripts	rocar-alert.js` (PowerShell). Depois confira:

```bash
npx tsc --noEmit
npx expo lint
```

Os dois comandos devem terminar **sem erros**.

### 2.3 Testar no navegador

Com API e app rodando: na aba **Rede de Apoio**, toque na lixeira de um serviço que você criou.
Agora o navegador mostra uma caixa **OK / Cancelar**. Em **Cancelar** nada acontece; em **OK** o serviço some da tela **e** da API
(`http://localhost:3333/servicos`).

> Cuidado: **não exclua** serviços de exemplo do projeto (ids 1 a 6) durante o teste, senão você muda `api/dados/servicos.json`
> (a API grava nesse arquivo). Se acontecer sem querer, restaure com `git checkout -- api/dados`.

### 2.4 Commit

```bash
git add src
git status
git commit -m "Corrige alertas e confirmações no navegador"
```

---

## Parte 3 — Testes automáticos dos seus CRUDs

Os testes provam que a API de **Serviços** e **Eventos** valida os dados e se comporta como o enunciado pede.
Crie o arquivo **`api/test/servicos-eventos.test.js`** (é um arquivo **novo**, então não dá conflito com o `api.test.js`):

```js
// Testes da API dos CRUDs de Serviços e Eventos (node --test).
// Usam uma cópia temporária de dados/, então os arquivos de exemplo nunca são alterados.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

let servidor;
let base;
let dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-teste-servicos-"));
  fs.cpSync(path.join(__dirname, "..", "dados"), dir, { recursive: true });
  process.env.DADOS_DIR = dir;
  const { criarApp } = require("../server");
  await new Promise((ok) => {
    servidor = criarApp().listen(0, ok);
  });
  base = `http://localhost:${servidor.address().port}`;
});

after(() => {
  servidor.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

async function chamar(metodo, rota, corpo) {
  const r = await fetch(base + rota, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json().catch(() => null) };
}

test("CRUD completo de serviços de apoio", async () => {
  const criado = await chamar("POST", "/servicos", {
    nome: "Casa da Mulher Brasileira",
    tipo: "Acolhimento",
    telefone: "(43) 3333-3333",
    endereco: "Rua A, 10",
    atendimento_24h: true,
    descricao: "Atendimento integral",
  });
  assert.equal(criado.status, 201);
  const id = criado.corpo.id;

  const lido = await chamar("GET", `/servicos/${id}`);
  assert.equal(lido.status, 200);
  assert.equal(lido.corpo.nome, "Casa da Mulher Brasileira");

  // PUT é parcial: só o telefone muda, o resto continua igual
  const alterado = await chamar("PUT", `/servicos/${id}`, { telefone: "(43) 4444-4444" });
  assert.equal(alterado.status, 200);
  assert.equal(alterado.corpo.telefone, "(43) 4444-4444");
  assert.equal(alterado.corpo.nome, "Casa da Mulher Brasileira");

  assert.equal((await chamar("DELETE", `/servicos/${id}`)).status, 200);
  assert.equal((await chamar("GET", `/servicos/${id}`)).status, 404);
});

test("serviço: validação devolve 400 para nome, telefone e 24h inválidos", async () => {
  const semNome = await chamar("POST", "/servicos", { telefone: "190" });
  assert.equal(semNome.status, 400);
  assert.match(semNome.corpo.erros.join(" "), /nome/);

  const semTelefone = await chamar("POST", "/servicos", { nome: "X", telefone: "  " });
  assert.equal(semTelefone.status, 400);
  assert.match(semTelefone.corpo.erros.join(" "), /telefone/);

  const bool = await chamar("POST", "/servicos", { nome: "X", telefone: "190", atendimento_24h: "sim" });
  assert.equal(bool.status, 400);
  assert.match(bool.corpo.erros.join(" "), /atendimento_24h/);
});

test("excluir um serviço apaga os encaminhamentos que o usavam, mas mantém a ocorrência", async () => {
  const servico = (await chamar("POST", "/servicos", { nome: "Serviço temporário", telefone: "100" })).corpo;
  const ocorrencia = (
    await chamar("POST", "/ocorrencias", {
      data_ocorrencia: "2026-11-10 10:00",
      tipo_violencia: "Moral",
      descricao: "Teste de cascata do serviço",
      nivel_risco: 2,
    })
  ).corpo;
  const encaminhamento = await chamar("POST", "/encaminhamentos", {
    ocorrenciaId: ocorrencia.id,
    servicoId: servico.id,
    data: "10/11/2026",
    status: "Em Andamento",
  });
  assert.equal(encaminhamento.status, 201);

  await chamar("DELETE", `/servicos/${servico.id}`);
  const restantes = await chamar("GET", `/encaminhamentos?servicoId=${servico.id}`);
  assert.equal(restantes.corpo.length, 0);
  assert.equal((await chamar("GET", `/ocorrencias/${ocorrencia.id}`)).status, 200);
});

test("eventos: alterar (PUT parcial), filtrar por data e excluir", async () => {
  const criado = (
    await chamar("POST", "/eventos", { titulo: "Consulta", data: "2026-12-05", horaInicio: "09:00", horaFim: "10:00" })
  ).corpo;

  const alterado = await chamar("PUT", `/eventos/${criado.id}`, { titulo: "Consulta de retorno" });
  assert.equal(alterado.status, 200);
  assert.equal(alterado.corpo.titulo, "Consulta de retorno");
  assert.equal(alterado.corpo.data, "2026-12-05"); // não mudou

  const doDia = await chamar("GET", "/eventos?data=2026-12-05");
  assert.ok(doDia.corpo.some((e) => e.id === criado.id));
  assert.ok(doDia.corpo.every((e) => e.data === "2026-12-05"));

  assert.equal((await chamar("DELETE", `/eventos/${criado.id}`)).status, 200);
  assert.equal((await chamar("GET", `/eventos/${criado.id}`)).status, 404);
});

test("eventos: hora e data inválidas devolvem 400", async () => {
  const horaRuim = await chamar("POST", "/eventos", { titulo: "X", data: "2026-12-05", horaInicio: "25:99" });
  assert.equal(horaRuim.status, 400);
  assert.match(horaRuim.corpo.erros.join(" "), /horaInicio/);

  const dataRuim = await chamar("POST", "/eventos", { titulo: "X", data: "05/12/2026" });
  assert.equal(dataRuim.status, 400);
  assert.match(dataRuim.corpo.erros.join(" "), /data/);
});
```

Rode:

```bash
cd api
npm test
```

**Como saber que deu certo:** `ℹ tests 19`, `ℹ pass 19`, `ℹ fail 0`. (14 antigos + 5 seus.)

Os testes usam uma cópia temporária dos dados, então **não alteram** `api/dados/*.json`.

```bash
cd ..
git add api/test/servicos-eventos.test.js
git commit -m "Adiciona testes da API de serviços e eventos"
```

---

## Parte 4 — Notebook: análise exploratória e modelagem (as suas seções)

No notebook, as seções **5 (análise exploratória)** e **6–7 (modelagem e avaliação)** têm o seu nome como responsável.
Você precisa **entender o que está lá** e conseguir explicar na apresentação. Esta parte tem três etapas: **A** e **B** são obrigatórias, **C** é opcional.

### 4.A Rodar o notebook e conferir os números

1. Crie um ambiente Python **dentro da pasta `data-science`** (a pasta `.venv` já está no `.gitignore`):

```bash
cd data-science
python -m venv .venv
```

2. Ative o ambiente:

| Terminal | Comando |
|---|---|
| PowerShell | `.venv\Scripts\Activate.ps1` |
| Git Bash | `source .venv/Scripts/activate` |
| CMD | `.venv\Scripts\activate.bat` |

3. Instale e abra o notebook:

```bash
pip install -r requirements.txt
jupyter notebook notebook.ipynb
```

4. No Jupyter, escolha o menu **Kernel → Restart Kernel and Run All Cells** e espere terminar (1 a 3 minutos).
   Importante: abra o notebook **de dentro da pasta `data-science`**, porque os caminhos (`dados/` e `../api/dados/`) são relativos a ela.

**Como saber que deu certo:** nenhuma célula fica com erro (texto vermelho) e os números principais coincidem com estes
(diferenças na segunda casa decimal são normais):

| Onde | Valor esperado |
|---|---|
| Seção 6: limiar de "alta taxa" | `3.65` homicídios por 100 mil hab. |
| Seção 6: tamanho | treino 13.954 · teste 3.589 · a estimar 1.775 |
| Seção 7: Random Forest no teste | ROC-AUC **0.74**, F1 **0.49**, recall **0.70**, precisão **0.38** |
| Seção 7: linha de base no teste | ROC-AUC **0.57**, F1 **0.37** |
| Seção 8: exemplo | Salvador/BA: **Médio** (cerca de 26%) |

Ao rodar, a última seção **regrava** `api/dados/risco_territorial.json`. Se os números forem iguais, o arquivo quase não muda
(só a data `gerado_em`).

### 4.B Escrever a análise com as suas palavras

Hoje a "leitura" dos gráficos aparece como texto impresso pelo código. Você precisa acrescentar a **sua** interpretação, em **células de texto** (Markdown).

Como criar uma célula de texto: clique na célula logo abaixo do gráfico → menu **Insert → Insert Cell Below** → no menu de tipo escolha **Markdown** → escreva → **Shift+Enter**.

Escreva 2 a 4 frases em cada um destes pontos:

1. **Seção 5.1 (medidas):** o que significa a média ser maior que a mediana e a assimetria positiva.
2. **Seção 5.3 (série no tempo):** o que aconteceu com os homicídios de mulheres entre 2010 e 2022 e o que **não** dá para concluir.
3. **Seção 5.5 (as 3 perguntas):** reescreva, com as suas palavras, a resposta de cada pergunta.
4. **Seção 7 (avaliação):** explique, para uma pessoa que não é da área, o que significam **precisão 0,38** e **recall 0,70**.
5. **Seção 9 (conclusão):** um parágrafo seu sobre as limitações do indicador.

Regras da disciplina: **não conclua causalidade** a partir de correlação, e **não cite como fato** nada que o notebook não mostre.

### 4.C (Opcional) Terceiro modelo: Gradient Boosting

Só faça esta etapa se der tempo. **Atenção:** nos nossos testes o Gradient Boosting ficou um pouco melhor que o Random Forest na validação
(ROC-AUC 0.74 contra 0.73) e **passou a ser o modelo escolhido pelo notebook**. Isso **muda** o `risco_territorial.json`
(por exemplo, os municípios na categoria "Alto" sobem de cerca de 10% para cerca de 15%). É esperado, mas avise o Nicolas.

Três edições no notebook (use a busca do Jupyter: Edit → Find and Replace):

**(1) Célula de importações** — **troque** esta linha:

```python
from sklearn.ensemble import RandomForestClassifier
```

**por:**

```python
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
```

**(2) Célula `modelos = {...}`** — logo **antes** da `}` que fecha o dicionário (depois da linha do Random Forest), acrescente:

```python
    "Gradient Boosting": Pipeline([("pre", prep(False)),
                                   ("m", HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05,
                                                                        max_iter=200, random_state=ALEATORIO))]),
```

**(3) Célula das matrizes de confusão** — **troque**:

```python
fig, eixos = plt.subplots(1, 3, figsize=(13, 4))
```

**por** (agora são 4 gráficos):

```python
fig, eixos = plt.subplots(1, 4, figsize=(17, 4))
```

Depois rode **Kernel → Restart Kernel and Run All Cells** de novo. **Resultado esperado:**

| Onde | Valor esperado |
|---|---|
| Seção 6: modelo escolhido | `Gradient Boosting` |
| Seção 7: Gradient Boosting no teste | ROC-AUC **0.75**, F1 **0.49**, recall **0.68**, precisão **0.38** |
| Calibração (Seção 8) | Baixo ≈ 0.09 · Médio ≈ 0.28 · Alto ≈ 0.53 |
| Seção 8: municípios em "Alto" | cerca de **264** (14,9%) |

Se escolher fazer a 4.C, **atualize também os textos** que dizem "dois modelos" ou citam só o Random Forest:
na seção 6 do notebook (linha **Modelos**), em `data-science/README.md` (tabela "Resumo dos resultados") e em `README.md` (seção Data Science).
Depois rode `cd api && npm test` (deve continuar 19 passando) e abra o app para ver o card funcionando.

### 4.D Commit

Salve o notebook (**File → Save**) e feche o Jupyter.

```bash
cd ..
git status
git add data-science/notebook.ipynb api/dados/risco_territorial.json
git commit -m "Revisa análise exploratória e modelagem no notebook"
```

Se você fez a 4.C, adicione também os textos que mudou (por exemplo `data-science/README.md` e `README.md`) no mesmo `git add`.

---

## Parte 5 — Kanban

O enunciado pede o quadro de tarefas "atualizado, refletindo o avanço real", entregue em **PDF ou imagem (PNG ou JPG)**.
O quadro **já foi criado** pelo Nicolas no **GitHub Projects**, com o nome **Agenda Inteligente - Kanban**, com 25 cartões em três colunas:
**A fazer**, **Fazendo** e **Feito**. Você não precisa criar nada do zero.

### 5.1 Entrar no quadro

O quadro é **privado** e está na conta do Nicolas, então ele precisa te convidar:
no quadro, menu **···** (canto superior direito) → **Settings** → **Manage access** → **Invite collaborators** → o seu usuário do GitHub.
Depois de aceitar, abra o quadro (o Nicolas te passa o link; ele fica em `https://github.com/users/NiToshi1/projects/1`).

### 5.2 Manter o quadro verdadeiro

- Os seus cartões estão na coluna **Fazendo**, com "(Fernando)" no título. Quando terminar cada parte deste guia, **arraste o cartão para Feito**.
- Se precisar de um cartão novo: clique em **Add item** na coluna, digite o título e, no menu que abre, escolha **Create a draft**.
  **Não escolha "Create new issue"**: isso cria uma *issue* no repositório e polui o projeto.
- O quadro precisa mostrar o **estado real** na hora de gerar a imagem. Não arraste um cartão para Feito sem a parte estar pronta.

### 5.3 Gerar a imagem

O quadro tem mais cartões do que cabem na tela. Faça assim:

1. Abra o quadro no Chrome e aperte **F11** (tela cheia).
2. Diminua o zoom do navegador com **Ctrl e a tecla de menos** (várias vezes, até uns **33% a 50%**). Isso faz as colunas ficarem mais altas.
3. Confira se aparecem os 25 cartões. Se a coluna **Feito** ainda tiver rolagem, diminua mais o zoom.
4. Tire a captura de tela (Windows: **Windows + Shift + S**) e salve como **`docs/kanban.png`**.
5. Dê uma olhada na imagem: o texto precisa ser legível. Se não ficar, tire **duas imagens** (`docs/kanban-1.png` com A fazer e Fazendo, e `docs/kanban-2.png` com Feito).

Tire a captura **depois** de terminar as Partes 1 a 4 e mover os cartões. Esse arquivo também vai no Blackboard.

```bash
git add docs/kanban.png
git commit -m "Adiciona imagem do Kanban"
```

---

## Parte 6 — Registrar o uso de IA

O `USO_IA.md` precisa listar as ferramentas e os prompts usados. Se você usou alguma IA (Claude, ChatGPT etc.) para entender ou escrever algo, registre.
Abra `USO_IA.md`, vá ao fim e acrescente (troque o que estiver entre `[ ]` pelo que de fato aconteceu):

```markdown
## Contribuições do Fernando Vinicius (Entrega 4)

**Ferramenta:** [nome da IA, ou "nenhuma, feito manualmente seguindo o guia do projeto"].

| Prompt (resumo) | O que foi gerado | O que eu conferi |
|---|---|---|
| [o que você pediu, ou "—"] | Cadastro e exclusão de serviços de apoio (tela, Redux e API) | Testei no navegador: cadastrei, apareceu na API e excluí |
| [o que você pediu, ou "—"] | Função `alertar` para confirmações no navegador | Testei a exclusão no navegador |
| [o que você pediu, ou "—"] | 5 testes da API de serviços e eventos | `npm test` passou (19 testes) |
| [o que você pediu, ou "—"] | [seu texto de análise / terceiro modelo, se fez] | Rodei o notebook inteiro e conferi os números |
```

Seja honesto: o objetivo do registro é transparência, não esconder o uso de IA.

```bash
git add USO_IA.md
git commit -m "Registra uso de IA do Fernando"
```

---

## Parte 7 — Enviar para o GitHub

### 7.1 Conferir o que vai

```bash
git status                      # não deve haver arquivos soltos que você não reconhece
git log --oneline -8            # seus commits aparecem com a mensagem certa
git log -1 --format="%an <%ae>" # confira que o autor é você (nome e e-mail do GitHub)
```

Se aparecer `node_modules`, `.venv` ou arquivos enormes que você não criou, **pare e avise o Nicolas**.

### 7.2 Atualizar e enviar

```bash
git pull --rebase origin main
git push -u origin fernando/servicos-testes-notebook
```

Se o `git pull` avisar de **conflito**, não tente resolver sozinho no susto: rode `git status`, veja quais arquivos estão em conflito e chame o Nicolas.

### 7.3 Juntar na `main`

Combine com o Nicolas **uma das duas opções**:

- **Pelo GitHub:** abra o link que o `git push` mostrou ("Create a pull request"), crie o PR e o Nicolas aprova e faz o merge; ou
- **Pelo terminal:** `git checkout main`, `git pull`, `git merge fernando/servicos-testes-notebook`, `git push`.

Depois, o Nicolas confere no GitHub, em **Insights → Contributors**, se os dois aparecem.

---

## Checklist final

- [ ] Parte 1: serviços cadastram e excluem pela tela e na API
- [ ] Parte 2: confirmação de excluir funciona no navegador
- [ ] Parte 3: `npm test` na API mostra 19 testes passando
- [ ] Parte 4: notebook rodado do zero, sem erro, com a sua análise escrita
- [ ] Parte 5: `docs/kanban.png` commitado
- [ ] Parte 6: `USO_IA.md` com a sua parte
- [ ] Parte 7: tudo enviado e o Nicolas confirmou o merge
- [ ] `git log` mostra os seus commits com o seu nome

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `npm run web` diz que a porta 8081 está em uso | Feche o terminal antigo do Expo, ou aceite a porta que ele sugerir |
| O app abre mas o calendário aparece sem eventos | A API não está rodando. Abra o outro terminal e rode `npm start` na pasta `api` |
| Tela do Espaço Seguro mostra "Não foi possível conectar ao servidor" | Mesma causa: API desligada |
| Aviso vermelho "A tree hydrated..." | É a extensão Dark Reader. Desative para `localhost` |
| `npx tsc --noEmit` mostra erro depois da Parte 1 | Confira se colou cada trecho no lugar certo e se não faltou vírgula ou chave |
| `git push` recusado (permission denied) | Você ainda não aceitou o convite de colaborador (passo 0.2) |
| Commit não aparece no seu perfil do GitHub | O e-mail do Git (passo 0.4) não é o da sua conta |
| Jupyter dá erro de caminho (`dados/...` não encontrado) | Abra o notebook estando dentro da pasta `data-science` |
| Excluí um serviço de exemplo sem querer | `git checkout -- api/dados` restaura os dados originais |
