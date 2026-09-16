// Bootstrap único: cria a empresa UNIVERSO (raiz da hierarquia) e o primeiro
// usuário admin_plataforma. Idempotente — pode rodar de novo sem duplicar.
//
// Uso: preencha SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_UNIVERSO_CNPJ
// em .env.local e rode `npm run seed`.
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function main() {
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  const nome = process.env.SEED_ADMIN_NOME || "Admin UNIVERSO";
  const cnpj = requireEnv("SEED_UNIVERSO_CNPJ");

  const admin = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: usuarioExistente } = await admin
    .from("usuarios")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (usuarioExistente) {
    console.log("Usuário administrativo já cadastrado. Nada a fazer.");
    return;
  }

  let { data: universo } = await admin
    .from("empresas")
    .select("id")
    .eq("tipo", "proprietaria_saas")
    .maybeSingle();

  if (!universo) {
    const { data: novaEmpresa, error: erroEmpresa } = await admin
      .from("empresas")
      .insert({
        tipo: "proprietaria_saas",
        empresa_pai_id: null,
        razao_social: requireEnv("SEED_EMPRESA_RAZAO_SOCIAL"),
        nome_fantasia: requireEnv("SEED_EMPRESA_NOME_FANTASIA"),
        cnpj,
      })
      .select("id")
      .single();

    if (erroEmpresa) throw erroEmpresa;
    universo = novaEmpresa;
    console.log("Empresa proprietária criada.");
  } else {
    console.log("Empresa proprietária já cadastrada.");
  }

  let authUserId: string;
  const { data: criado, error: erroCriacao } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (erroCriacao) {
    const { data: listagem, error: erroListagem } = await admin.auth.admin.listUsers();
    if (erroListagem) throw erroListagem;
    const existente = listagem.users.find((u) => u.email === email);
    if (!existente) throw erroCriacao;
    authUserId = existente.id;
    console.log("Usuário de autenticação já cadastrado.");
  } else {
    authUserId = criado.user.id;
    console.log("Usuário de autenticação criado.");
  }

  const { error: erroPerfil } = await admin.from("usuarios").insert({
    id: authUserId,
    empresa_id: universo.id,
    nome,
    email,
    papel: "admin_plataforma",
    ativo: true,
  });

  if (erroPerfil) throw erroPerfil;

  console.log("\nPronto! Login inicial:");
  console.log(`  senha:  (a que você definiu em SEED_ADMIN_PASSWORD)`);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida (veja .env.example).`);
  }
  return value;
}

main().catch((err) => {
  console.error("Falha ao rodar o seed. Confira as variáveis privadas e o estado do banco.");
  process.exit(1);
});
