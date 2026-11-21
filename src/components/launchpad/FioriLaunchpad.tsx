import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Boxes,
  ArrowDownToLine,
  ShoppingCart,
  Truck,
  Grid3X3,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Cpu,
  BarChart3,
  Gauge,
  GraduationCap,
  Calculator
} from 'lucide-react';

export const FioriLaunchpad: React.FC = () => {
  const {
    setActiveApp,
    stocks,
    materials,
    purchaseOrders,
    outboundDeliveries,
    returnOrders,
    kpiBaseline,
    caseStudies
  } = useSAP();

  const [activeTab, setActiveTab] = useState<'ALL' | 'MM' | 'PP' | 'SD' | 'EWM' | 'ANALYTICS'>('ALL');

  const totalStockUnits = stocks.reduce((acc, s) => acc + s.unrestricted + s.qualityInspection + s.blocked, 0);
  const totalBlockedUnits = stocks.reduce((acc, s) => acc + s.blocked, 0);
  const totalStockValuation = stocks.reduce((acc, s) => {
    const mat = materials.find(m => m.id === s.materialId);
    return acc + (s.unrestricted + s.qualityInspection + s.blocked) * (mat ? mat.basePrice : 0);
  }, 0);

  const pendingPOs = purchaseOrders.filter(p => p.status !== 'COMPLETADO').length;
  const pendingDeliveries = outboundDeliveries.filter(d => d.pgiStatus !== 'CONTABILIZADO').length;
  const pendingReturns = returnOrders.filter(r => r.disposition === 'PENDIENTE_INSPECCION').length;
  const otifPercent = ((kpiBaseline.otifDeliveries / kpiBaseline.dispatchedOrders) * 100).toFixed(1);
  const completedCasesCount = caseStudies.filter(c => c.isCompleted).length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6">
      {/* Hero Onboarding & Academy Entry (12-column Asymmetric Grid) */}
      <div className="sap-card rounded-2xl p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] text-[11px] font-mono font-semibold border border-[var(--sap-brand-border)]">
            <span>SAP S/4HANA Logistics Cloud · Fiori Launchpad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Simulador Modular SAP S/4HANA para Logística
          </h1>
          <p className="text-sm text-[var(--sap-text-muted)] leading-relaxed max-w-3xl">
            Entorno interactivo desacoplado por módulos estándar de SAP (<strong>MM, PP, SD/LE, EWM y Analytics</strong>). Si es tu primera vez en SAP, comenzá por la <strong>Academia SAP</strong> para aprender qué hace cada módulo antes de operar las transacciones.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveApp('ACADEMY')}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[var(--sap-brand)] hover:opacity-90 text-white text-xs sm:text-sm font-semibold transition-opacity shadow-xs"
            >
              <GraduationCap className="w-4 h-4" strokeWidth={2} />
              <span>Empezar por la Academia SAP</span>
            </button>
            <button
              onClick={() => setActiveApp('CASES')}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg sap-subtle hover:border-[var(--sap-brand)] text-xs sm:text-sm font-semibold transition-colors border"
            >
              <BookOpen className="w-4 h-4 text-[var(--sap-brand)]" strokeWidth={2} />
              <span>Escenarios Prácticos ({completedCasesCount}/{caseStudies.length})</span>
            </button>
          </div>
        </div>

        {/* Live System Status Summary */}
        <div className="lg:col-span-4 sap-subtle rounded-xl p-4 border space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[var(--sap-text-muted)] uppercase tracking-wider">
            <span>Centro 1010 · Resumen</span>
            <span className="text-[var(--sap-brand)]">S4P (100)</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="sap-card p-3 rounded-lg">
              <span className="text-[11px] text-[var(--sap-text-muted)] block">OTIF Mensual</span>
              <span className="text-lg font-bold text-[var(--sap-success)] tabular-nums font-mono">{otifPercent}%</span>
            </div>
            <div className="sap-card p-3 rounded-lg">
              <span className="text-[11px] text-[var(--sap-text-muted)] block">Stock Bloqueado</span>
              <span className="text-lg font-bold text-[var(--sap-error)] tabular-nums font-mono">{totalBlockedUnits} u.</span>
            </div>
            <div className="sap-card p-3 rounded-lg">
              <span className="text-[11px] text-[var(--sap-text-muted)] block">Devoluciones</span>
              <span className="text-lg font-bold text-[var(--sap-warning)] tabular-nums font-mono">{pendingReturns}</span>
            </div>
            <div className="sap-card p-3 rounded-lg">
              <span className="text-[11px] text-[var(--sap-text-muted)] block">Entregas sin PGI</span>
              <span className="text-lg font-bold text-[var(--sap-brand)] tabular-nums font-mono">{pendingDeliveries}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sap-card rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase tracking-wider">Inventario Valorizado</span>
            <Boxes className="w-4 h-4 text-[var(--sap-brand)]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5 text-2xl font-bold tabular-nums font-mono">
            ${totalStockValuation.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-[var(--sap-text-muted)] mt-1 tabular-nums">
            {totalStockUnits.toLocaleString('es-AR')} unidades en {materials.length} SKUs
          </div>
        </div>

        <div className="sap-card rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase tracking-wider">Aprovisionamiento (MM)</span>
            <ArrowDownToLine className="w-4 h-4 text-[var(--sap-success)]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5 text-2xl font-bold tabular-nums font-mono">
            {pendingPOs} <span className="text-xs font-normal text-[var(--sap-text-muted)]">OC abiertas</span>
          </div>
          <div className="text-xs text-[var(--sap-success)] mt-1 font-medium">Listas para entrada MIGO 101</div>
        </div>

        <div className="sap-card rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase tracking-wider">Expedición (SD / LE)</span>
            <Truck className="w-4 h-4 text-[var(--sap-warning-accent)]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5 text-2xl font-bold tabular-nums font-mono">
            {pendingDeliveries} <span className="text-xs font-normal text-[var(--sap-text-muted)]">entregas</span>
          </div>
          <div className="text-xs text-[var(--sap-warning)] mt-1 font-medium">Picking + 5 controles + PGI 601</div>
        </div>

        <div className="sap-card rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase tracking-wider">Logística Inversa</span>
            <AlertTriangle className="w-4 h-4 text-[var(--sap-error)]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5 text-2xl font-bold tabular-nums font-mono">
            {pendingReturns} <span className="text-xs font-normal text-[var(--sap-text-muted)]">pendiente insp.</span>
          </div>
          <div className="text-xs text-[var(--sap-text-muted)] mt-1">Recepción obligatoria a 0004 (Mov. 651)</div>
        </div>
      </div>

      {/* SAP Module Filter Tabs (Fitts's Law min-h 40px) */}
      <div className="flex items-center gap-1.5 border-b border-[var(--sap-border)] pb-2.5 overflow-x-auto" role="tablist">
        {[
          { id: 'ALL', label: 'Todos los Módulos' },
          { id: 'MM', label: 'SAP MM (Materiales & Compras)' },
          { id: 'PP', label: 'SAP PP (Planificación MRP)' },
          { id: 'SD', label: 'SAP SD/LE (Expedición)' },
          { id: 'EWM', label: 'SAP EWM (Almacén & Muelles)' },
          { id: 'ANALYTICS', label: 'SAP Analytics (CMI)' }
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 min-h-[40px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--sap-brand)] text-white shadow-xs'
                : 'text-[var(--sap-text-muted)] hover:bg-[var(--sap-surface)] hover:text-[var(--sap-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Launchpad Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* SAP Academy Tile */}
        {activeTab === 'ALL' && (
          <button
            onClick={() => setActiveApp('ACADEMY')}
            className="text-left group bg-[var(--sap-brand-soft)] rounded-xl p-5 border border-[var(--sap-brand-border)] hover:border-[var(--sap-brand)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand)] text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="px-2 py-0.5 rounded sap-card font-mono text-xs font-bold text-[var(--sap-brand)]">
                  ACADEMY
                </span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)] transition-colors">
                Academia SAP S/4HANA (Desde Cero)
              </h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Aprende qué es cada módulo (MM, PP, SD, EWM), la jerarquía organizativa, los circuitos P2P/O2C y el diccionario Logística → SAP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-brand-border)] flex items-center justify-between text-xs text-[var(--sap-brand)] font-semibold">
              <span className="font-mono">4 Lecciones Interactivas</span>
              <span className="flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* MM: MMBE */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <button
            onClick={() => setActiveApp('MMBE')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <Boxes className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">MMBE</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP MM · Resumen de Stocks</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Stock jerárquico por Centro, Almacén y Lote. Controla Libre Utilización, Inspección de Calidad y Bloqueado.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono tabular-nums">{materials.length} SKUs · {totalBlockedUnits} bloq.</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* MM: MIGO */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <button
            onClick={() => setActiveApp('MIGO')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-success-bg)] text-[var(--sap-success)] flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">MIGO</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP MM · Movimientos de Mercancías</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Entradas contra OC (101), Traspasos internos (311), Bloqueo preventivo (344) y Logística Inversa / Devoluciones (651).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono text-[var(--sap-success)] font-semibold">101 · 311 · 344 · 651</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* MM: ME21N */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <button
            onClick={() => setActiveApp('ME21N')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">ME21N</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP MM · Pedidos de Compra</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Emisión y seguimiento de Órdenes de Compra (PO) a proveedores con evaluación de confiabilidad y plazo de entrega.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono tabular-nums">{purchaseOrders.length} OC en sistema</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* MM: MC40 */}
        {(activeTab === 'ALL' || activeTab === 'MM' || activeTab === 'ANALYTICS') && (
          <button
            onClick={() => setActiveApp('MC40')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">MC40</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP MM · Análisis ABC / Pareto</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Segmentación dinámica A/B/C por Valor de Utilización, Valorizado de Inventario y Costo Unitario con diagrama SVG.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono">3 Criterios Pareto</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* PP: MD04 */}
        {(activeTab === 'ALL' || activeTab === 'PP') && (
          <button
            onClick={() => setActiveApp('MD04')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <Cpu className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">MD04 / CS03</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP PP · Monitor MRP & BOM</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Planificación semanal de requerimientos netos, políticas L4L / Lote Fijo / EOQ, desplazamiento Lead Time y explosión BOM.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono">Horizonte 6 semanas</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* SD/LE: VL02N */}
        {(activeTab === 'ALL' || activeTab === 'SD') && (
          <button
            onClick={() => setActiveApp('VL01N')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-warning-bg)] text-[var(--sap-warning-accent)] flex items-center justify-center">
                  <Truck className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">VL02N</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP SD/LE · Entregas Salientes & PGI</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Picking por lote, checklist obligatorio de 5 controles de expedición y Contabilización de Salida (PGI — Mov. 601).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono text-[var(--sap-warning)] font-semibold">{pendingDeliveries} entregas activas</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* EWM: Racks */}
        {(activeTab === 'ALL' || activeTab === 'EWM') && (
          <button
            onClick={() => setActiveApp('EWM_RACK')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">EWM BINS</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP EWM · Mapa de Ubicaciones</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Visor 2D de pasillos y racks (A, B, C), zonificación ABC y control de sobrecarga estructural en kg.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono">Zonas A / B / C</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* EWM: Dock Scheduling */}
        {(activeTab === 'ALL' || activeTab === 'EWM') && (
          <button
            onClick={() => setActiveApp('EWM_DOCK')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
                  <Calculator className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">EWM DOCK</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP EWM · Capacidad de Muelles</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Dimensionamiento de muelles compartidos vs. exclusivos, utilización efectiva y prevención de colas en hora pico.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono">Dock Scheduling</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}

        {/* Analytics: CMI */}
        {(activeTab === 'ALL' || activeTab === 'ANALYTICS') && (
          <button
            onClick={() => setActiveApp('CMI')}
            className="text-left group sap-card rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[var(--sap-brand)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--sap-success-bg)] text-[var(--sap-success)] flex items-center justify-center">
                  <Gauge className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded sap-subtle border font-mono text-xs font-bold">CMI / OTIF</span>
              </div>
              <h3 className="text-base font-bold group-hover:text-[var(--sap-brand)]">SAP Analytics · Tablero CMI & OTIF</h3>
              <p className="text-xs text-[var(--sap-text-muted)] mt-1 leading-relaxed">
                Indicadores gerenciales en vivo: Exactitud, Salidas a Tiempo, OTIF, Utilización de Muelle y Tasa de Recuperación.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--sap-border-light)] flex items-center justify-between text-xs text-[var(--sap-text-muted)]">
              <span className="font-mono text-[var(--sap-success)] font-semibold">OTIF: {otifPercent}%</span>
              <span className="text-[var(--sap-brand)] font-semibold flex items-center gap-1">Abrir <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
