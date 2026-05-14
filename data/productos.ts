export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stock: number;
  badge: "bestseller" | "nuevo" | "";
  img: string;
}

export const PRODUCTOS: Producto[] = [
  // ── Serums ─────────────────────────────────────────────────────────────
  {
    id: "serum-hidratante",
    nombre: "Sérum Hidratante Premium",
    categoria: "Serums",
    descripcion: "Ácido hialurónico puro que devuelve elasticidad y brillo a tu piel desde la primera aplicación.",
    precio: 29990,
    stock: 5,
    badge: "bestseller",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
  },
  {
    id: "serum-vitamina-c",
    nombre: "Sérum Vitamina C Iluminador",
    categoria: "Serums",
    descripcion: "Vitamina C estabilizada al 15% para unificar el tono, reducir manchas y dar luminosidad duradera.",
    precio: 32990,
    stock: 4,
    badge: "nuevo",
    img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&q=80",
  },

  // ── Cremas ─────────────────────────────────────────────────────────────
  {
    id: "crema-antiedad",
    nombre: "Crema Anti-Edad Premium",
    categoria: "Cremas",
    descripcion: "Retinol encapsulado y péptidos para reducir arrugas y reafirmar la piel durante la noche.",
    precio: 34990,
    stock: 8,
    badge: "",
    img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80",
  },
  {
    id: "crema-hidratante-dia",
    nombre: "Crema Hidratante de Día",
    categoria: "Cremas",
    descripcion: "Textura ligera con ceramidas y manteca de karité. Hidratación de 24 h sin sensación grasa.",
    precio: 27990,
    stock: 10,
    badge: "",
    img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80",
  },

  // ── Limpieza ───────────────────────────────────────────────────────────
  {
    id: "limpiador-suave",
    nombre: "Limpiador Facial Suave",
    categoria: "Limpieza",
    descripcion: "Espuma delicada que limpia profundamente sin alterar el equilibrio natural de la piel.",
    precio: 19990,
    stock: 0,
    badge: "",
    img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80",
  },
  {
    id: "tonico-rose",
    nombre: "Tónico Facial Rose",
    categoria: "Limpieza",
    descripcion: "Agua de rosas y niacinamida para minimizar poros, equilibrar pH y preparar la piel.",
    precio: 16990,
    stock: 3,
    badge: "",
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80",
  },

  // ── Ojos & Pestañas ────────────────────────────────────────────────────
  {
    id: "contorno-ojos",
    nombre: "Contorno de Ojos Iluminador",
    categoria: "Ojos & Pestañas",
    descripcion: "Reduce ojeras, bolsas y líneas finas. Aplicador metálico con efecto fresco al instante.",
    precio: 22990,
    stock: 6,
    badge: "",
    img: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=500&q=80",
  },
  {
    id: "serum-pestanas",
    nombre: "Sérum para Pestañas",
    categoria: "Ojos & Pestañas",
    descripcion: "Biotina y aceite de ricino para fortalecer, alargar y densificar las pestañas en 4 semanas.",
    precio: 18990,
    stock: 7,
    badge: "nuevo",
    img: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=500&q=80",
  },

  // ── Protección ─────────────────────────────────────────────────────────
  {
    id: "protector-solar",
    nombre: "Protector Solar FPS 50",
    categoria: "Protección",
    descripcion: "Fórmula ligera, no comedogénica, con efecto satinado. Protección UVA/UVB de amplio espectro.",
    precio: 24990,
    stock: 10,
    badge: "bestseller",
    img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80",
  },
  {
    id: "bruma-fps",
    nombre: "Bruma Hidratante FPS 30",
    categoria: "Protección",
    descripcion: "Spray refrescante de retoque solar. Ideal para reponer protección sobre el maquillaje.",
    precio: 17990,
    stock: 9,
    badge: "",
    img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=500&q=80",
  },

  // ── Tratamiento ────────────────────────────────────────────────────────
  {
    id: "mascarilla-detox",
    nombre: "Mascarilla Facial Detox",
    categoria: "Tratamiento",
    descripcion: "Arcilla rosa y aceites esenciales para purificar, oxigenar y dejar la piel radiante.",
    precio: 14990,
    stock: 12,
    badge: "nuevo",
    img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
  },
  {
    id: "aceite-premium",
    nombre: "Aceite Facial Premium",
    categoria: "Tratamiento",
    descripcion: "Mezcla de aceites botánicos —rosa mosqueta, jojoba, argán— para una piel luminosa y firme.",
    precio: 39990,
    stock: 7,
    badge: "",
    img: "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?w=500&q=80",
  },
];

export const WHATSAPP_NUMERO = "56977031461";

export const formatPrecio = (n: number) =>
  "$" + n.toLocaleString("es-CL");
