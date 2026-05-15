import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "krlos173173@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://piel-de-angel.vercel.app";

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendBookingRequestToAdmin(data: {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  token: string;
}) {
  const confirmUrl = `${BASE_URL}/api/booking/confirm/${data.token}`;
  const declineUrl = `${BASE_URL}/api/booking/decline/${data.token}`;

  const [year, month, day] = data.date.split("-");
  const dateLabel = `${day}/${month}/${year}`;

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `Nueva solicitud de cita — ${data.name}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F; margin-bottom: 8px;">Nueva solicitud de cita</h2>
        <hr style="border: 1px solid #e8d5cc; margin-bottom: 24px;" />

        <table style="width: 100%; font-size: 15px; color: #444;">
          <tr><td style="padding: 6px 0; color: #888;">Cliente</td><td><strong>${data.name}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Email</td><td>${data.email}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Teléfono</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Servicio</td><td>${data.service}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Fecha</td><td><strong>${dateLabel}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Hora</td><td><strong>${data.time} hrs</strong></td></tr>
        </table>

        <div style="margin-top: 32px; display: flex; gap: 16px;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 14px 28px; background: #8B6F6F; color: white; text-decoration: none; border-radius: 8px; font-size: 15px; margin-right: 12px;">
            ✓ Aceptar cita
          </a>
          <a href="${declineUrl}" style="display: inline-block; padding: 14px 28px; background: #ccc; color: #444; text-decoration: none; border-radius: 8px; font-size: 15px;">
            ✗ Rechazar cita
          </a>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">Piel de Ángel · Sistema de agendamiento</p>
      </div>
    `,
  });
}

export async function sendConfirmationToClient(data: {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
}) {
  const [year, month, day] = data.date.split("-");
  const dateLabel = `${day}/${month}/${year}`;

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Cita confirmada — Piel de Ángel`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F;">¡Tu cita está confirmada!</h2>
        <p style="color: #666;">Hola <strong>${data.name}</strong>, te esperamos en Piel de Ángel.</p>
        <hr style="border: 1px solid #e8d5cc;" />
        <table style="width: 100%; font-size: 15px; color: #444; margin-top: 16px;">
          <tr><td style="padding: 6px 0; color: #888;">Servicio</td><td><strong>${data.service}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Fecha</td><td><strong>${dateLabel}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Hora</td><td><strong>${data.time} hrs</strong></td></tr>
        </table>
        <p style="margin-top: 24px; color: #888; font-size: 14px;">Si necesitas reagendar, contáctanos por WhatsApp.</p>
        <p style="margin-top: 8px; font-size: 12px; color: #aaa;">Piel de Ángel · Estética & Belleza Premium</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationToClient(data: {
  email: string;
  buyOrder: string;
  amount: number;
  authCode: string;
  card: string;
}) {
  const formatPrecio = (n: number) =>
    "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `✓ Compra confirmada — Piel de Ángel`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F; margin-bottom: 4px;">¡Tu compra fue aprobada!</h2>
        <p style="color: #666; margin-top: 0;">Gracias por comprar en Piel de Ángel. Aquí está el resumen:</p>
        <hr style="border: 1px solid #e8d5cc; margin: 20px 0;" />
        <table style="width: 100%; font-size: 15px; color: #444;">
          <tr><td style="padding: 6px 0; color: #888;">Número de orden</td><td><strong>${data.buyOrder}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Total pagado</td><td><strong>${formatPrecio(data.amount)}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Tarjeta</td><td>**** **** **** ${data.card}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Código autorización</td><td>${data.authCode}</td></tr>
        </table>
        <div style="margin-top: 28px; background: #f0fdf4; border-radius: 10px; padding: 16px;">
          <p style="margin: 0; color: #444; font-size: 14px;">
            📦 <strong>Próximo paso:</strong> Nos contactaremos contigo por WhatsApp para coordinar el despacho de tu pedido.
          </p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">Piel de Ángel · Estética & Belleza Premium</p>
      </div>
    `,
  });
}

