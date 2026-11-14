import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Pixels } from "./components/Pixels";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Detective White - Plataforma de Monitoramento",
  description:
    "A maior tecnologia internacional de monitoramento de WhatsApp acaba de liberar sua versão oficial em português.",
  // Verificação de domínio do Business Manager. Vai pela API de metadata do
  // Next em vez de uma <meta> escrita à mão no <head>: assim a tag entra no
  // HTML de todas as rotas, que é onde o verificador da Meta procura.
  verification: {
    other: {
      "facebook-domain-verification": "3fefk1jnd644es070jflw63sxvtcb7",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-inter antialiased`}
        suppressHydrationWarning
      >
        {children}
        {/* Um único ponto de carga para Meta e Utmify, valendo para todas as
            rotas do funil. */}
        <Pixels />
      </body>
    </html>
  );
}
