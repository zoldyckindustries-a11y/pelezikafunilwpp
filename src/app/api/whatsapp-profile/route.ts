import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RAPIDAPI_KEY ausente" }, { status: 500 });
  }

  let phone = "";
  try {
    const body = await req.json();
    phone = String(body?.phone ?? "").replace(/\D/g, "");
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (phone.length < 10 || phone.length > 13) {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }
  // Garante o código do país (Brasil): 10/11 dígitos = sem o 55
  if (phone.length <= 11) phone = `55${phone}`;

  // Alguns números brasileiros têm o 9 depois do DDD e outros não.
  // Tenta o número como veio e depois a outra versão (com/sem o 9).
  const variants = [phone];
  const ddd = phone.slice(2, 4);
  const rest = phone.slice(4);
  if (rest.length === 9 && rest.startsWith("9")) {
    variants.push(`55${ddd}${rest.slice(1)}`); // remove o 9
  } else if (rest.length === 8) {
    variants.push(`55${ddd}9${rest}`); // adiciona o 9
  }

  // A API responde "not found" de forma intermitente: tenta algumas vezes por variante.
  const ATTEMPTS_PER_VARIANT = 3;
  for (const number of variants) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_VARIANT; attempt++) {
      try {
        const res = await fetch(
          "https://whatsapp-profile-data1.p.rapidapi.com/WhatsappProfilePhotoWithToken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": "whatsapp-profile-data1.p.rapidapi.com",
              "x-rapidapi-key": apiKey,
            },
            body: JSON.stringify({ phone_number: number }),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const picture: string | null =
            json?.url ?? json?.data?.picture ?? null;
          if (picture) return NextResponse.json({ picture });
        }
      } catch (error) {
        console.error("Erro ao consultar WhatsApp profile:", error);
      }
      if (attempt < ATTEMPTS_PER_VARIANT) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  return NextResponse.json({ picture: null }, { status: 200 });
}
