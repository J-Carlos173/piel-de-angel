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

// OJO: no usar toISOString() acá — convierte a UTC y en la noche en Chile (UTC-3/-4)
// eso adelanta la fecha un día, lo que hacía que el celular bloqueara "hoy" y "mañana" sin avisar.
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** 0 = lunes … 6 = domingo (la semana parte en lunes, no en domingo como el getDay() nativo). */
function diaSemanaLunesPrimero(dateStr: string) {
  const dow = new Date(dateStr + "T12:00:00").getDay();
  return (dow + 6) % 7;
}

function diasEnMes(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Agenda() {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [diaLaboral, setDiaLaboral] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: SERVICIOS[0] });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const today = getTodayStr();
  const minDate = addDays(today, 1);
  const maxDate = addDays(today, 60);
  const [minY, minM] = minDate.split("-").map(Number);
  const [maxY, maxM] = maxDate.split("-").map(Number);
  const [mesVisible, setMesVisible] = useState({ year: minY, month: minM - 1 });

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setLoadingSlots(true);
    setSlots([]);
    setStep("time"); // muestra el spinner de inmediato
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setDiaLaboral(data.workingDay !== false);
    } catch {
      setSlots([]);
      setDiaLaboral(true);
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
          <p className="section-subtitle" style={{ marginTop: 6 }}>
            Atendemos a domicilio: vamos a tu casa.
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

              {step === "date" && (() => {
                const puedeAtras = mesVisible.year > minY || (mesVisible.year === minY && mesVisible.month > minM - 1);
                const puedeAdelante = mesVisible.year < maxY || (mesVisible.year === maxY && mesVisible.month < maxM - 1);
                const primerDia = diaSemanaLunesPrimero(ymd(mesVisible.year, mesVisible.month, 1));
                const totalDias = diasEnMes(mesVisible.year, mesVisible.month);
                const celdas: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];

                return (
                  <div className="agenda-date-picker">
                    <p className="agenda-hint">Selecciona el día de tu cita</p>
                    {/* Calendario siempre visible — nada que abrir ni cerrar, para que funcione igual en cualquier celular. */}
                    <div className="agenda-calendar">
                      <div className="agenda-calendar-header">
                        <button
                          type="button"
                          className="agenda-calendar-nav"
                          disabled={!puedeAtras}
                          onClick={() => setMesVisible((m) => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 })}
                          aria-label="Mes anterior"
                        >
                          <i className="fa-solid fa-chevron-left" />
                        </button>
                        <span className="agenda-calendar-titulo">{MESES[mesVisible.month]} {mesVisible.year}</span>
                        <button
                          type="button"
                          className="agenda-calendar-nav"
                          disabled={!puedeAdelante}
                          onClick={() => setMesVisible((m) => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 })}
                          aria-label="Mes siguiente"
                        >
                          <i className="fa-solid fa-chevron-right" />
                        </button>
                      </div>
                      <div className="agenda-calendar-semana">
                        {DIAS_SEMANA.map((d, i) => <span key={i}>{d}</span>)}
                      </div>
                      <div className="agenda-calendar-grid">
                        {celdas.map((dia, i) => {
                          if (dia === null) return <span key={`b${i}`} className="agenda-calendar-vacio" />;
                          const fecha = ymd(mesVisible.year, mesVisible.month, dia);
                          const habilitado = fecha >= minDate && fecha <= maxDate;
                          return (
                            <button
                              type="button"
                              key={fecha}
                              disabled={!habilitado}
                              onClick={() => handleDateSelect(fecha)}
                              className={`agenda-calendar-dia${fecha === selectedDate ? " activo" : ""}`}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                    <div className="agenda-empty">
                      {diaLaboral
                        ? "Ese día ya no quedan horas disponibles. Prueba con otro día."
                        : "Ese día no atendemos. Elige otra fecha: lunes a viernes de 16:30 a 20:00, o sábado de 9:00 a 20:00."}
                    </div>
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
