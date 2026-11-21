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
  { id: '1010', name: 'Centro de Distribución Central (1010)', companyCode: '1000' },
  { id: '1020', name: 'Planta Industrial Norte (1020)', companyCode: '1000' }
];

export const INITIAL_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: '0001', plantId: '1010', name: 'Almacén General (Libre Utilización)', description: 'Picking, pallets y stock disponible' },
  { id: '0002', plantId: '1010', name: 'Control de Calidad / Inspección', description: 'Cuarentena de lotes y ensayo técnico' },
  { id: '0003', plantId: '1010', name: 'Área de Expedición & Muelles', description: 'Consolidación de carga y despacho' },
  { id: '0004', plantId: '1010', name: 'Devoluciones & Bloqueados (Log. Inversa)', description: 'Retornos de clientes y material no conforme' },
  { id: '0001', plantId: '1020', name: 'Almacén Materia Prima Planta 1020', description: 'Componentes y subensambles MRP' }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'MAT-A100',
    name: 'Motor Eléctrico Industrial 5HP',
    type: 'FERT',
    unit: 'UN',
    basePrice: 680.0,
    safetyStock: 20,
    reorderPoint: 35,
    weightKg: 32,
    storageBinDefault: 'A-01-01',
    category: 'Equipos Electromecánicos',
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
    name: 'Bomba Centrífuga Industrial 3"',
    type: 'FERT',
    unit: 'UN',
    basePrice: 540.0,
    safetyStock: 15,
    reorderPoint: 30,
    weightKg: 24,
    storageBinDefault: 'A-01-02',
    category: 'Equipos Electromecánicos',
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
    name: 'Kit de Sellos Mecánicos y Juntas',
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
    name: 'Batería de Tracción Ion-Litio 48V',
    type: 'FERT',
    unit: 'UN',
    basePrice: 4200.0,
    safetyStock: 4,
    reorderPoint: 8,
    weightKg: 420,
    storageBinDefault: 'C-02-01',
    category: 'Equipamiento de Almacén',
    abcClass: 'A',
    monthlyDemand: 12,
    leadTimeWeeks: 2,
    lotSizePolicy: 'L4L',
    lotSizeQty: 1
  },
  {
    id: 'MAT-4050',
    name: 'Lubricante Sintético ISO VG 220 (Tambor 208L)',
    type: 'ROH',
    unit: 'L',
    basePrice: 850.0,
    safetyStock: 8,
    reorderPoint: 15,
    weightKg: 210,
    storageBinDefault: 'C-01-01',
    category: 'Insumos & Fluidos',
    abcClass: 'B',
    monthlyDemand: 24,
    leadTimeWeeks: 2,
    lotSizePolicy: 'EOQ',
    lotSizeQty: 20
  },
  {
    id: 'MAT-3015',
    name: 'Rodamiento Rígido de Bolas 6205-2RSH',
    type: 'ROH',
    unit: 'UN',
    basePrice: 38.0,
    safetyStock: 60,
    reorderPoint: 100,
    weightKg: 0.25,
    storageBinDefault: 'B-01-02',
    category: 'Componentes Estándar',
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
    category: 'Material de Embalaje',
    abcClass: 'C',
    monthlyDemand: 180,
    leadTimeWeeks: 1,
    lotSizePolicy: 'EOQ',
    lotSizeQty: 100
  },
  {
    id: 'MAT-2040',
    name: 'Bobina Film Stretch Automático 500mm',
    type: 'VERP',
    unit: 'UN',
    basePrice: 28.0,
    safetyStock: 50,
    reorderPoint: 90,
    weightKg: 16,
    storageBinDefault: 'B-01-03',
    category: 'Material de Embalaje',
    abcClass: 'C',
    monthlyDemand: 140,
    leadTimeWeeks: 1,
    lotSizePolicy: 'L4L',
    lotSizeQty: 50
  }
];

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
    vendorId: 'VEND-1002',
    vendorName: 'Suministros Industriales del Sur S.A. (Estándar 72h)',
    vendorReliability: 88,
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
        netPrice: 680.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-24'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-C300',
        orderedQty: 60,
        deliveredQty: 0,
        netPrice: 95.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-24'
      }
    ]
  },
  {
    id: 'PO-4500000102',
    vendorId: 'VEND-1003',
    vendorName: 'Distribuidora Express Industrial S.R.L. (Reposición 30h)',
    vendorReliability: 94,
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
        netPrice: 745.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-22'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-B200',
        orderedQty: 35,
        deliveredQty: 0,
        netPrice: 590.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-22'
      },
      {
        itemNumber: 30,
        materialId: 'MAT-C300',
        orderedQty: 35,
        deliveredQty: 0,
        netPrice: 108.0,
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
    customerId: 'CUST-2001',
    customerName: 'Industrias Mecánicas del Litoral S.A.',
    orderDate: '2026-11-19',
    deliveryDate: '2026-11-22',
    plantId: '1010',
    priority: 'ESTRATEGICO',
    status: 'EN_EXPEDICION',
    items: [
      { itemNumber: 10, materialId: 'MAT-A100', quantity: 40, unitPrice: 920.0, confirmedQty: 40 },
      { itemNumber: 20, materialId: 'MAT-C300', quantity: 70, unitPrice: 145.0, confirmedQty: 70 }
    ]
  },
  {
    id: 'SO-10000421',
    customerId: 'CUST-2002',
    customerName: 'Operadora Agroindustrial Central S.A.',
    orderDate: '2026-11-21',
    deliveryDate: '2026-11-23',
    plantId: '1010',
    priority: 'CRITICO_48H',
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
    customerName: 'Industrias Mecánicas del Litoral S.A.',
    shippingPoint: '1010 — Muelle Expedición M1',
    transportMode: 'TERCERIZADO',
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
    customerName: 'Distribuidora Regional Pampeana S.A.',
    shippingPoint: '1010 — Muelle Expedición M2',
    transportMode: 'PROPIO',
    routeKm: 120,
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
    customerName: 'Distribuidora Regional Pampeana S.A.',
    salesOrderRef: 'SO-10000398',
    materialId: 'MAT-A100',
    batch: 'LOT-MS-09',
    quantity: 5,
    reason: '2 u. embalaje dañado (equipo apto), 2 u. falla técnica, 1 u. daño irreversible',
    receivedDate: '2026-11-21',
    disposition: 'PENDIENTE_INSPECCION',
    recoveredQty: 0,
    notes: 'Ingresar a Stock Bloqueado de Devoluciones (Almacén 0004) antes de inspección técnica.'
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

export const INITIAL_MRP_SCHEDULES: MRPWeeklySchedule[] = [
  { materialId: 'MAT-A100', grossRequirements: [20, 20, 20, 20, 20, 20], scheduledReceipts: [0, 0, 0, 0, 0, 0] },
  { materialId: 'MAT-B200', grossRequirements: [15, 15, 15, 15, 15, 15], scheduledReceipts: [0, 0, 0, 0, 0, 0] },
  { materialId: 'MAT-C300', grossRequirements: [25, 30, 20, 35, 30, 25], scheduledReceipts: [100, 0, 0, 0, 0, 0] },
  { materialId: 'MAT-3015', grossRequirements: [40, 85, 10, 60, 130, 110], scheduledReceipts: [0, 0, 0, 0, 0, 0] }
];

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

// Decoupled practice scenarios (completely independent of SAP core modules)
export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'CASE-TECNOSUR',
    code: 'PRAC-01',
    subjectTag: 'MM + SD/LE (End-to-End)',
    title: 'Contingencia de Inventario, Reposición Urgente y Expedición',
    role: 'Analista de Operaciones & Inventario',
    difficulty: 'Avanzado',
    estimatedMinutes: 10,
    context: 'Se detectaron 17 unidades de MAT-A100 con potencial daño por humedad en el Almacén 0001. Debes bloquearlas preventivamente (MIGO 344), verificar el saldo utilizable real en MMBE, recepcionar la orden de reposición rápida PO-4500000102 (MIGO 101) y despachar la entrega saliente 8000002140 completando picking, los 5 controles de carga y el PGI (601).',
    learningOutcome: 'Dominar la integración entre MIGO (344 y 101), MMBE y VL02N (PGI 601) ante una contingencia operativa real.',
    interviewTip: 'Pregunta típica: "Ante un siniestro o daño en depósito, ¿cómo evitás en SAP que Ventas o Picking tomen mercadería afectada?" Respuesta: Con MIGO Movimiento 344 (Traspaso de Libre Utilización a Stock Bloqueado).',
    isCompleted: false,
    steps: [
      { id: 1, instruction: 'En MIGO (Mov. 344), bloquea 17 u. de MAT-A100 (lote LOT-TS-A1).', appTarget: 'MIGO', explanation: 'Retira el stock de disponibilidad comercial sin sacarlo físicamente del centro.', hint: 'Pestaña Mov. 344 Bloqueo -> 17 u. MAT-A100.', isCompleted: false },
      { id: 2, instruction: 'Verifica en MMBE el nuevo saldo utilizable (43 u.) y bloqueado (17 u.).', appTarget: 'MMBE', explanation: 'Confirma el inventario disponible antes de comprometer entregas.', hint: 'Abre MMBE y revisa MAT-A100.', isCompleted: false },
      { id: 3, instruction: 'En MIGO (Mov. 101), recepciona el Pedido de Compra PO-4500000102.', appTarget: 'MIGO', explanation: 'Reabastece el almacén general y emite el Documento de Material.', hint: 'Pestaña A01 Entrada (101) -> PO-4500000102.', isCompleted: false },
      { id: 4, instruction: 'En VL02N, completa Picking, los 5 controles y contabiliza PGI (601) de la entrega 8000002140.', appTarget: 'VL02N', explanation: 'Descuenta stock, genera movimiento 601 y habilita la facturación.', hint: 'Entrega 8000002140 -> Picking -> 5 checks -> PGI.', isCompleted: false }
    ]
  },
  {
    id: 'CASE-DEVOLUCIONES',
    code: 'PRAC-02',
    subjectTag: 'MM Logística Inversa + Analytics',
    title: 'Gestión de Devoluciones de Clientes e Inspección Técnica',
    role: 'Responsable de Logística Inversa & Calidad',
    difficulty: 'Intermedio',
    estimatedMinutes: 6,
    context: 'Un cliente retorna 5 unidades de MAT-A100 (orden RET-6500001). En SAP una devolución nunca debe ingresar directo a Libre Utilización: primero ingresa con MIGO Mov. 651 al Almacén 0004 (Bloqueado), luego se inspecciona para recuperar las 2 unidades aptas y finalmente se audita la Tasa de Recuperación en el Tablero CMI.',
    learningOutcome: 'Ejecutar devoluciones con Mov. 651, gestionar inspección técnica y leer indicadores de logística inversa.',
    interviewTip: 'Pregunta típica: "¿Por qué una devolución no vuelve directo a stock disponible?" Respuesta: Porque compromete la calidad del siguiente despacho; en SAP se ingresa a Bloqueado (651) hasta clasificar qué es recuperable y qué va a disposición final.',
    isCompleted: false,
    steps: [
      { id: 1, instruction: 'En MIGO (Mov. 651), ingresa la devolución RET-6500001 a Stock Bloqueado (0004).', appTarget: 'MIGO', explanation: 'Registra el retorno físico con trazabilidad de documento de material.', hint: 'Pestaña Mov. 651 Devolución -> Ingresar RET-6500001.', isCompleted: false },
      { id: 2, instruction: 'Clasifica la inspección recuperando 2 unidades hacia Almacén 0001.', appTarget: 'MIGO', explanation: 'Reincorpora solo el material validado y actualiza la tasa de recuperación.', hint: 'Botón "Clasificar y Recuperar (2 u.)".', isCompleted: false },
      { id: 3, instruction: 'Audita la Tasa de Devolución y Tasa de Recuperación en el Tablero CMI.', appTarget: 'CMI', explanation: 'Valida el impacto de la operación en los KPIs gerenciales.', hint: 'Abre el tablero CMI / OTIF.', isCompleted: false }
    ]
  },
  {
    id: 'CASE-MRP',
    code: 'PRAC-03',
    subjectTag: 'PP Planificación (MRP & BOM)',
    title: 'Planificación de Requerimientos de Materiales (MD04 / CS03)',
    role: 'Analista de Planeamiento y Control (PP)',
    difficulty: 'Intermedio',
    estimatedMinutes: 7,
    context: 'Analiza el horizonte de 6 semanas para MAT-A100 en el monitor MRP (MD04), observa cómo la política de loteo (Lote a Lote vs Lote Fijo) altera el costo total de inventario y revisa la explosión de la Lista de Materiales (CS03) sobre sus componentes hijos.',
    learningOutcome: 'Interpretar la pantalla MD04, el desplazamiento por Lead Time y la explosión BOM multinivel.',
    interviewTip: 'Pregunta típica: "¿Qué pasa en MD04 si el inventario físico real tiene menos unidades que el sistema?" Respuesta: Se disparan necesidades netas anticipadas y se adelantan las liberaciones de órdenes en el padre y sus componentes hijos.',
    isCompleted: false,
    steps: [
      { id: 1, instruction: 'Abre MD04 y selecciona MAT-A100 para inspeccionar su tabla MRP y BOM (CS03).', appTarget: 'MD04', explanation: 'Conecta el stock vivo de MMBE con las necesidades semanales.', hint: 'Escribe MD04 en la barra de búsqueda.', isCompleted: false },
      { id: 2, instruction: 'Alterna la política de loteo (Lote a Lote vs Lote Fijo) y compara el costo total.', appTarget: 'MD04', explanation: 'Evalúa el equilibrio entre costo de lanzamiento y costo de mantenimiento.', hint: 'Cambia el selector "Política de Loteo".', isCompleted: false }
    ]
  },
  {
    id: 'CASE-ABC',
    code: 'PRAC-04',
    subjectTag: 'MM Abastecimiento + EWM Muelles',
    title: 'Segmentación ABC / Pareto (MC40) y Capacidad de Muelles (EWM)',
    role: 'Analista de Abastecimiento & Almacén',
    difficulty: 'Principiante',
    estimatedMinutes: 5,
    context: 'Compara cómo cambia la clasificación ABC de los materiales al pasar de Valor de Utilización a Valorizado de Inventario en MC40, y calcula la cantidad óptima de muelles compartidos vs exclusivos en el módulo EWM Dock Scheduling.',
    learningOutcome: 'Aplicar segmentación Pareto en SAP y dimensionar capacidad efectiva de muelles previniendo colas en hora pico.',
    interviewTip: 'Pregunta típica: "¿Conviene construir un muelle nuevo si hay colas a la mañana?" Respuesta: Primero se analiza la distribución horaria; programar turnos de arribo y prevalidar remitos suele liberar capacidad sin invertir en infraestructura.',
    isCompleted: false,
    steps: [
      { id: 1, instruction: 'Abre MC40 y compara los criterios Valor de Utilización vs Valorizado de Inventario.', appTarget: 'MC40', explanation: 'Identifica qué materiales concentran el 80% del valor.', hint: 'Cambia el criterio en MC40.', isCompleted: false },
      { id: 2, instruction: 'Abre EWM Dock Scheduling (MUELLES) y compara Muelles Compartidos vs Exclusivos.', appTarget: 'MUELLES', explanation: 'Aplica el cálculo de capacidad efectiva de muelles.', hint: 'Escribe MUELLES en la barra superior o ábrelo desde el Launchpad.', isCompleted: false }
    ]
  }
];
