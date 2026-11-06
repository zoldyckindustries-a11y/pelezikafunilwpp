"use client";

import { useEffect } from "react";

/**
 * Intercepta o botão "voltar" e leva para a oferta de retorno.
 *
 * O navegador não deixa cancelar uma navegação de volta, então o truque é
 * empilhar um estado extra no histórico: o primeiro "voltar" consome esse
 * estado em vez de sair do site, e aí redirecionamos.
 *
 * Dispara uma vez só por sessão — insistir a cada voltar prende a pessoa na
 * página, o que irrita e ainda é bloqueado por navegadores modernos.
 */
const CHAVE_SESSAO = "backRedirectUsado";

export function useBackRedirect(destino = "/back-redirect") {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // não arma na própria página de destino, senão vira laço
    if (window.location.pathname === destino) return;
    if (sessionStorage.getItem(CHAVE_SESSAO) === "1") return;

    window.history.pushState(null, "", window.location.href);

    const aoVoltar = () => {
      sessionStorage.setItem(CHAVE_SESSAO, "1");
      window.location.href = destino;
    };

    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, [destino]);
}
