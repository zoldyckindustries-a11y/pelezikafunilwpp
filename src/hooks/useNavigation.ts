import { useState, useEffect, useCallback, useRef } from "react";
import { getUserLocation, LocationData } from "../app/services/locationService";
import {
  CHAT_PARAM,
  ETAPA_PARAM,
  garantirIndiceNav,
  indiceNavAtual,
  lerParam,
  voltar,
  escreverParams,
} from "../lib/urlState";
import { conversaExiste } from "../app/data/acessoConversas";

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const isValidBrazilianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
};

export type NavigationScreen =
  | "intro"
  | "home"
  | "search"
  | "modal"
  | "loading"
  | "direct"
  | "chat"
  | "pitch";

const SCREENS: NavigationScreen[] = [
  "intro",
  "home",
  "search",
  "modal",
  "loading",
  "direct",
  "chat",
  "pitch",
];

// Etapas das quais o lead não sai sem passar pela oferta de retorno. São as
// posteriores à análise: até ali ele ainda está decidindo se entra; daqui em
// diante já viu a prova e sair é desistir.
const TELAS_COM_RETENCAO: NavigationScreen[] = ["direct", "chat", "pitch"];

const BACK_REDIRECT_URL = "/back-redirect";
// Uma vez só por sessão. Insistir a cada "voltar" prende a pessoa na página,
// irrita e ainda é bloqueado por navegador moderno.
const CHAVE_BACK_REDIRECT = "backRedirectUsado";

interface UrlState {
  screen: NavigationScreen;
  chatId: number | null;
}

/** Lê a etapa atual da URL. Devolve null quando a URL não descreve uma etapa
 *  deste funil (ex.: etapas do quiz). */
function lerEstadoDaUrl(): UrlState | null {
  const etapa = lerParam(ETAPA_PARAM);
  if (!etapa) return null;
  if (!SCREENS.includes(etapa as NavigationScreen)) return null;

  const screen = etapa as NavigationScreen;
  const chatParam = lerParam(CHAT_PARAM);
  const chatId = chatParam ? Number(chatParam) : null;
  // Todas as conversas da lista abrem — só uma delas é legível. Quem decide
  // o que aparece dentro é o ChatIndividual, não a navegação.
  const chatValido = conversaExiste(chatId);

  if (screen === "chat") {
    return chatValido
      ? { screen, chatId }
      : { screen: "direct", chatId: null };
  }

  return { screen, chatId: chatValido ? chatId : null };
}

interface UseNavigationOptions {
  // Telefone já capturado em um funil anterior (ex: quiz) — pula a digitação e
  // dispara a busca automaticamente
  initialPhone?: string;
  // Pula a animação de abertura, útil quando o usuário já veio de outra etapa
  skipIntro?: boolean;
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const { initialPhone, skipIntro } = options;
  const hasInitialPhone = !!initialPhone && isValidBrazilianPhone(initialPhone);

  const telaInicial: NavigationScreen = hasInitialPhone
    ? "search"
    : skipIntro
      ? "home"
      : "intro";
  const telaInicialRef = useRef<NavigationScreen>(telaInicial);

