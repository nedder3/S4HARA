// SAP S/4HANA Logistics Domain Models & Types

export type MaterialType = 'ROH' | 'FERT' | 'HALB' | 'VERP';

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
}

export interface StockRecord {
  id: string; // Composite key: plantId-storageLocId-materialId-batch
  plantId: string; // e.g. "1010"
  storageLocationId: string; // e.g. "0001"
  materialId: string;
  batch: string; // e.g. "LOTE-2026-A"
  unrestricted: number; // Libre utilización
  qualityInspection: number; // Control de calidad
  blocked: number; // Bloqueado
  inTransit: number; // En traslado
  reserved: number; // Reservado para órdenes
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
  plantId: string;
  createdDate: string;
  status: 'ABIERTO' | 'PARCIALMENTE_RECIBIDO' | 'COMPLETADO';
  items: PurchaseOrderItem[];
}

export type MovementType = '101' | '102' | '311' | '501' | '601';

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

export interface OutboundDelivery {
  id: string; // e.g. "8000002140"
  salesOrderId: string;
  customerName: string;
  shippingPoint: string;
  plannedGoodsIssueDate: string;
  pickingStatus: 'NO_INICIADO' | 'PARCIAL' | 'COMPLETADO';
  pgiStatus: 'PENDIENTE' | 'CONTABILIZADO';
  materialDocRef?: string;
  items: OutboundDeliveryItem[];
}

export interface StorageBin {
  id: string; // e.g. "A-01-01"
  aisle: string; // "A"
  rack: number; // 1
  level: number; // 1
  zone: string;
  maxWeightKg: number;
  currentWeightKg: number;
  materialId?: string;
  batch?: string;
  quantity: number;
}

export interface CaseStudyStep {
  id: number;
  instruction: string;
  appTarget: string; // e.g. "MIGO"
  explanation: string;
  hint: string;
  isCompleted: boolean;
}

export interface CaseStudy {
  id: string;
  code: string;
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
