import { OperationalKPIBaseline } from '../../types/sap';

export interface ComputedLogisticsKPIs {
  exactitudPct: number;
  salidasATiempoPct: number;
  otifPct: number;
  utilizacionMuellePct: number;
  tasaDevolucionPct: number;
  tasaRecuperacionPct: number;
}

function safePct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

/**
 * Pure O(1) CMI / OTIF KPI Calculator with zero-division guards.
 */
export function calculateLogisticsKPIs(baseline: OperationalKPIBaseline): ComputedLogisticsKPIs {
  return {
    exactitudPct: safePct(baseline.errorFreeOrders, baseline.dispatchedOrders),
    salidasATiempoPct: safePct(baseline.onTimeDepartures, baseline.dispatchedOrders),
    otifPct: safePct(baseline.otifDeliveries, baseline.dispatchedOrders),
    utilizacionMuellePct: safePct(baseline.avgDockMinutesUsed, baseline.avgDockMinutesAvailable),
    tasaDevolucionPct: safePct(baseline.returnedUnits, baseline.deliveredUnits),
    tasaRecuperacionPct: safePct(baseline.recoveredUnits, baseline.returnedUnits)
  };
}
