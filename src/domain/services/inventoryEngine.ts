import {
  Material,
  MaterialDocument,
  OperationalKPIBaseline,
  OutboundDelivery,
  PurchaseOrder,
  ReturnDisposition,
  ReturnOrder,
  StockRecord
} from '../../types/sap';
import { buildMaterialIndex, buildStockIndex } from '../indexes';
import {
  GoodsReceiptItemInput,
  validateBlockStockInput,
  validateCustomerReturnReceipt,
  validateGoodsIssueInput,
  validateGoodsReceiptInput,
  validateReturnResolution,
  validateStockTransferInput
} from '../validators';

export interface InventoryDomainState {
  materials: readonly Material[];
  stocks: StockRecord[];
  purchaseOrders: PurchaseOrder[];
  outboundDeliveries: OutboundDelivery[];
  returnOrders: ReturnOrder[];
  materialDocuments: MaterialDocument[];
  kpiBaseline: OperationalKPIBaseline;
}

export interface EngineTransactionResult {
  success: boolean;
  code?: string;
  docNumber?: string;
  message: string;
  nextState: InventoryDomainState;
}

function generateDocNumber(prefix: '500000' | '490000', seed?: string): string {
  if (seed) return `${prefix}${seed}`;
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Pure immutable transition: MIGO 101 Goods Receipt against Purchase Order.
 * Uses O(1) Map indexes for stock and material resolution.
 */
export function executeGoodsReceiptPO(
  state: InventoryDomainState,
  poId: string,
  itemsToReceive: readonly GoodsReceiptItemInput[],
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const po = state.purchaseOrders.find(p => p.id === poId);
  const validation = validateGoodsReceiptInput(po, itemsToReceive);
  if (!validation.valid || !po) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error de validación', nextState: state };
  }

  const docNum = generateDocNumber('500000', docSeed);
  const matIndex = buildMaterialIndex(state.materials);
  const stockMap = new Map(buildStockIndex(state.stocks));

  for (const item of itemsToReceive) {
    const stockId = `${po.plantId}-${item.storageLocationId}-${item.materialId}-${item.batch}`;
    const existing = stockMap.get(stockId);
    if (existing) {
      stockMap.set(stockId, {
        ...existing,
        unrestricted: existing.unrestricted + item.qty,
        lastMovementDate: date
      });
    } else {
      stockMap.set(stockId, {
        id: stockId,
        plantId: po.plantId,
        storageLocationId: item.storageLocationId,
        materialId: item.materialId,
        batch: item.batch,
        unrestricted: item.qty,
        qualityInspection: 0,
        blocked: 0,
        inTransit: 0,
        reserved: 0,
        lastMovementDate: date
      });
    }
  }

  const receivedByMat = new Map(itemsToReceive.map(r => [r.materialId, r.qty]));
  const nextPOs = state.purchaseOrders.map(p => {
    if (p.id !== poId) return p;
    const updatedItems = p.items.map(pItem => {
      const addQty = receivedByMat.get(pItem.materialId) ?? 0;
      return addQty > 0 ? { ...pItem, deliveredQty: pItem.deliveredQty + addQty } : pItem;
    });
    const allDone = updatedItems.every(i => i.deliveredQty >= i.orderedQty);
    return {
      ...p,
      items: updatedItems,
      status: allDone ? ('COMPLETADO' as const) : ('PARCIALMENTE_RECIBIDO' as const)
    };
  });

  const newDoc: MaterialDocument = {
    docNumber: docNum,
    postingDate: date,
    docDate: date,
    movementType: '101',
    movementDescription: 'Entrada de mercancías para pedido en almacén (101)',
    headerText: `Recepción OC ${po.id} — ${po.vendorName}`,
    createdBy: 'FRANCO_LOG_UTN',
    items: itemsToReceive.map((it, idx) => ({
      itemNumber: (idx + 1) * 10,
      materialId: it.materialId,
      quantity: it.qty,
      unit: matIndex.get(it.materialId)?.unit ?? 'UN',
      plantId: po.plantId,
      storageLocationId: it.storageLocationId,
      batch: it.batch,
      referenceDoc: po.id
    }))
  };

  return {
    success: true,
    docNumber: docNum,
    message: `Documento de material ${docNum} contabilizado para ${poId}.`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      purchaseOrders: nextPOs,
      materialDocuments: [newDoc, ...state.materialDocuments]
    }
  };
}

