@AGENTS.md

# Piel de Ángel — contexto del proyecto

Sitio y tienda online de un negocio real de estética a domicilio en Santiago Oriente (Chile),
de Teresita ("Tere"). Carlos es el intermediario técnico y da las instrucciones. Este documento
existe para que cualquier sesión nueva (de Claude o de otra IA) tenga el contexto que normalmente
se pierde entre conversaciones. Si algo de acá queda desactualizado, corrígelo — vale más que se
mantenga al día que completo.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, sin librerías de estilos (CSS plano en
  `app/globals.css`, estilos inline en los paneles de admin).
- Base de datos: Neon Postgres, vía `@neondatabase/serverless` en `lib/db.ts` (`getDb()`, tagged
  templates `sql\`...\``). Tablas se crean solas con `ensureXTable()` al primer uso — no hay
  migraciones aparte.
- Hosting: Vercel. Imágenes: Vercel Blob (subidas desde los paneles de admin, con reducción de
  tamaño en el navegador antes de subir).
- Pagos: Transbank WebPay Plus (`transbank-sdk`).
- Correo: Gmail vía `nodemailer` (`lib/email.ts`).
- Agenda: Google Calendar API (`googleapis`), solo para "ocupado/libre" — el horario de atención
  en sí NO vive en Google Calendar, ver más abajo.
- Dos superficies de IA real (Anthropic SDK, model `claude-opus-4-5`): el asistente de
  `/admin/ai` (con herramientas propias, ver abajo) y este mismo Claude Code trabajando por fuera.

**Nota:** `NEXT_PUBLIC_MEDUSA_BACKEND_URL` / `MEDUSA_ADMIN_*` son variables que quedaron del
scaffold original (Next.js + Medusa starter). El catálogo real NO usa un backend Medusa: 
`lib/medusa.ts` solo llama a `/api/products`, que es nuestra propia ruta contra Neon. Es deuda
del andamiaje, no una integración viva — se puede ignorar o limpiar.

## Los dos "Asistentes IA" — no confundirlos

1. **`/admin/pedidos`** ("Asistente IA" con PIN, `159632` por defecto vía `PEDIDOS_PIN`): Tere
   escribe un pedido ahí, queda en la tabla `ia_pedidos`. Un vigilante local en el computador de
   Carlos (`C:\Users\Cato\Desktop\Panel Escucha Pedidos\watcher.sh`, dashboard en
   `localhost:4747`) revisa la tabla cada ~5s y avisa cuando hay uno nuevo. **No hay IA automática
   acá**: es Carlos (vía Claude Code) quien lee y responde a mano con un PATCH a
   `/api/admin/pedidos` (`estado`, `respuesta`, y `con_cambio: false` si la respuesta no implicó
   ningún cambio de código, para que no se muestre la animación de "subiendo a producción").
2. **`/admin/ai`** (`app/api/admin/ai/route.ts`): un agente con Claude real y herramientas
   (`ver_resenas`, `aprobar_resena`, `eliminar_resena`, `ocultar_resena`, `ver_servicios`,
   `crear_servicio`, `actualizar_servicio`, `eliminar_servicio`, `ver_estadisticas`, `ver_agenda`,
   `ver_productos`, `actualizar_producto`) que actúa directo sobre la base de datos, sin pasar por
   Carlos. No está claro cuánto lo usa Tere en la práctica — vale la pena preguntarle.

## Autenticación del panel

- Sesión de admin: cookie `admin_auth` = HMAC-SHA256 de `ADMIN_PASSWORD` (no la contraseña en
  claro ni en base64). Ver `lib/admin-token.ts`, `lib/admin-auth.ts` (rutas API) y `middleware.ts`
  (páginas `/admin/*`, recalcula el mismo HMAC con Web Crypto porque el middleware no corre en
  Node runtime).
- El panel acepta `ADMIN_PASSWORD` o una segunda clave guardada en `settings.admin_password_2`
  (ver `/api/admin/password-secundaria`).
- El PIN de `/admin/pedidos` se verifica en el servidor (`/api/admin/pedidos/pin`), no viaja en el
  bundle del navegador.

## Mapa de paneles admin (`app/admin/*`)

| Ruta | Para qué |
|---|---|
| `/admin` | Dashboard con tarjetas a todo lo demás, más KPIs de ventas |
| `/admin/pedidos` | Chat con Tere (ver arriba), PIN propio |
| `/admin/ai` | Asistente IA en vivo con herramientas (ver arriba) |
| `/admin/productos` | CRUD de productos, foto, stock, % de descuento |
| `/admin/servicios` | CRUD de servicios; botón Publicado/Borrador, botón En portada/Sin portada |
| `/admin/servicios/paginas` | Editor del texto de cada página de servicio (`/lifting-de-pestanas`, etc.) y de las comunas de atención (compartidas, `settings.zonas_domicilio`) |
| `/admin/agenda` | Citas próximas/historial, bloquear horas puntuales, **Horario de atención** (qué días y entre qué horas se puede reservar — ver abajo) |
| `/admin/consejos` | CRUD de los tips de `/consejos` y del carrusel del inicio |
| `/admin/promos-web` | CRUD de las tarjetas de la sección Promociones del inicio (concursos/avisos) — no confundir con `/admin/promos` |
| `/admin/promos` | Códigos de descuento del checkout |
| `/admin/reviews` | Moderar reseñas de clientas (pendiente/aprobada) |
| `/admin/contenido` | Editor de texto/imagen del Hero, Sobre Nosotros y encabezado de la Tienda |
| `/admin/fondos` | Fondo animado de ambiente para todos los paneles de admin |
| `/admin/tareas` | Lista de tareas/notas pendientes del proyecto (sembrada una vez, editable) |
| `/admin/notificaciones` | Qué correos automáticos recibe Tere (citas, compras, seguridad) |
| `/admin/ordenes`, `/admin/ventas`, `/admin/analytics` | Historial de compras, reportes por zona/producto, visitas al sitio (propio, sin cookies) |
| `/admin/password` | Cambiar la contraseña del panel |

