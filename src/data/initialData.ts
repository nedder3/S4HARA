import {
  Plant,
  StorageLocation,
  Material,
  StockRecord,
  PurchaseOrder,
  SalesOrder,
  OutboundDelivery,
  ReturnOrder,
  StorageBin,
  MRPWeeklySchedule,
  OperationalKPIBaseline,
  CaseStudy
} from '../types/sap';

export const INITIAL_PLANTS: Plant[] = [
  { id: '1010', name: 'Centro Distribución Regional (Bahía Blanca)', companyCode: '1000' },
  { id: '1020', name: 'Planta Industrial Puerto Galván', companyCode: '1000' },
];

export const INITIAL_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: '0001', plantId: '1010', name: 'Almacén General (Libre Utilización)', description: 'Picking, pallets y stock comercializable' },
  { id: '0002', plantId: '1010', name: 'Control de Calidad / Inspección', description: 'Cuarentena de lotes y revisión técnica' },
  { id: '0003', plantId: '1010', name: 'Área de Expedición & Muelles', description: 'Consolidación de carga y despacho' },
  { id: '0004', plantId: '1010', name: 'Devoluciones & Bloqueados (Log. Inversa)', description: 'Material dañado, inundado o retornado por clientes' },
  { id: '0001', plantId: '1020', name: 'Almacén Planta Galván', description: 'Materia prima y componentes MRP' },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'MAT-A100',
    name: 'Producto A — Motor Eléctrico Industrial 5HP',
    type: 'FERT',
    unit: 'UN',
    basePrice: 680.0,
    safetyStock: 20,
    reorderPoint: 35,
    weightKg: 32,
    storageBinDefault: 'A-01-01',
    category: 'Equipos Agroindustriales (Metalúrgica del Sur / TecnoSur)',
    abcClass: 'A',
    monthlyDemand: 85,
    leadTimeWeeks: 1,
    lotSizePolicy: 'FIXED',
    lotSizeQty: 50,
    bomChildren: [
      { materialId: 'MAT-C300', qtyPerParent: 1 },
      { materialId: 'MAT-3015', qtyPerParent: 2 }
    ]
  },
  {
    id: 'MAT-B200',
    name: 'Producto B — Bomba Centrífuga Agroindustrial',
    type: 'FERT',
    unit: 'UN',
    basePrice: 540.0,
    safetyStock: 15,
    reorderPoint: 30,
    weightKg: 24,
    storageBinDefault: 'A-01-02',
    category: 'Equipos Agroindustriales (Metalúrgica del Sur / TecnoSur)',
    abcClass: 'A',
    monthlyDemand: 70,
    leadTimeWeeks: 1,
    lotSizePolicy: 'FIXED',
    lotSizeQty: 35,
    bomChildren: [
      { materialId: 'MAT-C300', qtyPerParent: 2 },
      { materialId: 'MAT-3015', qtyPerParent: 1 }
    ]
  },
  {
    id: 'MAT-C300',
    name: 'Producto C — Kit de Repuestos & Sellos Mecánicos',
    type: 'HALB',
    unit: 'UN',
    basePrice: 95.0,
    safetyStock: 30,
    reorderPoint: 50,
    weightKg: 3.5,
    storageBinDefault: 'B-01-01',
    category: 'Subensambles & Repuestos',
    abcClass: 'B',
    monthlyDemand: 210,
    leadTimeWeeks: 1,
    lotSizePolicy: 'FIXED',
    lotSizeQty: 100
  },
  {
    id: 'MAT-5001',
    name: 'Batería Tracción Ion-Litio Autoelevador 48V',
    type: 'FERT',
    unit: 'UN',
    basePrice: 4200.0,
    safetyStock: 4,
    reorderPoint: 8,
    weightKg: 420,
    storageBinDefault: 'C-02-01',
    category: 'Maquinaria & Equipos de Almacén',
    abcClass: 'A',
    monthlyDemand: 12,
    leadTimeWeeks: 2,
    lotSizePolicy: 'L4L',
    lotSizeQty: 1
  },
  {
    id: 'MAT-4050',
    name: 'Lubricante Sintético Industrial ISO VG 220 (Tambor 208L)',
    type: 'ROH',
    unit: 'L',
    basePrice: 850.0,
    safetyStock: 8,
    reorderPoint: 15,
    weightKg: 210,
    storageBinDefault: 'C-01-01',
    category: 'Fluidos & Mantenimiento',
    abcClass: 'B',
    monthlyDemand: 24,
    leadTimeWeeks: 2,
    lotSizePolicy: 'EOQ',
    lotSizeQty: 20
  },
  {
    id: 'MAT-3015',
    name: 'Rodamiento Rígido de Bolas SKF 6205-2RSH',
    type: 'ROH',
    unit: 'UN',
    basePrice: 38.0,
    safetyStock: 60,
    reorderPoint: 100,
    weightKg: 0.25,
    storageBinDefault: 'B-01-02',
    category: 'Componentes Críticos',
    abcClass: 'B',
    monthlyDemand: 320,
    leadTimeWeeks: 1,
    lotSizePolicy: 'FIXED',
    lotSizeQty: 150
  },
  {
    id: 'MAT-1001',
    name: 'Pallet Europlast 1200x800 Reforzado',
    type: 'VERP',
    unit: 'PAL',
    basePrice: 45.0,
    safetyStock: 100,
    reorderPoint: 180,
    weightKg: 18,
    storageBinDefault: 'A-01-03',
    category: 'Unitarización & Embalaje',
    abcClass: 'C',
    monthlyDemand: 180,
    leadTimeWeeks: 1,
    lotSizePolicy: 'EOQ',
    lotSizeQty: 100
  },
  {
    id: 'MAT-2040',
    name: 'Bobina Film Stretch Automático 500mm x 23mic',
    type: 'VERP',
    unit: 'UN',
    basePrice: 28.0,
    safetyStock: 50,
    reorderPoint: 90,
    weightKg: 16,
    storageBinDefault: 'B-01-03',
    category: 'Unitarización & Embalaje',
    abcClass: 'C',
    monthlyDemand: 140,
    leadTimeWeeks: 1,
    lotSizePolicy: 'L4L',
    lotSizeQty: 50
  }
];

