"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, glassmorphism } from "../../../constants/theme";

interface QuizOption {
  value: "A" | "B" | "C";
  label: string;
}

interface Question {
  question: string;
  options: QuizOption[];
}

const questions: Question[] = [
  {
    question:
      "Quando você questiona algo que achou estranho no comportamento do seu cônjuge, qual é a reação dele(a)?",
    options: [
      { value: "A", label: "Conversa abertamente e me passa segurança." },
      { value: "B", label: "Fica defensivo(a) e muda de assunto rapidamente." },
      {
        value: "C",
        label:
          'Me ataca de volta, dizendo que sou "louco(a)", "paranoico(a)" ou "ciumento(a)".',
      },
    ],
  },
  {
    question:
      "Com que frequência você nota mudanças súbitas de privacidade (como esconder a tela do celular, mudar senhas ou virar o aparelho para baixo)?",
    options: [
      { value: "A", label: "Nunca, temos total transparência." },
      { value: "B", label: "Raramente, mas já notei algumas vezes." },
      {
        value: "C",
        label:
          "Frequentemente, parece que há um cuidado excessivo para eu não ver nada.",
      },
    ],
  },
  {
    question: "Como está a sua saúde mental e a qualidade do seu sono ultimamente?",
    options: [
      { value: "A", label: "Durmo bem e me sinto seguro(a)." },
      {
        value: "B",
        label: "Tenho episódios de ansiedade leve, mas consigo controlar.",
      },
      {
        value: "C",
        label:
          'Sinto um nó constante no peito, noites mal dormidas e a sensação de que "sei de algo, mas não tenho provas".',
      },
    ],
  },
  {
    question:
      "Se você descobrisse a verdade absoluta hoje, de forma 100% anônima e segura, o que isso mudaria na sua vida?",
    options: [
      { value: "A", label: "Só confirmaria o que já sei para eu tomar uma decisão." },
      {
        value: "B",
        label: "Me traria o alívio e a paz de espírito que não tenho há meses.",
      },
      { value: "C", label: "Me ajudaria a parar de mentir para mim mesmo(a)." },
    ],
  },
];

interface QuizQuestionsProps {
  onComplete: (answers: string[]) => void;
}

export default function QuizQuestions({ onComplete }: QuizQuestionsProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const current = questions[index];
  const percent = Math.round(((index + (selected ? 1 : 0)) / questions.length) * 100);

  const handleSelect = (value: string) => {
    if (selected) return;
    setSelected(value);
    const next = [...answers, value];

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setAnswers(next);
        setIndex(index + 1);
        setSelected(null);
      } else {
        onComplete(next);
      }
    }, 400);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: colors.gray[50] }}
    >
      {/* Logo */}
      <div className="pt-8 pb-2 flex justify-center">
        <div className="w-16 h-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Logo do projeto"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="px-6 max-w-md w-full mx-auto mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">
            Pergunta {index + 1} de {questions.length}
          </span>
          <span className="text-xs font-semibold" style={{ color: colors.primary }}>
            {percent}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: colors.gradients.primary }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 backdrop-blur-lg"
              style={glassmorphism}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-6">
                {current.question}
              </h2>
              <div className="space-y-3">
                {current.options.map((opt) => {
                  const isSelected = selected === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      disabled={selected !== null}
                      style={
                        isSelected
                          ? {
                              borderColor: colors.primary,
                              backgroundColor: `${colors.primary}0D`,
                            }
                          : undefined
                      }
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] flex items-start space-x-3 disabled:cursor-not-allowed ${
                        isSelected
                          ? ""
                          : "border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                        style={{ background: colors.gradients.primary }}
                      >
                        {opt.value}
                      </span>
                      <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
