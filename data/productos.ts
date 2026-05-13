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
  {
    id: "serum-hidratante",
    nombre: "Sérum Hidratante Premium",
    categoria: "Hidratación",
    descripcion: "Ácido hialurónico puro que devuelve elasticidad y brillo a tu piel desde la primera aplicación.",
    precio: 29990,
    stock: 5,
    badge: "bestseller",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
  },
  {
    id: "crema-antiedad",
    nombre: "Crema Anti-Edad Premium",
    categoria: "Anti-edad",
    descripcion: "Retinol encapsulado y péptidos para reducir arrugas y reafirmar la piel durante la noche.",
    precio: 34990,
    stock: 8,
    badge: "",
    img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80",
  },
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
    id: "contorno-ojos",
    nombre: "Contorno de Ojos Iluminador",
    categoria: "Cuidado",
    descripcion: "Reduce ojeras, bolsas y líneas finas. Aplicador metálico con efecto fresco al instante.",
    precio: 22990,
    stock: 6,
    badge: "",
    img: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=500&q=80",
  },
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
    id: "tonico-rose",
    nombre: "Tónico Facial Rose",
    categoria: "Equilibrio",
    descripcion: "Agua de rosas y niacinamida para minimizar poros, equilibrar pH y preparar la piel.",
    precio: 16990,
    stock: 3,
    badge: "",
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80",
  },
  {
    id: "aceite-premium",
    nombre: "Aceite Facial Premium",
    categoria: "Nutrición",
    descripcion: "Mezcla de aceites botánicos —rosa mosqueta, jojoba, argán— para una piel luminosa y firme.",
    precio: 39990,
    stock: 7,
    badge: "nuevo",
    img: "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?w=500&q=80",
  },
];

export const WHATSAPP_NUMERO = "56977031461";

export const formatPrecio = (n: number) =>
  "$" + n.toLocaleString("es-CL");
