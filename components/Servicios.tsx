"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

type Servicio = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  precio: number;
  duracion: number;
  categoria: string;
};

const FALLBACK: Servicio[] = [
  { id: "1", title: "Limpieza Facial",      description: "Una purificación profunda que elimina impurezas y devuelve frescura, luminosidad y suavidad a tu rostro.",                                                         thumbnail: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80", precio: 0, duracion: 0, categoria: "Facial"     },
  { id: "2", title: "Lifting de Pestañas",  description: "Realza tu mirada con un efecto curvado natural y duradero. Sin extensiones, sin mantenimiento diario.",                                                            thumbnail: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=600&q=80", precio: 0, duracion: 0, categoria: "Pestañas"  },
  { id: "3", title: "Hidratación Facial",   description: "Restaura la hidratación profunda de tu piel con activos premium que la dejan radiante, elástica y suave.",                                                         thumbnail: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80", precio: 0, duracion: 0, categoria: "Facial"     },
  { id: "4", title: "Tratamientos Faciales",description: "Protocolos personalizados anti-edad, despigmentantes y revitalizantes para resultados visibles desde la primera sesión.",                                           thumbnail: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80", precio: 0, duracion: 0, categoria: "Tratamiento"},
  { id: "5", title: "Skincare Premium",     description: "Selección curada de cosmética profesional para que tu rutina en casa potencie los resultados de cada tratamiento.",                                                 thumbnail: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80", precio: 0, duracion: 0, categoria: "Skincare"   },
  { id: "6", title: "Ritual de Bienestar",  description: "Una experiencia completa de relajación y cuidado: masaje facial, aromaterapia y un mimo de pies a cabeza.",                                                       thumbnail: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80", precio: 0, duracion: 0, categoria: "Bienestar"  },
];

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>(FALLBACK);
  const ref = useReveal([servicios]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => { if (data.servicios?.length > 0) setServicios(data.servicios); })
      .catch(() => {});
  }, []);

  return (
    <section className="servicios" id="servicios" ref={ref}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Nuestros Servicios</span>
          <h2 className="section-title">
            Tratamientos <em>diseñados para ti</em>
          </h2>
          <p className="section-subtitle">
            Cada tratamiento es una experiencia sensorial cuidadosamente curada para
            nutrir, revitalizar y devolverle a tu piel su luminosidad natural.
          </p>
        </div>

        <div className="servicios-grid">
          {servicios.map((s) => (
            <div className="servicio-card reveal" key={s.id}>
              <div className="servicio-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.thumbnail} alt={s.title} />
              </div>
              <div className="servicio-content">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {(s.precio > 0 || s.duracion > 0) && (
                  <p style={{ fontSize: "0.8rem", color: "var(--rosa-deep)", fontFamily: "Montserrat, sans-serif", marginBottom: "0.5rem", opacity: 0.85 }}>
                    {s.precio > 0 && fmtPrecio(s.precio)}
                    {s.precio > 0 && s.duracion > 0 && " · "}
                    {s.duracion > 0 && `${s.duracion} min`}
                  </p>
                )}
                <a href="#agenda" className="servicio-btn">
                  Agendar <i className="fa-solid fa-calendar-check" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
