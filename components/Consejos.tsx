"use client";

import { useEffect, useState } from "react";

type Tip = {
  categoria: string;
  titulo: string;
  texto: string;
  fuente: string;
};

const TIPS: Tip[] = [
  {
    categoria: "Protección solar",
    titulo: "El protector solar va todos los días, incluso con nublado",
    texto: "Los rayos UVA atraviesan las nubes y los vidrios. Aplicar protector solar a diario es, según dermatólogos, el hábito con mayor impacto para prevenir el envejecimiento prematuro y las manchas.",
    fuente: "Academia Americana de Dermatología",
  },
  {
    categoria: "Limpieza",
    titulo: "Doble limpieza si usas maquillaje o protector solar",
    texto: "Un primer paso con aceite o bálsamo limpiador para disolver maquillaje y filtro solar, seguido de un limpiador suave con agua, deja la piel realmente limpia sin resecarla.",
    fuente: "Fundación Piel Sana (AEDV)",
  },
  {
    categoria: "Exfoliación",
    titulo: "Menos es más: 1 a 3 veces por semana alcanza",
    texto: "Exfoliar todos los días daña la barrera cutánea y genera más sensibilidad, no menos. Con ácidos suaves (como los AHA/BHA) unas pocas veces por semana es suficiente para renovar la piel.",
    fuente: "Academia Americana de Dermatología",
  },
  {
    categoria: "Retinol",
    titulo: "Retinol de noche, protector solar de día",
    texto: "El retinol vuelve la piel más sensible al sol. Se recomienda usarlo solo en la rutina nocturna y reforzar el protector solar al día siguiente, siempre partiendo con una concentración baja.",
    fuente: "Fundación Piel Sana (AEDV)",
  },
  {
    categoria: "Hidratación",
    titulo: "El ácido hialurónico funciona mejor en piel húmeda",
    texto: "Este activo atrae agua hacia la piel. Aplicarlo sobre el rostro recién lavado y húmedo, y sellar después con una crema, evita el efecto contrario de resecar en ambientes secos.",
    fuente: "Academia Americana de Dermatología",
  },
  {
    categoria: "Nuevos productos",
    titulo: "Antes de usar algo nuevo, haz una prueba de parche",
    texto: "Aplica una pequeña cantidad en el antebrazo o detrás de la oreja y espera 24 a 48 horas. Es la forma más simple de anticipar una alergia o irritación antes de usarlo en el rostro.",
    fuente: "Organización Mundial de la Salud",
  },
  {
    categoria: "Rutina",
    titulo: "No mezcles activos fuertes el mismo día",
    texto: "Combinar retinol con ácidos exfoliantes fuertes, o vitamina C con retinol en la misma rutina, puede irritar la piel. Alternar noches o usarlos en momentos distintos del día es más seguro.",
    fuente: "Fundación Piel Sana (AEDV)",
  },
  {
    categoria: "Piel grasa",
    titulo: "La piel grasa también necesita hidratación",
    texto: "Saltarse la crema hidratante para 'no engrasar más' suele causar el efecto contrario: la piel produce más grasa para compensar. Una hidratación ligera, sin aceite, mantiene el equilibrio.",
    fuente: "Academia Americana de Dermatología",
  },
  {
    categoria: "Estacionalidad",
    titulo: "La rutina cambia con el clima",
    texto: "En invierno la piel suele necesitar cremas más densas y menos exfoliación; en verano, texturas más ligeras y reforzar el protector solar. Adaptar la rutina evita irritaciones de temporada.",
    fuente: "Fundación Piel Sana (AEDV)",
  },
  {
    categoria: "Hábitos",
    titulo: "El descanso también se nota en la piel",
    texto: "Dormir mal se asocia a mayor inflamación y peor recuperación de la barrera cutánea. Ningún sérum reemplaza un buen descanso como base de una piel sana.",
    fuente: "Organización Mundial de la Salud",
  },
];

const INTERVALO_MS = 7000;

export default function Consejos() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % TIPS.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [pausado]);

  const tip = TIPS[activo];

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
          <span className="consejo-tag">{tip.categoria}</span>
          <h3 className="consejo-title">{tip.titulo}</h3>
          <p className="consejo-desc">{tip.texto}</p>
          <span className="consejo-fuente">Fuente: {tip.fuente}</span>

          <div className="consejo-nav">
            <button
              type="button"
              aria-label="Consejo anterior"
              className="consejo-flecha"
              onClick={() => setActivo((i) => (i - 1 + TIPS.length) % TIPS.length)}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <div className="consejo-dots">
              {TIPS.map((_, i) => (
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
              onClick={() => setActivo((i) => (i + 1) % TIPS.length)}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
