import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { IStateRepository, LocalStorageRepository } from '../infrastructure/storageRepository';
import { buildMaterialIndex, buildStorageLocationIndex } from '../domain/indexes';
import {
  InventoryDomainState,
  executeBlockStock,
  executeCustomerReturn,
  executeGoodsIssue,
  executeGoodsReceiptPO,
  executeReturnResolution,
  executeStockTransfer
} from '../domain/services/inventoryEngine';

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

  // Master Data & Precomputed O(1) Indexes
  plants: Plant[];
  storageLocations: StorageLocation[];
  materials: Material[];
  materialIndex: ReadonlyMap<string, Material>;
  storageLocationIndex: ReadonlyMap<string, StorageLocation>;
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

  // Domain Command Dispatchers
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

  postCustomerReturn: (returnOrderId: string) => { success: boolean; docNumber?: string; message: string };

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

  toggleDeliveryControl: (deliveryId: string, controlKey: keyof ExpeditionControls) => void;
  confirmPicking: (deliveryId: string) => { success: boolean; message: string };
  postGoodsIssue: (deliveryId: string) => { success: boolean; docNumber?: string; message: string };
  completeCaseStep: (caseId: string, stepId: number) => void;
  resetToDefaultData: () => void;
}

const defaultRepository: IStateRepository = new LocalStorageRepository('S4HARA_SAP_UTN_V2');

const SAPContext = createContext<SAPContextType | undefined>(undefined);

interface SAPProviderProps {
  children: React.ReactNode;
  repository?: IStateRepository;
}

