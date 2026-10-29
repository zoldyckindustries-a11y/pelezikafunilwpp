"use client";

import { motion } from "framer-motion";
import { Eye, ShieldAlert, BadgeCheck, TriangleAlert } from "lucide-react";
import { colors } from "../../../constants/theme";

interface QuizResultProps {
  answers: string[];
  onContinue: () => void;
}

const benefits = [
  {
    icon: Eye,
    text: "Análise detalhada de vínculos digitais e perfis ativos.",
  },
  {
    icon: ShieldAlert,
    text: "Nível real de exposição e risco do relacionamento.",
  },
  {
    icon: BadgeCheck,
    text: "A verdade definitiva para você tirar esse peso dos ombros em minutos.",
  },
];

export default function QuizResult({ answers, onContinue }: QuizResultProps) {
  const handleContinueClick = () => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.track("Lead", {
          content_name: `quiz_${answers.join("")}`,
        });
      });
    onContinue();
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: colors.gray[50] }}>
      <div className="max-w-md mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <TriangleAlert className="w-7 h-7" style={{ color: colors.primary }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
            O diagnóstico do seu relacionamento está pronto.
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            Com base nas suas respostas, detectamos um{" "}
            <span className="font-bold text-red-600">Alto Nível de Desgaste</span> e{" "}
            <span className="font-bold text-red-600">Sinais de Alerta Ativos</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            Viver nessa corda bamba, passando noites em claro e sendo
            rotulado(a) como &quot;o louco da relação&quot; toda vez que busca a
            verdade, não é justo com você. O pior não é a verdade em si; é a
            angústia de ser a última pessoa a saber o que acontece nos
            bastidores. Você respondeu que busca paz de espírito e respostas
            definitivas. Nós temos a tecnologia para te entregar isso agora.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pt-1.5">
                  {item.text}
                </p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={handleContinueClick}
            className="block w-full text-center font-bold text-white py-4 px-6 rounded-full shadow-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            style={{
              background: colors.gradients.primary,
              boxShadow: `0 8px 24px ${colors.primaryBright}4D`,
            }}
          >
            Quero Acesso ao Meu Relatório 100% Anônimo
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Acesso instantâneo e 100% confidencial.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
