import { COMUNAS } from "@/data/servicios-lp";
import { getZonasDomicilio } from "@/lib/servicios-lp-content";
import { getHorarioAgenda, describirHorario } from "@/lib/horario-agenda";

const SITE = "https://www.pieldeangel.cl";

/**
 * Preguntas frecuentes generales del negocio (no de un servicio puntual), con marcado
 * FAQPage para que buscadores e IA conversacional puedan citar la respuesta directa.
 * Solo usa datos que ya existen en otra parte del sitio (zonas, horario, contacto, pago) —
 * no inventa precios ni políticas.
 */
export default async function FaqGeneral() {
  let zonas: string[] = COMUNAS;
  try {
    zonas = await getZonasDomicilio();
  } catch {}

  let horarioTexto = "Lunes a viernes 16:30–20:00, sábado 9:00–20:00";
  try {
    const horario = await getHorarioAgenda();
    const texto = describirHorario(horario);
    horarioTexto = texto.charAt(0).toUpperCase() + texto.slice(1);
  } catch {}

  const zonasTexto =
    zonas.length > 1
      ? `${zonas.slice(0, -1).join(", ")} y ${zonas[zonas.length - 1]}`
      : zonas[0] ?? "Santiago Oriente";

  const faq = [
    {
      q: "¿Qué es Piel de Ángel?",
      a: "Un servicio de estética facial y pestañas a domicilio en Santiago Oriente, más una tienda online de skincare con envío a todo Chile.",
    },
    {
      q: "¿En qué comunas hacen las atenciones a domicilio?",
      a: `Atendemos a domicilio en ${zonasTexto}. Si vives en otra comuna de Santiago, escríbenos por WhatsApp y lo revisamos.`,
    },
    {
      q: "¿Cómo reservo una hora?",
      a: "Desde la sección Agenda del sitio (pieldeangel.cl/#agenda) o escribiendo por WhatsApp al +56 9 7703 1461.",
    },
    {
      q: "¿Qué medios de pago aceptan?",
      a: "Tarjeta de crédito o débito vía WebPay/Transbank en el sitio, o coordinando el pago directamente por WhatsApp.",
    },
    {
      q: "¿Hacen envíos de los productos de skincare?",
      a: "Sí, envío a todo Chile. En Santiago el despacho es gratis los sábados, coordinado por WhatsApp.",
    },
    {
      q: "¿Cuál es el horario de atención?",
      a: horarioTexto + ".",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE}/#faq-general`,
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="faq-general" id="preguntas-frecuentes">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2 className="section-title">
            Antes de <em>reservar o comprar</em>
          </h2>
          <p className="section-subtitle">
            Lo que más nos preguntan por WhatsApp. Cada servicio tiene además su propia página
            con preguntas específicas.
          </p>
        </div>
        <div className="lp-faq faq-general-list reveal">
          {faq.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
