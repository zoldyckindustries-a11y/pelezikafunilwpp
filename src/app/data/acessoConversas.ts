// Quais conversas o lead consegue ler de fato.
//
// A prévia descriptografa UMA conversa. As outras abrem normalmente — o
// toque responde, a tela é a mesma, o cabeçalho e o campo de mensagem estão
// lá — mas nada dentro delas é legível.
//
// Um app que não deixa nem tocar na conversa denuncia na hora que é uma
// simulação. Um app que abre a conversa e não deixa ler é exatamente o que
// a oferta promete destravar: a prova está na tela, só falta a chave.

/** Única conversa com conteúdo legível na prévia. */
export const CONVERSA_LIBERADA = 1;

/** Quantas conversas a lista pode abrir: as 8 montadas mais a que chega
 *  durante a prévia. */
export const TOTAL_CONVERSAS = 9;

/** Até onde vão as conversas com roteiro escrito à mão (as demais recebem
 *  um roteiro gerado, que nunca é lido porque nasce borrado). */
export const CONVERSAS_COM_ROTEIRO = 4;

export function conversaExiste(id: number | null | undefined): id is number {
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id >= 1 &&
    id <= TOTAL_CONVERSAS
  );
}

export function conversaLiberada(id: number | null | undefined): boolean {
  return id === CONVERSA_LIBERADA;
}