export const SAPProvider: React.FC<SAPProviderProps> = ({ children, repository = defaultRepository }) => {
  const [activeApp, setActiveApp] = useState<AppView>('LAUNCHPAD');
  const [isJouleOpen, setIsJouleOpen] = useState(false);
  const [activeCaseStudyId, setActiveCaseStudyId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [plants] = useState<Plant[]>(INITIAL_PLANTS);
  const [storageLocations] = useState<StorageLocation[]>(INITIAL_STORAGE_LOCATIONS);
  const [materials] = useState<Material[]>(INITIAL_MATERIALS);
  const [mrpSchedules] = useState<MRPWeeklySchedule[]>(INITIAL_MRP_SCHEDULES);
  const [salesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);

  // Precomputed O(1) Lookup Maps
  const materialIndex = useMemo(() => buildMaterialIndex(materials), [materials]);
  const storageLocationIndex = useMemo(() => buildStorageLocationIndex(storageLocations), [storageLocations]);

  // Persistent Domain State (via DIP Repository)
  const [stocks, setStocks] = useState<StockRecord[]>(() => repository.load('STOCKS', INITIAL_STOCKS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => repository.load('PO', INITIAL_PURCHASE_ORDERS));
  const [outboundDeliveries, setOutboundDeliveries] = useState<OutboundDelivery[]>(() => repository.load('OBD', INITIAL_OUTBOUND_DELIVERIES));
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>(() => repository.load('RET', INITIAL_RETURN_ORDERS));
  const [storageBins, setStorageBins] = useState<StorageBin[]>(() => repository.load('BINS', INITIAL_STORAGE_BINS));
  const [materialDocuments, setMaterialDocuments] = useState<MaterialDocument[]>(() => repository.load('DOCS', []));
  const [kpiBaseline, setKpiBaseline] = useState<OperationalKPIBaseline>(() => repository.load('KPI', INITIAL_KPI_BASELINE));
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => repository.load('CASES', INITIAL_CASE_STUDIES));

  useEffect(() => repository.save('STOCKS', stocks), [stocks, repository]);
  useEffect(() => repository.save('PO', purchaseOrders), [purchaseOrders, repository]);
  useEffect(() => repository.save('OBD', outboundDeliveries), [outboundDeliveries, repository]);
  useEffect(() => repository.save('RET', returnOrders), [returnOrders, repository]);
  useEffect(() => repository.save('BINS', storageBins), [storageBins, repository]);
  useEffect(() => repository.save('DOCS', materialDocuments), [materialDocuments, repository]);
  useEffect(() => repository.save('KPI', kpiBaseline), [kpiBaseline, repository]);
  useEffect(() => repository.save('CASES', caseStudies), [caseStudies, repository]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [{ id, type, title, message, timestamp: new Date().toLocaleTimeString('es-AR') }, ...prev.slice(0, 4)]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const getDomainSnapshot = (): InventoryDomainState => ({
    materials,
    stocks,
    purchaseOrders,
    outboundDeliveries,
    returnOrders,
    materialDocuments,
    kpiBaseline
  });

  const applyDomainSnapshot = (next: InventoryDomainState) => {
    setStocks(next.stocks);
    setPurchaseOrders(next.purchaseOrders);
    setOutboundDeliveries(next.outboundDeliveries);
    setReturnOrders(next.returnOrders);
    setMaterialDocuments(next.materialDocuments);
    setKpiBaseline(next.kpiBaseline);
  };

  const completeCaseStep = (caseId: string, stepId: number) => {
    setCaseStudies(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        if (c.steps.find(s => s.id === stepId)?.isCompleted) return c;
        const updatedSteps = c.steps.map(s => (s.id === stepId ? { ...s, isCompleted: true } : s));
        const allDone = updatedSteps.every(s => s.isCompleted);
        if (allDone && !c.isCompleted) {
          addToast('success', 'Misión Completada', `Completaste el caso práctico: ${c.title}`);
        }
        return { ...c, steps: updatedSteps, isCompleted: allDone };
      })
    );
  };

  const executeTCode = (cmd: string): boolean => {
    const normalized = cmd.trim().toUpperCase().replace(/^\/N/, '');
    const tcodeRoutes: Record<string, { app: AppView; label: string }> = {
      MMBE: { app: 'MMBE', label: 'Resumen de Stock (MMBE)' },
      STOCK: { app: 'MMBE', label: 'Resumen de Stock (MMBE)' },
      MIGO: { app: 'MIGO', label: 'Movimientos de Mercancías (MIGO)' },
      '344': { app: 'MIGO', label: 'Bloqueo Preventivo (MIGO 344)' },
      '651': { app: 'MIGO', label: 'Logística Inversa (MIGO 651)' },
      ME21N: { app: 'ME21N', label: 'Pedidos de Compra (ME21N)' },
      ME23N: { app: 'ME21N', label: 'Pedidos de Compra (ME23N)' },
      VL01N: { app: 'VL01N', label: 'Expedición y Muelles (VL02N)' },
      VL02N: { app: 'VL01N', label: 'Expedición y Muelles (VL02N)' },
      MUELLES: { app: 'VL01N', label: 'Dimensionamiento de Muelles (EWM)' },
      MD04: { app: 'MD04', label: 'Monitor MRP & BOM (MD04 / CS03)' },
      CS03: { app: 'MD04', label: 'Lista de Materiales (CS03)' },
      MRP: { app: 'MD04', label: 'Monitor MRP (MD04)' },
      MC40: { app: 'MC40', label: 'Análisis ABC / Pareto (MC40)' },
      ABC: { app: 'MC40', label: 'Análisis ABC / Pareto (MC40)' },
      CMI: { app: 'CMI', label: 'Tablero Analítico CMI / OTIF' },
      OTIF: { app: 'CMI', label: 'Tablero Analítico CMI / OTIF' },
      EWM: { app: 'EWM_RACK', label: 'Mapa de Almacén & Racks (EWM)' },
      CASOS: { app: 'CASES', label: 'Misiones Prácticas UTN-to-SAP' },
      TECNOSUR: { app: 'CASES', label: 'Misiones Prácticas UTN-to-SAP' },
      HOME: { app: 'LAUNCHPAD', label: 'Fiori Launchpad' }
    };

    const match = tcodeRoutes[normalized];
    if (match) {
      setActiveApp(match.app);
      if (match.app !== 'LAUNCHPAD') addToast('info', 'Navegación SAP Fiori', `Accediendo a ${match.label}`);
      return true;
    }

    addToast('warning', 'Código de Transacción no encontrado', `El T-Code '${cmd}' no está habilitado. Prueba: MMBE, MIGO, MD04, MC40, ME21N, VL02N, CMI o EWM.`);
    return false;
  };

  const postGoodsReceiptPO = (
    poId: string,
    itemsToReceive: { materialId: string; qty: number; storageLocationId: string; batch: string }[]
  ) => {
    const res = executeGoodsReceiptPO(getDomainSnapshot(), poId, itemsToReceive);
    if (!res.success) {
      addToast('error', 'Error en Entrada (101)', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    if (poId === 'PO-4500000102') completeCaseStep('CASE-TECNOSUR', 3);
    addToast('success', 'Entrada Contabilizada (101)', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
  };

  const postStockTransfer = (
    materialId: string,
    batch: string,
    qty: number,
    fromLoc: string,
    toLoc: string,
    plantId: string
  ) => {
    const res = executeStockTransfer(getDomainSnapshot(), materialId, batch, qty, fromLoc, toLoc, plantId);
    if (!res.success) {
      addToast('error', 'Error en Traspaso (311)', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    addToast('success', 'Traspaso Contabilizado (311)', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
  };

  const postBlockStock = (
    materialId: string,
    batch: string,
    qty: number,
    storageLocationId: string,
    plantId: string,
    reason: string
  ) => {
    const res = executeBlockStock(getDomainSnapshot(), materialId, batch, qty, storageLocationId, plantId, reason);
    if (!res.success) {
      addToast('error', 'Error de Bloqueo (344)', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    if (materialId === 'MAT-A100' && qty === 17) completeCaseStep('CASE-TECNOSUR', 1);
    addToast('warning', 'Stock Bloqueado (Mov. 344)', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
  };

  const postCustomerReturn = (returnOrderId: string) => {
    const res = executeCustomerReturn(getDomainSnapshot(), returnOrderId);
    if (!res.success) {
      addToast('warning', 'Logística Inversa (651)', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    completeCaseStep('CASE-DEVOLUCIONES', 1);
    addToast('info', 'Devolución Ingresada (Mov. 651)', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
  };

  const resolveReturnInspection = (returnOrderId: string, recoveredQty: number, disposition: ReturnDisposition) => {
    const res = executeReturnResolution(getDomainSnapshot(), returnOrderId, recoveredQty, disposition);
    if (!res.success) {
      addToast('warning', 'Inspección de Devolución', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    completeCaseStep('CASE-DEVOLUCIONES', 2);
    addToast('success', 'Inspección Cerrada', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
  };

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
      items: [{ itemNumber: 10, materialId, orderedQty: qty, deliveredQty: 0, netPrice, currency: 'USD', storageLocationId: '0001', deliveryDate: today }]
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    addToast('success', 'Pedido de Compra Creado (ME21N)', `Se generó la orden ${poId} lista para recepción en MIGO.`);
    return { success: true, poId };
  };

  const toggleDeliveryControl = (deliveryId: string, controlKey: keyof ExpeditionControls) => {
    setOutboundDeliveries(prev =>
      prev.map(d => (d.id === deliveryId ? { ...d, controls: { ...d.controls, [controlKey]: !d.controls[controlKey] } } : d))
    );
  };

  const confirmPicking = (deliveryId: string) => {
    if (!outboundDeliveries.some(d => d.id === deliveryId)) return { success: false, message: 'No existe entrega' };
    setOutboundDeliveries(prev =>
      prev.map(d =>
        d.id === deliveryId
          ? { ...d, pickingStatus: 'COMPLETADO', items: d.items.map(it => ({ ...it, pickedQty: it.deliveryQty })) }
          : d
      )
    );
    addToast('success', 'Picking Confirmado', `Picking de entrega ${deliveryId} al 100%. Verifica los controles de carga antes del PGI.`);
    return { success: true, message: 'Picking completado' };
  };

  const postGoodsIssue = (deliveryId: string) => {
    const res = executeGoodsIssue(getDomainSnapshot(), deliveryId);
    if (!res.success) {
      addToast('warning', 'Bloqueo PGI (Mov. 601)', res.message);
      return { success: false, message: res.message };
    }
    applyDomainSnapshot(res.nextState);
    if (deliveryId === '8000002140') completeCaseStep('CASE-TECNOSUR', 4);
    addToast('success', 'PGI Contabilizado (Mov. 601)', res.message);
    return { success: true, docNumber: res.docNumber, message: res.message };
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
    ['STOCKS', 'PO', 'OBD', 'RET', 'BINS', 'DOCS', 'KPI', 'CASES'].forEach(k => repository.remove(k));
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
        materialIndex,
        storageLocationIndex,
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
  if (!context) throw new Error('useSAP must be used within a SAPProvider');
  return context;
};
