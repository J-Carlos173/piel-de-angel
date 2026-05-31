import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import PageTracker from "@/components/PageTracker";

const SITE_URL = "https://www.pieldeangel.cl";
const SITE_NAME = "Piel de Ángel";
const DESCRIPTION =
  "Skincare premium y estética facial en Santiago. Sérums con ácido hialurónico, vitamina C, retinol y protección solar. Rutinas K-beauty y tratamientos faciales profesionales. Envío a todo Chile.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Piel de Ángel · Skincare Premium & Estética Facial Santiago",
    template: "%s · Piel de Ángel",
  },
  description: DESCRIPTION,
  keywords: [
    "skincare premium Chile",
    "cosmética coreana Chile",
    "sérum coreano Santiago",
    "K-beauty Chile",
    "glass skin Chile",
    "ácido hialurónico Chile",
    "vitamina C sérum Chile",
    "retinol Chile",
    "niacinamida Chile",
    "skin barrier Chile",
    "rutina skincare Chile",
    "protector solar Chile",
    "crema antiedad Santiago",
    "lifting pestañas Santiago",
    "limpieza facial Santiago",
    "estética premium Santiago",
    "tratamientos faciales Santiago",
    "skincare minimalista Chile",
    "contorno ojos Chile",
    "sérum pestañas Chile",
    "despacho gratis Santiago sábados",
    "envío gratis skincare Chile",
    "comprar skincare online Chile",
    "tienda skincare online Santiago",
    "peeling químico Santiago",
    "microdermoabrasión Santiago",
    "masaje facial relajante Santiago",
    "tratamiento manchas faciales Santiago",
    "reservar hora estética Santiago",
    "agenda online estética Santiago",
    "cita facial Santiago online",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Piel de Ángel · Skincare Premium & Estética Facial Santiago",
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Piel de Ángel — Skincare Premium Chile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piel de Ángel · Skincare Premium Chile",
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Schema JSON-LD: negocio local + tienda online
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BeautySalon",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      legalName: "Sociedad de Inversiones Ángeles SPA",
      url: SITE_URL,
      description: DESCRIPTION,
      image: `${SITE_URL}/og-image.jpg`,
      priceRange: "$$",
      currenciesAccepted: "CLP",
      paymentAccepted: "Tarjeta de crédito, débito, WebPay, WhatsApp",
      areaServed: {
        "@type": "Country",
        name: "Chile",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Omar Herrera Gutiérrez 1556",
        addressLocality: "Puente Alto",
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Spanish",
      },
      telephone: "+56977031461",
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday"], opens: "16:00", closes: "20:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Thursday", "Friday"],   opens: "16:00", closes: "22:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"],             opens: "09:30", closes: "15:00" },
      ],
      sameAs: [
        "https://www.instagram.com/pieldeangel.ls",
        "https://www.instagram.com/pieldeangel.cosmetica",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: "es-CL",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/#productos`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "OnlineStore",
      "@id": `${SITE_URL}/#store`,
      name: `${SITE_NAME} — Tienda Online`,
      url: `${SITE_URL}/#productos`,
      description: "Tienda online de skincare premium. Sérums, cremas, limpiadores y protección solar con envío a todo Chile. Despacho gratis en Santiago todos los sábados, coordinado por WhatsApp.",
      currenciesAccepted: "CLP",
      paymentAccepted: "WebPay, Transbank",
      areaServed: "Chile",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Skincare & Cosmética",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sérums con ácido hialurónico", category: "Skincare", offers: { "@type": "Offer", priceCurrency: "CLP", availability: "https://schema.org/InStock" } } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Vitamina C sérum", category: "Skincare", offers: { "@type": "Offer", priceCurrency: "CLP", availability: "https://schema.org/InStock" } } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Protector solar facial", category: "Protección Solar", offers: { "@type": "Offer", priceCurrency: "CLP", availability: "https://schema.org/InStock" } } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Crema hidratante", category: "Hidratación", offers: { "@type": "Offer", priceCurrency: "CLP", availability: "https://schema.org/InStock" } } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Limpiador facial", category: "Limpieza", offers: { "@type": "Offer", priceCurrency: "CLP", availability: "https://schema.org/InStock" } } },
        ],
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#servicios`,
      name: "Tratamientos y Servicios de Estética",
      provider: { "@id": `${SITE_URL}/#business` },
      areaServed: "Santiago, Chile",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Estética Piel de Ángel",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Limpieza Facial Profunda",    description: "Purificación profunda que elimina impurezas y devuelve luminosidad al rostro." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lifting de Pestañas",         description: "Efecto curvado natural y duradero sin extensiones." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hidratación Facial",          description: "Restaura la hidratación profunda con activos premium." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tratamiento Anti-edad",       description: "Protocolos personalizados anti-edad y revitalizantes." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ritual de Bienestar",         description: "Experiencia completa de relajación: masaje facial y aromaterapia." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Diseño y depilación de cejas", description: "Definición y cuidado profesional de cejas." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Peeling Químico",               description: "Renovación celular con ácidos para piel más luminosa y uniforme." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Microdermoabrasión",            description: "Exfoliación mecánica profunda para textura suave y poros limpios." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Masaje Facial Relajante",       description: "Masaje facial con técnicas orientales para aliviar tensión y drenar." } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tratamiento para Manchas",      description: "Protocolo despigmentante con activos como vitamina C y niacinamida." } },
        ],
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider />
        <PageTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
