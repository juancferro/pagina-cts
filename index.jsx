import React, { useMemo, useState } from "react";

// ================================================================
// OKAS — Observatorio y Kit Anti‑Sesgo (v2)
// Cambios pedidos por el usuario:
// 1) Más texto en bloques explicativos (pillars)
// 2) Menos herramientas (se eliminaron Mapa de Riesgos y Ventanilla)
// 3) Expandir herramientas clave con descripciones largas
// 4) Pestañas funcionales para operar cada herramienta en la misma página
// ================================================================

// ----------------------------
// Datos semilla (del informe)
// ----------------------------
// Comentario: estas constantes alimentan la UI y facilitan iteraciones rápidas.

// Herramientas principales (se dejaron 4 y se expandieron)
const tools = [
  {
    id: "aia",
    title: "Diagnóstico Exprés (AIA‑Lite)",
    desc:
      "Cuestionario 10–15′ que clasifica riesgo, sugiere salvaguardas y genera PDF básico.",
    cta: "Comenzar",
    // Comentario: descripción extendida para pestaña funcional
    longDesc:
      "Evalúa propósito, población afectada, datos/variables (incl. sensibles), riesgos y no‑usos. Entrega un resumen de impacto con recomendaciones priorizadas.",
  },
  {
    id: "datasheets",
    title: "Datasheets y Model Cards",
    desc:
      "Formularios que producen plantillas descargables; desempeño por subgrupos.",
    cta: "Generar",
    // Comentario: descripción extendida para pestaña funcional
    longDesc:
      "Documenta origen de datos, licencias, cobertura, columnas sensibles, limitaciones y resultados del modelo por cohortes. Facilita auditoría y reutilización responsable.",
  },
  {
    id: "metrics",
    title: "Laboratorio de Métricas",
    desc:
      "Mini‑apps para cargar CSV ficticio y ver paridad, equal opportunity y odds.",
    cta: "Probar demo",
    // Comentario: descripción extendida para pestaña funcional
    longDesc:
      "Calcula tasa de positivos (paridad), TPR (oportunidad) y FPR (odds) por grupo; compara disparidades y comunica trade‑offs de forma transparente.",
  },
  {
    id: "policy",
    title: "Kit de Políticas",
    desc:
      "Plantillas de uso responsable, reclamos y monitoreo continuo.",
    cta: "Descargar",
    // Comentario: descripción extendida para pestaña funcional
    longDesc:
      "Incluye política de IA responsable, checklist de proveedores, cláusulas contractuales sobre datos y un proceso de evaluación continua de riesgos.",
  },
];

// Casos ilustrativos breves
const caseStudies = [
  {
    sector: "Salud",
    summary:
      "Gasto como proxy de necesidad subasignó cuidados a pacientes negros.",
    lesson: "Elegir objetivos sustantivos y no solo convenientes.",
  },
  {
    sector: "Reclutamiento",
    summary:
      "Sistema de CV penalizó a mujeres por patrones históricos.",
    lesson: "Revisar features, labels y feedback loops.",
  },
  {
    sector: "Reconocimiento facial",
    summary:
      "Errores mayores en mujeres de piel oscura por subrepresentación.",
    lesson: "Evaluación interseccional y límites de uso.",
  },
  {
    sector: "Educación",
    summary:
      "Calificación automática afectó a escuelas públicas (A‑levels 2020).",
    lesson: "Considerar contexto institucional y cohortes pequeñas.",
  },
];

// Marcos y estándares
const standards = [
  "UE — AI Act (clasificación por riesgo, FRIA)",
  "NIST — AI RMF 1.0 (Map‑Measure‑Manage‑Govern)",
  "ISO/IEC 23894:2023 (riesgos en IA)",
  "ISO/IEC TR 24027:2021 (medición y sesgo)",
  "Principios OCDE de IA (2019, act. 2024)",
];

