"use client";

import { useEffect } from "react";
import Home from "@/app/page";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Resultado04() {
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
      animation_title="Sistema interno usado por operadoras de celular para identificar redes sociais de criminosos"
      animation_subtitle="Agora vazado e disponível para qualquer um testar e usar"
      animation_subtitle2="Monitoramento silencioso em tempo real…"
      search_title={
        <>
          Este sistema era usado por agentes das operadoras para monitorar
          contas suspeitas.
        </>
      }
      search_subtitle={
        <>
          Agora, qualquer pessoa pode ver <b>tudo</b> com apenas um número.
        </>
      }
    />
  );
}
