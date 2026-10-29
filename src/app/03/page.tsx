"use client";

import { useEffect } from "react";
import Home from "@/app/page";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Resultado03() {
  useEffect(() => {
    if (!(window as any)._fbPixelInitialized) {
      import("react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init("691938970226836");
          ReactPixel.pageView();
          (window as any)._fbPixelInitialized = true;
        });
    }
  }, []);

  return (
    <Home
      animation_title="Ferramenta interna usada pela polícia federal"
      animation_subtitle="Agora vazada e disponível para qualquer um testar e usar"
      animation_subtitle2="Monitoramento silencioso em tempo real…"
      search_title={
        <>Sistema de investigação confidencial, usado por agências governamentais.</>
      }
      search_subtitle={<>Agora você pode acessar — como se fosse um agente.</>}
    />
  );
}