// Stock aligned with TecnoSur initial pre-flood state (A: 60, B: 45, C: 95) + warehouse items
export const INITIAL_STOCKS: StockRecord[] = [
  {
    id: '1010-0001-MAT-A100-LOT-TS-A1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-A100',
    batch: 'LOT-TS-A1',
    unrestricted: 60,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 40,
    lastMovementDate: '2026-11-18'
  },
  {
    id: '1010-0001-MAT-B200-LOT-TS-B1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-B200',
    batch: 'LOT-TS-B1',
    unrestricted: 45,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 5,
    lastMovementDate: '2026-11-18'
  },
  {
    id: '1010-0001-MAT-C300-LOT-TS-C1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-C300',
    batch: 'LOT-TS-C1',
    unrestricted: 95,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 70,
    lastMovementDate: '2026-11-18'
  },
  {
    id: '1010-0001-MAT-5001-LOT-2026-E1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-5001',
    batch: 'LOT-2026-E1',
    unrestricted: 9,
    qualityInspection: 2,
    blocked: 0,
    inTransit: 0,
    reserved: 2,
    lastMovementDate: '2026-11-15'
  },
  {
    id: '1010-0001-MAT-4050-LOT-2026-D1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-4050',
    batch: 'LOT-2026-D1',
    unrestricted: 18,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 4,
    lastMovementDate: '2026-11-14'
  },
  {
    id: '1010-0001-MAT-3015-LOT-2026-R1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-3015',
    batch: 'LOT-2026-R1',
    unrestricted: 190,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 50,
    reserved: 20,
    lastMovementDate: '2026-11-17'
  },
  {
    id: '1010-0001-MAT-1001-LOT-2026-P1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-1001',
    batch: 'LOT-2026-P1',
    unrestricted: 260,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 30,
    lastMovementDate: '2026-11-12'
  },
  {
    id: '1010-0001-MAT-2040-LOT-2026-F1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-2040',
    batch: 'LOT-2026-F1',
    unrestricted: 140,
    qualityInspection: 0,
    blocked: 12,
    inTransit: 0,
    reserved: 15,
    lastMovementDate: '2026-11-10'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-4500000101',
    vendorId: 'PROV-P2',
    vendorName: 'P2 — Suministros Industriales del Sur (Operación Parcial 45%)',
    vendorReliability: 68,
    leadTimeHours: 72,
    plantId: '1010',
    createdDate: '2026-11-19',
    status: 'ABIERTO',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-A100',
        orderedQty: 30,
        deliveredQty: 0,
        netPrice: 897.6, // +32% sobre referencia
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-24'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-C300',
        orderedQty: 60,
        deliveredQty: 0,
        netPrice: 125.4,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-24'
      }
    ]
  },
  {
    id: 'PO-4500000102',
    vendorId: 'PROV-P3',
    vendorName: 'P3 — Mercado de Emergencia (Plazo 30h, Pago Anticipado)',
    vendorReliability: 82,
    leadTimeHours: 30,
    plantId: '1010',
    createdDate: '2026-11-21',
    status: 'ABIERTO',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-A100',
        orderedQty: 25,
        deliveredQty: 0,
        netPrice: 1122.0, // +65% emergencia
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-22'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-B200',
        orderedQty: 35,
        deliveredQty: 0,
        netPrice: 891.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-22'
      },
      {
        itemNumber: 30,
        materialId: 'MAT-C300',
        orderedQty: 35,
        deliveredQty: 0,
        netPrice: 156.75,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-22'
      }
    ]
  }
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO-10000420',
    customerId: 'CUST-EST01',
    customerName: 'Cliente Estratégico TecnoSur (Penalización $80.000)',
    orderDate: '2026-11-19',
    deliveryDate: '2026-11-22',
    plantId: '1010',
    priority: 'ESTRATEGICO',
    penaltyAmount: 80000,
    status: 'EN_EXPEDICION',
    items: [
      { itemNumber: 10, materialId: 'MAT-A100', quantity: 40, unitPrice: 920.0, confirmedQty: 40 },
      { itemNumber: 20, materialId: 'MAT-C300', quantity: 70, unitPrice: 145.0, confirmedQty: 70 }
    ]
  },
  {
    id: 'SO-10000421',
    customerId: 'CUST-IND02',
    customerName: 'Cliente Industrial Crítico 48h (Penalización $230.000)',
    orderDate: '2026-11-21',
    deliveryDate: '2026-11-23',
    plantId: '1010',
    priority: 'CRITICO_48H',
    penaltyAmount: 230000,
    status: 'PENDIENTE',
    items: [
      { itemNumber: 10, materialId: 'MAT-A100', quantity: 28, unitPrice: 950.0, confirmedQty: 28 },
      { itemNumber: 20, materialId: 'MAT-B200', quantity: 65, unitPrice: 740.0, confirmedQty: 65 },
      { itemNumber: 30, materialId: 'MAT-C300', quantity: 85, unitPrice: 145.0, confirmedQty: 85 }
    ]
  }
];

