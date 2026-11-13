/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net", // Allow all subdomains of fna.fbcdn.net
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc", // Foto de demonstração
      },
      {
        protocol: "https",
        hostname: "pps.whatsapp.net", // Foto de perfil do WhatsApp
      },
    ],
    domains: [
      // Add the domain from the error message and other common Instagram CDN domains
      "instagram.fnic3-1.fna.fbcdn.net",
      "cdninstagram.com",
      "scontent.cdninstagram.com",
      "scontent-lga3-1.cdninstagram.com", // Example of another common pattern
      "scontent.instagram.com",
      "scontent.cdngp01.fna.fbcdn.net", // Another example pattern
      "instagram.falg3-2.fna.fbcdn.net", // Add the new domain from the latest error
    ],
  },
};

module.exports = nextConfig;
