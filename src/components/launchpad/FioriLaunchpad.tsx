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
  Gauge
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

  const [activeTab, setActiveTab] = useState<'ALL' | 'MM' | 'PP' | 'SD' | 'ANALYTICS' | 'CASES'>('ALL');

  // Live KPIs
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
      {/* SAP Fiori Morning Horizon Hero Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#d9e1e8] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#f0f4f9] text-[#0a6ed1] text-[11px] font-mono font-semibold border border-[#c2dcf7]">
            <span>SAP S/4HANA Logistics Cloud · Currícula UTN FRBB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d2d3e]">
            Entorno de Práctica Profesional — Licenciatura en Logística
          </h1>
          <p className="text-sm text-[#5b738b] leading-relaxed max-w-3xl">
            Conecta los contenidos de tu carrera (*MRP y BOM, Análisis ABC, Expedición, Dimensionamiento de Muelles, Logística Inversa y CMI/OTIF*) con las transacciones reales de **SAP S/4HANA** mediante casos prácticos integradores.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveApp('CASES')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" strokeWidth={2} />
              <span>Misiones UTN-to-SAP ({completedCasesCount}/{caseStudies.length})</span>
            </button>
            <button
              onClick={() => setActiveApp('CMI')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#f0f4f9] text-[#1d2d3e] text-xs sm:text-sm font-semibold transition-colors border border-[#d9e1e8]"
            >
              <Gauge className="w-4 h-4 text-[#0a6ed1]" strokeWidth={2} />
              <span>Tablero CMI / OTIF</span>
            </button>
          </div>
        </div>

        {/* Right Asymmetric Quick Summary Panel */}
        <div className="lg:col-span-4 bg-[#f5f6f7] rounded-xl p-4 border border-[#d9e1e8] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#5b738b] uppercase tracking-wider">
            <span>Estado Operativo Centro 1010</span>
            <span className="text-[#0a6ed1]">LIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded-lg border border-[#d9e1e8]">
              <span className="text-[11px] text-[#5b738b] block">OTIF Mensual</span>
              <span className="text-lg font-bold text-[#107e3e] tabular-nums font-mono">{otifPercent}%</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#d9e1e8]">
              <span className="text-[11px] text-[#5b738b] block">Stock Bloqueado</span>
              <span className="text-lg font-bold text-[#bb0000] tabular-nums font-mono">{totalBlockedUnits} u.</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#d9e1e8]">
              <span className="text-[11px] text-[#5b738b] block">Devoluciones Pend.</span>
              <span className="text-lg font-bold text-[#e9730c] tabular-nums font-mono">{pendingReturns}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#d9e1e8]">
              <span className="text-[11px] text-[#5b738b] block">Entregas sin PGI</span>
              <span className="text-lg font-bold text-[#0a6ed1] tabular-nums font-mono">{pendingDeliveries}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider">Inventario Valorizado</span>
            <Boxes className="w-4 h-4 text-[#0a6ed1]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#1d2d3e] tabular-nums font-mono">
              ${totalStockValuation.toLocaleString('es-AR')}
            </div>
            <div className="text-xs text-[#5b738b] mt-1 tabular-nums">
              {totalStockUnits.toLocaleString('es-AR')} unidades en {materials.length} SKUs
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider">Abastecimiento (P2/P3)</span>
            <ArrowDownToLine className="w-4 h-4 text-[#107e3e]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#1d2d3e] tabular-nums font-mono">
              {pendingPOs} <span className="text-xs font-normal text-[#5b738b]">OC abiertas</span>
            </div>
            <div className="text-xs text-[#107e3e] mt-1 font-medium">
              Listas para recepción física (MIGO 101)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider">Expedición & Muelles</span>
            <Truck className="w-4 h-4 text-[#e9730c]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#1d2d3e] tabular-nums font-mono">
              {pendingDeliveries} <span className="text-xs font-normal text-[#5b738b]">entregas</span>
            </div>
            <div className="text-xs text-[#e9730c] mt-1 font-medium">
              Verificación 6 pasos + PGI (Mov. 601)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider">Logística Inversa</span>
            <AlertTriangle className="w-4 h-4 text-[#bb0000]" strokeWidth={1.8} />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#1d2d3e] tabular-nums font-mono">
              {pendingReturns} <span className="text-xs font-normal text-[#5b738b]">pendiente insp.</span>
            </div>
            <div className="text-xs text-[#5b738b] mt-1">
              Ingreso obligatorio a Bloqueado (Mov. 651)
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#d9e1e8] pb-2.5 overflow-x-auto" role="tablist">
        {[
          { id: 'ALL', label: 'Todas las Aplicaciones (9)' },
          { id: 'MM', label: 'Inventario, Compras & Log. Inversa (MM)' },
          { id: 'PP', label: 'Planificación MRP & BOM (PP)' },
          { id: 'SD', label: 'Expedición, Muelles & Racks (SD / EWM)' },
          { id: 'ANALYTICS', label: 'ABC & Tablero CMI / OTIF' },
          { id: 'CASES', label: 'Casos Integradores UTN' }
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0a6ed1] text-white shadow-xs'
                : 'text-[#5b738b] hover:bg-white hover:text-[#1d2d3e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fiori Horizon Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. MMBE */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('MMBE')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <Boxes className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  MMBE
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Resumen de Stocks & Indicador ABC
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Stock jerárquico por Centro, Almacén (0001–0004) y Lote. Controla Libre Utilización, Inspección de Calidad y Bloqueado.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono tabular-nums">{materials.length} SKUs · {totalBlockedUnits} bloq.</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 2. MIGO */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('MIGO')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#eaf7ee] text-[#107e3e] flex items-center justify-center group-hover:bg-[#107e3e] group-hover:text-white transition-colors">
                  <ArrowDownToLine className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  MIGO
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#107e3e] transition-colors">
                Movimientos & Logística Inversa
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Entradas OC (101), Traspasos internos (311), Bloqueo preventivo ante siniestros (344) y Devoluciones de clientes (651) con inspección.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono text-[#107e3e] font-semibold">101 · 311 · 344 · 651</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 3. MD04 MRP & BOM */}
        {(activeTab === 'ALL' || activeTab === 'PP') && (
          <div
            onClick={() => setActiveApp('MD04')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <Cpu className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  MD04 / CS03
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Monitor MRP & Explosión BOM
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Proyección semanal de necesidades brutas, recepciones programadas, disponibilidad, necesidades netas y liberación de órdenes según Lead Time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono">Planificación y Control UTN</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 4. MC40 ABC Pareto */}
        {(activeTab === 'ALL' || activeTab === 'ANALYTICS' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('MC40')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  MC40
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Análisis de Inventarios ABC / Pareto
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Clasificación dinámica A/B/C por Valor de Utilización, Valorizado de Inventario y Costo Unitario con curva de Pareto interactiva.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono">Abastecimiento I — TP2</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 5. VL02N Expedición & Muelles */}
        {(activeTab === 'ALL' || activeTab === 'SD') && (
          <div
            onClick={() => setActiveApp('VL01N')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#fef3e6] text-[#e9730c] flex items-center justify-center group-hover:bg-[#e9730c] group-hover:text-white transition-colors">
                  <Truck className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  VL02N / DOCK
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#e9730c] transition-colors">
                Expedición (PGI 601) & Muelles
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Picking, checklist de 5 controles de expedición, PGI (601) y calculadora de dimensionamiento de muelles compartidos vs exclusivos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono text-[#e9730c] font-semibold">{pendingDeliveries} entregas activas</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 6. CMI / OTIF Overview Page */}
        {(activeTab === 'ALL' || activeTab === 'ANALYTICS') && (
          <div
            onClick={() => setActiveApp('CMI')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#eaf7ee] text-[#107e3e] flex items-center justify-center group-hover:bg-[#107e3e] group-hover:text-white transition-colors">
                  <Gauge className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  CMI / OTIF
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#107e3e] transition-colors">
                Tablero Analítico CMI & OTIF
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Indicadores de expedición y devoluciones en tiempo real: Exactitud, Salidas a tiempo, OTIF, Utilización de Muelle y Tasa de Recuperación.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono font-semibold text-[#107e3e]">OTIF: {otifPercent}%</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 7. ME21N Purchase Orders */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('ME21N')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  ME21N
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Compras & Evaluación Proveedores
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Creación y seguimiento de Órdenes de Compra (P2 parcial 72h vs P3 emergencia 30h) con confiabilidad, precio y Lead Time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono tabular-nums">{purchaseOrders.length} OC registradas</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 8. EWM Racks */}
        {(activeTab === 'ALL' || activeTab === 'SD') && (
          <div
            onClick={() => setActiveApp('EWM_RACK')}
            className="group bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <Grid3X3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] font-mono text-xs font-bold text-[#1d2d3e]">
                  EWM BINS
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Mapa de Almacén & Ubicaciones 2D
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Zonificación ABC por pasillos (A, B, C), control de carga máxima estructural en kg y trazabilidad por lote.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#edf2f7] flex items-center justify-between text-xs text-[#5b738b]">
              <span className="font-mono">Zonas A / B / C</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* 9. UTN Case Studies */}
        {(activeTab === 'ALL' || activeTab === 'CASES') && (
          <div
            onClick={() => setActiveApp('CASES')}
            className="group bg-[#f0f4f9] rounded-xl p-5 border border-[#b3d4f7] shadow-xs hover:shadow-md hover:border-[#0a6ed1] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#0a6ed1] text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="px-2 py-0.5 rounded bg-white border border-[#b3d4f7] font-mono text-xs font-bold text-[#0a6ed1]">
                  UTN CASES
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d2d3e] group-hover:text-[#0a6ed1] transition-colors">
                Casos Integradores UTN-to-SAP
              </h3>
              <p className="text-xs text-[#5b738b] mt-1 leading-relaxed">
                Resuelve la Crisis TecnoSur, la Devolución de Motores de Metalúrgica del Sur, MRP y ABC con preguntas reales de entrevistas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#d1e4f8] flex items-center justify-between text-xs text-[#0a6ed1]">
              <span className="font-mono font-bold tabular-nums">{completedCasesCount}/{caseStudies.length} resueltos</span>
              <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Comenzar <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
