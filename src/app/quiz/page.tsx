"use client";

import { useState, useEffect, useCallback } from "react";
import Home from "@/app/page";
import QuizQuestions, { QUIZ_QUESTIONS } from "./components/QuizQuestions";
import QuizLoading from "./components/QuizLoading";
import QuizResult from "./components/QuizResult";
import QuizPhoneCapture from "./components/QuizPhoneCapture";
import {
  ETAPA_PARAM,
  PERGUNTA_PARAM,
  escreverParams,
  garantirIndiceNav,
  lerParam,
  voltar,
} from "@/lib/urlState";

type QuizPhase = "questions" | "loading" | "result" | "phone" | "funnel";

const CHAVE_RESPOSTAS = "quizRespostas";

interface FaseDoQuiz {
  fase: QuizPhase;
  pergunta: number;
}

/**
 * Lê a fase do quiz na URL. Devolve null quando a URL descreve uma etapa do
 * funil principal — nesse caso o quiz já entregou o lead e quem manda é o
 * funil.
 */
function lerFaseDoQuiz(): FaseDoQuiz | null {
  const etapa = lerParam(ETAPA_PARAM);
  if (!etapa) return null;

  if (etapa === "questions") {
    const pergunta = Number(lerParam(PERGUNTA_PARAM) ?? "1");
    const valida =
      Number.isFinite(pergunta) &&
      pergunta >= 1 &&
      pergunta <= QUIZ_QUESTIONS.length;
    return { fase: "questions", pergunta: valida ? pergunta : 1 };
  }

  if (etapa === "loading" || etapa === "result" || etapa === "phone") {
    return { fase: etapa, pergunta: 0 };
  }

  return null;
}

export default function QuizPage() {
  const [fase, setFase] = useState<QuizPhase>("questions");
  const [pergunta, setPergunta] = useState(1);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [phone, setPhone] = useState("");

  // A URL guarda a fase e a pergunta: o botão voltar do navegador precisa
  // devolver à pergunta anterior, e um link direto precisa abrir a pergunta
  // certa.
  useEffect(() => {
    garantirIndiceNav();

    const lido = lerFaseDoQuiz();
    if (lido) {
      setFase(lido.fase);
      setPergunta(lido.pergunta);
    } else if (lerParam(ETAPA_PARAM) === null) {
      escreverParams(
        { [ETAPA_PARAM]: "questions", [PERGUNTA_PARAM]: 1 },
        "replace"
      );
    } else {
      // A URL já aponta para uma etapa do funil principal.
      setFase("funnel");
    }

    // As respostas ficam fora da URL: sobrevivem ao voltar/avançar sem
    // entrar em link compartilhado.
    try {
      const bruto = sessionStorage.getItem(CHAVE_RESPOSTAS);
      if (bruto) setRespostas(JSON.parse(bruto));
    } catch {
      // storage corrompido não pode derrubar a tela
    }

    const aoVoltar = () => {
      const proximo = lerFaseDoQuiz();
      if (!proximo) {
        setFase("funnel");
        return;
      }
      setFase(proximo.fase);
      setPergunta(proximo.pergunta);
    };

    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  const handleAnswer = useCallback(
    (value: string, index: number) => {
      // Responder de novo apaga o que veio depois: as perguntas seguintes
      // precisam ser respondidas de novo.
      const novas = [...respostas.slice(0, index), value];
      setRespostas(novas);
      try {
        sessionStorage.setItem(CHAVE_RESPOSTAS, JSON.stringify(novas));
      } catch {
        // storage indisponível não impede o quiz de seguir
      }

      if (index + 1 < QUIZ_QUESTIONS.length) {
        const proxima = index + 2;
        setPergunta(proxima);
        escreverParams(
          { [ETAPA_PARAM]: "questions", [PERGUNTA_PARAM]: proxima },
          "push"
        );
      } else {
        setFase("loading");
        escreverParams(
          { [ETAPA_PARAM]: "loading", [PERGUNTA_PARAM]: null },
          "push"
        );
      }
    },
    [respostas]
  );

  const handleLoadingComplete = () => {
    setFase("result");
    escreverParams({ [ETAPA_PARAM]: "result", [PERGUNTA_PARAM]: null }, "replace");
  };

  const handleResultContinue = () => {
    setFase("phone");
    escreverParams({ [ETAPA_PARAM]: "phone", [PERGUNTA_PARAM]: null }, "push");
  };

  const handlePhoneSubmit = (value: string) => {
    setPhone(value);
    setFase("funnel");
    // A URL passa a ser a do funil: é ela que manda a partir daqui.
    escreverParams({ [ETAPA_PARAM]: "search", [PERGUNTA_PARAM]: null }, "push");
  };

  const handlePhoneBack = () =>
    voltar(() => {
      setFase("result");
      escreverParams(
        { [ETAPA_PARAM]: "result", [PERGUNTA_PARAM]: null },
        "replace"
      );
    });

  if (fase === "loading") {
    return <QuizLoading onComplete={handleLoadingComplete} />;
  }

  if (fase === "result") {
    return <QuizResult answers={respostas} onContinue={handleResultContinue} />;
  }

  if (fase === "phone") {
    return (
      <QuizPhoneCapture
        value={phone}
        onChange={setPhone}
        onSubmit={handlePhoneSubmit}
        onBack={handlePhoneBack}
      />
    );
  }

  if (fase === "funnel") {
    // Entrega o lead já qualificado (telefone capturado) direto para o funil
    // original: confirmação, análise e oferta.
    return <Home initialPhone={phone} skipIntro />;
  }

  return (
    <QuizQuestions
      index={pergunta - 1}
      answers={respostas}
      onAnswer={handleAnswer}
    />
  );
}
