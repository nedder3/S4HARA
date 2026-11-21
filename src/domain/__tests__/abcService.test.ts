import { describe, it, expect } from 'vitest';
import { calculateABCAnalysis } from '../services/abcService';
import { INITIAL_MATERIALS, INITIAL_STOCKS } from '../../data/initialData';

describe('abcService — Unit Tests (MC40 Pareto)', () => {
  it('ranks materials in descending order of Utilization Value and classifies A/B/C', () => {
    const result = calculateABCAnalysis(INITIAL_MATERIALS, INITIAL_STOCKS, 'UTILIZATION');

    expect(result.items).toHaveLength(INITIAL_MATERIALS.length);
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].metricValue).toBeGreaterThanOrEqual(result.items[i].metricValue);
    }

    const lastCum = result.items[result.items.length - 1].cumPct;
    expect(lastCum).toBeCloseTo(100, 1);
    expect(result.classCounts.A).toBeGreaterThanOrEqual(1);
    expect(result.classCounts.A + result.classCounts.B + result.classCounts.C).toBe(INITIAL_MATERIALS.length);
  });

  it('produces different top-ranked SKU when switching from Utilization to Unit Cost', () => {
    const byUtil = calculateABCAnalysis(INITIAL_MATERIALS, INITIAL_STOCKS, 'UTILIZATION');
    const byUnitCost = calculateABCAnalysis(INITIAL_MATERIALS, INITIAL_STOCKS, 'UNIT_COST');

    // MAT-5001 (Batería 48V, $4200) is #1 by Unit Cost
    expect(byUnitCost.items[0].material.id).toBe('MAT-5001');
    // MAT-A100 (Motor 5HP, 85 * $680 = $57,800) is #1 by Utilization Value
    expect(byUtil.items[0].material.id).toBe('MAT-A100');
  });

  it('handles empty catalogs safely without NaN or division by zero', () => {
    const empty = calculateABCAnalysis([], [], 'INVENTORY_VALUE');
    expect(empty.items).toEqual([]);
    expect(empty.totalMetricValue).toBe(0);
    expect(empty.classCounts).toEqual({ A: 0, B: 0, C: 0 });
  });
});
