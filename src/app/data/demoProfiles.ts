// Perfis de demonstração do WhatsApp.
//
// Vivem fora dos componentes para que a lista de conversas e a tela de
// análise leiam a mesma fonte: abrir ?etapa=direct direto na URL precisa
// encontrar a lista montada, mesmo numa aba limpa.

export interface DemoProfile {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
}

export const CONVERSAS_LIBERADAS: DemoProfile[] = [
  // Sem foto de propósito. O rosto entregava o gênero do contato, e o que
  // faz a pessoa travar na oferta é não saber com quem o alvo está falando.
  // Fica a inicial sobre cor, exatamente como o WhatsApp faz. O nome também
  // é neutro pelo mesmo motivo.
  {
    pk: "1001",
    username: "alex",
    full_name: "Alex",
    profile_pic_url: "",
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

// Quase todas sem foto: as conversas bloqueadas caem no avatar padrão do
// WhatsApp, colorido por contato. Fotos de banco com fundo branco destoavam
// das demais e denunciavam que a lista é montada.
export const CONTATOS_BLOQUEADOS: DemoProfile[] = [
  // Recebeu a foto que saiu da primeira conversa: uma lista só de iniciais
  // é tão artificial quanto uma lista só de fotos.
  { pk: "2001", username: "ana.costa92", full_name: "Ana Costa", profile_pic_url: "/avatares/avatardirect01.png" },
  { pk: "2002", username: "lucas.santos", full_name: "Lucas Santos", profile_pic_url: "" },
  { pk: "2003", username: "julia_mendes", full_name: "Julia Mendes", profile_pic_url: "" },
  { pk: "2004", username: "pedro_oliveira", full_name: "Pedro Oliveira", profile_pic_url: "" },
  { pk: "2005", username: "camila.alves", full_name: "Camila Alves", profile_pic_url: "" },
  { pk: "2006", username: "rafael.souza", full_name: "Rafael Souza", profile_pic_url: "" },
  { pk: "2007", username: "bia_ferreira", full_name: "Bia Ferreira", profile_pic_url: "" },
  { pk: "2008", username: "thiago.lima", full_name: "Thiago Lima", profile_pic_url: "" },
];

const CHAVE_SEGUIDORES = "followers";
const CHAVE_LIBERADAS = "unlockedConversations";

/**
 * Garante que os perfis de demonstração existam no armazenamento local.
 * Chamado pela tela de análise e pela lista de conversas — assim a URL
 * ?etapa=direct funciona mesmo em aba nova.
 */
export function garantirPerfisDemo() {
  if (typeof window === "undefined") return;

  const seguidores = CONTATOS_BLOQUEADOS.map((contato, index) => ({
    pk: `20${index + 1}`,
    id: `20${index + 1}`,
    username: contato.username,
    full_name: contato.full_name,
    profile_pic_url: contato.profile_pic_url,
    is_private: false,
    is_verified: false,
  }));

  localStorage.setItem(CHAVE_SEGUIDORES, JSON.stringify(seguidores));
  localStorage.setItem(
    CHAVE_LIBERADAS,
    JSON.stringify(CONVERSAS_LIBERADAS)
  );
}
