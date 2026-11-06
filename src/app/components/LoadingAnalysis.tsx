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

// Grade do QR de pareamento. O QR do WhatsApp Web é bem denso — com poucos
// módulos a leitura é de "quadriculado", não de código. Aqui são 45x45, com
// os três marcadores de canto, os alinhadores internos e as linhas de
// sincronismo nos lugares certos. Não precisa escanear, precisa parecer.
const QR_SIZE = 45;

const QR_CELLS: [number, number][] = (() => {
  const N = QR_SIZE;
  const grid: boolean[][] = Array.from({ length: N }, () =>
    Array(N).fill(false)
  );

  // marcador de canto 7x7: anel externo + miolo 3x3
  const marcador = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const borda = x === 0 || x === 6 || y === 0 || y === 6;
        const miolo = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (borda || miolo) grid[oy + y][ox + x] = true;
      }
    }
  };
  marcador(0, 0);
  marcador(N - 7, 0);
  marcador(0, N - 7);

  // alinhadores 5x5, como nas versões maiores do QR
  const alinhador = (cx: number, cy: number) => {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const borda = Math.abs(x) === 2 || Math.abs(y) === 2;
        const centro = x === 0 && y === 0;
        if (borda || centro) grid[cy + y][cx + x] = true;
      }
    }
  };
  const centros = [6, 22, 38];
  for (const cy of centros) {
    for (const cx of centros) {
      const cantoSup = cx <= 8 && cy <= 8;
      const cantoDir = cx >= N - 9 && cy <= 8;
      const cantoInf = cx <= 8 && cy >= N - 9;
      if (cantoSup || cantoDir || cantoInf) continue;
      alinhador(cx, cy);
    }
  }

  // linhas de sincronismo
  for (let i = 8; i < N - 8; i++) {
    if (i % 2 === 0) {
      grid[6][i] = true;
      grid[i][6] = true;
    }
  }

  const dentroAlinhador = (x: number, y: number) =>
    centros.some((cy) =>
      centros.some((cx) => {
        const cantoSup = cx <= 8 && cy <= 8;
        const cantoDir = cx >= N - 9 && cy <= 8;
        const cantoInf = cx <= 8 && cy >= N - 9;
        if (cantoSup || cantoDir || cantoInf) return false;
        return Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 2;
      })
    );

  const reservado = (x: number, y: number) =>
    (x < 9 && y < 9) ||
    (x > N - 10 && y < 9) ||
    (x < 9 && y > N - 10) ||
    x === 6 ||
    y === 6 ||
    dentroAlinhador(x, y);

  // semente fixa: o mesmo desenho em todo carregamento
  let semente = 20260104;
  const proximo = () => {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff;
    return semente / 0x7fffffff;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!reservado(x, y) && proximo() > 0.5) grid[y][x] = true;
    }
  }

  // abre o miolo para o logo, como o QR do WhatsApp faz
  const meio = Math.floor(N / 2);
  const raio = 5;
  for (let y = meio - raio; y <= meio + raio; y++) {
    for (let x = meio - raio; x <= meio + raio; x++) {
      grid[y][x] = false;
    }
  }

  const out: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (grid[y][x]) out.push([x, y]);
  return out;
})();

interface LocateStep {
  icon: typeof Search;
  label: string;
  result: string;
  // Duração própria: etapas uniformes denunciam que nada está sendo consultado.
  duration: number;
}

