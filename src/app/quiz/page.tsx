"use client";

import { useState } from "react";
import Home from "@/app/page";
import QuizQuestions from "./components/QuizQuestions";
import QuizLoading from "./components/QuizLoading";
import QuizResult from "./components/QuizResult";
import QuizPhoneCapture from "./components/QuizPhoneCapture";

type QuizPhase = "questions" | "loading" | "result" | "phone" | "funnel";

export default function QuizPage() {
  const [phase, setPhase] = useState<QuizPhase>("questions");
  const [answers, setAnswers] = useState<string[]>([]);
  const [phone, setPhone] = useState("");

  if (phase === "loading") {
    return <QuizLoading onComplete={() => setPhase("result")} />;
  }

  if (phase === "result") {
    return <QuizResult answers={answers} onContinue={() => setPhase("phone")} />;
  }

  if (phase === "phone") {
    return (
      <QuizPhoneCapture
        onSubmit={(value) => {
          setPhone(value);
          setPhase("funnel");
        }}
      />
    );
  }

  if (phase === "funnel") {
    // Entrega o lead já qualificado (telefone capturado) direto para o funil
    // original: confirmação, análise e oferta.
    return <Home initialPhone={phone} skipIntro />;
  }

  return (
    <QuizQuestions
      onComplete={(finalAnswers) => {
        setAnswers(finalAnswers);
        setPhase("loading");
      }}
    />
  );
}
