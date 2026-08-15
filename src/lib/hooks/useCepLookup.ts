"use client";

import { useState } from "react";

type ViaCepResponse = {
  erro?: boolean;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type CepEndereco = {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
};

// ViaCEP é o serviço público padrão de mercado pra isso no Brasil — sem
// autenticação, sem custo, sem SLA formal mas estável há anos.
export function useCepLookup() {
  const [isLoading, setIsLoading] = useState(false);

  async function buscar(cepMasked: string): Promise<CepEndereco | null> {
    const digits = cepMasked.replace(/\D/g, "");
    if (digits.length !== 8) return null;

    setIsLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return null;
      const data = (await res.json()) as ViaCepResponse;
      if (data.erro) return null;

      return {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      };
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { buscar, isLoading };
}
