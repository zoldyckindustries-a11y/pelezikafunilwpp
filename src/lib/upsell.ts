// Ligação com o projeto de upsell.
//
// O upsell roda em outro projeto (e possivelmente em outro domínio), então
// ele não enxerga o estado desta aplicação. Quem atravessa a fronteira é o
// `lid`: um identificador curto gerado aqui, gravado no Redis junto com o
// retrato do lead e carimbado na URL do checkout. Depois do pagamento, a
// plataforma redireciona para o upsell levando o `lid`, e lá a ponte troca
// o id pelos dados.
//
// Os mesmos campos também viajam em claro na querystring (n, t, c, uf) como
// atalho: se a plataforma preservar os parâmetros, o upsell nem precisa
// consultar o Redis.

"use client";

import { useEffect, useState } from "react";

/** Precisa ser idêntico ao LEAD_KEY_PREFIX do projeto de upsell. */
const PREFIXO = "upsell:lead:";

const ID_KEY = "upsellLeadId";

/** 6 horas: cobre a janela entre o checkout e o redirecionamento de volta. */
const TTL_SEGUNDOS = 6 * 60 * 60;

export interface RetratoLead {
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  foto: string;
}

function gerarId(): string {
  // crypto.randomUUID não existe em contexto inseguro (http em rede local).
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 10);
  return aleatorio;
}

/** Um id por pessoa, estável entre as telas do funil. */
export function obterLeadId(): string {
  if (typeof window === "undefined") return "";
  try {
    const salvo = localStorage.getItem(ID_KEY);
    if (salvo) return salvo;
    const novo = gerarId();
    localStorage.setItem(ID_KEY, novo);
    return novo;
  } catch {
    return gerarId();
  }
}

/** Lê do localStorage o que o funil já capturou sobre o alvo. */
export function retratoDoLead(): RetratoLead {
  const vazio: RetratoLead = {
    nome: "",
    telefone: "",
    cidade: "",
    estado: "",
    foto: "",
  };
  if (typeof window === "undefined") return vazio;
  try {
    const retrato: RetratoLead = {
      nome: (localStorage.getItem("targetName") ?? "").trim(),
      telefone: (localStorage.getItem("searchedUsername") ?? "").trim(),
      cidade: "",
      estado: "",
      foto: (localStorage.getItem("userProfilePic") ?? "").trim(),
    };
    const bruto = localStorage.getItem("userLocation");
    if (bruto) {
      const loc = JSON.parse(bruto);
      retrato.cidade = loc?.city ? String(loc.city) : "";
      retrato.estado = loc?.state ? String(loc.state) : "";
    }
    return retrato;
  } catch {
    return vazio;
  }
}

/**
 * Grava o retrato no Redis sob o `lid`. Falha em silêncio de propósito: o
 * checkout nunca pode depender disso, e a querystring já leva o essencial.
 */
export async function salvarRetrato(lid: string, retrato: RetratoLead) {
  if (!lid || !retrato.nome) return;
  try {
    await fetch("/api/redis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: `${PREFIXO}${lid}`,
        value: retrato,
        ttl: TTL_SEGUNDOS,
      }),
      keepalive: true,
    });
  } catch {
    // Sem Redis, o upsell cai nas outras camadas da ponte.
  }
}

function comParametros(base: string, lid: string, r: RetratoLead): string {
  try {
    const url = new URL(base);
    if (lid) url.searchParams.set("lid", lid);
    if (r.nome) url.searchParams.set("n", r.nome.split(/\s+/)[0]);
    if (r.telefone) url.searchParams.set("t", r.telefone.replace(/\D/g, ""));
    if (r.cidade) url.searchParams.set("c", r.cidade);
    if (r.estado) url.searchParams.set("uf", r.estado);
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Devolve a URL do checkout já carimbada com a identificação do lead.
 *
 * Começa pela URL crua para o botão nunca ficar sem destino enquanto o
 * efeito não rodou — e a troca acontece antes de qualquer clique possível.
 */
export function useCheckoutUrl(base: string): string {
  const [url, setUrl] = useState(base);

  useEffect(() => {
    const lid = obterLeadId();
    const retrato = retratoDoLead();
    setUrl(comParametros(base, lid, retrato));
    void salvarRetrato(lid, retrato);
  }, [base]);

  return url;
}
