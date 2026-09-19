import { MetadataRoute } from "next";
import { SERVICIOS_LP } from "@/data/servicios-lp";
import { getPublishedProducts } from "@/lib/products-db";
import { slugProducto } from "@/lib/slug";

const BASE = "https://www.pieldeangel.cl";

// Los productos se leen de la base: al agregar o borrar uno, el mapa se actualiza solo.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productos: MetadataRoute.Sitemap = [];
  try {
    productos = (await getPublishedProducts()).map((p) => ({
      url: `${BASE}/producto/${slugProducto(p.title, p.id)}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {}

  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1    },
    { url: `${BASE}/#productos`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/#servicios`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/#agenda`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE}/#promociones`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/#testimonios`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7  },
    { url: `${BASE}/#nosotros`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6  },
    { url: `${BASE}/#contacto`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6  },
    { url: `${BASE}/tienda`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    ...SERVICIOS_LP.map((s) => ({
      url: `${BASE}/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    { url: `${BASE}/consejos`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE}/terminos`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3  },
    ...productos,
  ];
}
