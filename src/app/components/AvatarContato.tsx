"use client";

// Avatar de contato sem foto, no padrão do WhatsApp: a inicial do nome sobre
// um círculo colorido.
//
// Vive fora dos componentes de tela porque a lista de conversas e a tela da
// conversa precisam chegar na MESMA cor para o mesmo contato. Enquanto a cor
// saía do índice da linha na lista, abrir o chat trocava a cor do avatar e
// denunciava que as duas telas não falam do mesmo contato.

// O WhatsApp varia a cor por contato. Um tom único em todas as linhas entrega
// que a lista é fabricada.
export const AVATAR_TONES = [
  "#7E9CAB",
  "#A68B6B",
  "#8FA68E",
  "#A68FA0",
  "#C49A7E",
  "#6E9A9C",
  "#B08B7E",
  "#8E96A8",
];

/**
 * Cor estável a partir do nome: o mesmo contato recebe sempre o mesmo tom,
 * em qualquer tela, sem precisar guardar nada.
 */
export function corDoContato(nome: string): string {
  const texto = (nome || "").trim();
  if (!texto) return AVATAR_TONES[0];
  let soma = 0;
  for (let i = 0; i < texto.length; i++) {
    soma = (soma + texto.charCodeAt(i) * (i + 1)) % 9973;
  }
  return AVATAR_TONES[soma % AVATAR_TONES.length];
}

export function inicialDoContato(nome: string): string {
  const texto = (nome || "").trim();
  // Pula caracteres que não são letra (nomes salvos como "❤️ A", "+55 43…").
  for (const char of texto) {
    if (/\p{L}/u.test(char)) return char.toUpperCase();
  }
  return "";
}

interface AvatarContatoProps {
  nome?: string;
  /** Diâmetro em pixels. */
  tamanho?: number;
  /** Cor do círculo. Por padrão, derivada do nome. */
  tone?: string;
  /**
   * Desfoca a inicial. A prévia esconde a identidade do contato, mas no
   * cabeçalho da conversa a letra fica nítida: é assim que o app mostra.
   */
  desfocarInicial?: boolean;
  className?: string;
}

export function AvatarContato({
  nome,
  tamanho = 56,
  tone,
  desfocarInicial = false,
  className = "",
}: AvatarContatoProps) {
  const inicial = inicialDoContato(nome ?? "");
  const cor = tone ?? corDoContato(nome ?? "");

  return (
    <div
      aria-hidden="true"
      className={`relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{ width: tamanho, height: tamanho, backgroundColor: cor }}
    >
      {inicial ? (
        <span
          className="font-semibold select-none leading-none"
          style={{
            fontSize: tamanho * 0.42,
            color: "rgba(255,255,255,0.95)",
            filter: desfocarInicial ? "blur(1.5px)" : undefined,
          }}
        >
          {inicial}
        </span>
      ) : (
        /* Sem nome, o WhatsApp mostra a silhueta genérica. */
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: "36%",
              height: "36%",
              top: "17%",
              left: "32%",
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "64%",
              height: "64%",
              bottom: "-28%",
              left: "18%",
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          />
        </>
      )}
    </div>
  );
}
