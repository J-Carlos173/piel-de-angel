import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getAllServicios } from "@/lib/services-db";
import { COMUNAS, SERVICIOS_LP, type ServicioLP } from "@/data/servicios-lp";

const SITE = "https://www.pieldeangel.cl";

export default async function ServicioLanding({ s }: { s: ServicioLP }) {
  const url = `${SITE}/${s.slug}`;
  const wa = `https://wa.me/56977031461?text=${encodeURIComponent(s.waTexto)}`;
  const otros = SERVICIOS_LP.filter((o) => o.slug !== s.slug);

  const faq = [
    ...s.faq,
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
        "@id": `${url}#servicio`,
        name: `${s.nombre} a domicilio`,
        serviceType: s.nombre,
        url,
        description: s.metaDescription,
        provider: { "@id": `${SITE}/#business` },
        areaServed: COMUNAS.map((name) => ({ "@type": "City", name })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
          { "@type": "ListItem", position: 2, name: s.nombre, item: url },
        ],
      },
    ],
  };

  let foto = "";
  try {
    const servicios = await getAllServicios();
    foto = servicios.find((x) => s.match.test(x.title) && x.status === "published")?.thumbnail ?? "";
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
                {s.h1}
                <em>{s.h1em}</em>
              </h1>
              <p className="lp-lead">{s.lead}</p>
              <div className="lp-actions">
                <a href="/#agenda" className="btn-primary">
                  <i className="fa-regular fa-calendar" /> Reservar Hora
                </a>
                <a href={wa} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> Escribir por WhatsApp
                </a>
              </div>
            </div>
            {foto && (
              <div className="lp-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt={`${s.nombre} a domicilio — Piel de Ángel`} />
              </div>
            )}
          </div>

          <div className="lp-body">
            <h2>{s.queEs.titulo}</h2>
            <p>{s.queEs.texto}</p>

            <h2>Cómo es la sesión</h2>
            <p>{s.sesion}</p>

            <h2>Es para ti si…</h2>
            <ul>
              {s.paraTi.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <h2>Zonas de atención a domicilio</h2>
            <div className="lp-chips">
              {COMUNAS.map((c) => (
                <span key={c} className="lp-chip">{c}</span>
              ))}
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className="lp-faq">
              {faq.map(({ q, a }) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>

            <div className="lp-cta">
              <h2 style={{ marginTop: 0 }}>Reserva tu {s.nombre.toLowerCase()}</h2>
              <p>Elige tu horario y te confirmamos por WhatsApp.</p>
              <div className="lp-actions" style={{ justifyContent: "center", marginTop: 20 }}>
                <a href="/#agenda" className="btn-primary">
                  <i className="fa-regular fa-calendar" /> Reservar Hora
                </a>
                <a href={wa} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> WhatsApp
                </a>
              </div>
            </div>

            <h2>Otros servicios a domicilio</h2>
            <div className="lp-chips">
              {otros.map((o) => (
                <a key={o.slug} href={`/${o.slug}`} className="lp-chip lp-chip-link">
                  {o.nombre}
                </a>
              ))}
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