export async function sendOrderNotificationToAdmin(data: {
  clientEmail: string;
  buyOrder: string;
  amount: number;
  authCode: string;
  card: string;
}) {
  const STORE_EMAIL = process.env.STORE_EMAIL || "pieldeangel.contacto@gmail.com";
  const formatPrecio = (n: number) =>
    "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: STORE_EMAIL,
    subject: `🛍️ Nueva venta — ${formatPrecio(data.amount)} — ${data.buyOrder}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F; margin-bottom: 4px;">¡Nueva venta confirmada!</h2>
        <p style="color: #666; margin-top: 0;">Se procesó un pago exitoso en la tienda.</p>
        <hr style="border: 1px solid #e8d5cc; margin: 20px 0;" />
        <table style="width: 100%; font-size: 15px; color: #444;">
          <tr><td style="padding: 6px 0; color: #888;">Orden</td><td><strong>${data.buyOrder}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Cliente</td><td>${data.clientEmail}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Total</td><td><strong style="color: #8B6F6F; font-size: 18px;">${formatPrecio(data.amount)}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Tarjeta</td><td>**** **** **** ${data.card}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Autorización</td><td>${data.authCode}</td></tr>
        </table>
        <div style="margin-top: 28px; background: #fff3cd; border-radius: 10px; padding: 16px;">
          <p style="margin: 0; color: #444; font-size: 14px;">
            📦 <strong>Acción requerida:</strong> Contactar al cliente por WhatsApp para coordinar el despacho.
          </p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">Piel de Ángel · Sistema de ventas</p>
      </div>
    `,
  });
}

type ItemPedido = { nombre: string; precio: number; qty: number };

function tablaItems(items: ItemPedido[]) {
  const fmt = (n: number) => "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return items
    .map(
      (i) =>
        `<tr>
          <td style="padding:5px 0;color:#444;">${i.nombre} ×${i.qty}</td>
          <td style="padding:5px 0;text-align:right;color:#444;">${fmt(i.precio * i.qty)}</td>
        </tr>`
    )
    .join("");
}

export async function sendPendingOrderToClient(data: {
  email: string;
  nombre: string;
  buyOrder: string;
  items: ItemPedido[];
  envio: number;
  total: number;
}) {
  const fmt = (n: number) => "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const WEBPAY_URL = "https://www.webpay.cl/form-pay/294463";

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Pedido recibido — completa tu pago | Piel de Ángel`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F; margin-bottom: 4px;">¡Recibimos tu pedido!</h2>
        <p style="color: #666; margin-top: 0;">Hola <strong>${data.nombre}</strong>, ya tenemos los detalles de tu compra. Solo falta completar el pago.</p>
        <hr style="border: 1px solid #e8d5cc; margin: 20px 0;" />

        <h3 style="color: #8B6F6F; font-size: 14px; margin-bottom: 8px;">DETALLE DEL PEDIDO · ${data.buyOrder}</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          ${tablaItems(data.items)}
          <tr style="border-top: 1px solid #e8d5cc;">
            <td style="padding:6px 0;color:#888;">Envío</td>
            <td style="padding:6px 0;text-align:right;color:#888;">${data.envio === 0 ? "Gratis" : fmt(data.envio)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:bold;color:#444;">Total a pagar</td>
            <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:18px;color:#8B6F6F;">${fmt(data.total)}</td>
          </tr>
        </table>

        <div style="margin-top: 28px; background: #fff8f5; border: 2px solid #e8d5cc; border-radius: 10px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">Ingresa exactamente este monto en el formulario de pago:</p>
          <p style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #8B6F6F;">${fmt(data.total)}</p>
          <a href="${WEBPAY_URL}" style="display: inline-block; padding: 14px 32px; background: #8B6F6F; color: white; text-decoration: none; border-radius: 8px; font-size: 15px;">
            Ir a pagar con Webpay
          </a>
        </div>

        <p style="margin-top: 20px; color: #888; font-size: 13px;">Una vez confirmado el pago te contactaremos por WhatsApp para coordinar el despacho.</p>
        <p style="margin-top: 8px; font-size: 12px; color: #aaa;">Piel de Ángel · Estética & Belleza Premium</p>
      </div>
    `,
  });
}