## Reglas de negocio que no se ven a simple vista

- **Precios y envío se calculan siempre en el servidor** (`app/api/checkout/create/route.ts`,
  usando `getPublishedProducts()` + `precioFinal()` + `calcularEnvio()`). Lo que manda el
  navegador nunca se usa para cobrar — esto fue un agujero de seguridad real que se cerró.
- **Horario de atención**: editable en `/admin/agenda` → pestaña "Horario de atención", guardado
  en `settings.horario_agenda` (`lib/horario-agenda.ts` + `lib/horario-agenda-shared.ts`, este
  último sin acceso a datos para poder importarse también en componentes de cliente). Google
  Calendar **no** define el horario, solo bloquea horas ya ocupadas ahí.
- **Páginas de servicio** (`/lifting-de-pestanas`, `/limpieza-facial-profunda`, etc.): son 6
  categorías fijas en `data/servicios-lp.ts` (cada una con un `RegExp` que la relaciona con el
  `title` del servicio real en la tabla `servicios`). La página se oculta sola (redirect a
  `/#servicios`, `noindex`) si el servicio correspondiente está en "Borrador". El texto de cada
  página es editable y se guarda como *override* en `settings.servicios_lp_contenido`
  (`lib/servicios-lp-content.ts`), sin perder el original si se borra el override.
- **Páginas de producto** (`/producto/[slug]`): se generan solas para cada producto publicado
  (slug = nombre + 8 caracteres del id, `lib/slug.ts`). Sin producto → redirect a `/tienda`.
- **Foto del Hero (portada)**: rota entre las fotos de los servicios que tengan el flag
  `en_portada = true` (columna en `servicios`). Si ninguno está marcado, usa la imagen de
  `/admin/contenido`; si esa tampoco existe, la portada va sin imagen (layout centrado).
- **Patrón "sembrar una vez"**: varias tablas (`consejos`, `promos_web`, `admin_tareas`) se
  llenan con datos iniciales solo si `settings.<algo>_semilla` no existe todavía — así, si Tere
  borra todo, no vuelve a aparecer el contenido de ejemplo en el próximo deploy.
- **Comunas de atención a domicilio**: una sola lista compartida (`settings.zonas_domicilio`,
  default en `data/servicios-lp.ts` → `COMUNAS`), usada en el inicio, en las 6 páginas de
  servicio y en su FAQ/JSON-LD. Se edita en un solo lugar (`/admin/servicios/paginas`) y se
  refleja en todos.

## Tablas de la base de datos

`settings` (key/value genérico), `products`, `servicios`, `orders`, `promo_codes`,
`ia_pedidos`, `admin_tareas`, `consejos`, `promos_web`, `reviews`, `blocked_slots`.
Todas se crean solas (`ensureXTable()`), no hace falta correr nada a mano.

## Convenciones

- Todo el texto de cara al usuario y los comentarios de código van en español.
- Los paneles de admin usan estilos inline (no CSS modules ni Tailwind), siguiendo la paleta
  rosa/crema ya establecida (`#C68A95`, `#D8A7B1`, etc.) y los mismos patrones de
  `AdminHeader`/`AdminAmbient` para que todos los paneles se vean iguales.
- Fotos subidas desde el admin se reducen de tamaño en el navegador antes de mandarlas a
  `/api/admin/upload` (patrón repetido en varios paneles: `reducirImagen()`).

## Tropiezos ya conocidos (para no repetirlos)

- **curl con tildes en Windows/Git Bash**: pasar JSON con acentos como argumento (`-d '...'`)
  los corrompe a `�`. Usar siempre un archivo + `--data-binary @archivo.json` con
  `Content-Type: ...; charset=utf-8`.
- **El despliegue en Vercel demora en propagar**: a veces 1 intento, a veces varios minutos.
  Reintentar con un parámetro random (`?x=$RANDOM`) y paciencia antes de asumir que algo falló.
- **`redirect()` en una página estática (ISR, `dynamicParams = false`) no se ve como 307/308 en
  `curl`** — Next.js lo manda como una instrucción dentro del payload de React Server
  Components, que el navegador ejecuta al cargar el JS. Para confirmar un redirect así hay que
  probar con un navegador real (Playwright), no con curl.
- Playwright está instalado en el scratchpad de la sesión de Claude Code, no en este repo.

## Dónde mirar si algo no cuadra

- Memoria de Claude (preferencias de trabajo, no hechos del proyecto):
  `C:\Users\Cato\.claude\projects\...\memory\feedback_respuestas_pedidos_tere.md`.
- Vigilante de pedidos local: `C:\Users\Cato\Desktop\Panel Escucha Pedidos\` — si `watcher.log`
  tiene líneas viejas, probablemente se cayó con un reinicio; reiniciar con
  `curl -X POST http://localhost:4747/start` (el dashboard `node server.js` debe estar corriendo).
