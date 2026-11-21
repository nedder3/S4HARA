import React, { useState, useRef, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Layers,
  Boxes,
  Cpu,
  Truck,
  Grid3X3,
  Gauge,
  Search,
  BookOpen
} from 'lucide-react';

type LessonId = 1 | 2 | 3 | 4;

const ACADEMY_PROGRESS_KEY = 'S4HARA_ACADEMY_COMPLETED_V1';

const LOGISTICS_TO_SAP_GLOSSARY = [
  { concept: 'Stock disponible / Inventario físico', sapTerm: 'Stock de Libre Utilización', module: 'MM', tcode: 'MMBE', desc: 'Único stock habilitado para ventas, picking y consumo.' },
  { concept: 'Cuarentena / Inspección de lote', sapTerm: 'Stock en Control de Calidad (Q)', module: 'MM / QM', tcode: 'MMBE', desc: 'Mercadería recibida pendiente de aprobación técnica.' },
  { concept: 'Mercadería dañada o inundada', sapTerm: 'Stock Bloqueado (S) — Mov. 344', module: 'MM', tcode: 'MIGO', desc: 'Retira unidades de la disponibilidad comercial sin sacarlas del centro.' },
  { concept: 'Remito de proveedor / Recepción en muelle', sapTerm: 'Entrada de Mercancías (GR) — Mov. 101', module: 'MM', tcode: 'MIGO', desc: 'Registra el ingreso físico contra una Orden de Compra y emite Doc. de Material.' },
  { concept: 'Orden de Compra a proveedor', sapTerm: 'Pedido de Compra (PO)', module: 'MM', tcode: 'ME21N', desc: 'Documento comercial vinculante con precio, cantidad y plazo pactado.' },
  { concept: 'Traspaso entre depósitos internos', sapTerm: 'Traslado en 1 paso — Mov. 311', module: 'MM', tcode: 'MIGO', desc: 'Mueve inventario entre almacenes del mismo centro (ej. 0001 → 0002).' },
  { concept: 'Clasificación de Inventarios ABC (Pareto)', sapTerm: 'Análisis ABC de Consumo / Stock', module: 'MM', tcode: 'MC40', desc: 'Segmenta SKUs en clases A (80%), B (15%) y C (5%) para políticas de conteo.' },
  { concept: 'Explosión de materiales / Receta del producto', sapTerm: 'Lista de Materiales (BOM)', module: 'PP', tcode: 'CS03', desc: 'Estructura padre-hijo que define cuántos componentes lleva cada producto.' },
  { concept: 'Plan de necesidades semanales (MRP)', sapTerm: 'Lista de Necesidades / Stocks', module: 'PP', tcode: 'MD04', desc: 'Proyecta necesidades brutas, netas y liberación de órdenes según Lead Time.' },
  { concept: 'Preparación y despacho de camión', sapTerm: 'Entrega Saliente + Picking + PGI (Mov. 601)', module: 'SD / LE', tcode: 'VL02N', desc: 'PGI (Post Goods Issue) da de baja el stock físico y habilita la facturación.' },
  { concept: 'Logística Inversa / Devolución de cliente', sapTerm: 'Devolución a Stock Bloqueado — Mov. 651', module: 'MM / SD', tcode: 'MIGO', desc: 'Nunca ingresa directo a libre utilización; pasa a inspección en Almacén 0004.' },
  { concept: 'Racks, pasillos y ubicaciones exactas', sapTerm: 'Ubicaciones de Almacén (Storage Bins)', module: 'EWM', tcode: 'EWM', desc: 'Control espacial por pasillo, estantería, nivel y peso máximo en kg.' },
  { concept: 'Dimensionamiento y turnos de muelles', sapTerm: 'Dock Appointment Scheduling', module: 'EWM', tcode: 'MUELLES', desc: 'Calcula muelles compartidos vs. exclusivos y previene colas en hora pico.' },
  { concept: 'Tablero de gestión (OTIF, Exactitud, Recupero)', sapTerm: 'Fiori Analytical Overview Page (CMI)', module: 'Analytics', tcode: 'CMI', desc: 'Monitoreo gerencial de nivel de servicio, exactitud y tasa de devolución.' }
];

