"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  MessageCircle,
  ImageIcon,
  MapPin,
  Lock,
  ShieldCheck,
  Check,
  Loader2,
  TriangleAlert,
  ChevronRight,
  Star,
} from "lucide-react";
import { colors } from "../../constants/theme";

const CHECKOUT_URL = "https://go.perfectpay.com.br/PPU38CPQDG9";

// Mesma anatomia dos dossiês da oferta: etiqueta, título, conteúdo em cards
// internos. A página é uma extensão do funil, não uma tela avulsa.
function Bloco({
  etiqueta,
  icone: Icone,
  cor = colors.primaryBright,
  children,
}: {
  etiqueta: string;
  icone: typeof Lock;
  cor?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl overflow-hidden shadow-2xl"
      style={{
        backgroundColor: "#0B141A",
        border: `1px solid ${cor}2E`,
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          backgroundColor: `${cor}1A`,
          borderBottom: `1px solid ${cor}24`,
        }}
      >
        <Icone className="w-4 h-4 flex-shrink-0" style={{ color: cor }} />
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: cor }}
        >
          {etiqueta}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function BackRedirect() {
  const [alvo, setAlvo] = useState("o número consultado");
  const [regiao, setRegiao] = useState("");
  const [nomeAlvo, setNomeAlvo] = useState("");
  const [segundos, setSegundos] = useState(9 * 60);
  const [mostrarBarra, setMostrarBarra] = useState(false);
  const ofertaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const num = localStorage.getItem("searchedUsername");
    if (num) setAlvo(num);
    const nome = localStorage.getItem("targetName");
    if (nome) setNomeAlvo(nome);
    try {
      const bruto = localStorage.getItem("userLocation");
      if (bruto) {
        const loc = JSON.parse(bruto);
        if (loc?.city) setRegiao(loc.state ? `${loc.city} - ${loc.state}` : loc.city);
      }
    } catch {
      // localStorage corrompido não pode derrubar a página
    }
  }, []);

  // mesmo pixel do resto do funil, senão esta etapa fica fora da medição
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        if (!w._fbPixelInitialized) {
          ReactPixel.init("691938970226836");
          w._fbPixelInitialized = true;
        }
        ReactPixel.pageView();
        ReactPixel.trackCustom("BackRedirectView");
      })
      .catch(() => {
        // bloqueador de anúncios não pode derrubar a página
      });
  }, []);

  // CTA fixo aparece depois que a pessoa passa do bloco de oferta. Mede a
  // posição no scroll em vez de IntersectionObserver: com rolagem rápida o
  // retângulo do observer chega defasado e a barra não acompanha.
  useEffect(() => {
    const avaliar = () => {
      const alvo = ofertaRef.current;
      if (!alvo) return;
      const fimDaOferta = alvo.getBoundingClientRect().bottom;
      setMostrarBarra(fimDaOferta < 0);
    };
    avaliar();
    window.addEventListener("scroll", avaliar, { passive: true });
    window.addEventListener("resize", avaliar);
    return () => {
      window.removeEventListener("scroll", avaliar);
      window.removeEventListener("resize", avaliar);
    };
  }, []);

  useEffect(() => {
    if (segundos <= 0) return;
    const t = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [segundos]);
  const irParaCheckout = () => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.track("InitiateCheckout", {
          value: "5.50",
          currency: "BRL",
          content_type: "product",
          content_ids: ["back-redirect-resgate"],
        });
      })
      .catch(() => {});
  };

  const expirou = segundos === 0;

  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  const contadores = [
    { icone: MessageCircle, rotulo: "Mensagens apagadas", valor: 47 },
    { icone: ImageIcon, rotulo: "Mídia oculta", valor: 23 },
    { icone: MapPin, rotulo: "Localizações recentes", valor: 2 },
  ];

  const beneficios = [
    "Histórico completo, conversas apagadas e áudios de visualização única.",
    "Localização em tempo real do aparelho, sem deixar rastro.",
    "Acesso 100% anônimo — a consulta não aparece para ninguém.",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D9DBD5" }}>
      <div className="max-w-[480px] mx-auto min-h-screen bg-white md:shadow-2xl">
        {/* Faixa de expiração, no padrão da faixa de prévia do app */}
        <div
          className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-3"
          style={{
            background: colors.gradients.dark,
            borderBottom: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#F59E0B" }} />
            <span className="text-[12.5px] font-semibold text-white truncate">
              {expirou ? "Sessão encerrada" : "Sua análise expira em"}
            </span>
          </div>
          <span
            className="text-[15px] font-bold tabular-nums flex-shrink-0"
            style={{ color: expirou ? "#EF4444" : "#F59E0B" }}
          >
            {expirou ? "00:00" : `${mm}:${ss}`}
          </span>
        </div>

        <main className="px-4 py-5 space-y-4">
          {/* Bloco 1 — aviso de perda do que já foi recuperado */}
          <Bloco etiqueta="Espere um momento" icone={TriangleAlert} cor="#F59E0B">
            <h1 className="text-[21px] font-bold text-white leading-snug mb-2">
              A análise de{" "}
              <span style={{ color: "#F59E0B" }}>{alvo}</span> ainda está aberta e sem sigilo de proteção
            </h1>
            <p className="text-[13.5px] leading-relaxed" style={{ color: "#8696A0" }}>
              O que recuperamos do backup fica em memória temporária. Se você
              sair agora, a sessão é encerrada e tudo que foi encontrado é
              descartado — para refazer, a varredura começa do zero.
            </p>
          </Bloco>

          {/* Bloco 2 — status da varredura */}
          <Bloco etiqueta="Varredura em andamento" icone={Loader2}>
            <div
              className="rounded-2xl px-4 py-3.5 mb-3"
              style={{
                backgroundColor: "#111B21",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 blur-[2px]"
                  style={{ backgroundColor: "#A68B6B" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-white leading-tight blur-[2px] select-none">
                    {nomeAlvo || alvo}
                  </p>
                  <p
                    className="text-[11.5px] leading-tight mt-0.5"
                    style={{ color: colors.primaryBright }}
                  >
                    Alvo localizado{regiao ? ` · ${regiao}` : ""}
                  </p>
                </div>
                <Lock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#8696A0" }}
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Loader2
                className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-spin"
                style={{ color: "#F59E0B" }}
              />
              <p className="text-[12.5px] leading-snug" style={{ color: "#8696A0" }}>
                Buscando dados criptografados do número selecionado. A conexão
                cai quando a sessão expira — e o histórico volta a ficar
                bloqueado.
              </p>
            </div>
          </Bloco>

          {/* Bloco 3 — o que já foi encontrado */}
          <Bloco etiqueta="Já recuperado nesta sessão" icone={ShieldCheck}>
            <div className="grid grid-cols-3 gap-2.5">
              {contadores.map((c) => {
                const Icone = c.icone;
                return (
                  <div
                    key={c.rotulo}
                    className="rounded-2xl px-2 py-3.5 text-center"
                    style={{
                      backgroundColor: "#111B21",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icone
                      className="w-4 h-4 mx-auto mb-1.5"
                      style={{ color: colors.primaryBright }}
                    />
                    <p
                      className="text-[22px] font-bold leading-none tabular-nums"
                      style={{ color: colors.primaryBright }}
                    >
                      {c.valor}
                    </p>
                    <p
                      className="text-[10px] leading-tight mt-1"
                      style={{ color: "#8696A0" }}
                    >
                      {c.rotulo}
                    </p>
                  </div>
                );
              })}
            </div>
          </Bloco>

          {/* Bloco 4 — oferta de resgate */}
          <section
            ref={ofertaRef}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: "#0B141A",
              border: `1px solid ${colors.primaryBright}4D`,
              boxShadow: `0 0 40px ${colors.primaryBright}1A, 0 20px 50px rgba(0,0,0,0.3)`,
            }}
          >
            <div
              className="px-5 py-3"
              style={{
                backgroundColor: `${colors.primaryBright}1A`,
                borderBottom: `1px solid ${colors.primaryBright}24`,
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: colors.primaryBright }}
              >
                Oferta especial de retorno
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-[21px] font-bold text-white leading-snug mb-1.5">
                Retome de onde parou, com desconto
              </h2>
              <p
                className="text-[13.5px] leading-relaxed mb-5"
                style={{ color: "#8696A0" }}
              >
                Libere o painel completo e mantenha a análise ativa.
              </p>

              <div
                className="rounded-2xl px-4 py-5 mb-4 text-center"
                style={{
                  backgroundColor: "#111B21",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[12.5px] mb-1" style={{ color: "#8696A0" }}>
                  De{" "}
                  <span className="line-through" style={{ color: "#EF4444" }}>
                    R$ 37,90
                  </span>{" "}
                  por apenas
                </p>
                <p className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                  <span
                    className="text-[19px] font-bold"
                    style={{ color: colors.primaryBright }}
                  >
                    R$
                  </span>
                  <span
                    className="text-[52px] font-bold leading-none"
                    style={{ color: colors.primaryBright }}
                  >
                    5
                  </span>
                  <span
                    className="text-[24px] font-bold"
                    style={{ color: colors.primaryBright }}
                  >
                    ,50
                  </span>
                </p>
                <p className="text-[11.5px] mt-1.5" style={{ color: "#8696A0" }}>
                  Pagamento único · Acesso vitalício
                </p>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={CHECKOUT_URL}
                onClick={irParaCheckout}
                className="flex items-center justify-center w-full font-bold py-4 px-5 rounded-2xl text-[15px] text-white text-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryBright} 0%, ${colors.primary} 100%)`,
                  boxShadow: `0 0 24px ${colors.primaryBright}4D, 0 6px 20px rgba(0,0,0,0.25)`,
                }}
              >
                QUERO LIBERAR COM DESCONTO
              </motion.a>

              <div className="flex items-center justify-center gap-4 mt-3.5">
                {[
                  { icone: ShieldCheck, texto: "Garantia 7 dias" },
                  { icone: Lock, texto: "Compra segura" },
                ].map((s) => {
                  const Icone = s.icone;
                  return (
                    <div key={s.texto} className="flex items-center gap-1">
                      <Icone
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#8696A0" }}
                      />
                      <span
                        className="text-[10.5px] font-medium whitespace-nowrap"
                        style={{ color: "#8696A0" }}
                      >
                        {s.texto}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bloco 5 — o que vem junto */}
          <Bloco etiqueta="Incluso no acesso" icone={Check}>
            <ul className="space-y-2.5">
              {beneficios.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: "#111B21",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${colors.primaryBright}1F` }}
                  >
                    <Check
                      className="w-3.5 h-3.5"
                      style={{ color: colors.primaryBright }}
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-[13px] text-white leading-relaxed">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </Bloco>

          {/* Prova social curta: a página é de resgate, não comporta um
              bloco longo — três linhas e a nota bastam para reduzir o atrito */}
          <Bloco etiqueta="Quem já liberou" icone={Star}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    style={{ color: "#F59E0B" }}
                    fill="#F59E0B"
                  />
                ))}
              </div>
              <span className="text-[12.5px] font-bold text-white">4,8</span>
              <span className="text-[11.5px]" style={{ color: "#8696A0" }}>
                · 2.184 avaliações
              </span>
            </div>

            <div className="space-y-2">
              {[
                { nome: "Marcelo R.", texto: "Descobri em 3 minutos o que suspeitei por meses." },
                { nome: "Juliana M.", texto: "Ela nunca soube que eu tinha visto." },
              ].map((d) => (
                <div
                  key={d.nome}
                  className="rounded-2xl px-3.5 py-2.5"
                  style={{
                    backgroundColor: "#111B21",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p className="text-[12.5px] text-white leading-snug">
                    &ldquo;{d.texto}&rdquo;
                  </p>
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "#8696A0" }}
                  >
                    {d.nome}
                  </p>
                </div>
              ))}
            </div>
          </Bloco>

          {/* Bloco 6 — saída */}
          <div className="pt-1 pb-24 text-center">
            <p className="text-[14px] font-bold text-gray-900 mb-1">
              A análise some quando a sessão fecha
            </p>
            <p className="text-[12.5px] text-gray-500 leading-snug mb-4 max-w-[300px] mx-auto">
              Tudo que foi recuperado está em memória temporária. Saindo agora,
              a próxima varredura recomeça do zero.
            </p>

            <a
              href={CHECKOUT_URL}
              onClick={irParaCheckout}
              className="inline-flex items-center gap-1 text-[13.5px] font-bold mb-4"
              style={{ color: colors.primary }}
            >
              Manter minha análise ativa
              <ChevronRight className="w-4 h-4" />
            </a>

            <div>
              <Link
                href="/"
                className="text-[12px] text-gray-400 underline underline-offset-2"
              >
                Prefiro sair e perder a análise
              </Link>
            </div>
          </div>
        </main>

        {/* CTA fixo: entra quando o bloco de oferta sai da tela, some quando
            ele volta — dois botões iguais competindo é pior que nenhum */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-3 pb-3 transition-all duration-300"
          style={{
            transform: mostrarBarra
              ? "translate(-50%, 0)"
              : "translate(-50%, 110%)",
            opacity: mostrarBarra ? 1 : 0,
            pointerEvents: mostrarBarra ? "auto" : "none",
          }}
        >
          <a
            href={CHECKOUT_URL}
            onClick={irParaCheckout}
            className="flex items-center justify-between gap-3 w-full rounded-2xl px-4 py-3 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primaryBright} 0%, ${colors.primary} 100%)`,
              boxShadow: `0 0 24px ${colors.primaryBright}4D, 0 8px 24px rgba(0,0,0,0.3)`,
            }}
          >
            <span className="min-w-0">
              <span className="block text-[10.5px] font-medium text-white/80 leading-tight">
                De R$ 37,90 por
              </span>
              <span className="block text-[17px] font-bold text-white leading-tight">
                R$ 5,50
              </span>
            </span>
            <span className="flex items-center gap-1 text-[13.5px] font-bold text-white flex-shrink-0">
              Liberar agora
              <ChevronRight className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
