import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  ArrowDownToLine,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
  Truck,
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const MIGOGoodsMovement: React.FC = () => {
  const {
    purchaseOrders,
    materials,
    stocks,
    storageLocations,
    materialDocuments,
    postGoodsReceiptPO,
    postStockTransfer,
    setActiveApp,
    activeCaseStudyId,
    completeCaseStep
  } = useSAP();

  const [operationMode, setOperationMode] = useState<'A01_RECEIPT' | 'A08_TRANSFER'>('A01_RECEIPT');

  // A01 Receipt State
  const [selectedPOId, setSelectedPOId] = useState<string>(purchaseOrders[0]?.id || '');
  const [remitoNumber, setRemitoNumber] = useState('REM-0004-98120');
  const [itemsToReceive, setItemsToReceive] = useState<
    { itemNumber: number; materialId: string; qty: number; storageLocationId: string; batch: string; isChecked: boolean }[]
  >([]);

  // A08 Transfer State
  const [transferMaterialId, setTransferMaterialId] = useState<string>(materials[1]?.id || 'MAT-2040');
  const [transferBatch, setTransferBatch] = useState<string>('LOT-2026-B1');
  const [transferQty, setTransferQty] = useState<number>(20);
  const [transferFromLoc, setTransferFromLoc] = useState<string>('0001');
  const [transferToLoc, setTransferToLoc] = useState<string>('0002');

  const selectedPO = purchaseOrders.find(p => p.id === selectedPOId);

  // Sync PO items when selected PO changes
  React.useEffect(() => {
    if (selectedPO) {
      setItemsToReceive(
        selectedPO.items.map(it => {
          const remaining = Math.max(0, it.orderedQty - it.deliveredQty);
          return {
            itemNumber: it.itemNumber,
            materialId: it.materialId,
            qty: remaining,
            storageLocationId: it.storageLocationId || '0001',
            batch: 'LOT-2026-' + Math.floor(100 + Math.random() * 900),
            isChecked: remaining > 0
          };
        })
      );
    }
  }, [selectedPOId, purchaseOrders]);

  // Track case study step 2 completion
  React.useEffect(() => {
    if (activeCaseStudyId === 'CASE-01' && selectedPOId === 'PO-4500000101') {
      completeCaseStep('CASE-01', 2);
    }
  }, [activeCaseStudyId, selectedPOId]);

  const handlePostReceipt = () => {
    if (!selectedPO) return;
    const validItems = itemsToReceive.filter(i => i.isChecked && i.qty > 0);
    if (validItems.length === 0) {
      alert('Debes marcar al menos una posición con "Posición OK" y cantidad mayor a cero.');
      return;
    }

    postGoodsReceiptPO(selectedPO.id, validItems);
  };

  const handlePostTransfer = () => {
    postStockTransfer(transferMaterialId, transferBatch, transferQty, transferFromLoc, transferToLoc, '1010');
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5 animate-in fade-in-50 duration-200">
      {/* Title & App Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowDownToLine className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Movimientos de Mercancías (Post Goods Movement)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  MIGO
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Contabilización y generación oficial de Documentos de Material para entradas de compra y traspasos internos
              </p>
            </div>
          </div>
        </div>

        {/* Operation Mode Tabs (Fiori Horizon Segmented Control) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setOperationMode('A01_RECEIPT')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              operationMode === 'A01_RECEIPT'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A01 Entrada de Mercancías (Mov. 101)
          </button>
          <button
            onClick={() => setOperationMode('A08_TRANSFER')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              operationMode === 'A08_TRANSFER'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A08 Traspaso de Almacén (Mov. 311)
          </button>
        </div>
      </div>

      {/* OPERATION A01: GOODS RECEIPT FOR PURCHASE ORDER (101) */}
      {operationMode === 'A01_RECEIPT' && (
        <div className="space-y-5">
          {/* Header Data Section */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Datos de Cabecera del Movimiento
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-mono font-bold border border-emerald-200">
                Clase de Movimiento: 101 (Entrada para Pedido)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Pedido de Compra de Referencia (PO)
                </label>
                <select
                  value={selectedPOId}
                  onChange={e => setSelectedPOId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono font-bold"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.id} — {po.vendorName} ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  N° Remito / Guía de Transporte
                </label>
                <input
                  type="text"
                  value={remitoNumber}
                  onChange={e => setRemitoNumber(e.target.value)}
                  placeholder="Ej: REM-0001-99231"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Centro Receptor
                </label>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                  {selectedPO?.plantId || '1010'} — Centro Central
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Proveedor
                </label>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 truncate">
                  {selectedPO?.vendorName || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                Posiciones a Recepcionar en Muelle de Descarga
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {itemsToReceive.length} posiciones en pedido
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 select-none">
                    <th className="py-2.5 px-3 text-center font-mono">Pos.</th>
                    <th className="py-2.5 px-4">Material / SKU</th>
                    <th className="py-2.5 px-3 text-right font-mono">Cant. Pedida</th>
                    <th className="py-2.5 px-3 text-right font-mono">Ya Entregado</th>
                    <th className="py-2.5 px-3 text-right font-mono text-emerald-800">Cant. a Ingresar</th>
                    <th className="py-2.5 px-3 font-mono">Almacén Destino</th>
                    <th className="py-2.5 px-3 font-mono">Lote de Recepción</th>
                    <th className="py-2.5 px-4 text-center">Posición OK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO?.items.map((pItem, idx) => {
                    const mat = materials.find(m => m.id === pItem.materialId);
                    const lineState = itemsToReceive.find(i => i.itemNumber === pItem.itemNumber);

                    return (
                      <tr key={pItem.itemNumber} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {pItem.itemNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{mat?.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {pItem.materialId} • Tipo: {mat?.type}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-700">
                          {pItem.orderedQty} {mat?.unit}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-500">
                          {pItem.deliveredQty} {mat?.unit}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={pItem.orderedQty - pItem.deliveredQty}
                            value={lineState?.qty || 0}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setItemsToReceive(prev =>
                                prev.map(it => (it.itemNumber === pItem.itemNumber ? { ...it, qty: val } : it))
                              );
                            }}
                            className="w-24 text-right text-xs p-1.5 rounded border border-slate-300 font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600 bg-white"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={lineState?.storageLocationId || '0001'}
                            onChange={e => {
                              const val = e.target.value;
                              setItemsToReceive(prev =>
                                prev.map(it => (it.itemNumber === pItem.itemNumber ? { ...it, storageLocationId: val } : it))
                              );
                            }}
                            className="text-xs p-1.5 rounded border border-slate-300 bg-white font-mono"
                          >
                            <option value="0001">0001 - Almacén General</option>
                            <option value="0002">0002 - Control Calidad</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={lineState?.batch || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setItemsToReceive(prev =>
                                prev.map(it => (it.itemNumber === pItem.itemNumber ? { ...it, batch: val } : it))
                              );
                            }}
                            className="w-28 text-xs p-1.5 rounded border border-slate-300 font-mono uppercase bg-white"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={lineState?.isChecked || false}
                            onChange={e => {
                              const checked = e.target.checked;
                              setItemsToReceive(prev =>
                                prev.map(it => (it.itemNumber === pItem.itemNumber ? { ...it, isChecked: checked } : it))
                              );
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Al contabilizar, se incrementará el stock en el almacén seleccionado y se creará el documento de material 500000xxxx.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePostReceipt}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Contabilizar Entrada (Post)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPERATION A08: TRANSFER POSTING (311) */}
      {operationMode === 'A08_TRANSFER' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Traspaso de Almacén a Almacén en 1 Paso
            </h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-bold border border-blue-200">
              Clase de Movimiento: 311 (Traslado Centro Único)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Material a Trasladar
              </label>
              <select
                value={transferMaterialId}
                onChange={e => setTransferMaterialId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Lote de Origen
              </label>
              <input
                type="text"
                value={transferBatch}
                onChange={e => setTransferBatch(e.target.value)}
                placeholder="LOT-2026-B1"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Cantidad a Trasladar
              </label>
              <input
                type="number"
                min="1"
                value={transferQty}
                onChange={e => setTransferQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Almacén Emisor (Origen)
              </label>
              <select
                value={transferFromLoc}
                onChange={e => setTransferFromLoc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-mono"
              >
                <option value="0001">0001 - Almacén General (Libre)</option>
                <option value="0002">0002 - Control Calidad</option>
                <option value="0003">0003 - Expedición & Despacho</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Almacén Receptor (Destino)
              </label>
              <select
                value={transferToLoc}
                onChange={e => setTransferToLoc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-mono"
              >
                <option value="0002">0002 - Control Calidad / Cuarentena</option>
                <option value="0001">0001 - Almacén General</option>
                <option value="0003">0003 - Expedición & Despacho</option>
                <option value="0004">0004 - Averías y Bloqueados</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePostTransfer}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Contabilizar Traspaso (311)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log: Material Documents Created in Session */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Documentos de Material Contabilizados (Historial de Transacciones)
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {materialDocuments.length} documentos emitidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4 font-mono">N° Documento</th>
                <th className="py-2.5 px-3 font-mono">Fecha</th>
                <th className="py-2.5 px-3 font-mono">Clase Mov.</th>
                <th className="py-2.5 px-4">Descripción Movimiento</th>
                <th className="py-2.5 px-3 font-mono">Posiciones</th>
                <th className="py-2.5 px-4 font-mono">Usuario SAP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialDocuments.length > 0 ? (
                materialDocuments.map(doc => (
                  <tr key={doc.docNumber} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">
                      {doc.docNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {doc.postingDate}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {doc.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {doc.movementDescription}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {doc.items.length} ítem(s)
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {doc.createdBy}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Aún no se han contabilizado movimientos en esta sesión. Contabiliza una entrada o traspaso arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
