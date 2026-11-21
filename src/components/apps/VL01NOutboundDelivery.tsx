import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import { ExpeditionControls } from '../../types/sap';
import {
  Truck,
  PackageCheck,
  CheckCircle2,
  Building2,
  Boxes,
  Clock,
  Calculator,
  AlertTriangle
} from 'lucide-react';

export const VL01NOutboundDelivery: React.FC = () => {
  const {
    outboundDeliveries,
    materials,
    confirmPicking,
    toggleDeliveryControl,
    postGoodsIssue,
    setActiveApp,
    completeCaseStep
  } = useSAP();

  const [activeSubTab, setActiveSubTab] = useState<'EXPEDITION' | 'DOCKS'>('EXPEDITION');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(outboundDeliveries[0]?.id || '');

  // EWM Dock Dimensioning Calculator (UTN PL-IV exact formula)
  const [qd, setQd] = useState<number>(18); // Camiones descarga/día
  const [td, setTd] = useState<number>(30); // Minutos promedio descarga
  const [qc, setQc] = useState<number>(22); // Camiones carga/día
  const [tc, setTc] = useState<number>(40); // Minutos promedio carga
  const [hours, setHours] = useState<number>(8); // Horas operativas/día
  const [utilization, setUtilization] = useState<number>(80); // % utilización objetivo

  const activeDelivery = outboundDeliveries.find(d => d.id === selectedDeliveryId) || outboundDeliveries[0];

  const unloadMin = qd * td;
  const loadMin = qc * tc;
  const totalMinRequired = unloadMin + loadMin;
  const effectiveMinPerDock = Math.max(1, hours * 60 * (utilization / 100));
  const sharedDocksRaw = totalMinRequired / effectiveMinPerDock;
  const sharedDocks = Math.ceil(sharedDocksRaw);
  const exclusiveUnloadDocks = Math.ceil(unloadMin / effectiveMinPerDock);
  const exclusiveLoadDocks = Math.ceil(loadMin / effectiveMinPerDock);
  const exclusiveTotalDocks = exclusiveUnloadDocks + exclusiveLoadDocks;

  const handleOpenDocks = () => {
    setActiveSubTab('DOCKS');
    completeCaseStep('CASE-ABC', 2);
  };

  const controlLabels: { key: keyof ExpeditionControls; title: string; desc: string }[] = [
    { key: 'verifiedCodesAndQty', title: '1. Verificación', desc: 'Control físico / escaneo de códigos y cantidades' },
    { key: 'consolidatedByDest', title: '2. Consolidación', desc: 'Agrupamiento por pedido / destino (integridad)' },
    { key: 'packedAndLabeled', title: '3. Acondicionamiento', desc: 'Embalaje protector y rotulación de bultos' },
    { key: 'loadWeightAndStabilityChecked', title: '4. Control de Carga', desc: 'Capacidad, estabilidad, compatibilidad y secuencia' },
    { key: 'dispatchDocsReady', title: '5. Documentación', desc: 'Remito, hoja de carga y registro de salida listos' }
  ];

  const allControlsChecked = activeDelivery ? Object.values(activeDelivery.controls).every(Boolean) : false;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#fef3e6] text-[#e9730c] flex items-center justify-center">
            <Truck className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Expedición (PGI 601) & Dimensionamiento de Muelles
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#fef3e6] text-[#9a4d06] border border-[#f5cfa3] font-mono text-xs font-bold">
                VL02N / EWM DOCK
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Gestión de entregas salientes, controles de carga (UTN PL-IV) y programación de capacidad de muelles
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f5f6f7] rounded-lg border border-[#d9e1e8]">
          <button
            onClick={() => setActiveSubTab('EXPEDITION')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'EXPEDITION'
                ? 'bg-white text-[#0a6ed1] shadow-xs border border-[#d9e1e8]'
                : 'text-[#5b738b] hover:text-[#1d2d3e]'
            }`}
          >
            Entregas Salientes & PGI (VL02N)
          </button>
          <button
            onClick={handleOpenDocks}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'DOCKS'
                ? 'bg-white text-[#0a6ed1] shadow-xs border border-[#d9e1e8]'
                : 'text-[#5b738b] hover:text-[#1d2d3e]'
            }`}
          >
            Dimensionamiento de Muelles (EWM)
          </button>
        </div>
      </div>

      {/* TAB 1: OUTBOUND EXPEDITION & PGI 601 */}
      {activeSubTab === 'EXPEDITION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Delivery List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#e9730c]" />
                Monitor de Expedición
              </h3>
              <button
                onClick={() => setActiveApp('MMBE')}
                className="text-[11px] font-semibold text-[#0a6ed1] hover:underline flex items-center gap-1"
              >
                <Boxes className="w-3.5 h-3.5" /> MMBE
              </button>
            </div>

            <div className="space-y-2">
              {outboundDeliveries.map(del => {
                const isSelected = del.id === activeDelivery?.id;
                const isPGI = del.pgiStatus === 'CONTABILIZADO';
                return (
                  <div
                    key={del.id}
                    onClick={() => setSelectedDeliveryId(del.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0a6ed1] bg-[#f0f4f9] ring-1 ring-[#0a6ed1]'
                        : 'border-[#d9e1e8] hover:border-[#0a6ed1]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#1d2d3e]">{del.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          isPGI
                            ? 'bg-[#eaf7ee] text-[#107e3e]'
                            : del.pickingStatus === 'COMPLETADO'
                            ? 'bg-[#f0f4f9] text-[#0a6ed1]'
                            : 'bg-[#fef3e6] text-[#9a4d06]'
                        }`}
                      >
                        {isPGI ? 'PGI 601 OK' : `Picking ${del.pickingStatus}`}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1d2d3e] mt-1">{del.customerName}</div>
                    <div className="text-[11px] text-[#5b738b] mt-1 flex items-center justify-between font-mono">
                      <span>{del.transportMode} · {del.routeKm} km</span>
                      <span>{del.plannedGoodsIssueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Delivery Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {activeDelivery && (
              <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#d9e1e8] bg-[#f5f6f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#1d2d3e] font-mono">Entrega {activeDelivery.id}</span>
                      <span className="text-xs text-[#5b738b]">(Ref. {activeDelivery.salesOrderId})</span>
                    </div>
                    <div className="text-xs text-[#5b738b] mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {activeDelivery.customerName}</span>
                      <span>·</span>
                      <span className="font-mono">{activeDelivery.shippingPoint}</span>
                      <span>·</span>
                      <span className="font-mono font-semibold text-[#0a6ed1]">
                        {activeDelivery.transportMode} ({activeDelivery.routeKm} km ruta alt.)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Positions Table */}
                <div className="p-5 space-y-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#f5f6f7] text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                          <th className="py-2.5 px-3 font-mono">Pos.</th>
                          <th className="py-2.5 px-4">Material</th>
                          <th className="py-2.5 px-3 text-right font-mono">Cant. Entrega</th>
                          <th className="py-2.5 px-3 text-right font-mono text-[#e9730c]">Pickeado</th>
                          <th className="py-2.5 px-3 font-mono">Lote</th>
                          <th className="py-2.5 px-3 font-mono">Ubicación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf2f7] tabular-nums">
                        {activeDelivery.items.map(it => {
                          const mat = materials.find(m => m.id === it.materialId);
                          return (
                            <tr key={it.itemNumber}>
                              <td className="py-3 px-3 font-mono text-[#5b738b]">{it.itemNumber}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#1d2d3e]">{mat?.name}</div>
                                <div className="text-[11px] font-mono text-[#5b738b]">{it.materialId}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold">{it.deliveryQty} {mat?.unit}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-[#e9730c]">{it.pickedQty} {mat?.unit}</td>
                              <td className="py-3 px-3 font-mono">{it.batch}</td>
                              <td className="py-3 px-3 font-mono text-[#0a6ed1]">{it.storageBin}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 5 Mandatory Expedition Controls (UTN PL-IV Slide 5) */}
                  <div className="bg-[#f5f6f7] rounded-xl p-4 border border-[#d9e1e8] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
                        Checklist de Controles del Área de Carga y Salida (Obligatorio antes de PGI)
                      </h4>
                      <span className="text-xs font-mono text-[#5b738b]">
                        {Object.values(activeDelivery.controls).filter(Boolean).length}/5 verificados
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {controlLabels.map(ctrl => {
                        const checked = activeDelivery.controls[ctrl.key];
                        return (
                          <label
                            key={ctrl.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                              checked
                                ? 'bg-[#eaf7ee] border-[#bce3c9] text-[#107e3e]'
                                : 'bg-white border-[#d9e1e8] text-[#1d2d3e] hover:border-[#0a6ed1]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={activeDelivery.pgiStatus === 'CONTABILIZADO'}
                              checked={checked}
                              onChange={() => toggleDeliveryControl(activeDelivery.id, ctrl.key)}
                              className="mt-0.5 w-4 h-4 accent-[#107e3e]"
                            />
                            <div>
                              <div className="font-bold">{ctrl.title}</div>
                              <div className="text-[11px] opacity-80">{ctrl.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-[#edf2f7] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-[#5b738b]">
                      {activeDelivery.pgiStatus === 'CONTABILIZADO' ? (
                        <span className="text-[#107e3e] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Salida contabilizada (Mov. 601) — Doc. Material {activeDelivery.materialDocRef}
                        </span>
                      ) : (
                        'Paso 1: Picking 100% · Paso 2: 5 Controles de expedición · Paso 3: Contabilizar PGI (601).'
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeDelivery.pickingStatus !== 'COMPLETADO' && (
                        <button
                          onClick={() => confirmPicking(activeDelivery.id)}
                          className="px-4 py-2 rounded-lg bg-[#e9730c] hover:bg-[#c76109] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Confirmar Picking 100%</span>
                        </button>
                      )}
                      {activeDelivery.pgiStatus !== 'CONTABILIZADO' && (
                        <button
                          onClick={() => postGoodsIssue(activeDelivery.id)}
                          disabled={activeDelivery.pickingStatus !== 'COMPLETADO' || !allControlsChecked}
                          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            activeDelivery.pickingStatus === 'COMPLETADO' && allControlsChecked
                              ? 'bg-[#0a6ed1] hover:bg-[#0854a0] text-white cursor-pointer'
                              : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                          <span>Contabilizar PGI (Mov. 601)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EWM DOCK DIMENSIONING CALCULATOR (UTN PL-IV) */}
      {activeSubTab === 'DOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#0a6ed1]" />
                Parámetros de Dimensionamiento de Muelles
              </h3>
              <span className="font-mono text-xs text-[#0a6ed1] font-bold">
                N = [(Qd×Td) + (Qc×Tc)] / (H×60×U)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Qd (Camiones Descarga/día)</label>
                <input type="number" min="0" value={qd} onChange={e => setQd(Math.max(0, parseInt(e.target.value) || 0))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Td (Min. por Descarga)</label>
                <input type="number" min="1" value={td} onChange={e => setTd(Math.max(1, parseInt(e.target.value) || 1))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">H (Horas Jornada/día)</label>
                <input type="number" min="1" max="24" value={hours} onChange={e => setHours(Math.max(1, parseInt(e.target.value) || 1))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Qc (Camiones Carga/día)</label>
                <input type="number" min="0" value={qc} onChange={e => setQc(Math.max(0, parseInt(e.target.value) || 0))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Tc (Min. por Carga)</label>
                <input type="number" min="1" value={tc} onChange={e => setTc(Math.max(1, parseInt(e.target.value) || 1))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">U (Utilización Objetivo %)</label>
                <input type="number" min="10" max="100" value={utilization} onChange={e => setUtilization(Math.min(100, Math.max(10, parseInt(e.target.value) || 80)))} className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#f5f6f7] border border-[#d9e1e8] text-xs font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-[#5b738b] uppercase block">Trabajo Descarga</span>
                <span className="text-sm font-bold text-[#1d2d3e]">{unloadMin} min/día</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5b738b] uppercase block">Trabajo Carga</span>
                <span className="text-sm font-bold text-[#1d2d3e]">{loadMin} min/día</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5b738b] uppercase block">Cap. Efectiva / Muelle</span>
                <span className="text-sm font-bold text-[#0a6ed1]">{effectiveMinPerDock.toFixed(0)} min/día</span>
              </div>
            </div>
          </div>

          {/* Results Comparison: Shared vs Exclusive */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
                Resultado Comparativo (Redondeo al Entero Superior)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#f0f4f9] border border-[#c2dcf7]">
                  <span className="text-[11px] font-semibold text-[#0a6ed1] block">Muelles Compartidos</span>
                  <div className="text-3xl font-extrabold text-[#1d2d3e] font-mono mt-1 tabular-nums">{sharedDocks}</div>
                  <span className="text-[11px] font-mono text-[#5b738b]">Teórico: {sharedDocksRaw.toFixed(2)}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#fef3e6] border border-[#f5cfa3]">
                  <span className="text-[11px] font-semibold text-[#9a4d06] block">Muelles Exclusivos</span>
                  <div className="text-3xl font-extrabold text-[#1d2d3e] font-mono mt-1 tabular-nums">{exclusiveTotalDocks}</div>
                  <span className="text-[11px] font-mono text-[#5b738b]">{exclusiveUnloadDocks} desc. + {exclusiveLoadDocks} carga</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#fde8e8]/70 border border-[#f5c2c2] text-xs text-[#7f1d1d] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#bb0000] shrink-0 mt-0.5" />
                <div>
                  <strong>Advertencia Técnica (Colas en Hora Pico):</strong> Capacidad promedio ≠ capacidad suficiente en hora pico. Antes de construir otro muelle, evalúa programar turnos de llegada (SAP Yard / Dock Appointment Scheduling) y prevalidar documentación.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
