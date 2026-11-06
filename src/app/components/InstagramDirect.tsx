"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ChatIndividual from "./ChatIndividual";
import PitchPage from "./PitchPage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LockOpen,
  ChevronRight,
  Search,
  Camera,
  MoreVertical,
  MessagesSquare,
  Archive,
  CircleDot,
  Users,
  Phone,
  Plus,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { colors } from "../../constants/theme";
import { CHAT_PREVIEWS } from "../data/chatPreviews";

// Tempo de prévia antes do paywall. Longo o bastante para a pessoa ver a
// mensagem nova chegar e tentar abrir algumas conversas.
const PREVIEW_DURATION_SECONDS = 120;
// Dá tempo de a pessoa ler a lista antes: a mensagem só tem impacto se
// chegar enquanto ela já está olhando a tela.
const NEW_MESSAGE_AFTER_SECONDS = 12;
// Piso de leitura antes de a prévia poder ser cortada por rolagem
const MIN_LEITURA_SEGUNDOS = 28;

// Abrir uma conversa desmonta esta tela (o pai troca para o ChatIndividual),
// então o relógio da prévia vive no localStorage: ao voltar, ele retoma de
// onde estava em vez de reiniciar.
const PREVIEW_START_KEY = "previewStartedAt";

// Tons do avatar sem foto. O WhatsApp varia a cor por contato — um bege
// único em todas as linhas entrega que a lista é fabricada.
const AVATAR_TONES = [
  "#7E9CAB",
  "#A68B6B",
  "#8FA68E",
  "#A68FA0",
  "#C49A7E",
  "#6E9A9C",
  "#B08B7E",
  "#8E96A8",
];

// Avatar sem foto, no padrão do WhatsApp: inicial do contato sobre cor
// própria. O blur é leve de propósito — some a identidade, fica a forma.
function DefaultAvatar({
  tone,
  nome,
  size = 56,
}: {
  tone: string;
  nome?: string;
  size?: number;
}) {
  const inicial = (nome || "").trim().charAt(0).toUpperCase();
  return (
    <div
      className="relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, backgroundColor: tone }}
    >
      {inicial ? (
        <span
          className="font-semibold select-none"
          style={{
            fontSize: size * 0.42,
            color: "rgba(255,255,255,0.95)",
            filter: "blur(1.5px)",
          }}
        >
          {inicial}
        </span>
      ) : (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: "36%",
              height: "36%",
              top: "17%",
              left: "32%",
              backgroundColor: "rgba(255,255,255,0.92)",
              filter: "blur(1.5px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "76%",
              height: "76%",
              bottom: "-28%",
              left: "12%",
              backgroundColor: "rgba(255,255,255,0.92)",
              filter: "blur(1.5px)",
            }}
          />
        </>
      )}
    </div>
  );
}

const readPreviewStart = () => {
  const raw = localStorage.getItem(PREVIEW_START_KEY);
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  const now = Date.now();
  localStorage.setItem(PREVIEW_START_KEY, String(now));
  return now;
};

interface InstagramDirectProps {
  username: string;
  onBack?: () => void;
  onChatSelect?: (chatId: number) => void;
}

interface Conversation {
  id: number;
  name: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  avatar: string | null;
  unreadCount: number;
  isOnline: boolean;
  status: "unlocked" | "locked";
}

interface Follower {
  pk: string;
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
}

interface RelatedProfile {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
}

