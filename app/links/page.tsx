import type { Metadata } from "next";
import { SERVICIOS_LP } from "@/data/servicios-lp";

export const metadata: Metadata = {
  title: "Enlaces",
  description: "Tienda, servicios a domicilio, consejos de piel y WhatsApp de Piel de Ángel.",
  robots: { index: false, follow: true },
};

const WA = `https://wa.me/56977031461?text=${encodeURIComponent("Hola, quiero reservar una hora a domicilio.")}`;

const PRINCIPALES: { href: string; icono: string; texto: string; externo?: boolean; destacado?: boolean }[] = [
  { href: "/#productos", icono: "fa-solid fa-bag-shopping", texto: "Tienda online", destacado: true },
  { href: WA, icono: "fa-brands fa-whatsapp", texto: "Reservar por WhatsApp", externo: true },
  { href: "/#servicios", icono: "fa-regular fa-calendar", texto: "Servicios a domicilio" },
  { href: "/consejos", icono: "fa-regular fa-lightbulb", texto: "Consejos de piel" },
];

export default function LinksPage() {
  return (
    <main className="links-page">
      <div className="links-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-pa.jpg" alt="Piel de Ángel" className="links-logo" />
        <h1>
          Piel de <em>Ángel</em>
        </h1>
        <p className="links-sub">Skincare premium y estética a domicilio en Santiago Oriente</p>

        <div className="links-lista">
          {PRINCIPALES.map((l) => (
            <a
              key={l.texto}
              href={l.href}
              className={`links-btn${l.destacado ? " links-btn-destacado" : ""}`}
              {...(l.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <i className={l.icono} /> {l.texto}
            </a>
          ))}
        </div>

        <p className="links-titulo">Servicios</p>
        <div className="links-lista links-lista-chica">
          {SERVICIOS_LP.map((s) => (
            <a key={s.slug} href={`/${s.slug}`} className="links-btn links-btn-chico">
              {s.nombre}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
