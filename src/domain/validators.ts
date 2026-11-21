import { OutboundDelivery, PurchaseOrder, ReturnOrder, StockRecord } from '../types/sap';

export interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
}

export interface GoodsReceiptItemInput {
  materialId: string;
  qty: number;
  storageLocationId: string;
  batch: string;
}

/**
 * Validates MIGO 101 Goods Receipt against an open Purchase Order.
 */
export function validateGoodsReceiptInput(
  po: PurchaseOrder | undefined,
  items: readonly GoodsReceiptItemInput[]
): ValidationResult {
  if (!po) {
    return { valid: false, code: 'PO_NOT_FOUND', message: 'El pedido de compra de referencia no existe.' };
  }
  if (items.length === 0) {
    return { valid: false, code: 'EMPTY_ITEMS', message: 'Debe seleccionar al menos una posición con cantidad mayor a cero.' };
  }

  const poItemMap = new Map(po.items.map(i => [i.materialId, i]));

  for (const item of items) {
    if (!Number.isFinite(item.qty) || item.qty <= 0) {
      return { valid: false, code: 'INVALID_QTY', message: `Cantidad inválida para material ${item.materialId}.` };
    }
    if (!item.batch.trim()) {
      return { valid: false, code: 'MISSING_BATCH', message: `Debe especificar un lote para ${item.materialId}.` };
    }
    const poLine = poItemMap.get(item.materialId);
    if (!poLine) {
      return { valid: false, code: 'MATERIAL_NOT_IN_PO', message: `El material ${item.materialId} no pertenece al pedido ${po.id}.` };
    }
    const remaining = poLine.orderedQty - poLine.deliveredQty;
    if (item.qty > remaining) {
      return {
        valid: false,
        code: 'OVER_DELIVERY',
        message: `La cantidad a recibir (${item.qty}) excede el saldo pendiente (${remaining}) para ${item.materialId}.`
      };
    }
  }

  return { valid: true };
}

/**
 * Validates MIGO 311 Transfer Posting between storage locations.
 */
export function validateStockTransferInput(
  sourceStock: StockRecord | undefined,
  qty: number,
  fromLoc: string,
  toLoc: string
): ValidationResult {
  if (fromLoc === toLoc) {
    return { valid: false, code: 'SAME_LOCATION', message: 'El almacén emisor y receptor no pueden ser iguales.' };
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    return { valid: false, code: 'INVALID_QTY', message: 'La cantidad a trasladar debe ser mayor a cero.' };
  }
  if (!sourceStock || sourceStock.unrestricted < qty) {
    return {
      valid: false,
      code: 'INSUFFICIENT_STOCK',
      message: `Stock libre insuficiente en almacén ${fromLoc}. Disponible: ${sourceStock?.unrestricted ?? 0}.`
    };
  }
  return { valid: true };
}

/**
 * Validates MIGO 344 Block Stock (Unrestricted -> Blocked).
 */
export function validateBlockStockInput(
  sourceStock: StockRecord | undefined,
  qty: number
): ValidationResult {
  if (!Number.isFinite(qty) || qty <= 0) {
    return { valid: false, code: 'INVALID_QTY', message: 'La cantidad a bloquear debe ser mayor a cero.' };
  }
  if (!sourceStock || sourceStock.unrestricted < qty) {
    return {
      valid: false,
      code: 'INSUFFICIENT_STOCK',
      message: `Stock libre insuficiente para bloqueo. Disponible: ${sourceStock?.unrestricted ?? 0}.`
    };
  }
  return { valid: true };
}

/**
 * Validates MIGO 651 Customer Return reception (idempotent).
 */
export function validateCustomerReturnReceipt(ret: ReturnOrder | undefined): ValidationResult {
  if (!ret) {
    return { valid: false, code: 'RETURN_NOT_FOUND', message: 'La orden de devolución no existe.' };
  }
  if (ret.materialDocRef) {
    return {
      valid: false,
      code: 'ALREADY_RECEIVED',
      message: `La devolución ${ret.id} ya fue ingresada con documento ${ret.materialDocRef}.`
    };
  }
  return { valid: true };
}

/**
 * Validates Return Inspection resolution.
 */
export function validateReturnResolution(
  ret: ReturnOrder | undefined,
  recoveredQty: number
): ValidationResult {
  if (!ret || !ret.materialDocRef) {
    return {
      valid: false,
      code: 'NOT_RECEIVED_YET',
      message: 'Debe contabilizar primero la recepción física (Mov. 651) antes de clasificar la inspección.'
    };
  }
  if (ret.disposition !== 'PENDIENTE_INSPECCION') {
    return { valid: false, code: 'ALREADY_RESOLVED', message: 'Esta devolución ya fue clasificada y cerrada.' };
  }
  if (!Number.isFinite(recoveredQty) || recoveredQty < 0 || recoveredQty > ret.quantity) {
    return {
      valid: false,
      code: 'INVALID_RECOVERED_QTY',
      message: `Las unidades recuperables deben estar entre 0 y ${ret.quantity}.`
    };
  }
  return { valid: true };
}

/**
 * Validates VL02N Post Goods Issue (PGI 601) — enforces Picking 100%, 5 controls, and idempotency.
 */
export function validateGoodsIssueInput(delivery: OutboundDelivery | undefined): ValidationResult {
  if (!delivery) {
    return { valid: false, code: 'DELIVERY_NOT_FOUND', message: 'La entrega saliente no existe.' };
  }
  if (delivery.pgiStatus === 'CONTABILIZADO') {
    return { valid: false, code: 'ALREADY_POSTED', message: 'La salida de mercancías (PGI) ya fue contabilizada.' };
  }
  if (delivery.pickingStatus !== 'COMPLETADO') {
    return {
      valid: false,
      code: 'PICKING_INCOMPLETE',
      message: 'SAP exige Picking 100% completado antes de contabilizar PGI.'
    };
  }
  const allControlsOk = Object.values(delivery.controls).every(Boolean);
  if (!allControlsOk) {
    return {
      valid: false,
      code: 'CONTROLS_PENDING',
      message: 'Completa los 5 controles de expedición (verificación, consolidación, embalaje, carga y remito).'
    };
  }
  return { valid: true };
}
