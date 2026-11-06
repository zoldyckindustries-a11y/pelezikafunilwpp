"use client";

import { useAnimation } from "../../hooks/useAnimation";
import { colors } from "../../constants/theme";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2, MessageCircle, Lock, MapPin } from "lucide-react";
import PitchPage from "../components/PitchPage";
import { LocationData } from "../services/locationService";

interface ProfileConfirmModalProps {
  isOpen: boolean;
  username: string;
  targetName: string;
  onConfirm: () => void;
  onCancel: () => void;
  profileImageUrl: string | null;
  isFetchingProfileImage: boolean;
  fullName?: string;
  bio?: string;
  userLocation?: LocationData;
  isFetchingLocation?: boolean;
  hasPerformedSearch: boolean;
  onPitch: () => void;
  setSelectedChat: (chatId: number) => void;
}

export default function ProfileConfirmModal({
  isOpen,
  username,
  targetName,
  onConfirm,
  onCancel,
  profileImageUrl,
  isFetchingProfileImage,
  bio,
  userLocation,
  isFetchingLocation,
  hasPerformedSearch,
  onPitch,
  setSelectedChat,
}: ProfileConfirmModalProps) {
  const { getTransitionClasses } = useAnimation({ initialVisible: isOpen });
  const [showPitch, setShowPitch] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    // Em localhost (ambiente de teste local), sempre roda o fluxo completo —
    // o atalho de "só 1 busca por pessoa" só vale no ambiente publicado.
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (hasPerformedSearch && !isLocalhost) {
      setShowPitch(true);
      setSelectedChat(1);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {showPitch && (
        <div style={{ overflow: "auto", maxHeight: "100vh" }}>
          <PitchPage onBack={() => {}} userName={targetName} hasBack={false} />
        </div>
      )}

      <div
        style={showPitch ? { display: "none" } : {}}
        className={getTransitionClasses("max-w-sm mx-4")}
      >
        <div
          className="bg-white rounded-3xl p-8 shadow-2xl border border-white/20"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Ícone de confirmação / Imagem do perfil */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
              <AnimatePresence mode="wait">
                {isFetchingProfileImage ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Loader2
                      className="animate-spin h-8 w-8"
                      style={{ color: colors.primary }}
                    />
                  </motion.div>
                ) : profileImageUrl ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={profileImageUrl}
                      alt="Foto do perfil"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full overflow-hidden"
                  >
                    {/* Avatar padrão, no estilo do contato sem foto no WhatsApp */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "38%",
                        height: "38%",
                        top: "16%",
                        left: "31%",
                        backgroundColor: colors.primary,
                        opacity: 0.45,
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "78%",
                        height: "78%",
                        bottom: "-30%",
                        left: "11%",
                        backgroundColor: colors.primary,
                        opacity: 0.45,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
              {!isFetchingProfileImage && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Dispositivo Localizado
            </h3>
            {userLocation ? (
              <div className="mb-2.5">
                <p className="text-lg font-semibold text-gray-800 mb-1 flex items-center justify-center gap-1.5">
                  <MapPin
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: colors.primary }}
                  />
                  {userLocation.city}, {userLocation.state}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: colors.gray[100] }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-[11px] font-medium text-gray-600">
                    Localização aproximada pelo IP da operadora
                  </span>
                </div>
              </div>
            ) : isFetchingLocation ? (
              <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1.5">
                <Loader2
                  className="w-3.5 h-3.5 animate-spin flex-shrink-0"
                  style={{ color: colors.primary }}
                />
                Localizando dispositivo...
              </p>
            ) : null}
            <p className="text-gray-600 mb-2">
              Pronto para descobrir a verdade sobre{" "}
              <span className="font-bold text-gray-900">{targetName}</span>?
            </p>
            <p className="text-xs text-gray-500 italic">
              Seus dados estão 100% protegidos. {targetName} nunca saberá.
            </p>
            {bio && <p className="text-sm text-gray-700 mt-2 italic">{bio}</p>}

            <div
              className="flex items-center justify-center space-x-2 mt-4 py-2.5 px-4 rounded-xl"
              style={{ backgroundColor: colors.gray[100] }}
            >
              <MessageCircle
                className="w-4 h-4 flex-shrink-0"
                style={{ color: colors.primary }}
              />
              <span className="text-sm text-gray-700">
                Status do alvo:{" "}
                <span className="font-bold" style={{ color: colors.primary }}>
                  Online agora
                </span>
              </span>
            </div>
          </div>

          {/* Aviso */}
          <div
            className="p-4 rounded-2xl mb-6"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <div className="flex items-start space-x-3">
              <Lock
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: colors.primary }}
              />
              <p className="text-sm text-gray-700">
                O modo furtivo está ativado. O dono do número não receberá
                nenhuma notificação de acesso.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="py-3 px-5 rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmClick}
              className="flex-1 py-3 px-4 rounded-full text-white font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-lg"
              style={{
                background: colors.gradients.primary,
                boxShadow: `0 4px 16px ${colors.primaryBright}4D`,
              }}
            >
              Acessar Conversas
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
