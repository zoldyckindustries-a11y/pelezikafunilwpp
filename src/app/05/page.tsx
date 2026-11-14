"use client";

import Home from "@/app/page";

export default function Resultado05() {
  return (
    <Home
      animation_title="Vazamento da Meta comprometeu milhares de contas do WhatsApp."
      animation_subtitle="A ferramenta detecta números expostos e usa a falha para acessar tudo."
      animation_subtitle2="Monitoramento em tempo real, sem alertas..."
      search_title={<>A falha ainda não foi corrigida pela Meta.</>}
      search_subtitle={
        <>Enquanto isso, a ferramenta pode acessar conversas completas com apenas o número.</>
      }
    />
  );
}
