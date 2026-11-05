import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  ShoppingCart,
  Plus,
  ArrowDownToLine,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText
} from 'lucide-react';

export const ME21NPurchaseOrders: React.FC = () => {
  const { purchaseOrders, materials, setActiveApp } = useSAP();
  const [selectedPOId, setSelectedPOId] = useState<string>(purchaseOrders[0]?.id || '');

  const activePO = purchaseOrders.find(p => p.id === selectedPOId) || purchaseOrders[0];

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5 animate-in fade-in-50 duration-200">
      {/* Title & App Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Gestión de Pedidos de Compra (Purchase Orders)
                </h2>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">
                  ME21N / ME22N / ME23N
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Monitoreo de contratos de aprovisionamiento con proveedores, condiciones de entrega y control de recepciones
              </p>
            </div>
          </div>
        </div>

        {/* Shortcut to MIGO */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveApp('MIGO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Ir a MIGO (Recepción de Mercancía)</span>
          </button>
        </div>
      </div>

      {/* PO Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PO List */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Órdenes de Compra en el Sistema
          </h3>

          <div className="space-y-2">
            {purchaseOrders.map(po => {
              const isSelected = po.id === activePO?.id;
              const isCompleted = po.status === 'COMPLETADO';

              return (
                <div
                  key={po.id}
                  onClick={() => setSelectedPOId(po.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">{po.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'PARCIALMENTE_RECIBIDO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                    {po.vendorName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between font-mono">
                    <span>Centro {po.plantId}</span>
                    <span>Emitido: {po.createdDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected PO Details */}
        <div className="lg:col-span-2 space-y-5">
          {activePO ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-800 font-mono">
                      Pedido {activePO.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({activePO.vendorName})
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Centro Suministrado: <strong className="text-slate-800">{activePO.plantId}</strong></span>
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fecha Emisión: <strong className="text-slate-800">{activePO.createdDate}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveApp('MIGO')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Recepcionar en MIGO</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Posiciones de Material Contratadas
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3 font-mono">Pos.</th>
                        <th className="py-2.5 px-4">Material / SKU</th>
                        <th className="py-2.5 px-3 text-right font-mono">Cant. Solicitada</th>
                        <th className="py-2.5 px-3 text-right font-mono text-emerald-800">Cant. Entregada</th>
                        <th className="py-2.5 px-3 text-right font-mono text-amber-800">Saldo Pendiente</th>
                        <th className="py-2.5 px-3 text-right font-mono">Precio Unitario</th>
                        <th className="py-2.5 px-3 font-mono">Fecha Entrega</th>
                        <th className="py-2.5 px-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activePO.items.map(it => {
                        const mat = materials.find(m => m.id === it.materialId);
                        const pendingQty = Math.max(0, it.orderedQty - it.deliveredQty);

                        return (
                          <tr key={it.itemNumber} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-slate-500">{it.itemNumber}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{mat?.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{it.materialId}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                              {it.orderedQty} {mat?.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                              {it.deliveredQty} {mat?.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                              {pendingQty} {mat?.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-600">
                              ${it.netPrice.toFixed(2)} {it.currency}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {it.deliveryDate}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {pendingQty === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completo
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
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border text-center text-slate-500">
              No hay pedidos seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
