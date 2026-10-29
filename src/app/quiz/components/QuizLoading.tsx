"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { colors } from "../../../constants/theme";

const loadingTexts = [
  "Analisando padrões de comportamento...",
  "Cruzando pegadas digitais públicas...",
  "Avaliando nível de exposição e risco...",
  "Gerando relatório confidencial...",
];

const TOTAL_DURATION_MS = 6000;

interface QuizLoadingProps {
  onComplete: () => void;
}

export default function QuizLoading({ onComplete }: QuizLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
      setProgress(next);
      if (next >= 100) {
        clearInterval(progressInterval);
        setTimeout(onComplete, 500);
      }
    }, 100);

    const textInterval = setInterval(() => {
      setTextIndex((i) => Math.min(loadingTexts.length - 1, i + 1));
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [onComplete]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: colors.gray[50] }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: `conic-gradient(${colors.primaryDark}, ${colors.primary}, ${colors.primaryBright}, ${colors.primaryDark})`,
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
            }}
          />
          <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center">
            <Sparkles className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Processando seu diagnóstico
        </h2>

        <div className="h-6 mb-6">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-600"
          >
            {loadingTexts[textIndex]}
          </motion.p>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: colors.gradients.primary,
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color: colors.primary }}>
          {Math.round(progress)}%
        </span>
      </motion.div>
    </div>
  );
}