export const INITIAL_OUTBOUND_DELIVERIES: OutboundDelivery[] = [
  {
    id: '8000002140',
    salesOrderId: 'SO-10000420',
    customerName: 'Cliente Estratégico TecnoSur (Penalización $80.000)',
    shippingPoint: '1010 - Muelle Expedición M1',
    transportMode: 'TERCERIZADO',
    routeKm: 185, // Ruta alternativa por corte de puente
    plannedGoodsIssueDate: '2026-11-22',
    pickingStatus: 'NO_INICIADO',
    pgiStatus: 'PENDIENTE',
    controls: {
      verifiedCodesAndQty: false,
      consolidatedByDest: false,
      packedAndLabeled: false,
      loadWeightAndStabilityChecked: false,
      dispatchDocsReady: false
    },
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-A100',
        deliveryQty: 40,
        pickedQty: 0,
        batch: 'LOT-TS-A1',
        storageLocationId: '0001',
        storageBin: 'A-01-01'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-C300',
        deliveryQty: 50,
        pickedQty: 0,
        batch: 'LOT-TS-C1',
        storageLocationId: '0001',
        storageBin: 'B-01-01'
      }
    ]
  },
  {
    id: '8000002141',
    salesOrderId: 'SO-10000422',
    customerName: 'Agroindustrial Pampeana — Caso Metalúrgica del Sur',
    shippingPoint: '1010 - Muelle Expedición M2',
    transportMode: 'PROPIO',
    routeKm: 185,
    plannedGoodsIssueDate: '2026-11-22',
    pickingStatus: 'NO_INICIADO',
    pgiStatus: 'PENDIENTE',
    controls: {
      verifiedCodesAndQty: false,
      consolidatedByDest: false,
      packedAndLabeled: false,
      loadWeightAndStabilityChecked: false,
      dispatchDocsReady: false
    },
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-A100',
        deliveryQty: 10,
        pickedQty: 0,
        batch: 'LOT-TS-A1',
        storageLocationId: '0001',
        storageBin: 'A-01-01'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-B200',
        deliveryQty: 5,
        pickedQty: 0,
        batch: 'LOT-TS-B1',
        storageLocationId: '0001',
        storageBin: 'A-01-02'
      },
      {
        itemNumber: 30,
        materialId: 'MAT-C300',
        deliveryQty: 20,
        pickedQty: 0,
        batch: 'LOT-TS-C1',
        storageLocationId: '0001',
        storageBin: 'B-01-01'
      }
    ]
  }
];

