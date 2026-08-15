# Módulo Documentos — Especificação Detalhada

Este módulo tem 3 telas. O schema já foi atualizado em `modelo-dados-saas-gestao-terceiros.sql`
com os campos necessários (tabelas `tipos_documento`, `perfil_documento`, `documentos_entregues`).

## Tela A — Cadastro de Tipo de Documento
CRUD da biblioteca de documentos (o que existe, não quem entregou).

Campos:
- Código (auto ou manual) + Nome do documento
- Periodicidade (select): "Apresentar uma vez" / "Mensal" / "Competência anual" /
  "Informar data de validade" / "Periódico (data fixa)" / "Periódico a partir da
  data de entrega"
  - quando for "periódico a partir da data de entrega": mostrar campo **Frequência (meses)**
    — a validade é calculada como data_entrega + frequencia_meses, não uma data fixa
- Permitir editar entrega (Sim/Não)
- Ativo (Sim/Não)
- Formato de apresentação (ex: "Data DD/MM/AAAA" quando o documento é tipo planilha)
- Função (Padrão / outros — deixar como texto livre por enquanto)
- Envia e-mail (Sim/Não) — dispara notificação ao responsável quando o documento vence/falta
- Anexo obrigatório (Sim/Não)
- Permite isenção (Sim/Não) — permite marcar "não aplicável" pra uma empresa/funcionário específico
- Contabilizar na pontualidade (Sim/Não) — se esse documento entra no cálculo da barra de
  conformidade do dashboard

## Tela B — Configuração de Perfil (Perfil x Documento)
Tela onde se define QUAIS documentos um Perfil Documental exige.

- Selecionar Perfil (ex: "Perfil Padrão Prestação de Serviços")
- Lista de documentos vinculados, cada linha com:
  - Descrição do documento
  - Bloqueia acesso (Sim/Não) — se vencido, bloqueia o funcionário/empresa de acessar
  - Dias de tolerância (número) — quantos dias após o vencimento até o status virar crítico
- Ação de remover documento do perfil (ícone de lixeira)
- Ação de adicionar novo documento ao perfil

## Tela C — Regularizar Pendências (a tela mais usada no dia a dia)
Tela operacional onde o gestor vê o que está faltando/vencendo e resolve.

**Filtro (topo):**
- Empresa (busca/autocomplete)
- Documento (dropdown, "Todos" como padrão)
- Competência (mês/ano)
- Botão Filtrar

**Lista de pendências (resultado do filtro):**
Colunas: Tipo (Empresa ou Funcionário) | Nome | Documento | Frequência | Competência |
Validade | Situação (badge colorido: VENCIDO em vermelho, A VENCER em amarelo, FALTA em
vermelho)

A lista mistura documentos no nível Empresa (ex: "Dissídio Coletivo da Categoria") e no
nível Funcionário (ex: "ASO", "Cartão ou Folha de Ponto" de cada pessoa) na mesma tabela —
isso é intencional, é uma visão unificada de pendências.

**Seção de lançamento (abaixo da lista, aparece ao selecionar itens):**
- Campo Observação (texto livre)
- Área "Documentos digitalizados" com botão Anexar (upload de arquivo, pode ter mais de um)
- Checkbox em cada linha da lista pra selecionar quais pendências esse lançamento resolve
- Botão Salvar — grava `data_entrega`, `arquivo_url`, `observacao`, recalcula `status`
  pra `entregue_a_conferir` nos itens marcados

## Prompt pronto pra colar no Claude Code

---

Implemente o módulo de Documentos do sistema, com base no schema atualizado em
modelo-dados-saas-gestao-terceiros.sql (tabelas tipos_documento, perfil_documento,
documentos_entregues) e na especificação em DOCUMENTOS_MODULO.md nesta pasta.

São 3 telas:
1. CRUD de Tipo de Documento (biblioteca) — formulário com periodicidade dinâmica
   (mostrar campo de frequência em meses só quando a periodicidade for "periódico a
   partir da entrega")
2. Configuração de Perfil x Documento — vincular/desvincular documentos a um perfil,
   com toggle de "bloqueia acesso" e input de "dias de tolerância" por vínculo
3. Regularizar Pendências — tela com filtro (empresa/documento/competência), lista
   unificada de pendências de empresa e de funcionário com status colorido, seleção
   por checkbox, upload de anexo, campo de observação e botão salvar que atualiza o
   status dos itens selecionados

Use os componentes visuais e a paleta que já criamos (preto #1A1A1A, vermelho #E31E24,
azul #4FC8F0→#1D7FC4) e mantenha o padrão de tabela/badges de status que já está no
dashboard. Antes de codar, me mostra o plano de arquivos/rotas que você vai criar.

---
