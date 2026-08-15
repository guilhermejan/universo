# Briefing — SaaS de Gestão de Terceiros (UNIVERSO)

## Contexto
A NakaCompany (minha agência) foi contratada por uma empresa para desenvolver um sistema
com as mesmas funções de um SaaS de referência (RainbowTec — gestão de terceiros e
controle de acesso). A empresa **UNIVERSO** é a dona da plataforma: ela vai gerenciar
outras empresas dentro do painel.

## Hierarquia do sistema (3 níveis)
1. **UNIVERSO** — empresa proprietária da plataforma (nível raiz/admin geral)
2. **Empresas contratantes** — clientes da UNIVERSO, que terceirizam mão de obra e usam
   o sistema pra controlar seus prestadores
3. **Empresas terceirizadas/prestadoras** — as empresas de fato fiscalizadas, vinculadas
   a uma contratante, com funcionários e documentos

## Módulos funcionais (baseados no sistema de referência)
- **Dashboard** — visão consolidada de conformidade por empresa contratante, com uma
  timeline mensal colorida por status (válido / entregue a conferir / a vencer / vencido)
- **Cadastro de Empresas** — dados cadastrais (razão social, CNPJ, endereço, responsável),
  vinculadas a um Grupo e a um Perfil documental
- **Documentos** — biblioteca de tipos de documento (código, descrição, periodicidade:
  mensal / anual / apresentar uma vez / informar validade), com status de entrega por
  empresa/funcionário
- **Funcionários** — vinculados à empresa terceirizada e ao contrato
- **Cadastro de Contratos** — vínculo formal entre contratante e terceirizada
- **Agendamento / Operações / Parametrizações** — módulos avançados, ficam para fase 2/3
- **Auditoria de campo** — checklists de inspeção in loco (fase 2)
- **Controle de acesso físico** — integração com catracas/leitoras (fase 3, depende de
  hardware do cliente)

## Modelo de dados
Schema completo em `db/schema.sql` (incluso neste projeto). Principais tabelas:
`empresas` (auto-relacionada, cobre os 3 níveis via `empresa_pai_id` e `tipo`),
`usuarios`, `grupos_terceiro`, `perfis_documentais`, `tipos_documento`,
`perfil_documento`, `contratos`, `funcionarios`, `documentos_entregues`,
`auditorias_campo`, `registros_acesso`.

## Identidade visual
Logo real da UNIVERSO em `assets/logo-universo.png` (preto, vermelho e azul, com
estrela e swoosh). Paleta extraída dela:
- Preto estrutural: `#1A1A1A` — texto, sidebar, navegação
- Vermelho de ação: `#E31E24` — botões primários, alertas, item ativo no menu
- Azul (gradiente da estrela): `#4FC8F0` → `#1D7FC4` — dados, informação, microinterações
- Base neutra: `#FFFFFF` / `#F7F7F6`

Tipografia: display `Sora` (títulos, KPIs), texto `Inter` (interface), mono
`JetBrains Mono` (CNPJ, códigos de documento).

Direção: plataforma **interativa e moderna** — microinterações discretas (hover states,
transições suaves), cor usada só pra comunicar significado (status de conformidade),
não decoração. Existe um mockup de referência (login + dashboard) já validado comigo,
que pode servir de ponto de partida visual.

## Prioridade de construção (MVP primeiro)
1. Setup do projeto + banco de dados (rodar `db/schema.sql`)
2. Autenticação (login, roles: admin_plataforma / admin_contratante / gestor_contrato / terceiro)
3. Tela de login com a marca UNIVERSO
4. Dashboard com o módulo **Empresas** funcionando de ponta a ponta (CRUD real)
5. Módulo **Documentos** com cálculo de status (válido/a vencer/vencido)
6. Só depois expandir: Funcionários, Contratos, e os módulos de fase 2/3

## Stack sugerida
Next.js + TypeScript + Tailwind no frontend, Supabase (Postgres) no backend,
multi-tenant por `empresa_id` em cada query.
