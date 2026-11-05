import {
  Plant,
  StorageLocation,
  Material,
  StockRecord,
  PurchaseOrder,
  SalesOrder,
  OutboundDelivery,
  StorageBin,
  CaseStudy
} from '../types/sap';

export const INITIAL_PLANTS: Plant[] = [
  { id: '1010', name: 'Centro de Distribución Central (Buenos Aires)', companyCode: '1000' },
  { id: '1020', name: 'Centro Logístico Rosario (Santa Fe)', companyCode: '1000' },
];

export const INITIAL_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: '0001', plantId: '1010', name: 'Almacén General (Picking & Pallets)', description: 'Recepción y almacenamiento libre' },
  { id: '0002', plantId: '1010', name: 'Control de Calidad / Cuarentena', description: 'Inspección de lotes antes de liberación' },
  { id: '0003', plantId: '1010', name: 'Área de Expedición & Despacho', description: 'Consolidación de pedidos listos para flete' },
  { id: '0004', plantId: '1010', name: 'Averías y Bloqueados', description: 'Material no apto o reclamado a proveedor' },
  { id: '0001', plantId: '1020', name: 'Almacén Regional Rosario', description: 'Almacén general satélite' },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'MAT-1001',
    name: 'Pallet Europlast 1200x800 Reforzado',
    type: 'VERP',
    unit: 'PAL',
    basePrice: 45.0,
    safetyStock: 150,
    reorderPoint: 250,
    weightKg: 18,
    storageBinDefault: 'A-01-01',
    category: 'Material de Embalaje & Paletizado'
  },
  {
    id: 'MAT-2040',
    name: 'Bobina Film Stretch Automático 500mm x 23mic',
    type: 'ROH',
    unit: 'UN',
    basePrice: 120.5,
    safetyStock: 60,
    reorderPoint: 100,
    weightKg: 16,
    storageBinDefault: 'A-01-02',
    category: 'Insumos de Empaque'
  },
  {
    id: 'MAT-3015',
    name: 'Rodamiento Rígido de Bolas SKF 6205-2RSH',
    type: 'ROH',
    unit: 'UN',
    basePrice: 38.0,
    safetyStock: 80,
    reorderPoint: 120,
    weightKg: 0.25,
    storageBinDefault: 'B-01-01',
    category: 'Repuestos & Mantenimiento Crítico'
  },
  {
    id: 'MAT-4050',
    name: 'Kit Lubricante Sintético Industrial ISO VG 220 (Tambor 208L)',
    type: 'ROH',
    unit: 'L',
    basePrice: 850.0,
    safetyStock: 8,
    reorderPoint: 15,
    weightKg: 210,
    storageBinDefault: 'C-01-01',
    category: 'Fluidos & Lubricantes'
  },
  {
    id: 'MAT-5001',
    name: 'Batería de Tracción Ion-Litio para Autoelevador 48V',
    type: 'FERT',
    unit: 'UN',
    basePrice: 4200.0,
    safetyStock: 5,
    reorderPoint: 10,
    weightKg: 420,
    storageBinDefault: 'C-02-01',
    category: 'Equipos & Maquinaria Logística'
  },
];

