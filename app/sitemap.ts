import { MetadataRoute } from "next";

const BASE = "https://piel-de-angel.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1    },
    { url: `${BASE}/#productos`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE}/#servicios`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/#agenda`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE}/#promociones`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/#nosotros`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6  },
  ];
}
