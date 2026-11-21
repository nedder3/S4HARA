import React, { useState, useMemo, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import { LotSizePolicy } from '../../types/sap';
import { Cpu, GitBranch, AlertTriangle, CheckCircle2, Calculator } from 'lucide-react';

interface MRPWeekResult {
  week: number;
  grossReq: number;
  scheduledReceipt: number;
  startingInv: number;
  netReq: number;
  plannedReceipt: number;
  endingInv: number;
  plannedRelease: number;
}

export const MD04MRPMonitor: React.FC = () => {
  const { materials, stocks, mrpSchedules, completeCaseStep } = useSAP();

  const mrpMaterials = materials.filter(m => mrpSchedules.some(s => s.materialId === m.id));
  const [selectedMatId, setSelectedMatId] = useState<string>(mrpMaterials[0]?.id || 'MAT-A100');

  const selectedMat = materials.find(m => m.id === selectedMatId) || materials[0];
  const baseSchedule = mrpSchedules.find(s => s.materialId === selectedMatId) || {
    materialId: selectedMatId,
    grossRequirements: [20, 20, 20, 20, 20, 20],
    scheduledReceipts: [0, 0, 0, 0, 0, 0]
  };

  // Live initial unrestricted stock from MMBE
  const liveInitialStock = useMemo(() => {
    return stocks
      .filter(s => s.materialId === selectedMatId && s.plantId === '1010')
      .reduce((acc, s) => acc + s.unrestricted, 0);
  }, [stocks, selectedMatId]);

  const [lotPolicy, setLotPolicy] = useState<LotSizePolicy>(selectedMat.lotSizePolicy);
  const [fixedLotQty, setFixedLotQty] = useState<number>(selectedMat.lotSizeQty);
  const [leadTime, setLeadTime] = useState<number>(selectedMat.leadTimeWeeks);
  const [safetyStock, setSafetyStock] = useState<number>(selectedMat.safetyStock);
  const [inventoryDelta, setInventoryDelta] = useState<number>(0); // Simulates TP3 Ej. 6b (-13 u. discrepancy)
  const [grossReqs, setGrossReqs] = useState<number[]>(baseSchedule.grossRequirements);

  useEffect(() => {
    setLotPolicy(selectedMat.lotSizePolicy);
    setFixedLotQty(selectedMat.lotSizeQty);
    setLeadTime(selectedMat.leadTimeWeeks);
    setSafetyStock(selectedMat.safetyStock);
    setInventoryDelta(0);
    setGrossReqs(baseSchedule.grossRequirements);
  }, [selectedMatId]);

  useEffect(() => {
    completeCaseStep('CASE-MRP', 1);
  }, []);

  const handlePolicyChange = (policy: LotSizePolicy) => {
    setLotPolicy(policy);
    completeCaseStep('CASE-MRP', 2);
  };

  // Core MRP Calculation Engine (6 weeks)
  const { rows, urgentPastDueRelease, totalOrdersCount, avgInventory, totalMrpCost } = useMemo(() => {
    const startStock = Math.max(0, liveInitialStock + inventoryDelta);
    const weeks: MRPWeekResult[] = [];
    let currentInv = startStock;

    // First pass: calculate net requirements and planned order receipts
    for (let i = 0; i < 6; i++) {
      const gross = grossReqs[i] || 0;
      const sched = baseSchedule.scheduledReceipts[i] || 0;
      const availableBeforeReq = currentInv + sched;
      const projectedWithoutOrder = availableBeforeReq - gross;

      let netReq = 0;
      let plannedReceipt = 0;

      if (projectedWithoutOrder < safetyStock) {
        netReq = safetyStock - projectedWithoutOrder;
        if (lotPolicy === 'L4L') {
          plannedReceipt = netReq;
        } else {
          const lot = Math.max(1, fixedLotQty);
          plannedReceipt = Math.ceil(netReq / lot) * lot;
        }
      }

      const endingInv = availableBeforeReq + plannedReceipt - gross;

      weeks.push({
        week: i + 1,
        grossReq: gross,
        scheduledReceipt: sched,
        startingInv: currentInv,
        netReq,
        plannedReceipt,
        endingInv,
        plannedRelease: 0
      });

      currentInv = endingInv;
    }

    // Second pass: offset planned receipts by Lead Time (TS) -> planned order releases
    let pastDue = 0;
    weeks.forEach((w, idx) => {
      if (w.plannedReceipt > 0) {
        const releaseIdx = idx - leadTime;
        if (releaseIdx >= 0) {
          weeks[releaseIdx].plannedRelease += w.plannedReceipt;
        } else {
          pastDue += w.plannedReceipt;
        }
      }
    });

    // Cost Evaluation (UTN TP3 Ej. 2: $250/lanzamiento, $1.50/u./semana sobre inventario medio)
    const ordersCount = weeks.filter(w => w.plannedReceipt > 0).length;
    const sumAvgWeeklyInv = weeks.reduce((acc, w) => acc + (w.startingInv + w.endingInv) / 2, 0);
    const avgInv = sumAvgWeeklyInv / 6;
    const orderingCost = ordersCount * 250;
    const holdingCost = sumAvgWeeklyInv * 1.5;

    return {
      rows: weeks,
      urgentPastDueRelease: pastDue,
      totalOrdersCount: ordersCount,
      avgInventory: avgInv,
      totalMrpCost: orderingCost + holdingCost
    };
  }, [liveInitialStock, inventoryDelta, grossReqs, baseSchedule, safetyStock, lotPolicy, fixedLotQty, leadTime]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center">
            <Cpu className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Monitor MRP & Explosión de Lista de Materiales
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#f0f4f9] text-[#0a6ed1] border border-[#c2dcf7] font-mono text-xs font-bold">
                MD04 / CS03
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Planificación de Requerimientos de Materiales (Horizonte 6 semanas) · Conectado en vivo con el stock MMBE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-[#f5f6f7] border border-[#d9e1e8] text-[#1d2d3e]">
            Stock MMBE: <strong className="text-[#107e3e]">{liveInitialStock} {selectedMat.unit}</strong>
          </span>
        </div>
      </div>

      {/* Control Parameters (12-col Asymmetric Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
            Parámetros de Planificación MRP (Vista MRP 1 & 2 del Maestro de Materiales)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Material</label>
              <select
                value={selectedMatId}
                onChange={e => setSelectedMatId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono font-bold"
              >
                {mrpMaterials.map(m => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Política de Loteo</label>
              <select
                value={lotPolicy}
                onChange={e => handlePolicyChange(e.target.value as LotSizePolicy)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono font-semibold"
              >
                <option value="L4L">EX — Lote a Lote (L4L)</option>
                <option value="FIXED">FX — Tamaño de Lote Fijo</option>
                <option value="EOQ">EOQ — Cantidad Económica</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Tamaño de Lote (FX/EOQ)</label>
              <input
                type="number"
                min="1"
                disabled={lotPolicy === 'L4L'}
                value={fixedLotQty}
                onChange={e => {
                  setFixedLotQty(Math.max(1, parseInt(e.target.value) || 1));
                  completeCaseStep('CASE-MRP', 2);
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white font-mono font-bold disabled:bg-[#f5f6f7] disabled:text-[#5b738b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Lead Time (TS Semanas)</label>
              <select
                value={leadTime}
                onChange={e => setLeadTime(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                <option value={1}>1 Semana</option>
                <option value={2}>2 Semanas</option>
                <option value={3}>3 Semanas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Stock de Seguridad (SS)</label>
              <input
                type="number"
                min="0"
                value={safetyStock}
                onChange={e => setSafetyStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Simular Diferencia Inventario</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={inventoryDelta}
                  onChange={e => setInventoryDelta(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setInventoryDelta(-13)}
                  className="px-2 py-2.5 rounded-lg bg-[#fef3e6] hover:bg-[#fde8cf] text-[#9a4d06] border border-[#f5cfa3] text-[10px] font-mono font-bold shrink-0"
                  title="Simular Ejercicio 6b de TP3 (-13 unidades faltantes)"
                >
                  -13 u.
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Trade-off Summary (UTN TP3 Ej. 2) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#edf2f7] pb-2.5">
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#0a6ed1]" />
              Evaluación de Costos del Plan
            </h3>
            <span className="text-[10px] font-mono text-[#5b738b]">TP3 UTN</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5b738b]">Órdenes planificadas (Lanzamientos):</span>
              <span className="font-mono font-bold tabular-nums">{totalOrdersCount} × $250 = ${(totalOrdersCount * 250).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5b738b]">Inventario medio semanal:</span>
              <span className="font-mono font-bold tabular-nums">{avgInventory.toFixed(1)} {selectedMat.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5b738b]">Costo de mantenimiento ($1,50/u./sem):</span>
              <span className="font-mono font-bold tabular-nums">${(totalMrpCost - totalOrdersCount * 250).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#edf2f7] flex justify-between text-sm">
              <span className="font-bold text-[#1d2d3e]">Costo Total Horizonte (6 sem):</span>
              <span className="font-mono font-extrabold text-[#0a6ed1] tabular-nums">${totalMrpCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Past-Due Warning */}
      {urgentPastDueRelease > 0 && (
        <div className="p-4 rounded-xl bg-[#fde8e8] border border-[#f5c2c2] text-xs text-[#7f1d1d] flex items-center gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-[#bb0000] shrink-0" />
          <div>
            <strong>Mensaje de Excepción SAP MD04 (Orden en Pasado / Semana 0):</strong> Debido al Lead Time de {leadTime} semana(s), se requiere liberar inmediatamente una orden urgente de <strong>{urgentPastDueRelease} {selectedMat.unit}</strong> hoy para cubrir el requerimiento de la Semana 1 sin romper el Stock de Seguridad ({safetyStock}).
          </div>
        </div>
      )}

      {/* Main MRP Weekly Matrix */}
      <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d9e1e8] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
            Registro MRP — {selectedMat.id} ({selectedMat.name})
          </h3>
          <span className="text-xs font-mono text-[#5b738b]">
            Stock Inicial Efectivo: <strong>{Math.max(0, liveInitialStock + inventoryDelta)}</strong> · Política: <strong>{lotPolicy}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f6f7]/60 text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                <th className="py-3 px-4 text-left w-64">Concepto MRP</th>
                {rows.map(r => (
                  <th key={r.week} className="py-3 px-3 text-right font-mono">Semana {r.week}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] tabular-nums font-mono">
              {/* Row 1: Gross Req (editable) */}
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-[#1d2d3e]">Requerimientos Brutos (Editable)</td>
                {rows.map((r, idx) => (
                  <td key={r.week} className="py-2 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={grossReqs[idx]}
                      onChange={e => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setGrossReqs(prev => prev.map((v, i) => (i === idx ? val : v)));
                      }}
                      className="w-16 text-right p-1 rounded border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:border-[#0a6ed1] font-bold"
                    />
                  </td>
                ))}
              </tr>
              {/* Row 2: Scheduled Receipts */}
              <tr>
                <td className="py-3 px-4 font-sans text-[#5b738b]">Recepciones Programadas (OC en curso)</td>
                {rows.map(r => (
                  <td key={r.week} className="py-3 px-3 text-right text-[#107e3e] font-semibold">
                    {r.scheduledReceipt > 0 ? `+${r.scheduledReceipt}` : '0'}
                  </td>
                ))}
              </tr>
              {/* Row 3: Ending Inventory */}
              <tr className="bg-[#f5f6f7]/40">
                <td className="py-3 px-4 font-sans font-semibold text-[#1d2d3e]">Disponibilidad Proyectada (Final)</td>
                {rows.map(r => (
                  <td
                    key={r.week}
                    className={`py-3 px-3 text-right font-bold ${
                      r.endingInv <= safetyStock ? 'text-[#e9730c]' : 'text-[#1d2d3e]'
                    }`}
                  >
                    {r.endingInv}
                  </td>
                ))}
              </tr>
              {/* Row 4: Net Requirements */}
              <tr>
                <td className="py-3 px-4 font-sans text-[#bb0000] font-semibold">Necesidades Netas</td>
                {rows.map(r => (
                  <td key={r.week} className="py-3 px-3 text-right font-bold text-[#bb0000]">
                    {r.netReq > 0 ? r.netReq : <span className="text-[#cbd5e1]">0</span>}
                  </td>
                ))}
              </tr>
              {/* Row 5: Planned Order Receipts */}
              <tr>
                <td className="py-3 px-4 font-sans text-[#0a6ed1] font-semibold">Recepción de Órdenes Planificadas</td>
                {rows.map(r => (
                  <td key={r.week} className="py-3 px-3 text-right font-bold text-[#0a6ed1]">
                    {r.plannedReceipt > 0 ? r.plannedReceipt : <span className="text-[#cbd5e1]">0</span>}
                  </td>
                ))}
              </tr>
              {/* Row 6: Planned Order Releases */}
              <tr className="bg-[#f0f4f9]">
                <td className="py-3.5 px-4 font-sans font-bold text-[#0a6ed1]">
                  Liberación de Órdenes Planificadas (TS: {leadTime} sem)
                </td>
                {rows.map(r => (
                  <td key={r.week} className="py-3.5 px-3 text-right">
                    {r.plannedRelease > 0 ? (
                      <span className="px-2 py-1 rounded bg-[#0a6ed1] text-white font-bold">
                        {r.plannedRelease}
                      </span>
                    ) : (
                      <span className="text-[#a0aec0]">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CS03 BOM Explosion Card */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#edf2f7] pb-2.5">
          <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#0a6ed1]" />
            Explosión de Lista de Materiales (Transacción CS03 / BOM)
          </h3>
          <span className="text-xs font-mono text-[#5b738b]">Nivel 0 → Nivel 1</span>
        </div>

        {selectedMat.bomChildren && selectedMat.bomChildren.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMat.bomChildren.map(child => {
              const childMat = materials.find(m => m.id === child.materialId);
              const totalChildDemand = rows.reduce((acc, r) => acc + r.plannedRelease * child.qtyPerParent, 0);
              return (
                <div key={child.materialId} className="p-4 rounded-xl bg-[#f5f6f7] border border-[#d9e1e8] flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white border border-[#d9e1e8] font-mono text-xs font-bold text-[#0a6ed1]">
                        {child.materialId}
                      </span>
                      <span className="text-xs font-bold text-[#1d2d3e]">{childMat?.name}</span>
                    </div>
                    <p className="text-[11px] text-[#5b738b] mt-1">
                      Coeficiente técnico: <strong>{child.qtyPerParent} {childMat?.unit}</strong> por cada 1 {selectedMat.id} · Lead Time: {childMat?.leadTimeWeeks} sem.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#5b738b] uppercase block">Req. Derivado</span>
                    <span className="font-mono text-sm font-bold text-[#1d2d3e] tabular-nums">
                      {totalChildDemand} {childMat?.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-[#5b738b] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#107e3e]" />
            <span>{selectedMat.id} es un componente base / materia prima (Nivel inferior sin subcomponentes BOM).</span>
          </div>
        )}
      </div>
    </div>
  );
};
