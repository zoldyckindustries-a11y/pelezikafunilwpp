// Localização aproximada do visitante, por IP.
//
// A consulta roda no navegador, então o limite de requisições de cada
// provedor é por IP do visitante, não do servidor. Ainda assim um provedor
// sozinho é frágil: basta ele responder "RateLimited" (o ipapi.co faz isso
// depois de algumas consultas do mesmo IP, o que acontece direto em
// desenvolvimento) para todo mundo cair em São Paulo. A cidade errada
// aparece na busca, na quebra da criptografia e no mapa do pitch, então a
// resolução tenta provedores em sequência antes de desistir.

import axios from "axios";

export interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

const CACHE_KEY = "userLocation";

const PADRAO: LocationData = {
  city: "São Paulo",
  state: "SP",
  country: "Brasil",
  latitude: -23.5505,
  longitude: -46.6333,
};

// O geojs devolve o nome da unidade federativa por extenso, sem a sigla.
const SIGLA_POR_ESTADO: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

/** "Paraná" vira "parana": permite casar o nome com a tabela de siglas. */
function semAcento(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function paraSigla(regiao: string | undefined | null): string {
  const bruto = (regiao ?? "").trim();
  if (!bruto) return "";
  // Já veio como sigla.
  if (/^[A-Za-z]{2}$/.test(bruto)) return bruto.toUpperCase();
  return SIGLA_POR_ESTADO[semAcento(bruto)] ?? "";
}

function numero(valor: unknown): number | undefined {
  const n = typeof valor === "string" ? Number(valor) : valor;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function paisBr(valor: unknown): string {
  const nome = String(valor ?? "").trim();
  if (!nome) return "Brasil";
  return nome === "Brazil" ? "Brasil" : nome;
}

/** Só serve se trouxer cidade e coordenadas: o mapa do pitch precisa das duas. */
function completo(dados: LocationData | null): dados is LocationData {
  return Boolean(
    dados &&
      dados.city &&
      typeof dados.latitude === "number" &&
      typeof dados.longitude === "number"
  );
}

type Provedor = {
  nome: string;
  resolver: () => Promise<LocationData | null>;
};

// A ordem importa: os dois primeiros devolvem a cidade acentuada, que é como
// ela aparece na tela. O ipwho.is entra por último porque devolve "Andira"
// no lugar de "Andirá".
const PROVEDORES: Provedor[] = [
  {
    nome: "ipapi.co",
    resolver: async () => {
      const { data } = await axios.get("https://ipapi.co/json/", {
        timeout: 5000,
      });
      // Responde 200 com {error:true, reason:"RateLimited"} em vez de 429.
      if (!data || data.error || !data.city) return null;
      return {
        city: String(data.city),
        state: paraSigla(data.region_code ?? data.region),
        country: paisBr(data.country_name),
        latitude: numero(data.latitude),
        longitude: numero(data.longitude),
      };
    },
  },
  {
    nome: "geojs",
    resolver: async () => {
      const { data } = await axios.get(
        "https://get.geojs.io/v1/ip/geo.json",
        { timeout: 5000 }
      );
      if (!data?.city) return null;
      return {
        city: String(data.city),
        state: paraSigla(data.region),
        country: paisBr(data.country),
        latitude: numero(data.latitude),
        longitude: numero(data.longitude),
      };
    },
  },
  {
    nome: "ipwho.is",
    resolver: async () => {
      const { data } = await axios.get("https://ipwho.is/", {
        timeout: 5000,
      });
      if (!data?.success || !data?.city) return null;
      return {
        city: String(data.city),
        state: paraSigla(data.region_code ?? data.region),
        country: paisBr(data.country),
        latitude: numero(data.latitude),
        longitude: numero(data.longitude),
      };
    },
  },
];

function lerCache(): LocationData | null {
  try {
    const bruto = localStorage.getItem(CACHE_KEY);
    if (!bruto) return null;
    const cache: LocationData = JSON.parse(bruto);
    // Cache anterior à inclusão das coordenadas não serve para o mapa.
    return completo(cache) ? cache : null;
  } catch {
    return null;
  }
}

function gravarCache(dados: LocationData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(dados));
  } catch {
    // Navegação anônima pode recusar a escrita.
  }
}

export async function getUserLocation(): Promise<LocationData> {
  const cache = lerCache();
  if (cache) return cache;

  for (const provedor of PROVEDORES) {
    try {
      const dados = await provedor.resolver();
      if (completo(dados)) {
        gravarCache(dados);
        return dados;
      }
      console.warn(`[geo] ${provedor.nome} sem cidade ou coordenadas`);
    } catch (erro) {
      console.warn(`[geo] ${provedor.nome} falhou:`, erro);
    }
  }

  // Todos falharam: o padrão mantém a tela de pé, mas não vai para o cache.
  // Sem isso, uma única falha prenderia o visitante em São Paulo pelo resto
  // da sessão, mesmo que a próxima consulta fosse funcionar.
  console.error("[geo] nenhum provedor respondeu, usando padrão");
  return PADRAO;
}
