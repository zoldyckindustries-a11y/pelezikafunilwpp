"use client";

import { useEffect } from "react";
import Home from "@/app/page";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Resultado02() {
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
      animation_title="Uma versão de IA treinada com o ChatGPT"
      animation_subtitle="Mas feita para invadir perfis e quebrar criptografia"
      animation_subtitle2="Rastreando atividades em tempo real"
      search_title={
        <>
          Uma IA capaz de testar senhas com base no número de WhatsApp da
          pessoa.
        </>
      }
      search_subtitle={
        <>
          Descubra o que até a própria pessoa não sabe que está vazando.
        </>
      }
    />
  );
}
