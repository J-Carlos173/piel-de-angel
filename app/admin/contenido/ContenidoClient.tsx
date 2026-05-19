"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

/* ── Tipos ─────────────────────────────────────────────── */
type HeroContent = {
  eyebrow: string; titleLine1: string; titleItalic: string;
  subtitle: string; imageUrl: string; imageAlt: string;
  badgeTitle: string; badgeSubtitle: string;
};
type AboutContent = {
  eyebrow: string; titleLine1: string; titleItalic: string;
  paragraph1: string; paragraph2: string;
  image1Url: string; image2Url: string;
};

/* ── Plantillas prediseñadas ────────────────────────────── */
const HERO_PRESETS: { label: string; icon: string; content: HeroContent }[] = [
  {
    label: "Natural",
    icon: "fa-leaf",
    content: {
      eyebrow: "Clínica Estética Premium",
      titleLine1: "Realza tu",
      titleItalic: "belleza natural",
      subtitle: "Tratamientos faciales personalizados, skincare profesional y momentos de bienestar diseñados para revelar la mejor versión de tu piel. Una experiencia delicada, segura y profundamente transformadora.",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
      imageAlt: "Tratamiento facial Piel de Ángel",
      badgeTitle: "Atención Premium",
      badgeSubtitle: "Cada piel es única",
    },
  },
  {
    label: "Luminosa",
    icon: "fa-sun",
    content: {
      eyebrow: "Skincare & Bienestar",
      titleLine1: "Tu piel merece",
      titleItalic: "lo mejor",
      subtitle: "Descubre rituales de belleza únicos con productos coreanos premium y tratamientos diseñados especialmente para tu tipo de piel. Resultados visibles desde la primera sesión.",
      imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=900&q=80",
      imageAlt: "Skincare luminoso Piel de Ángel",
      badgeTitle: "Resultados Visibles",
      badgeSubtitle: "Desde la 1ª sesión",
    },
  },
  {
    label: "Zen",
    icon: "fa-spa",
    content: {
      eyebrow: "Santuario de Belleza",
      titleLine1: "Encuentra tu",
      titleItalic: "equilibrio",
      subtitle: "Un espacio diseñado para reconectar contigo misma. Tratamientos holísticos que cuidan tu piel y nutren tu bienestar, porque la verdadera belleza nace desde adentro.",
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80",
      imageAlt: "Spa facial Piel de Ángel",
      badgeTitle: "Experiencia Zen",
      badgeSubtitle: "Cuerpo & alma",
    },
  },
  {
    label: "Premium",
    icon: "fa-gem",
    content: {
      eyebrow: "Estética de Alta Gama",
      titleLine1: "Lujo y cuidado",
      titleItalic: "para tu rostro",
      subtitle: "Protocolos de última generación con los activos más potentes del mercado internacional. Piel de Ángel es tu aliada para una piel radiante, firme y llena de vida.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
      imageAlt: "Estética premium Piel de Ángel",
      badgeTitle: "Alta Gama",
      badgeSubtitle: "Tecnología de vanguardia",
    },
  },
];

