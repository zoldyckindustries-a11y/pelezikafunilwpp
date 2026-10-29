import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Detective White - Plataforma de Monitoramento",
  description:
    "A maior tecnologia internacional de monitoramento de WhatsApp acaba de liberar sua versão oficial em português.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-subids
          data-utmify-fast-start
          async
          defer
        />
      </head>
      <body
        className={`${inter.variable} font-inter antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
