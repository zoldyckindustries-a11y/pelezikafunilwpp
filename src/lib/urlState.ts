// Estado de navegação na URL.
//
// Cada etapa do funil vira um parâmetro (?etapa=...) para que a tela possa
// ser aberta direto, testada isolada e voltar pelo histórico do navegador.
// A rota atual e os parâmetros de campanha (utm_*) são preservados: só o
// que pertence à navegação é escrito aqui.
//
// Os parâmetros guardam navegação, nunca dados do lead: telefone, nome e
// respostas continuam fora da URL para não vazar em analytics, logs ou
// links compartilhados.

export const ETAPA_PARAM = "etapa";
export const CHAT_PARAM = "chat";
export const PERGUNTA_PARAM = "q";
export const SUB_PARAM = "sub";

export type UrlMode = "push" | "replace";

// Índice da entrada atual no histórico. Serve para saber se existe uma tela
// anterior para consumir (botão "voltar") ou se o retorno precisa de um
// destino alternativo.
const NAV_INDEX_KEY = "detetiveNavIndex";

function indiceAtual(): number {
  if (typeof window === "undefined") return 0;
  const valor = window.history.state?.[NAV_INDEX_KEY];
  return typeof valor === "number" ? valor : 0;
}

/**
 * Quantas entradas de histórico interno existem atrás da atual. Zero
 * significa que o próximo "voltar" leva para fora do funil — é o momento em
 * que a oferta de retorno precisa aparecer.
 */
export function indiceNavAtual(): number {
  return indiceAtual();
}

/**
 * Garante que a entrada atual do histórico tenha um índice de navegação.
 * Sem isso, um link direto (deep link) não teria histórico interno para
 * consumir e o botão "voltar" cairia sempre no destino alternativo.
 */
export function garantirIndiceNav(): number {
  if (typeof window === "undefined") return 0;
  if (typeof window.history.state?.[NAV_INDEX_KEY] === "number") {
    return indiceAtual();
  }
  window.history.replaceState(
    { ...(window.history.state ?? {}), [NAV_INDEX_KEY]: 0 },
    "",
    window.location.href
  );
  return 0;
}

export function lerParam(nome: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(nome);
}

/**
 * Escreve parâmetros na URL preservando rota e os demais parâmetros
 * (campanha, etc.). `push` cria uma entrada nova no histórico; `replace`
 * reescreve a atual — transições automáticas usam `replace` para não
 * aprisionar a pessoa numa tela que volta a empurrá-la para a frente.
 */
export function escreverParams(
  params: Record<string, string | number | null | undefined>,
  mode: UrlMode = "push"
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor === null || valor === undefined || valor === "") {
      url.searchParams.delete(chave);
    } else {
      url.searchParams.set(chave, String(valor));
    }
  });

  const indice = mode === "push" ? indiceAtual() + 1 : indiceAtual();
  const state = { ...(window.history.state ?? {}), [NAV_INDEX_KEY]: indice };
  const destino = `${url.pathname}${url.search}${url.hash}`;

  if (mode === "push") {
    window.history.pushState(state, "", destino);
  } else {
    window.history.replaceState(state, "", destino);
  }
}

/**
 * Volta uma entrada do histórico. Sem entrada interna (link direto), cai no
 * destino alternativo informado pelo chamador.
 */
export function voltar(fallback: () => void) {
  if (typeof window === "undefined") return;
  if (indiceAtual() > 0) {
    window.history.back();
  } else {
    fallback();
  }
}
