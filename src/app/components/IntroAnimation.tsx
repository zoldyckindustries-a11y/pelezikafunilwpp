"use client";

import { useState, useEffect } from "react";
import { Radar, Lock, Search } from "lucide-react";
import { colors } from "../../constants/theme";

interface IntroAnimationProps {
  onComplete: () => void;
  title?: string;
  subscription?: string;
  subscription_2?: string;
}

// Linhas da lista que está sendo varrida. Larguras irregulares porque
// conversa real não tem nome nem prévia do mesmo tamanho.
const LINHAS = [
  { nome: "62%", previa: "84%", hora: "23:14", naoLidas: 2, tom: "#F4CF8E" },
  { nome: "44%", previa: "70%", hora: "22:08", naoLidas: 0, tom: "#A8B5C4" },
  { nome: "55%", previa: "90%", hora: "21:35", naoLidas: 1, tom: "#C9A882" },
  { nome: "38%", previa: "62%", hora: "ontem", naoLidas: 0, tom: "#9DB5A0" },
  { nome: "58%", previa: "78%", hora: "ontem", naoLidas: 3, tom: "#D4A5A5" },
];

export default function IntroAnimation({
  onComplete,
  title,
  subscription,
  subscription_2,
}: IntroAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [counter, setCounter] = useState(0);
  const [showBrand, setShowBrand] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [linhasVisiveis, setLinhasVisiveis] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<
    "enter" | "display" | "exit"
  >("enter");

  // As conversas entram uma a uma, como quem acabou de achar cada uma
  useEffect(() => {
    if (linhasVisiveis >= LINHAS.length) return;
    const t = setTimeout(() => setLinhasVisiveis((n) => n + 1), 260);
    return () => clearTimeout(t);
  }, [linhasVisiveis]);

  useEffect(() => {
    if (showCounter) {
      const target = 14832;
      const duration = 1200;
      const steps = 60;
      const increment = target / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounter(target);
          clearInterval(timer);
        } else {
          setCounter(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [showCounter]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowBrand(true), 1600),
      setTimeout(() => setShowCounter(true), 2600),
      setTimeout(() => setShowSubtext(true), 3600),
      setTimeout(() => setAnimationPhase("exit"), 7000),
      setTimeout(() => {
        setShowAnimation(false);
        onComplete();
      }, 8200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!showAnimation) return null;

  const saindo = animationPhase === "exit";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          saindo ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "#0B141A" }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          saindo ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 34%, rgba(37,211,102,0.13) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center px-5 w-full max-w-[352px]">
        {/* Marca. Dois pesos da Inter no mesmo tamanho: o contraste vem da
            espessura, não de cor ou corpo — é o que separa um wordmark de
            um título qualquer. */}
        <div
          className={`mb-6 transition-all duration-700 ${
            saindo ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <span
            className="block text-[27px] leading-none text-white"
            style={{ letterSpacing: "-0.035em" }}
          >
            <span style={{ fontWeight: 800 }}>Zap</span>
            <span style={{ fontWeight: 300 }}>Lens</span>
          </span>
          {/* filete sob a marca, some nas pontas */}
          <span
            className="block mt-2 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />
        </div>

        {/* Varredura da lista: mostra o produto em vez de uma abstração */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden mb-6 transition-all duration-700 ${
            saindo ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
          style={{
            backgroundColor: "#111B21",
            border: "1px solid rgba(37,211,102,0.2)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          }}
        >
          {/* Cabeçalho do painel */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: "rgba(37,211,102,0.09)",
              borderBottom: "1px solid rgba(37,211,102,0.14)",
            }}
          >
            <Search
              className="w-3 h-3 flex-shrink-0 animate-pulse"
              style={{ color: colors.primaryBright }}
            />
            <span
              className="text-[9.5px] font-bold uppercase tracking-wider"
              style={{ color: colors.primaryBright }}
            >
              Varrendo conversas
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" style={{ color: "#8696A0" }} />
              <span className="text-[9px]" style={{ color: "#8696A0" }}>
                bloqueado
              </span>
            </span>
          </div>

          <div className="relative px-2.5 py-2">
            {LINHAS.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-[7px] transition-all duration-500"
                style={{
                  opacity: i < linhasVisiveis ? 1 : 0,
                  transform:
                    i < linhasVisiveis ? "translateX(0)" : "translateX(-12px)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full blur-[2.5px] flex-shrink-0"
                  style={{ backgroundColor: l.tom }}
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div
                    className="h-[7px] rounded-full blur-[1.5px]"
                    style={{
                      width: l.nome,
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }}
                  />
                  <div
                    className="h-[6px] rounded-full blur-[1.5px]"
                    style={{
                      width: l.previa,
                      backgroundColor: "rgba(255,255,255,0.18)",
                    }}
                  />
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className="text-[8.5px] font-medium"
                    style={{
                      color: l.naoLidas ? colors.primaryBright : "#8696A0",
                    }}
                  >
                    {l.hora}
                  </span>
                  {l.naoLidas > 0 && (
                    <span
                      className="min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: colors.primaryBright }}
                    >
                      {l.naoLidas}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Feixe do scanner percorrendo a lista */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="scanner-beam" />
            </div>
          </div>
        </div>

        <div
          className={`text-center mb-5 transition-all duration-700 ${
            showBrand && !saindo
              ? "opacity-100 translate-y-0"
              : showBrand && saindo
              ? "opacity-0 -translate-y-2"
              : "opacity-0 translate-y-5"
          }`}
        >
          <h2 className="text-[20px] md:text-2xl font-bold leading-tight text-white">
            {title ? title : "O que apagaram não sumiu"}
          </h2>
          <p
            className="text-[13.5px] mt-1.5 leading-snug"
            style={{ color: "#8696A0" }}
          >
            {subscription ? subscription : "Basta o número para ver tudo"}
          </p>
        </div>

        <div
          className={`text-center mb-5 transition-all duration-700 ${
            showCounter && !saindo
              ? "opacity-100 translate-y-0"
              : showCounter && saindo
              ? "opacity-0 -translate-y-3"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h1
            className="text-[40px] md:text-5xl font-bold leading-none tabular-nums"
            style={{ color: colors.primaryBright }}
          >
            {counter.toLocaleString("pt-BR")}
          </h1>
          <p
            className="text-[12.5px] font-medium mt-1.5"
            style={{ color: "#8696A0" }}
          >
            números verificados nas últimas 24h
          </p>
        </div>

        <div
          className={`text-center transition-all duration-700 ${
            showSubtext && !saindo
              ? "opacity-100 translate-y-0"
              : showSubtext && saindo
              ? "opacity-0 translate-y-2"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
            style={{ backgroundColor: "rgba(37,211,102,0.10)" }}
          >
            <Radar
              className="w-3.5 h-3.5 flex-shrink-0 animate-spin-slow"
              style={{ color: colors.primaryBright }}
            />
            <span
              className="text-[11.5px] font-medium"
              style={{ color: colors.primaryBright }}
            >
              {subscription_2 ? subscription_2 : "Conexão segura · 100% anônimo"}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scanner-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 46px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(37, 211, 102, 0.07) 45%,
            rgba(37, 211, 102, 0.22) 78%,
            rgba(37, 211, 102, 0.95) 100%
          );
          animation: scan 2.1s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(-46px);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translateY(190px);
            opacity: 0;
          }
        }

        .animate-spin-slow {
          animation: girar 3.5s linear infinite;
        }

        @keyframes girar {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scanner-beam,
          .animate-spin-slow {
            animation: none;
          }
          .scanner-beam {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
