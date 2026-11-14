"use client";

import IntroAnimation from "./components/IntroAnimation";
import ProfileConfirmModal from "./components/ProfileConfirmModal";
import LoadingAnalysis from "./components/LoadingAnalysis";
import InstagramDirect from "./components/InstagramDirect";
import ChatIndividual from "./components/ChatIndividual";
import PitchPage from "./components/PitchPage";
import { useNavigation } from "../hooks/useNavigation";
import { useCounter } from "../hooks/useCounter";
import { colors, glassmorphism } from "../constants/theme";
import { ReactElement, useRef, useState } from "react";
import {
  Lock,
  TriangleAlert,
  MessageCircle,
  Smile,
  Camera,
  Mic,
  MapPin,
  Heart,
  Smartphone,
  Loader2,
  Check,
  User,
} from "lucide-react";

interface HomeProps {
  animation_title?: string;
  animation_subtitle?: string;
  animation_subtitle2?: string;
  search_title?: ReactElement;
  search_subtitle?: ReactElement;
  // Preenchidos quando o usuário chega de outro funil (ex: quiz) com o número já capturado
  initialPhone?: string;
  skipIntro?: boolean;
}

export default function Home(props: HomeProps) {
  const navigation = useNavigation({
    initialPhone: props.initialPhone,
    skipIntro: props.skipIntro,
  });
  const counter = useCounter({ autoStart: !navigation.showIntro });
  // Sem isto o campo não responde ao toque: a borda só reagia quando já
  // havia conteúdo, então focar não dava retorno nenhum.
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(
    null
  );
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const fieldBorder = (field: "name" | "phone", filled: boolean) => {
    if (focusedField === field) return colors.primaryBright;
    return filled ? colors.primary : colors.gray[200];
  };

  // Se está na tela de pitch, mostrar apenas ela
  if (navigation.showPitch) {
    const searchedUsername =
      typeof window !== "undefined"
        ? localStorage.getItem("searchedUsername")
        : "";
    return (
      <PitchPage
        userName={searchedUsername || navigation.instagramHandle}
      />
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
    // Mesmo recurso do pitch: recarregar a página em ?etapa=loading zera o
    // estado do React, e a tela ficaria exibindo um número vazio.
    const numeroBuscado =
      typeof window !== "undefined"
        ? localStorage.getItem("searchedUsername")
        : "";
    return (
      <LoadingAnalysis
        username={numeroBuscado || navigation.instagramHandle}
        onComplete={navigation.handleLoadingComplete}
      />
    );
  }

  return (
    <>
      {/* Animação de entrada */}
      {navigation.showIntro && (
        <IntroAnimation
          title={props.animation_title}
          subscription={props.animation_subtitle}
          subscription_2={props.animation_subtitle2}
          onComplete={navigation.handleIntroComplete}
        />
      )}

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
        className={`min-h-screen relative overflow-x-hidden transition-opacity duration-1000 ${
          navigation.showIntro ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: colors.gray[50] }}
      >
        {/* Logo no topo */}
        <div
          className="fixed top-0 left-0 right-0 z-10 flex justify-center"
          style={{ paddingTop: "max(1rem, calc(1rem + env(safe-area-inset-top, 0px)))" }}
        >
          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Detetive WhatsApp - Ferramenta de Monitoramento"
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
            paddingTop: "calc(6rem + env(safe-area-inset-top, 0px))",
            paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="px-6 w-full max-w-6xl mx-auto">
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
                className="rounded-3xl px-6 pb-6 pt-16 md:p-8 md:pt-16 shadow-xl border border-white/20 backdrop-blur-lg"
                style={glassmorphism}
              >
                {/* Descrição com títulos maiores */}
                <div className="text-center mb-5">
                  <h1 className="text-[20px] md:text-3xl font-bold leading-tight mb-2.5 text-gray-900">
                    {props.search_title ? (
                      props.search_title
                    ) : (
                      <>
                        Sua intuição{" "}
                        <span className={colors.gradients.primaryText}>
                          nunca errou
                        </span>
                        . Tire a prova real agora mesmo.
                      </>
                    )}
                  </h1>
                  <h2
                    className={`text-[15px] md:text-xl font-semibold leading-snug text-gray-700 ${
                      navigation.showSearchCard ? "hidden" : ""
                    }`}
                  >
                    {props.search_subtitle ? (
                      props.search_subtitle
                    ) : (
                      <>
                        <span
                          className={`${colors.gradients.primaryText} font-bold`}
                        >
                          Sem ninguém saber
                        </span>
                        , você vê tudo. Mensagem apagada, celular trancado,
                        desculpa pronta: nada disso te impede. Basta o número.
                      </>
                    )}
                  </h2>
                </div>

                {/* Botão principal ou Input de pesquisa */}
                {!navigation.showSearchCard ? (
                  <div className="mb-6">
                    {/* Ícone estilo tela de boas-vindas do WhatsApp */}
                    <div
                      className="mx-auto mb-3 rounded-full flex items-center justify-center relative overflow-hidden"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: `${colors.primary}12`,
                      }}
                    >
                      <div className="grid grid-cols-3 gap-2 opacity-40">
                        <Smile className="w-3 h-3" style={{ color: colors.primary }} />
                        <Camera className="w-3 h-3" style={{ color: colors.primary }} />
                        <Mic className="w-3 h-3" style={{ color: colors.primary }} />
                        <MapPin className="w-3 h-3" style={{ color: colors.primary }} />
                        <Heart className="w-3 h-3" style={{ color: colors.primary }} />
                        <MessageCircle className="w-3 h-3" style={{ color: colors.primary }} />
                      </div>
                      <div
                        className="absolute w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="#ffffff"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                        </svg>
                      </div>
                    </div>

                    {/* Os três passos: mostra de saída que são poucos e rápidos */}
                    <div className="flex items-start mb-4 px-1">
                      {[
                        "Informe o número",
                        "Analisamos o backup",
                        "Você vê as conversas",
                      ].map((passo, i) => (
                        <div key={passo} className="flex-1 flex flex-col items-center relative">
                          {i > 0 && (
                            <span
                              className="absolute top-[13px] right-1/2 w-full h-px"
                              style={{ backgroundColor: `${colors.primary}33` }}
                            />
                          )}
                          <div
                            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[12px] font-bold relative z-10 mb-1.5"
                            style={
                              i === 0
                                ? {
                                    backgroundColor: colors.primaryBright,
                                    color: "#fff",
                                    boxShadow: `0 0 0 3px ${colors.primaryBright}26`,
                                  }
                                : {
                                    backgroundColor: "#fff",
                                    color: "#9CA3AF",
                                    border: "1px solid #E5E7EB",
                                  }
                            }
                          >
                            {i + 1}
                          </div>
                          <span
                            className="text-[10.5px] leading-tight text-center px-0.5"
                            style={{
                              color: i === 0 ? colors.primary : "#9CA3AF",
                              fontWeight: i === 0 ? 700 : 500,
                            }}
                          >
                            {passo}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={navigation.handleTestClick}
                      disabled={navigation.isTransitioning}
                      className={`w-full text-white py-3.5 px-6 rounded-full font-bold text-[17px] shadow-sm transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:brightness-110 ${
                        navigation.isTransitioning ? "opacity-50" : ""
                      }`}
                      style={{
                        background: colors.gradients.primary,
                        boxShadow: `0 8px 24px ${colors.primaryBright}4D`,
                      }}
                    >
                      Verificar Agora
                    </button>

                    {/* Selo de anonimato e aviso legal, compactos sob o botão */}
                    <div className="text-center mt-2.5 space-y-1">
                      <div className="flex items-start justify-center gap-1.5 text-gray-600">
                        <Lock
                          className="w-3.5 h-3.5 flex-shrink-0 mt-[3px]"
                          style={{ color: colors.primary }}
                        />
                        <span className="text-[13px] font-medium text-left">
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
                      <p className="text-[10.5px] text-gray-400 leading-snug">
                        Ao continuar, você concorda com nossa{" "}
                        <span
                          className="font-semibold"
                          style={{ color: `${colors.primary}B3` }}
                        >
                          Política de Privacidade
                        </span>
                        .
                      </p>
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

                      {/* Campo do nome: rótulo próprio em vez de só
                          placeholder, que some assim que a pessoa digita e
                          deixa o campo sem contexto */}
                      <label className="block mb-4">
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                          Nome da pessoa
                        </span>
                        <span
                          className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors duration-200"
                          style={{
                            backgroundColor: "#F6F7F9",
                            border: `1.5px solid ${fieldBorder(
                              "name",
                              !!navigation.targetName.trim()
                            )}`,
                          }}
                        >
                          <User
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "#9CA3AF" }}
                          />
                          <input
                            type="text"
                            placeholder="Ex: Maria"
                            aria-label="Digite o nome da pessoa"
                            maxLength={50}
                            autoCapitalize="words"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="next"
                            className="flex-1 min-w-0 bg-transparent text-gray-900 placeholder-gray-400 font-medium"
                            style={{
                              fontSize: "16px",
                              outline: "none",
                              boxShadow: "none",
                              WebkitAppearance: "none",
                              appearance: "none",
                            }}
                            value={navigation.targetName}
                            onChange={navigation.handleNameChange}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                phoneInputRef.current?.focus();
                              }
                            }}
                          />
                          {navigation.isNameValid && (
                            <Check
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: colors.primaryBright }}
                            />
                          )}
                        </span>
                      </label>

                      {/* Número: país e DDI ficam dentro do mesmo campo. Eram
                          duas linhas separadas, e a seta do "Brasil" prometia
                          um seletor que não existe — agora é um selo fixo. */}
                      <label className="block">
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                          Número do WhatsApp
                        </span>
                        <span
                          className="flex items-center rounded-xl pr-3.5 transition-colors duration-200 overflow-hidden"
                          style={{
                            backgroundColor: "#F6F7F9",
                            border: `1.5px solid ${fieldBorder(
                              "phone",
                              navigation.isPhoneValid
                            )}`,
                          }}
                        >
                          <span
                            className="flex items-center gap-1.5 self-stretch pl-3.5 pr-3 flex-shrink-0"
                            style={{ borderRight: "1px solid #E5E7EB" }}
                            title="Disponível apenas para números do Brasil"
                          >
                            <span className="text-[15px] leading-none">🇧🇷</span>
                            <span
                              className="text-[15px] font-semibold"
                              style={{ color: "#111827" }}
                            >
                              +55
                            </span>
                            <Check
                              className="w-3 h-3 flex-shrink-0"
                              style={{ color: colors.primaryBright }}
                            />
                          </span>

                          <input
                            ref={phoneInputRef}
                            type="tel"
                            inputMode="numeric"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="go"
                            placeholder="(00) 00000-0000"
                            aria-label="Insira o número de telefone"
                            maxLength={16}
                            className="flex-1 min-w-0 bg-transparent text-gray-900 placeholder-gray-400 font-medium py-3 pl-3"
                            style={{
                              fontSize: "16px",
                              outline: "none",
                              boxShadow: "none",
                              WebkitAppearance: "none",
                              appearance: "none",
                            }}
                            value={navigation.instagramHandle}
                            onChange={navigation.handleInputChange}
                            onFocus={() => {
                              setFocusedField("phone");
                              navigation.handleInputFocus();
                            }}
                            onBlur={() => setFocusedField(null)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                navigation.isPhoneValid &&
                                navigation.isNameValid
                              ) {
                                e.preventDefault();
                                navigation.handleSearch();
                              }
                            }}
                          />
                          {navigation.isPhoneValid && (
                            <Check
                              className="w-4 h-4 flex-shrink-0 ml-2"
                              style={{ color: colors.primaryBright }}
                            />
                          )}
                        </span>
                      </label>

                      <p className="text-xs text-gray-500 mt-3">
                        Sujeita a cobranças da sua operadora.
                      </p>

                      {/* Botão de avançar, no padrão nativo do WhatsApp */}
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => navigation.handleSearch()}
                          disabled={
                            !navigation.isPhoneValid ||
                            !navigation.isNameValid ||
                            navigation.isFetchingProfileImage
                          }
                          className="px-10 py-3 rounded-full font-semibold text-white tracking-wide transition-all duration-300 disabled:cursor-not-allowed active:scale-[0.98] hover:brightness-110"
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
