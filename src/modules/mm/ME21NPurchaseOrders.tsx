import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  ShoppingCart,
  ArrowDownToLine,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus
} from 'lucide-react';

export const ME21NPurchaseOrders: React.FC = () => {
  const { purchaseOrders, materials, setActiveApp, createPurchaseOrder } = useSAP();
  const [selectedPOId, setSelectedPOId] = useState<string>(purchaseOrders[0]?.id || '');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New PO form state
  const [vendorPreset, setVendorPreset] = useState<'P2' | 'P3'>('P3');
  const [newMatId, setNewMatId] = useState<string>('MAT-A100');
  const [newQty, setNewQty] = useState<number>(25);

  const activePO = purchaseOrders.find(p => p.id === selectedPOId) || purchaseOrders[0];

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === newMatId);
    const basePrice = mat?.basePrice || 100;
    const isP3 = vendorPreset === 'P3';
    const vendorName = isP3
      ? 'P3 — Mercado de Emergencia (Plazo 30h, Pago Anticipado)'
      : 'P2 — Suministros Industriales del Sur (Operación Parcial 45%)';
    const price = +(basePrice * (isP3 ? 1.65 : 1.32)).toFixed(2);
    const res = createPurchaseOrder(vendorName, isP3 ? 82 : 68, isP3 ? 30 : 72, newMatId, newQty, price);
    if (res.success) {
      setSelectedPOId(res.poId);
      setShowCreateForm(false);
    }
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Title & Bar */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Gestión de Pedidos de Compra & Proveedores
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#f0f4f9] text-[#0a6ed1] border border-[#c2dcf7] font-mono text-xs font-bold">
                ME21N / ME23N
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Emisión de órdenes de compra (P2 parcial 72h vs P3 emergencia 30h), evaluación de confiabilidad y seguimiento de entregas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Pedido (ME21N)</span>
          </button>
          <button
            onClick={() => setActiveApp('MIGO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#107e3e] hover:bg-[#0c6330] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Recepcionar en MIGO</span>
          </button>
        </div>
      </div>

      {/* Create PO Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePO} className="bg-white rounded-xl p-5 border-2 border-[#0a6ed1] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#edf2f7] pb-2.5">
            <h3 className="text-xs font-bold text-[#0a6ed1] uppercase tracking-wider">
              Nueva Orden de Compra (ME21N) — Evaluación de Proveedores
            </h3>
            <button type="button" onClick={() => setShowCreateForm(false)} className="text-xs text-[#5b738b] hover:text-[#1d2d3e]">
              Cancelar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Proveedor Aprobado</label>
              <select
                value={vendorPreset}
                onChange={e => setVendorPreset(e.target.value as 'P2' | 'P3')}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                <option value="P3">Distribuidora Express Industrial (30h · 94% conf.)</option>
                <option value="P2">Suministros Industriales del Sur (72h · 88% conf.)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Material</label>
              <select
                value={newMatId}
                onChange={e => setNewMatId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                max="95"
                value={newQty}
                onChange={e => setNewQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white font-mono font-bold"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-bold transition-colors"
              >
                Emitir Orden de Compra
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PO Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0a6ed1]" />
            Órdenes de Compra Activas
          </h3>
          <div className="space-y-2">
            {purchaseOrders.map(po => {
              const isSelected = po.id === activePO?.id;
              return (
                <div
                  key={po.id}
                  onClick={() => setSelectedPOId(po.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0a6ed1] bg-[#f0f4f9] ring-1 ring-[#0a6ed1]'
                      : 'border-[#d9e1e8] hover:border-[#0a6ed1]/50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#1d2d3e]">{po.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        po.status === 'COMPLETADO'
                          ? 'bg-[#eaf7ee] text-[#107e3e]'
                          : po.status === 'PARCIALMENTE_RECIBIDO'
                          ? 'bg-[#fef3e6] text-[#9a4d06]'
                          : 'bg-[#f0f4f9] text-[#0a6ed1]'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1d2d3e] mt-1">{po.vendorName}</div>
                  <div className="text-[11px] text-[#5b738b] mt-1 flex items-center justify-between font-mono">
                    <span>Confiab: {po.vendorReliability || 95}%</span>
                    <span>Plazo: {po.leadTimeHours || 48}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8">
          {activePO && (
            <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#d9e1e8] bg-[#f5f6f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#1d2d3e] font-mono">{activePO.id}</span>
                    <span className="text-xs text-[#5b738b]">{activePO.vendorName}</span>
                  </div>
                  <div className="text-xs text-[#5b738b] mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Centro {activePO.plantId}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Emitido {activePO.createdDate}</span>
                    {activePO.vendorReliability && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-semibold text-[#0a6ed1]">Confiabilidad {activePO.vendorReliability}% · Plazo {activePO.leadTimeHours}h</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveApp('MIGO')}
                  className="px-4 py-2 rounded-lg bg-[#107e3e] hover:bg-[#0c6330] text-white text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Recepcionar (MIGO 101)</span>
                </button>
              </div>

              <div className="p-5 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f5f6f7] text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                      <th className="py-2.5 px-3 font-mono">Pos.</th>
                      <th className="py-2.5 px-4">Material</th>
                      <th className="py-2.5 px-3 text-right font-mono">Pedido</th>
                      <th className="py-2.5 px-3 text-right font-mono text-[#107e3e]">Recibido</th>
                      <th className="py-2.5 px-3 text-right font-mono text-[#e9730c]">Pendiente</th>
                      <th className="py-2.5 px-3 text-right font-mono">Precio Unit.</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2f7]">
                    {activePO.items.map(it => {
                      const mat = materials.find(m => m.id === it.materialId);
                      const pending = Math.max(0, it.orderedQty - it.deliveredQty);
                      return (
                        <tr key={it.itemNumber} className="hover:bg-[#f0f4f9]/40">
                          <td className="py-3 px-3 font-mono text-[#5b738b]">{it.itemNumber}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#1d2d3e]">{mat?.name}</div>
                            <div className="text-[11px] font-mono text-[#5b738b]">{it.materialId}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">{it.orderedQty} {mat?.unit}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#107e3e] tabular-nums">{it.deliveredQty} {mat?.unit}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#e9730c] tabular-nums">{pending} {mat?.unit}</td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">${it.netPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">
                            {pending === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#107e3e] bg-[#eaf7ee] px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Completo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9a4d06] bg-[#fef3e6] px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" /> Abierto
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
          )}
        </div>
      </div>
    </div>
  );
};