/**
 * Pure immutable transition: MIGO 311 Transfer Posting between storage locations.
 */
export function executeStockTransfer(
  state: InventoryDomainState,
  materialId: string,
  batch: string,
  qty: number,
  fromLoc: string,
  toLoc: string,
  plantId: string,
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const stockMap = new Map(buildStockIndex(state.stocks));
  const srcKey = `${plantId}-${fromLoc}-${materialId}-${batch}`;
  const sourceStock = stockMap.get(srcKey);

  const validation = validateStockTransferInput(sourceStock, qty, fromLoc, toLoc);
  if (!validation.valid || !sourceStock) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error en traspaso', nextState: state };
  }

  const docNum = generateDocNumber('500000', docSeed);
  const matIndex = buildMaterialIndex(state.materials);

  stockMap.set(srcKey, {
    ...sourceStock,
    unrestricted: sourceStock.unrestricted - qty,
    lastMovementDate: date
  });

  const destKey = `${plantId}-${toLoc}-${materialId}-${batch}`;
  const destStock = stockMap.get(destKey);
  const isQualityLoc = toLoc === '0002';

  if (destStock) {
    stockMap.set(destKey, {
      ...destStock,
      unrestricted: isQualityLoc ? destStock.unrestricted : destStock.unrestricted + qty,
      qualityInspection: isQualityLoc ? destStock.qualityInspection + qty : destStock.qualityInspection,
      lastMovementDate: date
    });
  } else {
    stockMap.set(destKey, {
      id: destKey,
      plantId,
      storageLocationId: toLoc,
      materialId,
      batch,
      unrestricted: isQualityLoc ? 0 : qty,
      qualityInspection: isQualityLoc ? qty : 0,
      blocked: 0,
      inTransit: 0,
      reserved: 0,
      lastMovementDate: date
    });
  }

  const newDoc: MaterialDocument = {
    docNumber: docNum,
    postingDate: date,
    docDate: date,
    movementType: '311',
    movementDescription: 'Traslado de almacén a almacén en 1 paso (311)',
    headerText: `Traspaso interno ${fromLoc} -> ${toLoc}`,
    createdBy: 'FRANCO_LOG_UTN',
    items: [
      {
        itemNumber: 10,
        materialId,
        quantity: qty,
        unit: matIndex.get(materialId)?.unit ?? 'UN',
        plantId,
        storageLocationId: fromLoc,
        toStorageLocationId: toLoc,
        batch
      }
    ]
  };

  return {
    success: true,
    docNumber: docNum,
    message: `Documento ${docNum} emitido (${fromLoc} -> ${toLoc}).`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      materialDocuments: [newDoc, ...state.materialDocuments]
    }
  };
}

/**
 * Pure immutable transition: MIGO 344 Block Stock (Unrestricted -> Blocked).
 */
export function executeBlockStock(
  state: InventoryDomainState,
  materialId: string,
  batch: string,
  qty: number,
  storageLocationId: string,
  plantId: string,
  reason: string,
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const stockMap = new Map(buildStockIndex(state.stocks));
  const key = `${plantId}-${storageLocationId}-${materialId}-${batch}`;
  const sourceStock = stockMap.get(key);

  const validation = validateBlockStockInput(sourceStock, qty);
  if (!validation.valid || !sourceStock) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error en bloqueo', nextState: state };
  }

  const docNum = generateDocNumber('500000', docSeed);
  const matIndex = buildMaterialIndex(state.materials);

  stockMap.set(key, {
    ...sourceStock,
    unrestricted: sourceStock.unrestricted - qty,
    blocked: sourceStock.blocked + qty,
    lastMovementDate: date
  });

  const newDoc: MaterialDocument = {
    docNumber: docNum,
    postingDate: date,
    docDate: date,
    movementType: '344',
    movementDescription: 'Traspaso Libre Utilización a Stock Bloqueado (344)',
    headerText: reason || 'Bloqueo preventivo por contingencia en depósito',
    createdBy: 'FRANCO_LOG_UTN',
    items: [
      {
        itemNumber: 10,
        materialId,
        quantity: qty,
        unit: matIndex.get(materialId)?.unit ?? 'UN',
        plantId,
        storageLocationId,
        batch
      }
    ]
  };

  return {
    success: true,
    docNumber: docNum,
    message: `${qty} u. de ${materialId} bloqueadas preventivamente. Doc. ${docNum}.`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      materialDocuments: [newDoc, ...state.materialDocuments]
    }
  };
}