export default function LoadingAnalysis({
  username,
  onComplete,
}: LoadingAnalysisProps) {
  const [regiaoLead, setRegiaoLead] = useState<string>("");
  // Cada etapa entrega um dado específico. "Encontrado" não prova nada;
  // "Vivo · Cambará/PR" prova — ainda mais vindo da cidade real do visitante.
  const locateSteps: LocateStep[] = [
    {
      icon: Search,
      label: "Consultando base da operadora",
      result: regiaoLead ? `Vivo · ${regiaoLead}` : "Vivo · linha ativa",
      duration: 2100,
    },
    {
      icon: Smartphone,
      label: "Identificando aparelho",
      result: "Android 14 · WhatsApp 2.24.20.78",
      duration: 2900,
    },
    {
      icon: User,
      label: "Classificando conta",
      result: "Pessoal · 2 dispositivos vinculados",
      duration: 1700,
    },
    {
      icon: Database,
      label: "Localizando backup em nuvem",
      result: "Google Drive · 3,84 GB cifrados",
      duration: 4100,
    },
    {
      icon: ShieldAlert,
      label: "Testando vetor de acesso",
      result: "Sessão espelhada disponível",
      duration: 3300,
    },
  ];
  const [linhasLog, setLinhasLog] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [locateIndex, setLocateIndex] = useState(0);
  const [locatePhase, setLocatePhase] = useState(true);
  // Progresso global, derivado de quantas etapas já fecharam
  const progressoBusca = Math.min(
    100,
    Math.round((locateIndex / locateSteps.length) * 100)
  );
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
    // Sem foto de propósito: as conversas bloqueadas caem no avatar padrão
    // do WhatsApp, colorido por contato. Fotos de banco com fundo branco
    // destoavam das demais e denunciavam que a lista é montada.
    const followers = followerNames.map((f, index) => ({
      pk: `20${index + 1}`,
      id: `20${index + 1}`,
      username: f.username,
      full_name: f.full_name,
      profile_pic_url: "",
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

  // Cidade real do visitante, gravada pelo locationService na busca
  useEffect(() => {
    try {
      const bruto = localStorage.getItem("userLocation");
      if (!bruto) return;
      const loc = JSON.parse(bruto);
      if (loc?.city) {
        setRegiaoLead(loc.state ? `${loc.city}/${loc.state}` : loc.city);
      }
    } catch {
      // localStorage corrompido não pode derrubar a tela
    }
  }, []);

  // Console: uma linha por vez, em ritmo irregular. Cadência uniforme
  // denuncia script tanto quanto texto genérico.
  useEffect(() => {
    if (!locatePhase) return;
    const roteiro = [
      "init: abrindo túnel seguro",
      "gateway: handshake OK (142ms)",
      "consultando HLR da operadora",
      "MSISDN válido · roaming: não",
      "triangulando célula de origem",
      "sinal: -67 dBm · torre 2 de 3",
      "device fingerprint coletado",
      "conta ativa há 4 anos",
      "varrendo índice do backup",
      "12.847 mensagens indexadas",
      "3.291 marcadas como apagadas",
      "chave de sessão interceptada",
      "espelhamento autorizado",
    ];
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const proxima = () => {
      if (i >= roteiro.length) return;
      setLinhasLog((atual) => [...atual.slice(-40), roteiro[i]]);
      i += 1;
      timer = setTimeout(proxima, 700 + Math.random() * 900);
    };
    timer = setTimeout(proxima, 500);
    return () => clearTimeout(timer);
  }, [locatePhase]);

  // mantém o console rolado no fim
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [linhasLog]);

  // Animação de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Avança a sequência de localização passo a passo; ao final, libera a fase de quebra de senha
  useEffect(() => {
    if (locateIndex >= locateSteps.length) {
      const t = setTimeout(() => setLocatePhase(false), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setLocateIndex((i) => i + 1),
      locateSteps[locateIndex].duration
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="pt-2 pb-6">
            {/* Cabeçalho compacto: o número consultado e o sinal de atividade.
                Antes um terço da tela era espaço morto antes do conteúdo. */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{ backgroundColor: `${colors.primary}14` }}
              >
                <Search
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"
                  style={{ backgroundColor: colors.primaryBright }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-gray-900 leading-tight">
                  Rastreando número
                </p>
                <p className="text-[13px] text-gray-500 leading-tight mt-0.5">
                  {username}
                </p>
              </div>
              <span
                className="text-[20px] font-bold tabular-nums flex-shrink-0"
                style={{ color: colors.primary }}
              >
                {progressoBusca}%
              </span>
            </div>

            {/* Progresso global: sem ele a pessoa não sabe se falta muito */}
            <div
              className="h-1.5 w-full rounded-full overflow-hidden mb-5"
              style={{ backgroundColor: "#EDF0F2" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressoBusca}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryBright})`,
                }}
              />
            </div>

            {/* Etapas: todas visíveis desde o início, para a pessoa ver o que
                ainda vem. Cada concluída entrega um dado concreto, não um
                "ok" genérico — é o detalhe que sustenta a credibilidade. */}
            <div className="space-y-2">
              {locateSteps.map((step, i) => {
                const concluido = i < locateIndex;
                const ativo = i === locateIndex;
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-300"
                    style={{
                      backgroundColor: concluido
                        ? "#F0FDF4"
                        : ativo
                        ? "#FFFFFF"
                        : "#FAFAFA",
                      borderColor: concluido
                        ? "#BBF7D0"
                        : ativo
                        ? colors.primary
                        : "#F0F0F0",
                      opacity: concluido || ativo ? 1 : 0.5,
                      boxShadow: ativo
                        ? `0 2px 12px ${colors.primary}1A`
                        : "none",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: concluido
                          ? "#DCFCE7"
                          : ativo
                          ? `${colors.primary}14`
                          : "#F1F2F4",
                      }}
                    >
                      {concluido ? (
                        <Check
                          className="w-3.5 h-3.5"
                          style={{ color: "#16A34A" }}
                          strokeWidth={3}
                        />
                      ) : (
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{
                            color: ativo ? colors.primary : "#9CA3AF",
                          }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[13px] font-medium leading-tight truncate"
                        style={{ color: concluido ? "#166534" : "#374151" }}
                      >
                        {step.label}
                      </p>
                      {concluido && (
                        <p
                          className="text-[11.5px] font-semibold leading-tight mt-0.5 truncate"
                          style={{ color: "#16A34A" }}
                        >
                          {step.result}
                        </p>
                      )}
                    </div>

                    {ativo && (
                      <Loader2
                        className="w-4 h-4 animate-spin flex-shrink-0"
                        style={{ color: colors.primary }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Console. É o elemento que mais vende "sistema trabalhando":
                linhas técnicas que ninguém inventaria para enfeitar. */}
            <div
              className="mt-5 rounded-xl overflow-hidden"
              style={{ backgroundColor: "#0B141A" }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="w-2 h-2 rounded-full bg-red-400/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
                <span className="w-2 h-2 rounded-full bg-green-400/70" />
                <span
                  className="text-[10px] ml-1.5 font-mono"
                  style={{ color: "#8696A0" }}
                >
                  trace.log
                </span>
              </div>
              <div
                ref={consoleRef}
                className="px-3 py-2.5 font-mono text-[10.5px] leading-relaxed overflow-y-auto"
                style={{ height: 92, color: "#8696A0" }}
              >
                {linhasLog.map((linha, i) => (
                  <div
                    key={i}
                    className="flex gap-1.5"
                    style={{
                      color:
                        i === linhasLog.length - 1 ? colors.primaryBright : undefined,
                    }}
                  >
                    <span className="flex-shrink-0 opacity-50">›</span>
                    <span className="min-w-0">{linha}</span>
                  </div>
                ))}
                {linhasLog.length > 0 && (
                  <span
                    className="inline-block w-1.5 h-3 ml-3 align-middle animate-pulse"
                    style={{ backgroundColor: colors.primaryBright }}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Pareamento por QR, como o WhatsApp Web faz de verdade. Substitui
            o discurso de "quebrar criptografia", que não convence quem já
            usou o app — e o QR é a tela que todo mundo reconhece. */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="#ffffff" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
            </svg>
          </div>
          <p className="text-lg font-bold" style={{ color: colors.primaryDark }}>
            WhatsApp Web
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Vinculando dispositivo espelhado
          </p>
        </div>

        {/* QR em leitura */}
        <div className="flex justify-center mb-5">
          <div
            className="relative rounded-2xl bg-white p-3.5"
            style={{
              border: "1px solid #E5E7EB",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div className="relative" style={{ width: 168, height: 168 }}>
              <svg
                viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                className="w-full h-full"
                shapeRendering="crispEdges"
              >
                <rect width={QR_SIZE} height={QR_SIZE} fill="#fff" />
                {QR_CELLS.map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="1" height="1" fill="#1F3933" />
                ))}
              </svg>

              {/* logo central, como no QR do WhatsApp */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                style={{
                  width: 42,
                  height: 42,
                  backgroundColor: "#fff",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1F3933" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                </svg>
              </div>

              {/* feixe de leitura */}
              {cryptographyStatus === "testing" && (
                <div className="absolute inset-0 overflow-hidden rounded">
                  <div className="qr-scan" />
                </div>
              )}

              {/* confirmação ao parear */}
              {cryptographyStatus !== "testing" && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded"
                  style={{ backgroundColor: "rgba(255,255,255,0.88)" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              disabled
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={isTypingEffect ? typingPassword : currentPassword}
              disabled
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm font-mono tracking-wider text-gray-900 focus:outline-none transition-all duration-300 ${
                passwordBlurred ? "filter blur-sm" : ""
              }`}
              placeholder="Token da sessão"
              style={{
                borderColor:
                  isTypingEffect && !passwordBlurred ? colors.primary : "#E5E7EB",
                backgroundColor: isTypingEffect ? "#F0FDF4" : "#F9FAFB",
              }}
            />
            {isTypingEffect && cryptographyStatus === "testing" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.primary }}
                />
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-3 flex items-center gap-3 transition-all duration-500"
            style={{
              backgroundColor:
                cryptographyStatus === "testing" ? "#FFFBEB" : "#F0FDF4",
              border:
                cryptographyStatus === "testing"
                  ? "1px solid #FDE68A"
                  : "1px solid #BBF7D0",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor:
                  cryptographyStatus === "testing" ? "#F59E0B" : "#16A34A",
              }}
            >
              {cryptographyStatus === "testing" ? (
                <Loader2
                  className="w-3.5 h-3.5 text-white animate-spin"
                  strokeWidth={3}
                />
              ) : (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-gray-900 leading-snug">
                {cryptographyStatus === "testing"
                  ? "Lendo o código de pareamento"
                  : "Dispositivo vinculado com sucesso"}
              </p>
              <p className="text-[11.5px] text-gray-600 mt-0.5 leading-snug">
                {cryptographyStatus === "testing"
                  ? "Sincronizando a sessão do WhatsApp Web..."
                  : "Histórico de mensagens liberado"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11.5px] text-gray-500">
              Conexão segura via servidor espelhado
            </span>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Success notification */}
      {showNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[420px] animate-fade-in-down">
          <div
            className="text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5"
            style={{ backgroundColor: colors.primaryBright }}
          >
            <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-semibold leading-snug">
              Mensagens descriptografadas com sucesso!
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .qr-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 34px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(37, 211, 102, 0.1) 50%,
            rgba(37, 211, 102, 0.85) 100%
          );
          animation: qrscan 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes qrscan {
          0% {
            transform: translateY(-34px);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translateY(168px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .qr-scan {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
