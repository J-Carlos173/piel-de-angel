"use client";
import { useState } from "react";

const SERVICIOS = [
  "Limpieza facial profunda",
  "Tratamiento antienvejecimiento",
  "Hidratación intensiva",
  "Peeling químico",
  "Microdermoabrasión",
  "Masaje facial relajante",
  "Tratamiento para manchas",
  "Consulta de diagnóstico",
];

type Slot = { time: string; available: boolean };
type Step = "date" | "time" | "form" | "done";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
}

export default function Agenda() {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: SERVICIOS[0] });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const today = getTodayStr();
  const maxDate = addDays(today, 60);

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setLoadingSlots(true);
    setSlots([]);
    setStep("time"); // muestra el spinner de inmediato
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    }
    setLoadingSlots(false);
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: selectedDate, time: selectedTime }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      setError("Hubo un error al enviar. Intenta de nuevo o contáctanos por WhatsApp.");
    }
    setSending(false);
  }

  return (
    <section id="agenda" className="agenda-section">
      <div className="agenda-container">
        <div className="section-header">
          <span className="section-tag">Reserva tu hora</span>
          <h2 className="section-title">Agenda tu Cita</h2>
          <p className="section-subtitle">
            Lunes a viernes · 9:00 – 17:00 hrs · Respuesta en menos de 24 horas
          </p>
        </div>

        <div className="agenda-card">
          {step === "done" ? (
            <div className="agenda-done">
              <div className="agenda-done-icon">✦</div>
              <h3>Solicitud enviada</h3>
              <p>
                Recibirás una confirmación en <strong>{form.email}</strong> una vez que
                aprobemos tu cita para el <strong>{formatDate(selectedDate)}</strong> a las{" "}
                <strong>{selectedTime} hrs</strong>.
              </p>
              <button
                className="agenda-reset"
                onClick={() => {
                  setStep("date");
                  setSelectedDate("");
                  setSelectedTime("");
                  setForm({ name: "", email: "", phone: "", service: SERVICIOS[0] });
                }}
              >
                Agendar otra cita
              </button>
            </div>
          ) : (
            <>
              <div className="agenda-steps">
                {(["date", "time", "form"] as Step[]).map((s, i) => (
                  <div key={s} className={`agenda-step ${step === s ? "active" : ""} ${["time", "form", "done"].includes(step) && i < ["date", "time", "form"].indexOf(step) ? "done" : ""}`}>
                    <span className="agenda-step-num">{i + 1}</span>
                    <span className="agenda-step-label">{["Fecha", "Horario", "Datos"][i]}</span>
                  </div>
                ))}
              </div>

              {step === "date" && (
                <div className="agenda-date-picker">
                  <p className="agenda-hint">Selecciona el día de tu cita</p>
                  <div className="agenda-date-wrapper">
                    <input
                      type="date"
                      min={addDays(today, 1)}
                      max={maxDate}
                      className="agenda-date-input"
                      onChange={(e) => e.target.value && handleDateSelect(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === "time" && (
                <div className="agenda-slots">
                  <p className="agenda-hint">
                    Horarios disponibles para{" "}
                    <strong>{formatDate(selectedDate)}</strong>
                  </p>
                  {loadingSlots ? (
                    <div className="agenda-loading">
                      <i className="fa-solid fa-spinner fa-spin" />
                      Cargando horarios…
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="agenda-empty">No hay horarios disponibles este día.</div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map(({ time, available }) => (
                        <button
                          key={time}
                          disabled={!available}
                          onClick={() => handleTimeSelect(time)}
                          className={`slot-btn ${available ? "available" : "unavailable"}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                  <button className="agenda-back" onClick={() => setStep("date")}>
                    ← Cambiar fecha
                  </button>
                </div>
              )}

              {step === "form" && (
                <form className="agenda-form" onSubmit={handleSubmit}>
                  <p className="agenda-hint">
                    {formatDate(selectedDate)} · <strong>{selectedTime} hrs</strong>
                  </p>

                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono / WhatsApp</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+56 9 XXXX XXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label>Servicio</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                    >
                      {SERVICIOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {error && <p className="agenda-error">{error}</p>}

                  <div className="agenda-form-actions">
                    <button type="button" className="agenda-back" onClick={() => setStep("time")}>
                      ← Cambiar hora
                    </button>
                    <button type="submit" className="agenda-submit" disabled={sending}>
                      {sending ? "Enviando…" : "Solicitar cita"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
