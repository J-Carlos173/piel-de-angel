import { MetadataRoute } from "next";

// El wildcard "*" ya permite a cualquier rastreador, incluidos los de IA conversacional
// (GEO: que el sitio pueda ser citado por ChatGPT, Gemini, Copilot, Perplexity, Claude, etc.).
// Se listan algunos explícitamente solo para que quede documentado quién está permitido —
// no es necesario para el comportamiento, que ya hereda la regla "*".
const BOTS_IA = [
  "GPTBot", // OpenAI / ChatGPT (indexación, no el navegador en vivo del usuario)
  "ChatGPT-User", // OpenAI / ChatGPT (navegación en vivo a pedido del usuario)
  "Google-Extended", // entrenamiento de Gemini / Google AI (separado de Googlebot)
  "PerplexityBot",
  "ClaudeBot", // Anthropic, crawling
  "anthropic-ai",
  "CCBot", // Common Crawl, usado para entrenar varios modelos
  "Bingbot", // alimenta Bing y Copilot
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/checkout/"] },
      ...BOTS_IA.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/admin/", "/checkout/"],
      })),
    ],
    sitemap: "https://www.pieldeangel.cl/sitemap.xml",
  };
}
