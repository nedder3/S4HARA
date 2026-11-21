import { describe, it, expect } from 'vitest';
import { calculateMRPPlan, calculateBOMExplosion } from '../services/mrpService';
import { buildMaterialIndex } from '../indexes';
import { INITIAL_MATERIALS } from '../../data/initialData';

describe('mrpService — Unit Tests (F.I.R.S.T.)', () => {
  it('computes L4L (Lot-for-Lot) exact net requirements and offsets releases by Lead Time', () => {
    const result = calculateMRPPlan({
      initialStock: 30,
      safetyStock: 10,
      leadTimeWeeks: 1,
      lotPolicy: 'L4L',
      fixedLotQty: 50,
      grossRequirements: [20, 20, 20, 20],
      scheduledReceipts: [0, 0, 0, 0]
    });

    // Week 1: 30 - 20 = 10 (== safetyStock, no order)
    expect(result.rows[0].netReq).toBe(0);
    expect(result.rows[0].endingInv).toBe(10);

    // Week 2: 10 - 20 = -10 -> netReq = 10 - (-10) = 20 -> L4L receipt 20 -> release in Week 1
    expect(result.rows[1].netReq).toBe(20);
    expect(result.rows[1].plannedReceipt).toBe(20);
    expect(result.rows[0].plannedRelease).toBe(20);
    expect(result.totalOrdersCount).toBe(3);
    expect(result.urgentPastDueRelease).toBe(0);
  });

  it('computes Fixed Lot (FX) rounding up to multiples of lot size and flags past-due urgent releases', () => {
    const result = calculateMRPPlan({
      initialStock: 10,
      safetyStock: 20,
      leadTimeWeeks: 2,
      lotPolicy: 'FIXED',
      fixedLotQty: 50,
      grossRequirements: [20, 20, 20, 20],
      scheduledReceipts: [0, 0, 0, 0]
    });

    // Week 1 needs 30 -> Fixed lot 50 -> release index = 0 - 2 = -2 (past due!)
    expect(result.rows[0].netReq).toBe(30);
    expect(result.rows[0].plannedReceipt).toBe(50);
    expect(result.urgentPastDueRelease).toBe(50);
  });

  it('reflects UTN TP3 Ej. 6b inventory discrepancy (-13 units) triggering earlier planned orders', () => {
    const normal = calculateMRPPlan({
      initialStock: 68,
      safetyStock: 10,
      leadTimeWeeks: 1,
      lotPolicy: 'L4L',
      fixedLotQty: 50,
      grossRequirements: [50, 50, 50, 50],
      scheduledReceipts: [0, 0, 0, 0]
    });

    const discrepant = calculateMRPPlan({
      initialStock: 55, // 68 - 13
      safetyStock: 10,
      leadTimeWeeks: 1,
      lotPolicy: 'L4L',
      fixedLotQty: 50,
      grossRequirements: [50, 50, 50, 50],
      scheduledReceipts: [0, 0, 0, 0]
    });

    // Normal Week 1: 68 - 50 = 18 >= 10 (no net req in week 1)
    expect(normal.rows[0].netReq).toBe(0);
    // Discrepant Week 1: 55 - 50 = 5 < 10 -> triggers immediate netReq = 5 in week 1 (past-due!)
    expect(discrepant.rows[0].netReq).toBe(5);
    expect(discrepant.urgentPastDueRelease).toBe(5);
  });

  it('explodes Level-1 CS03 BOM using O(1) Material Index', () => {
    const materialIndex = buildMaterialIndex(INITIAL_MATERIALS);
    const parent = materialIndex.get('MAT-A100')!;
    const plan = calculateMRPPlan({
      initialStock: 20,
      safetyStock: 20,
      leadTimeWeeks: 1,
      lotPolicy: 'FIXED',
      fixedLotQty: 50,
      grossRequirements: [20, 20, 20, 20, 20, 20],
      scheduledReceipts: [0, 0, 0, 0, 0, 0]
    });

    const exploded = calculateBOMExplosion(parent, plan.rows, materialIndex);
    expect(exploded).toHaveLength(2);
    const c300 = exploded.find(c => c.materialId === 'MAT-C300')!;
    const skf = exploded.find(c => c.materialId === 'MAT-3015')!;
    expect(skf.totalDerivedDemand).toBe(c300.totalDerivedDemand * 2);
  });
});
