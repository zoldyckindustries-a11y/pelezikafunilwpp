"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, ChevronRight } from "lucide-react";
import { colors, glassmorphism } from "../../../constants/theme";

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const isValidBrazilianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
};

interface QuizPhoneCaptureProps {
  // Controlado pelo pai: voltar do funil para esta tela precisa devolver o
  // número que já tinha sido digitado.
  value: string;
  onChange: (value: string) => void;
  onSubmit: (phone: string) => void;
  onBack?: () => void;
}

export default function QuizPhoneCapture({
  value,
  onChange,
  onSubmit,
  onBack,
}: QuizPhoneCaptureProps) {
  const isValid = isValidBrazilianPhone(value);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: colors.gray[50] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 backdrop-blur-lg"
        style={glassmorphism}
      >
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Última etapa para liberar seu relatório completo
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Para cruzar os dados do diagnóstico, precisamos apenas do número de
            WhatsApp dele(a).
          </p>
        </div>

        <label
          className="block text-xs font-semibold ml-1 mb-1"
          style={{ color: colors.gray[600] }}
        >
          Insira o número de telefone
        </label>
        <div className="relative flex items-center mb-4">
          <span
            className="absolute left-4 font-semibold text-sm"
            style={{ color: colors.primary }}
          >
            +55
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Número de telefone"
            aria-label="Insira o número de telefone"
            maxLength={16}
            value={value}
            onChange={(e) => onChange(formatPhoneNumber(e.target.value))}
            className="w-full placeholder:text-sm py-4 pr-6 pl-14 bg-white bg-opacity-80 rounded-full text-gray-700 placeholder-gray-500 focus:ring-2 focus:outline-none transition-all duration-300 shadow-lg"
            style={
              { fontSize: "14px", "--tw-ring-color": colors.primary } as React.CSSProperties
            }
          />
          <button
            onClick={() => isValid && onSubmit(value)}
            disabled={!isValid}
            className="absolute right-2 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: isValid ? colors.primary : colors.gray[300],
              color: colors.primary,
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Lock className="w-4 h-4" style={{ color: colors.primary }} />
          <span className="text-xs font-medium">
            100% Anônimo. A pessoa{" "}
            <span
              className="font-bold"
              style={{ color: colors.primary }}
            >
              NUNCA
            </span>{" "}
            vai saber.
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 text-gray-500 mt-2">
          <Eye className="w-3.5 h-3.5" />
          <span className="text-xs">Apenas 1 consulta por pessoa.</span>
        </div>
      </motion.div>
    </div>
  );
}
