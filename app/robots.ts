import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/checkout/"] },
    sitemap: "https://piel-de-angel.vercel.app/sitemap.xml",
  };
}
