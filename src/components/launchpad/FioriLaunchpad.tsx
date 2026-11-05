import React, { useState } from 'react';
import { useSAP, AppView } from '../../context/SAPContext';
import {
  Boxes,
  ArrowDownToLine,
  ShoppingCart,
  Truck,
  Grid3X3,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const FioriLaunchpad: React.FC = () => {
  const {
    setActiveApp,
    stocks,
    materials,
    purchaseOrders,
    outboundDeliveries,
    caseStudies,
    setActiveCaseStudyId
  } = useSAP();

  const [activeTab, setActiveTab] = useState<'ALL' | 'MM' | 'SD' | 'WM' | 'CASES'>('ALL');

  // Compute live KPIs
  const totalStockUnits = stocks.reduce((acc, s) => acc + s.unrestricted + s.qualityInspection + s.blocked, 0);
  
  const totalStockValuation = stocks.reduce((acc, s) => {
    const mat = materials.find(m => m.id === s.materialId);
    const price = mat ? mat.basePrice : 0;
    return acc + (s.unrestricted + s.qualityInspection + s.blocked) * price;
  }, 0);

  const pendingPOs = purchaseOrders.filter(p => p.status !== 'COMPLETADO').length;
  const pendingDeliveries = outboundDeliveries.filter(d => d.pgiStatus !== 'CONTABILIZADO').length;
  const qualityInspectionUnits = stocks.reduce((acc, s) => acc + s.qualityInspection, 0);
  const completedCasesCount = caseStudies.filter(c => c.isCompleted).length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1b2a4a] via-[#1f3560] to-[#0a6ed1] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#2a4374]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-mono mb-3 backdrop-blur-sm border border-white/10">
            <span>SAP S/4HANA Enterprise Management • Release 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Simulador Operativo para Licenciatura en Logística
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Aprende la dinámica de trabajo de un centro logístico real: gestión de stock multicentro, recepción de camiones mediante documentos de material (MIGO), pedidos de compra y despacho con picking y PGI.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveApp('CASES')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#1b2a4a] text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-[#0a6ed1]" strokeWidth={2} />
              <span>Ver Misiones Prácticas ({completedCasesCount}/{caseStudies.length})</span>
            </button>
            <button
              onClick={() => setActiveApp('MMBE')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700/60 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all border border-blue-400/30"
            >
              <Boxes className="w-4 h-4" strokeWidth={2} />
              <span>Explorar Stock (MMBE)</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background SVG grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Grid3X3 className="w-96 h-96 text-white" strokeWidth={1} />
        </div>
      </div>

      {/* KPI Horizon Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Stock Total en Planta
            </span>
            <Boxes className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {totalStockUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">unidades</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
              <span>Valuación:</span>
              <span className="font-semibold text-slate-700">${totalStockValuation.toLocaleString()} USD</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Aprovisionamiento Pendiente
            </span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {pendingPOs} <span className="text-xs font-normal text-slate-500">pedidos abiertos</span>
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              Listos para recepción física (MIGO 101)
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Expedición / Despacho
            </span>
            <Truck className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {pendingDeliveries} <span className="text-xs font-normal text-slate-500">entregas pendientes</span>
            </div>
            <div className="text-xs text-amber-700 mt-1 font-medium">
              Requieren Picking & Salida (PGI 601)
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Lotes en Cuarentena
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">
              {qualityInspectionUnits} <span className="text-xs font-normal text-slate-500">unidades en revisión</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Almacén 0002 (Control de Calidad)
            </div>
          </div>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#0a6ed1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Todas las Aplicaciones
        </button>
        <button
          onClick={() => setActiveTab('MM')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'MM'
              ? 'bg-[#0a6ed1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Gestión de Stock & Compras (MM)
        </button>
        <button
          onClick={() => setActiveTab('SD')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'SD'
              ? 'bg-[#0a6ed1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Expedición & Salidas (SD / LE)
        </button>
        <button
          onClick={() => setActiveTab('WM')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'WM'
              ? 'bg-[#0a6ed1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Almacenes & Racks (EWM)
        </button>
        <button
          onClick={() => setActiveTab('CASES')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'CASES'
              ? 'bg-[#0a6ed1] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Misiones de Práctica
        </button>
      </div>

      {/* Main Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* App 1: MMBE */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('MMBE')}
            className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0a6ed1] flex items-center justify-center group-hover:bg-[#0a6ed1] group-hover:text-white transition-colors">
                  <Boxes className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                  MMBE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-[#0a6ed1] transition-colors">
                Resumen de Stocks (Stock Overview)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Visualización jerárquica de inventario por Centro (1010), Almacén (0001, 0002) y Lotes. Consulta libre utilización y stock bloqueado.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">{materials.length} Materiales registrados</span>
              <span className="text-[#0a6ed1] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir App <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* App 2: MIGO */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('MIGO')}
            className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowDownToLine className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                  MIGO
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                Movimientos de Mercancías (Goods Movement)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Contabiliza entradas de pedidos de compra (Mov. 101) y traspasos entre almacenes internos (Mov. 311). Emite Documentos de Material.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-emerald-700 font-semibold">{pendingPOs} Entradas disponibles</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir App <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* App 3: ME21N */}
        {(activeTab === 'ALL' || activeTab === 'MM') && (
          <div
            onClick={() => setActiveApp('ME21N')}
            className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors">
                  ME21N
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                Gestión de Pedidos de Compra (Purchase Orders)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Administración de órdenes de compra a proveedores industriales con precios, cantidades pactadas y seguimiento de entregas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">{purchaseOrders.length} Órdenes en sistema</span>
              <span className="text-indigo-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir App <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* App 4: VL01N */}
        {(activeTab === 'ALL' || activeTab === 'SD') && (
          <div
            onClick={() => setActiveApp('VL01N')}
            className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Truck className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 group-hover:bg-orange-100 group-hover:text-orange-800 transition-colors">
                  VL01N / VL02N
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-orange-700 transition-colors">
                Entregas Salientes & Despacho (Outbound Deliveries)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Gestión del flujo de expedición: Confirmación de picking por lote y contabilización de salida de mercancías (PGI - Movimiento 601).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-orange-700 font-semibold">{pendingDeliveries} Pendientes de PGI</span>
              <span className="text-orange-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir App <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* App 5: EWM */}
        {(activeTab === 'ALL' || activeTab === 'WM') && (
          <div
            onClick={() => setActiveApp('EWM_RACK')}
            className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Grid3X3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700 group-hover:bg-purple-100 group-hover:text-purple-800 transition-colors">
                  EWM RACKS
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                Visor de Ubicaciones en Almacén (Storage Bins)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mapa 2D interactivo de pasillos y estanterías industriales. Supervisión de capacidad máxima de peso en kg y ocupación de posiciones.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">Pasillos A, B y C</span>
              <span className="text-purple-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Abrir App <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* App 6: CASES */}
        {(activeTab === 'ALL' || activeTab === 'CASES') && (
          <div
            onClick={() => setActiveApp('CASES')}
            className="group bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-5 border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-200 font-mono text-xs font-bold text-amber-900">
                  TRAINING
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-amber-800 transition-colors">
                Misiones Prácticas para Entrevistas Laborales
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Escenarios reales de toma de decisiones: recepción de remito discrepante, traspaso a cuarentena y expedición urgente con preguntas clave.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
              <span className="font-mono font-semibold">{completedCasesCount} de {caseStudies.length} completadas</span>
              <span className="text-amber-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Comenzar <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
