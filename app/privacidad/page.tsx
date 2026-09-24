import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Piel de Ángel",
  description:
    "Cómo Piel de Ángel recopila, usa y protege tus datos personales, y cómo puedes ejercer tus derechos.",
  alternates: { canonical: "https://www.pieldeangel.cl/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <main style={{ background: "var(--crema)", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: "var(--rosa-deep)", fontSize: 13, fontFamily: "Montserrat, sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <i className="fa-solid fa-arrow-left" /> Volver al inicio
          </Link>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: "normal", color: "var(--negro-soft)", margin: "0 0 8px" }}>
            Política de Privacidad
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "var(--gris-calido)", letterSpacing: "0.08em" }}>
            Última actualización: Septiembre 2026
          </p>
        </div>

        <div style={{ fontFamily: "Georgia, serif", color: "var(--texto)", lineHeight: 1.8, fontSize: 15 }}>

          <Section title="1. Quién es el responsable de tus datos">
            <p>
              El responsable del tratamiento de tus datos personales es{" "}
              <strong>Sociedad de Inversiones Ángeles SPA</strong>, RUT <strong>78.075.241-6</strong>,
              con domicilio en La Paloma 1982 SN, La Pintana, Santiago, Región Metropolitana, Chile
              (en adelante, &ldquo;Piel de Ángel&rdquo;), titular del sitio <strong>www.pieldeangel.cl</strong>.
            </p>
            <p>
              Puedes contactarnos por temas de privacidad en{" "}
              <a href="mailto:pieldeangel.contacto@gmail.com" style={{ color: "var(--rosa-deep)" }}>pieldeangel.contacto@gmail.com</a>{" "}
              o por WhatsApp al +56 9 7703 1461.
            </p>
          </Section>

          <Section title="2. Qué datos recopilamos y para qué">
            <p><strong>Cuando compras en la tienda:</strong> nombre, correo electrónico, teléfono, dirección de despacho (calle, departamento, ciudad y región), los productos que compras y el monto pagado.
              Del pago solo recibimos el resultado de la transacción, el código de autorización y los últimos 4 dígitos de la tarjeta.
              <strong> Nunca vemos ni guardamos el número completo de tu tarjeta</strong>: el pago lo procesa directamente Transbank (WebPay Plus).
              Usamos estos datos para procesar y despachar tu pedido, enviarte la confirmación y atender reclamos o consultas posteriores.</p>
            <p><strong>Cuando solicitas una hora de atención a domicilio:</strong> nombre, correo, teléfono, servicio, fecha y hora.
              Los usamos para evaluar tu solicitud, confirmarla o proponerte otra hora, y coordinar la visita. Si la hora se confirma, se registra en la agenda de Piel de Ángel.</p>
            <p><strong>Cuando dejas una reseña:</strong> tu nombre y el texto que escribes. Solo se publican después de ser revisadas.</p>
            <p><strong>Cuando nos escribes por WhatsApp, Instagram o correo:</strong> los datos que tú nos entregues (por ejemplo tu nombre, teléfono y lo que consultas), para responderte.</p>
            <p><strong>Datos de navegación:</strong> contamos las visitas por página de forma anónima y agregada (sin identificarte) y usamos Vercel Analytics, que mide el uso del sitio sin cookies y sin crear un perfil tuyo.
              Además, el hosting registra datos técnicos básicos (como la dirección IP) por seguridad y funcionamiento.</p>
            <p>No pedimos datos sensibles a través del sitio. Si nos cuentas voluntariamente alguna condición de salud o de tu piel para orientar un tratamiento, la usamos únicamente para ese fin.</p>
          </Section>

          <Section title="3. Por qué podemos usar tus datos">
            <ul>
              <li><strong>Para cumplir el contrato</strong> que celebras con nosotros: procesar una compra, despacharla o coordinar una atención.</li>
              <li><strong>Para cumplir obligaciones legales</strong>, por ejemplo tributarias, contables y de protección al consumidor.</li>
              <li><strong>Con tu consentimiento</strong>, cuando corresponda (por ejemplo, para cookies no esenciales si algún día las usamos). Puedes retirarlo cuando quieras.</li>
              <li><strong>Por interés legítimo</strong>, como la seguridad del sitio, prevenir fraudes y medir el uso del sitio de forma anónima.</li>
            </ul>
            <p>No tomamos decisiones automatizadas sobre ti ni vendemos tus datos.</p>
          </Section>

          <Section title="4. Con quién compartimos tus datos">
            <p>Solo compartimos lo necesario con proveedores que nos ayudan a operar el sitio:</p>
            <ul>
              <li><strong>Transbank S.A. (WebPay Plus):</strong> procesa el pago con tarjeta.</li>
              <li><strong>Empresas de transporte</strong> (por ejemplo Blue Express o Starken): nombre, teléfono y dirección para entregar tu pedido.</li>
              <li><strong>Vercel Inc.:</strong> hosting del sitio, medición anónima de visitas y almacenamiento de imágenes.</li>
              <li><strong>Neon:</strong> base de datos donde se guardan pedidos, solicitudes y reseñas.</li>
              <li><strong>Google:</strong> correo electrónico (Gmail) para enviarte confirmaciones y avisos, y Google Calendar para la agenda de atenciones.</li>
              <li><strong>Meta (WhatsApp e Instagram):</strong> solo si tú decides contactarnos por esos canales; se rigen por sus propias políticas.</li>
            </ul>
            <p>
              Algunos de estos proveedores tienen servidores fuera de Chile (por ejemplo, en Estados Unidos), por lo que tus datos pueden ser
              tratados en otros países con las medidas de seguridad que esos proveedores declaran. También podemos entregar datos cuando una
              autoridad competente lo exija conforme a la ley.
            </p>
          </Section>

          <Section title="5. Cookies y tecnologías similares">
            <p>
              Usamos únicamente lo esencial para que el sitio funcione: recordar tu carro de compras y tu elección en el aviso de cookies
              (ambos se guardan en tu propio navegador) y, en el panel administrativo, la sesión de acceso del equipo.
            </p>
            <p>
              Hoy no usamos cookies de publicidad ni de seguimiento de terceros (como Meta Pixel o Google Ads). Si algún día las incorporamos,
              te pediremos permiso antes y podrás aceptarlas o rechazarlas desde el aviso de cookies. Más detalle en la sección de cookies de
              nuestros{" "}
              <Link href="/terminos#cookies" style={{ color: "var(--rosa-deep)" }}>Términos y Condiciones</Link>.
            </p>
          </Section>

          <Section title="6. Cuánto tiempo guardamos tus datos">
            <p>
              Guardamos los datos de compras el tiempo que exijan las obligaciones legales, tributarias y contables, y el necesario para atender
              garantías, cambios, devoluciones o reclamos. Las solicitudes de hora y los mensajes se conservan mientras sean necesarios para
              gestionar la atención. Cuando ya no se necesiten, se eliminan o se anonimizan.
            </p>
          </Section>

          <Section title="7. Tus derechos">
            <p>
              Conforme a la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y, cuando entre en vigencia (1 de diciembre de 2026),
              la <strong>Ley N° 21.719</strong>, puedes:
            </p>
            <ul>
              <li><strong>Acceder</strong> a los datos que tenemos sobre ti.</li>
              <li><strong>Rectificarlos</strong> si están incorrectos o incompletos.</li>
              <li><strong>Solicitar su eliminación</strong> cuando ya no sean necesarios, salvo que debamos conservarlos por ley.</li>
              <li><strong>Oponerte</strong> a ciertos usos o <strong>pedir el bloqueo</strong> temporal de tus datos.</li>
              <li><strong>Pedir la portabilidad</strong> de tus datos en un formato de uso común.</li>
              <li><strong>Retirar tu consentimiento</strong> en cualquier momento, sin afectar lo ya realizado.</li>
            </ul>
            <p>
              Para ejercerlos, escríbenos a <a href="mailto:pieldeangel.contacto@gmail.com" style={{ color: "var(--rosa-deep)" }}>pieldeangel.contacto@gmail.com</a>{" "}
              indicando tu nombre y qué solicitas; podemos pedirte que verifiques tu identidad. Respondemos dentro de los plazos legales.
              Si consideras que no atendimos bien tu solicitud, puedes recurrir a la autoridad de protección de datos personales que establezca la ley.
            </p>
          </Section>

          <Section title="8. Seguridad">
            <p>
              Usamos conexión cifrada (HTTPS), acceso restringido con contraseña al panel de administración y proveedores que aplican medidas de seguridad reconocidas.
              Ningún sistema es completamente infalible; si ocurriera una brecha que afecte tus datos, actuaremos y te informaremos conforme a la ley.
            </p>
          </Section>

          <Section title="9. Menores de edad">
            <p>
              El sitio está dirigido a personas mayores de edad. Si eres menor, solicita a tu madre, padre o tutor que realice las compras o reservas por ti.
            </p>
          </Section>

          <Section title="10. Cambios a esta política">
            <p>
              Podemos actualizar esta política para reflejar cambios en el sitio o en la ley. Publicaremos la versión vigente en esta misma página,
              con su fecha de actualización.
            </p>
          </Section>

        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 20,
        fontWeight: "normal",
        color: "var(--negro-soft)",
        margin: "0 0 12px",
        paddingBottom: 8,
        borderBottom: "1px solid var(--gris-suave)",
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </section>
  );
}
