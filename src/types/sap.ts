// SAP S/4HANA Logistics Domain Models & Types (Aligned with UTN FRBB Lic. en Logística)

export type MaterialType = 'ROH' | 'FERT' | 'HALB' | 'VERP';
export type ABCClass = 'A' | 'B' | 'C';
export type LotSizePolicy = 'L4L' | 'FIXED' | 'EOQ';

export interface BOMComponent {
  materialId: string;
  qtyPerParent: number;
}

export interface Material {
  id: string; // e.g. "MAT-1001"
  name: string;
  type: MaterialType;
  unit: 'UN' | 'KG' | 'PAL' | 'M' | 'L';
  basePrice: number;
  safetyStock: number;
  reorderPoint: number;
  weightKg: number;
  storageBinDefault: string;
  category: string;
  // UTN Abastecimiento & Planificación (ABC & MRP)
  abcClass: ABCClass;
  monthlyDemand: number; // Consumo promedio mensual
  leadTimeWeeks: number; // Tiempo de suministro (TS) en semanas
  lotSizePolicy: LotSizePolicy;
  lotSizeQty: number;
  bomChildren?: BOMComponent[];
}

export interface StockRecord {
  id: string; // Composite key: plantId-storageLocId-materialId-batch
  plantId: string; // e.g. "1010"
  storageLocationId: string; // e.g. "0001"
  materialId: string;
  batch: string;
  unrestricted: number; // Libre utilización
  qualityInspection: number; // Control de calidad (Q)
  blocked: number; // Bloqueado (S)
  inTransit: number; // En traslado
  reserved: number; // Comprometido / Reservado
  lastMovementDate: string;
}

export interface Plant {
  id: string;
  name: string;
  companyCode: string;
}

export interface StorageLocation {
  id: string;
  plantId: string;
  name: string;
  description: string;
}

export interface PurchaseOrderItem {
  itemNumber: number;
  materialId: string;
  orderedQty: number;
  deliveredQty: number;
  netPrice: number;
  currency: string;
  storageLocationId: string;
  deliveryDate: string;
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-4500000101"
  vendorId: string;
  vendorName: string;
  vendorReliability?: number; // % confiabilidad (Caso TecnoSur)
  leadTimeHours?: number;
  plantId: string;
  createdDate: string;
  status: 'ABIERTO' | 'PARCIALMENTE_RECIBIDO' | 'COMPLETADO';
  items: PurchaseOrderItem[];
}

// 101: Entrada OC | 311: Traspaso almacén | 344: Libre -> Bloqueado | 501: Entrada sin OC | 601: Salida PGI | 651: Devolución cliente a bloqueado/inspección
export type MovementType = '101' | '102' | '311' | '344' | '501' | '601' | '651';

export interface MaterialDocumentItem {
  itemNumber: number;
  materialId: string;
  quantity: number;
  unit: string;
  plantId: string;
  storageLocationId: string;
  toStorageLocationId?: string;
  batch: string;
  referenceDoc?: string;
  referenceItem?: number;
}

export interface MaterialDocument {
  docNumber: string; // e.g. "5000001201"
  postingDate: string;
  docDate: string;
  movementType: MovementType;
  movementDescription: string;
  headerText: string;
  createdBy: string;
  items: MaterialDocumentItem[];
}

export type ReturnDisposition = 'PENDIENTE_INSPECCION' | 'REACONDICIONAR' | 'REPARAR' | 'DISPOSICION_FINAL' | 'REINGRESO_LIBRE';

export interface ReturnOrder {
  id: string; // e.g. "RET-6500001"
  customerName: string;
  salesOrderRef: string;
  materialId: string;
  batch: string;
  quantity: number;
  reason: string;
  receivedDate: string;
  disposition: ReturnDisposition;
  recoveredQty: number;
  materialDocRef?: string;
  notes: string;
}

export interface SalesOrderItem {
  itemNumber: number;
  materialId: string;
  quantity: number;
  unitPrice: number;
  confirmedQty: number;
}

export interface SalesOrder {
  id: string; // e.g. "SO-10000420"
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  plantId: string;
  priority: 'ESTANDAR' | 'ESTRATEGICO' | 'CRITICO_48H';
  penaltyAmount?: number;
  status: 'PENDIENTE' | 'EN_EXPEDICION' | 'COMPLETADO';
  items: SalesOrderItem[];
}

export interface OutboundDeliveryItem {
  itemNumber: number;
  materialId: string;
  deliveryQty: number;
  pickedQty: number;
  batch: string;
  storageLocationId: string;
  storageBin: string;
}

export interface ExpeditionControls {
  verifiedCodesAndQty: boolean;
  consolidatedByDest: boolean;
  packedAndLabeled: boolean;
  loadWeightAndStabilityChecked: boolean;
  dispatchDocsReady: boolean;
}

export interface OutboundDelivery {
  id: string; // e.g. "8000002140"
  salesOrderId: string;
  customerName: string;
  shippingPoint: string;
  transportMode: 'PROPIO' | 'TERCERIZADO';
  routeKm: number;
  plannedGoodsIssueDate: string;
  pickingStatus: 'NO_INICIADO' | 'PARCIAL' | 'COMPLETADO';
  pgiStatus: 'PENDIENTE' | 'CONTABILIZADO';
  controls: ExpeditionControls;
  materialDocRef?: string;
  items: OutboundDeliveryItem[];
}

export interface StorageBin {
  id: string; // e.g. "A-01-01"
  aisle: string;
  rack: number;
  level: number;
  zone: string;
  maxWeightKg: number;
  currentWeightKg: number;
  materialId?: string;
  batch?: string;
  quantity: number;
}

export interface MRPWeeklySchedule {
  materialId: string;
  grossRequirements: number[]; // Weeks 1..6
  scheduledReceipts: number[]; // Weeks 1..6
}

export interface OperationalKPIBaseline {
  dispatchedOrders: number;
  errorFreeOrders: number;
  onTimeDepartures: number;
  otifDeliveries: number;
  deliveredUnits: number;
  returnedUnits: number;
  recoveredUnits: number;
  avgDockMinutesUsed: number;
  avgDockMinutesAvailable: number;
}

export interface CaseStudyStep {
  id: number;
  instruction: string;
  appTarget: string; // e.g. "MIGO", "MD04", "MC40", "VL01N"
  explanation: string;
  hint: string;
  isCompleted: boolean;
}

export interface CaseStudy {
  id: string;
  code: string;
  subjectTag: string; // UTN Subject e.g. "Procesos Logísticos IV"
  title: string;
  role: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedMinutes: number;
  context: string;
  learningOutcome: string;
  interviewTip: string;
  steps: CaseStudyStep[];
  isCompleted: boolean;
}
