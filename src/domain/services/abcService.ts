import { ABCClass, Material, StockRecord } from '../../types/sap';
import { buildStockTotalsByMaterial } from '../indexes';

export type ABCCriterion = 'UTILIZATION' | 'INVENTORY_VALUE' | 'UNIT_COST';

export interface ABCRankedItem {
  material: Material;
  stockQty: number;
  metricValue: number;
  relPct: number;
  cumPct: number;
  computedClass: ABCClass;
}

export interface ABCAnalysisResult {
  items: ABCRankedItem[];
  classCounts: Record<ABCClass, number>;
  totalMetricValue: number;
  maxMetricValue: number;
}

/**
 * Strategy Pattern (OCP) for ABC Pareto metric extraction.
 */
type ABCMetricExtractor = (material: Material, stockQty: number) => number;

const ABC_EXTRACTORS: Readonly<Record<ABCCriterion, ABCMetricExtractor>> = {
  UTILIZATION: (m) => m.monthlyDemand * m.basePrice,
  INVENTORY_VALUE: (m, stockQty) => stockQty * m.basePrice,
  UNIT_COST: (m) => m.basePrice
};

/**
 * Executes MC40 ABC Pareto Analysis.
 * Uses precomputed O(S) stock totals Map to avoid O(M * S) nested scans.
 * Total Time Complexity: O(S + M log M).
 */
export function calculateABCAnalysis(
  materials: readonly Material[],
  stocks: readonly StockRecord[],
  criterion: ABCCriterion
): ABCAnalysisResult {
  if (materials.length === 0) {
    return {
      items: [],
      classCounts: { A: 0, B: 0, C: 0 },
      totalMetricValue: 0,
      maxMetricValue: 0
    };
  }

  // O(S) single-pass aggregation
  const stockTotalsMap = buildStockTotalsByMaterial(stocks);
  const extractor = ABC_EXTRACTORS[criterion];

  // O(M) projection
  const raw = materials.map(material => {
    const stockQty = stockTotalsMap.get(material.id)?.totalPhysical ?? 0;
    return {
      material,
      stockQty,
      metricValue: extractor(material, stockQty)
    };
  });

  // O(M log M) descending sort
  raw.sort((a, b) => b.metricValue - a.metricValue);

  let totalMetricValue = 0;
  for (let i = 0; i < raw.length; i++) {
    totalMetricValue += raw[i].metricValue;
  }

  const safeTotal = totalMetricValue > 0 ? totalMetricValue : 1;
  const classCounts: Record<ABCClass, number> = { A: 0, B: 0, C: 0 };
  let cum = 0;

  // O(M) classification
  const items: ABCRankedItem[] = raw.map((r, idx) => {
    const relPct = (r.metricValue / safeTotal) * 100;
    cum += relPct;
    const computedClass: ABCClass = cum <= 80.5 || idx === 0 ? 'A' : cum <= 95.5 ? 'B' : 'C';
    classCounts[computedClass]++;
    return {
      ...r,
      relPct,
      cumPct: Math.min(100, cum),
      computedClass
    };
  });

  return {
    items,
    classCounts,
    totalMetricValue,
    maxMetricValue: raw[0]?.metricValue ?? 0
  };
}