export const INITIAL_RETURN_ORDERS: ReturnOrder[] = [
  {
    id: 'RET-6500001',
    customerName: 'Agroindustrial Pampeana (Metalúrgica del Sur)',
    salesOrderRef: 'SO-10000398',
    materialId: 'MAT-A100',
    batch: 'LOT-MS-09',
    quantity: 5,
    reason: '2 embalaje dañado (motor apto), 2 falla eléctrica, 1 daño irreversible',
    receivedDate: '2026-11-21',
    disposition: 'PENDIENTE_INSPECCION',
    recoveredQty: 0,
    notes: 'Regla UTN PL-IV: Nunca reincorporar automáticamente a Libre Utilización sin inspección previa.'
  }
];

export const INITIAL_STORAGE_BINS: StorageBin[] = [
  { id: 'A-01-01', aisle: 'A', rack: 1, level: 1, zone: 'Zona A — Alta Rotación (Clase A)', maxWeightKg: 2500, currentWeightKg: 1920, materialId: 'MAT-A100', batch: 'LOT-TS-A1', quantity: 60 },
  { id: 'A-01-02', aisle: 'A', rack: 1, level: 2, zone: 'Zona A — Alta Rotación (Clase A)', maxWeightKg: 2000, currentWeightKg: 1080, materialId: 'MAT-B200', batch: 'LOT-TS-B1', quantity: 45 },
  { id: 'A-01-03', aisle: 'A', rack: 1, level: 3, zone: 'Zona A — Unitarización', maxWeightKg: 1500, currentWeightKg: 720, materialId: 'MAT-1001', batch: 'LOT-2026-P1', quantity: 40 },
  { id: 'B-01-01', aisle: 'B', rack: 1, level: 1, zone: 'Zona B — Repuestos & Kits (Clase B)', maxWeightKg: 1000, currentWeightKg: 332, materialId: 'MAT-C300', batch: 'LOT-TS-C1', quantity: 95 },
  { id: 'B-01-02', aisle: 'B', rack: 1, level: 2, zone: 'Zona B — Componentes Críticos', maxWeightKg: 600, currentWeightKg: 48, materialId: 'MAT-3015', batch: 'LOT-2026-R1', quantity: 190 },
  { id: 'B-01-03', aisle: 'B', rack: 1, level: 3, zone: 'Zona B — Insumos Empaque (Clase C)', maxWeightKg: 1200, currentWeightKg: 320, materialId: 'MAT-2040', batch: 'LOT-2026-F1', quantity: 20 },
  { id: 'C-01-01', aisle: 'C', rack: 1, level: 1, zone: 'Zona C — Tambores & Sustancias', maxWeightKg: 2200, currentWeightKg: 1680, materialId: 'MAT-4050', batch: 'LOT-2026-D1', quantity: 8 },
  { id: 'C-02-01', aisle: 'C', rack: 2, level: 1, zone: 'Zona C — Cargas Pesadas / Cuarentena', maxWeightKg: 3000, currentWeightKg: 1260, materialId: 'MAT-5001', batch: 'LOT-2026-E1', quantity: 3 }
];

