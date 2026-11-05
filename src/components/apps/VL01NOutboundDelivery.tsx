import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Truck,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Boxes,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const VL01NOutboundDelivery: React.FC = () => {
  const {
    outboundDeliveries,
    materials,
    confirmPicking,
    postGoodsIssue,
    setActiveApp,
    activeCaseStudyId,
    completeCaseStep
  } = useSAP();

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(outboundDeliveries[0]?.id || '');
  const activeDelivery = outboundDeliveries.find(d => d.id === selectedDeliveryId) || outboundDeliveries[0];

  // Track case study step 1 completion
  React.useEffect(() => {
    if (activeCaseStudyId === 'CASE-03') {
      completeCaseStep('CASE-03', 1);
    }
  }, [activeCaseStudyId]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5 animate-in fade-in-50 duration-200">
      {/* Title & App Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Gestión de Entregas Salientes & Despacho (Outbound Delivery)
                </h2>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono text-xs font-bold">
                  VL01N / VL02N
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Flujo logístico de preparación de pedidos: asignación de lotes, confirmación de Picking y Salida de Mercancías (PGI - Mov. 601)
              </p>
            </div>
          </div>
        </div>

        {/* Action Shortcut to Stock */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveApp('MMBE')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Boxes className="w-4 h-4 text-slate-600" />
            <span>Consultar Stock (MMBE)</span>
          </button>
        </div>
      </div>

      {/* Deliveries Overview & Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Delivery Selector Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Entregas Salientes en Monitor de Expedición
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {outboundDeliveries.map(del => {
              const isSelected = del.id === activeDelivery?.id;
              const isPGICompleted = del.pgiStatus === 'CONTABILIZADO';

              return (
                <div
                  key={del.id}
                  onClick={() => setSelectedDeliveryId(del.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">{del.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isPGICompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : del.pickingStatus === 'COMPLETADO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPGICompleted ? 'PGI Realizado' : `Picking ${del.pickingStatus}`}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                    {del.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between font-mono">
                    <span>Pedido: {del.salesOrderId}</span>
                    <span>Fecha: {del.plannedGoodsIssueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Selected Delivery Detail & Processing */}
        <div className="lg:col-span-2 space-y-5">
          {activeDelivery ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Info Banner */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800 font-mono">
                        Documento de Entrega {activeDelivery.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        (Ref. Pedido de Venta {activeDelivery.salesOrderId})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Destinatario: <strong className="text-slate-800">{activeDelivery.customerName}</strong></span>
                      <span>•</span>
                      <span>Punto de Expedición: <strong className="text-slate-800">{activeDelivery.shippingPoint}</strong></span>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Estado Picking:</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          activeDelivery.pickingStatus === 'COMPLETADO' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {activeDelivery.pickingStatus}
                      </span>
                    </div>
                    <div className="text-right border-l pl-2 border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Estado PGI (Mov. 601):</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          activeDelivery.pgiStatus === 'CONTABILIZADO' ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {activeDelivery.pgiStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Posiciones de la Entrega & Estado de Recolección (Picking)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3 font-mono">Pos.</th>
                        <th className="py-2.5 px-4">Material / Denominación</th>
                        <th className="py-2.5 px-3 text-right font-mono">Cant. Entrega</th>
                        <th className="py-2.5 px-3 text-right font-mono text-orange-800">Cant. Pickeada</th>
                        <th className="py-2.5 px-3 font-mono">Lote</th>
                        <th className="py-2.5 px-3 font-mono">Ubicación Rack</th>
                        <th className="py-2.5 px-3 text-center">Estado Ítem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDelivery.items.map(it => {
                        const mat = materials.find(m => m.id === it.materialId);
                        const isFullyPicked = it.pickedQty >= it.deliveryQty;

                        return (
                          <tr key={it.itemNumber} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-slate-500">{it.itemNumber}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{mat?.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{it.materialId}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                              {it.deliveryQty} {mat?.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-orange-700">
                              {it.pickedQty} {mat?.unit}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border text-[11px]">
                                {it.batch}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                                {it.storageBin}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isFullyPicked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Listo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Operations Control Actions */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {activeDelivery.pgiStatus === 'CONTABILIZADO' ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Salida contabilizada exitosamente con Doc. Material {activeDelivery.materialDocRef}.
                      </span>
                    ) : activeDelivery.pickingStatus !== 'COMPLETADO' ? (
                      'Paso 1: Confirma la recolección física de los productos para habilitar la salida.'
                    ) : (
                      'Paso 2: Todo el picking está completo. Pulsa Contabilizar PGI para descontar el stock y liberar el camión.'
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeDelivery.pickingStatus !== 'COMPLETADO' && (
                      <button
                        onClick={() => confirmPicking(activeDelivery.id)}
                        className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Registrar Picking Completo</span>
                      </button>
                    )}

                    {activeDelivery.pgiStatus !== 'CONTABILIZADO' && (
                      <button
                        onClick={() => postGoodsIssue(activeDelivery.id)}
                        disabled={activeDelivery.pickingStatus !== 'COMPLETADO'}
                        className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                          activeDelivery.pickingStatus === 'COMPLETADO'
                            ? 'bg-[#0a6ed1] hover:bg-blue-700 cursor-pointer'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Contabilizar Salida de Mercancías (PGI)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-10 border text-center text-slate-500">
              No hay entregas salientes seleccionadas.
            </div>
          )}

          {/* Educational Callout */}
          <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200 text-xs text-orange-950 flex items-start gap-3">
            <Truck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" strokeWidth={1.8} />
            <div>
              <h4 className="font-bold text-orange-950">Tip de Entrevista — El Ciclo Outbound en SAP:</h4>
              <p className="mt-1 leading-relaxed text-orange-900/90">
                El flujo de ventas y distribución sigue la secuencia: <strong>Sales Order (VA01) $\rightarrow$ Outbound Delivery (VL01N) $\rightarrow$ Picking (VL02N) $\rightarrow$ PGI (Post Goods Issue - Mov. 601) $\rightarrow$ Factura (VF01)</strong>. Si un reclutador te pregunta por qué una entrega no permite emitir factura, la causa más común es que no se contabilizó el PGI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
