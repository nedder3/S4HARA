import React, { useState, useMemo, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import { ABCCriterion, calculateABCAnalysis } from '../../domain/services/abcService';
import { BarChart3, Layers, Info } from 'lucide-react';

export const MC40ABCAnalysis: React.FC = () => {
  const { materials, stocks, completeCaseStep } = useSAP();
  const [criterion, setCriterion] = useState<ABCCriterion>('UTILIZATION');

  useEffect(() => {
    if (criterion === 'INVENTORY_VALUE') {
      completeCaseStep('CASE-ABC', 1);
    }
  }, [criterion]);

  // O(S + M log M) pure domain service
  const { items: rankedItems, classCounts, maxMetricValue: maxMetric } = useMemo(
    () => calculateABCAnalysis(materials, stocks, criterion),
    [materials, stocks, criterion]
  );

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Análisis de Inventarios ABC / Curva de Pareto
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#f0f4f9] text-[#0a6ed1] border border-[#c2dcf7] font-mono text-xs font-bold">
                MC40
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Clasificación de inventarios ABC (Ley de Pareto 80/20) comparando los 3 criterios estándar de segmentación
            </p>
          </div>
        </div>

        {/* 3 Criteria Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f5f6f7] rounded-lg border border-[#d9e1e8]">
          {[
            { id: 'UTILIZATION' as ABCCriterion, label: '1. Valor de Utilización' },
            { id: 'INVENTORY_VALUE' as ABCCriterion, label: '2. Valorizado Inventario' },
            { id: 'UNIT_COST' as ABCCriterion, label: '3. Costo Unitario' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setCriterion(opt.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                criterion === opt.id
                  ? 'bg-white text-[#0a6ed1] shadow-xs border border-[#d9e1e8]'
                  : 'text-[#5b738b] hover:text-[#1d2d3e]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary & Pareto SVG Chart (12-col Asymmetric Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SVG Pareto Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
              Diagrama de Pareto Dinámico (Barras = Valor · Curva = % Acumulado)
            </h3>
            <span className="text-[11px] font-mono text-[#5b738b]">Umbral Clase A: 80%</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 680 240" className="w-full h-56" role="img" aria-label="Gráfico de Pareto ABC">
              {/* 80% threshold dashed line */}
              <line x1="40" y1="56" x2="650" y2="56" stroke="#bb0000" strokeWidth="1" strokeDasharray="4 4" />
              <text x="652" y="60" fontSize="10" fill="#bb0000" fontFamily="monospace">80%</text>

              {/* Baseline */}
              <line x1="40" y1="200" x2="650" y2="200" stroke="#d9e1e8" strokeWidth="1" />

              {/* Bars */}
              {rankedItems.map((item, idx) => {
                const slotWidth = 600 / rankedItems.length;
                const barWidth = Math.min(48, slotWidth * 0.6);
                const x = 45 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const barHeight = (item.metricValue / maxMetric) * 160;
                const y = 200 - barHeight;
                const fill =
                  item.computedClass === 'A'
                    ? '#0a6ed1'
                    : item.computedClass === 'B'
                    ? '#e9730c'
                    : '#94a3b8';

                return (
                  <g key={item.material.id}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={fill} opacity="0.88" />
                    <text
                      x={x + barWidth / 2}
                      y="216"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#5b738b"
                      fontFamily="monospace"
                    >
                      {item.material.id}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y="230"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={fill}
                      fontFamily="monospace"
                    >
                      {item.computedClass}
                    </text>
                  </g>
                );
              })}

              {/* Cumulative % Polyline */}
              <polyline
                fill="none"
                stroke="#1d2d3e"
                strokeWidth="2.2"
                points={rankedItems
                  .map((item, idx) => {
                    const slotWidth = 600 / rankedItems.length;
                    const cx = 45 + idx * slotWidth + slotWidth / 2;
                    const cy = 200 - (item.cumPct / 100) * 180;
                    return `${cx},${cy}`;
                  })
                  .join(' ')}
              />

              {/* Cumulative Dots */}
              {rankedItems.map((item, idx) => {
                const slotWidth = 600 / rankedItems.length;
                const cx = 45 + idx * slotWidth + slotWidth / 2;
                const cy = 200 - (item.cumPct / 100) * 180;
                return (
                  <g key={`dot-${item.material.id}`}>
                    <circle cx={cx} cy={cy} r="3.5" fill="#ffffff" stroke="#1d2d3e" strokeWidth="2" />
                    <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="#1d2d3e" fontFamily="monospace">
                      {item.cumPct.toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Policy Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0a6ed1]" />
              Política de Control SAP por Clase
            </h3>

            <div className="p-3 rounded-lg bg-[#f0f4f9] border border-[#c2dcf7] text-xs">
              <div className="flex justify-between font-bold text-[#0a6ed1]">
                <span>Clase A (Críticos · 0–80%)</span>
                <span className="font-mono">{classCounts.A} SKUs</span>
              </div>
              <p className="text-[11px] text-[#5b738b] mt-1">
                Conteo cíclico mensual, stock de seguridad ajustado, ubicación Zona A cercana a muelles.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#fef3e6] border border-[#f5cfa3] text-xs">
              <div className="flex justify-between font-bold text-[#9a4d06]">
                <span>Clase B (Intermedios · 80–95%)</span>
                <span className="font-mono">{classCounts.B} SKUs</span>
              </div>
              <p className="text-[11px] text-[#5b738b] mt-1">
                Conteo trimestral, reposición por punto de pedido (MRP tipo VB) o lote económico EOQ.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#f5f6f7] border border-[#d9e1e8] text-xs">
              <div className="flex justify-between font-bold text-[#1d2d3e]">
                <span>Clase C (Bajo impacto · 95–100%)</span>
                <span className="font-mono">{classCounts.C} SKUs</span>
              </div>
              <p className="text-[11px] text-[#5b738b] mt-1">
                Conteo semestral/anual, pedidos de mayor volumen con menor frecuencia administrativa.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#5b738b] flex items-start gap-2 pt-2 border-t border-[#edf2f7]">
            <Info className="w-4 h-4 text-[#0a6ed1] shrink-0 mt-0.5" />
            <span>
              Observa cómo un mismo artículo cambia de clase si clasificas por <strong>Costo Unitario</strong> vs <strong>Valor de Utilización</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Detailed ABC Table */}
      <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f6f7] text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                <th className="py-2.5 px-4 font-mono">SKU</th>
                <th className="py-2.5 px-4">Descripción</th>
                <th className="py-2.5 px-3 text-right font-mono">Consumo/Mes</th>
                <th className="py-2.5 px-3 text-right font-mono">Stock Actual</th>
                <th className="py-2.5 px-3 text-right font-mono">Precio Unit.</th>
                <th className="py-2.5 px-3 text-right font-mono text-[#0a6ed1]">Valor Criterio</th>
                <th className="py-2.5 px-3 text-right font-mono">Frec. Relativa</th>
                <th className="py-2.5 px-3 text-right font-mono">Frec. Acumulada</th>
                <th className="py-2.5 px-4 text-center font-mono">Clase ABC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] tabular-nums font-mono">
              {rankedItems.map(r => (
                <tr key={r.material.id} className="hover:bg-[#f0f4f9]/40">
                  <td className="py-3 px-4 font-bold text-[#1d2d3e]">{r.material.id}</td>
                  <td className="py-3 px-4 font-sans font-medium text-[#1d2d3e]">{r.material.name}</td>
                  <td className="py-3 px-3 text-right text-[#5b738b]">{r.material.monthlyDemand}</td>
                  <td className="py-3 px-3 text-right text-[#5b738b]">{r.stockQty}</td>
                  <td className="py-3 px-3 text-right text-[#5b738b]">${r.material.basePrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#0a6ed1]">
                    ${r.metricValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right">{r.relPct.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right font-semibold">{r.cumPct.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        r.computedClass === 'A'
                          ? 'bg-[#f0f4f9] text-[#0a6ed1] border border-[#c2dcf7]'
                          : r.computedClass === 'B'
                          ? 'bg-[#fef3e6] text-[#9a4d06] border border-[#f5cfa3]'
                          : 'bg-[#f5f6f7] text-[#5b738b] border border-[#d9e1e8]'
                      }`}
                    >
                      {r.computedClass}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