// MRP Weekly Schedule aligned with UTN Planificación y Control TP3 (6 weeks horizon)
export const INITIAL_MRP_SCHEDULES: MRPWeeklySchedule[] = [
  {
    materialId: 'MAT-A100',
    grossRequirements: [20, 20, 20, 20, 20, 20],
    scheduledReceipts: [0, 0, 0, 0, 0, 0]
  },
  {
    materialId: 'MAT-B200',
    grossRequirements: [15, 15, 15, 15, 15, 15],
    scheduledReceipts: [0, 0, 0, 0, 0, 0]
  },
  {
    materialId: 'MAT-C300',
    grossRequirements: [25, 30, 20, 35, 30, 25],
    scheduledReceipts: [100, 0, 0, 0, 0, 0]
  },
  {
    materialId: 'MAT-3015',
    grossRequirements: [40, 85, 10, 60, 130, 110],
    scheduledReceipts: [0, 0, 0, 0, 0, 0]
  }
];

// Exact monthly baseline from UTN Procesos Logísticos IV (Metalúrgica del Sur, Slide 20)
export const INITIAL_KPI_BASELINE: OperationalKPIBaseline = {
  dispatchedOrders: 500,
  errorFreeOrders: 480,
  onTimeDepartures: 450,
  otifDeliveries: 438,
  deliveredUnits: 2000,
  returnedUnits: 80,
  recoveredUnits: 60,
  avgDockMinutesUsed: 1420,
  avgDockMinutesAvailable: 1920
};

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'CASE-TECNOSUR',
    code: 'UTN-PL4-01',
    subjectTag: 'Procesos Logísticos IV',
    title: 'Crisis Logística Integral — Caso TecnoSur Equipamientos',
    role: 'Jefe de Operaciones & Continuidad Logística',
    difficulty: 'Avanzado',
    estimatedMinutes: 10,
    context: 'Hora 10:30: Se produjo una inundación en el Centro Regional (1010). Debes bloquear preventivamente 17 unidades del Producto A (MAT-A100) usando MIGO Mov. 344 para que no sean comprometidas con clientes, recepcionar el pedido de emergencia del Proveedor P3 (PO-4500000102, 30h) con MIGO Mov. 101 y despachar el Pedido Estratégico (8000002140) por la ruta alternativa de 185 km evitando la penalización de $80.000.',
    learningOutcome: 'Integrar SAP MM (MIGO 344 bloqueo + MIGO 101 recepción emergencia), MMBE (saldo utilizable real) y SD/LE (VL02N verificación y PGI 601).',
    interviewTip: 'Pregunta clave en entrevistas: "Ante un siniestro en depósito, ¿cómo evitas en SAP que Ventas o Picking tomen mercadería potencialmente dañada?" Respuesta: Se ejecuta un traspaso de stock Libre Utilización a Stock Bloqueado mediante MIGO Movimiento 344.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Abre MIGO, elige "Bloqueo Preventivo (Mov. 344)" y bloquea 17 u. de MAT-A100 (lote LOT-TS-A1).',
        appTarget: 'MIGO',
        explanation: 'El movimiento 344 pasa stock de Libre Utilización a Bloqueado sin sacarlo físicamente del centro.',
        hint: 'En MIGO, selecciona la pestaña "Mov. 344 Bloqueo" e ingresa 17 unidades de MAT-A100.',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Verifica en MMBE que MAT-A100 ahora muestra 43 u. en Libre Utilización y 17 u. en Bloqueado.',
        appTarget: 'MMBE',
        explanation: 'Reconcilia el stock utilizable real antes de comprometer despachos críticos.',
        hint: 'Abre MMBE y revisa la fila de MAT-A100.',
        isCompleted: false
      },
      {
        id: 3,
        instruction: 'En MIGO (Mov. 101), recepciona el Pedido de Emergencia PO-4500000102 del Proveedor P3.',
        appTarget: 'MIGO',
        explanation: 'Permite cubrir la brecha de stock dentro de la ventana de 30 horas.',
        hint: 'En MIGO pestaña "A01 Entrada (101)", selecciona PO-4500000102 y pulsa Contabilizar.',
        isCompleted: false
      },
      {
        id: 4,
        instruction: 'Ve a VL02N, completa el Picking, valida los controles de expedición y contabiliza el PGI (601) de la entrega 8000002140.',
        appTarget: 'VL01N',
        explanation: 'Cumple el pedido estratégico y evita la penalización contractual de $80.000.',
        hint: 'En VL02N selecciona 8000002140, marca Picking, los 5 controles de carga y pulsa PGI.',
        isCompleted: false
      }
    ]
  },
  {
    id: 'CASE-DEVOLUCIONES',
    code: 'UTN-PL4-02',
    subjectTag: 'Procesos Logísticos IV',
    title: 'Logística Inversa — Devolución de 5 Motores (Metalúrgica del Sur)',
    role: 'Responsable de Devoluciones & Calidad',
    difficulty: 'Intermedio',
    estimatedMinutes: 6,
    context: 'Un cliente devuelve 5 motores eléctricos (MAT-A100): 2 tienen embalaje dañado pero motor apto, 2 presentan falla eléctrica y 1 tiene daño irreversible. Según el protocolo de logística inversa, NUNCA se reincorpora una devolución directamente al stock libre. Debes registrarla con MIGO Mov. 651 en Almacén 0004 (Bloqueado/Devoluciones), clasificar la disposición y auditar la Tasa de Recuperación en el Tablero CMI.',
    learningOutcome: 'Operar devoluciones de clientes en SAP (Mov. 651), gestionar inspección física y medir su impacto en el CMI (Tasa de devolución vs Tasa de recuperación).',
    interviewTip: 'Pregunta clave: "¿Por qué una devolución de cliente no debe ingresar directo a stock disponible?" Respuesta: Porque compromete la calidad y el OTIF futuro; en SAP se ingresa a Stock Bloqueado de Devoluciones (Mov. 651) hasta completar inspección y decisión de recupero o descarte.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Abre MIGO pestaña "Logística Inversa (Mov. 651)" y procesa la devolución RET-6500001 (5 motores).',
        appTarget: 'MIGO',
        explanation: 'Ingresa la mercadería retornada al Almacén 0004 en estado Bloqueado/Inspección.',
        hint: 'Selecciona la pestaña "Mov. 651 Devolución" y registra el ingreso de RET-6500001.',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Asigna la disposición técnica tras inspección (Reacondicionar 2 u. recuperables) y cierra el lote.',
        appTarget: 'MIGO',
        explanation: 'Separa el valor recuperable del descarte irreversible, evitando contabilizar el 100% como pérdida.',
        hint: 'Haz clic en "Clasificar y Recuperar (2 u.)" en la tarjeta de devolución RET-6500001.',
        isCompleted: false
      },
      {
        id: 3,
        instruction: 'Abre el Tablero CMI / OTIF para auditar la Tasa de Devolución y Tasa de Recuperación.',
        appTarget: 'CMI',
        explanation: 'Un indicador requiere lectura gerencial: comparar contra meta y definir acciones correctivas.',
        hint: 'Escribe CMI en la barra superior o abre la app Tablero CMI / OTIF.',
        isCompleted: false
      }
    ]
  },
  {
    id: 'CASE-MRP',
    code: 'UTN-PCP-03',
    subjectTag: 'Planificación y Control',
    title: 'Explosión MRP y Lista de Materiales (MD04 / CS03)',
    role: 'Analista de Planeamiento y Control de la Producción',
    difficulty: 'Intermedio',
    estimatedMinutes: 7,
    context: 'Metalúrgica Bahía Blanca S.A. necesita proyectar las necesidades netas y liberaciones de órdenes planificadas para las próximas 6 semanas del Motor Eléctrico (MAT-A100) y su componente Kit de Repuestos (MAT-C300). Debes analizar el monitor MRP (MD04), inspeccionar la estructura BOM (CS03) y comparar políticas de loteo (Lote a Lote vs Lote Fijo).',
    learningOutcome: 'Traducir las tablas MRP de la facultad (Requerimientos brutos, Disponibilidades, Necesidades netas y Liberación por Lead Time) a la transacción real SAP MD04.',
    interviewTip: 'Pregunta clave: "¿Qué es la transacción MD04 en SAP y qué pasa si el inventario real tiene 13 unidades menos que el sistema?" Respuesta: MD04 es la Lista de Necesidades/Stocks dinámica del MRP; una diferencia negativa de inventario dispara necesidades netas anticipadas y adelanta las liberaciones de órdenes en todos los componentes hijos de la BOM.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Abre la transacción MD04 (Monitor MRP & BOM) y selecciona MAT-A100.',
        appTarget: 'MD04',
        explanation: 'Visualiza el horizonte de 6 semanas con requerimientos brutos, stock inicial y liberaciones.',
        hint: 'Escribe MD04 en la barra superior o haz clic en la tarjeta Monitor MRP.',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Cambia la política de loteo (Lote Fijo vs Lote a Lote) o ejecuta una corrida MRP para ver el impacto en inventario medio.',
        appTarget: 'MD04',
        explanation: 'Permite evaluar trade-off entre costo de lanzamiento de pedido y costo de mantenimiento de inventario.',
        hint: 'Alterna la política de lote en el panel de parámetros de MD04.',
        isCompleted: false
      }
    ]
  },
  {
    id: 'CASE-ABC',
    code: 'UTN-GA1-04',
    subjectTag: 'Gestión de Abastecimiento I',
    title: 'Clasificación de Inventarios ABC (MC40) & Capacidad de Muelles',
    role: 'Analista de Abastecimiento & Depósito',
    difficulty: 'Principiante',
    estimatedMinutes: 5,
    context: 'La gerencia solicita segmentar el catálogo de materiales mediante metodología ABC (Pareto 80/20) comparando los 3 criterios de clasificación (Valor de Utilización, Valorizado de Inventario y Costo Unitario) y validar si los muelles actuales alcanzan para la demanda diaria de carga y descarga.',
    learningOutcome: 'Aplicar clasificación ABC en SAP (MC40) y dimensionar muelles con N = (Qd·Td + Qc·Tc) / (H·60·U) detectando colas en hora pico.',
    interviewTip: 'Pregunta clave: "¿Alcanza con el cálculo promedio diario de muelles para garantizar cero colas?" Respuesta: No. Capacidad promedio != capacidad suficiente en hora pico; primero conviene reprogramar turnos de llegada y prevalidar documentos antes de invertir en infraestructura.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Abre MC40 (Análisis ABC / Pareto) y alterna entre los criterios Valor de Utilización y Valorizado de Inventario.',
        appTarget: 'MC40',
        explanation: 'Detecta qué SKU concentra el 80% del capital inmovilizado o del consumo mensual.',
        hint: 'Abre MC40 desde el Launchpad o barra de búsqueda y cambia el criterio.',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'En VL02N abre la pestaña "Dimensionamiento de Muelles (EWM)" y compara Muelles Compartidos vs Exclusivos.',
        appTarget: 'VL01N',
        explanation: 'Aplica la fórmula operativa de capacidad efectiva de muelles con factor de utilización objetivo.',
        hint: 'En VL02N cambia a la pestaña "Dimensionamiento de Muelles".',
        isCompleted: false
      }
    ]
  }
];
