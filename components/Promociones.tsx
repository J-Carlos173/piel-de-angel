"use client";

import { useEffect, useState } from "react";

type Promo = {
  id: number;
  tag: string;
  title: string;
  description: string;
  prizes: string[];
  cta: string;
  href: string;
  finalizado: boolean;
};

export default function Promociones() {
  const [promos, setPromos] = useState<Promo[] | null>(null);

  useEffect(() => {
    fetch("/api/promos-web")
      .then((r) => r.json())
      .then((data) => setPromos(data.promos ?? []))
      .catch(() => setPromos([]));
  }, []);

  // Mientras carga no se muestra nada (evita un parpadeo); si no hay promos activas, la sección desaparece.
  if (!promos || promos.length === 0) return null;

  return (
    <section className="promos-section" id="promociones">
      <div className="promos-container">
        <div className="section-header">
          <span className="section-tag">Ofertas & Concursos</span>
          <h2 className="section-title">Promociones</h2>
          <p className="section-subtitle">Síguenos en Instagram para no perderte ninguna novedad</p>
        </div>

        <div className="promos-grid">
          {promos.map((p) => (
            <div key={p.id} className={`promo-card${p.finalizado ? " finished" : ""}`}>
              {p.finalizado && <span className="promo-badge-finished">Finalizado</span>}
              {p.tag && <span className="promo-tag">{p.tag}</span>}
              <h3 className="promo-title">{p.title}</h3>
              {p.description && <p className="promo-desc">{p.description}</p>}
              {p.prizes.length > 0 && (
                <ul className="promo-prizes">
                  {p.prizes.map((prize) => (
                    <li key={prize}>
                      <span className="promo-prize-dot">✦</span> {prize}
                    </li>
                  ))}
                </ul>
              )}
              {p.href && (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="promo-cta">
                  <i className="fa-brands fa-instagram" /> {p.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