const ABOUT_PRESETS: { label: string; icon: string; content: AboutContent }[] = [
  {
    label: "Original",
    icon: "fa-heart",
    content: {
      eyebrow: "Sobre Nosotros",
      titleLine1: "Un refugio para tu",
      titleItalic: "piel",
      paragraph1: "En Piel de Ángel creemos que la belleza nace del cuidado consciente y del bienestar interior. Nuestro espacio fue diseñado como un santuario donde cada detalle —la luz, los aromas, las texturas— se une para acompañarte en una experiencia única.",
      paragraph2: "Trabajamos con tecnología de vanguardia y productos premium, siempre guiadas por un enfoque cálido, profesional y profundamente humano. Tu piel merece manos expertas y un trato delicado.",
      image1Url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=700&q=80",
      image2Url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    },
  },
  {
    label: "Cálida",
    icon: "fa-fire",
    content: {
      eyebrow: "Nuestra Historia",
      titleLine1: "Nacimos con",
      titleItalic: "pasión",
      paragraph1: "Piel de Ángel nació del sueño de crear un espacio donde cada mujer se sienta valorada, cuidada y hermosa. Somos un equipo de profesionales apasionadas por la belleza, la salud y el bienestar.",
      paragraph2: "Cada tratamiento es una experiencia diseñada con amor: elegimos los mejores productos, aplicamos las mejores técnicas y ponemos el corazón en cada sesión. Porque tú lo mereces.",
      image1Url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=700&q=80",
      image2Url: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=600&q=80",
    },
  },
  {
    label: "Profesional",
    icon: "fa-award",
    content: {
      eyebrow: "Quiénes Somos",
      titleLine1: "Expertas en tu",
      titleItalic: "cuidado",
      paragraph1: "Contamos con años de experiencia en estética facial y cosmética premium. Nuestras profesionales están certificadas en las técnicas más avanzadas del mercado, asegurando resultados seguros y efectivos.",
      paragraph2: "Trabajamos con marcas líderes internacionales y protocolos de alta gama para ofrecerte tratamientos a la vanguardia de la estética moderna. Tu confianza es nuestra mayor responsabilidad.",
      image1Url: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=700&q=80",
      image2Url: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80",
    },
  },
  {
    label: "K-Beauty",
    icon: "fa-star",
    content: {
      eyebrow: "Especialistas K-Beauty",
      titleLine1: "La magia del",
      titleItalic: "skincare coreano",
      paragraph1: "Somos apasionadas de la cosmética coreana y su filosofía de cuidado profundo, ingredientes naturales y rutinas personalizadas. En Piel de Ángel traemos lo mejor del K-beauty a Santiago.",
      paragraph2: "Desde sérums con ácido hialurónico hasta tratamientos glass skin, nuestro catálogo combina lo mejor de la ciencia coreana con el calor y la personalidad latinoamericana.",
      image1Url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=700&q=80",
      image2Url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    },
  },
];

