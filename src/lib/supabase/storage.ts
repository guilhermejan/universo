import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_ANEXOS = "documentos-anexos";

// Bucket privado: o app nunca expõe URL pública, só sobe pelo admin client
// (service_role) em Server Actions. Path prefixado por documentoEntregueId
// evita colisão entre lançamentos e facilita limpeza futura por pasta.
export async function uploadAnexoDocumento(
  documentoEntregueId: number,
  file: File
): Promise<{ path: string; nomeArquivo: string }> {
  const admin = createAdminClient();

  const extensao = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const nomeUnico = `${crypto.randomUUID()}${extensao ? `.${extensao}` : ""}`;
  const path = `${documentoEntregueId}/${nomeUnico}`;

  const { error } = await admin.storage.from(BUCKET_ANEXOS).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw error;

  return { path, nomeArquivo: file.name };
}

export async function getUrlAssinadaAnexo(path: string, expiraEmSegundos = 60 * 10) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET_ANEXOS)
    .createSignedUrl(path, expiraEmSegundos);

  if (error) throw error;
  return data.signedUrl;
}
