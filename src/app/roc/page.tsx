"use client";

import ProfileConfirmModal from "../components/ProfileConfirmModal";
import LoadingAnalysis from "../components/LoadingAnalysis";
import InstagramDirect from "../components/InstagramDirect";
import ChatIndividual from "../components/ChatIndividual";
import PitchPage from "../components/PitchPage";
import { useNavigation } from "../../hooks/useNavigation";
import { useCounter } from "../../hooks/useCounter";
import { colors, glassmorphism } from "../../constants/theme";
import { ReactElement } from "react";
import {
  Lock,
  ChevronDown,
  TriangleAlert,
  MessageCircle,
  Smile,
  Camera,
  Mic,
  MapPin,
  Heart,
  Smartphone,
  Loader2,
} from "lucide-react";

interface HomeProps {
  animation_title?: string;
  animation_subtitle?: string;
  animation_subtitle2?: string;
  search_title?: ReactElement;
  search_subtitle?: ReactElement;
}

export default function RocPage(props: HomeProps) {
  const navigation = useNavigation({ skipIntro: true });
  const counter = useCounter({ autoStart: true }); // Always start counter since we skip intro

  // Se está na tela de pitch, mostrar apenas ela
  if (navigation.showPitch) {
    return (
      <PitchPage userName={navigation.instagramHandle} />
    );
  }

  // Se está na tela de chat individual, mostrar apenas ela
  if (navigation.showChat && navigation.selectedChatId) {
    return (
      <ChatIndividual
        chatId={navigation.selectedChatId}
        onBack={navigation.handleBackFromChat}
        onPitch={navigation.handlePitchPage}
      />
    );
  }

  // Se está na tela do Instagram Direct, mostrar apenas ela
  if (navigation.showDirect) {
    return (
      <InstagramDirect
        username={navigation.instagramHandle}
        onBack={navigation.handleBackFromDirect}
        onChatSelect={navigation.handleChatSelect}
        onPitch={navigation.handlePitchPage}
      />
    );
  }

  // Se está na tela de loading, mostrar apenas ela
  if (navigation.showLoading) {
    return (
      <LoadingAnalysis
        username={navigation.instagramHandle}
        onComplete={navigation.handleLoadingComplete}
      />
    );
  }

  return (
    <>
      {/* Modal de confirmação */}
      <ProfileConfirmModal
        isOpen={navigation.showModal}
        username={navigation.instagramHandle}
        targetName={navigation.targetName}
        onConfirm={navigation.handleModalConfirm}
        onCancel={navigation.handleModalCancel}
        profileImageUrl={navigation.profileImageUrl}
        isFetchingProfileImage={navigation.isFetchingProfileImage}
        fullName={navigation.fullName}
        bio={navigation.bio}
        userLocation={navigation.userLocation}
        isFetchingLocation={navigation.isFetchingLocation}
        hasPerformedSearch={navigation.hasPerformedSearch}
        onPitch={navigation.handlePitchPage}
        setSelectedChat={navigation.setSelectedChat}
      />


      {/* Layout principal */}
      <div
        className="min-h-screen relative overflow-x-hidden opacity-100"
        style={{ background: colors.gray[50] }}
      >
        {/* Logo no topo */}
        <div
          className="fixed top-0 left-0 right-0 z-10 flex justify-center"
          style={{ paddingTop: "calc(2rem + env(safe-area-inset-top, 0px))" }}
        >
          <div className="w-24 h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Logo do projeto"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Background animado do globo terrestre */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ paddingBottom: "20vh" }}
        >
          <div className="relative w-96 h-96 opacity-10">
            {/* Globo principal */}
            <div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: colors.primary }}
            >
              {/* Continentes simplificados */}
              <div
                className="absolute top-8 left-12 w-16 h-12 rounded-full opacity-30"
                style={{ backgroundColor: colors.primary }}
              ></div>
              <div
                className="absolute top-16 right-8 w-20 h-16 rounded-full opacity-20"
                style={{ backgroundColor: colors.secondary }}
              ></div>
              <div
                className="absolute bottom-12 left-16 w-24 h-12 rounded-lg opacity-25"
                style={{ backgroundColor: colors.primary }}
              ></div>
              <div
                className="absolute bottom-8 right-12 w-12 h-12 rounded-full opacity-30"
                style={{ backgroundColor: colors.secondary }}
              ></div>
            </div>
            {/* Anéis orbitais */}
            <div
              className="absolute inset-[-20px] rounded-full border-2 opacity-30"
              style={{ borderColor: colors.secondary }}
            ></div>
            <div
              className="absolute inset-[-40px] rounded-full border opacity-20"
              style={{ borderColor: colors.secondary }}
            ></div>
            <div
              className="absolute inset-[-60px] rounded-full border-2 opacity-15"
              style={{ borderColor: colors.primary }}
            ></div>
          </div>
        </div>

        {/* Container principal, centralizado verticalmente (evita corte em telas baixas) */}
        <div
          className="relative z-10 min-h-screen flex items-center justify-center"
          style={{
            paddingTop: "calc(9.5rem + env(safe-area-inset-top, 0px))",
            paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="px-6 w-full">
            <div className="w-full max-w-[420px] mx-auto relative">
              {/* Card flutuante do contador */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border border-gray-200">
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-base font-bold whitespace-nowrap ${colors.gradients.primaryText}`}
                    >
                      <Smartphone
                        className="w-3.5 h-3.5"
                        style={{ color: colors.primary }}
                      />
                      +{counter.formatCount()}
                    </span>
                    <p className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                      dispositivos espionados hoje
                    </p>
                  </div>
                </div>
              </div>

              {/* Container com efeito glass */}
              <div
                className="rounded-3xl p-8 pt-12 shadow-xl border border-white/20 backdrop-blur-lg"
                style={glassmorphism}
              >
                {/* Descrição com títulos maiores */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 pt-7 text-gray-900">
                    {props.search_title ? (
                      props.search_title
                    ) : (
                      <>
                        O que seu{" "}
                        <span className={colors.gradients.primaryText}>
                          Cônjuge
                        </span>{" "}
                        faz quando está no WhatsApp?
                      </>
                    )}
                  </h1>
                  <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-gray-700">
                    {props.search_subtitle ? (
                      props.search_subtitle
                    ) : (
                      <>
                        Descubra a verdade sobre{" "}
                        <span
                          className={`${colors.gradients.primaryText} font-bold`}
                        >
                          qualquer pessoa
                        </span>
                        , acessando o WhatsApp dela!
                      </>
                    )}
                  </h2>
                </div>

                {/* Botão principal ou Input de pesquisa */}
                {!navigation.showSearchCard ? (
                  <div className="mb-6">
                    {/* Ícone estilo tela de boas-vindas do WhatsApp */}
                    <div
                      className="mx-auto mb-5 rounded-full flex items-center justify-center relative overflow-hidden"
                      style={{
                        width: 104,
                        height: 104,
                        backgroundColor: `${colors.primary}12`,
                      }}
                    >
                      <div className="grid grid-cols-3 gap-3 opacity-40">
                        <Smile className="w-4 h-4" style={{ color: colors.primary }} />
                        <Camera className="w-4 h-4" style={{ color: colors.primary }} />
                        <Mic className="w-4 h-4" style={{ color: colors.primary }} />
                        <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                        <Heart className="w-4 h-4" style={{ color: colors.primary }} />
                        <MessageCircle className="w-4 h-4" style={{ color: colors.primary }} />
                      </div>
                      <div
                        className="absolute w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7"
                          fill="#ffffff"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                        </svg>
                      </div>
                    </div>

                    {/* Aviso estilo tela de boas-vindas do WhatsApp */}
                    <p className="text-center text-xs text-gray-500 mb-5 px-2 leading-relaxed">
                      Seus dados são tratados com sigilo total. Ao continuar,
                      você concorda com nossa{" "}
                      <span
                        className="font-semibold"
                        style={{ color: colors.primary }}
                      >
                        Política de Privacidade
                      </span>
                      .
                    </p>

                    <button
                      onClick={navigation.handleTestClick}
                      disabled={navigation.isTransitioning}
                      className={`w-full text-white py-4 px-6 rounded-full font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:brightness-110 ${
                        navigation.isTransitioning ? "opacity-50" : ""
                      }`}
                      style={{
                        background: colors.gradients.primary,
                        boxShadow: `0 8px 24px ${colors.primaryBright}4D`,
                      }}
                    >
                      Verificar Agora
                    </button>

                    {/* Texto de segurança */}
                    <div className="text-center mt-3">
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Lock
                          className="w-4 h-4"
                          style={{ color: colors.primary }}
                        />
                        <span className="text-sm font-medium text-left">
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
                    </div>
                  </div>
                ) : (
                  <div className="transition-all duration-500 ease-in-out mb-2">
                    <div>
                      {/* Selo do WhatsApp, reforçando a autenticidade da tela */}
                      <div className="flex justify-center mb-5">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-8 h-8"
                            fill="#ffffff"
                            aria-hidden="true"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                          </svg>
                        </div>
                      </div>

                      {/* Seletor de país, no padrão nativo do WhatsApp */}
                      <div
                        className="w-full flex items-center justify-between py-3 border-b"
                        style={{ borderColor: colors.gray[200] }}
                      >
                        <span
                          className="text-base font-medium"
                          style={{ color: "#111827" }}
                        >
                          Brasil
                        </span>
                        <ChevronDown
                          className="w-4 h-4"
                          style={{ color: "#9CA3AF" }}
                        />
                      </div>

                      {/* Campo do número, no padrão nativo do WhatsApp */}
                      <div
                        className="flex items-center py-3 border-b-2 transition-colors duration-300"
                        style={{
                          borderColor: navigation.isPhoneValid
                            ? colors.primary
                            : colors.gray[200],
                        }}
                      >
                        <span
                          className="font-medium mr-3"
                          style={{ fontSize: "16px", color: "#111827" }}
                        >
                          +55
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                          placeholder="Insira o número"
                          aria-label="Insira o número de telefone"
                          maxLength={16}
                          className="flex-1 bg-transparent text-gray-900 placeholder-gray-400"
                          style={{
                            fontSize: "16px",
                            outline: "none",
                            boxShadow: "none",
                            WebkitAppearance: "none",
                            appearance: "none",
                          }}
                          value={navigation.instagramHandle}
                          onChange={navigation.handleInputChange}
                          onFocus={navigation.handleInputFocus}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        Sujeita a cobranças da sua operadora.
                      </p>

                      {/* Botão de avançar, no padrão nativo do WhatsApp */}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => navigation.handleSearch()}
                          disabled={
                            !navigation.isPhoneValid ||
                            navigation.isFetchingProfileImage
                          }
                          className="px-10 py-3 rounded-full font-semibold text-white tracking-wide transition-all duration-300 disabled:cursor-not-allowed active:scale-[0.98]"
                          style={{
                            background: colors.gradients.primary,
                            boxShadow: `0 6px 18px ${colors.primaryBright}4D`,
                            opacity:
                              !navigation.isPhoneValid &&
                              !navigation.isFetchingProfileImage
                                ? 0.4
                                : 1,
                          }}
                        >
                          {navigation.isFetchingProfileImage ? (
                            <span className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Localizando...</span>
                            </span>
                          ) : (
                            "AVANÇAR"
                          )}
                        </button>
                      </div>

                      {/* Texto de limite */}
                      <div className="text-center pt-5">
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <TriangleAlert
                            className="w-3.5 h-3.5"
                            style={{ color: colors.primary }}
                          />
                          <span className="text-xs font-medium">
                            Apenas 1 busca por pessoa.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS customizados para animações */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
      `}</style>
    </>
  );
}