export const SAPAcademy: React.FC = () => {
  const { executeTCode, setActiveApp } = useSAP();
  const [activeLesson, setActiveLesson] = useState<LessonId>(1);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [completedLessons, setCompletedLessons] = useState<LessonId[]>(() => {
    try {
      const raw = window.localStorage.getItem(ACADEMY_PROGRESS_KEY);
      return raw ? (JSON.parse(raw) as LessonId[]) : [];
    } catch {
      return [];
    }
  });

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(completedLessons));
    } catch {
      // Ignore storage errors
    }
  }, [completedLessons]);

  // Programmatic Focus Management (WCAG 2.1 AA) on lesson change
  const goToLesson = (id: LessonId) => {
    setActiveLesson(id);
    setTimeout(() => headingRef.current?.focus(), 0);
  };

  const toggleLessonComplete = (id: LessonId) => {
    setCompletedLessons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const lessons: { id: LessonId; code: string; title: string; subtitle: string }[] = [
    { id: 1, code: '01', title: '¿Qué es SAP S/4HANA?', subtitle: 'ERP, Fiori, T-Codes y Jerarquía Organizativa' },
    { id: 2, code: '02', title: 'Mapa de Módulos Logísticos', subtitle: 'Qué hace MM, PP, SD/LE, EWM y Analytics' },
    { id: 3, code: '03', title: 'Circuitos Reales End-to-End', subtitle: 'P2P (Compras), MRP, O2C (Despacho) y Logística Inversa' },
    { id: 4, code: '04', title: 'Puente Logística → SAP', subtitle: 'Glosario interactivo con acceso directo a cada T-Code' }
  ];

  const filteredGlossary = LOGISTICS_TO_SAP_GLOSSARY.filter(item => {
    const q = glossaryQuery.toLowerCase();
    return (
      item.concept.toLowerCase().includes(q) ||
      item.sapTerm.toLowerCase().includes(q) ||
      item.tcode.toLowerCase().includes(q) ||
      item.module.toLowerCase().includes(q)
    );
  });

  const progressPct = Math.round((completedLessons.length / lessons.length) * 100);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6">
      {/* Academy Header & Goal-Gradient Progress Bar */}
      <div className="sap-card rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] border border-[var(--sap-brand-border)] text-xs font-mono font-bold">
            <GraduationCap className="w-4 h-4" strokeWidth={2} />
            <span>SAP LEARNING HUB · DESDE CERO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Academia SAP S/4HANA para Profesionales de Logística
          </h1>
          <p className="text-sm text-[var(--sap-text-muted)] leading-relaxed">
            Si nunca usaste SAP, empezá por acá. En 4 lecciones cortas vas a entender cómo se estructura el sistema, qué hace cada módulo y cómo se conectan los conceptos de logística con las pantallas reales.
          </p>
        </div>

        <div className="sap-subtle rounded-xl p-4 border min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--sap-text-muted)] font-semibold uppercase">Tu Progreso</span>
            <span className="font-bold text-[var(--sap-brand)] tabular-nums">
              {completedLessons.length}/{lessons.length} ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--sap-border)] overflow-hidden" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full bg-[var(--sap-brand)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <button
            onClick={() => setActiveApp('CASES')}
            className="w-full mt-1 py-2 min-h-[38px] rounded-lg bg-[var(--sap-brand)] hover:opacity-90 text-white text-xs font-semibold transition-opacity flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ir a Escenarios Prácticos</span>
          </button>
        </div>
      </div>

      {/* 12-Column Asymmetric Layout: Stepper Sidebar (4 cols) + Lesson Canvas (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Stepper Navigation */}
        <nav className="lg:col-span-4 sap-card rounded-xl p-4 shadow-xs space-y-2" aria-label="Lecciones de Academia SAP">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sap-text-muted)] px-2 block mb-2">
            Ruta de Aprendizaje (4 Módulos)
          </span>
          {lessons.map(l => {
            const isCurrent = activeLesson === l.id;
            const isDone = completedLessons.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => goToLesson(l.id)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`w-full text-left p-3.5 min-h-[56px] rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'bg-[var(--sap-brand-soft)] border-[var(--sap-brand)] ring-1 ring-[var(--sap-brand)]'
                    : 'bg-transparent border-[var(--sap-border-light)] hover:border-[var(--sap-brand-border)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-[var(--sap-success-bg)] text-[var(--sap-success)] border border-[var(--sap-success-border)]'
                        : isCurrent
                        ? 'bg-[var(--sap-brand)] text-white'
                        : 'sap-subtle text-[var(--sap-text-muted)] border'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : l.code}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{l.title}</div>
                    <div className="text-[11px] text-[var(--sap-text-muted)] mt-0.5">{l.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Lesson Content Canvas */}
        <article className="lg:col-span-8 sap-card rounded-xl p-6 shadow-xs space-y-6">
          {/* LESSON 1: SAP FUNDAMENTALS */}
          {activeLesson === 1 && (
            <div className="space-y-5">
              <div className="border-b border-[var(--sap-border-light)] pb-3">
                <span className="font-mono text-xs font-bold text-[var(--sap-brand)]">LECCIÓN 01</span>
                <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold mt-1 outline-none">
                  ¿Qué es SAP S/4HANA y cómo se organiza una empresa adentro?
                </h2>
              </div>

              <p className="text-sm text-[var(--sap-text-muted)] leading-relaxed">
                <strong>SAP S/4HANA</strong> es un sistema <strong>ERP</strong> (Enterprise Resource Planning): una única base de datos donde Compras, Depósito, Producción, Expedición y Finanzas trabajan sincronizados en tiempo real. Cuando recibís un camión en el depósito, el stock sube y Finanzas ya sabe que puede pagar la factura.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl sap-subtle border space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--sap-brand)]">SAP Fiori vs. T-Codes</h3>
                  <p className="text-xs text-[var(--sap-text-muted)] leading-relaxed">
                    Antes SAP se usaba en una pantalla gris de escritorio (<strong>SAP GUI</strong>) escribiendo códigos de 4 o 5 letras llamados <strong>T-Codes</strong> (ej. <code className="font-mono font-bold">MIGO</code>, <code className="font-mono font-bold">MMBE</code>). Hoy se usa la interfaz web moderna <strong>SAP Fiori</strong> (tarjetas/apps), pero en el día a día los jefes y compañeros siguen hablando por T-Codes. Por eso la barra superior de este simulador entiende ambos.
                  </p>
                </div>
                <div className="p-4 rounded-xl sap-subtle border space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--sap-brand)]">Documentos de Material</h3>
                  <p className="text-xs text-[var(--sap-text-muted)] leading-relaxed">
                    En SAP <strong>nunca</strong> se edita un número de stock a mano como en Excel. Todo cambio de inventario ocurre mediante una transacción que exige una <strong>Clase de Movimiento</strong> (ej. <code className="font-mono font-bold">101</code> entrada, <code className="font-mono font-bold">601</code> salida) y genera un comprobante inmutable llamado <strong>Documento de Material</strong> (ej. <code className="font-mono">5000001201</code>) para auditoría.
                  </p>
                </div>
              </div>

              {/* Organizational Hierarchy Visual */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--sap-brand)]" />
                  Jerarquía Organizativa en SAP (De lo general a lo físico)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    { lvl: '1. Mandante (Client)', ex: '100', desc: 'Entorno completo aislado (Desarrollo, Calidad o Producción).' },
                    { lvl: '2. Sociedad (Company)', ex: '1000', desc: 'Entidad legal con CUIT y balance contable propio.' },
                    { lvl: '3. Centro (Plant)', ex: '1010', desc: 'Planta industrial o Centro de Distribución físico.' },
                    { lvl: '4. Almacén (Storage Loc)', ex: '0001–0004', desc: 'Subdivisión lógica: General, Calidad, Expedición o Devoluciones.' },
                    { lvl: '5. Lote (Batch)', ex: 'LOT-TS-A1', desc: 'Partida trazable por fecha de fabricación o vencimiento.' },
                    { lvl: '6. Ubicación (Bin)', ex: 'A-01-01', desc: 'Coordenada exacta en EWM: Pasillo, Estantería y Nivel.' }
                  ].map(h => (
                    <div key={h.lvl} className="p-3.5 rounded-xl border border-[var(--sap-border)] bg-[var(--sap-surface)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{h.lvl}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] font-mono text-[10px] font-bold">
                          {h.ex}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--sap-text-muted)]">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LESSON 2: SAP LOGISTICS MODULES MAP */}
          {activeLesson === 2 && (
            <div className="space-y-5">
              <div className="border-b border-[var(--sap-border-light)] pb-3">
                <span className="font-mono text-xs font-bold text-[var(--sap-brand)]">LECCIÓN 02</span>
                <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold mt-1 outline-none">
                  ¿Qué es cada módulo logístico de SAP y quién lo usa?
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    code: 'MM',
                    name: 'Materials Management (Gestión de Materiales)',
                    icon: <Boxes className="w-5 h-5" />,
                    role: 'Analista de Compras, Recepción e Inventario',
                    desc: 'Controla todo el abastecimiento y el stock. Desde crear un Pedido de Compra al proveedor (ME21N), registrar la entrada del camión o bloqueos/devoluciones (MIGO), consultar saldos (MMBE) hasta segmentar por ABC (MC40).',
                    tcodes: ['MMBE', 'MIGO', 'ME21N', 'MC40']
                  },
                  {
                    code: 'PP',
                    name: 'Production Planning (Planificación y Control)',
                    icon: <Cpu className="w-5 h-5" />,
                    role: 'Analista de Planeamiento (MRP) y PCP',
                    desc: 'Responde qué comprar o fabricar, cuánto y cuándo. Usa la Lista de Materiales (CS03 / BOM) y el Monitor MRP (MD04) para calcular necesidades netas y disparar órdenes respetando el Lead Time y el stock de seguridad.',
                    tcodes: ['MD04', 'CS03']
                  },
                  {
                    code: 'SD / LE',
                    name: 'Sales & Distribution / Logistics Execution',
                    icon: <Truck className="w-5 h-5" />,
                    role: 'Coordinador de Expedición y Tráfico',
                    desc: 'Gestiona la salida hacia el cliente: convierte un Pedido de Venta en una Entrega Saliente (VL02N), controla el picking, verifica la carga y contabiliza la Salida de Mercancías (PGI — Mov. 601) para emitir remito y habilitar factura.',
                    tcodes: ['VL02N']
                  },
                  {
                    code: 'EWM',
                    name: 'Extended Warehouse Management (Almacenes Avanzados)',
                    icon: <Grid3X3 className="w-5 h-5" />,
                    role: 'Supervisor de Depósito y Patio de Muelles',
                    desc: 'Mientras MM sabe cuánto stock hay en el Almacén 0001, EWM sabe exactamente en qué pasillo, rack y nivel (Bin A-01-01) está cada pallet, controla límites de peso y programa los turnos y capacidad de los muelles.',
                    tcodes: ['EWM', 'MUELLES']
                  },
                  {
                    code: 'Analytics',
                    name: 'SAP Fiori Overview / Control de Gestión (CMI)',
                    icon: <Gauge className="w-5 h-5" />,
                    role: 'Jefe de Logística / Gerencia de Operaciones',
                    desc: 'Consolida indicadores en tiempo real (OTIF, Exactitud de expedición, Utilización de muelles, Tasa de devolución y Tasa de recuperación) para tomar decisiones correctivas.',
                    tcodes: ['CMI']
                  }
                ].map(mod => (
                  <div key={mod.code} className="p-4 rounded-xl sap-subtle border flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center shrink-0">
                        {mod.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[var(--sap-brand)] text-white font-mono text-xs font-bold">
                            SAP {mod.code}
                          </span>
                          <h3 className="text-sm font-bold">{mod.name}</h3>
                        </div>
                        <div className="text-[11px] font-semibold text-[var(--sap-brand)]">Puesto típico: {mod.role}</div>
                        <p className="text-xs text-[var(--sap-text-muted)] leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {mod.tcodes.map(tc => (
                        <button
                          key={tc}
                          onClick={() => executeTCode(tc)}
                          className="px-2.5 py-1.5 min-h-[34px] rounded-md bg-[var(--sap-surface)] hover:bg-[var(--sap-brand)] hover:text-white border border-[var(--sap-border)] font-mono text-xs font-bold transition-colors flex items-center gap-1"
                          title={`Probar transacción ${tc}`}
                        >
                          <span>{tc}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LESSON 3: END-TO-END FLOWS */}
          {activeLesson === 3 && (
            <div className="space-y-5">
              <div className="border-b border-[var(--sap-border-light)] pb-3">
                <span className="font-mono text-xs font-bold text-[var(--sap-brand)]">LECCIÓN 03</span>
                <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold mt-1 outline-none">
                  Cómo se conectan los módulos: los 4 circuitos clave
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                {[
                  {
                    title: '1. Procure-to-Pay (P2P — Circuito de Compras e Ingreso)',
                    steps: ['Necesidad (MD04)', 'Pedido de Compra (ME21N)', 'Recepción Camión (MIGO 101)', 'Stock Disponible (MMBE)'],
                    note: 'Al contabilizar MIGO 101, SAP aumenta el stock de Libre Utilización, actualiza la OC y emite un Documento de Material 500000xxxx.'
                  },
                  {
                    title: '2. Plan-to-Produce (MRP & Explosión BOM)',
                    steps: ['Stock Real (MMBE)', 'Demanda Semanal (MD04)', 'Cálculo Necesidades Netas', 'Explosión Componentes (CS03)'],
                    note: 'Si el inventario físico cae por debajo del stock de seguridad, MD04 adelanta la liberación de órdenes según el Lead Time.'
                  },
                  {
                    title: '3. Order-to-Cash (O2C — Expedición y Despacho a Clientes)',
                    steps: ['Entrega Saliente (VL02N)', 'Picking + 5 Controles', 'PGI Salida (Mov. 601)', 'Impacto en OTIF (CMI)'],
                    note: 'SAP bloquea el PGI si el picking no está al 100% o faltan controles de carga, protegiendo la exactitud del despacho.'
                  },
                  {
                    title: '4. Logística Inversa y Contingencias de Inventario',
                    steps: ['Retorno Cliente (MIGO 651)', 'Almacén 0004 Bloqueado', 'Inspección Técnica', 'Recupero a 0001 o Descarte'],
                    note: 'Ante siniestros en depósito se usa MIGO 344 (Libre → Bloqueado); ante devoluciones de clientes se usa MIGO 651 (siempre a Bloqueado primero).'
                  }
                ].map(flow => (
                  <div key={flow.title} className="p-4 rounded-xl sap-subtle border space-y-2.5">
                    <h3 className="text-sm font-bold">{flow.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {flow.steps.map((st, i) => (
                        <React.Fragment key={st}>
                          <span className="px-2.5 py-1.5 rounded-lg bg-[var(--sap-surface)] border border-[var(--sap-border)] font-mono font-semibold text-[11px]">
                            {st}
                          </span>
                          {i < flow.steps.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--sap-brand)] shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--sap-text-muted)] leading-relaxed">{flow.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LESSON 4: INTERACTIVE GLOSSARY */}
          {activeLesson === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[var(--sap-border-light)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--sap-brand)]">LECCIÓN 04</span>
                  <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold mt-1 outline-none">
                    Diccionario Interactivo: Concepto Logístico → SAP S/4HANA
                  </h2>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sap-text-muted)]" />
                  <input
                    type="text"
                    value={glossaryQuery}
                    onChange={e => setGlossaryQuery(e.target.value)}
                    placeholder="Filtrar (ej. MRP, ABC, 601, remito)..."
                    aria-label="Filtrar glosario logístico"
                    className="sap-input w-full text-xs pl-8 pr-3 py-2 min-h-[38px] rounded-lg"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--sap-border)]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="sap-subtle text-[var(--sap-text-muted)] font-semibold border-b border-[var(--sap-border)]">
                      <th className="py-2.5 px-3.5">Concepto de Logística</th>
                      <th className="py-2.5 px-3.5">Nombre en SAP</th>
                      <th className="py-2.5 px-3 font-mono">Módulo</th>
                      <th className="py-2.5 px-3.5 text-right font-mono">Practicar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--sap-border-light)]">
                    {filteredGlossary.map(row => (
                      <tr key={row.concept} className="hover:bg-[var(--sap-brand-soft)]/50 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-semibold">{row.concept}</div>
                          <div className="text-[11px] text-[var(--sap-text-muted)] mt-0.5">{row.desc}</div>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-[var(--sap-brand)]">{row.sapTerm}</td>
                        <td className="py-3 px-3 font-mono text-[11px]">{row.module}</td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            onClick={() => executeTCode(row.tcode)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--sap-brand-soft)] hover:bg-[var(--sap-brand)] text-[var(--sap-brand)] hover:text-white border border-[var(--sap-brand-border)] font-mono text-[11px] font-bold transition-colors"
                          >
                            <span>{row.tcode}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lesson Footer Controls (Fitts's Law & Goal-Gradient) */}
          <div className="pt-4 border-t border-[var(--sap-border-light)] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => toggleLessonComplete(activeLesson)}
              className={`px-4 py-2.5 min-h-[42px] rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                completedLessons.includes(activeLesson)
                  ? 'bg-[var(--sap-success-bg)] text-[var(--sap-success)] border-[var(--sap-success-border)]'
                  : 'sap-subtle text-[var(--sap-text)] hover:border-[var(--sap-brand)]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completedLessons.includes(activeLesson)
                  ? 'Lección completada'
                  : 'Marcar lección como comprendida'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              {activeLesson < 4 ? (
                <button
                  onClick={() => {
                    if (!completedLessons.includes(activeLesson)) toggleLessonComplete(activeLesson);
                    goToLesson((activeLesson + 1) as LessonId);
                  }}
                  className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[var(--sap-brand)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Siguiente Lección</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveApp('CASES')}
                  className="px-4 py-2.5 min-h-[42px] rounded-lg bg-[var(--sap-success)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Ir a Practicar Escenarios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
