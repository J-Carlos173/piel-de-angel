"use client";

import { useEffect, useState } from "react";

type Tip = {
  categoria: string;
  titulo: string;
  texto: string;
  fuente: string;
  imagen?: string;
  icono?: string;
};

// Se usa solo mientras carga o si falla la conexión; el contenido real viene de /api/consejos.
const FALLBACK: Tip[] = [
  {
    categoria: "Protección solar",
    titulo: "El protector solar va todos los días, incluso con nublado",
    texto: "Los rayos UVA atraviesan las nubes y los vidrios. Aplicar protector solar a diario es, según dermatólogos, el hábito con mayor impacto para prevenir el envejecimiento prematuro y las manchas.",
    fuente: "Academia Americana de Dermatología",
    icono: "fa-solid fa-sun",
  },
];

const INTERVALO_MS = 7000;

export default function Consejos() {
  const [tips, setTips] = useState<Tip[]>(FALLBACK);
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    fetch("/api/consejos")
      .then((r) => r.json())
      .then((data) => { if (data.consejos?.length > 0) { setTips(data.consejos); setActivo(0); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pausado || tips.length <= 1) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % tips.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [pausado, tips.length]);

  const tip = tips[activo] ?? tips[0];
  if (!tip) return null;

  return (
    <section className="consejos-section" id="consejos">
      <div className="consejos-container">
        <div className="section-header reveal">
          <span className="section-tag">Cuidado de tu piel</span>
          <h2 className="section-title">Consejos de piel</h2>
          <p className="section-subtitle">
            Información curada de fuentes reconocidas en dermatología, para que aprendas sin salir del sitio
          </p>
        </div>

        <div
          className="consejo-card reveal"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {tip.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="consejo-imagen" src={tip.imagen} alt={tip.categoria} />
          ) : (
            <div className="consejo-icono">
              <i className={tip.icono} />
            </div>
          )}

          <div className="consejo-body">
            <span className="consejo-tag">{tip.categoria}</span>
            <h3 className="consejo-title">{tip.titulo}</h3>
            <p className="consejo-desc">{tip.texto}</p>
            <span className="consejo-fuente">Fuente: {tip.fuente}</span>

            <div className="consejo-nav">
              <button
                type="button"
                aria-label="Consejo anterior"
                className="consejo-flecha"
                onClick={() => setActivo((i) => (i - 1 + tips.length) % tips.length)}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
              <div className="consejo-dots">
                {tips.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ver consejo ${i + 1}`}
                    className={`consejo-dot${i === activo ? " activo" : ""}`}
                    onClick={() => setActivo(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Consejo siguiente"
                className="consejo-flecha"
                onClick={() => setActivo((i) => (i + 1) % tips.length)}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
