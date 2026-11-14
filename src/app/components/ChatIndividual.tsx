"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Phone, Video, CheckCheck, Lock, MoreVertical } from "lucide-react";
import { getUserLocation } from "../services/locationService";
import { AvatarContato } from "./AvatarContato";
import { CHAT_PREVIEWS, rotuloNaoLidas } from "../data/chatPreviews";
import { conversaLiberada } from "../data/acessoConversas";

interface ChatIndividualProps {
  chatId: number;
  onBack: () => void;
  onPitch: () => void;
}

interface Message {
  id: number;
  type: "text" | "mixed" | "blur" | "audio" | "image" | "location";
  content: string;
  sender: "left" | "right";
  time: string;
  showTime: boolean;
  blurContent?: string;
  afterBlur?: string;
  title?: string;
  blurredName?: string;
}

interface ChatData {
  name: string;
  username: string;
  avatar: string | null;
  isOnline: boolean;
  messages: Message[];
}

// Conversas sem roteiro próprio (da quinta em diante). O texto aqui nunca
// chega a ser lido: estas conversas nascem borradas e assim ficam. O que
// precisa existir é a forma — bolhas de larguras diferentes, lados
// alternando, um áudio e uma foto no meio —, porque é a silhueta de uma
// conversa que o olho reconhece antes de qualquer palavra.
const FALAS_VELADAS: Array<Pick<Message, "type" | "content" | "sender">> = [
  { type: "text", content: "oi, tudo bem? vc tá acordado ainda", sender: "left" },
  { type: "text", content: "tô sim", sender: "right" },
  { type: "text", content: "preciso te contar uma coisa mas não aqui", sender: "left" },
  { type: "audio", content: "0:21", sender: "left" },
  { type: "text", content: "me liga quando puder falar sozinho", sender: "left" },
  { type: "text", content: "agora não dá, te chamo mais tarde", sender: "right" },
  { type: "image", content: "", sender: "left" },
  { type: "text", content: "apaga isso depois de ver", sender: "left" },
  { type: "text", content: "pode deixar", sender: "right" },
  { type: "audio", content: "1:04", sender: "right" },
  { type: "text", content: "mesma hora de sempre então", sender: "left" },
  { type: "text", content: "combinado", sender: "right" },
];

const HORARIOS_VELADOS = [
  "08:12", "08:14", "08:19", "08:21", "08:26", "09:03",
  "09:07", "09:08", "09:15", "10:41", "10:44", "10:52",
];

/**
 * Monta uma conversa velada estável para um id sem roteiro. O recorte sai do
 * próprio id, então a mesma conversa tem sempre o mesmo formato: voltar nela
 * duas vezes e encontrar outra silhueta seria o tipo de detalhe que denuncia.
 */
function conversaVelada(chatId: number): ChatData {
  const inicio = (chatId * 3) % 4;
  const quantas = 7 + (chatId % 4);
  const falas = FALAS_VELADAS.slice(inicio, inicio + quantas);

  return {
    name: "",
    username: "",
    avatar: null,
    isOnline: chatId % 3 === 0,
    messages: falas.map((fala, i) => ({
      id: i + 1,
      ...fala,
      time: HORARIOS_VELADOS[(inicio + i) % HORARIOS_VELADOS.length],
      showTime: false,
    })),
  };
}

