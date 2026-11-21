import { describe, it, expect } from 'vitest';
import {
  InventoryDomainState,
  executeBlockStock,
  executeCustomerReturn,
  executeGoodsIssue,
  executeGoodsReceiptPO,
  executeReturnResolution
} from '../services/inventoryEngine';
import { InMemoryStateRepository } from '../../infrastructure/storageRepository';
import {
  INITIAL_KPI_BASELINE,
  INITIAL_MATERIALS,
  INITIAL_OUTBOUND_DELIVERIES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RETURN_ORDERS,
  INITIAL_STOCKS
} from '../../data/initialData';

function createInitialState(): InventoryDomainState {
  return {
    materials: INITIAL_MATERIALS,
    stocks: structuredClone(INITIAL_STOCKS),
    purchaseOrders: structuredClone(INITIAL_PURCHASE_ORDERS),
    outboundDeliveries: structuredClone(INITIAL_OUTBOUND_DELIVERIES),
    returnOrders: structuredClone(INITIAL_RETURN_ORDERS),
    materialDocuments: [],
    kpiBaseline: structuredClone(INITIAL_KPI_BASELINE)
  };
}

describe('Integration Tests — End-to-End UTN SAP Logistics Workflows', () => {
  it('TecnoSur Crisis Flow: MIGO 344 Block -> MIGO 101 Emergency PO P3 -> VL02N PGI 601', () => {
    let state = createInitialState();

    // Step 1: Flood blocks 17 units of MAT-A100 (60 -> 43 usable, 17 blocked)
    const blockRes = executeBlockStock(
      state,
      'MAT-A100',
      'LOT-TS-A1',
      17,
      '0001',
      '1010',
      'Inundación TecnoSur',
      '2026-11-21',
      '1001'
    );
    expect(blockRes.success).toBe(true);
    expect(blockRes.docNumber).toBe('5000001001');
    state = blockRes.nextState;

    const matAAfterFlood = state.stocks.find(s => s.id === '1010-0001-MAT-A100-LOT-TS-A1')!;
    expect(matAAfterFlood.unrestricted).toBe(43);
    expect(matAAfterFlood.blocked).toBe(17);

    // Step 2: Receive Emergency PO P3 (PO-4500000102) -> +25 MAT-A100, +35 MAT-B200, +35 MAT-C300
    const grRes = executeGoodsReceiptPO(
      state,
      'PO-4500000102',
      [
        { materialId: 'MAT-A100', qty: 25, storageLocationId: '0001', batch: 'LOT-TS-A1' },
        { materialId: 'MAT-B200', qty: 35, storageLocationId: '0001', batch: 'LOT-TS-B1' },
        { materialId: 'MAT-C300', qty: 35, storageLocationId: '0001', batch: 'LOT-TS-C1' }
      ],
      '2026-11-21',
      '1002'
    );
    expect(grRes.success).toBe(true);
    state = grRes.nextState;

    const poP3 = state.purchaseOrders.find(p => p.id === 'PO-4500000102')!;
    expect(poP3.status).toBe('COMPLETADO');
    expect(state.stocks.find(s => s.id === '1010-0001-MAT-A100-LOT-TS-A1')!.unrestricted).toBe(68); // 43 + 25

    // Step 3: Complete picking & 5 controls on Strategic Delivery 8000002140 and post PGI (601)
    state = {
      ...state,
      outboundDeliveries: state.outboundDeliveries.map(d =>
        d.id === '8000002140'
          ? {
              ...d,
              pickingStatus: 'COMPLETADO',
              items: d.items.map(it => ({ ...it, pickedQty: it.deliveryQty })),
              controls: {
                verifiedCodesAndQty: true,
                consolidatedByDest: true,
                packedAndLabeled: true,
                loadWeightAndStabilityChecked: true,
                dispatchDocsReady: true
              }
            }
          : d
      )
    };

    const pgiRes = executeGoodsIssue(state, '8000002140', '2026-11-21', '2001');
    expect(pgiRes.success).toBe(true);
    expect(pgiRes.docNumber).toBe('4900002001');
    state = pgiRes.nextState;

    // Verify final MAT-A100 unrestricted: 68 - 40 dispatched = 28; blocked still 17
    const finalMatA = state.stocks.find(s => s.id === '1010-0001-MAT-A100-LOT-TS-A1')!;
    expect(finalMatA.unrestricted).toBe(28);
    expect(finalMatA.blocked).toBe(17);

    // Verify 3 Material Documents created (601, 101, 344) and CMI KPI incremented
    expect(state.materialDocuments.map(d => d.movementType)).toEqual(['601', '101', '344']);
    expect(state.kpiBaseline.dispatchedOrders).toBe(501);
    expect(state.kpiBaseline.otifDeliveries).toBe(439);
  });

  it('Metalúrgica del Sur Reverse Logistics Flow: MIGO 651 -> Almacén 0004 Blocked -> Inspection Recovers 2 u.', () => {
    let state = createInitialState();

    // Step 1: Receive 5 returned motors into Almacén 0004 Blocked (NEVER 0001 Unrestricted!)
    const retRes = executeCustomerReturn(state, 'RET-6500001', '2026-11-21', '3001');
    expect(retRes.success).toBe(true);
    state = retRes.nextState;

    const blockedReturnStock = state.stocks.find(s => s.id === '1010-0004-MAT-A100-LOT-MS-09')!;
    expect(blockedReturnStock.blocked).toBe(5);
    expect(blockedReturnStock.unrestricted).toBe(0);
    expect(state.kpiBaseline.returnedUnits).toBe(85); // 80 + 5

    // Step 2: Resolve inspection — 2 units recovered to 0001 Unrestricted, 3 units scrapped/repaired
    const inspRes = executeReturnResolution(state, 'RET-6500001', 2, 'REACONDICIONAR', '2026-11-21', '3002');
    expect(inspRes.success).toBe(true);
    state = inspRes.nextState;

    expect(state.stocks.find(s => s.id === '1010-0004-MAT-A100-LOT-MS-09')!.blocked).toBe(0);
    expect(state.stocks.find(s => s.id === '1010-0001-MAT-A100-LOT-MS-09')!.unrestricted).toBe(2);
    expect(state.kpiBaseline.recoveredUnits).toBe(62); // 60 + 2
  });

  it('InMemoryStateRepository fulfills DIP contract with roundtrip persistence', () => {
    const repo = new InMemoryStateRepository();
    repo.save('TEST_STOCK', INITIAL_STOCKS);
    expect(repo.load('TEST_STOCK', [])).toEqual(INITIAL_STOCKS);
    repo.remove('TEST_STOCK');
    expect(repo.load('TEST_STOCK', [])).toEqual([]);
  });
});
