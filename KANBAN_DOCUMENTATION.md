# Kanban - Funil de Vendas

## Visão Geral

O Kanban (Funil de Vendas) é um sistema visual para gerenciar conversas organizadas em colunas por etiquetas (labels). Cada coluna representa uma etiqueta com sua própria cor, e você pode arrastar e soltar conversas entre as colunas para atualizar suas etiquetas automaticamente.

## Características Principais

✅ **Drag and Drop** - Arraste conversas entre colunas para atualizar etiquetas  
✅ **Colunas por Etiqueta** - Cada coluna é vinculada a uma etiqueta do Chatwoot  
✅ **Cores Personalizadas** - Cada coluna exibe a cor da sua etiqueta  
✅ **Conversas Sem Etiqueta** - Visualize conversas não classificadas em uma coluna separada  
✅ **Atualização em Tempo Real** - As etiquetas das conversas são atualizadas instantaneamente  

## Arquivos Criados

### Componentes (`app/javascript/dashboard/components-next/kanban/`)
- **Kanban.vue** - Componente principal que gerencia todo o kanban
- **KanbanColumn.vue** - Componente de coluna com suporte a drag and drop
- **KanbanCard.vue** - Componente de card individual de conversa

### Store Vuex (`app/javascript/dashboard/store/modules/`)
- **kanban.js** - Gerencia estado das conversas por label e ações de movimentação

### Services (`app/javascript/dashboard/services/`)
- **kanbanService.js** - Chamadas à API para atualizar labels das conversas

### Rotas (`app/javascript/dashboard/routes/dashboard/kanban/`)
- **kanban.routes.js** - Definição das rotas do kanban
- **KanbanView.vue** - Página principal do kanban

### Internacionalização
- **kanban.json** - Traduções em inglês para o kanban
- Adicionado **SALES_FUNNEL** ao arquivo `settings.json`

## Como Acessar

1. Vá para o dashboard do Chatwoot
2. No menu lateral, procure por **"Sales Funnel"** ou **"Funil de Vendas"**
3. Clique para abrir o kanban

## Como Usar

### Movimentar Conversas
1. Clique e arraste um card de conversa
2. Solte sobre a coluna de destino
3. A etiqueta da conversa será atualizada automaticamente

### Ver Conversas Sem Etiqueta
1. Clique no botão **"Show Untagged"** no topo
2. Uma coluna adicional aparecerá com conversas não classificadas

### Atualizar Dados
1. Clique em **"Refresh"** para recarregar todas as conversas e etiquetas

## Detalhes Técnicos

### API Endpoints Utilizados
- `GET /labels` - Lista todas as etiquetas
- `GET /conversations` - Lista conversas por filtros
- `PATCH /conversations/:id/labels` - Atualiza etiquetas de uma conversa

### Estado Vuex
O store `kanban` mantém:
- `conversationsByLabel` - Map de conversas por ID de etiqueta
- `kanbanLabels` - Array de etiquetas do kanban
- `untaggedConversations` - Array de conversas sem etiqueta
- `isLoading` - Estado de carregamento
- `error` - Mensagens de erro

### Componentes Internos

#### Kanban.vue
- Gerencia carregamento de dados
- Coordena drop de cards
- Exibe estado vazio quando não há etiquetas

#### KanbanColumn.vue
- Renderiza coluna com cor da etiqueta
- Aceita drops de cards
- Exibe contador de conversas

#### KanbanCard.vue
- Exibe informações da conversa
- Suporta drag
- Mostra nome do contato, última mensagem, inbox e data

## Filtros Futuros (Opcionais)

Para melhorias futuras, você pode adicionar:
- Filtro por inbox
- Filtro por data
- Filtro por prioridade
- Busca por conversa
- Personalização de colunas visíveis

## Notas de Desenvolvimento

- As traduções devem ser atualizadas em todos os locales quando mudanças forem feitas
- O kanban utiliza labels com `show_on_sidebar = true` apenas
- As cores das colunas vêm diretamente da cor da etiqueta
- O componente é totalmente reativo e atualiza em tempo real com o Vuex

