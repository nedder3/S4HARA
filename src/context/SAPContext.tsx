import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Material,
  StockRecord,
  Plant,
  StorageLocation,
  PurchaseOrder,
  SalesOrder,
  OutboundDelivery,
  StorageBin,
  MaterialDocument,
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
  INITIAL_STORAGE_BINS,
  INITIAL_CASE_STUDIES
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export type AppView = 'LAUNCHPAD' | 'MMBE' | 'MIGO' | 'ME21N' | 'VL01N' | 'EWM_RACK' | 'CASES';

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
  storageBins: StorageBin[];
  materialDocuments: MaterialDocument[];
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

  confirmPicking: (deliveryId: string) => { success: boolean; message: string };

  postGoodsIssue: (deliveryId: string) => { success: boolean; docNumber?: string; message: string };

  completeCaseStep: (caseId: string, stepId: number) => void;
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = 'S4HARA_SAP_STATE_V1';

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

  const [storageBins, setStorageBins] = useState<StorageBin[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_BINS`);
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_BINS;
  });

  const [materialDocuments, setMaterialDocuments] = useState<MaterialDocument[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_DOCS`);
    return saved ? JSON.parse(saved) : [];
  });

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_CASES`);
    return saved ? JSON.parse(saved) : INITIAL_CASE_STUDIES;
  });

  // Sync to local storage
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
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_BINS`, JSON.stringify(storageBins));
  }, [storageBins]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_DOCS`, JSON.stringify(materialDocuments));
  }, [materialDocuments]);

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

    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // T-Code parser / command runner (e.g. "MMBE", "/nMMBE", "MIGO", "VL01N", "ME21N")
  const executeTCode = (cmd: string): boolean => {
    const normalized = cmd.trim().toUpperCase().replace(/^\/N/, '');
    
    switch (normalized) {
      case 'MMBE':
      case 'STOCK':
      case 'INVENTARIO':
        setActiveApp('MMBE');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Resumen de Stock (MMBE)');
        return true;
      case 'MIGO':
      case 'ENTRADA':
      case 'MOVIMIENTOS':
        setActiveApp('MIGO');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Movimiento de Mercancías (MIGO)');
        return true;
      case 'ME21N':
      case 'ME22N':
      case 'ME23N':
      case 'PO':
      case 'COMPRAS':
        setActiveApp('ME21N');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Gestión de Pedidos de Compra (ME21N)');
        return true;
      case 'VL01N':
      case 'VL02N':
      case 'VL03N':
      case 'EXPEDICION':
      case 'PICKING':
        setActiveApp('VL01N');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Entregas Salientes & Expedición (VL01N)');
        return true;
      case 'EWM':
      case 'WM':
      case 'RACKS':
      case 'UBICACIONES':
        setActiveApp('EWM_RACK');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Mapa de Almacén & Racks (EWM)');
        return true;
      case 'CASOS':
      case 'PRACTICA':
      case 'TUTORIAL':
        setActiveApp('CASES');
        addToast('info', 'SAP Fiori Navigation', 'Accediendo a Misiones & Casos de Estudio');
        return true;
      case 'HOME':
      case 'INICIO':
      case 'LAUNCHPAD':
        setActiveApp('LAUNCHPAD');
        return true;
      default:
        addToast('warning', 'Código de Transacción desconocido', `El T-Code '${cmd}' no está implementado o no es válido en el módulo de Logística.`);
        return false;
    }
  };

  // Complete a step in guided cases
  const completeCaseStep = (caseId: string, stepId: number) => {
    setCaseStudies(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const updatedSteps = c.steps.map(s => (s.id === stepId ? { ...s, isCompleted: true } : s));
        const allDone = updatedSteps.every(s => s.isCompleted);
        if (allDone && !c.isCompleted) {
          addToast('success', '¡Misión Cumplida!', `Has completado exitosamente: ${c.title}`);
        }
        return {
          ...c,
          steps: updatedSteps,
          isCompleted: allDone
        };
      })
    );
  };

  // Dispatcher: MIGO 101 Goods Receipt for PO
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

    // Create Material Document
    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '101',
      movementDescription: 'Entrada de mercancías para pedido en almacén (101)',
      headerText: `Remito Prov. Ref: ${po.vendorName}`,
      createdBy: 'LIC_LOGISTICA',
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

    // Update Stock
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

    // Update PO delivered quantities
    setPurchaseOrders(prev =>
      prev.map(p => {
        if (p.id !== poId) return p;
        const updatedItems = p.items.map(pItem => {
          const received = itemsToReceive.find(r => r.materialId === pItem.materialId);
          if (received) {
            return {
              ...pItem,
              deliveredQty: pItem.deliveredQty + received.qty
            };
          }
          return pItem;
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

    // Check if active case study step should be completed
    if (activeCaseStudyId === 'CASE-01') {
      completeCaseStep('CASE-01', 3);
    }

    addToast('success', 'Documento Contabilizado', `Documento de material ${docNum} contabilizado con éxito (Movimiento 101).`);
    return { success: true, docNumber: docNum, message: 'Entrada registrada exitosamente' };
  };

  // Dispatcher: MIGO 311 Transfer Posting between storage locations
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
      addToast('error', 'Stock Insuficiente', `Stock libre insuficiente en almacén ${fromLoc}. Disponible: ${sourceStock?.unrestricted || 0}`);
      return { success: false, message: 'Stock insuficiente' };
    }

    const docNum = `500000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // Deduct source and add to destination
    setStocks(prev => {
      const next = [...prev];
      // Deduct from source
      const srcIdx = next.findIndex(
        s => s.plantId === plantId && s.storageLocationId === fromLoc && s.materialId === materialId && s.batch === batch
      );
      if (srcIdx >= 0) {
        next[srcIdx] = {
          ...next[srcIdx],
          unrestricted: next[srcIdx].unrestricted - qty,
          lastMovementDate: today
        };
      }

      // Add to destination
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
      headerText: `Traspaso interno Almacén ${fromLoc} -> ${toLoc}`,
      createdBy: 'LIC_LOGISTICA',
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

    if (activeCaseStudyId === 'CASE-02') {
      completeCaseStep('CASE-02', 2);
    }

    addToast('success', 'Traspaso Contabilizado', `Documento de traspaso ${docNum} generado (Mov. 311: ${fromLoc} -> ${toLoc}).`);
    return { success: true, docNumber: docNum, message: 'Traspaso realizado con éxito' };
  };

  // Dispatcher: VL02N Confirm Picking
  const confirmPicking = (deliveryId: string) => {
    const obd = outboundDeliveries.find(d => d.id === deliveryId);
    if (!obd) {
      addToast('error', 'Entrega no encontrada', `No existe la entrega ${deliveryId}`);
      return { success: false, message: 'No existe entrega' };
    }

    setOutboundDeliveries(prev =>
      prev.map(d => {
        if (d.id !== deliveryId) return d;
        const pickedItems = d.items.map(it => ({
          ...it,
          pickedQty: it.deliveryQty
        }));
        return {
          ...d,
          pickingStatus: 'COMPLETADO',
          items: pickedItems
        };
      })
    );

    if (activeCaseStudyId === 'CASE-03') {
      completeCaseStep('CASE-03', 2);
    }

    addToast('success', 'Picking Confirmado', `Picking de entrega ${deliveryId} completado al 100%. Listo para Contabilizar Salida (PGI).`);
    return { success: true, message: 'Picking completado' };
  };

  // Dispatcher: VL02N Post Goods Issue (PGI - Mov. 601)
  const postGoodsIssue = (deliveryId: string) => {
    const obd = outboundDeliveries.find(d => d.id === deliveryId);
    if (!obd) {
      addToast('error', 'Entrega no encontrada', `No existe la entrega ${deliveryId}`);
      return { success: false, message: 'No existe entrega' };
    }

    if (obd.pickingStatus !== 'COMPLETADO') {
      addToast('warning', 'Picking Incompleto', 'SAP requiere que el Picking esté completado al 100% antes de contabilizar PGI.');
      return { success: false, message: 'Picking incompleto' };
    }

    if (obd.pgiStatus === 'CONTABILIZADO') {
      addToast('info', 'Ya Contabilizado', 'La salida de mercancía de esta entrega ya fue contabilizada previamente.');
      return { success: false, message: 'Ya contabilizado' };
    }

    const docNum = `490000${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    // Deduct stock from warehouse
    setStocks(prev => {
      const next = [...prev];
      obd.items.forEach(it => {
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

    // Update OBD
    setOutboundDeliveries(prev =>
      prev.map(d => (d.id === deliveryId ? { ...d, pgiStatus: 'CONTABILIZADO', materialDocRef: docNum } : d))
    );

    // Create Material Document (601)
    const newDoc: MaterialDocument = {
      docNumber: docNum,
      postingDate: today,
      docDate: today,
      movementType: '601',
      movementDescription: 'Salida de mercancías para entrega a cliente (601)',
      headerText: `Despacho Entrega Saliente Ref: ${deliveryId}`,
      createdBy: 'LIC_LOGISTICA',
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

    if (activeCaseStudyId === 'CASE-03') {
      completeCaseStep('CASE-03', 3);
    }

    addToast('success', 'Salida Contabilizada (PGI)', `Salida de mercancías contabilizada. Doc. Material ${docNum} (Mov. 601). Stock descontado.`);
    return { success: true, docNumber: docNum, message: 'PGI completado' };
  };

  const resetToDefaultData = () => {
    setStocks(INITIAL_STOCKS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setOutboundDeliveries(INITIAL_OUTBOUND_DELIVERIES);
    setStorageBins(INITIAL_STORAGE_BINS);
    setMaterialDocuments([]);
    setCaseStudies(INITIAL_CASE_STUDIES);
    setActiveCaseStudyId(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_STOCKS`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_PO`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_OBD`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_BINS`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_DOCS`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_CASES`);
    addToast('info', 'Sistema Restablecido', 'Datos de inventario, pedidos y misiones reiniciados al estado inicial de práctica.');
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
        storageBins,
        materialDocuments,
        caseStudies,
        postGoodsReceiptPO,
        postStockTransfer,
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
