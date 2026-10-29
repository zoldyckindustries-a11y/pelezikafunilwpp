"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Check,
  Search,
  Smartphone,
  User,
  Database,
  ShieldAlert,
  Phone,
  Lock,
} from "lucide-react";
import { colors } from "../../constants/theme";

interface LoadingAnalysisProps {
  username: string;
  onComplete: () => void;
}

interface LocateStep {
  icon: typeof Search;
  label: string;
  result: string;
}

export default function LoadingAnalysis({
  username,
  onComplete,
}: LoadingAnalysisProps) {
  const locateSteps: LocateStep[] = [
    { icon: Search, label: `Localizando número ${username}...`, result: "Encontrado" },
    { icon: Smartphone, label: "Verificando operadora e dispositivo...", result: "WhatsApp ativo" },
    { icon: User, label: "Identificando tipo de perfil...", result: "Pessoal" },
    { icon: Database, label: "Verificando backup em nuvem...", result: "Acesso concedido" },
    { icon: ShieldAlert, label: "Validando brecha de segurança...", result: "Vulnerabilidade confirmada" },
  ];
  const [locateIndex, setLocateIndex] = useState(0);
  const [locatePhase, setLocatePhase] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [typingPassword, setTypingPassword] = useState("");
  const [cryptographyStatus, setCryptographyStatus] = useState("testing"); // 'testing', 'success'
  const [isTestingActive, setIsTestingActive] = useState(true);

  // Usar useRef para evitar dependência no useEffect
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Gera os perfis de demonstração localmente (sem chamadas de API externa).
  // As conversas "desbloqueadas" usam os mesmos nomes/avatares fixos do
  // ChatIndividual, para que a lista bata com o que abre ao tocar nelas.
  const buildDemoProfiles = () => {
    const unlockedConversations = [
      {
        pk: "1001",
        username: "gatinha_love",
        full_name: "Gatinha_love",
        profile_pic_url: "/avatares/avatardirect01.png",
      },
      {
        pk: "1002",
        username: "meuamor_22",
        full_name: "MeuAmor_22",
        profile_pic_url: "/avatares/avatardirect02.png",
      },
      {
        pk: "1003",
        username: "crush_forever",
        full_name: "Crush_Forever",
        profile_pic_url: "/avatares/avatardirect03.png",
      },
      {
        pk: "1004",
        username: "segredo_nosso",
        full_name: "Segredo_Nosso",
        profile_pic_url: "/avatares/avatardirect04.png",
      },
    ];

    const followerNames = [
      { username: "ana.costa92", full_name: "Ana Costa" },
      { username: "lucas.santos", full_name: "Lucas Santos" },
      { username: "julia_mendes", full_name: "Julia Mendes" },
      { username: "pedro_oliveira", full_name: "Pedro Oliveira" },
      { username: "camila.alves", full_name: "Camila Alves" },
      { username: "rafael.souza", full_name: "Rafael Souza" },
      { username: "bia_ferreira", full_name: "Bia Ferreira" },
      { username: "thiago.lima", full_name: "Thiago Lima" },
    ];
    const avatarFiles = [
      "/avatares/avatar 02.png",
      "/avatares/avatar 03.png",
      "/avatares/avatar 04.png",
      "/avatares/avatar 05.png",
      "/avatares/avatar 06.png",
      "/avatares/avatar 07.png",
      "/avatares/avatar 08.png",
    ];
    const followers = followerNames.map((f, index) => ({
      pk: `20${index + 1}`,
      id: `20${index + 1}`,
      username: f.username,
      full_name: f.full_name,
      profile_pic_url: avatarFiles[index % avatarFiles.length],
      is_private: false,
      is_verified: false,
    }));

    localStorage.setItem("followers", JSON.stringify(followers));
    localStorage.setItem(
      "unlockedConversations",
      JSON.stringify(unlockedConversations)
    );
  };

  // Chaves de criptografia falsas testadas durante a quebra do end-to-end
  const passwords = [
    "4F3A9E21B8C6D502",
    "8B2E71F4A9C3D610",
    "1A7D44F9E2B8C305",
    "D29F561AC8E73B04",
    "6C4E819FA3D72B50",
    "F03B8D6724AE9C15",
    "72A4C9E1B6F80D33",
    "B91E3A7C4F208D65",
    "3DF7A0B9C5E14628",
    "9A6C2E4F7B1D8530",
    "E58B31D9A746F2C0",
    "2C9F70E4B1A835D6",
  ];

  // Caracteres para efeito de digitação (dígitos hexadecimais, como as chaves reais)
  const chars = "0123456789ABCDEF";

  // Animação de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Avança a sequência de localização passo a passo; ao final, libera a fase de quebra de senha
  useEffect(() => {
    if (locateIndex >= locateSteps.length) {
      const t = setTimeout(() => setLocatePhase(false), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLocateIndex((i) => i + 1), 850);
    return () => clearTimeout(t);
  }, [locateIndex, locateSteps.length]);

  // Função para criar efeito de digitação
  const typePassword = (targetPassword: string) => {
    return new Promise<void>((resolve) => {
      if (!isTestingActive) {
        resolve();
        return;
      }

      setIsTypingEffect(true);
      setTypingPassword("");

      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < targetPassword.length && isTestingActive) {
          // Simula digitação caractere por caractere
          let randomChars = "";
          for (let i = 0; i <= currentIndex; i++) {
            if (i === currentIndex) {
              // Último caractere sendo "descoberto"
              randomChars +=
                Math.random() < 0.7
                  ? targetPassword[i]
                  : chars[Math.floor(Math.random() * chars.length)];
            } else {
              randomChars += targetPassword[i];
            }
          }
          setTypingPassword(randomChars);
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTypingPassword(targetPassword);
          setIsTypingEffect(false);
          setTimeout(resolve, 0);
        }
      }, 10);
    });
  };

  // Password animation - só inicia após a fase de localização terminar
  useEffect(() => {
    if (locatePhase) return;

    let passwordIndex = 0;
    let isActive = true; // Local flag to control if active

    // Gera os perfis de demonstração usados no Direct
    buildDemoProfiles();

    const testNextPassword = async () => {
      if (passwordIndex < passwords.length && isActive) {
        await typePassword(passwords[passwordIndex]);
        if (isActive) {
          setCurrentPassword(passwords[passwordIndex]);
          passwordIndex++;

          // Wait a bit before the next password
          setTimeout(testNextPassword, 100);
        }
      } else if (isActive) {
        // Restart cycle if passwords are finished
        passwordIndex = 0;
        setTimeout(testNextPassword, 100);
      }
    };

    testNextPassword();

    // Stop animation after 12 seconds
    const timeoutId = setTimeout(() => {
      isActive = false; // Stop local loop
      setIsTestingActive(false); // Stop test loop
      setCryptographyStatus("success"); // Update card to success
      setPasswordBlurred(true);

      // Show notification after 1 second
      setTimeout(() => {
        setShowNotification(true);

        // Finish after 3 more seconds
        setTimeout(() => {
          onCompleteRef.current(); // Use ref instead of dependency
        }, 3000);
      }, 1000);
    }, 12000);

    return () => {
      isActive = false; // Clear local flag
      clearTimeout(timeoutId);
      setIsTestingActive(false);
    };
  }, [locatePhase]); // roda uma única vez, quando locatePhase passa a false

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-white transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="w-full max-w-sm mx-auto px-6">
        {locatePhase ? (
          <div className="py-8">
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Search
                  className="w-7 h-7 animate-pulse"
                  style={{ color: colors.primary }}
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Localizando número
              </h2>
              <p className="text-sm text-gray-500 mt-1">{username}</p>
            </div>

            <div className="space-y-3">
              {locateSteps.map((step, i) => {
                if (i > locateIndex) return null;
                const isDone = i < locateIndex;
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-300 ${
                      isDone
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: colors.primary }}
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {step.label}
                      </span>
                    </div>
                    {isDone ? (
                      <span
                        className="text-xs font-semibold flex items-center space-x-1 flex-shrink-0 ml-2"
                        style={{ color: colors.primary }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{step.result}</span>
                      </span>
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
        {/* Cabeçalho estilo WhatsApp */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              fill="#ffffff"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
            </svg>
          </div>
          <p className="text-xl font-bold" style={{ color: colors.primaryDark }}>
            WhatsApp
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Criptografia de ponta a ponta
          </p>
        </div>

        {/* Form container */}
        <div className="space-y-4">
          {/* Número verificado */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              disabled
              className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none"
            />
          </div>

          {/* Chave de criptografia com animação */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={isTypingEffect ? typingPassword : currentPassword}
              disabled
              className={`w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded text-sm font-mono tracking-wider text-gray-900 focus:outline-none transition-all duration-300 ${
                passwordBlurred ? "filter blur-sm" : ""
              } ${isTypingEffect ? "border-green-400 bg-green-50" : ""}`}
              placeholder="Chave de criptografia"
              style={{
                borderColor:
                  isTypingEffect && !passwordBlurred ? colors.primary : undefined,
              }}
            />
            {/* Typing indicator */}
            {isTypingEffect && cryptographyStatus === "testing" && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.primary }}
                ></div>
              </div>
            )}
          </div>

          {/* Cryptography status card */}
          <div
            className={`${
              cryptographyStatus === "testing"
                ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            } border rounded-lg p-3 mt-3 transition-all duration-500`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {cryptographyStatus === "testing" ? (
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-white animate-spin" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {cryptographyStatus === "testing"
                    ? "Quebrando a criptografia de ponta a ponta"
                    : "Criptografia quebrada com sucesso!"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {cryptographyStatus === "testing"
                    ? "Testando chaves de descriptografia..."
                    : "Acesso às mensagens concedido!"}
                </p>
              </div>
            </div>
          </div>

          {/* Status da conexão */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">
              Conexão segura estabelecida via servidor espelhado
            </span>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Success notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <Check className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-medium">Mensagens descriptografadas com sucesso!</span>
          </div>
        </div>
      )}
    </div>
  );
}