export default function InstagramDirect({
  username,
  onBack,
  onChatSelect,
}: InstagramDirectProps) {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "chat" | "pitch">(
    "list"
  );
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const [blockedChatIdForPitch, setBlockedChatIdForPitch] = useState<
    number | null
  >(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [unlockedConversationsData, setUnlockedConversationsData] = useState<
    RelatedProfile[]
  >([]);
  const [searchedUsername, setSearchedUsername] = useState<string>("");
  const [activeNav, setActiveNav] = useState<
    "updates" | "calls" | "communities" | "chats" | "you"
  >("chats");
  const [newIncomingConversation, setNewIncomingConversation] = useState<Conversation | null>(null);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [showScrollOffer, setShowScrollOffer] = useState(false);
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState(PREVIEW_DURATION_SECONDS);
  // Se a mensagem já tinha chegado antes desta montagem, ela não deve
  // reanimar a entrada ao voltar de um chat — só surgiu uma vez.
  const messageAlreadyArrived = useRef(false);
  // Âncora na antepenúltima conversa: chegar nela convida a assinar
  const cortePreviaRef = useRef<HTMLDivElement>(null);
  // Dispensado uma vez, o convite não volta a incomodar nesta sessão
  const scrollOfferDismissed = useRef(false);

  useEffect(() => {
    const storedFollowers = localStorage.getItem("followers");
    const storedUnlockedConversations = localStorage.getItem(
      "unlockedConversations"
    );
    const storedUsername = localStorage.getItem("searchedUsername");

    if (storedFollowers) {
      setFollowers(JSON.parse(storedFollowers));
    }
    if (storedUnlockedConversations) {
      setUnlockedConversationsData(JSON.parse(storedUnlockedConversations));
    }
    if (storedUsername) {
      setSearchedUsername(storedUsername);
    }
  }, [username]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Relógio da prévia, derivado do instante gravado: imune a remontagens.
  // A mensagem nova entra no mesmo compasso, com o horário em que chegou de
  // fato, para não "chegar de novo" toda vez que a pessoa volta de um chat.
  useEffect(() => {
    const startedAt = readPreviewStart();
    messageAlreadyArrived.current =
      Math.floor((Date.now() - startedAt) / 1000) >= NEW_MESSAGE_AFTER_SECONDS;

    const sync = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setPreviewSecondsLeft(Math.max(0, PREVIEW_DURATION_SECONDS - elapsed));

      if (elapsed >= NEW_MESSAGE_AFTER_SECONDS) {
        setNewIncomingConversation((current) => {
          if (current) return current;
          const arrivedAt = new Date(
            startedAt + NEW_MESSAGE_AFTER_SECONDS * 1000
          );
          const hours = String(arrivedAt.getHours()).padStart(2, "0");
          const minutes = String(arrivedAt.getMinutes()).padStart(2, "0");
          return {
            id: 999,
            name: "Maria Silva",
            username: "maria.silva",
            lastMessage: "foi ótimo te ver hoje",
            timestamp: `${hours}:${minutes}`,
            avatar: null,
            unreadCount: 1,
            isOnline: true,
            status: "locked",
          };
        });
      }
    };

    sync();
    const tick = setInterval(sync, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (previewSecondsLeft === 0) {
      setShowNextStepModal(true);
    }
  }, [previewSecondsLeft]);

  // Rolar até o fim da lista NÃO encerra a prévia: mostra um convite que a
  // pessoa pode dispensar e seguir navegando. Quem corta de verdade é só o
  // relógio. Em telas altas a âncora já nasce visível, por isso o convite
  // só é armado depois de um tempo mínimo de leitura.
  useEffect(() => {
    if (currentView !== "list") return;
    if (showNextStepModal || showScrollOffer || scrollOfferDismissed.current) {
      return;
    }
    if (previewSecondsLeft > PREVIEW_DURATION_SECONDS - MIN_LEITURA_SEGUNDOS) {
      return;
    }
    const alvo = cortePreviaRef.current;
    if (!alvo) return;

    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setShowScrollOffer(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, [currentView, showNextStepModal, showScrollOffer, previewSecondsLeft]);

  // Transform profiles into conversations format
  const conversations: Conversation[] = Array.from({ length: 8 }).map(
    (_, index) => {
      const lastMessages = [
        "Oi, você já ch...",
        "e aí, tá por aí?",
        "preciso falar com você uma coisa séria",
        "lembra daquele dia lá em...",
        "olha o que eu comprei aqui 👀",
        "vazou tudo kkkk",
        "desculpa a demora eu tava...",
        "e aí, tá por aí?",
      ];

      // Formato real do WhatsApp: hora exata hoje, "Ontem", dia da semana
      // dentro dos últimos dias, e data completa para conversas mais antigas.
      const timestamps = [
        "14:32",
        "Ontem",
        "Terça-feira",
        "Segunda-feira",
        "Sábado",
        "22/10/2026",
        "19/10/2026",
        "15/10/2026",
      ];
      const unreadCounts = [1, 0, 3, 0, 2, 0, 1, 0];

      if (index < 4) {
        // Unlocked conversations (first 4)
        const profile = unlockedConversationsData[index];
        // prévia vem do mesmo objeto que a tela de conversa usa, para o que
        // a lista promete ser exatamente o que o chat mostra
        const previa = CHAT_PREVIEWS[index + 1];
        return {
          id: index + 1,
          name: profile?.full_name || "",
          username: profile?.username || "",
          lastMessage: previa
            ? `${previa.ultimaMensagem}${
                previa.trechoOculto ? " " + previa.trechoOculto : ""
              }`
            : lastMessages[index % lastMessages.length],
          timestamp: previa?.horario ?? timestamps[index % timestamps.length],
          avatar: profile?.profile_pic_url || null,
          unreadCount: previa?.naoLidas ?? unreadCounts[index % unreadCounts.length],
          isOnline: index % 3 === 0,
          status: "unlocked",
        };
      } else {
        // Locked conversations (remaining)
        const follower = followers[index - 4]; // Use followers for locked ones
        return {
          id: index + 1,
          name: follower?.full_name || "",
          username: follower?.username || "",
          lastMessage: lastMessages[index % lastMessages.length],
          timestamp: timestamps[index % timestamps.length],
          avatar: follower?.profile_pic_url || null,
          unreadCount: unreadCounts[index % unreadCounts.length],
          isOnline: index % 3 === 0,
          status: "locked",
        };
      }
    }
  );

  const handleChatSelectInternal = (chat: Conversation) => {
    if (chat.status === "unlocked") {
      setSelectedChat(chat.id);
      setCurrentView("chat");
      // Store chat information in localStorage
      localStorage.setItem("selectedChatName", chat.name);
      localStorage.setItem("selectedChatAvatar", chat.avatar || "");
      if (onChatSelect) {
        onChatSelect(chat.id);
      }
    } else {
      setBlockedChatIdForPitch(chat.id);
      setShowBlockedToast(true);
      setTimeout(() => {
        setShowBlockedToast(false);
      }, 3000);
    }
  };

  const handleNavClick = (
    nav: "updates" | "calls" | "communities" | "chats" | "you"
  ) => {
    setActiveNav(nav);
    if (nav !== "chats") {
      triggerUpsellToast();
    }
  };

  const triggerUpsellToast = () => {
    setBlockedChatIdForPitch(1);
    setShowBlockedToast(true);
    setTimeout(() => {
      setShowBlockedToast(false);
    }, 3000);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setBlockedChatIdForPitch(null);
    setCurrentView("list");
  };

  const handlePitch = () => {
    const searchedUsername = localStorage.getItem("searchedUsername");
    if (searchedUsername) {
      localStorage.setItem("pitchUsername", searchedUsername);
      // Atualiza o username no estado global
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("updatePitchUsername", {
            detail: { username: searchedUsername },
          })
        );
      }
    }
    setCurrentView("pitch");
  };

  // Saída única da prévia para o paywall, usada pelo banner e pelo modal.
  const goToPaywall = () => {
    setShowNextStepModal(false);
    setShowBlockedToast(false);
    setBlockedChatIdForPitch(999);
    setSelectedChat(999);
    handlePitch();
  };

  const navigateToPitchFromToast = () => {
    if (blockedChatIdForPitch) {
      setSelectedChat(blockedChatIdForPitch);
      handlePitch();
      setShowBlockedToast(false);
    } else {
      setShowBlockedToast(false);
    }
  };

  const handleBackFromPitch = () => {
    const chatIsUnlocked = conversations.find(
      (c) => c.id === selectedChat && c.status === "unlocked"
    );
    if (chatIsUnlocked) {
      setCurrentView("chat");
    } else {
      setCurrentView("list");
      setSelectedChat(null);
      setBlockedChatIdForPitch(null);
    }
  };

  if (currentView === "chat" && selectedChat) {
    const chatIsUnlocked =
      conversations.find((c) => c.id === selectedChat)?.status === "unlocked";
    if (!chatIsUnlocked) {
      setCurrentView("list");
      setSelectedChat(null);
      return null;
    }
    return (
      <ChatIndividual
        chatId={selectedChat}
        onBack={handleBackToList}
        onPitch={handlePitch}
      />
    );
  }

  if (currentView === "pitch" && selectedChat) {
    const pitchUsername =
      typeof window !== "undefined"
        ? localStorage.getItem("pitchUsername")
        : null;
    return (
      <PitchPage
        onBack={handleBackFromPitch}
        userName={pitchUsername || "usuário"}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D9DBD5" }}>
      <div className="max-w-[480px] mx-auto min-h-screen bg-white font-helvetica relative md:shadow-2xl">
        {/* Modal de Análise Completa - Design natural e convincente */}
        <AnimatePresence>
          {showNextStepModal && (
            <motion.div
              key="modal-paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 40 }}
                className="w-full max-w-md bg-white rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-8 space-y-6">
                  {/* Status visual simples */}
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex justify-center mb-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Sua prévia terminou
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      A análise do backup está pronta. Desbloqueie agora para ver
                      tudo que foi recuperado.
                    </p>
                  </div>

                  {/* Divider simples */}
                  <div className="h-px bg-gray-200" />

                  {/* O que você vai ter acesso */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Você terá acesso a:
                    </p>
                    {[
                      "Todas as mensagens apagadas",
                      "Mídia privada e bloqueada",
                      "Histórico completo",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-green-700">✓</span>
                        </div>
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200" />

                  {/* Saída única: a partir daqui o caminho é o paywall */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToPaywall}
                    className="w-full py-4 px-4 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.primaryBright }}
                  >
                    <Lock className="w-4 h-4" />
                    Desbloquear Tudo Agora
                  </motion.button>

                  {/* Rodapé de confiança - simples e direto */}
                  <p className="text-xs text-center text-gray-500">
                    Seus dados estão protegidos com criptografia de ponta a ponta
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aviso de prévia. O vermelho chapado anterior denunciava anúncio e
            brigava com o verde do app — aqui o alerta vem do âmbar, não do fundo. */}
        <div
          className="px-4 py-3.5 text-white relative"
          style={{
            background: colors.gradients.dark,
            borderBottom: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="flex items-start gap-2.5 mb-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(245,158,11,0.16)" }}
            >
              <Lock
                className="w-3.5 h-3.5"
                style={{ color: "#F59E0B" }}
                strokeWidth={2.5}
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* a cor vai no próprio <p>: globals.css força #4A4A4A no
                  elemento, e isso vence o text-white herdado do container */}
              <p className="text-[13.5px] font-bold leading-snug mb-0.5 text-white">
                Você vê só parte das conversas
              </p>
              <p className="text-[11.5px] leading-snug text-white/70">
                Áudios apagados, localização e conversas privadas seguem
                bloqueados.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                const searchedUsername =
                  localStorage.getItem("searchedUsername");
                if (searchedUsername) {
                  localStorage.setItem("pitchUsername", searchedUsername);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("updatePitchUsername", {
                        detail: { username: searchedUsername },
                      })
                    );
                  }
                  setSelectedChat(1);
                  setCurrentView("pitch");
                }
              }}
              className="flex items-center gap-0.5 pl-4 pr-3 py-2 rounded-full text-[13px] font-bold active:scale-[0.97] transition-all shadow-sm"
              style={{
                backgroundColor: colors.primaryBright,
                color: "#06302B",
              }}
            >
              <span>Liberar acesso</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Linha de ícones do topo, no padrão real do app */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 bg-white">
        <button
          onClick={triggerUpsellToast}
          aria-label="Mais opções"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <MoreVertical className="w-5 h-5" color="#54656F" strokeWidth={1.8} />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerUpsellToast}
            aria-label="Câmera"
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
          >
            <Camera className="w-[18px] h-[18px]" color="#111B21" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => {
              setSelectedChat(1);
              handlePitch();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#25D366" }}
            aria-label="Nova conversa"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <h1
        className="px-4 pt-1 pb-2"
        style={{
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          fontSize: "32px",
          color: "#0B141A",
          fontWeight: 800,
          letterSpacing: "-0.5px",
        }}
      >
        Conversas
      </h1>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pergunte à Meta AI ou pesquise"
            className="w-full pl-10 pr-3 py-2.5 bg-gray-100 rounded-full text-sm font-helvetica search-input"
            style={{
              fontSize: "14px",
              color: "#262626",
              paddingLeft: "36px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingRight: "12px",
            }}
          />
        </div>
      </div>

      {/* Chips de filtro, no padrão real do app */}
      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
        {(
          [
            { key: "all", label: "Todas", count: null },
            { key: "unread", label: "Não lidas", count: 12 },
            { key: "favorites", label: "Favoritos", count: null },
            { key: "groups", label: "Grupos", count: 1 },
          ] as const
        ).map((chip) => {
          const isActive = chip.key === "all";
          return (
            <button
              key={chip.key}
              onClick={() => {
                if (!isActive) triggerUpsellToast();
              }}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                fontFamily: "Helvetica Neue, Arial, sans-serif",
                backgroundColor: isActive ? "#D7F4E8" : "#F0F2F5",
                color: isActive ? "#008069" : "#54656F",
              }}
            >
              {chip.label}
              {chip.count !== null && ` ${chip.count}`}
            </button>
          );
        })}
      </div>

      {/* Arquivadas */}
      <button
        onClick={triggerUpsellToast}
        className="w-full flex items-center px-4 py-3 border-y border-gray-100 active:bg-gray-50"
      >
        <Archive className="w-5 h-5 mr-4 flex-shrink-0" color="#54656F" />
        <span
          className="text-sm font-medium text-gray-700"
          style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
        >
          Arquivadas
        </span>
      </button>

      <div className="px-4 pb-56">
        {/* Nova conversa chegando com animação */}
        <AnimatePresence>
          {newIncomingConversation && (
            <motion.div
              key={`new-${newIncomingConversation.id}`}
              initial={
                messageAlreadyArrived.current
                  ? false
                  : { opacity: 0, y: -20, x: -20 }
              }
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              role="button"
              tabIndex={0}
              className={`flex items-center py-3 ${
                newIncomingConversation.status === "locked"
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-50"
              } transition-colors duration-150`}
              onClick={() => handleChatSelectInternal(newIncomingConversation)}
            >
              <div className="relative mr-3">
                <DefaultAvatar tone="#C49A7E" nome={newIncomingConversation.name} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold text-gray-800 truncate blur-sm select-none"
                  style={{
                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                    fontSize: "15px",
                  }}
                >
                  {newIncomingConversation.name}
                </h3>
                <p
                  className="text-sm truncate mr-2"
                  style={{
                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                    fontSize: "13px",
                    color: "#8E8E8E",
                    fontWeight: "400",
                  }}
                >
                  {newIncomingConversation.lastMessage}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "Helvetica Neue, Arial, sans-serif",
                      color: "#25D366",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {newIncomingConversation.timestamp}
                  </span>
                </div>
                {newIncomingConversation.unreadCount > 0 && (
                  <div
                    className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <span className="text-[11px] font-bold text-white">
                      {newIncomingConversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversas normais */}
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id}
            ref={
              index === conversations.length - 3 ? cortePreviaRef : undefined
            }
            role="button"
            tabIndex={0}
            aria-label={`Conversa com ${conversation.name || "contato"}`}
            className={`flex items-center py-3 ${
              conversation.status === "unlocked"
                ? "cursor-pointer hover:bg-gray-50"
                : "opacity-70 cursor-not-allowed"
            } transition-colors duration-150`}
            onClick={() => handleChatSelectInternal(conversation)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleChatSelectInternal(conversation);
              }
            }}
          >
            <div className="relative mr-3">
              {conversation.avatar ? (
                <Image
                  src={conversation.avatar}
                  alt={conversation.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover blur-sm"
                />
              ) : (
                <DefaultAvatar
                  tone={AVATAR_TONES[(conversation.id - 1) % AVATAR_TONES.length]}
                  nome={conversation.name}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold text-gray-800 truncate ${
                  conversation.status === "unlocked"
                    ? "blur-sm select-none"
                    : ""
                }`}
                style={{
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                  fontSize: "15px",
                }}
              >
                {conversation.name}
              </h3>

              <div className="flex items-center">
                <p
                  className={`text-sm truncate mr-2 ${
                    conversation.status === "unlocked"
                      ? "blur-sm select-none"
                      : ""
                  }`}
                  style={{
                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                    fontSize: "13px",
                    color: "#8E8E8E",
                    fontWeight: "400",
                  }}
                >
                  {conversation.lastMessage}
                </p>
              </div>
            </div>

            {/* Coluna da direita: horário em cima, badge de não lidas embaixo,
                rente à direita — igual ao padrão real do WhatsApp */}
            <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {conversation.status === "unlocked" ? (
                  <LockOpen className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                )}
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                    color: conversation.unreadCount > 0 ? "#25D366" : "#8E8E8E",
                    fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                    fontSize: "12px",
                  }}
                >
                  {conversation.timestamp}
                </span>
              </div>
              {conversation.unreadCount > 0 && (
                <div
                  className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <span className="text-[11px] font-bold text-white">
                    {conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé fixo: aviso de bloqueio e prévia empilhados sobre a navegação */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40">
      {/* Convite ao chegar no fim da lista. Dispensável de propósito: cortar
          a prévia aqui tiraria da pessoa justamente o que gera o desejo. */}
      <AnimatePresence>
        {showScrollOffer && (
          <motion.div
            key="oferta-rolagem"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="px-3 pb-2"
          >
            <div
              className="rounded-2xl px-4 py-3.5 shadow-xl"
              style={{
                background: colors.gradients.dark,
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(245,158,11,0.16)" }}
                >
                  <Lock
                    className="w-3.5 h-3.5"
                    style={{ color: "#F59E0B" }}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold leading-snug mb-0.5 text-white">
                    Você chegou ao fim da prévia
                  </p>
                  <p className="text-[11.5px] leading-snug text-white/70">
                    As conversas mais recentes e tudo que foi apagado continuam
                    bloqueados.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    scrollOfferDismissed.current = true;
                    setShowScrollOffer(false);
                  }}
                  className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold text-white/80 active:scale-[0.97] transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  Continuar vendo
                </button>
                <button
                  onClick={goToPaywall}
                  className="flex-1 flex items-center justify-center gap-0.5 py-2 rounded-full text-[12.5px] font-bold active:scale-[0.97] transition-all"
                  style={{
                    backgroundColor: colors.primaryBright,
                    color: "#06302B",
                  }}
                >
                  <span>Liberar tudo agora</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlockedToast && (
          <motion.div
            key="toast-bloqueio"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="px-3 pb-2"
          >
            <div
              className="rounded-xl p-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold mb-0.5">
                      Obtenha a ferramenta completa
                    </p>
                    <p className="text-white/80 text-xs">
                      Você está vendo apenas 10% do que ela é capaz de fazer
                    </p>
                  </div>
                </div>
                <button
                  onClick={navigateToPitchFromToast}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 ml-3 transition-colors flex-shrink-0"
                  aria-label="Ver mais"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewSecondsLeft > 0 && (
          <motion.div
            key="banner-previa"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="px-3 pb-2"
          >
            <div
              className="rounded-2xl px-4 py-3.5 shadow-xl"
              style={{
                background: colors.gradients.dark,
                border: "1px solid rgba(37, 211, 102, 0.35)",
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-white/80" />
                <span
                  className="text-[13px] font-semibold text-white"
                  style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
                >
                  Prévia disponível por{" "}
                  <span
                    style={{ color: colors.primaryBright }}
                    className="tabular-nums"
                  >
                    {Math.floor(previewSecondsLeft / 60)}:
                    {String(previewSecondsLeft % 60).padStart(2, "0")}
                  </span>
                </span>
              </div>

              <p
                className="text-[12.5px] text-center text-white/70 leading-snug mb-2.5"
                style={{ fontFamily: "Helvetica Neue, Arial, sans-serif" }}
              >
                Depois disso tudo volta a ficar bloqueado.
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goToPaywall}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
                style={{
                  backgroundColor: colors.white,
                  color: colors.primaryDark,
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                }}
              >
                <Lock className="w-4 h-4" />
                Desbloquear Tudo Agora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de navegação inferior, padrão real do app */}
      <div
        className="bg-white border-t border-gray-200 flex items-center px-1"
        style={{ paddingTop: "6px", paddingBottom: "env(safe-area-inset-bottom, 6px)" }}
      >
        {(
          [
            { key: "updates", label: "Atualizações", icon: CircleDot, badge: null, dot: true },
            { key: "calls", label: "Ligações", icon: Phone, badge: 22, dot: false },
            { key: "communities", label: "Comunidades", icon: Users, badge: null, dot: false },
            { key: "chats", label: "Conversas", icon: MessagesSquare, badge: 12, dot: false },
            { key: "you", label: "Você", icon: User, badge: null, dot: false },
          ] as const
        ).map((item) => {
          const isActive = activeNav === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className="flex flex-col items-center flex-1 min-w-0 py-1"
            >
              <div
                className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl max-w-full"
                style={{ backgroundColor: isActive ? "#F0F2F5" : "transparent" }}
              >
                <div className="relative flex-shrink-0">
                  {item.key === "you" ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden relative"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <User className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                      <span
                        className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-white"
                        style={{ backgroundColor: "#25D366" }}
                      />
                    </div>
                  ) : (
                    <Icon
                      className="w-5 h-5"
                      color={isActive ? "#008069" : "#54656F"}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  )}
                  {item.dot && (
                    <span
                      className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#25D366" }}
                    />
                  )}
                  {item.badge !== null && (
                    <span
                      className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[9.5px] font-medium whitespace-nowrap"
                  style={{
                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                    color: isActive ? "#008069" : "#54656F",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
        </div>
      </div>
      </div>
    </div>
  );
}
