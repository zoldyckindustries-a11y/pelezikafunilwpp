import { useState, useEffect } from "react";
import { getUserLocation, LocationData } from "../app/services/locationService";

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

type NavigationState = {
  showIntro: boolean;
  showSearchCard: boolean;
  showModal: boolean;
  showLoading: boolean;
  showDirect: boolean;
  showChat: boolean;
  showPitch: boolean;
  isTransitioning: boolean;
};

type NavigationScreen =
  | "intro"
  | "home"
  | "search"
  | "modal"
  | "loading"
  | "direct"
  | "chat"
  | "pitch";

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

  const [state, setState] = useState<NavigationState>({
    showIntro: skipIntro ? false : true,
    showSearchCard: hasInitialPhone,
    showModal: false,
    showLoading: false,
    showDirect: false,
    showChat: false,
    showPitch: false,
    isTransitioning: false,
  });

  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [instagramHandle, setInstagramHandle] = useState(
    hasInitialPhone ? formatPhoneNumber(initialPhone as string) : ""
  );
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

  const setSelectedChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  // Load hasPerformedSearch from localStorage on component mount
  useEffect(() => {
    const storedSearchStatus = localStorage.getItem("hasPerformedSearch");
    if (storedSearchStatus === "true") {
      setHasPerformedSearch(true);
    }
  }, []);

  const navigateTo = (
    screen: NavigationScreen,
    options?: { delay?: number; chatId?: number }
  ) => {
    const { delay = 0, chatId } = options || {};

    if (delay > 0) {
      setState((prev) => ({ ...prev, isTransitioning: true }));
      setTimeout(() => {
        performNavigation(screen, chatId);
        setState((prev) => ({ ...prev, isTransitioning: false }));
      }, delay);
    } else {
      performNavigation(screen, chatId);
    }
  };

  const performNavigation = (screen: NavigationScreen, chatId?: number) => {
    // Reset all states first
    const resetState: NavigationState = {
      showIntro: false,
      showSearchCard: false,
      showModal: false,
      showLoading: false,
      showDirect: false,
      showChat: false,
      showPitch: false,
      isTransitioning: false,
    };

    switch (screen) {
      case "intro":
        setState({ ...resetState, showIntro: true });
        break;
      case "home":
        setState({ ...resetState });
        break;
      case "search":
        setState({ ...resetState, showSearchCard: true });
        break;
      case "modal":
        setState((prev) => ({ ...prev, showModal: true }));
        break;
      case "loading":
        setState({ ...resetState, showLoading: true });
        break;
      case "direct":
        setState({ ...resetState, showDirect: true });
        break;
      case "chat":
        setState({ ...resetState, showChat: true });
        if (chatId) setSelectedChatId(chatId);
        break;
      case "pitch":
        setState({ ...resetState, showPitch: true });
        break;
    }
  };

  const handleIntroComplete = () => navigateTo("home");
  const handleTestClick = () => navigateTo("search", { delay: 300 });
  const handleSearch = async () => {
    if (isValidBrazilianPhone(instagramHandle)) {
      setIsFetchingProfileImage(true);
      setIsFetchingLocation(true);
      try {
        // Store the searched phone number in localStorage
        localStorage.setItem("searchedUsername", instagramHandle.trim());

        // Dados predefinidos apenas para demonstração (sem chamada de API)
        const data = {
          pk: "1234567890",
          username: instagramHandle.trim(),
          full_name: "Contato Demo",
          biography: "Vulnerabilidade detectada no backup",
          // Sem foto real: o avatar exibido é sempre o padrão (silhueta),
          // igual ao WhatsApp quando o contato não tem foto de perfil.
          profile_pic_url: "",
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

        // Pequeno atraso proposital para simular a busca acontecendo de verdade,
        // em vez do modal aparecer instantaneamente.
        await new Promise((resolve) => setTimeout(resolve, 2200));

        navigateTo("modal");
      } catch (error) {
        console.error("Error fetching profile image:", error);
        setProfileImageUrl(null);
        setFullName(undefined);
        setBio(undefined);
        setUserPk(undefined);
      } finally {
        setIsFetchingProfileImage(false);
        setIsFetchingLocation(false);
      }
    }
  };

  // Se um telefone já veio pronto de outra etapa (ex: quiz), dispara a busca sozinho
  useEffect(() => {
    if (!hasInitialPhone) return;
    const t = setTimeout(() => {
      handleSearch();
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalConfirm = async () => {
    try {
      // The data is already stored in localStorage from handleSearch
      setState((prev) => ({ ...prev, showModal: false, showLoading: true }));

      // Mark that a search has been performed after successful confirmation
      setHasPerformedSearch(true);
      localStorage.setItem("hasPerformedSearch", "true");
    } catch (error) {
      console.error("Error storing user data:", error);
      setState((prev) => ({ ...prev, showModal: false, showLoading: true }));
    }
  };

  const handleLoadingComplete = async () => {
    try {
      navigateTo("direct");
    } catch (error) {
      console.error("Error during loading completion:", error);
      navigateTo("direct");
    }
  };

  const handleModalCancel = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };
  const handleBackFromDirect = () => {
    setInstagramHandle("");
    setUserHasTyped(false);
    navigateTo("home");
  };
  const handleChatSelect = (chatId: number) => navigateTo("chat", { chatId });
  const handleBackFromChat = () => navigateTo("direct");
  const handlePitchPage = () => navigateTo("pitch");
  const handleBackFromPitch = () => {
    // When backing from pitch, reset search state if it was a re-search attempt
    if (hasPerformedSearch) {
      setInstagramHandle("");
      setUserHasTyped(false);
      navigateTo("home");
    } else {
      navigateTo("chat");
    }
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

  return {
    // State
    ...state,
    selectedChatId,
    instagramHandle,
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
    handleBackFromPitch,
    handleInputChange,
    handleInputFocus,
    setSelectedChat,
  };
}
