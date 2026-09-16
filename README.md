# 🏢 Universo · Gestão de terceiros

Projeto em desenvolvimento para organizar empresas, funcionários, contratos e documentação de terceiros, com acompanhamento de conformidade.

> 🤖 Projeto construído com assistência de IA na geração e alteração do código. Guilherme é estudante de Engenharia de Software, atualmente focado em Java, e ainda está desenvolvendo autonomia de programação. As tecnologias descritas representam contato prático assistido, não domínio independente ou certificação.

## Tecnologias presentes

- Next.js e React com TypeScript.
- Tailwind CSS e componentes baseados em Radix UI.
- Supabase, PostgreSQL e migrações SQL.
- React Hook Form e Zod para formulários e validação.
- Recharts para visualizações.

## Estrutura encontrada

| Área | Localização |
| --- | --- |
| Páginas e layouts | `src/app/` |
| Módulos de negócio | `src/features/` |
| Componentes compartilhados | `src/components/` |
| Autenticação e Supabase | `src/lib/auth/` e `src/lib/supabase/` |
| Migrações e regras de acesso | `supabase/migrations/` |

Há módulos para empresas, funcionários, grupos, contratos, tipos de documento, perfis documentais, parametrizações, pendências e dashboard. Essa lista descreve a estrutura do código, não uma validação de completude funcional.

## Comandos disponíveis

Após instalar as dependências e configurar um ambiente de desenvolvimento isolado:

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

O comando `npm run seed` altera dados: revise `scripts/seed.ts` e o banco de destino antes de utilizá-lo. Não execute seed ou migrações contra produção para experimentar.

## Documentação do projeto

- [Orientações para agentes](AGENTS.md)
- [Briefing](BRIEFING.md)
- [Módulo de documentos](DOCUMENTOS_MODULO.md)

## Estado e privacidade

Repositório privado e projeto em continuidade. Mantenha credenciais e dados reais fora do código e das demonstrações públicas. Esta atualização é documental: não altera a aplicação nem comprova sua segurança ou funcionamento ponta a ponta.