/**
 * Pure immutable transition: MIGO 651 Customer Return to Blocked Stock (Almacén 0004).
 */
export function executeCustomerReturn(
  state: InventoryDomainState,
  returnOrderId: string,
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const ret = state.returnOrders.find(r => r.id === returnOrderId);
  const validation = validateCustomerReturnReceipt(ret);
  if (!validation.valid || !ret) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error en devolución', nextState: state };
  }

  const docNum = generateDocNumber('500000', docSeed);
  const matIndex = buildMaterialIndex(state.materials);
  const stockMap = new Map(buildStockIndex(state.stocks));

  const retStockKey = `1010-0004-${ret.materialId}-${ret.batch}`;
  const existing = stockMap.get(retStockKey);
  if (existing) {
    stockMap.set(retStockKey, { ...existing, blocked: existing.blocked + ret.quantity, lastMovementDate: date });
  } else {
    stockMap.set(retStockKey, {
      id: retStockKey,
      plantId: '1010',
      storageLocationId: '0004',
      materialId: ret.materialId,
      batch: ret.batch,
      unrestricted: 0,
      qualityInspection: 0,
      blocked: ret.quantity,
      inTransit: 0,
      reserved: 0,
      lastMovementDate: date
    });
  }

  const newDoc: MaterialDocument = {
    docNumber: docNum,
    postingDate: date,
    docDate: date,
    movementType: '651',
    movementDescription: 'Devolución de cliente a Stock Bloqueado de Devoluciones (651)',
    headerText: `Logística Inversa ${ret.id} — ${ret.customerName}`,
    createdBy: 'FRANCO_LOG_UTN',
    items: [
      {
        itemNumber: 10,
        materialId: ret.materialId,
        quantity: ret.quantity,
        unit: matIndex.get(ret.materialId)?.unit ?? 'UN',
        plantId: '1010',
        storageLocationId: '0004',
        batch: ret.batch,
        referenceDoc: ret.salesOrderRef
      }
    ]
  };

  return {
    success: true,
    docNumber: docNum,
    message: `${ret.quantity} u. ingresadas en Almacén 0004 (Bloqueado) para inspección. Doc. ${docNum}.`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      returnOrders: state.returnOrders.map(r => (r.id === returnOrderId ? { ...r, materialDocRef: docNum } : r)),
      kpiBaseline: { ...state.kpiBaseline, returnedUnits: state.kpiBaseline.returnedUnits + ret.quantity },
      materialDocuments: [newDoc, ...state.materialDocuments]
    }
  };
}

/**
 * Pure immutable transition: Resolve Return Inspection (Recoverable -> 0001 Unrestricted).
 */
