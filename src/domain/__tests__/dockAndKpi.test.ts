import { describe, it, expect } from 'vitest';
import { calculateDockCapacity } from '../services/dockService';
import { calculateLogisticsKPIs } from '../services/kpiService';
import { INITIAL_KPI_BASELINE } from '../../data/initialData';

describe('dockService — UTN PL-IV Dock Dimensioning Formula', () => {
  it('matches UTN PL-IV Slide 24–30 exact example (18x30 + 22x40, 8h, 80% -> 4 shared vs 5 exclusive)', () => {
    const res = calculateDockCapacity({
      qd: 18,
      td: 30,
      qc: 22,
      tc: 40,
      hoursPerDay: 8,
      utilizationPct: 80
    });

    expect(res.unloadMinutes).toBe(540);
    expect(res.loadMinutes).toBe(880);
    expect(res.totalMinutesRequired).toBe(1420);
    expect(res.effectiveMinutesPerDock).toBeCloseTo(384, 5);
    expect(res.sharedDocksTheoretical).toBeCloseTo(3.6979, 3);
    expect(res.sharedDocksRequired).toBe(4);
    expect(res.exclusiveUnloadDocks).toBe(2);
    expect(res.exclusiveLoadDocks).toBe(3);
    expect(res.exclusiveTotalDocks).toBe(5);
  });

  it('matches Distribuidora del Sur Slide 10–12 example (18x35 + 22x45, 8h, 75% -> 5 shared)', () => {
    const res = calculateDockCapacity({
      qd: 18,
      td: 35,
      qc: 22,
      tc: 45,
      hoursPerDay: 8,
      utilizationPct: 75
    });

    expect(res.totalMinutesRequired).toBe(1620);
    expect(res.effectiveMinutesPerDock).toBe(360);
    expect(res.sharedDocksTheoretical).toBe(4.5);
    expect(res.sharedDocksRequired).toBe(5);
  });
});

describe('kpiService — UTN PL-IV Metalúrgica del Sur CMI Baseline', () => {
  it('calculates exact monthly baseline KPIs (96% exactitud, 90% salidas, 4% devolución, 75% recuperación)', () => {
    const kpis = calculateLogisticsKPIs(INITIAL_KPI_BASELINE);
    expect(kpis.exactitudPct).toBeCloseTo(96, 2);
    expect(kpis.salidasATiempoPct).toBeCloseTo(90, 2);
    expect(kpis.tasaDevolucionPct).toBeCloseTo(4, 2);
    expect(kpis.tasaRecuperacionPct).toBeCloseTo(75, 2);
  });

  it('guards against division by zero when baseline metrics are empty', () => {
    const kpis = calculateLogisticsKPIs({
      dispatchedOrders: 0,
      errorFreeOrders: 0,
      onTimeDepartures: 0,
      otifDeliveries: 0,
      deliveredUnits: 0,
      returnedUnits: 0,
      recoveredUnits: 0,
      avgDockMinutesUsed: 0,
      avgDockMinutesAvailable: 0
    });
    expect(kpis.otifPct).toBe(0);
    expect(kpis.tasaRecuperacionPct).toBe(0);
  });
});
