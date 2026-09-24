import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // El dominio tuvo antes otra tienda (estructura /pages, /collections, /products).
  // Google todavia tiene esas URLs guardadas y hoy dan 404.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Un solo dominio: pieldeangel.cl (sin www) manda a www.pieldeangel.cl.
      { source: "/:path*", has: [{ type: "host", value: "pieldeangel.cl" }], destination: "https://www.pieldeangel.cl/:path*", permanent: true },
      { source: "/pages/:path*", destination: "/", permanent: true },
      { source: "/collections/:path*", destination: "/#productos", permanent: true },
      { source: "/products/:path*", destination: "/#productos", permanent: true },
      { source: "/blogs/:path*", destination: "/consejos", permanent: true },
    ];
  },
};

export default nextConfig;
