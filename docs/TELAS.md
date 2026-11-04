# Telas do Spatium

Este documento descreve todas as telas do Spatium e os inputs (campos e controles interativos) de cada uma.

O app tem duas "janelas":

- **Janela principal**: as rotas do React Router dentro do `AppLayout` (sidebar + conteúdo).
- **Popup de Início Rápido**: uma janela separada, aberta por atalho global (`index.html?window=quick-start-popup`).

| Tela | Rota | Arquivo |
|---|---|---|
| Layout / Dock | (todas) | `src/components/layout/AppLayout.tsx`, `Dock.tsx` |
| Modo mini | (todas) | `src/components/layout/MiniMode.tsx` |
| Dashboard (Home) | `/` | `src/pages/Home/index.tsx` |
| Timer | `/timer` | `src/pages/Timer/Index.tsx` |
| Dialog: Nova/Editar categoria | modal em `/timer` | `src/components/timer/CreateCategoryDialog.tsx` |
| Dialog: Excluir categoria | modal em `/timer` | `src/components/timer/DeleteCategoryDialog.tsx` |
| Histórico | `/history` | `src/pages/History.tsx` |
| Estatísticas | `/stats` | `src/pages/Stats.tsx` |
| Configurações | `/settings` | `src/pages/Settings.tsx` |
| Popup de Início Rápido | `?window=quick-start-popup` | `src/pages/QuickStartPopup.tsx` |
| 404 | `*` | `src/pages/NotFound.tsx` |

---

## Layout global (Dock)

Fica presente em todas as rotas, exceto na 404. Em telas de até 780px o dock começa recolhido (só ícones); abaixo de 860px vira uma barra inferior.

| Input | Tipo | Comportamento |
|---|---|---|
| Links de navegação: Home, Timer, Histórico, Estatísticas, Configurações | Links | Navegam para `/`, `/timer`, `/history`, `/stats` e `/settings` |
| Botão "Fechar menu" / "Abrir menu" (ícone ☰ no fim do dock) | Botão | Recolhe ou expande o dock |
| Alternar tema (ícone ☀/☾ no topo) | Botão | Troca entre tema escuro e claro |
| "Modo mini" (topo) | Botão | Encolhe a janela para o modo mini |

### Modo mini

Janela compacta com o anel do timer, os botões Encerrar / Iniciar-Pausar / Resetar e chips para trocar a categoria. O botão "Expandir janela" volta ao layout completo e restaura o tamanho da janela.

---|---|---|
| Links de navegação: Home, Timer, Histórico, Estatísticas, Configurações | Links | Navegam para `/`, `/timer`, `/history`, `/stats` e `/settings` |
| Botão "Fechar menu" (ícone ☰ no topo da sidebar) | Botão | Recolhe a sidebar |
| Botão "Abrir menu" (barra lateral estreita) | Botão | Aparece com a sidebar recolhida e a reabre |

---

## Dashboard (Home) — `/`

Resumo do tempo de foco.

**Conteúdo exibido**
- Três cards de métricas: **Hoje**, **Esta Semana** e **Média Diária** (em horas).
- Gráfico de área **Minutos de foco**, com uma série por categoria, ou o aviso "Nenhum dado disponível para este período".
- Card **Início Rápido**, com o display `00:00:00`.
- Card **Histórico Recente**: lista das últimas sessões (categoria, data/hora e duração) e o total.

**Inputs**

| Input | Tipo | Valores / Comportamento |
|---|---|---|
| Seletor de período do gráfico | Grupo de botões | `Dia`, `Semana` (padrão), `Mês`. Ao trocar, a data volta para o período atual |
| Data de referência do gráfico | `<input>` nativo, cujo tipo muda com o período | `date` (Dia), `week` (Semana, formato `AAAA-Www`), `month` (Mês, formato `AAAA-MM`) |
| "Abrir Timer" | Link | Vai para `/timer` |

---

## Timer — `/timer`

Tela principal para registrar uma sessão de foco.

**Inputs**

| Input | Tipo | Valores / Comportamento |
|---|---|---|
| Modo do timer | Grupo de botões | `Padrão` (cronômetro progressivo), `Pomodoro`, `Personalizado`. Desabilitado enquanto o timer está rodando |
| Descrição da sessão | Texto (placeholder "Sobre o que é essa sessão?") | Ao lado aparece um chip com a categoria selecionada |
| Duração (min) | Número, de 1 a 180 | Só aparece no modo `Personalizado`. Desabilitado enquanto o timer roda |
| Resetar (ícone ↺) | Botão | Salva notas e descrição na sessão atual, reseta o timer e limpa descrição, categoria e notas |
| Iniciar / Pausar | Botão (toggle) | Inicia ou pausa o timer, enviando a descrição e a categoria |
| Encerrar | Botão | Mesmo comportamento do Resetar: salva os dados e finaliza a sessão |
| Seleção de categoria | Botões (um por categoria) | Seleciona a categoria. Se houver sessão ativa, atualiza a categoria dela |
| Editar categoria (ícone ✎, aparece no hover) | Botão | Abre o dialog de edição |
| Excluir categoria (ícone 🗑, aparece no hover) | Botão | Abre o dialog de exclusão |
| Adicionar categoria (ícone +) | Botão | Abre o dialog de nova categoria |
| Notas | Textarea (placeholder "Adicione suas notas sobre essa sessão...") | Salvas ao resetar/encerrar |

