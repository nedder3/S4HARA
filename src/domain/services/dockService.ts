export interface DockDimensioningInput {
  qd: number; // Camiones descarga / día
  td: number; // Minutos promedio descarga
  qc: number; // Camiones carga / día
  tc: number; // Minutos promedio carga
  hoursPerDay: number; // Horas operativas jornada (H)
  utilizationPct: number; // Utilización objetivo % (U, ej. 80)
}

export interface DockDimensioningOutput {
  unloadMinutes: number;
  loadMinutes: number;
  totalMinutesRequired: number;
  effectiveMinutesPerDock: number;
  sharedDocksTheoretical: number;
  sharedDocksRequired: number;
  exclusiveUnloadDocks: number;
  exclusiveLoadDocks: number;
  exclusiveTotalDocks: number;
}

/**
 * Pure O(1) Dock Dimensioning Calculator (UTN Procesos Logísticos IV).
 * Formula: N = [(Qd * Td) + (Qc * Tc)] / (H * 60 * U)
 */
export function calculateDockCapacity(input: DockDimensioningInput): DockDimensioningOutput {
  const qd = Math.max(0, input.qd);
  const td = Math.max(0, input.td);
  const qc = Math.max(0, input.qc);
  const tc = Math.max(0, input.tc);
  const hours = Math.max(1, input.hoursPerDay);
  const utilizationDecimal = Math.min(1, Math.max(0.1, input.utilizationPct / 100));

  const unloadMinutes = qd * td;
  const loadMinutes = qc * tc;
  const totalMinutesRequired = unloadMinutes + loadMinutes;
  const effectiveMinutesPerDock = hours * 60 * utilizationDecimal;

  const sharedDocksTheoretical = totalMinutesRequired / effectiveMinutesPerDock;
  const sharedDocksRequired = Math.ceil(sharedDocksTheoretical);
  const exclusiveUnloadDocks = Math.ceil(unloadMinutes / effectiveMinutesPerDock);
  const exclusiveLoadDocks = Math.ceil(loadMinutes / effectiveMinutesPerDock);

  return {
    unloadMinutes,
    loadMinutes,
    totalMinutesRequired,
    effectiveMinutesPerDock,
    sharedDocksTheoretical,
    sharedDocksRequired,
    exclusiveUnloadDocks,
    exclusiveLoadDocks,
    exclusiveTotalDocks: exclusiveUnloadDocks + exclusiveLoadDocks
  };
}
