"use client";

import Script from "next/script";

// Rastreamento do funil, num lugar só.
//
// Antes o pixel do Meta era inicializado em oito arquivos de rota, com o
// mesmo bloco copiado e um guard `_fbPixelInitialized` em cada um: trocar de
// conta exigia lembrar dos oito, e as rotas "/" e "/roc" tinham ficado de
// fora, então os eventos de checkout disparavam sem pixel inicializado.
// Aqui o carregamento acontece uma vez, no layout, valendo para tudo.
//
// Não é preciso disparar PageView a cada troca de tela: o funil navega entre
// etapas pela querystring (mesma rota) e o back-redirect usa
// `window.location.href`, que recarrega a página e roda este script de novo.

const META_PIXEL_ID = "1723014578387937";
const UTMIFY_PIXEL_ID = "6af7adbea56ed20879a25554";

export function Pixels() {
  return (
    <>
      {/* Meta Pixel.
          O snippet define window.fbq, que é exatamente o que a biblioteca
          react-facebook-pixel procura: ela decide se está inicializada lendo
          `!!window.fbq` no instante em que o módulo é carregado. Como todos
          os ReactPixel.track() do funil são import() dinâmico dentro de
          handlers, eles sempre carregam depois daqui e enxergam o pixel
          pronto. Por isso nenhum ReactPixel.init() é mais necessário. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>

      {/* Pixel da Utmify.
          O embed oficial vem ofuscado (base64 + XOR), mas o que ele faz é só
          isto: definir window.pixelId e injetar pixel.js. Fica em claro para
          dar para auditar e para trocar o id sem precisar gerar outro blob.

          O id e o script vão no MESMO bloco de propósito: em dois <Script>
          separados a ordem de execução não é garantida, e o pixel.js subindo
          antes de window.pixelId existir não registraria nada. */}
      <Script id="utmify-pixel" strategy="afterInteractive">
        {`window.pixelId = "${UTMIFY_PIXEL_ID}";
var s = document.createElement("script");
s.src = "https://cdn.utmify.com.br/scripts/pixel/pixel.js";
s.async = true;
s.defer = true;
(document.head || document.documentElement).appendChild(s);`}
      </Script>

      {/* Parâmetros de campanha da Utmify (utm_*), que é outro script. */}
      <Script
        src="https://cdn.utmify.com.br/scripts/utms/latest.js"
        data-utmify-prevent-subids
        data-utmify-fast-start
        strategy="afterInteractive"
        async
        defer
      />
    </>
  );
}