// Bloques explicativos (más texto)
const pillars = [
  {
    title: "¿Qué es el sesgo?",
    text:
      "Desviación sistemática que produce resultados injustos o no representativos. Puede originarse en el muestreo, la medición/etiquetado, la elección del objetivo o proxy, el algoritmo, o el contexto de uso. Hay sesgos estadísticos (error de medición, selección) y normativos (quién queda peor parado), ambos relevantes en proyectos sociotécnicos.",
  },
  {
    title: "¿Por qué importa?",
    text:
      "La escala y automatización multiplican impactos en crédito, salud, empleo, justicia y educación. Un error sistemático afecta a poblaciones enteras, genera externalidades (pérdida de oportunidades, estigmas, costos públicos) y puede reproducir desigualdades históricas si no se gestiona con métricas, gobernanza y participación de afectados.",
  },
  {
    title: "¿Cómo se manifiesta?",
    text:
      "A lo largo del pipeline: (1) Muestreo/medición y trazabilidad; (2) Objetivos y proxies mal definidos; (3) Entrenamiento y validación con evaluación por subgrupos; (4) Despliegue y gobernanza (quién aprueba, con qué límites y monitoreo); (5) Bucles de realimentación, cambio de dominio (drift) y mantenimiento continuo.",
  },
  {
    title: "¿Es ‘bueno’?",
    text:
      "Todo modelo simplifica; lo clave es gestionar sesgos dañinos y documentar trade‑offs. No existe una definición única de equidad: paridad, oportunidad y odds suelen ser incompatibles entre sí. Hace falta deliberación, transparencia y rendición de cuentas, no solo métricas.",
  },
];

// Tipos frecuentes de sesgo (píldoras)
const biasTypes = [
  "Muestreo/Selección",
  "Medición/Etiquetado",
  "Proxy/Objetivo",
  "Representación",
  "Supervivencia/Disponibilidad",
  "Histórico/Sistémico",
];

// ----------------------------
// Utilidades: demo de métricas
// ----------------------------
// Comentario: dataset sintético mínimo para ilustrar métricas por grupo
const demoData = [
  { g: "A", y: 1, yhat: 1 },
  { g: "A", y: 1, yhat: 0 },
  { g: "A", y: 0, yhat: 0 },
  { g: "A", y: 0, yhat: 0 },
  { g: "B", y: 1, yhat: 1 },
  { g: "B", y: 1, yhat: 1 },
  { g: "B", y: 0, yhat: 1 },
  { g: "B", y: 0, yhat: 0 },
];

// Comentario: hook para calcular métricas de equidad por grupo
function useFairness(demo = demoData) {
  const byGroup = useMemo(() => {
    // Comentario: acumulador por grupo con matriz de confusión básica
    const acc = {} as Record<string, { n: number; posTrue: number; posPred: number; tp: number; fn: number; fp: number; tn: number }>;
    for (const r of demo) {
      // Comentario: inicialización por grupo
      if (!acc[r.g]) acc[r.g] = { n: 0, posTrue: 0, posPred: 0, tp: 0, fn: 0, fp: 0, tn: 0 };
      // Comentario: contadores
      acc[r.g].n += 1;
      acc[r.g].posTrue += r.y === 1 ? 1 : 0;
      acc[r.g].posPred += r.yhat === 1 ? 1 : 0;
      if (r.y === 1 && r.yhat === 1) acc[r.g].tp += 1;
      if (r.y === 1 && r.yhat === 0) acc[r.g].fn += 1;
      if (r.y === 0 && r.yhat === 1) acc[r.g].fp += 1;
      if (r.y === 0 && r.yhat === 0) acc[r.g].tn += 1;
    }
    return acc;
  }, [demo]);

  const metrics = useMemo(() => {
    // Comentario: transformamos a lista amigable para la UI
    return Object.entries(byGroup).map(([g, m]) => {
      const rate = m.posPred / m.n; // Comentario: paridad demográfica
      const tpr = m.posTrue > 0 ? m.tp / m.posTrue : 0; // Comentario: igualdad de oportunidades
      const fpr = (m.fp + m.tn) > 0 ? m.fp / (m.fp + m.tn) : 0; // Comentario: equalized odds (FPR)
      return { group: g, n: m.n, rate, tpr, fpr, tp: m.tp, fn: m.fn, fp: m.fp, tn: m.tn };
    });
  }, [byGroup]);

  return metrics;
}

