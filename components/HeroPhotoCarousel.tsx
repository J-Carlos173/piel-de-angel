"use client";

import { useEffect, useState } from "react";

type Foto = { src: string; alt: string };

const INTERVALO_MS = 5500;

export default function HeroPhotoCarousel({ fotos }: { fotos: Foto[] }) {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    if (fotos.length <= 1) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % fotos.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [fotos.length]);

  if (fotos.length === 0) return null;

  return (
    <div className="hero-photo-fade">
      {fotos.map((foto, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          className={i === activo ? "activa" : ""}
          loading={i === 0 ? undefined : "lazy"}
        />
      ))}
    </div>
  );
}
