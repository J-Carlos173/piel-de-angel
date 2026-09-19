export const COMUNAS = ["Vitacura", "Lo Barnechea", "Las Condes", "Providencia", "Ñuñoa"];

export type ServicioLP = {
  slug: string;
  /** Para encontrar el servicio en la base de datos (foto) y en las tarjetas del sitio. */
  match: RegExp;
  nombre: string;
  h1: string;
  h1em: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  queEs: { titulo: string; texto: string };
  sesion: string;
  paraTi: string[];
  faq: { q: string; a: string }[];
  waTexto: string;
};

export const SERVICIOS_LP: ServicioLP[] = [
  {
    slug: "lifting-de-pestanas",
    match: /pesta/i,
    nombre: "Lifting de pestañas",
    h1: "Lifting de pestañas",
    h1em: "a domicilio",
    metaTitle: "Lifting de pestañas a domicilio en Santiago Oriente",
    metaDescription:
      "Lifting de pestañas a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Eleva y curva tus pestañas naturales, sin extensiones. Reserva tu hora.",
    lead: "Eleva y curva tus pestañas naturales desde la raíz para lograr una mirada abierta y despierta, sin extensiones y sin rizador todas las mañanas. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿Qué es el lifting de pestañas?",
      texto:
        "Es un tratamiento de estética que trabaja sobre tus pestañas naturales: las levanta y las curva desde la raíz, así se ven más largas y con más volumen. Como no lleva extensiones, el resultado se ve natural y no necesitas mantenimiento diario.",
    },
    sesion:
      "Dura aproximadamente 60 minutos y se hace en la comodidad de tu casa. Es una atención personalizada: antes de comenzar conversamos qué efecto quieres y revisamos si el tratamiento es adecuado para ti.",
    paraTi: [
      "Quieres una mirada más abierta sin usar extensiones.",
      "Prefieres un resultado natural, que se vea como tus pestañas pero mejor.",
      "Buscas ahorrar tiempo en tu rutina de todos los días.",
    ],
    faq: [
      {
        q: "¿Qué es el lifting de pestañas?",
        a: "Es un tratamiento que eleva y curva tus pestañas naturales desde la raíz. Se ven más largas y abiertas, con un efecto de mirada despierta, sin usar extensiones.",
      },
      { q: "¿Cuánto dura el resultado?", a: "En general entre 6 y 8 semanas, hasta que las pestañas se renuevan de forma natural." },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 60 minutos." },
      {
        q: "¿Es doloroso? ¿Puedo hacerlo si tengo los ojos sensibles?",
        a: "Es una sesión tranquila, con los ojos cerrados, y no debería doler. Si tienes ojos sensibles, alergias o te hiciste algún tratamiento reciente en la zona, cuéntanos antes por WhatsApp para revisarlo contigo.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "Al terminar te damos indicaciones. Por lo general se recomienda evitar el agua, el vapor y el maquillaje de ojos durante las primeras 24 horas.",
      },
    ],
    waTexto: "Hola, quiero reservar un lifting de pestañas a domicilio.",
  },
  {
    slug: "limpieza-facial-profunda",
    match: /limpieza/i,
    nombre: "Limpieza facial profunda",
    h1: "Limpieza facial profunda",
    h1em: "a domicilio",
    metaTitle: "Limpieza facial profunda a domicilio en Santiago Oriente",
    metaDescription:
      "Limpieza facial profunda a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Vapor, extracción de impurezas y mascarilla calmante. Reserva tu hora.",
    lead: "Una limpieza profunda con vapor, extracción de impurezas y mascarilla calmante que deja la piel fresca, luminosa y suave. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿Qué incluye la limpieza facial profunda?",
      texto:
        "Es un tratamiento que limpia la piel en profundidad. Incluye vapor para preparar la piel, extracción de impurezas y una mascarilla calmante para terminar. El resultado es una piel más fresca, luminosa y con los poros más limpios.",
    },
    sesion:
      "Dura aproximadamente 60 minutos y se hace en tu casa. Antes de empezar revisamos el estado de tu piel para adaptar la limpieza a lo que necesita.",
    paraTi: [
      "Sientes la piel opaca, con poros tapados o puntos negros.",
      "Quieres un momento de cuidado sin salir de casa.",
      "Buscas partir tu rutina de skincare con la piel bien limpia.",
    ],
    faq: [
      {
        q: "¿Qué incluye la limpieza facial profunda?",
        a: "Vapor, extracción de impurezas y una mascarilla calmante, adaptados al estado de tu piel.",
      },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 60 minutos." },
      {
        q: "¿Cada cuánto conviene hacerla?",
        a: "En general cada 4 a 6 semanas, aunque depende de tu tipo de piel. Te recomendamos la frecuencia según tu caso.",
      },
      {
        q: "¿Sirve para piel sensible o con acné?",
        a: "Adaptamos el tratamiento al tipo de piel. Si tienes piel muy sensible, acné inflamado, rosácea o usas medicación dermatológica, cuéntanos antes por WhatsApp para revisarlo contigo.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "Al terminar te damos indicaciones. Por lo general se recomienda evitar el sol directo, el maquillaje pesado y los exfoliantes durante las primeras 24 a 48 horas, y usar protector solar.",
      },
    ],
    waTexto: "Hola, quiero reservar una limpieza facial profunda a domicilio.",
  },
  {
    slug: "hidratacion-facial",
    match: /hidrat/i,
    nombre: "Hidratación facial premium",
    h1: "Hidratación facial premium",
    h1em: "a domicilio",
    metaTitle: "Hidratación facial premium a domicilio en Santiago Oriente",
    metaDescription:
      "Hidratación facial premium a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Ácido hialurónico y vitamina C para una piel radiante. Reserva tu hora.",
    lead: "Un tratamiento intensivo con ácido hialurónico y vitamina C para devolverle elasticidad e hidratación a tu piel. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿En qué consiste la hidratación facial premium?",
      texto:
        "Es un tratamiento intensivo que trabaja con ácido hialurónico y vitamina C. Busca restaurar la elasticidad y dejar la piel radiante y bien hidratada desde la primera sesión.",
    },
    sesion:
      "Dura aproximadamente 60 minutos y se hace en tu casa. Antes de comenzar revisamos cómo está tu piel para elegir cómo trabajar los activos.",
    paraTi: [
      "Tu piel se siente tirante, seca o deshidratada.",
      "Quieres un aspecto más luminoso y descansado.",
      "Te preparas para un evento y quieres llegar con la piel en su mejor momento.",
    ],
    faq: [
      {
        q: "¿En qué consiste?",
        a: "Es un tratamiento intensivo con ácido hialurónico y vitamina C para restaurar la elasticidad y dejar la piel radiante e hidratada.",
      },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 60 minutos." },
      {
        q: "¿Cada cuánto conviene hacerla?",
        a: "Depende de cómo esté tu piel. Después de la primera sesión te recomendamos una frecuencia acorde a lo que necesita.",
      },
      {
        q: "¿Sirve para todo tipo de piel?",
        a: "La hidratación es útil en casi todos los tipos de piel, incluso en la grasa. Si tienes alergia a algún activo (como la vitamina C) o la piel muy reactiva, avísanos antes.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "Al terminar te damos indicaciones. Por lo general se recomienda usar protector solar y evitar exfoliantes fuertes los días siguientes.",
      },
    ],
    waTexto: "Hola, quiero reservar una hidratación facial a domicilio.",
  },
  {
    slug: "laminado-de-cejas",
    match: /laminado/i,
    nombre: "Laminado de cejas",
    h1: "Laminado de cejas",
    h1em: "a domicilio",
    metaTitle: "Laminado de cejas a domicilio en Santiago Oriente",
    metaDescription:
      "Laminado de cejas a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Efecto peinado natural con perfilado y tinte incluidos. Reserva tu hora.",
    lead: "Define y lamina tus cejas para lograr un efecto peinado, natural y duradero. Incluye perfilado y tinte personalizado según tu tono. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿Qué es el laminado de cejas?",
      texto:
        "Es un tratamiento que ordena y fija el vello de la ceja en la dirección que quieres, para un efecto peinado y con más definición. En nuestra sesión incluye perfilado y un tinte elegido según tu tono.",
    },
    sesion:
      "Dura aproximadamente 45 minutos y se hace en tu casa. Conversamos qué forma y color quieres y elegimos el tinte que mejor va con tu tono.",
    paraTi: [
      "Tus cejas crecen rebeldes o hacia distintos lados.",
      "Quieres cejas más definidas sin maquillarlas todos los días.",
      "Prefieres un resultado natural.",
    ],
    faq: [
      {
        q: "¿Qué es el laminado de cejas?",
        a: "Es un tratamiento que ordena y fija el vello de la ceja para un efecto peinado. Incluye perfilado y tinte personalizado según tu tono.",
      },
      { q: "¿Cuánto dura el resultado?", a: "En general entre 4 y 6 semanas, dependiendo del crecimiento de tu vello." },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 45 minutos." },
      {
        q: "¿Puedo hacérmelo si tengo la piel sensible o alergias?",
        a: "Si tienes piel sensible o alergias, avísanos antes por WhatsApp para revisar contigo cómo hacerlo de forma segura.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "Al terminar te damos indicaciones. Por lo general se recomienda evitar mojar y frotar la zona durante las primeras 24 horas.",
      },
    ],
    waTexto: "Hola, quiero reservar un laminado de cejas a domicilio.",
  },
  {
    slug: "perfilado-de-cejas",
    match: /perfilado/i,
    nombre: "Perfilado de cejas",
    h1: "Perfilado de cejas",
    h1em: "con hilo, a domicilio",
    metaTitle: "Perfilado y depilación de cejas con hilo a domicilio",
    metaDescription:
      "Perfilado y depilación de cejas con hilo a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. La forma que enmarca tu mirada. Reserva tu hora.",
    lead: "Diseño y depilación con hilo para lograr la forma perfecta que enmarca tu mirada y realza tus rasgos naturales. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿En qué consiste el perfilado de cejas?",
      texto:
        "Es un diseño de cejas hecho a tu medida, con depilación con hilo: una técnica precisa que retira el vello desde la raíz y permite dejar una forma limpia y pareja.",
    },
    sesion:
      "Dura aproximadamente 20 minutos y se hace en tu casa. Definimos juntas la forma que mejor va con tu rostro antes de comenzar.",
    paraTi: [
      "Quieres una forma de ceja limpia y armónica con tu rostro.",
      "Buscas precisión al depilar.",
      "Quieres mantener tus cejas en orden entre sesiones.",
    ],
    faq: [
      {
        q: "¿En qué consiste?",
        a: "Es un diseño de cejas con depilación con hilo, pensado para dar una forma que enmarque tu mirada.",
      },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 20 minutos." },
      {
        q: "¿Cada cuánto conviene repetirlo?",
        a: "En general cada 3 a 4 semanas, según el ritmo de crecimiento de tu vello.",
      },
      {
        q: "¿Duele?",
        a: "Puede sentirse una molestia leve, como en cualquier depilación, que suele ser breve.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "Al terminar te damos indicaciones. Por lo general se recomienda evitar el sol directo, los cosméticos irritantes y frotar la zona durante las primeras horas.",
      },
    ],
    waTexto: "Hola, quiero reservar un perfilado de cejas a domicilio.",
  },
  {
    slug: "tratamiento-anti-edad",
    match: /anti-?edad/i,
    nombre: "Tratamiento anti-edad",
    h1: "Tratamiento anti-edad",
    h1em: "a domicilio",
    metaTitle: "Tratamiento facial anti-edad a domicilio en Santiago Oriente",
    metaDescription:
      "Tratamiento facial anti-edad a domicilio en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Retinol, péptidos y antioxidantes. Reserva tu hora.",
    lead: "Un protocolo rejuvenecedor con activos premium —retinol, péptidos y antioxidantes— para reducir líneas de expresión y devolver firmeza a tu piel. Vamos hasta tu casa en Santiago Oriente.",
    queEs: {
      titulo: "¿En qué consiste el tratamiento anti-edad?",
      texto:
        "Es un protocolo facial que combina activos como retinol, péptidos y antioxidantes. Busca mejorar la apariencia de las líneas de expresión y devolver firmeza a la piel. Los resultados dependen de cada piel y de la constancia.",
    },
    sesion:
      "Dura aproximadamente 75 minutos y se hace en tu casa. Antes de comenzar evaluamos tu piel para adaptar el protocolo a lo que necesita.",
    paraTi: [
      "Notas líneas de expresión o pérdida de firmeza.",
      "Quieres cuidar tu piel de forma preventiva.",
      "Buscas un tratamiento personalizado según tu edad y tu tipo de piel.",
    ],
    faq: [
      {
        q: "¿En qué consiste?",
        a: "Es un protocolo facial con retinol, péptidos y antioxidantes, pensado para mejorar la apariencia de las líneas de expresión y la firmeza de la piel.",
      },
      { q: "¿Cuánto demora la sesión?", a: "Aproximadamente 75 minutos." },
      {
        q: "¿Cuántas sesiones necesito?",
        a: "Depende de tu piel y de tu objetivo. Después de evaluarla te proponemos un plan de sesiones.",
      },
      {
        q: "¿Cuándo se ven los resultados?",
        a: "Los cambios en la piel son graduales y dependen de cada persona; no prometemos resultados inmediatos.",
      },
      {
        q: "¿Tiene contraindicaciones?",
        a: "Si estás embarazada o en periodo de lactancia, tienes la piel muy sensible o usas medicación dermatológica (como isotretinoína), avísanos antes de reservar.",
      },
      {
        q: "¿Qué cuidados debo tener después?",
        a: "El retinol puede sensibilizar la piel al sol. Por lo general se recomienda usar protector solar todos los días y evitar exfoliantes fuertes los días siguientes.",
      },
    ],
    waTexto: "Hola, quiero reservar un tratamiento anti-edad a domicilio.",
  },
];

export function slugParaServicio(titulo: string): string | null {
  return SERVICIOS_LP.find((s) => s.match.test(titulo))?.slug ?? null;
}
