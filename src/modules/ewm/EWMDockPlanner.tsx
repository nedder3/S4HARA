import React, { useState, useMemo, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import { calculateDockCapacity } from '../../domain/services/dockService';
import { Calculator, AlertTriangle, Truck } from 'lucide-react';

export const EWMDockPlanner: React.FC = () => {
  const { completeCaseStep, setActiveApp } = useSAP();

  const [qd, setQd] = useState<number>(18);
  const [td, setTd] = useState<number>(30);
  const [qc, setQc] = useState<number>(22);
  const [tc, setTc] = useState<number>(40);
  const [hours, setHours] = useState<number>(8);
  const [utilization, setUtilization] = useState<number>(80);

  useEffect(() => {
    completeCaseStep('CASE-ABC', 2);
  }, []);

  const result = useMemo(
    () => calculateDockCapacity({ qd, td, qc, tc, hoursPerDay: hours, utilizationPct: utilization }),
    [qd, td, qc, tc, hours, utilization]
  );

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="sap-card rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] flex items-center justify-center">
            <Calculator className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight" tabIndex={-1}>
                Programación y Capacidad de Muelles (Dock Appointment Scheduling)
              </h2>
              <span className="px-2 py-0.5 rounded bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] border border-[var(--sap-brand-border)] font-mono text-xs font-bold">
                EWM DOCK
              </span>
            </div>
            <p className="text-xs text-[var(--sap-text-muted)]">
              Dimensionamiento de bocas de carga/descarga compartidas vs. exclusivas y control de utilización
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveApp('VL01N')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-lg bg-[var(--sap-brand)] hover:opacity-90 text-white text-xs font-semibold transition-opacity"
        >
          <Truck className="w-4 h-4" />
          <span>Ir a Entregas (VL02N)</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 sap-card rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--sap-border-light)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">Parámetros Operativos del Patio de Muelles</h3>
            <span className="font-mono text-xs text-[var(--sap-brand)] font-bold">
              N = [(Qd × Td) + (Qc × Tc)] / (H × 60 × U)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dock-qd" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                Qd (Camiones Descarga/día)
              </label>
              <input
                id="dock-qd"
                type="number"
                min="0"
                value={qd}
                onChange={e => setQd(Math.max(0, parseInt(e.target.value) || 0))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="dock-td" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                Td (Min. por Descarga)
              </label>
              <input
                id="dock-td"
                type="number"
                min="1"
                value={td}
                onChange={e => setTd(Math.max(1, parseInt(e.target.value) || 1))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="dock-h" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                H (Horas Jornada/día)
              </label>
              <input
                id="dock-h"
                type="number"
                min="1"
                max="24"
                value={hours}
                onChange={e => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="dock-qc" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                Qc (Camiones Carga/día)
              </label>
              <input
                id="dock-qc"
                type="number"
                min="0"
                value={qc}
                onChange={e => setQc(Math.max(0, parseInt(e.target.value) || 0))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="dock-tc" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                Tc (Min. por Carga)
              </label>
              <input
                id="dock-tc"
                type="number"
                min="1"
                value={tc}
                onChange={e => setTc(Math.max(1, parseInt(e.target.value) || 1))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="dock-u" className="block text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase mb-1">
                U (Utilización Objetivo %)
              </label>
              <input
                id="dock-u"
                type="number"
                min="10"
                max="100"
                value={utilization}
                onChange={e => setUtilization(Math.min(100, Math.max(10, parseInt(e.target.value) || 80)))}
                className="sap-input w-full text-xs p-2.5 min-h-[40px] rounded-lg font-mono font-bold tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl sap-subtle border text-xs font-mono tabular-nums">
            <div>
              <span className="text-[10px] text-[var(--sap-text-muted)] uppercase block">Trabajo Descarga</span>
              <span className="text-sm font-bold">{result.unloadMinutes} min/día</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--sap-text-muted)] uppercase block">Trabajo Carga</span>
              <span className="text-sm font-bold">{result.loadMinutes} min/día</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--sap-text-muted)] uppercase block">Cap. Efectiva / Muelle</span>
              <span className="text-sm font-bold text-[var(--sap-brand)]">{result.effectiveMinutesPerDock.toFixed(0)} min/día</span>
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        <div className="lg:col-span-5 sap-card rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Resultado Comparativo (Redondeo al Entero Superior)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[var(--sap-brand-soft)] border border-[var(--sap-brand-border)]">
              <span className="text-[11px] font-semibold text-[var(--sap-brand)] block">Muelles Compartidos</span>
              <div className="text-3xl font-extrabold font-mono mt-1 tabular-nums">{result.sharedDocksRequired}</div>
              <span className="text-[11px] font-mono text-[var(--sap-text-muted)]">
                Teórico: {result.sharedDocksTheoretical.toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--sap-warning-bg)] border border-[var(--sap-warning-border)]">
              <span className="text-[11px] font-semibold text-[var(--sap-warning)] block">Muelles Exclusivos</span>
              <div className="text-3xl font-extrabold font-mono mt-1 tabular-nums">{result.exclusiveTotalDocks}</div>
              <span className="text-[11px] font-mono text-[var(--sap-text-muted)]">
                {result.exclusiveUnloadDocks} desc. + {result.exclusiveLoadDocks} carga
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--sap-error-bg)] border border-[var(--sap-error-border)] text-xs flex items-start gap-2.5" role="note">
            <AlertTriangle className="w-4 h-4 text-[var(--sap-error)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--sap-error)]">Control de Picos Horarios:</strong> La capacidad promedio diaria no refleja la congestión en franjas pico. En SAP EWM Yard Management se programan turnos de arribo (Dock Appointments) y prevalidación documental antes de ampliar infraestructura.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
