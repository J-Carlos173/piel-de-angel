export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Dirección de un producto: nombre legible + primeros 8 caracteres del id (así no se repite nunca). */
export function slugProducto(titulo: string, id: string): string {
  const base = slugify(titulo).slice(0, 70).replace(/-+$/, "") || "producto";
  return `${base}-${id.slice(0, 8).toLowerCase()}`;
}

export function idPrefijoDeSlug(slug: string): string {
  return slug.slice(-8).toLowerCase();
}