  const [screen, setScreen] = useState<NavigationScreen>(telaInicial);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [instagramHandle, setInstagramHandle] = useState(
    hasInitialPhone ? formatPhoneNumber(initialPhone as string) : ""
  );
  const [targetName, setTargetName] = useState<string>("");
  const [userHasTyped, setUserHasTyped] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isFetchingProfileImage, setIsFetchingProfileImage] = useState(false);
  const [fullName, setFullName] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<LocationData | undefined>(
    undefined
  );
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [userPk, setUserPk] = useState<string | undefined>(undefined);
  const [hasPerformedSearch, setHasPerformedSearch] = useState<boolean>(false);

  // Timer de transição e token da busca em andamento: um "voltar" durante a
  // busca não pode deixar a requisição velha empurrar a pessoa para a
  // próxima tela depois de ela já ter mudado de lugar.
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTokenRef = useRef(0);
  const autoSearchRef = useRef(false);

  // Etapa atual em ref: o ouvinte de popstate é registrado uma vez só, e um
  // valor preso no closure faria a retenção ler sempre a etapa inicial.
  const screenRef = useRef<NavigationScreen>(telaInicial);

  const applyScreen = useCallback(
    (next: NavigationScreen, chatId: number | null) => {
      screenRef.current = next;
      setScreen(next);
      setSelectedChatId(next === "chat" ? chatId : null);
      setIsTransitioning(false);
    },
    []
  );

  /** Leva para a oferta de retorno. Devolve false se já tiver sido usada
   *  nesta sessão — aí o "voltar" segue o caminho normal. */
  const ofertarRetorno = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem(CHAVE_BACK_REDIRECT) === "1") return false;
    sessionStorage.setItem(CHAVE_BACK_REDIRECT, "1");
    window.location.href = BACK_REDIRECT_URL;
    return true;
  }, []);

  // A URL é a fonte da verdade da navegação: no mount ela diz em que etapa
  // estamos (link direto cai no lugar certo) e no popstate o botão voltar
  // do navegador devolve a tela anterior.
  useEffect(() => {
    garantirIndiceNav();

    const doUrl = lerEstadoDaUrl();
    if (doUrl) {
      applyScreen(doUrl.screen, doUrl.chatId);
    } else if (lerParam(ETAPA_PARAM) === null) {
      // Primeira visita: registra a etapa inicial sem criar histórico.
      escreverParams({ [ETAPA_PARAM]: telaInicialRef.current }, "replace");
    }

    const aoVoltar = () => {
      searchTokenRef.current += 1;
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }

      const atual = screenRef.current;
      const proximo = lerEstadoDaUrl();

      // Passada a análise, o funil só anda para a frente. A única volta que
      // continua fazendo sentido é sair de uma conversa para a lista — é o
      // gesto que a pessoa usa para abrir outra, não para desistir.
      //
      // Todo o resto (voltar da oferta, voltar da lista, voltar de uma
      // conversa aberta por link direto) é abandono, e abandono passa pela
      // recuperação. Depois de oferecida uma vez, o caminho volta ao normal:
      // insistir prende a pessoa na página e irrita.
      if (TELAS_COM_RETENCAO.includes(atual)) {
        const voltaInterna = atual === "chat" && proximo?.screen === "direct";
        if (!voltaInterna && ofertarRetorno()) return;
      }

      if (!proximo) return;
      applyScreen(proximo.screen, proximo.chatId);
    };

    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, [applyScreen, ofertarRetorno]);

  // Link direto para uma etapa de retenção (?etapa=pitch numa aba nova) não
  // tem histórico interno: o "voltar" sairia do site sem disparar popstate e
  // a recuperação nunca rodaria. Uma entrada extra dá o que consumir.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!TELAS_COM_RETENCAO.includes(screen)) return;
    if (indiceNavAtual() > 0) return;
    escreverParams({}, "push");
  }, [screen]);

  const navigateTo = useCallback(
    (
      next: NavigationScreen,
      options?: {
        delay?: number;
        chatId?: number | null;
        mode?: "push" | "replace";
      }
    ) => {
      const { delay = 0, chatId = null, mode = "push" } = options || {};

      const run = () => {
        applyScreen(next, chatId);
        escreverParams(
          {
            [ETAPA_PARAM]: next,
            [CHAT_PARAM]:
              next === "chat" || next === "pitch" ? chatId : null,
          },
          mode
        );
      };

      if (delay > 0) {
        setIsTransitioning(true);
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = setTimeout(run, delay);
      } else {
        run();
      }
    },
    [applyScreen]
  );

  // Load hasPerformedSearch from localStorage on component mount
  useEffect(() => {
    const storedSearchStatus = localStorage.getItem("hasPerformedSearch");
    if (storedSearchStatus === "true") {
      setHasPerformedSearch(true);
    }
  }, []);

  const handleIntroComplete = () => navigateTo("home", { mode: "replace" });
  const handleTestClick = () => navigateTo("search", { delay: 300 });

  const handleSearch = useCallback(async () => {
    if (!isValidBrazilianPhone(instagramHandle)) return;
    const token = ++searchTokenRef.current;
    setIsFetchingProfileImage(true);
    setIsFetchingLocation(true);
    try {
      // Store the searched phone number in localStorage
      localStorage.setItem("searchedUsername", instagramHandle.trim());
      // nome do alvo também persiste: outras rotas (ex. back-redirect)
      // recarregam a página e perdem o estado do React
      localStorage.setItem("targetName", targetName.trim());
      // Nova busca, nova prévia: descarta o relógio da anterior
      localStorage.removeItem("previewStartedAt");

      // Foto de perfil real do WhatsApp (se não tiver, cai no avatar padrão)
      let profilePic = "";
      try {
        const res = await fetch("/api/whatsapp-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: instagramHandle }),
        });
        if (res.ok) {
          const json = await res.json();
          profilePic = json?.picture ?? "";
        }
      } catch (picError) {
        console.error("Error fetching WhatsApp profile picture:", picError);
      }

      const data = {
        pk: "1234567890",
        username: instagramHandle.trim(),
        full_name: "Contato Demo",
        biography: "Vulnerabilidade detectada no backup",
        profile_pic_url: profilePic,
        is_private: false,
      };

      setProfileImageUrl(data.profile_pic_url);
      setFullName(data.full_name);
      setBio(data.biography);
      setUserPk(data.pk);
      // Store the data we'll need later
      localStorage.setItem("userId", data.pk);
      localStorage.setItem("userProfilePic", data.profile_pic_url);
      localStorage.setItem("isPrivate", data.is_private.toString());

      // Localização aproximada do número, obtida via geolocalização por IP
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (locationError) {
        console.error("Error getting location:", locationError);
      }

      // Atraso proposital: uma consulta que volta rápido demais não convence.
      await new Promise((resolve) => setTimeout(resolve, 3900));

      // A pessoa pode ter voltado durante a busca: a resposta velha não
      // pode mais empurrar a tela para a frente.
      if (searchTokenRef.current !== token) return;

      navigateTo("modal");
    } catch (error) {
      console.error("Error fetching profile image:", error);
      setProfileImageUrl(null);
      setFullName(undefined);
      setBio(undefined);
      setUserPk(undefined);
    } finally {
      if (searchTokenRef.current === token) {
        setIsFetchingProfileImage(false);
        setIsFetchingLocation(false);
      }
    }
  }, [instagramHandle, targetName, navigateTo]);

  // Se um telefone já veio pronto de outra etapa (ex: quiz), dispara a busca
  // sozinho assim que a tela de busca entra.
  useEffect(() => {
    if (!hasInitialPhone) return;
    if (screen !== "search" || autoSearchRef.current) return;
    // A marcação de "já buscou" vai dentro do timer: em modo estrito o
    // React executa o efeito duas vezes, e marcar antes cancelaria a busca
    // na segunda vez.
    const t = setTimeout(() => {
      autoSearchRef.current = true;
      handleSearch();
    }, 700);
    return () => clearTimeout(t);
  }, [hasInitialPhone, screen, handleSearch]);

  const handleModalConfirm = async () => {
    try {
      // The data is already stored in localStorage from handleSearch
      setHasPerformedSearch(true);
      localStorage.setItem("hasPerformedSearch", "true");
      // Fluxo: modal -> loading (quebra da criptografia) -> direct -> pitch.
      // "replace" em vez de "push": a etapa dura ~31s, e voltar para ela pelo
      // histórico prenderia a pessoa numa tela que empurra adiante sozinha.
      navigateTo("loading", { mode: "replace" });
    } catch (error) {
      console.error("Error storing user data:", error);
      navigateTo("loading", { mode: "replace" });
    }
  };

  const handleModalCancel = () =>
    voltar(() => navigateTo("search", { mode: "replace" }));

  const handleLoadingComplete = async () => {
    navigateTo("direct", { mode: "replace" });
  };

  const handleBackFromDirect = () =>
    voltar(() => {
      setInstagramHandle("");
      setUserHasTyped(false);
      navigateTo("home", { mode: "replace" });
    });

  const handleChatSelect = (chatId: number) =>
    navigateTo("chat", { chatId, mode: "push" });

  const handleBackFromChat = () =>
    voltar(() => navigateTo("direct", { mode: "replace" }));

  const handlePitchPage = (chatId?: number) => {
    // O clique pode chegar como evento (o botão passa o evento adiante):
    // só um número serve como chat de origem.
    const origem = typeof chatId === "number" ? chatId : selectedChatId ?? null;

    // O username da oferta viaja com a própria tela: quem abre o pitch a
    // partir do Direct precisa que o número apareça lá.
    if (typeof window !== "undefined") {
      const searchedUsername = localStorage.getItem("searchedUsername");
      if (searchedUsername) {
        localStorage.setItem("pitchUsername", searchedUsername);
        window.dispatchEvent(
          new CustomEvent("updatePitchUsername", {
            detail: { username: searchedUsername },
          })
        );
      }
    }
    navigateTo("pitch", {
      chatId: origem,
      mode: "push",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstagramHandle(formatPhoneNumber(e.target.value));
    if (!userHasTyped && e.target.value.length > 0) {
      setUserHasTyped(true);
    }
  };

  const isPhoneValid = isValidBrazilianPhone(instagramHandle);

  const handleInputFocus = () => {
    if (!userHasTyped) {
      setUserHasTyped(true);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetName(e.target.value);
  };

  const isNameValid = targetName.trim().length > 0;

  const setSelectedChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  return {
    // State
    showIntro: screen === "intro",
    showSearchCard: screen === "search",
    showModal: screen === "modal",
    showLoading: screen === "loading",
    showDirect: screen === "direct",
    showChat: screen === "chat",
    showPitch: screen === "pitch",
    isTransitioning,
    selectedChatId,
    instagramHandle,
    targetName,
    userHasTyped,
    profileImageUrl,
    isFetchingProfileImage,
    fullName,
    bio,
    userLocation,
    isFetchingLocation,
    userPk,
    hasPerformedSearch,
    isPhoneValid,
    isNameValid,

    // Actions
    navigateTo,
    handleIntroComplete,
    handleTestClick,
    handleSearch,
    handleModalConfirm,
    handleModalCancel,
    handleLoadingComplete,
    handleBackFromDirect,
    handleChatSelect,
    handleBackFromChat,
    handlePitchPage,

    handleNameChange,
    handleInputChange,
    handleInputFocus,
    setSelectedChat,
  };
}
