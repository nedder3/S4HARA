import { LotSizePolicy, Material } from '../../types/sap';

export interface MRPWeekResult {
  week: number;
  grossReq: number;
  scheduledReceipt: number;
  startingInv: number;
  netReq: number;
  plannedReceipt: number;
  endingInv: number;
  plannedRelease: number;
}

export interface MRPPlanInput {
  initialStock: number;
  safetyStock: number;
  leadTimeWeeks: number;
  lotPolicy: LotSizePolicy;
  fixedLotQty: number;
  grossRequirements: readonly number[];
  scheduledReceipts: readonly number[];
  orderingCostPerOrder?: number;
  holdingCostPerUnitWeek?: number;
}

export interface MRPPlanOutput {
  rows: MRPWeekResult[];
  urgentPastDueRelease: number;
  totalOrdersCount: number;
  avgInventory: number;
  orderingCost: number;
  holdingCost: number;
  totalMrpCost: number;
}

/**
 * Strategy Pattern (Open/Closed Principle - SOLID OCP)
 * Encapsulates lot-sizing algorithms so new policies (e.g., POQ, Silver-Meal)
 * can be registered without modifying the core MRP engine.
 */
export interface LotSizingStrategy {
  calculateOrderQty(netRequirement: number, configuredLotQty: number): number;
}

const l4lStrategy: LotSizingStrategy = {
  calculateOrderQty: (netReq) => netReq
};

const fixedLotStrategy: LotSizingStrategy = {
  calculateOrderQty: (netReq, lotQty) => {
    const safeLot = Math.max(1, lotQty);
    return Math.ceil(netReq / safeLot) * safeLot;
  }
};

export const LOT_SIZING_STRATEGIES: Readonly<Record<LotSizePolicy, LotSizingStrategy>> = {
  L4L: l4lStrategy,
  FIXED: fixedLotStrategy,
  EOQ: fixedLotStrategy
};

/**
 * Computes a deterministic MRP plan across W weeks.
 * Time Complexity: O(W) where W = horizon length (typically 6–52 weeks).
 * Space Complexity: O(W).
 */
export function calculateMRPPlan(input: MRPPlanInput): MRPPlanOutput {
  const {
    initialStock,
    safetyStock,
    leadTimeWeeks,
    lotPolicy,
    fixedLotQty,
    grossRequirements,
    scheduledReceipts,
    orderingCostPerOrder = 250,
    holdingCostPerUnitWeek = 1.5
  } = input;

  const horizon = grossRequirements.length;
  const strategy = LOT_SIZING_STRATEGIES[lotPolicy];
  const rows: MRPWeekResult[] = new Array(horizon);

  let currentInv = Math.max(0, initialStock);
  let ordersCount = 0;
  let sumAvgWeeklyInv = 0;

  // Pass 1: O(W) Forward projection of balances, net requirements, and planned receipts
  for (let i = 0; i < horizon; i++) {
    const gross = Math.max(0, grossRequirements[i] ?? 0);
    const sched = Math.max(0, scheduledReceipts[i] ?? 0);
    const availableBeforeReq = currentInv + sched;
    const projectedWithoutOrder = availableBeforeReq - gross;

    let netReq = 0;
    let plannedReceipt = 0;

    if (projectedWithoutOrder < safetyStock) {
      netReq = safetyStock - projectedWithoutOrder;
      plannedReceipt = strategy.calculateOrderQty(netReq, fixedLotQty);
      ordersCount++;
    }

    const endingInv = availableBeforeReq + plannedReceipt - gross;
    sumAvgWeeklyInv += (currentInv + endingInv) / 2;

    rows[i] = {
      week: i + 1,
      grossReq: gross,
      scheduledReceipt: sched,
      startingInv: currentInv,
      netReq,
      plannedReceipt,
      endingInv,
      plannedRelease: 0
    };

    currentInv = endingInv;
  }

  // Pass 2: O(W) Backward Lead-Time offsetting to compute Planned Order Releases
  let urgentPastDueRelease = 0;
  for (let i = 0; i < horizon; i++) {
    const receipt = rows[i].plannedReceipt;
    if (receipt > 0) {
      const releaseIdx = i - leadTimeWeeks;
      if (releaseIdx >= 0) {
        rows[releaseIdx].plannedRelease += receipt;
      } else {
        urgentPastDueRelease += receipt;
      }
    }
  }

  const avgInventory = horizon > 0 ? sumAvgWeeklyInv / horizon : 0;
  const orderingCost = ordersCount * orderingCostPerOrder;
  const holdingCost = sumAvgWeeklyInv * holdingCostPerUnitWeek;

  return {
    rows,
    urgentPastDueRelease,
    totalOrdersCount: ordersCount,
    avgInventory,
    orderingCost,
    holdingCost,
    totalMrpCost: orderingCost + holdingCost
  };
}

export interface BOMExplodedChild {
  materialId: string;
  materialName: string;
  unit: string;
  qtyPerParent: number;
  leadTimeWeeks: number;
  totalDerivedDemand: number;
}

/**
 * Computes CS03 Level-1 BOM Explosion using O(1) Material Map lookups.
 * Time Complexity: O(B + W) where B = number of BOM children.
 */
export function calculateBOMExplosion(
  parent: Material,
  rows: readonly MRPWeekResult[],
  materialIndex: ReadonlyMap<string, Material>
): BOMExplodedChild[] {
  if (!parent.bomChildren || parent.bomChildren.length === 0) return [];

  let totalParentReleases = 0;
  for (let i = 0; i < rows.length; i++) {
    totalParentReleases += rows[i].plannedRelease;
  }

  return parent.bomChildren.map(child => {
    const childMat = materialIndex.get(child.materialId);
    return {
      materialId: child.materialId,
      materialName: childMat?.name ?? child.materialId,
      unit: childMat?.unit ?? 'UN',
      qtyPerParent: child.qtyPerParent,
      leadTimeWeeks: childMat?.leadTimeWeeks ?? 1,
      totalDerivedDemand: totalParentReleases * child.qtyPerParent
    };
  });
}
