"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Smartphone, Radar } from "lucide-react";
import { colors } from "../../constants/theme";

interface IntroAnimationProps {
  onComplete: () => void;
  title?: string;
  subscription?: string;
  subscription_2?: string;
}

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
  const [animationPhase, setAnimationPhase] = useState<
    "enter" | "display" | "exit"
  >("enter");

  // Array com os caminhos dos avatares
  const avatars = [
    "/avatares/avatar 01.png",
    "/avatares/avatar 02.png",
    "/avatares/avatar 03.png",
    "/avatares/avatar 04.png",
    "/avatares/avatar 05.png",
    "/avatares/avatar 06.png",
    "/avatares/avatar 07.png",
    "/avatares/avatar 08.png",
    "/avatares/avatar 9.png",
    "/avatares/avatar 10.png",
  ];

  // Avatar central (primeiro da lista)
  const centralAvatar = avatars[0];

  // Avatares orbitantes (8 avatares ao redor)
  const orbitingAvatars = avatars.slice(1, 9).map((avatar, index) => ({
    src: avatar,
    angle: (360 / 8) * index, // 8 avatares distribuídos uniformemente
  }));

  // Animação do contador
  useEffect(() => {
    if (showCounter) {
      const target = 14832;
      const duration = 1200; // 1.2 segundos
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

  // Controle das fases da animação
  useEffect(() => {
    const timers = [
      // Mostrar texto da plataforma após 1.5 segundos
      setTimeout(() => setShowBrand(true), 1500),
      // Mostrar contador após 3 segundos
      setTimeout(() => setShowCounter(true), 3000),
      // Mostrar subtexto após 4.5 segundos
      setTimeout(() => setShowSubtext(true), 4500),
      // Iniciar saída após 8.5 segundos
      setTimeout(() => setAnimationPhase("exit"), 8500),
      // Finalizar após 10 segundos
      setTimeout(() => {
        setShowAnimation(false);
        onComplete();
      }, 10000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Fundo neutro */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          animationPhase === "exit" ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "#F9FAFB",
        }}
      />

      {/* Container central */}
      <div className="relative flex flex-col items-center justify-center px-6 max-h-screen">
        {/* Sistema de avatares */}
        <div className="relative w-72 h-72 mb-6 flex items-center justify-center">
          {/* Avatar central com pulso */}
          <div
            className={`relative z-10 transition-all duration-700 ${
              animationPhase === "exit"
                ? "opacity-0 scale-75"
                : "opacity-100 scale-100"
            }`}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg animate-pulse-central">
              <Image
                src={centralAvatar}
                alt="Avatar Central"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Avatares orbitantes */}
          <div
            className={`absolute inset-0 animate-orbit transition-all duration-700 ${
              animationPhase === "exit"
                ? "opacity-0 scale-75"
                : "opacity-100 scale-100"
            }`}
          >
            {orbitingAvatars.map((avatar, index) => (
              <div
                key={index}
                className="absolute w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translateY(-100px)`,
                }}
              >
                <Image
                  src={avatar.src}
                  alt={`Avatar ${index + 1}`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Texto da plataforma - PRIMEIRO */}
        <div
          className={`text-center max-w-sm mb-6 transition-all duration-1000 ${
            showBrand && animationPhase !== "exit"
              ? "opacity-100 translate-y-0 scale-100"
              : showBrand && animationPhase === "exit"
              ? "opacity-0 -translate-y-2 scale-90"
              : "opacity-0 translate-y-6 scale-95"
          }`}
        >
          <h2 className="text-lg md:text-xl font-bold leading-tight text-gray-900">
            {title
              ? title
              : "Descubra Tudo o que Fazem no WhatsApp"}
            <br />
            {subscription
              ? subscription
              : "Em Apenas 2 Minutos"}
          </h2>
        </div>

        {/* Contador principal - SEGUNDO */}
        <div
          className={`text-center mb-6 transition-all duration-1000 ${
            showCounter && animationPhase !== "exit"
              ? "opacity-100 translate-y-0"
              : showCounter && animationPhase === "exit"
              ? "opacity-0 -translate-y-4 scale-95"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 inline-flex items-center justify-center gap-2.5">
            <Smartphone
              className="w-8 h-8 md:w-9 md:h-9"
              style={{ color: colors.primary }}
            />
            +{counter.toLocaleString("pt-BR")}
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-medium">
            dispositivos espionados hoje
          </p>
        </div>

        {/* Texto secundário - TERCEIRO */}
        <div
          className={`text-center transition-all duration-1000 ${
            showSubtext && animationPhase !== "exit"
              ? "opacity-70 translate-y-0"
              : showSubtext && animationPhase === "exit"
              ? "opacity-0 translate-y-2"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-gray-500 text-sm md:text-base inline-flex items-center justify-center gap-1.5">
            <Radar className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
            <span className="text-left">
              {subscription_2
                ? subscription_2
                : "Rastreamento de conversas e localização em tempo real"}
            </span>
          </p>
        </div>
      </div>

      {/* Estilos CSS customizados */}
      <style jsx>{`
        .animate-pulse-central {
          animation: pulse-central 2.5s ease-in-out infinite;
        }

        .animate-orbit {
          animation: orbit 15s linear infinite;
        }

        @keyframes pulse-central {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
          }
          50% {
            box-shadow: 0 0 0 25px rgba(37, 211, 102, 0);
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