export const INITIAL_STOCKS: StockRecord[] = [
  {
    id: '1010-0001-MAT-1001-LOT-2026-A1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-1001',
    batch: 'LOT-2026-A1',
    unrestricted: 320,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 0,
    reserved: 40,
    lastMovementDate: '2026-11-01'
  },
  {
    id: '1010-0002-MAT-1001-LOT-2026-A2',
    plantId: '1010',
    storageLocationId: '0002',
    materialId: 'MAT-1001',
    batch: 'LOT-2026-A2',
    unrestricted: 0,
    qualityInspection: 80,
    blocked: 0,
    inTransit: 0,
    reserved: 0,
    lastMovementDate: '2026-11-03'
  },
  {
    id: '1010-0001-MAT-2040-LOT-2026-B1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-2040',
    batch: 'LOT-2026-B1',
    unrestricted: 140,
    qualityInspection: 0,
    blocked: 12,
    inTransit: 0,
    reserved: 20,
    lastMovementDate: '2026-10-28'
  },
  {
    id: '1010-0001-MAT-3015-LOT-2026-C1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-3015',
    batch: 'LOT-2026-C1',
    unrestricted: 95,
    qualityInspection: 0,
    blocked: 0,
    inTransit: 25,
    reserved: 15,
    lastMovementDate: '2026-11-04'
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
    lastMovementDate: '2026-10-15'
  },
  {
    id: '1010-0001-MAT-5001-LOT-2026-E1',
    plantId: '1010',
    storageLocationId: '0001',
    materialId: 'MAT-5001',
    batch: 'LOT-2026-E1',
    unrestricted: 8,
    qualityInspection: 2,
    blocked: 0,
    inTransit: 0,
    reserved: 2,
    lastMovementDate: '2026-11-02'
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-4500000101',
    vendorId: 'VEND-8001',
    vendorName: 'Plásticos Industriales Austral S.A.',
    plantId: '1010',
    createdDate: '2026-11-02',
    status: 'ABIERTO',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-1001',
        orderedQty: 100,
        deliveredQty: 0,
        netPrice: 45.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-06'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-2040',
        orderedQty: 50,
        deliveredQty: 0,
        netPrice: 120.5,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-06'
      }
    ]
  },
  {
    id: 'PO-4500000102',
    vendorId: 'VEND-9022',
    vendorName: 'SKF Logística & Rodamientos',
    plantId: '1010',
    createdDate: '2026-11-03',
    status: 'PARCIALMENTE_RECIBIDO',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-3015',
        orderedQty: 100,
        deliveredQty: 50,
        netPrice: 38.0,
        currency: 'USD',
        storageLocationId: '0001',
        deliveryDate: '2026-11-05'
      }
    ]
  }
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO-10000420',
    customerId: 'CUST-3001',
    customerName: 'Toyota Logistic Hub Zárate',
    orderDate: '2026-11-04',
    deliveryDate: '2026-11-08',
    plantId: '1010',
    status: 'PENDIENTE',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-1001',
        quantity: 40,
        unitPrice: 62.0,
        confirmedQty: 40
      },
      {
        itemNumber: 20,
        materialId: 'MAT-2040',
        quantity: 15,
        unitPrice: 155.0,
        confirmedQty: 15
      }
    ]
  },
  {
    id: 'SO-10000421',
    customerId: 'CUST-3044',
    customerName: 'Cervecería & Maltería Quilmes C.D.',
    orderDate: '2026-11-05',
    deliveryDate: '2026-11-09',
    plantId: '1010',
    status: 'PENDIENTE',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-5001',
        quantity: 2,
        unitPrice: 5100.0,
        confirmedQty: 2
      }
    ]
  }
];

export const INITIAL_OUTBOUND_DELIVERIES: OutboundDelivery[] = [
  {
    id: '8000002140',
    salesOrderId: 'SO-10000420',
    customerName: 'Toyota Logistic Hub Zárate',
    shippingPoint: '1010 - Muelle Despacho A',
    plannedGoodsIssueDate: '2026-11-06',
    pickingStatus: 'NO_INICIADO',
    pgiStatus: 'PENDIENTE',
    items: [
      {
        itemNumber: 10,
        materialId: 'MAT-1001',
        deliveryQty: 40,
        pickedQty: 0,
        batch: 'LOT-2026-A1',
        storageLocationId: '0001',
        storageBin: 'A-01-01'
      },
      {
        itemNumber: 20,
        materialId: 'MAT-2040',
        deliveryQty: 15,
        pickedQty: 0,
        batch: 'LOT-2026-B1',
        storageLocationId: '0001',
        storageBin: 'A-01-02'
      }
    ]
  }
];

