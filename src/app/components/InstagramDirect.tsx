"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ChatIndividual from "./ChatIndividual";
import PitchPage from "./PitchPage";
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
  Info,
} from "lucide-react";
import { colors } from "../../constants/theme";

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
        return {
          id: index + 1,
          name: profile?.full_name || "",
          username: profile?.username || "",
          lastMessage: lastMessages[index % lastMessages.length],
          timestamp: timestamps[index % timestamps.length],
          avatar: profile?.profile_pic_url || null,
          unreadCount: unreadCounts[index % unreadCounts.length],
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
    const chatIsLocked = conversations.find(
      (c) => c.id === selectedChat && c.status === "locked"
    );
    if (chatIsLocked) {
      setCurrentView("list");
      setSelectedChat(null);
      setBlockedChatIdForPitch(null);
    } else {
      setCurrentView("chat");
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
        {/* Barra de alerta no topo */}
        <div
          className="px-4 pt-3.5 pb-4 text-white relative"
          style={{
            background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-3 h-3" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-wide">
              Esta é a versão DEMO
            </span>
          </div>
          <p className="text-xs leading-relaxed text-white/85 mb-3">
            Áudios apagados, localização e DMs privadas estão bloqueados.
            Desbloqueie antes que{" "}
            <span className="font-semibold text-white">
              {searchedUsername}
            </span>{" "}
            os apague.
          </p>
          <button
            onClick={() => {
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
                setSelectedChat(1);
                setCurrentView("pitch");
              }
            }}
            className="w-full flex items-center justify-center gap-1 bg-white text-red-600 py-2.5 rounded-full text-sm font-bold hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>Ver Agora</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      {showBlockedToast && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-4 mb-2">
          <div
            className="rounded-xl p-4 shadow-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" strokeWidth={2.5} />
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
        </div>
      )}

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

      <div className="px-4 pb-28">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
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
                  className={`rounded-full object-cover ${
                    conversation.status === "unlocked" ? "blur-sm" : ""
                  }`}
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    conversation.status === "unlocked" ? "blur-sm" : ""
                  }`}
                  style={{ backgroundColor: "#F4CF8E" }}
                >
                  <User className="w-8 h-8" style={{ color: "#8B5E34" }} />
                </div>
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

      {/* Barra de navegação inferior, padrão real do app */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 bg-white border-t border-gray-200 flex items-center px-1"
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
  );
}
