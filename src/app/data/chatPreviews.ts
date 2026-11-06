// Fonte única da prévia das conversas.
//
// A lista e a tela de conversa liam dados separados, então a prévia mostrava
// a PRIMEIRA mensagem enquanto o chat terminava em outra — abrir a conversa
// desmentia o que a lista acabara de dizer. Aqui as duas telas leem o mesmo
// objeto: o texto da prévia é literalmente a última mensagem do chat, e a
// contagem de não lidas é a mesma que vira o divisor dentro da conversa.
export interface ChatPreview {
  /** Última mensagem — aparece na lista e fecha a conversa */
  ultimaMensagem: string;
  /** Parte borrada dessa mensagem, quando houver */
  trechoOculto?: string;
  /** Quantas não lidas: badge na lista e divisor dentro do chat */
  naoLidas: number;
  /** Horário da última mensagem */
  horario: string;
}

export const CHAT_PREVIEWS: Record<number, ChatPreview> = {
  1: {
    ultimaMensagem: "Saudade de ontem à noite 😏 quando a gente",
    trechoOculto: "se vê de novo?",
    naoLidas: 1,
    horario: "14:52",
  },
  2: {
    ultimaMensagem: "Apaga essa conversa depois, por favor",
    naoLidas: 0,
    horario: "13:20",
  },
  3: {
    ultimaMensagem: "Tô sozinha em casa hoje 🔥 vem?",
    naoLidas: 3,
    horario: "11:47",
  },
  4: {
    ultimaMensagem: "Não me liga agora, ela tá aqui do lado",
    naoLidas: 0,
    horario: "09:15",
  },
};

/** Texto do divisor de não lidas, no formato do WhatsApp */
export function rotuloNaoLidas(n: number): string {
  return n === 1 ? "1 MENSAGEM NÃO LIDA" : `${n} MENSAGENS NÃO LIDAS`;
}
