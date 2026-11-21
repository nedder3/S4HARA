import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Material,
  StockRecord,
  Plant,
  StorageLocation,
  PurchaseOrder,
  SalesOrder,
  OutboundDelivery,
  ExpeditionControls,
  ReturnOrder,
  ReturnDisposition,
  StorageBin,
  MaterialDocument,
  MRPWeeklySchedule,
  OperationalKPIBaseline,
  CaseStudy
} from '../types/sap';
import {
  INITIAL_PLANTS,
  INITIAL_STORAGE_LOCATIONS,
  INITIAL_MATERIALS,
  INITIAL_STOCKS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SALES_ORDERS,
  INITIAL_OUTBOUND_DELIVERIES,
  INITIAL_RETURN_ORDERS,
  INITIAL_STORAGE_BINS,
  INITIAL_MRP_SCHEDULES,
  INITIAL_KPI_BASELINE,
  INITIAL_CASE_STUDIES
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export type AppView =
  | 'LAUNCHPAD'
  | 'MMBE'
  | 'MIGO'
  | 'ME21N'
  | 'VL01N'
  | 'MD04'
  | 'MC40'
  | 'CMI'
  | 'EWM_RACK'
  | 'CASES';

interface SAPContextType {
  // Navigation & Shell
  activeApp: AppView;
  setActiveApp: (app: AppView) => void;
  isJouleOpen: boolean;
  setIsJouleOpen: (open: boolean) => void;
  activeCaseStudyId: string | null;
  setActiveCaseStudyId: (id: string | null) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  executeTCode: (tcode: string) => boolean;

  // Master Data & Operations
  plants: Plant[];
  storageLocations: StorageLocation[];
  materials: Material[];
  stocks: StockRecord[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  outboundDeliveries: OutboundDelivery[];
  returnOrders: ReturnOrder[];
  storageBins: StorageBin[];
  materialDocuments: MaterialDocument[];
  mrpSchedules: MRPWeeklySchedule[];
  kpiBaseline: OperationalKPIBaseline;
  caseStudies: CaseStudy[];

  // Logistics Business Logic Dispatchers
  postGoodsReceiptPO: (
    poId: string,
    itemsToReceive: { materialId: string; qty: number; storageLocationId: string; batch: string }[]
  ) => { success: boolean; docNumber?: string; message: string };

  postStockTransfer: (
    materialId: string,
    batch: string,
    qty: number,
    fromLoc: string,
    toLoc: string,
    plantId: string
  ) => { success: boolean; docNumber?: string; message: string };

  postBlockStock: (
    materialId: string,
    batch: string,
    qty: number,
    storageLocationId: string,
    plantId: string,
    reason: string
  ) => { success: boolean; docNumber?: string; message: string };

  postCustomerReturn: (
    returnOrderId: string
  ) => { success: boolean; docNumber?: string; message: string };

  resolveReturnInspection: (
    returnOrderId: string,
    recoveredQty: number,
    disposition: ReturnDisposition
  ) => { success: boolean; docNumber?: string; message: string };

  createPurchaseOrder: (
    vendorName: string,
    vendorReliability: number,
    leadTimeHours: number,
    materialId: string,
    qty: number,
    netPrice: number
  ) => { success: boolean; poId: string };

  toggleDeliveryControl: (
    deliveryId: string,
    controlKey: keyof ExpeditionControls
  ) => void;

  confirmPicking: (deliveryId: string) => { success: boolean; message: string };

  postGoodsIssue: (deliveryId: string) => { success: boolean; docNumber?: string; message: string };

  completeCaseStep: (caseId: string, stepId: number) => void;
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = 'S4HARA_SAP_UTN_V2';

const SAPContext = createContext<SAPContextType | undefined>(undefined);

export const SAPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeApp, setActiveApp] = useState<AppView>('LAUNCHPAD');
  const [isJouleOpen, setIsJouleOpen] = useState(false);
  const [activeCaseStudyId, setActiveCaseStudyId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent Domain States
  const [plants] = useState<Plant[]>(INITIAL_PLANTS);
  const [storageLocations] = useState<StorageLocation[]>(INITIAL_STORAGE_LOCATIONS);
  const [materials] = useState<Material[]>(INITIAL_MATERIALS);
  const [mrpSchedules] = useState<MRPWeeklySchedule[]>(INITIAL_MRP_SCHEDULES);

  const [stocks, setStocks] = useState<StockRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_STOCKS`);
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_PO`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [salesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_SO`);
    return saved ? JSON.parse(saved) : INITIAL_SALES_ORDERS;
  });

  const [outboundDeliveries, setOutboundDeliveries] = useState<OutboundDelivery[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_OBD`);
    return saved ? JSON.parse(saved) : INITIAL_OUTBOUND_DELIVERIES;
  });

  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_RET`);
    return saved ? JSON.parse(saved) : INITIAL_RETURN_ORDERS;
  });

  const [storageBins, setStorageBins] = useState<StorageBin[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_BINS`);
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_BINS;
  });

  const [materialDocuments, setMaterialDocuments] = useState<MaterialDocument[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_DOCS`);
    return saved ? JSON.parse(saved) : [];
  });

  const [kpiBaseline, setKpiBaseline] = useState<OperationalKPIBaseline>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_KPI`);
    return saved ? JSON.parse(saved) : INITIAL_KPI_BASELINE;
  });

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_CASES`);
    return saved ? JSON.parse(saved) : INITIAL_CASE_STUDIES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_STOCKS`, JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_PO`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_OBD`, JSON.stringify(outboundDeliveries));
  }, [outboundDeliveries]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_RET`, JSON.stringify(returnOrders));
  }, [returnOrders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_BINS`, JSON.stringify(storageBins));
  }, [storageBins]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_DOCS`, JSON.stringify(materialDocuments));
  }, [materialDocuments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_KPI`, JSON.stringify(kpiBaseline));
  }, [kpiBaseline]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_CASES`, JSON.stringify(caseStudies));
  }, [caseStudies]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('es-AR')
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const executeTCode = (cmd: string): boolean => {
    const normalized = cmd.trim().toUpperCase().replace(/^\/N/, '');

    switch (normalized) {
      case 'MMBE':
      case 'STOCK':
      case 'INVENTARIO':
        setActiveApp('MMBE');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Resumen de Stock (MMBE)');
        return true;
      case 'MIGO':
      case 'ENTRADA':
      case 'MOVIMIENTOS':
      case 'DEVOLUCIONES':
      case '344':
      case '651':
        setActiveApp('MIGO');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Movimientos de Mercancías (MIGO)');
        return true;
      case 'ME21N':
      case 'ME22N':
      case 'ME23N':
      case 'ME51N':
      case 'PO':
      case 'COMPRAS':
        setActiveApp('ME21N');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Gestión de Compras y Proveedores (ME21N)');
        return true;
      case 'VL01N':
      case 'VL02N':
      case 'VL03N':
      case 'EXPEDICION':
      case 'PICKING':
      case 'MUELLES':
        setActiveApp('VL01N');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Expedición, Picking y Muelles (VL02N)');
        return true;
      case 'MD04':
      case 'MD01':
      case 'CS03':
      case 'MRP':
      case 'BOM':
        setActiveApp('MD04');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Monitor MRP & Lista de Materiales (MD04 / CS03)');
        return true;
      case 'MC40':
      case 'ABC':
      case 'PARETO':
        setActiveApp('MC40');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Análisis de Inventarios ABC / Pareto (MC40)');
        return true;
      case 'CMI':
      case 'OTIF':
      case 'KPI':
      case 'TABLERO':
        setActiveApp('CMI');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo al Tablero Analítico CMI / OTIF');
        return true;
      case 'EWM':
      case 'WM':
      case 'RACKS':
      case 'UBICACIONES':
        setActiveApp('EWM_RACK');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Mapa de Almacén & Racks (EWM)');
        return true;
      case 'CASOS':
      case 'TECNOSUR':
      case 'PRACTICA':
      case 'UTN':
        setActiveApp('CASES');
        addToast('info', 'Navegación SAP Fiori', 'Accediendo a Misiones Prácticas UTN-to-SAP');
        return true;
      case 'HOME':
      case 'INICIO':
      case 'LAUNCHPAD':
        setActiveApp('LAUNCHPAD');
        return true;
      default:
        addToast('warning', 'Código de Transacción no encontrado', `El T-Code '${cmd}' no está habilitado. Prueba: MMBE, MIGO, MD04, MC40, ME21N, VL02N, CMI o EWM.`);
        return false;
    }
  };

  const completeCaseStep = (caseId: string, stepId: number) => {
    setCaseStudies(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const alreadyCompleted = c.steps.find(s => s.id === stepId)?.isCompleted;
        if (alreadyCompleted) return c;
        const updatedSteps = c.steps.map(s => (s.id === stepId ? { ...s, isCompleted: true } : s));
        const allDone = updatedSteps.every(s => s.isCompleted);
        if (allDone && !c.isCompleted) {
          addToast('success', 'Misión Completada', `Completaste el caso práctico: ${c.title}`);
        }
        return { ...c, steps: updatedSteps, isCompleted: allDone };
      })
    );
  };

  // MIGO 101: Goods Receipt against Purchase Order
  const postGoodsReceiptPO = (
    poId: string,
    itemsToReceive: { materialId: string; qty: number; storageLocationId: string; batch: string }[]
  ) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) {
      addToast('error', 'Error en Pedido', `El pedido ${poId} no fue encontrado.`);
      return { success: false, message: 'Pedido no encontrado' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '101',
      movementDescription: 'Entrada de mercancías para pedido en almacén (101)',
      headerText: `Recepción OC ${po.id} — ${po.vendorName}`,
      createdBy: 'FRANCO_LOG_UTN',
      items: itemsToReceive.map((it, idx) => ({
        itemNumber: (idx + 1) * 10,
        materialId: it.materialId,
        quantity: it.qty,
        unit: materials.find(m => m.id === it.materialId)?.unit || 'UN',
        plantId: po.plantId,
        storageLocationId: it.storageLocationId,
        batch: it.batch,
        referenceDoc: po.id
      }))
    };

    setStocks(prev => {
      const next = [...prev];
      itemsToReceive.forEach(item => {
        const stockId = `${po.plantId}-${item.storageLocationId}-${item.materialId}-${item.batch}`;
        const existingIdx = next.findIndex(s => s.id === stockId);
        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            unrestricted: next[existingIdx].unrestricted + item.qty,
            lastMovementDate: today
          };
        } else {
          next.push({
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
            lastMovementDate: today
          });
        }
      });
      return next;
    });

    setPurchaseOrders(prev =>
      prev.map(p => {
        if (p.id !== poId) return p;
        const updatedItems = p.items.map(pItem => {
          const received = itemsToReceive.find(r => r.materialId === pItem.materialId);
          return received ? { ...pItem, deliveredQty: pItem.deliveredQty + received.qty } : pItem;
        });
        const allCompleted = updatedItems.every(i => i.deliveredQty >= i.orderedQty);
        return {
          ...p,
          items: updatedItems,
          status: allCompleted ? 'COMPLETADO' : 'PARCIALMENTE_RECIBIDO'
        };
      })
    );

    setMaterialDocuments(prev => [newDoc, ...prev]);

    if (poId === 'PO-4500000102') {
      completeCaseStep('CASE-TECNOSUR', 3);
    }

    addToast('success', 'Entrada Contabilizada (101)', `Documento de material ${docNum} contabilizado para ${poId}.`);
    return { success: true, docNumber: docNum, message: 'Entrada registrada' };
  };

  // MIGO 311: Transfer Posting between storage locations
  const postStockTransfer = (
    materialId: string,
    batch: string,
    qty: number,
    fromLoc: string,
    toLoc: string,
    plantId: string
  ) => {
    if (fromLoc === toLoc) {
      addToast('error', 'Error en Traslado', 'El almacén emisor y receptor no pueden ser iguales.');
      return { success: false, message: 'Almacenes idénticos' };
    }

    const sourceStock = stocks.find(
      s => s.plantId === plantId && s.storageLocationId === fromLoc && s.materialId === materialId && s.batch === batch
    );

    if (!sourceStock || sourceStock.unrestricted < qty) {
      addToast('error', 'Stock Insuficiente', `Disponible en ${fromLoc}: ${sourceStock?.unrestricted || 0} u.`);
      return { success: false, message: 'Stock insuficiente' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    setStocks(prev => {
      const next = [...prev];
      const srcIdx = next.findIndex(s => s.id === sourceStock.id);
      if (srcIdx >= 0) {
        next[srcIdx] = { ...next[srcIdx], unrestricted: next[srcIdx].unrestricted - qty, lastMovementDate: today };
      }

      const destId = `${plantId}-${toLoc}-${materialId}-${batch}`;
      const destIdx = next.findIndex(s => s.id === destId);
      if (destIdx >= 0) {
        next[destIdx] = {
          ...next[destIdx],
          unrestricted: toLoc === '0002' ? next[destIdx].unrestricted : next[destIdx].unrestricted + qty,
          qualityInspection: toLoc === '0002' ? next[destIdx].qualityInspection + qty : next[destIdx].qualityInspection,
          lastMovementDate: today
        };
      } else {
        next.push({
          id: destId,
          plantId,
          storageLocationId: toLoc,
          materialId,
          batch,
          unrestricted: toLoc === '0002' ? 0 : qty,
          qualityInspection: toLoc === '0002' ? qty : 0,
          blocked: 0,
          inTransit: 0,
          reserved: 0,
          lastMovementDate: today
        });
      }
      return next;
    });

    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '311',
      movementDescription: 'Traslado de almacén a almacén en 1 paso (311)',
      headerText: `Traspaso interno ${fromLoc} -> ${toLoc}`,
      createdBy: 'FRANCO_LOG_UTN',
      items: [
        {
          itemNumber: 10,
          materialId,
          quantity: qty,
          unit: materials.find(m => m.id === materialId)?.unit || 'UN',
          plantId,
          storageLocationId: fromLoc,
          toStorageLocationId: toLoc,
          batch
        }
      ]
    };

    setMaterialDocuments(prev => [newDoc, ...prev]);
    addToast('success', 'Traspaso Contabilizado (311)', `Documento ${docNum} emitido (${fromLoc} -> ${toLoc}).`);
    return { success: true, docNumber: docNum, message: 'Traspaso realizado' };
  };

  // MIGO 344: Block Stock (Unrestricted -> Blocked, e.g. TecnoSur flood)
  const postBlockStock = (
    materialId: string,
    batch: string,
    qty: number,
    storageLocationId: string,
    plantId: string,
    reason: string
  ) => {
    const sourceStock = stocks.find(
      s => s.plantId === plantId && s.storageLocationId === storageLocationId && s.materialId === materialId && s.batch === batch
    );

    if (!sourceStock || sourceStock.unrestricted < qty || qty <= 0) {
      addToast('error', 'Error de Bloqueo (344)', `Stock libre insuficiente en ${storageLocationId}. Disponible: ${sourceStock?.unrestricted || 0}.`);
      return { success: false, message: 'Stock insuficiente para bloquear' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    setStocks(prev =>
      prev.map(s =>
        s.id === sourceStock.id
          ? {
              ...s,
              unrestricted: s.unrestricted - qty,
              blocked: s.blocked + qty,
              lastMovementDate: today
            }
          : s
      )
    );

    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '344',
      movementDescription: 'Traspaso Libre Utilización a Stock Bloqueado (344)',
      headerText: reason || 'Bloqueo preventivo por contingencia en depósito',
      createdBy: 'FRANCO_LOG_UTN',
      items: [
        {
          itemNumber: 10,
          materialId,
          quantity: qty,
          unit: materials.find(m => m.id === materialId)?.unit || 'UN',
          plantId,
          storageLocationId,
          batch
        }
      ]
    };

    setMaterialDocuments(prev => [newDoc, ...prev]);

    if (materialId === 'MAT-A100' && qty === 17) {
      completeCaseStep('CASE-TECNOSUR', 1);
    }

    addToast('warning', 'Stock Bloqueado (Mov. 344)', `${qty} u. de ${materialId} bloqueadas preventivamente. Doc. ${docNum}.`);
    return { success: true, docNumber: docNum, message: 'Stock bloqueado' };
  };

  // MIGO 651: Customer Return to Blocked Returns Stock (Almacén 0004)
  const postCustomerReturn = (returnOrderId: string) => {
    const ret = returnOrders.find(r => r.id === returnOrderId);
    if (!ret) {
      addToast('error', 'Devolución no encontrada', `No existe la orden ${returnOrderId}`);
      return { success: false, message: 'No encontrada' };
    }
    if (ret.materialDocRef) {
      addToast('info', 'Ya recepcionada', `La devolución ${returnOrderId} ya ingresó con doc. ${ret.materialDocRef}.`);
      return { success: false, message: 'Ya recepcionada' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    setStocks(prev => {
      const next = [...prev];
      const stockId = `1010-0004-${ret.materialId}-${ret.batch}`;
      const idx = next.findIndex(s => s.id === stockId);
      if (idx >= 0) {
        next[idx] = { ...next[idx], blocked: next[idx].blocked + ret.quantity, lastMovementDate: today };
      } else {
        next.push({
          id: stockId,
          plantId: '1010',
          storageLocationId: '0004',
          materialId: ret.materialId,
          batch: ret.batch,
          unrestricted: 0,
          qualityInspection: 0,
          blocked: ret.quantity,
          inTransit: 0,
          reserved: 0,
          lastMovementDate: today
        });
      }
      return next;
    });

    setReturnOrders(prev =>
      prev.map(r => (r.id === returnOrderId ? { ...r, materialDocRef: docNum } : r))
    );

    setKpiBaseline(prev => ({
      ...prev,
      returnedUnits: prev.returnedUnits + ret.quantity
    }));

    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '651',
      movementDescription: 'Devolución de cliente a Stock Bloqueado de Devoluciones (651)',
      headerText: `Logística Inversa ${ret.id} — ${ret.customerName}`,
      createdBy: 'FRANCO_LOG_UTN',
      items: [
        {
          itemNumber: 10,
          materialId: ret.materialId,
          quantity: ret.quantity,
          unit: materials.find(m => m.id === ret.materialId)?.unit || 'UN',
          plantId: '1010',
          storageLocationId: '0004',
          batch: ret.batch,
          referenceDoc: ret.salesOrderRef
        }
      ]
    };

    setMaterialDocuments(prev => [newDoc, ...prev]);
    completeCaseStep('CASE-DEVOLUCIONES', 1);

    addToast('info', 'Devolución Ingresada (Mov. 651)', `${ret.quantity} u. ingresadas en Almacén 0004 (Bloqueado) para inspección. Doc. ${docNum}.`);
    return { success: true, docNumber: docNum, message: 'Devolución registrada' };
  };

  // Resolve Return Inspection: Recoverable -> Unrestricted (0001), Non-recoverable -> scrapped/disposed
  const resolveReturnInspection = (
    returnOrderId: string,
    recoveredQty: number,
    disposition: ReturnDisposition
  ) => {
    const ret = returnOrders.find(r => r.id === returnOrderId);
    if (!ret || !ret.materialDocRef) {
      addToast('warning', 'Primero registra el ingreso (651)', 'Debes contabilizar la recepción física (Mov. 651) antes de clasificar la inspección.');
      return { success: false, message: 'No recepcionada aún' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // Move recovered units from 0004 blocked -> 0001 unrestricted, and clear remaining from 0004 blocked
    setStocks(prev => {
      const next = [...prev];
      const retStockId = `1010-0004-${ret.materialId}-${ret.batch}`;
      const srcIdx = next.findIndex(s => s.id === retStockId);
      if (srcIdx >= 0) {
        next[srcIdx] = {
          ...next[srcIdx],
          blocked: Math.max(0, next[srcIdx].blocked - ret.quantity),
          lastMovementDate: today
        };
      }

      if (recoveredQty > 0) {
        const destId = `1010-0001-${ret.materialId}-${ret.batch}`;
        const destIdx = next.findIndex(s => s.id === destId);
        if (destIdx >= 0) {
          next[destIdx] = {
            ...next[destIdx],
            unrestricted: next[destIdx].unrestricted + recoveredQty,
            lastMovementDate: today
          };
        } else {
          next.push({
            id: destId,
            plantId: '1010',
            storageLocationId: '0001',
            materialId: ret.materialId,
            batch: ret.batch,
            unrestricted: recoveredQty,
            qualityInspection: 0,
            blocked: 0,
            inTransit: 0,
            reserved: 0,
            lastMovementDate: today
          });
        }
      }
      return next;
    });

    setReturnOrders(prev =>
      prev.map(r => (r.id === returnOrderId ? { ...r, disposition, recoveredQty } : r))
    );

    setKpiBaseline(prev => ({
      ...prev,
      recoveredUnits: prev.recoveredUnits + recoveredQty
    }));

    completeCaseStep('CASE-DEVOLUCIONES', 2);
    addToast('success', 'Inspección Cerrada', `${recoveredQty} u. recuperadas hacia Libre Utilización (0001). Tasa de recuperación actualizada en CMI.`);
    return { success: true, docNumber: docNum, message: 'Inspección resuelta' };
  };

  // ME21N: Create new Purchase Order
  const createPurchaseOrder = (
    vendorName: string,
    vendorReliability: number,
    leadTimeHours: number,
    materialId: string,
    qty: number,
    netPrice: number
  ) => {
    const poId = `PO-4500000${Math.floor(200 + Math.random() * 799)}`;
    const today = new Date().toISOString().split('T')[0];
    const newPO: PurchaseOrder = {
      id: poId,
      vendorId: `PROV-${Math.floor(100 + Math.random() * 899)}`,
      vendorName,
      vendorReliability,
      leadTimeHours,
      plantId: '1010',
      createdDate: today,
      status: 'ABIERTO',
      items: [
        {
          itemNumber: 10,
          materialId,
          orderedQty: qty,
          deliveredQty: 0,
          netPrice,
          currency: 'USD',
          storageLocationId: '0001',
          deliveryDate: today
        }
      ]
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    addToast('success', 'Pedido de Compra Creado (ME21N)', `Se generó la orden ${poId} lista para recepción en MIGO.`);
    return { success: true, poId };
  };

  // VL02N: Toggle 5 expedition verification controls
  const toggleDeliveryControl = (deliveryId: string, controlKey: keyof ExpeditionControls) => {
    setOutboundDeliveries(prev =>
      prev.map(d =>
        d.id === deliveryId
          ? { ...d, controls: { ...d.controls, [controlKey]: !d.controls[controlKey] } }
          : d
      )
    );
  };

  // VL02N: Confirm Picking
  const confirmPicking = (deliveryId: string) => {
    const obd = outboundDeliveries.find(d => d.id === deliveryId);
    if (!obd) return { success: false, message: 'No existe entrega' };

    setOutboundDeliveries(prev =>
      prev.map(d =>
        d.id === deliveryId
          ? {
              ...d,
              pickingStatus: 'COMPLETADO',
              items: d.items.map(it => ({ ...it, pickedQty: it.deliveryQty }))
            }
          : d
      )
    );

    addToast('success', 'Picking Confirmado', `Picking de entrega ${deliveryId} al 100%. Verifica los controles de carga antes del PGI.`);
    return { success: true, message: 'Picking completado' };
  };

  // VL02N: Post Goods Issue (PGI - Mov. 601)
  const postGoodsIssue = (deliveryId: string) => {
    const obd = outboundDeliveries.find(d => d.id === deliveryId);
    if (!obd) return { success: false, message: 'No existe entrega' };

    if (obd.pickingStatus !== 'COMPLETADO') {
      addToast('warning', 'Picking Incompleto', 'SAP exige Picking 100% completado antes de contabilizar PGI.');
      return { success: false, message: 'Picking incompleto' };
    }

    const allControlsOk = Object.values(obd.controls).every(Boolean);
    if (!allControlsOk) {
      addToast('warning', 'Controles de Expedición Pendientes', 'Completa las verificaciones de código, consolidación, embalaje, carga y remito antes de liberar el camión.');
      return { success: false, message: 'Controles pendientes' };
    }

    if (obd.pgiStatus === 'CONTABILIZADO') {
      return { success: false, message: 'Ya contabilizado' };
    }

    const docNum = `490000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    let totalDispatchedUnits = 0;

    setStocks(prev => {
      const next = [...prev];
      obd.items.forEach(it => {
        totalDispatchedUnits += it.pickedQty;
        const idx = next.findIndex(
          s => s.storageLocationId === it.storageLocationId && s.materialId === it.materialId && s.batch === it.batch
        );
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            unrestricted: Math.max(0, next[idx].unrestricted - it.pickedQty),
            reserved: Math.max(0, next[idx].reserved - it.pickedQty),
            lastMovementDate: today
          };
        }
      });
      return next;
    });

    setOutboundDeliveries(prev =>
      prev.map(d => (d.id === deliveryId ? { ...d, pgiStatus: 'CONTABILIZADO', materialDocRef: docNum } : d))
    );

    setKpiBaseline(prev => ({
      ...prev,
      dispatchedOrders: prev.dispatchedOrders + 1,
      errorFreeOrders: prev.errorFreeOrders + 1,
      onTimeDepartures: prev.onTimeDepartures + 1,
      otifDeliveries: prev.otifDeliveries + 1,
      deliveredUnits: prev.deliveredUnits + totalDispatchedUnits
    }));

    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '601',
      movementDescription: 'Salida de mercancías para entrega a cliente (PGI 601)',
      headerText: `Despacho Entrega ${deliveryId} — Ruta ${obd.routeKm} km (${obd.transportMode})`,
      createdBy: 'FRANCO_LOG_UTN',
      items: obd.items.map(it => ({
        itemNumber: it.itemNumber,
        materialId: it.materialId,
        quantity: it.pickedQty,
        unit: materials.find(m => m.id === it.materialId)?.unit || 'UN',
        plantId: '1010',
        storageLocationId: it.storageLocationId,
        batch: it.batch,
        referenceDoc: deliveryId
      }))
    };

    setMaterialDocuments(prev => [newDoc, ...prev]);

    if (deliveryId === '8000002140') {
      completeCaseStep('CASE-TECNOSUR', 4);
    }

    addToast('success', 'PGI Contabilizado (Mov. 601)', `Camión liberado. Doc. Material ${docNum}. KPIs OTIF actualizados en CMI.`);
    return { success: true, docNumber: docNum, message: 'PGI completado' };
  };

  const resetToDefaultData = () => {
    setStocks(INITIAL_STOCKS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setOutboundDeliveries(INITIAL_OUTBOUND_DELIVERIES);
    setReturnOrders(INITIAL_RETURN_ORDERS);
    setStorageBins(INITIAL_STORAGE_BINS);
    setMaterialDocuments([]);
    setKpiBaseline(INITIAL_KPI_BASELINE);
    setCaseStudies(INITIAL_CASE_STUDIES);
    setActiveCaseStudyId(null);
    ['_STOCKS', '_PO', '_OBD', '_RET', '_BINS', '_DOCS', '_KPI', '_CASES'].forEach(suffix =>
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}${suffix}`)
    );
    addToast('info', 'Datos Restablecidos', 'Escenarios UTN (TecnoSur, Metalúrgica del Sur, MRP y ABC) reiniciados al estado inicial.');
  };

  return (
    <SAPContext.Provider
      value={{
        activeApp,
        setActiveApp,
        isJouleOpen,
        setIsJouleOpen,
        activeCaseStudyId,
        setActiveCaseStudyId,
        toasts,
        addToast,
        removeToast,
        executeTCode,
        plants,
        storageLocations,
        materials,
        stocks,
        purchaseOrders,
        salesOrders,
        outboundDeliveries,
        returnOrders,
        storageBins,
        materialDocuments,
        mrpSchedules,
        kpiBaseline,
        caseStudies,
        postGoodsReceiptPO,
        postStockTransfer,
        postBlockStock,
        postCustomerReturn,
        resolveReturnInspection,
        createPurchaseOrder,
        toggleDeliveryControl,
        confirmPicking,
        postGoodsIssue,
        completeCaseStep,
        resetToDefaultData
      }}
    >
      {children}
    </SAPContext.Provider>
  );
};

export const useSAP = () => {
  const context = useContext(SAPContext);
  if (!context) {
    throw new Error('useSAP must be used within a SAPProvider');
  }
  return context;
};
