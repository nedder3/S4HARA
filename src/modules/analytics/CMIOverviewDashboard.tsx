import React, { useEffect, useMemo } from 'react';
import { useSAP } from '../../context/SAPContext';
import { calculateLogisticsKPIs } from '../../domain/services/kpiService';
import { Gauge, CheckCircle2, AlertTriangle, TrendingUp, RotateCcw, Truck } from 'lucide-react';

export const CMIOverviewDashboard: React.FC = () => {
  const { kpiBaseline, completeCaseStep, setActiveApp } = useSAP();

  useEffect(() => {
    completeCaseStep('CASE-DEVOLUCIONES', 3);
  }, []);

  const {
    exactitudPct: exactitud,
    salidasATiempoPct: salidasATiempo,
    otifPct: otif,
    utilizacionMuellePct: utilizacionMuelle,
    tasaDevolucionPct: tasaDevolucion,
    tasaRecuperacionPct: tasaRecuperacion
  } = useMemo(() => calculateLogisticsKPIs(kpiBaseline), [kpiBaseline]);

  const cards = [
    {
      title: 'Exactitud de Expedición',
      formula: 'Pedidos sin error / Pedidos despachados × 100',
      value: `${exactitud.toFixed(1)}%`,
      detail: `${kpiBaseline.errorFreeOrders} / ${kpiBaseline.dispatchedOrders} pedidos`,
      target: 'Meta ≥ 98.0%',
      ok: exactitud >= 98,
      action: 'Reforzar escaneo código de barras y verificación final antes de consolidación.'
    },
    {
      title: 'Salidas a Tiempo',
      formula: 'Salidas puntuales / Salidas programadas × 100',
      value: `${salidasATiempo.toFixed(1)}%`,
      detail: `${kpiBaseline.onTimeDepartures} / ${kpiBaseline.dispatchedOrders} salidas`,
      target: 'Meta ≥ 95.0%',
      ok: salidasATiempo >= 95,
      action: 'Reprogramar turnos de arribo y prevalidar remitos antes de la llegada del transporte.'
    },
    {
      title: 'OTIF (On-Time In-Full)',
      formula: 'Entregas completas y a tiempo / Entregas totales × 100',
      value: `${otif.toFixed(1)}%`,
      detail: `${kpiBaseline.otifDeliveries} / ${kpiBaseline.dispatchedOrders} entregas`,
      target: 'Meta ≥ 95.0%',
      ok: otif >= 95,
      action: 'OTIF mide la llegada efectiva al cliente, no solo la salida puntual del muelle.'
    },
    {
      title: 'Utilización de Muelles',
      formula: 'Tiempo ocupado / Tiempo disponible × 100',
      value: `${utilizacionMuelle.toFixed(1)}%`,
      detail: `${kpiBaseline.avgDockMinutesUsed} / ${kpiBaseline.avgDockMinutesAvailable} min/día`,
      target: 'Óptimo ≤ 80.0%',
      ok: utilizacionMuelle <= 80,
      action: 'Mantener margen ≥ 20% para absorber picos horarios y evitar colas de camiones.'
    },
    {
      title: 'Tasa de Devolución',
      formula: 'Unidades devueltas / Unidades entregadas × 100',
      value: `${tasaDevolucion.toFixed(2)}%`,
      detail: `${kpiBaseline.returnedUnits} / ${kpiBaseline.deliveredUnits} u.`,
      target: 'Meta ≤ 3.0%',
      ok: tasaDevolucion <= 3,
      action: 'Segmentar causas raíz (embalaje, error de picking, daño en transporte).'
    },
    {
      title: 'Tasa de Recuperación (Log. Inversa)',
      formula: 'Unidades recuperadas / Unidades devueltas × 100',
      value: `${tasaRecuperacion.toFixed(1)}%`,
      detail: `${kpiBaseline.recoveredUnits} / ${kpiBaseline.returnedUnits} u. recuperadas`,
      target: 'Meta ≥ 75.0%',
      ok: tasaRecuperacion >= 75,
      action: 'Acelerar clasificación en Almacén 0004 para maximizar valor recuperable.'
    }
  ];

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eaf7ee] text-[#107e3e] flex items-center justify-center">
            <Gauge className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Tablero Analítico CMI & OTIF (Fiori Overview Page)
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#eaf7ee] text-[#107e3e] border border-[#bce3c9] font-mono text-xs font-bold">
                CMI / OTIF
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Cuadro de Mando Integral Logístico — Actualizado en vivo con cada PGI (VL02N) y Devolución (MIGO 651)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveApp('VL01N')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#f0f4f9] text-[#1d2d3e] border border-[#d9e1e8] text-xs font-semibold"
          >
            <Truck className="w-4 h-4 text-[#e9730c]" />
            <span>Expedición (VL02N)</span>
          </button>
          <button
            onClick={() => setActiveApp('MIGO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Devoluciones (651)</span>
          </button>
        </div>
      </div>

      {/* 6 Analytical KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(c => (
          <div key={c.title} className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#1d2d3e]">{c.title}</h3>
                {c.ok ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf7ee] text-[#107e3e] border border-[#bce3c9]">
                    <CheckCircle2 className="w-3 h-3" /> En Meta
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3e6] text-[#9a4d06] border border-[#f5cfa3]">
                    <AlertTriangle className="w-3 h-3" /> Desvío
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold font-mono tabular-nums ${c.ok ? 'text-[#107e3e]' : 'text-[#e9730c]'}`}>
                  {c.value}
                </span>
                <span className="text-xs font-mono text-[#5b738b]">{c.target}</span>
              </div>

              <div className="mt-1 text-[11px] font-mono text-[#5b738b] tabular-nums">{c.detail}</div>
            </div>

            <div className="pt-3 border-t border-[#edf2f7] space-y-1.5">
              <div className="text-[10px] font-mono text-[#5b738b] bg-[#f5f6f7] px-2 py-1 rounded">
                Fórmula: {c.formula}
              </div>
              <p className="text-xs text-[#1d2d3e] leading-relaxed">{c.action}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Managerial Reading Matrix (UTN PL-IV Slide 22) */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0a6ed1]" />
          Lectura Gerencial — Matriz de Acciones Correctivas (SAP Logistics Analytics)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f6f7] text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                <th className="py-2.5 px-4">Problema Observado en Tablero</th>
                <th className="py-2.5 px-4">Decisión Operativa / SAP</th>
                <th className="py-2.5 px-4">Resultado Buscado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1d2d3e]">Errores de expedición ({kpiBaseline.dispatchedOrders - kpiBaseline.errorFreeOrders} pedidos)</td>
                <td className="py-3 px-4 text-[#5b738b]">Escaneo por código de barras y checklist obligatorio en VL02N</td>
                <td className="py-3 px-4 font-semibold text-[#107e3e]">Elevar Exactitud ≥ 98%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1d2d3e]">Salidas tardías ({kpiBaseline.dispatchedOrders - kpiBaseline.onTimeDepartures} salidas)</td>
                <td className="py-3 px-4 text-[#5b738b]">Reprogramar turnos de muelles y prevalidación documental antes de invertir en obra</td>
                <td className="py-3 px-4 font-semibold text-[#107e3e]">Menos colas en hora pico</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1d2d3e]">Devoluciones recurrentes ({kpiBaseline.returnedUnits} unidades)</td>
                <td className="py-3 px-4 text-[#5b738b]">Ingresar con MIGO 651 a Bloqueado, clasificar causas raíz y medir valor recuperable</td>
                <td className="py-3 px-4 font-semibold text-[#107e3e]">Reducir retornos evitables y sostener Recuperación ≥ 75%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