/* ── Componente principal ───────────────────────────────── */
export default function ContenidoClient({
  initialHero, initialAbout,
}: {
  initialHero: HeroContent;
  initialAbout: AboutContent;
}) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [tab, setTab]       = useState<"hero" | "about">("hero");
  const [hero, setHero]     = useState<HeroContent>(initialHero);
  const [about, setAbout]   = useState<AboutContent>(initialAbout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const bg      = dark ? "#160f13" : "#f5eeec";
  const cardBg  = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border  = dark ? "#3a2830" : "#ecddd9";
  const textMain= dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "#fdfaf9";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  async function save() {
    setSaving(true);
    const key = tab === "hero" ? "content_hero" : "content_about";
    const value = tab === "hero" ? hero : about;
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1.5px solid ${border}`,
    borderRadius: 10, padding: "10px 14px", color: textMain, fontSize: 13,
    fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box",
    resize: "vertical",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 5, fontSize: 11, color: textMuted,
    letterSpacing: "0.1em", textTransform: "uppercase", ...MONO,
  };

  function Field({ label, value, onChange, rows }: {
    label: string; value: string; onChange: (v: string) => void; rows?: number;
  }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{label}</label>
        {rows ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={inputStyle} />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )}
      </div>
    );
  }

  function ImageField({ label, value, onChange }: {
    label: string; value: string; onChange: (v: string) => void;
  }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            style={{ ...inputStyle, flex: 1 }}
          />
          {value && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={value}
              alt="preview"
              style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8,
                border: `1.5px solid ${border}`, flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 10, color: textMuted, ...MONO }}>
          Pega la URL de una imagen (Unsplash, Google, etc.)
        </p>
      </div>
    );
  }

  function Presets<T>({ presets, onSelect }: {
    presets: { label: string; icon: string; content: T }[];
    onSelect: (c: T) => void;
  }) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.content)}
            style={{
              padding: "10px 18px", borderRadius: 14, background: cardBg,
              border: `1.5px solid ${border}`, color: textMain, cursor: "pointer",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8, ...MONO,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C68A95";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(198,138,149,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className={`fa-solid ${p.icon}`} style={{ color: "#C68A95" }} />
            {p.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg,#1e151a,#1a1218 55%,#1e151a)"
          : "linear-gradient(160deg,#ffffff,#fdf5f7 55%,#f9eef2)",
        padding: "28px 32px 24px", borderBottom: `1.5px solid ${border}`, position: "relative",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#D8A7B1,#C68A95,#D8A7B1,transparent)" }} />
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${border}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Editor de contenido</p>
            <h1 style={{ margin: "6px 0 2px", color: textMain, fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Editar Sitio Web
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: textMuted, ...MONO }}>Los cambios se reflejan en el sitio al instante</p>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${border}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {(["hero", "about"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 22px", borderRadius: 12, border: `1.5px solid ${tab === t ? "#C68A95" : border}`,
              background: tab === t ? "rgba(198,138,149,0.12)" : cardBg,
              color: tab === t ? "#C68A95" : textMuted, cursor: "pointer", fontSize: 13,
              fontWeight: tab === t ? 600 : 400, transition: "all 0.2s", ...MONO,
            }}>
              <i className={`fa-solid ${t === "hero" ? "fa-house" : "fa-circle-info"}`} style={{ marginRight: 7 }} />
              {t === "hero" ? "Sección Inicio" : "Sobre Nosotros"}
            </button>
          ))}
        </div>

        <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 20, padding: "32px 28px" }}>

          {/* Plantillas */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: textMuted, letterSpacing: "0.12em", textTransform: "uppercase", ...MONO }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6, color: "#C68A95" }} />
              Plantillas prediseñadas — clic para cargar
            </p>
            {tab === "hero"
              ? <Presets presets={HERO_PRESETS} onSelect={setHero} />
              : <Presets presets={ABOUT_PRESETS} onSelect={setAbout} />
            }
          </div>

          <div style={{ height: 1, background: border, margin: "4px 0 28px" }} />

          {/* Campos Hero */}
          {tab === "hero" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Etiqueta superior" value={hero.eyebrow} onChange={(v) => setHero({ ...hero, eyebrow: v })} />
                <Field label="Título — primera línea" value={hero.titleLine1} onChange={(v) => setHero({ ...hero, titleLine1: v })} />
              </div>
              <Field label="Título — texto en cursiva (rosado)" value={hero.titleItalic} onChange={(v) => setHero({ ...hero, titleItalic: v })} />
              <Field label="Subtítulo / descripción" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} rows={3} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Badge — título" value={hero.badgeTitle} onChange={(v) => setHero({ ...hero, badgeTitle: v })} />
                <Field label="Badge — subtítulo" value={hero.badgeSubtitle} onChange={(v) => setHero({ ...hero, badgeSubtitle: v })} />
              </div>
              <ImageField label="Imagen principal (URL)" value={hero.imageUrl} onChange={(v) => setHero({ ...hero, imageUrl: v })} />
              <Field label="Texto alternativo de la imagen" value={hero.imageAlt} onChange={(v) => setHero({ ...hero, imageAlt: v })} />
            </>
          )}

          {/* Campos About */}
          {tab === "about" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Etiqueta superior" value={about.eyebrow} onChange={(v) => setAbout({ ...about, eyebrow: v })} />
                <Field label="Título — primera línea" value={about.titleLine1} onChange={(v) => setAbout({ ...about, titleLine1: v })} />
              </div>
              <Field label="Título — texto en cursiva (rosado)" value={about.titleItalic} onChange={(v) => setAbout({ ...about, titleItalic: v })} />
              <Field label="Párrafo 1" value={about.paragraph1} onChange={(v) => setAbout({ ...about, paragraph1: v })} rows={4} />
              <Field label="Párrafo 2" value={about.paragraph2} onChange={(v) => setAbout({ ...about, paragraph2: v })} rows={4} />
              <ImageField label="Imagen grande (URL)" value={about.image1Url} onChange={(v) => setAbout({ ...about, image1Url: v })} />
              <ImageField label="Imagen pequeña (URL)" value={about.image2Url} onChange={(v) => setAbout({ ...about, image2Url: v })} />
            </>
          )}

          {/* Guardar */}
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "13px 32px", borderRadius: 14, border: "none", cursor: saving ? "default" : "pointer",
                background: saved ? "linear-gradient(135deg,#7aaa84,#5a8a64)" : "linear-gradient(135deg,#C68A95,#8B6F6F)",
                color: "#fff", fontSize: 14, ...MONO, fontWeight: 600,
                boxShadow: "0 4px 16px rgba(198,138,149,0.35)", transition: "background 0.3s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <i className={`fa-solid ${saving ? "fa-spinner fa-spin" : saved ? "fa-check" : "fa-floppy-disk"}`} />
              {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: textMuted, ...MONO }}>
          Los visitantes verán los cambios al recargar la página del sitio.
        </p>
      </div>
    </div>
  );
}
