import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getAllServicios } from "@/lib/services-db";

export const revalidate = 3600;

const SITE = "https://www.pieldeangel.cl";
const URL = `${SITE}/lifting-de-pestanas`;
const WA = `https://wa.me/56977031461?text=${encodeURIComponent("Hola, quiero reservar un lifting de pestañas a domicilio.")}`;
const COMUNAS = ["Vitacura", "Lo Barnechea", "Las Condes", "Providencia", "Ñuñoa"];

const TITLE = "Lifting de pestañas a domicilio en Santiago Oriente";
const DESCRIPTION =
  "Lifting de pestañas a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Eleva y curva tus pestañas naturales, sin extensiones. Reserva tu hora.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: URL,
    siteName: "Piel de Ángel",
    title: `${TITLE} · Piel de Ángel`,
    description: DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Lifting de pestañas — Piel de Ángel" }],
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué es el lifting de pestañas?",
    a: "Es un tratamiento que eleva y curva tus pestañas naturales desde la raíz. Se ven más largas y abiertas, con un efecto de mirada despierta, sin usar extensiones.",
  },
  {
    q: "¿Cuánto dura el resultado?",
    a: "En general entre 6 y 8 semanas, hasta que las pestañas se renuevan de forma natural.",
  },
  {
    q: "¿Cuánto demora la sesión?",
    a: "Aproximadamente 60 minutos.",
  },
  {
    q: "¿Es doloroso? ¿Puedo hacerlo si tengo los ojos sensibles?",
    a: "Es una sesión tranquila, con los ojos cerrados, y no debería doler. Si tienes ojos sensibles, alergias o te hiciste algún tratamiento reciente en la zona, cuéntanos antes por WhatsApp para revisarlo contigo.",
  },
  {
    q: "¿Qué cuidados debo tener después?",
    a: "Al terminar te damos indicaciones. Por lo general se recomienda evitar el agua, el vapor y el maquillaje de ojos durante las primeras 24 horas.",
  },
  {
    q: "¿En qué comunas atienden?",
    a: `Atendemos a domicilio en ${COMUNAS.slice(0, -1).join(", ")} y ${COMUNAS[COMUNAS.length - 1]}. Si vives en otra zona, escríbenos y lo revisamos.`,
  },
  {
    q: "¿Cuánto cuesta y cómo reservo?",
    a: "El valor se coordina según tu caso. Puedes reservar tu hora desde la sección Agenda del sitio o escribirnos por WhatsApp.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${URL}#servicio`,
      name: "Lifting de pestañas a domicilio",
      serviceType: "Lifting de pestañas",
      url: URL,
      description: DESCRIPTION,
      provider: { "@id": `${SITE}/#business` },
      areaServed: COMUNAS.map((name) => ({ "@type": "City", name })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
        { "@type": "ListItem", position: 2, name: "Lifting de pestañas", item: URL },
      ],
    },
  ],
};

export default async function LiftingDePestanasPage() {
  let foto = "";
  try {
    const servicios = await getAllServicios();
    foto = servicios.find((s) => /pesta/i.test(s.title) && s.status === "published")?.thumbnail ?? "";
  } catch {}

  return (
    <>
      <Navbar />
      <main className="lp">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container">
          <div className={`lp-hero${foto ? "" : " sin-foto"}`}>
            <div>
              <span className="eyebrow">Estética a domicilio</span>
              <h1>
                Lifting de pestañas
                <em>a domicilio</em>
              </h1>
              <p className="lp-lead">
                Eleva y curva tus pestañas naturales desde la raíz para lograr una mirada abierta y despierta,
                sin extensiones y sin rizador todas las mañanas. Vamos hasta tu casa en Santiago Oriente.
              </p>
              <div className="lp-actions">
                <a href="/#agenda" className="btn-primary">
                  <i className="fa-regular fa-calendar" /> Reservar Hora
                </a>
                <a href={WA} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> Escribir por WhatsApp
                </a>
              </div>
            </div>
            {foto && (
              <div className="lp-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="Lifting de pestañas a domicilio — Piel de Ángel" />
              </div>
            )}
          </div>

          <div className="lp-body">
            <h2>¿Qué es el lifting de pestañas?</h2>
            <p>
              Es un tratamiento de estética que trabaja sobre tus pestañas naturales: las levanta y las curva desde la
              raíz, así se ven más largas y con más volumen. Como no lleva extensiones, el resultado se ve natural y no
              necesitas mantenimiento diario.
            </p>

            <h2>Cómo es la sesión</h2>
            <p>
              Dura aproximadamente 60 minutos y se hace en la comodidad de tu casa. Es una atención personalizada:
              antes de comenzar conversamos qué efecto quieres y revisamos si el tratamiento es adecuado para ti.
            </p>

            <h2>Es para ti si…</h2>
            <ul>
              <li>Quieres una mirada más abierta sin usar extensiones.</li>
              <li>Prefieres un resultado natural, que se vea como tus pestañas pero mejor.</li>
              <li>Buscas ahorrar tiempo en tu rutina de todos los días.</li>
            </ul>

            <h2>Zonas de atención a domicilio</h2>
            <div className="lp-chips">
              {COMUNAS.map((c) => (
                <span key={c} className="lp-chip">{c}</span>
              ))}
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className="lp-faq">
              {FAQ.map(({ q, a }) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>

            <div className="lp-cta">
              <h2 style={{ marginTop: 0 }}>Reserva tu lifting de pestañas</h2>
              <p>Elige tu horario y te confirmamos por WhatsApp.</p>
              <div className="lp-actions" style={{ justifyContent: "center", marginTop: 20 }}>
                <a href="/#agenda" className="btn-primary">
                  <i className="fa-regular fa-calendar" /> Reservar Hora
                </a>
                <a href={WA} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> WhatsApp
                </a>
              </div>
            </div>

            <p className="lp-related">
              Mira también: <a href="/#servicios">todos los servicios</a> · <a href="/#productos">la tienda</a> ·{" "}
              <a href="/consejos">consejos de piel</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
