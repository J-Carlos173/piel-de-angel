"use client";

import { useState, FormEvent } from "react";

export default function Contacto() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section className="contacto" id="contacto">
      <div className="container contacto-wrapper">
        <div className="contacto-info reveal">
          <span className="eyebrow">Contáctanos</span>
          <h2 className="section-title">
            Reserva tu <em>experiencia</em>
          </h2>
          <p>
            Estamos para escucharte. Déjanos tus datos y te contactaremos a la
            brevedad para agendar tu visita en Piel de Ángel.
          </p>

          <div className="contacto-detalles">
            <div className="detalle-item">
              <div className="detalle-icon">
                <i className="fa-solid fa-location-dot" />
              </div>
              <div className="detalle-text">
                <strong>Ubicación</strong>
                <span>Santiago, Chile</span>
              </div>
            </div>
            <div className="detalle-item">
              <div className="detalle-icon">
                <i className="fa-brands fa-whatsapp" />
              </div>
              <div className="detalle-text">
                <strong>WhatsApp</strong>
                <span>+56 9 7703 1461</span>
              </div>
            </div>
            <div className="detalle-item">
              <div className="detalle-icon">
                <i className="fa-solid fa-clock" />
              </div>
              <div className="detalle-text">
                <strong>Horario</strong>
                <span>Lun a Sáb · 10:00 — 20:00</span>
              </div>
            </div>
          </div>

          <div className="contacto-redes">
            <a
              href="https://www.instagram.com/pieldeangel.cosmetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="red-social"
            >
              <i className="fa-brands fa-instagram" />
            </a>
            <a href="#" className="red-social">
              <i className="fa-brands fa-facebook-f" />
            </a>
            <a href="#" className="red-social">
              <i className="fa-brands fa-tiktok" />
            </a>
            <a
              href="https://wa.me/56977031461"
              target="_blank"
              rel="noopener noreferrer"
              className="red-social"
            >
              <i className="fa-brands fa-whatsapp" />
            </a>
          </div>
        </div>

        <form className="contacto-form reveal" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" required />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" type="tel" placeholder="+56 9 ..." required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="tucorreo@email.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="servicio">Servicio de Interés</label>
            <select id="servicio" name="servicio" required>
              <option value="">Selecciona un tratamiento</option>
              <option>Limpieza Facial</option>
              <option>Lifting de Pestañas</option>
              <option>Hidratación Facial</option>
              <option>Tratamientos Faciales</option>
              <option>Skincare Premium</option>
              <option>Ritual de Bienestar</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos qué buscas..." />
          </div>
          <button type="submit" className="btn-submit">
            {submitted ? (
              <>
                <i className="fa-solid fa-check" /> ¡Mensaje enviado!
              </>
            ) : (
              <>
                Enviar Solicitud <i className="fa-solid fa-paper-plane" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
