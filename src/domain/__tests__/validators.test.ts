import { describe, it, expect } from 'vitest';
import {
  validateBlockStockInput,
  validateGoodsIssueInput,
  validateGoodsReceiptInput,
  validateReturnResolution,
  validateStockTransferInput
} from '../validators';
import { INITIAL_OUTBOUND_DELIVERIES, INITIAL_PURCHASE_ORDERS, INITIAL_RETURN_ORDERS, INITIAL_STOCKS } from '../../data/initialData';

describe('validators — Defensive Specification Rules', () => {
  it('rejects MIGO 101 over-delivery exceeding PO pending balance', () => {
    const po = INITIAL_PURCHASE_ORDERS[0];
    const res = validateGoodsReceiptInput(po, [
      { materialId: 'MAT-A100', qty: 999, storageLocationId: '0001', batch: 'LOT-1' }
    ]);
    expect(res.valid).toBe(false);
    expect(res.code).toBe('OVER_DELIVERY');
  });

  it('rejects MIGO 311 transfer when origin and destination storage locations are identical', () => {
    const res = validateStockTransferInput(INITIAL_STOCKS[0], 10, '0001', '0001');
    expect(res.valid).toBe(false);
    expect(res.code).toBe('SAME_LOCATION');
  });

  it('rejects MIGO 344 block when requested qty exceeds unrestricted stock', () => {
    const res = validateBlockStockInput(INITIAL_STOCKS[0], 500);
    expect(res.valid).toBe(false);
    expect(res.code).toBe('INSUFFICIENT_STOCK');
  });

  it('rejects VL02N PGI (601) when picking is incomplete or any of the 5 controls is unchecked', () => {
    const obd = INITIAL_OUTBOUND_DELIVERIES[0];
    expect(validateGoodsIssueInput(obd).code).toBe('PICKING_INCOMPLETE');

    const pickedButUnchecked = { ...obd, pickingStatus: 'COMPLETADO' as const };
    expect(validateGoodsIssueInput(pickedButUnchecked).code).toBe('CONTROLS_PENDING');

    const alreadyPosted = {
      ...pickedButUnchecked,
      pgiStatus: 'CONTABILIZADO' as const,
      controls: {
        verifiedCodesAndQty: true,
        consolidatedByDest: true,
        packedAndLabeled: true,
        loadWeightAndStabilityChecked: true,
        dispatchDocsReady: true
      }
    };
    expect(validateGoodsIssueInput(alreadyPosted).code).toBe('ALREADY_POSTED');
  });

  it('rejects return inspection resolution before physical MIGO 651 receipt', () => {
    const ret = INITIAL_RETURN_ORDERS[0];
    const res = validateReturnResolution(ret, 2);
    expect(res.valid).toBe(false);
    expect(res.code).toBe('NOT_RECEIVED_YET');
  });
});
