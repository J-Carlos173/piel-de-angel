import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Piel de Ángel",
  description: "Términos y condiciones de compra de Piel de Ángel — Sociedad de Inversiones Ángeles SPA.",
};

export default function TerminosPage() {
  return (
    <main style={{ background: "var(--crema)", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Encabezado */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: "var(--rosa-deep)", fontSize: 13, fontFamily: "Montserrat, sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            <i className="fa-solid fa-arrow-left" /> Volver a la tienda
          </Link>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: "normal", color: "var(--negro-soft)", margin: "0 0 8px" }}>
            Términos y Condiciones
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "var(--gris-calido)", letterSpacing: "0.08em" }}>
            Última actualización: Mayo 2026
          </p>
        </div>

        <div style={{ fontFamily: "Georgia, serif", color: "var(--texto)", lineHeight: 1.8, fontSize: 15 }}>

          <Section title="1. Identificación del Comercio">
            <p>
              El presente sitio web es operado por <strong>Sociedad de Inversiones Ángeles SPA</strong>,
              RUT <strong>78.075.241-6</strong>, con domicilio en La Paloma 1982 SN, La Pintana,
              Santiago, Región Metropolitana, Chile.
            </p>
            <p>
              El uso del sitio web <strong>www.pieldeangel.cl</strong> y la realización de
              compras implica la aceptación íntegra de los presentes Términos y Condiciones.
            </p>
          </Section>

          <Section title="2. Productos y Precios">
            <p>
              Todos los precios indicados en el sitio están expresados en <strong>pesos chilenos (CLP)</strong>
              e incluyen IVA cuando corresponda. Nos reservamos el derecho de modificar precios
              sin previo aviso, siendo siempre válido el precio vigente al momento de efectuar
              la compra.
            </p>
            <p>
              Las imágenes de los productos son referenciales. Nos esforzamos por representar
              fielmente los colores y texturas, pero pueden existir variaciones menores según
              el dispositivo utilizado.
            </p>
          </Section>

          <Section title="3. Proceso de Compra y Pago">
            <p>
              Las compras se realizan a través del sitio web seleccionando los productos
              deseados y completando el formulario de datos de despacho. El pago se procesa
              de forma segura mediante <strong>WebPay Plus de Transbank</strong>, plataforma
              certificada para transacciones con tarjetas de crédito y débito chilenas.
            </p>
            <p>
              Una vez confirmado el pago, recibirás un correo electrónico con el resumen de
              tu pedido. Si no lo recibes en 30 minutos, revisa tu carpeta de spam o contáctanos.
            </p>
          </Section>

          <Section title="4. Despacho y Envío">
            <ul>
              <li><strong>Santiago Urbano</strong> (dentro del círculo de Américo Vespucio): despacho los días sábados. Costo: $2.990. Envío gratis en compras sobre $40.000 los sábados.</li>
              <li><strong>Regiones</strong> (Copiapó a Puerto Montt): envío por Blue Express o Starken. Costo: $2.990. El plazo de entrega depende del transportista (2–5 días hábiles).</li>
            </ul>
            <p>
              Los pedidos se preparan una vez confirmado el pago. El tiempo de despacho puede
              variar según disponibilidad de stock.
            </p>
          </Section>

          <Section title="5. Derecho a Retracto">
            <p>
              De acuerdo a la <strong>Ley N° 19.496 sobre Protección de los Derechos de los Consumidores</strong>,
              el cliente tiene derecho a retractarse de la compra dentro de los <strong>10 días hábiles</strong>
              siguientes a la recepción del producto, siempre que este no haya sido abierto,
              usado ni deteriorado.
            </p>
            <p>
              Para ejercer este derecho, comunícate con nosotros a través de WhatsApp o al
              correo indicado en el sitio, indicando tu número de orden. Los gastos de devolución
              son de cargo del consumidor, salvo que el producto presente defectos.
            </p>
          </Section>

          <Section title="6. Cambios y Devoluciones">
            <p>
              Aceptamos cambios y devoluciones en los siguientes casos:
            </p>
            <ul>
              <li>Producto defectuoso o dañado al momento de la entrega.</li>
              <li>Producto incorrecto enviado por error nuestro.</li>
              <li>Ejercicio del derecho a retracto dentro del plazo legal.</li>
            </ul>
            <p>
              No se aceptan devoluciones de productos de uso personal (cremas, sueros, mascarillas)
              que hayan sido abiertos, por razones de higiene, salvo que presenten defectos de fabricación.
            </p>
          </Section>

          <Section title="7. Privacidad y Protección de Datos">
            <p>
              Los datos personales recopilados durante la compra (nombre, correo, teléfono,
              dirección) son utilizados exclusivamente para procesar y despachar tu pedido,
              y para enviarte información relevante sobre tu compra.
            </p>
            <p>
              No compartimos tu información con terceros, salvo con las empresas de transporte
              necesarias para el despacho. Tus datos son tratados conforme a la
              <strong> Ley N° 19.628 de Protección de la Vida Privada</strong> de Chile.
            </p>
          </Section>

          <Section title="8. Responsabilidad">
            <p>
              Piel de Ángel no se hace responsable por retrasos ocasionados por las empresas
              de transporte, fuerza mayor o errores en los datos de envío proporcionados
              por el cliente.
            </p>
          </Section>

          <Section title="9. Legislación Aplicable">
            <p>
              Los presentes Términos y Condiciones se rigen por las leyes de la República de Chile.
              Cualquier controversia será sometida a la jurisdicción de los tribunales ordinarios
              de justicia de Santiago de Chile.
            </p>
          </Section>

          <Section title="10. Contacto">
            <p>
              Para consultas, reclamos o ejercer tus derechos como consumidor:
            </p>
            <ul>
              <li>WhatsApp: disponible en el sitio web</li>
              <li>Instagram: disponible en el sitio web</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              También puedes recurrir al <strong>SERNAC</strong> (Servicio Nacional del Consumidor)
              en <strong>sernac.cl</strong> o al teléfono 800 700 100.
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
