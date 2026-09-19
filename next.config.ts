import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // El dominio tuvo antes otra tienda (estructura /pages, /collections, /products).
  // Google todavia tiene esas URLs guardadas y hoy dan 404.
  async redirects() {
    return [
      { source: "/pages/:path*", destination: "/", permanent: true },
      { source: "/collections/:path*", destination: "/#productos", permanent: true },
      { source: "/products/:path*", destination: "/#productos", permanent: true },
      { source: "/blogs/:path*", destination: "/consejos", permanent: true },
    ];
  },
};

export default nextConfig;
