import nodemailer from "nodemailer";

const ADMIN_EMAIL = "krlos173173@gmail.com";
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
