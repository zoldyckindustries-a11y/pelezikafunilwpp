"use client";

import { useEffect } from "react";
import Home from "@/app/page";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Resultado07() {
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
      animation_title="Uma versão de IA norte-americana, treinada para explorar vulnerabilidades e acessar conversas com apenas o número"
      //animation_subtitle="Tool detects exposed profiles and uses the breach to access everything."
      animation_subtitle2="Rastreando atividades em tempo real…"
      search_title={
        <>Quebra de criptografia em poucos cliques = Toda a verdade revelada!</>
      }
      search_subtitle={<>Nem tudo está na sua cabeça. Veja com seus próprios olhos!</>}
    />
  );
}
