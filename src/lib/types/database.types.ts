// Escrito à mão a partir de supabase/migrations/0001_init_schema.sql.
// Quando o projeto Supabase estiver linkado, pode ser substituído por:
//   npx supabase gen types typescript --linked > src/lib/types/database.types.ts

export type TipoEmpresa = "proprietaria_saas" | "contratante" | "terceirizada";
export type PapelUsuario =
  | "admin_plataforma"
  | "admin_contratante"
  | "gestor_contrato"
  | "terceiro";
export type PeriodicidadeDocumento =
  | "apresentar_uma_vez"
  | "mensal"
  | "competencia_anual"
  | "informar_data_validade"
  | "periodico_data_fixa"
  | "periodico_a_partir_entrega";
export type StatusContrato = "ativo" | "vencido" | "encerrado";
export type SituacaoFuncionario = "ativo" | "desligado";
export type StatusDocumentoEntregue =
  | "valido"
  | "entregue_a_conferir"
  | "a_vencer"
  | "vencido"
  | "faltando";
export type ResultadoAuditoria = "conforme" | "nao_conforme" | "parcial";
export type TipoRegistroAcesso = "entrada" | "saida";

export interface EmpresaRow {
  id: number;
  empresa_pai_id: number | null;
  tipo: TipoEmpresa;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_municipal: string | null;
  inscricao_estadual: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  responsavel_nome: string | null;
  responsavel_email: string | null;
  responsavel_telefone: string | null;
  grupo_id: number | null;
  perfil_documental_id: number | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export type EmpresaInsert = Omit<
  EmpresaRow,
  "id" | "ativo" | "criado_em" | "atualizado_em"
> &
  Partial<Pick<EmpresaRow, "ativo">>;

export type EmpresaUpdate = Partial<EmpresaInsert>;

export interface UsuarioRow {
  id: string;
  empresa_id: number;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  criado_em: string;
}

export interface LocalRow {
  id: number;
  empresa_id: number;
  nome: string;
  endereco: string | null;
  ativo: boolean;
}

export interface GrupoTerceiroRow {
  id: number;
  empresa_contratante_id: number;
  codigo: string | null;
  nome: string;
  ativo: boolean;
}

export type GrupoTerceiroInsert = Omit<GrupoTerceiroRow, "id" | "ativo"> &
  Partial<Pick<GrupoTerceiroRow, "ativo">>;
export type GrupoTerceiroUpdate = Partial<GrupoTerceiroInsert>;

export interface PerfilDocumentalRow {
  id: number;
  empresa_contratante_id: number;
  nome: string;
}

export interface TipoDocumentoRow {
  id: number;
  empresa_contratante_id: number;
  codigo: string;
  descricao: string;
  periodicidade: PeriodicidadeDocumento;
  modo_cadastro: string | null;
  permitir_editar_entrega: boolean;
  frequencia_meses: number | null;
  formato_apresentacao: string | null;
  funcao: string;
  envia_email: boolean;
  anexo_obrigatorio: boolean;
  permite_isencao: boolean;
  contabilizar_pontualidade: boolean;
  ativo: boolean;
}

export type TipoDocumentoInsert = Omit<TipoDocumentoRow, "id">;
export type TipoDocumentoUpdate = Partial<TipoDocumentoInsert>;

export interface PerfilDocumentoRow {
  perfil_documental_id: number;
  tipo_documento_id: number;
  obrigatorio: boolean;
  bloqueia_acesso: boolean;
  dias_tolerancia: number;
  ativo: boolean;
}

export type TipoEntidadeParametrizacao = "contrato" | "empresa" | "funcionario";
export type NivelAprovacao = "nenhum" | "gestor_contrato" | "admin_contratante";

export interface ParametrizacaoAgrupamentoRow {
  id: number;
  codigo: string;
  nome: string;
}

export interface ParametrizacaoParametroRow {
  id: number;
  agrupamento_id: number;
  codigo: string;
  nome: string;
}

export interface ParametrizacaoPerfilRow {
  id: number;
  parametro_id: number;
  empresa_contratante_id: number;
  tipo_entidade: TipoEntidadeParametrizacao;
  codigo: string;
  descricao: string;
  nivel_aprovacao: NivelAprovacao;
  modo_cadastro: string | null;
  criado_em: string;
}

export type ParametrizacaoPerfilInsert = Omit<ParametrizacaoPerfilRow, "id" | "criado_em">;
export type ParametrizacaoPerfilUpdate = Partial<ParametrizacaoPerfilInsert>;

export interface ContratoRow {
  id: number;
  empresa_contratante_id: number;
  empresa_terceirizada_id: number;
  local_id: number | null;
  gestor_contrato_usuario_id: string | null;
  numero_contrato: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  status: StatusContrato;
  criado_em: string;
}

export interface FuncionarioRow {
  id: number;
  empresa_terceirizada_id: number;
  contrato_id: number | null;
  numero_inscricao: string | null;
  cpf: string | null;
  nome: string;
  cargo: string | null;
  situacao: SituacaoFuncionario;
  cracha_virtual_url: string | null;
  criado_em: string;
}

export type FuncionarioInsert = Omit<FuncionarioRow, "id" | "criado_em" | "situacao"> &
  Partial<Pick<FuncionarioRow, "situacao">>;
export type FuncionarioUpdate = Partial<FuncionarioInsert>;

export interface DocumentoEntregueRow {
  id: number;
  empresa_terceirizada_id: number;
  funcionario_id: number | null;
  tipo_documento_id: number;
  arquivo_url: string | null;
  competencia: string | null;
  data_entrega: string | null;
  data_validade: string | null;
  status: StatusDocumentoEntregue;
  observacao: string | null;
  validado_por_ia: boolean;
  validado_por_usuario_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface DocumentoEntregueAnexoRow {
  id: number;
  documento_entregue_id: number;
  arquivo_url: string;
  nome_arquivo: string | null;
  criado_em: string;
}

export interface AuditoriaCampoRow {
  id: number;
  empresa_terceirizada_id: number;
  local_id: number | null;
  usuario_auditor_id: string | null;
  data_auditoria: string;
  resultado: ResultadoAuditoria | null;
  observacoes: string | null;
}

export interface RegistroAcessoRow {
  id: number;
  funcionario_id: number;
  local_id: number;
  tipo: TipoRegistroAcesso;
  registrado_em: string;
}

// Sem o wrapper `Database`/`GenericSchema` do supabase-js: a cadeia de tipos
// condicionais que a v2.112 usa pra resolver `Database[SchemaName]` não fecha
// de forma confiável com um schema escrito à mão (mesmo satisfazendo
// `GenericSchema` estruturalmente, `.from(...).select(...)` ainda caía pra
// `never`). Os clients (client.ts/server.ts/admin.ts) usam o SDK sem
// parametrizar por `Database`; a segurança de tipo continua vindo das
// interfaces Row/Insert/Update acima, aplicadas manualmente com `.returns<T>()`
// nas leituras e anotações de tipo explícitas nos objetos de insert/update.
// Quando o projeto Supabase estiver linkado, `supabase gen types typescript
// --linked` pode gerar a versão oficial e reativar esse caminho se desejado.
