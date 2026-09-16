<p align="center">
  <img src="public/logo-universo-tight.png" width="260" alt="Logo Universo" />
</p>

# Universo · Gestão de terceiros

Sistema em desenvolvimento para centralizar o controle de empresas terceirizadas, funcionários, contratos e documentos. O painel acompanha pendências, vencimentos e indicadores de conformidade.

## Funcionalidades

- Autenticação e controle de acesso.
- Cadastro de empresas contratantes e terceirizadas.
- Cadastro de funcionários.
- Gestão de contratos.
- Tipos e perfis de documentos.
- Parametrização das exigências documentais.
- Acompanhamento de pendências.
- Dashboard com gráficos e indicadores.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase e PostgreSQL
- React Hook Form
- Zod
- Recharts
- Radix UI

## Como usar

### 1. Clone o repositório

```bash
git clone https://github.com/guilhermejan/universo.git
cd universo
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie `.env.example` para `.env.local` e informe os dados do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

As variáveis iniciadas por `SEED_` são usadas apenas para criar os dados iniciais com o comando de seed.

### 4. Configure o banco

As migrações SQL estão na pasta `supabase/migrations`. Aplique-as em ordem no projeto Supabase antes de iniciar a aplicação.

Para criar a empresa e o usuário iniciais após preencher as variáveis `SEED_`:

```bash
npm run seed
```

### 5. Execute

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm start` | Inicia a versão de produção |
| `npm run lint` | Analisa o código |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm run seed` | Cria os dados iniciais |

## Estrutura

```text
universo/
├── src/app/                 # Páginas e layouts
├── src/components/          # Componentes compartilhados
├── src/features/            # Módulos do sistema
├── src/lib/                 # Autenticação, Supabase e utilitários
├── supabase/migrations/     # Estrutura e regras do banco
├── scripts/seed.ts          # Dados iniciais
└── public/                  # Recursos visuais
```