export const INITIAL_STORAGE_BINS: StorageBin[] = [
  { id: 'A-01-01', aisle: 'A', rack: 1, level: 1, zone: 'Pesados / Pallet', maxWeightKg: 1500, currentWeightKg: 720, materialId: 'MAT-1001', batch: 'LOT-2026-A1', quantity: 40 },
  { id: 'A-01-02', aisle: 'A', rack: 1, level: 2, zone: 'Pesados / Pallet', maxWeightKg: 1200, currentWeightKg: 320, materialId: 'MAT-2040', batch: 'LOT-2026-B1', quantity: 20 },
  { id: 'A-01-03', aisle: 'A', rack: 1, level: 3, zone: 'Pesados / Pallet', maxWeightKg: 1000, currentWeightKg: 0, quantity: 0 },
  { id: 'B-01-01', aisle: 'B', rack: 1, level: 1, zone: 'Media Rotación / Repuestos', maxWeightKg: 600, currentWeightKg: 24, materialId: 'MAT-3015', batch: 'LOT-2026-C1', quantity: 95 },
  { id: 'B-01-02', aisle: 'B', rack: 1, level: 2, zone: 'Media Rotación / Repuestos', maxWeightKg: 600, currentWeightKg: 0, quantity: 0 },
  { id: 'C-01-01', aisle: 'C', rack: 1, level: 1, zone: 'Sustancias Especiales & Tambores', maxWeightKg: 2000, currentWeightKg: 1680, materialId: 'MAT-4050', batch: 'LOT-2026-D1', quantity: 8 },
  { id: 'C-02-01', aisle: 'C', rack: 2, level: 1, zone: 'Cargas Críticas', maxWeightKg: 2500, currentWeightKg: 840, materialId: 'MAT-5001', batch: 'LOT-2026-E1', quantity: 2 },
];

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'CASE-01',
    code: 'ESC-01',
    title: 'Recepción de Camión de Proveedor (MIGO 101)',
    role: 'Analista de Recepción de Mercaderías',
    difficulty: 'Principiante',
    estimatedMinutes: 5,
    context: 'El proveedor Plásticos Industriales Austral llegó con el remito correspondiente a la Orden de Compra PO-4500000101. El operario descargó los 100 Pallets Europlast y 50 bobinas de film. Debes registrar el ingreso en SAP para que el stock impacte en el sistema y el departamento de compras y finanzas pueda pagar la factura.',
    learningOutcome: 'Comprender el movimiento 101 (Entrada para pedido), verificación de posiciones y generación del Documento de Material (Material Document).',
    interviewTip: 'Pregunta típica: ¿Qué diferencia hay entre una entrada con movimiento 101 y un 501? Respuesta: 101 siempre referencia a una Orden de Compra oficial de SAP, mientras que 501 es entrada libre de inventario sin pedido.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Abre la app MIGO (o digita MIGO en la barra de búsqueda).',
        appTarget: 'MIGO',
        explanation: 'MIGO es la transacción central de SAP para todos los movimientos de mercancías.',
        hint: 'Usa la barra superior o pulsa la tarjeta "Entrada de Mercancías (MIGO)".',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Selecciona la operación "A01 Entrada de Mercancías" con documento de referencia "R01 Pedido" e introduce el pedido PO-4500000101.',
        appTarget: 'MIGO',
        explanation: 'Al vincular el pedido, SAP precarga automáticamente cantidades y centros acordados.',
        hint: 'Haz clic en "Cargar PO-4500000101" en la app MIGO.',
        isCompleted: false
      },
      {
        id: 3,
        instruction: 'Verifica las posiciones marcando el check "Posición OK" y pulsa "Contabilizar".',
        appTarget: 'MIGO',
        explanation: 'SAP no permite contabilizar si el responsable no certifica que la cantidad física coincide.',
        hint: 'Marca los checks y pulsa el botón azul "Contabilizar (Post)".',
        isCompleted: false
      },
      {
        id: 4,
        instruction: 'Ve a la app MMBE y verifica que el stock libre utilización aumentó en Centro 1010.',
        appTarget: 'MMBE',
        explanation: 'En logística, la comprobación cruzada en el resumen de inventario confirma que la recepción fue exitosa.',
        hint: 'Abre MMBE y filtra por MAT-1001.',
        isCompleted: false
      }
    ]
  },
  {
    id: 'CASE-02',
    code: 'ESC-02',
    title: 'Detección de Lote Defectuoso y Traspaso a Cuarentena (MIGO 311)',
    role: 'Supervisor de Calidad & Almacén',
    difficulty: 'Intermedio',
    estimatedMinutes: 6,
    context: 'En el Almacén General (0001) se detectó que 20 bobinas de film (MAT-2040) del lote LOT-2026-B1 tienen el embalaje roto por humedad. Debes retirarlas inmediatamente del stock comercializable y moverlas al Almacén de Control de Calidad / Cuarentena (0002) usando un traspaso interno 311.',
    learningOutcome: 'Dominar traslados de almacén a almacén (Mov. 311) para evitar que logística de despacho tome material dañado por error.',
    interviewTip: 'Pregunta típica: ¿Qué movimiento de SAP usarías si encuentras mercadería dañada en tu pasillo? Respuesta: Se realiza un traspaso 311 de Almacén 0001 a Almacén de Cuarentena (0002) o a Control de Calidad.',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Ingresa a la app MIGO y selecciona operación "A08 Traspaso" con movimiento 311.',
        appTarget: 'MIGO',
        explanation: 'El movimiento 311 permite transferencias en un solo paso entre almacenes del mismo centro.',
        hint: 'Selecciona modo Traspaso (Movimiento 311).',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Configura Material MAT-2040, Cantidad 20, Almacén Origen 0001 y Almacén Destino 0002.',
        appTarget: 'MIGO',
        explanation: 'El sistema descuenta del stock de libre utilización de 0001 e ingresa al almacén de inspección 0002.',
        hint: 'Completa los campos y haz clic en "Contabilizar Traspaso".',
        isCompleted: false
      },
      {
        id: 3,
        instruction: 'Abre MMBE para constatar que el Almacén 0002 ahora refleja las unidades trasladadas.',
        appTarget: 'MMBE',
        explanation: 'Garantiza la trazabilidad del lote y la visibilidad para el equipo de auditoría.',
        hint: 'Comprueba el desglose por almacenes en MMBE.',
        isCompleted: false
      }
    ]
  },
  {
    id: 'CASE-03',
    code: 'ESC-03',
    title: 'Despacho de Pedido Urgente a Cliente (VL01N / Picking & PGI)',
    role: 'Coordinador de Expedición & Tráfico',
    difficulty: 'Intermedio',
    estimatedMinutes: 7,
    context: 'El cliente Toyota Logistic Hub Zárate espera su pedido urgente SO-10000420. La entrega saliente 8000002140 está generada pero en estado "No iniciado". El equipo de almacén recolectó los pallets y las bobinas de las ubicaciones. Debes confirmar el picking y hacer la Salida de Mercancías (PGI - Post Goods Issue) para liberar el camión.',
    learningOutcome: 'Entender el ciclo de entrega saliente en SAP SD/LE: Picking $\rightarrow$ Contabilización PGI (Mov. 601) $\rightarrow$ Descuento automático de stock.',
    interviewTip: 'Pregunta típica: ¿Qué impacto logístico y financiero tiene el PGI (Post Goods Issue)? Respuesta: Da de baja el inventario físicamente (movimiento 601), transfiere la propiedad legal de la mercadería al cliente y habilita la facturación (VF01).',
    isCompleted: false,
    steps: [
      {
        id: 1,
        instruction: 'Ingresa a la app "Gestión de Entregas Salientes (VL01N / VL02N)".',
        appTarget: 'VL01N',
        explanation: 'Pantalla donde el despachante ve entregas pendientes de preparación.',
        hint: 'Haz clic en la tile de Entregas Salientes o escribe VL01N.',
        isCompleted: false
      },
      {
        id: 2,
        instruction: 'Localiza la entrega 8000002140 y confirma el Picking del 100% de las cantidades.',
        appTarget: 'VL01N',
        explanation: 'En SAP no se puede contabilizar la salida sin que la cantidad de picking coincida con la cantidad de entrega.',
        hint: 'Haz clic en "Registrar Picking Completo".',
        isCompleted: false
      },
      {
        id: 3,
        instruction: 'Pulsa el botón "Contabilizar Salida de Mercancías (PGI)".',
        appTarget: 'VL01N',
        explanation: 'Genera el movimiento 601 y el documento de material de expedición.',
        hint: 'El botón se activa cuando el picking está al 100%.',
        isCompleted: false
      }
    ]
  }
];