// ----------------------------
// Componentes atómicos
// ----------------------------
function Tag({ children }: { children: React.ReactNode }) {
  // Comentario: etiqueta visual para palabras clave
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
      {children}
    </span>
  );
}

function Card({ title, desc, children, footer }: { title: string; desc?: string; children?: React.ReactNode; footer?: React.ReactNode }) {
  // Comentario: tarjeta con título, descripción, contenido y pie opcional
  return (
    <div className="h-full rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-semibold leading-tight text-neutral-900">{title}</h3>
        {desc && <p className="mt-1 text-sm text-neutral-600">{desc}</p>}
      </div>
      {children && <div className="flex-1 text-sm text-neutral-700">{children}</div>}
      {footer && <div className="pt-4 mt-4 border-t border-neutral-200">{footer}</div>}
    </div>
  );
}

function Button({ as = "button", href, onClick, children, variant = "primary" }: { as?: "a" | "button"; href?: string; onClick?: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  // Comentario: botón estilizado con variantes
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const styles = {
    primary: "bg-black text-white hover:bg-neutral-800 focus:ring-black",
    secondary: "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900",
    ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-300",
  } as const;
  if (as === "a" && href) return (
    <a href={href} className={`${base} ${styles[variant]}`}>
      {children}
    </a>
  );
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

// ----------------------------
// Componente principal
// ----------------------------
export default function OKAS_UI_v2() {
  // Comentario: estado del menú móvil
  const [open, setOpen] = useState(false);
  // Comentario: métrica seleccionada en la demo
  const [metric, setMetric] = useState<"rate" | "tpr" | "fpr">("rate");
  // Comentario: pestaña activa de la sección Herramientas
  const [activeTool, setActiveTool] = useState<string>("aia");
  // Comentario: métricas calculadas para la demo
  const fairness = useFairness();

  // Comentario: enlaces de navegación internos
  const nav = [
    { id: "inicio", label: "Inicio" },
    { id: "herramientas", label: "Herramientas" },
    { id: "casos", label: "Casos" },
    { id: "formacion", label: "Formación" },
    { id: "transparencia", label: "Transparencia" },
    { id: "reportar", label: "Reportar" },
  ];

  // Comentario: función de scroll suave
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  // Comentario: renderiza las píldoras de sesgos frecuentes
  const BiasPills = () => (
    <div className="flex flex-wrap gap-2">
      {biasTypes.map((b) => (
        <Tag key={b}>{b}</Tag>
      ))}
    </div>
  );

  // Comentario: lista de estándares
  const StandardsList = () => (
    <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700">
      {standards.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );

  // Comentario: tabla de métricas de equidad
  const MetricsDemo = () => (
    <Card
      title="Demo interactiva — Métricas de equidad"
      desc="Datos sintéticos para ilustrar paridad (rate), oportunidad (TPR) y odds (FPR)."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-neutral-500">Nota: En producción, esto se conecta a un uploader con validaciones.</div>
          <div className="flex gap-2">
            <Button variant={metric === "rate" ? "secondary" : "ghost"} onClick={() => setMetric("rate")}>Paridad (rate)</Button>
            <Button variant={metric === "tpr" ? "secondary" : "ghost"} onClick={() => setMetric("tpr")}>Opportunity (TPR)</Button>
            <Button variant={metric === "fpr" ? "secondary" : "ghost"} onClick={() => setMetric("fpr")}>Odds (FPR)</Button>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2 pr-4">Grupo</th>
              <th className="py-2 pr-4">n</th>
              <th className="py-2 pr-4">TP</th>
              <th className="py-2 pr-4">FN</th>
              <th className="py-2 pr-4">FP</th>
              <th className="py-2 pr-4">TN</th>
              <th className="py-2 pr-4">{metric.toUpperCase()}</th>
            </tr>
          </thead>
          <tbody>
            {fairness.map((m) => (
              <tr key={m.group} className="border-t border-neutral-200">
                <td className="py-2 pr-4 font-medium">{m.group}</td>
                <td className="py-2 pr-4">{m.n}</td>
                <td className="py-2 pr-4">{m.tp}</td>
                <td className="py-2 pr-4">{m.fn}</td>
                <td className="py-2 pr-4">{m.fp}</td>
                <td className="py-2 pr-4">{m.tn}</td>
                <td className="py-2 pr-4 font-semibold">
                  {metric === "rate" && (m.rate * 100).toFixed(0) + "%"}
                  {metric === "tpr" && (m.tpr * 100).toFixed(0) + "%"}
                  {metric === "fpr" && (m.fpr * 100).toFixed(0) + "%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // Comentario: render principal
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Comentario: enlace de accesibilidad */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-neutral-900 text-white px-3 py-2 rounded-md">Saltar al contenido</a>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Comentario: Branding */}
            <div className="flex items-center gap-3">
              <div aria-hidden className="w-8 h-8 rounded-xl bg-neutral-900" />
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight">OKAS</div>
                <div className="text-xs text-neutral-500">Observatorio Anti‑Sesgo</div>
              </div>
            </div>

            {/* Comentario: Navegación desktop */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Principal">
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                  {n.label}
                </button>
              ))}
              <Button onClick={() => go("herramientas")}>Empezar diagnóstico</Button>
            </nav>

            {/* Comentario: Menú móvil */}
            <button className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-300" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
              <span className="sr-only">Abrir menú</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comentario: Contenido del menú móvil */}
        {open && (
          <div id="mobile-menu" className="md:hidden border-t border-neutral-200">
            <div className="px-4 py-3 flex flex-col gap-2">
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className="text-sm text-left py-2">
                  {n.label}
                </button>
              ))}
              <Button onClick={() => go("herramientas")}>Empezar diagnóstico</Button>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section id="inicio" className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Detectá, mitigá y <span className="underline decoration-2 decoration-neutral-900">documentá</span> sesgos en tus sistemas de datos.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-neutral-700">
                Con el Observatorio y Kit Anti‑Sesgo (OKAS) podés evaluar impacto, generar datasheets y model cards, y entender métricas de equidad en minutos.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => go("herramientas")}>Diagnóstico Exprés</Button>
                <Button variant="ghost" onClick={() => go("metrics")}>Ver demo de métricas</Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Tag>Crédito</Tag>
                <Tag>Salud</Tag>
                <Tag>Empleo</Tag>
                <Tag>Educación</Tag>
                <Tag>Justicia</Tag>
              </div>
            </div>

            {/* Comentario: resumen de pilares */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pillars.map((p) => (
                  <Card key={p.title} title={p.title}>
                    <p>{p.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tipos de sesgo y buenas prácticas */}
        <section className="py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card title="Tipos frecuentes de sesgo" desc="Mapa mental rápido para diagnóstico inicial.">
              <BiasPills />
            </Card>
            <Card title="Buenas prácticas (resumen)" desc="Aplicar antes, durante y después del modelado.">
              <ul className="list-disc pl-5 space-y-2">
                <li>Definir problema, población objetivo y <em>no‑usos</em> (AIA/FRIA) con partes interesadas.</li>
                <li>Diseñar muestreo representativo; registrar linaje de datos, consentimientos y licencias (datasheet).</li>
                <li>Revisar features y etiquetas: evitar proxies de estatus socioeconómico, raza, religión u otros atributos sensibles.</li>
                <li>Separar entrenamiento/validación por subgrupos; estimar incertidumbre y tamaños mínimos por cohorte.</li>
                <li>Medir precisión y equidad (paridad/TPR/FPR); comparar disparidades y justificar trade‑offs por escrito.</li>
                <li>Publicar model card y límites de uso; comunicar riesgos residuales en lenguaje claro.</li>
                <li>Monitoreo post‑despliegue con KPIs, canal de reclamos y auditorías internas/externas.</li>
                <li>Gobernanza: responsables, umbrales de alerta, procedimiento de rollback y calendario de revisiones.</li>
              </ul>
            </Card>
            <Card title="Estándares y marcos" desc="Guías para cumplimiento y gobernanza.">
              <StandardsList />
            </Card>
          </div>
        </section>

        {/* Herramientas (tarjetas + pestañas funcionales) */}
        <section id="herramientas" className="py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Herramientas</h2>
            <div className="text-sm text-neutral-600">Kit práctico para equipos de escuelas, municipios, ONGs y pymes.</div>
          </div>

          {/* Comentario: tarjetas con resumen y longDesc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Card key={t.id} title={t.title} desc={t.desc} footer={<Button>{t.cta}</Button>}>
                <p className="text-sm text-neutral-700 mt-2">{t.longDesc}</p>
              </Card>
            ))}
          </div>

          {/* Comentario: pestañas funcionales para cada herramienta */}
          <div className="mt-10">
            {/* Barra de pestañas accesible */}
            <div role="tablist" aria-label="Herramientas funcionales" className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2">
              {tools.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={activeTool === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setActiveTool(t.id)}
                  className={`px-3 py-2 rounded-t-xl text-sm font-medium ${activeTool === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}
                >
                  {t.title}
                </button>
              ))}
            </div>

            {/* Paneles de contenido por pestaña */}
            <div className="mt-4">
              {/* Panel AIA‑Lite */}
              {activeTool === "aia" && (
                <div id="panel-aia" role="tabpanel" className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">AIA‑Lite — Evaluación rápida</h3>
                  <p className="text-sm text-neutral-700 mt-1">Completá los campos y obtené un resumen de riesgos y recomendaciones. (Demo sin backend)</p>
                  <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="text-sm font-medium">Propósito y beneficio esperado</label>
                      <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={3} placeholder="¿Qué problema resuelve? ¿Para quién?" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Población afectada</label>
                      <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="Estudiantes, pacientes, solicitantes, etc." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Datos y variables (incl. sensibles)</label>
                      <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={3} placeholder="Fuentes, calidad, sesgos conocidos" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Riesgos y no‑usos</label>
                      <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={3} placeholder="Qué podría salir mal y qué usos prohibís" />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button variant="secondary">Generar resumen (placeholder)</Button>
                      <Button variant="ghost">Ver guía AIA</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Panel Datasheets / Model Cards */}
              {activeTool === "datasheets" && (
                <div id="panel-datasheets" role="tabpanel" className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">Datasheets & Model Cards</h3>
                  <p className="text-sm text-neutral-700 mt-1">Plantilla básica para documentar datasets y modelos. (Demo sin backend)</p>
                  <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="text-sm font-medium">Nombre del dataset/modelo</label>
                      <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="p.ej., admisiones_educación_2023" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Propietario / contacto</label>
                      <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="equipo@organización.org" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Procedencia y licencia</label>
                      <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="fuentes, licencia, restricciones" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cobertura (tiempo/territorio)</label>
                      <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="2018–2024, AMBA, etc." />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Variables sensibles y limitaciones</label>
                      <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={3} placeholder="p.ej., sexo, raza/etnia, discapacidad; sesgos conocidos" />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button variant="secondary">Generar vista previa (placeholder)</Button>
                      <Button variant="ghost">Ver ejemplo</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Panel Laboratorio de Métricas */}
              {activeTool === "metrics" && (
                <div id="panel-metrics" role="tabpanel" className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">Laboratorio de Métricas</h3>
                  <p className="text-sm text-neutral-700 mt-1">Explorá diferencias por grupo en paridad (rate), oportunidad (TPR) y odds (FPR).</p>
                  <div className="mt-4"><MetricsDemo /></div>
                </div>
              )}

              {/* Panel Kit de Políticas */}
              {activeTool === "policy" && (
                <div id="panel-policy" role="tabpanel" className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">Kit de Políticas</h3>
                  <p className="text-sm text-neutral-700 mt-1">Checklist y plantillas para institucionalizar buenas prácticas.</p>
                  <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Política de IA responsable (versión pública)</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Checklist de evaluación de proveedores/terceros</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Cláusulas contractuales sobre datos y auditoría</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Proceso de monitoreo, KPIs y canal de reclamos</label>
                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary">Descargar ZIP (placeholder)</Button>
                      <Button variant="ghost">Ver guía</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Demo de métricas (acceso directo) */}
        <section id="metrics" className="py-8 sm:py-12">
          <MetricsDemo />
        </section>

        {/* Casos */}
        <section id="casos" className="py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">Casos y aprendizajes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseStudies.map((c) => (
              <Card key={c.sector} title={`${c.sector}`}>
                <p className="text-neutral-700"><span className="font-medium">Hallazgo:</span> {c.summary}</p>
                <p className="mt-2 text-neutral-700"><span className="font-medium">Lección:</span> {c.lesson}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Formación */}
        <section id="formacion" className="py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Formación (micro‑lecciones)" desc="Videos cortos y guías para docentes/gestores.">
              <ul className="list-disc pl-5 space-y-2">
                <li>Sesgo 101: conceptos CTS y ciclo socio‑técnico.</li>
                <li>Métricas de equidad: cuándo elegir cada una.</li>
                <li>Datasheets y Model Cards: paso a paso.</li>
                <li>Gobernanza: monitoreo, reclamos y auditorías.</li>
              </ul>
            </Card>
            <Card title="Glosario esencial" desc="Términos clave para la clase y la práctica.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">AIA/FRIA</div>
                  <div className="text-neutral-700">Evaluación de impacto en derechos y riesgos.</div>
                </div>
                <div>
                  <div className="font-medium">Model Card / Datasheet</div>
                  <div className="text-neutral-700">Documentos estandarizados de desempeño y origen.</div>
                </div>
                <div>
                  <div className="font-medium">Paridad / Opportunity / Odds</div>
                  <div className="text-neutral-700">Nociones de equidad con trade‑offs inevitables.</div>
                </div>
                <div>
                  <div className="font-medium">Proxy</div>
                  <div className="text-neutral-700">Variable sustitutiva que puede distorsionar el objetivo.</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Transparencia */}
        <section id="transparencia" className="py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card title="Metodología" desc="Qué medimos, por qué y cómo lo comunicamos.">
              <p>Publicamos criterios, datasets de prueba y límites conocidos. Changelog visible y versionado.</p>
            </Card>
            <Card title="Auditorías" desc="Controles internos y externos periódicos.">
              <p>Informe anual de equidad y robustez; canal de seguimiento abierto.</p>
            </Card>
            <Card title="KPI públicos" desc="Indicadores para rendición de cuentas.">
              <ul className="list-disc pl-5 space-y-2">
                <li>% de proyectos con AIA‑Lite y model card publicada.</li>
                <li>Tiempo de respuesta a reclamos.</li>
                <li>Reducción de disparidades de error a 6 meses.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Reportar */}
        <section id="reportar" className="py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Ventanilla Ciudadana" desc="Reportá una decisión algorítmica dañina o injusta.">
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-sm font-medium">Correo de contacto</label>
                  <input className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" type="email" placeholder="tu@correo.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción breve</label>
                  <textarea className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" rows={4} placeholder="Contanos qué pasó y dónde" required />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary">Enviar reporte</Button>
                  <Button variant="ghost">Ver guía de derechos</Button>
                </div>
              </form>
            </Card>
            <Card title="Privacidad y derechos" desc="Cómo protegemos tu información.">
              <p className="text-sm text-neutral-700">Solo usamos tus datos para responder y derivar. Podés solicitar acceso, corrección o eliminación en cualquier momento.</p>
              <div className="mt-3"><Tag>RGPD/AI Act</Tag> <Tag>Habeas data</Tag> <Tag>Transparencia</Tag></div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-neutral-600">© {new Date().getFullYear()} OKAS — Observatorio y Kit Anti‑Sesgo</div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button onClick={() => go("transparencia")} className="hover:underline">Metodología</button>
              <button onClick={() => go("herramientas")} className="hover:underline">Herramientas</button>
              <button onClick={() => go("reportar")} className="hover:underline">Reportar</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