export default function ChatIndividual({
  chatId,
  onBack,
  onPitch,
}: ChatIndividualProps) {
  const [userLocation, setUserLocation] = useState("São Paulo");
  const [animateCard, setAnimateCard] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatAvatar, setChatAvatar] = useState<string | null>(null);


  // A conversa abre já com a última mensagem lá, ainda não lida — é assim
  // que o WhatsApp se comporta quando você entra num chat com pendência.
  // Antes a mensagem "chegava" na frente do lead, o que não combinava com a
  // lista, que já exibia aquele texto como prévia.

  // Get location from localStorage
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      const locationData = JSON.parse(storedLocation);
      setUserLocation(locationData.city);
    } else {
      // If no stored location, fetch it
      const fetchLocation = async () => {
        try {
          const locationData = await getUserLocation();
          setUserLocation(locationData.city);
        } catch (error) {
          console.error("Error getting location:", error);
          setUserLocation("São Paulo");
        }
      };
      fetchLocation();
    }
  }, []);

  useEffect(() => {
    // Get chat information from localStorage
    const storedName = localStorage.getItem("selectedChatName");
    const storedAvatar = localStorage.getItem("selectedChatAvatar");
    if (storedName) setChatName(storedName);
    if (storedAvatar) setChatAvatar(storedAvatar);
  }, []);

  // Function to animate the bottom card
  const handleAudioClick = () => {
    setAnimateCard(true);
    setTimeout(() => setAnimateCard(false), 500); // Remove animation after 0.5s
  };

  // Chat data with complete messages
  const chatData: Record<number, ChatData> = {
    1: {
      // Sem foto e com nome neutro: ver o rosto entregava o gênero, e a
      // dúvida é justamente o que sustenta a oferta. Ver demoProfiles.ts,
      // que precisa concordar com isto.
      name: "Alex",
      username: "@alex",
      avatar: "",
      isOnline: true,
      messages: [
        {
          id: 1,
          type: "text",
          content: "Oi, você já chegou?",
          sender: "left",
          time: "14:32",
          showTime: false,
        },
        {
          id: 2,
          type: "mixed",
          content: "Não... ainda estou com a ",
          blurContent: "esposa",
          sender: "right",
          time: "14:35",
          showTime: false,
        },
        {
          id: 3,
          type: "mixed",
          content: "De novo? Você disse que",
          blurContent: "ia na casa da Gatinha 😡",
          sender: "left",
          time: "14:36",
          showTime: false,
        },
        {
          id: 4,
          type: "blur",
          content:
            "Relaxa, ela não desconfia de nada. Te espero no mesmo lugar 😘",
          sender: "right",
          time: "14:38",
          showTime: true,
        },
        {
          id: 5,
          type: "mixed",
          content: "Não acredito!!! Você sempre faz isso quando está com a",
          blurContent: "esposa",
          sender: "left",
          time: "14:40",
          showTime: false,
        },
        {
          id: 6,
          type: "audio",
          content: "0:32",
          sender: "left",
          time: "14:42",
          showTime: false,
        },
        {
          id: 7,
          type: "audio",
          content: "1:47",
          sender: "right",
          time: "14:45",
          showTime: false,
        },
        {
          id: 8,
          type: "mixed",
          content: "Não quero mais saber, eu vou",
          blurContent: "texto borrado",
          sender: "left",
          time: "14:48",
          showTime: true,
        },
        {
          id: 9,
          type: "mixed",
          content: "Vamos conversar pessoalmente na",
          blurContent: "terça pode ser?",
          sender: "right",
          time: "14:50",
          showTime: false,
        },
      ],
    },
    2: {
      name: "MeuAmor_22",
      username: "@meuamor_22",
      avatar: "/avatares/avatardirect02.png",
      isOnline: false,
      messages: [
        {
          id: 1,
          type: "text",
          content: "e aí, tá por aí?",
          sender: "right",
          time: "10:15",
          showTime: false,
        },
        {
          id: 2,
          type: "mixed",
          content: "na",
          blurContent: "terça",
          afterBlur: "dessa semana eu posso ir aí, sabe 👀",
          sender: "right",
          time: "10:16",
          showTime: true,
        },
        {
          id: 3,
          type: "mixed",
          content: "espera mas e a",
          blurContent: "esposa",
          afterBlur: "ela não vai estar com você?",
          sender: "left",
          time: "10:20",
          showTime: false,
        },
        {
          id: 4,
          type: "mixed",
          content: "não kkkk",
          blurContent: "vou falar pra ela que vou em tal lugar",
          sender: "right",
          time: "10:22",
          showTime: true,
        },
        {
          id: 5,
          type: "text",
          content: "kkkk tá bom então, vamos nessa",
          sender: "left",
          time: "10:25",
          showTime: false,
        },
        {
          id: 6,
          type: "text",
          content: "vou te mandar a localização",
          sender: "left",
          time: "10:25",
          showTime: false,
        },
        {
          id: 7,
          type: "location",
          content: "Localização",
          title: "Localização expirada",
          blurredName: "Amor",
          sender: "left",
          time: "10:26",
          showTime: false,
        },
        {
          id: 8,
          type: "text",
          content: `Em ${userLocation}, sabe`,
          sender: "left",
          time: "10:26",
          showTime: false,
        },
        {
          id: 9,
          type: "text",
          content: "Tenho salvo aqui, meu amor",
          sender: "right",
          time: "10:28",
          showTime: true,
        },
      ],
    },
    3: {
      name: "Crush_Forever",
      username: "@crush_forever",
      avatar: "/avatares/avatardirect03.png",
      isOnline: false,
      messages: [
        {
          id: 1,
          type: "text",
          content: "preciso te falar uma coisa séria",
          sender: "left",
          time: "19:31",
          showTime: true,
        },
        {
          id: 2,
          type: "mixed",
          content: "desculpa a demora eu estava",
          blurContent: "com minha namorada",
          sender: "right",
          time: "20:15",
          showTime: false,
        },
        {
          id: 3,
          type: "mixed",
          content: "você vai estar livre",
          blurContent: "na quarta",
          afterBlur: "semana que vem?",
          sender: "left",
          time: "20:18",
          showTime: true,
        },
        {
          id: 4,
          type: "text",
          content: "à noite nesse caso",
          sender: "left",
          time: "20:19",
          showTime: false,
        },
        {
          id: 5,
          type: "text",
          content: "acho que sim, mas te aviso",
          sender: "right",
          time: "20:22",
          showTime: false,
        },
        {
          id: 6,
          type: "text",
          content: "por quê?",
          sender: "right",
          time: "20:22",
          showTime: true,
        },
        {
          id: 7,
          type: "text",
          content: "olha o que eu comprei aqui 👀",
          sender: "left",
          time: "20:25",
          showTime: false,
        },
        {
          id: 8,
          type: "image",
          content: "roupa borrada",
          sender: "left",
          time: "20:25",
          showTime: false,
        },
        {
          id: 9,
          type: "text",
          content: "pra gente usar, sabe...",
          sender: "left",
          time: "20:26",
          showTime: false,
        },
        {
          id: 10,
          type: "blur",
          content: "nossa que carros incríveis",
          sender: "right",
          time: "20:30",
          showTime: true,
        },
      ],
    },
    4: {
      name: "Segredo_Nosso",
      username: "@segredo_nosso",
      avatar: "/avatares/avatardirect04.png",
      isOnline: false,
      messages: [
        {
          id: 1,
          type: "text",
          content: `lembra daquele dia lá em ${userLocation}`,
          sender: "left",
          time: "15:20",
          showTime: false,
        },
        {
          id: 2,
          type: "text",
          content: "vazou tudo kkkk",
          sender: "left",
          time: "15:21",
          showTime: true,
        },
        {
          id: 3,
          type: "text",
          content: "olha o que falaram aqui no grupo",
          sender: "left",
          time: "15:22",
          showTime: false,
        },
        {
          id: 4,
          type: "image",
          content: "print de mídia borrado",
          sender: "left",
          time: "15:22",
          showTime: false,
        },
        {
          id: 5,
          type: "text",
          content: "você está brincando???",
          sender: "right",
          time: "15:25",
          showTime: true,
        },
      ],
    },
  };

  // Só uma conversa foi descriptografada. As outras abrem igual — mesma
  // tela, mesmo cabeçalho, mesmo campo de mensagem — e nada nelas é legível.
  const liberado = conversaLiberada(chatId);

  // Véu do corpo da conversa. Na liberada o texto aparece; nas demais, um
  // borrão mais forte que o dos trechos ocultos, para que nem se tente ler.
  const veu = liberado ? "" : "blur-[6px] select-none";

  const currentChat =
    chatData[chatId as keyof typeof chatData] ?? conversaVelada(chatId);
  // A prévia continua existindo nas bloqueadas — o divisor de não lidas tem
  // que bater com o badge que a lista mostrou —, só que ilegível. Quem abre
  // vê que a mensagem está lá; não vê o que ela diz.
  const previa = CHAT_PREVIEWS[chatId];
  const divisorRef = useRef<HTMLDivElement>(null);

  // O WhatsApp abre a conversa já no divisor de não lidas. Sem isto o chat
  // abria no topo e a mensagem nova — a que a lista prometeu — ficava fora
  // da tela, atrás do card de bloqueio.
  useEffect(() => {
    if (!previa || previa.naoLidas === 0) return;
    const t = setTimeout(() => {
      const el = divisorRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, y - 150), behavior: "smooth" });
    }, 450);
    return () => clearTimeout(t);
  }, [previa]);

  const renderMessage = (
    message: Message,
    index: number,
    messages: Message[],
    showTime: boolean
  ) => {
    const isLeft = message.sender === "left";
    // Avatar appears on the LAST message of the sequence from the left
    const showAvatar =
      isLeft &&
      (index === messages.length - 1 || messages[index + 1]?.sender !== "left");

    // Detect if the next message is from a different side to increase spacing
    const nextMessage = messages[index + 1];
    const isLastOfSide = nextMessage && nextMessage.sender !== message.sender;
    const marginBottom = isLastOfSide ? "mb-4" : "mb-1"; // Larger spacing when switching sides

    return (
      <div key={message.id}>
        {/* Time in the middle of chat occasionally - without card */}
        {showTime && (
          <div className="text-center my-4">
            <span className="text-xs text-gray-400">
              <span className={veu || "blur-sm select-none"}>ONTEM</span>,{" "}
              {message.time}
            </span>
          </div>
        )}

        <div
          className={`flex ${
            isLeft ? "justify-start" : "justify-end"
          } ${marginBottom} px-4`}
        >
          {/* Avatar for messages from the left - on the LAST message */}
          {isLeft && (
            <div className="mr-2 flex flex-col justify-end">
              {showAvatar ? (
                chatAvatar ? (
                  <Image
                    src={chatAvatar ?? ""}
                    alt={chatName || currentChat.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover blur-sm"
                  />
                ) : (
                  <AvatarContato
                    nome={chatName || currentChat.name}
                    tamanho={24}
                  />
                )
              ) : (
                <div className="w-6 h-6"></div>
              )}
            </div>
          )}

          {message.type === "image" ? (
            <div
              className={`flex items-end ${
                isLeft
                  ? "flex-row space-x-2"
                  : "flex-row-reverse space-x-reverse space-x-2"
              }`}
            >
              {/* Balloon of the Message (with play and text "Photo") */}
              <div
                className={`px-3 py-2 rounded-2xl flex items-center space-x-2 ${
                  isLeft ? "bg-white shadow-sm" : ""
                }`}
                style={!isLeft ? { backgroundColor: "#D9FDD3" } : {}}
              >
                <svg
                  width="10"
                  height="15"
                  viewBox="0 0 35 39"
                  fill={isLeft ? "#6C707B" : "#4A4A4A"}
                >
                  <path d="M0 5.54924V33.4508C0 37.2749 4.11828 39.6835 7.4513 37.8086L32.2527 23.8579C35.6509 21.9464 35.6509 17.0536 32.2527 15.1421L7.45131 1.19136C4.11829 -0.683463 0 1.72511 0 5.54924Z" />
                </svg>
                <span
                  className={`text-sm font-medium ${
                    veu || "blur-sm select-none"
                  }`}
                  style={{ color: isLeft ? "#6C707B" : "#4A4A4A" }}
                >
                  Foto
                </span>
              </div>

              {/* Camera Circle (outside the balloon) */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center`}
                style={{
                  backgroundColor: isLeft ? "#f3f4f6" : "#D9FDD3",
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 66 64"
                  fill={isLeft ? "black" : "#4A4A4A"}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24.743 0.806959C22.974 1.01696 20.854 2.54296 18.826 5.06696C16.383 8.10696 14.966 9.00096 12.583 9.00396C10.887 9.00596 8.01 9.91596 6.19 11.026C0.838 14.289 0 17.748 0 36.582C0 51.783 0.187 53.561 2.159 57.069C5.68 63.333 8.651 64 33.052 64C55.815 64 58.402 63.529 63 58.551C65.45 55.898 65.506 55.477 65.811 37.491C66.071 22.148 65.858 18.626 64.513 16.024C62.544 12.217 57.524 9.00896 53.527 9.00396C51.336 9.00096 49.627 7.96696 47.027 5.07196C43.551 1.19996 43.384 1.13796 35.5 0.811961C31.1 0.629961 26.259 0.627959 24.743 0.806959ZM43.216 9.57496C44.622 12.66 48.789 15 52.878 15C54.903 15 56.518 15.843 57.927 17.635C59.831 20.055 60 21.594 60 36.524C60 59.297 62.313 57.5 33.052 57.5C3.655 57.5 6 59.35 6 36.204C6 20.562 6.122 19.499 8.174 17.314C9.469 15.936 11.511 15 13.224 15C17.15 15 21.289 12.696 22.954 9.58496C24.282 7.10396 24.693 6.99996 33.19 6.99996C41.731 6.99996 42.084 7.09096 43.216 9.57496ZM27 19.722C15.76 23.945 13.183 40.493 22.611 47.908C30.698 54.27 42.974 51.753 47.612 42.783C51.201 35.844 48.564 25.701 42.015 21.25C38.771 19.046 30.925 18.247 27 19.722ZM40.077 27.923C46.612 34.459 42.201 45.273 33 45.273C23.799 45.273 19.388 34.459 25.923 27.923C30.039 23.807 35.961 23.807 40.077 27.923Z"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                isLeft ? "bg-white text-black shadow-sm" : "text-gray-900"
              }`}
              style={!isLeft ? { backgroundColor: "#D9FDD3" } : {}}
            >
              {message.type === "text" && (
                <p className={veu} style={{ fontSize: "15px" }}>
                  {message.content}
                </p>
              )}

              {message.type === "mixed" && (
                <p className={veu} style={{ fontSize: "15px" }}>
                  {message.content}{" "}
                  {/* O trecho oculto segue borrado mesmo na conversa
                      liberada: é ele que faz a leitura doer. */}
                  <span className="blur-sm select-none">
                    {message.blurContent}
                  </span>
                  {message.afterBlur && ` ${message.afterBlur}`}
                </p>
              )}

              {message.type === "blur" && (
                <div className="relative">
                  <p
                    className={veu || "blur-sm select-none"}
                    style={{ fontSize: "17px" }}
                  >
                    {message.content}
                  </p>
                </div>
              )}

              {!isLeft && message.type !== "location" && (
                <div className="flex justify-end mt-0.5">
                  <CheckCheck className="w-3.5 h-3.5" color="#53BDEB" />
                </div>
              )}

              {message.type === "audio" && (
                <div className="space-y-2">
                  <div
                    className={`flex items-center space-x-2 py-1 px-2 rounded-2xl ${
                      isLeft ? "bg-white shadow-sm" : ""
                    }`}
                    style={!isLeft ? { backgroundColor: "#D9FDD3" } : {}}
                  >
                    <button
                      onClick={handleAudioClick}
                      className="focus:outline-none"
                    >
                      {isLeft ? (
                        <svg
                          className="h-10 w-auto"
                          viewBox="0 0 381 79"
                          fill="none"
                        >
                          <path
                            d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z"
                            fill="#128C7E"
                          />
                          <rect
                            x="44.7969"
                            y="34.5"
                            width="6"
                            height="10"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="55.7969"
                            y="34.5"
                            width="6"
                            height="10"
                            rx="3"
                            fill="#080B10"
                          />
                          <circle cx="69.7969" cy="39.5" r="3" fill="#080B10" />
                          <rect
                            x="77.7969"
                            y="22"
                            width="6"
                            height="35"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="88.7969"
                            y="4.5"
                            width="6"
                            height="70"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="99.7969"
                            y="4.5"
                            width="6"
                            height="70"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="110.797"
                            y="7"
                            width="6"
                            height="65"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="121.797"
                            y="9.5"
                            width="6"
                            height="60"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="132.797"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="143.797"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="154.797"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="165.797"
                            width="6"
                            height="79"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="176.797"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="187.797"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="198.797"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="209.797"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="220.797"
                            y="9"
                            width="6"
                            height="61"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="231.797"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="242.797"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="253.797"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="264.797"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="275.797"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="286.797"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="297.797"
                            width="6"
                            height="79"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="308.797"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="319.797"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="330.797"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="341.797"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="352.797"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="363.797"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="#080B10"
                          />
                          <rect
                            x="374.797"
                            y="9"
                            width="6"
                            height="61"
                            rx="3"
                            fill="#080B10"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="audio-waveform-right h-10 w-auto"
                          viewBox="0 0 382 79"
                          fill="none"
                        >
                          <path
                            d="M24.3758 37.8167C25.6026 38.6037 25.6026 40.3965 24.3758 41.1835L3.0799 54.8448C1.74878 55.6987 -6.91281e-08 54.7429 0 53.1614L1.19431e-06 25.8387C1.26344e-06 24.2573 1.74878 23.3014 3.0799 24.1553L24.3758 37.8167Z"
                            fill="#128C7E"
                          />
                          <rect
                            x="45.2969"
                            width="6"
                            height="79"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="56.2969"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="67.2969"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="78.2969"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="89.2969"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="100.297"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="111.297"
                            y="8"
                            width="6"
                            height="63"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="122.297"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="133.297"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="144.297"
                            y="14"
                            width="6"
                            height="51"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="155.297"
                            y="14"
                            width="6"
                            height="51"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="166.297"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="177.297"
                            y="19"
                            width="6"
                            height="41"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="188.297"
                            y="16"
                            width="6"
                            height="47"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="199.297"
                            y="19"
                            width="6"
                            height="41"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="210.297"
                            y="14"
                            width="6"
                            height="51"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="221.297"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="232.297"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="243.297"
                            y="2"
                            width="6"
                            height="75"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="254.297"
                            width="6"
                            height="79"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="265.297"
                            y="11"
                            width="6"
                            height="57"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="276.297"
                            y="14"
                            width="6"
                            height="51"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="287.297"
                            y="9"
                            width="6"
                            height="61"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="298.297"
                            y="7"
                            width="6"
                            height="65"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="309.297"
                            y="5"
                            width="6"
                            height="69"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="320.297"
                            y="4"
                            width="6"
                            height="71"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="331.297"
                            y="9"
                            width="6"
                            height="61"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="342.297"
                            y="14"
                            width="6"
                            height="51"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="353.297"
                            y="21"
                            width="6"
                            height="37"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="364.297"
                            y="28"
                            width="6"
                            height="23"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="375.297"
                            y="36.5"
                            width="6"
                            height="6"
                            rx="3"
                            fill="white"
                          />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`text-xs ml-2 ${
                        isLeft ? "text-gray-600" : "text-gray-700"
                      } ${veu}`}
                    >
                      {message.content}
                    </span>
                  </div>

                  <div className="px-1">
                    <span
                      className={`text-xs ${
                        isLeft ? "text-gray-500" : "text-gray-600"
                      } ${veu || "blur-sm select-none"}`}
                    >
                      Ver transcrição
                    </span>
                  </div>
                </div>
              )}

              {message.type === "location" && (
                <div>
                  <p
                    className={`font-semibold text-black ${veu}`}
                    style={{ fontSize: "15px" }}
                  >
                    {message.title}
                  </p>
                  <p
                    className={`text-gray-600 ${veu}`}
                    style={{ fontSize: "13px" }}
                  >
                    <span className="blur-sm select-none">
                      {message.blurredName}
                    </span>{" "}
                    parou de compartilhar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D9DBD5" }}>
      <div
        className="max-w-[480px] mx-auto min-h-screen flex flex-col relative md:shadow-2xl"
        style={{
          touchAction: "manipulation",
          userSelect: "none",
          // papel de parede do WhatsApp claro: o branco liso entrega que
          // não é o app, é a textura que o olho reconhece primeiro
          backgroundColor: "#EFE7DE",
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
      {/* Fixed Header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex items-center justify-between px-3 py-2.5"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E9EDEF",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="p-1 flex-shrink-0">
            <ChevronLeft className="w-6 h-6" stroke="#54656F" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              {chatAvatar ? (
                <Image
                  src={chatAvatar ?? ""}
                  alt=""
                  aria-hidden="true"
                  width={40}
                  height={40}
                  className="rounded-full object-cover blur-sm"
                />
              ) : (
                <AvatarContato
                  nome={chatName || currentChat.name}
                  tamanho={40}
                />
              )}
            </div>

            <div className="min-w-0">
              <h1
                className="font-semibold text-[16px] blur-sm select-none truncate"
                style={{ color: "#111B21" }}
              >
                {chatName || currentChat.name}
              </h1>
              <p
                className="text-[12.5px] blur-sm select-none"
                style={{ color: "#667781" }}
              >
                {currentChat.isOnline ? "online" : "offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 pr-1">
          <button className="p-0.5" aria-label="Chamada de vídeo">
            <Video className="w-[22px] h-[22px]" style={{ color: "#54656F" }} />
          </button>
          <button className="p-0.5" aria-label="Chamada de voz">
            <Phone className="w-5 h-5" style={{ color: "#54656F" }} />
          </button>
          <button className="p-0.5" aria-label="Mais opções">
            <MoreVertical
              className="w-5 h-5"
              style={{ color: "#54656F" }}
            />
          </button>
        </div>
      </div>

      {/* Chat Messages - with padding for header and card */}
      <div className="flex-1 pt-20 pb-48 overflow-y-auto">
        <div className="py-4">
          {/* Single time at the top of the conversation */}
          <div className="text-center mb-6">
            <span className="text-xs text-gray-400">
              <span className={veu || "blur-sm select-none"}>ONTEM</span>, 14:32
            </span>
          </div>

          {currentChat.messages.map(
            (message, index) =>
              renderMessage(message, index, currentChat.messages, false) // false = don't show individual time
          )}

          {/* Divisor de não lidas + a mensagem que a lista anunciou como
              prévia. Vêm do mesmo objeto, então o que o lead leu na lista é
              exatamente o que ele encontra ao abrir. */}
          {previa && previa.naoLidas > 0 && (
            <>
              <div ref={divisorRef} className="flex items-center gap-3 px-4 my-4">
                <span className="flex-1 h-px bg-gray-300/70" />
                <span
                  className="text-[10.5px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-white shadow-sm"
                  style={{ color: "#667781" }}
                >
                  {rotuloNaoLidas(previa.naoLidas)}
                </span>
                <span className="flex-1 h-px bg-gray-300/70" />
              </div>

              <div className="flex justify-start items-end mb-1 px-4">
                <div className="mr-2 flex flex-col justify-end flex-shrink-0">
                  {chatAvatar ? (
                    <Image
                      src={chatAvatar}
                      alt=""
                      aria-hidden="true"
                      width={24}
                      height={24}
                      className="rounded-full object-cover blur-sm"
                    />
                  ) : (
                    <AvatarContato
                      nome={chatName || currentChat.name}
                      tamanho={24}
                    />
                  )}
                </div>
                <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-2xl bg-white shadow-sm text-black">
                  <p className={veu} style={{ fontSize: "15px" }}>
                    {previa.ultimaMensagem}
                    {previa.trechoOculto && (
                      <span className="blur-sm select-none ml-1">
                        {previa.trechoOculto}
                      </span>
                    )}
                  </p>
                  <p className="text-right text-[11px] text-gray-400 mt-0.5">
                    {previa.horario}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Conversation Card - fixed above the input */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 px-4 mb-2">
        {/* Mesmo tratamento da faixa da lista: o alerta vem do âmbar, não de
            um fundo vermelho que briga com o app inteiro */}
        <div
          className={`rounded-2xl px-4 py-3.5 shadow-xl transition-all duration-300 ${
            animateCard ? "animate-shake" : ""
          }`}
          style={{
            background: "linear-gradient(135deg, #054C40 0%, #075E54 100%)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(245,158,11,0.16)" }}
            >
              <Lock
                className="w-4 h-4"
                style={{ color: "#F59E0B" }}
                strokeWidth={2.5}
              />
            </div>
            {/* A conversa liberada está incompleta; as outras sequer foram
                abertas. São promessas diferentes, e dizer a mesma frase nas
                duas faria a tela mentir para quem compara. */}
            <div className="min-w-0 flex-1">
              <p className="text-white text-[13.5px] font-bold leading-snug mb-0.5">
                {liberado
                  ? "Esta conversa está incompleta"
                  : "Conversa ainda criptografada"}
              </p>
              <p className="text-white/70 text-[11.5px] leading-snug">
                {liberado
                  ? "Áudios, fotos e mensagens apagadas seguem bloqueados."
                  : "A prévia descriptografou só uma conversa. Esta continua fechada."}
              </p>
            </div>
            <button
              onClick={onPitch}
              className="flex items-center gap-0.5 flex-shrink-0 pl-3 pr-2 py-2 rounded-full text-[12.5px] font-bold active:scale-[0.97] transition-all"
              style={{ backgroundColor: "#25D366", color: "#06302B" }}
              aria-label="Liberar acesso completo"
            >
              <span>Liberar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 px-4">
        <div
          className="rounded-full px-4 py-3"
          style={{ backgroundColor: "#F6F6F6", padding: "5px" }}
        >
          <div className="flex items-center space-x-3">
            {/* Camera Circle with input color */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#F6F6F6" }}
            >
              <svg width="24" height="24" viewBox="0 0 83 83" fill="none">
                <rect width="83" height="83" rx="41.5" fill="#128C7E" />
                <path
                  d="M35.8701 20.2324C36.9037 20.1103 40.2042 20.1112 43.2041 20.2353C48.5793 20.4576 48.6938 20.5 51.0635 23.1396C52.8362 25.1135 54.0022 25.8192 55.4961 25.8212C58.2213 25.8249 61.6439 28.0118 62.9863 30.6074C63.9033 32.3815 64.0484 34.7832 63.8711 45.2441C63.6631 57.5071 63.6245 57.7946 61.9541 59.6035C58.8194 62.9971 57.0546 63.3183 41.5352 63.3183C24.8984 63.3183 22.8723 62.8636 20.4717 58.5927C19.1271 56.2009 19 54.9883 19 44.624C19 31.7827 19.5716 29.4239 23.2207 27.1992C24.4616 26.4425 26.4228 25.8227 27.5791 25.8212C29.2039 25.8192 30.1703 25.2094 31.8359 23.1367C33.2186 21.4158 34.664 20.3756 35.8701 20.2324ZM41.5 33.0625C35.6751 33.0625 30.9532 37.7845 30.9531 43.6093C30.9531 49.4342 35.6751 54.1562 41.5 54.1562C47.3249 54.1562 52.0469 49.4342 52.0469 43.6093C52.0468 37.7845 47.3249 33.0625 41.5 33.0625ZM41.5 36.5781C45.3832 36.5781 48.5312 39.7261 48.5312 43.6093C48.5312 47.4926 45.3833 50.6406 41.5 50.6406C37.6167 50.6406 34.4688 47.4926 34.4688 43.6093C34.4688 39.7261 37.6168 36.5781 41.5 36.5781Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Message field */}
            <div className="flex-1 bg-gray-100 rounded-full px-0 py-2.5">
              <input
                type="text"
                placeholder="Mensagem..."
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                disabled
              />
            </div>

            {/* Right icons - non-clickable */}
            <div className="flex items-center space-x-3">
              <div className="p-1">
                <Image
                  src="/icon/microfone.svg"
                  alt="Microfone"
                  width={20}
                  height={20}
                  style={{ filter: "brightness(0) saturate(100%)" }}
                />
              </div>

              <div className="p-1">
                <Image
                  src="/icon/galeria.svg"
                  alt="Galeria"
                  width={20}
                  height={20}
                  style={{ filter: "brightness(0) saturate(100%)" }}
                />
              </div>

              <div className="p-1">
                <Image
                  src="/icon/rosto.svg"
                  alt="Adesivos"
                  width={20}
                  height={20}
                  style={{ filter: "brightness(0) saturate(100%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS para o waveform de áudio e animações */}
      <style jsx>{`
        .audio-waveform-right rect {
          fill: #4a4a4a !important;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out 2;
        }
      `}</style>
      </div>
    </div>
  );
}