export async function sendPendingOrderToAdmin(data: {
  customer: { nombre: string; email: string; telefono: string; direccion: string; depto: string; ciudad: string; region: string };
  buyOrder: string;
  items: ItemPedido[];
  envio: number;
  total: number;
  zona: string;
}) {
  const STORE_EMAIL = process.env.STORE_EMAIL || "pieldeangel.contacto@gmail.com";
  const fmt = (n: number) => "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const { customer } = data;
  const direccionCompleta = [customer.direccion, customer.depto, customer.ciudad, customer.region].filter(Boolean).join(", ");

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: STORE_EMAIL,
    subject: `🛍️ Nuevo pedido pendiente — ${fmt(data.total)} — ${data.buyOrder}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F; margin-bottom: 4px;">Nuevo pedido pendiente de pago</h2>
        <p style="color: #666; margin-top: 0;">El cliente está siendo dirigido a Webpay.cl para completar el pago. Verifica en tu panel.</p>
        <hr style="border: 1px solid #e8d5cc; margin: 20px 0;" />

        <h3 style="color: #8B6F6F; font-size: 14px; margin-bottom: 8px;">CLIENTE</h3>
        <table style="width: 100%; font-size: 14px; color: #444;">
          <tr><td style="padding:4px 0;color:#888;width:130px;">Nombre</td><td><strong>${customer.nombre}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#888;">Email</td><td>${customer.email}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Teléfono</td><td>${customer.telefono}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Dirección</td><td>${direccionCompleta}</td></tr>
          <tr><td style="padding:4px 0;color:#888;">Zona envío</td><td>${data.zona === "santiago" ? "Santiago" : "Regiones"}</td></tr>
        </table>

        <h3 style="color: #8B6F6F; font-size: 14px; margin: 20px 0 8px 0;">PRODUCTOS</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          ${tablaItems(data.items)}
          <tr style="border-top: 1px solid #e8d5cc;">
            <td style="padding:6px 0;color:#888;">Envío</td>
            <td style="padding:6px 0;text-align:right;color:#888;">${data.envio === 0 ? "Gratis" : fmt(data.envio)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:bold;color:#444;">Total a recibir</td>
            <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:20px;color:#8B6F6F;">${fmt(data.total)}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; background: #fff3cd; border-radius: 10px; padding: 16px;">
          <p style="margin: 0; color: #444; font-size: 14px;">
            ⚠️ <strong>Acción:</strong> Verifica el pago de ${fmt(data.total)} en tu panel de Webpay.cl antes de despachar. Orden: <strong>${data.buyOrder}</strong>
          </p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">Piel de Ángel · Sistema de ventas</p>
      </div>
    `,
  });
}

export async function sendDeclineToClient(data: {
  name: string;
  email: string;
  date: string;
  time: string;
}) {
  const [year, month, day] = data.date.split("-");
  const dateLabel = `${day}/${month}/${year}`;

  await getTransport().sendMail({
    from: `"Piel de Ángel" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Solicitud de cita — Piel de Ángel`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fdf9f7; border-radius: 12px;">
        <h2 style="color: #8B6F6F;">Sobre tu solicitud de cita</h2>
        <p style="color: #666;">Hola <strong>${data.name}</strong>, lamentablemente no podemos confirmar tu cita para el <strong>${dateLabel} a las ${data.time} hrs</strong>.</p>
        <p style="color: #666;">Por favor contáctanos por WhatsApp para encontrar un horario disponible.</p>
        <p style="margin-top: 8px; font-size: 12px; color: #aaa;">Piel de Ángel · Estética & Belleza Premium</p>
      </div>
    `,
  });
}
