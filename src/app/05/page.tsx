"use client";

import { useEffect } from "react";
import Home from "@/app/page";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Resultado05() {
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