export function executeReturnResolution(
  state: InventoryDomainState,
  returnOrderId: string,
  recoveredQty: number,
  disposition: ReturnDisposition,
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const ret = state.returnOrders.find(r => r.id === returnOrderId);
  const validation = validateReturnResolution(ret, recoveredQty);
  if (!validation.valid || !ret) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error en inspección', nextState: state };
  }

  const docNum = generateDocNumber('500000', docSeed);
  const stockMap = new Map(buildStockIndex(state.stocks));

  const retStockKey = `1010-0004-${ret.materialId}-${ret.batch}`;
  const src = stockMap.get(retStockKey);
  if (src) {
    stockMap.set(retStockKey, {
      ...src,
      blocked: Math.max(0, src.blocked - ret.quantity),
      lastMovementDate: date
    });
  }

  if (recoveredQty > 0) {
    const destKey = `1010-0001-${ret.materialId}-${ret.batch}`;
    const dest = stockMap.get(destKey);
    if (dest) {
      stockMap.set(destKey, {
        ...dest,
        unrestricted: dest.unrestricted + recoveredQty,
        lastMovementDate: date
      });
    } else {
      stockMap.set(destKey, {
        id: destKey,
        plantId: '1010',
        storageLocationId: '0001',
        materialId: ret.materialId,
        batch: ret.batch,
        unrestricted: recoveredQty,
        qualityInspection: 0,
        blocked: 0,
        inTransit: 0,
        reserved: 0,
        lastMovementDate: date
      });
    }
  }

  return {
    success: true,
    docNumber: docNum,
    message: `${recoveredQty} u. recuperadas hacia Libre Utilización (0001). Tasa de recuperación actualizada en CMI.`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      returnOrders: state.returnOrders.map(r => (r.id === returnOrderId ? { ...r, disposition, recoveredQty } : r)),
      kpiBaseline: { ...state.kpiBaseline, recoveredUnits: state.kpiBaseline.recoveredUnits + recoveredQty }
    }
  };
}

/**
 * Pure immutable transition: VL02N Post Goods Issue (PGI 601).
 */
export function executeGoodsIssue(
  state: InventoryDomainState,
  deliveryId: string,
  date = todayISO(),
  docSeed?: string
): EngineTransactionResult {
  const obd = state.outboundDeliveries.find(d => d.id === deliveryId);
  const validation = validateGoodsIssueInput(obd);
  if (!validation.valid || !obd) {
    return { success: false, code: validation.code, message: validation.message ?? 'Error en PGI', nextState: state };
  }

  const docNum = generateDocNumber('490000', docSeed);
  const matIndex = buildMaterialIndex(state.materials);
  const stockMap = new Map(buildStockIndex(state.stocks));

  let totalDispatchedUnits = 0;

  for (const it of obd.items) {
    totalDispatchedUnits += it.pickedQty;
    const key = `1010-${it.storageLocationId}-${it.materialId}-${it.batch}`;
    const stock = stockMap.get(key);
    if (stock) {
      stockMap.set(key, {
        ...stock,
        unrestricted: Math.max(0, stock.unrestricted - it.pickedQty),
        reserved: Math.max(0, stock.reserved - it.pickedQty),
        lastMovementDate: date
      });
    }
  }

  const newDoc: MaterialDocument = {
    docNumber: docNum,
    postingDate: date,
    docDate: date,
    movementType: '601',
    movementDescription: 'Salida de mercancías para entrega a cliente (PGI 601)',
    headerText: `Despacho Entrega ${deliveryId} — Ruta ${obd.routeKm} km (${obd.transportMode})`,
    createdBy: 'FRANCO_LOG_UTN',
    items: obd.items.map(it => ({
      itemNumber: it.itemNumber,
      materialId: it.materialId,
      quantity: it.pickedQty,
      unit: matIndex.get(it.materialId)?.unit ?? 'UN',
      plantId: '1010',
      storageLocationId: it.storageLocationId,
      batch: it.batch,
      referenceDoc: deliveryId
    }))
  };

  return {
    success: true,
    docNumber: docNum,
    message: `Camión liberado. Doc. Material ${docNum}. KPIs OTIF actualizados en CMI.`,
    nextState: {
      ...state,
      stocks: Array.from(stockMap.values()),
      outboundDeliveries: state.outboundDeliveries.map(d =>
        d.id === deliveryId ? { ...d, pgiStatus: 'CONTABILIZADO' as const, materialDocRef: docNum } : d
      ),
      kpiBaseline: {
        ...state.kpiBaseline,
        dispatchedOrders: state.kpiBaseline.dispatchedOrders + 1,
        errorFreeOrders: state.kpiBaseline.errorFreeOrders + 1,
        onTimeDepartures: state.kpiBaseline.onTimeDepartures + 1,
        otifDeliveries: state.kpiBaseline.otifDeliveries + 1,
        deliveredUnits: state.kpiBaseline.deliveredUnits + totalDispatchedUnits
      },
      materialDocuments: [newDoc, ...state.materialDocuments]
    }
  };
}