**Feedback:** no modo `Personalizado`, uma notificação "Timer finalizado" aparece quando o tempo acaba. Nos modos Pomodoro e Personalizado, um anel mostra o progresso.

### Dialog: Nova categoria / Editar categoria

| Input | Tipo | Valores / Comportamento |
|---|---|---|
| Nome | Texto, obrigatório (placeholder "Ex: Estudo, Trabalho...") | Recebe foco automático. `Enter` envia o formulário |
| Cor | Color picker nativo (`type="color"`) | Padrão `#8B5CF6`. Uma bolinha mostra a pré-visualização |
| Ícone | Grade de botões, seleção única | `briefcase` (padrão), `book`, `gamepad`, `code`, `music`, `heart`, `star`, `zap`, `coffee` |
| Cancelar | Botão | Fecha o dialog e limpa o formulário |
| Criar / Salvar | Botão | Desabilitado se o nome estiver vazio. Cria ou atualiza a categoria |

### Dialog: Excluir categoria

Pede confirmação e avisa que as sessões dessa categoria ficarão sem categoria.

| Input | Tipo | Comportamento |
|---|---|---|
| Cancelar | Botão | Fecha o dialog |
| Excluir | Botão (destrutivo) | Exclui a categoria |

---

## Histórico — `/history`

Lista de todas as sessões, com filtros e o tempo total das sessões filtradas.

**Conteúdo exibido:** para cada sessão, a descrição (ou "Sessão sem descrição"), um badge com a categoria, a data/hora e a duração.

**Inputs**

| Input | Tipo | Valores / Comportamento |
|---|---|---|
| De | Data (`type="date"`) | Filtra as sessões a partir dessa data (inclusive) |
| Até | Data (`type="date"`) | Filtra as sessões até essa data (inclusive) |
| Limpar filtros | Botão | Só aparece com algum filtro ativo. Limpa as datas e as categorias |
| Ordenação | Grupo de botões | `Mais recente` (padrão) ou `Mais antigo` |
| Filtro de categorias | Badges (toggle, multisseleção) | Uma por categoria. Sem nenhuma selecionada, todas aparecem |

Toda a filtragem acontece no front-end, sobre a lista carregada uma única vez.

---

## Estatísticas — `/stats`

Distribuição do tempo de foco por categoria no período atual.

**Conteúdo exibido**
- Card **Tempo total foco**, no formato `Xh Ymin`.
- Card **Por categoria**: uma barra de progresso por categoria, proporcional à categoria com mais tempo, com o total em horas.

**Inputs**

| Input | Tipo | Valores / Comportamento |
|---|---|---|
| Período | Grupo de botões | `Dia`, `Semana` (padrão), `Mês`. Sempre usa o período atual; não há seletor de data |

---

## Configurações — `/settings`

**Inputs**

| Seção | Input | Tipo | Valores / Comportamento |
|---|---|---|---|
| Tema | Claro / Escuro | Dois cards de seleção única | Tema padrão: Escuro |
| Cor Principal | Cor de destaque | Grade de botões, seleção única (com tooltip) | `Violeta`, `Ciano`, `Rosa`, `Âmbar`, `Esmeralda`, `Azul` |
| Iniciar com o Windows | Autostart | Switch | Liga ou desliga a inicialização automática (o app inicia minimizado na bandeja) |
| Atalhos Globais | "Gravar novo atalho" (um por ação) | Botão + captura de teclado | Grava a próxima combinação de teclas. Exige pelo menos um modificador (Ctrl, Alt ou Shift). `Esc` cancela |
| Ferramentas de Desenvolvimento *(apenas em build de dev)* | Gerar dados de exemplo | Botão | Cria cerca de 90 sessões nos últimos 30 dias |
| | Limpar todas as sessões | Botão | Apaga todas as sessões |

**Atalhos globais padrão**

| Ação | Atalho padrão |
|---|---|
| Abrir Início Rápido | `Ctrl+Alt+Shift+I` |
| Iniciar Timer Imediatamente | `Ctrl+Alt+Shift+T` |

---

## Popup de Início Rápido (janela separada)

Aberto pelo atalho **Abrir Início Rápido**. Tem dois estados:

### Estado 1: sem timer ativo

| Input | Tipo | Comportamento |
|---|---|---|
| Sem categoria | Botão | Inicia uma "Sessão rápida" no modo Padrão, sem categoria, e fecha o popup |
| Um botão por categoria | Botões | Inicia uma "Sessão rápida" no modo Padrão com aquela categoria e fecha o popup |

### Estado 2: timer em andamento

Mostra o modo, a categoria, o tempo decorrido (atualizado a cada segundo) e o indicador "Pausado", quando for o caso.

| Input | Tipo | Comportamento |
|---|---|---|
| Parar | Botão | Finaliza a sessão ativa |

---

## 404 — Página não encontrada

Aparece em qualquer rota inexistente, sem a sidebar.

| Input | Tipo | Comportamento |
|---|---|---|
| "Return to Home" | Link | Volta para `/` |
