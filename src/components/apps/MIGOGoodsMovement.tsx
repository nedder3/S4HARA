import React, { useState, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  ArrowDownToLine,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  Boxes,
  ShieldAlert,
  RotateCcw,
  ClipboardCheck
} from 'lucide-react';

type MigoTab = 'A01_101' | 'A08_311' | 'BLOCK_344' | 'RETURN_651';

export const MIGOGoodsMovement: React.FC = () => {
  const {
    purchaseOrders,
    materials,
    stocks,
    returnOrders,
    materialDocuments,
    postGoodsReceiptPO,
    postStockTransfer,
    postBlockStock,
    postCustomerReturn,
    resolveReturnInspection
  } = useSAP();

  const [activeTab, setActiveTab] = useState<MigoTab>('A01_101');

  // A01 (101) State
  const [selectedPOId, setSelectedPOId] = useState<string>(purchaseOrders[1]?.id || purchaseOrders[0]?.id || '');
  const [remitoNumber, setRemitoNumber] = useState('REM-0004-98120');
  const [itemsToReceive, setItemsToReceive] = useState<
    { itemNumber: number; materialId: string; qty: number; storageLocationId: string; batch: string; isChecked: boolean }[]
  >([]);

  // A08 (311) State
  const [transferMaterialId, setTransferMaterialId] = useState<string>('MAT-2040');
  const [transferBatch, setTransferBatch] = useState<string>('LOT-2026-F1');
  const [transferQty, setTransferQty] = useState<number>(20);
  const [transferFromLoc, setTransferFromLoc] = useState<string>('0001');
  const [transferToLoc, setTransferToLoc] = useState<string>('0002');

  // Block (344) State — Preloaded for TecnoSur Flood Case (17 u. MAT-A100)
  const [blockMaterialId, setBlockMaterialId] = useState<string>('MAT-A100');
  const [blockBatch, setBlockBatch] = useState<string>('LOT-TS-A1');
  const [blockQty, setBlockQty] = useState<number>(17);
  const [blockReason, setBlockReason] = useState<string>('Inundación Centro 1010 — Bloqueo preventivo auditoría TecnoSur');

  // Return Inspection (651) State
  const [recoveredInput, setRecoveredInput] = useState<number>(2);

  const selectedPO = purchaseOrders.find(p => p.id === selectedPOId);

  useEffect(() => {
    if (selectedPO) {
      setItemsToReceive(
        selectedPO.items.map(it => {
          const remaining = Math.max(0, it.orderedQty - it.deliveredQty);
          return {
            itemNumber: it.itemNumber,
            materialId: it.materialId,
            qty: remaining,
            storageLocationId: it.storageLocationId || '0001',
            batch: it.materialId === 'MAT-A100' ? 'LOT-TS-A1' : it.materialId === 'MAT-C300' ? 'LOT-TS-C1' : 'LOT-2026-' + Math.floor(100 + Math.random() * 899),
            isChecked: remaining > 0
          };
        })
      );
    }
  }, [selectedPOId, purchaseOrders]);

  const handlePostReceipt = () => {
    if (!selectedPO) return;
    const validItems = itemsToReceive.filter(i => i.isChecked && i.qty > 0);
    if (validItems.length === 0) {
      alert('Marca al menos una posición con "Posición OK" y cantidad mayor a cero.');
      return;
    }
    postGoodsReceiptPO(selectedPO.id, validItems);
  };

  const availableBatchesForBlock = stocks.filter(
    s => s.materialId === blockMaterialId && s.storageLocationId === '0001'
  );

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Title & Segmented Control */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eaf7ee] text-[#107e3e] flex items-center justify-center">
            <ArrowDownToLine className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Movimientos de Mercancías & Logística Inversa
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#eaf7ee] text-[#107e3e] border border-[#bce3c9] font-mono text-xs font-bold">
                MIGO
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Transacción unificada SAP MM para entradas (101), traspasos (311), bloqueos preventivos (344) y devoluciones (651)
            </p>
          </div>
        </div>

        {/* 4 Movement Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f5f6f7] rounded-lg border border-[#d9e1e8]">
          {[
            { id: 'A01_101' as MigoTab, label: 'A01 Entrada (101)' },
            { id: 'A08_311' as MigoTab, label: 'A08 Traspaso (311)' },
            { id: 'BLOCK_344' as MigoTab, label: 'Mov. 344 Bloqueo' },
            { id: 'RETURN_651' as MigoTab, label: 'Mov. 651 Devolución' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a6ed1] shadow-xs border border-[#d9e1e8]'
                  : 'text-[#5b738b] hover:text-[#1d2d3e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: A01 GOODS RECEIPT (101) */}
      {activeTab === 'A01_101' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#edf2f7]">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#107e3e]" />
                Datos de Cabecera — Entrada contra Pedido de Compra
              </h3>
              <span className="px-2 py-0.5 bg-[#eaf7ee] text-[#107e3e] rounded text-xs font-mono font-bold border border-[#bce3c9]">
                Mov. 101 · Referencia R01 Pedido
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
                  Pedido de Compra (PO)
                </label>
                <select
                  value={selectedPOId}
                  onChange={e => setSelectedPOId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1] font-mono font-bold"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.id} — {po.vendorName} ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
                  N° Remito Proveedor
                </label>
                <input
                  type="text"
                  value={remitoNumber}
                  onChange={e => setRemitoNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
                  Centro Receptor
                </label>
                <div className="p-2.5 rounded-lg bg-[#f5f6f7] border border-[#d9e1e8] text-xs font-mono text-[#1d2d3e]">
                  {selectedPO?.plantId || '1010'} — Centro Regional
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d9e1e8] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#107e3e]" />
                Posiciones a Recepcionar
              </h3>
              <span className="text-xs text-[#5b738b] font-mono tabular-nums">
                {itemsToReceive.length} posiciones
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f5f6f7]/60 text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                    <th className="py-2.5 px-3 text-center font-mono">Pos.</th>
                    <th className="py-2.5 px-4">Material / SKU</th>
                    <th className="py-2.5 px-3 text-right font-mono">Pedido</th>
                    <th className="py-2.5 px-3 text-right font-mono">Entregado</th>
                    <th className="py-2.5 px-3 text-right font-mono text-[#107e3e]">A Ingresar</th>
                    <th className="py-2.5 px-3 font-mono">Almacén</th>
                    <th className="py-2.5 px-3 font-mono">Lote</th>
                    <th className="py-2.5 px-4 text-center">Pos. OK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f7]">
                  {selectedPO?.items.map(pItem => {
                    const mat = materials.find(m => m.id === pItem.materialId);
                    const lineState = itemsToReceive.find(i => i.itemNumber === pItem.itemNumber);

                    return (
                      <tr key={pItem.itemNumber} className="hover:bg-[#f0f4f9]/40">
                        <td className="py-3 px-3 text-center font-mono text-[#5b738b]">{pItem.itemNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1d2d3e]">{mat?.name}</div>
                          <div className="text-[11px] font-mono text-[#5b738b]">{pItem.materialId}</div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-mono">{pItem.orderedQty} {mat?.unit}</td>
                        <td className="py-3 px-3 text-right tabular-nums font-mono text-[#5b738b]">{pItem.deliveredQty} {mat?.unit}</td>
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
                            className="w-20 text-right text-xs p-1.5 rounded border border-[#d9e1e8] font-mono font-bold text-[#107e3e] bg-white"
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
                            className="text-xs p-1.5 rounded border border-[#d9e1e8] bg-white font-mono"
                          >
                            <option value="0001">0001 - General</option>
                            <option value="0002">0002 - Calidad</option>
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
                            className="w-28 text-xs p-1.5 rounded border border-[#d9e1e8] font-mono uppercase bg-white"
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
                            className="w-4 h-4 accent-[#0a6ed1] cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#f5f6f7] border-t border-[#d9e1e8] flex items-center justify-between gap-3">
              <span className="text-xs text-[#5b738b]">
                Emite Documento de Material 500000xxxx e incrementa stock en Libre Utilización.
              </span>
              <button
                onClick={handlePostReceipt}
                className="px-5 py-2 rounded-lg bg-[#107e3e] hover:bg-[#0c6330] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Contabilizar Entrada (101)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: A08 TRANSFER POSTING (311) */}
      {activeTab === 'A08_311' && (
        <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#edf2f7]">
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#0a6ed1]" />
              Traspaso de Almacén a Almacén en 1 Paso (Centro 1010)
            </h3>
            <span className="px-2 py-0.5 bg-[#f0f4f9] text-[#0a6ed1] rounded text-xs font-mono font-bold border border-[#c2dcf7]">
              Mov. 311
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Material</label>
              <select
                value={transferMaterialId}
                onChange={e => setTransferMaterialId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Lote</label>
              <input
                type="text"
                value={transferBatch}
                onChange={e => setTransferBatch(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={transferQty}
                onChange={e => setTransferQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Almacén Origen</label>
              <select
                value={transferFromLoc}
                onChange={e => setTransferFromLoc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                <option value="0001">0001 - Almacén General</option>
                <option value="0002">0002 - Control Calidad</option>
                <option value="0003">0003 - Expedición</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Almacén Destino</label>
              <select
                value={transferToLoc}
                onChange={e => setTransferToLoc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                <option value="0002">0002 - Control Calidad / Cuarentena</option>
                <option value="0001">0001 - Almacén General</option>
                <option value="0003">0003 - Expedición</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => postStockTransfer(transferMaterialId, transferBatch, transferQty, transferFromLoc, transferToLoc, '1010')}
                className="w-full py-2.5 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Contabilizar Traspaso (311)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOV 344 BLOCK STOCK (CASO TECNOSUR FLOOD) */}
      {activeTab === 'BLOCK_344' && (
        <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#edf2f7]">
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#bb0000]" />
              Traspaso de Libre Utilización a Stock Bloqueado (Contingencias / Siniestros)
            </h3>
            <span className="px-2 py-0.5 bg-[#fde8e8] text-[#bb0000] rounded text-xs font-mono font-bold border border-[#f5c2c2]">
              Mov. 344 · Caso TecnoSur
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#fef3e6] border border-[#f5cfa3] text-xs text-[#7a3c04]">
            <strong>Protocolo Operativo TecnoSur:</strong> Ante inundación o daño en depósito, bloquea preventivamente las unidades afectadas (ej. 17 u. de MAT-A100, 14 u. de MAT-B200 o 39 u. de MAT-C300) con Mov. 344 para impedir que sean comprometidas con pedidos de clientes hasta nueva inspección ($1.250/u.).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Material Afectado</label>
              <select
                value={blockMaterialId}
                onChange={e => {
                  const matId = e.target.value;
                  setBlockMaterialId(matId);
                  const found = stocks.find(s => s.materialId === matId && s.storageLocationId === '0001');
                  if (found) setBlockBatch(found.batch);
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Lote en Almacén 0001</label>
              <select
                value={blockBatch}
                onChange={e => setBlockBatch(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] font-mono"
              >
                {availableBatchesForBlock.map(s => (
                  <option key={s.id} value={s.batch}>
                    {s.batch} (Disp: {s.unrestricted})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Cantidad a Bloquear</label>
              <input
                type="number"
                min="1"
                value={blockQty}
                onChange={e => setBlockQty(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white font-mono font-bold text-[#bb0000]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">Motivo / Auditoría</label>
              <input
                type="text"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => postBlockStock(blockMaterialId, blockBatch, blockQty, '0001', '1010', blockReason)}
              className="px-5 py-2.5 rounded-lg bg-[#bb0000] hover:bg-[#990000] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Contabilizar Bloqueo Preventivo (Mov. 344)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MOV 651 REVERSE LOGISTICS / CUSTOMER RETURNS (METALÚRGICA DEL SUR) */}
      {activeTab === 'RETURN_651' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2f7]">
              <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#e9730c]" />
                Logística Inversa — Recepción (Mov. 651) e Inspección de Devoluciones
              </h3>
              <span className="px-2 py-0.5 bg-[#fef3e6] text-[#9a4d06] rounded text-xs font-mono font-bold border border-[#f5cfa3]">
                Mov. 651 · Almacén 0004 Bloqueado
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#fde8e8]/70 border border-[#f5c2c2] text-xs text-[#7f1d1d]">
              <strong>Regla de Oro (UTN Procesos Logísticos IV):</strong> Una devolución de cliente <strong>nunca</strong> debe reincorporarse automáticamente al stock disponible (Libre Utilización). Primero ingresa a Stock Bloqueado de Devoluciones (Mov. 651), se inspecciona físicamente y luego se define qué unidades se recuperan/reacondicionan y cuáles van a reparación o disposición final.
            </div>

            <div className="space-y-3">
              {returnOrders.map(ret => {
                const mat = materials.find(m => m.id === ret.materialId);
                const isReceived = Boolean(ret.materialDocRef);
                const isClosed = ret.disposition !== 'PENDIENTE_INSPECCION';

                return (
                  <div key={ret.id} className="p-4 rounded-xl border border-[#d9e1e8] bg-[#f5f6f7]/60 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#1d2d3e]">{ret.id}</span>
                          <span className="text-xs text-[#5b738b]">(Ref. {ret.salesOrderRef})</span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              isClosed
                                ? 'bg-[#eaf7ee] text-[#107e3e]'
                                : isReceived
                                ? 'bg-[#fef3e6] text-[#9a4d06]'
                                : 'bg-[#fde8e8] text-[#bb0000]'
                            }`}
                          >
                            {isClosed ? `CERRADA (${ret.disposition})` : isReceived ? 'EN INSPECCIÓN (0004)' : 'PENDIENTE RECEPCIÓN 651'}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#1d2d3e] mt-1">
                          {ret.customerName} — {ret.quantity} u. de {mat?.name} ({ret.materialId})
                        </div>
                        <div className="text-xs text-[#5b738b] mt-0.5">
                          Hallazgo: {ret.reason}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {!isReceived && (
                          <button
                            onClick={() => postCustomerReturn(ret.id)}
                            className="px-4 py-2 rounded-lg bg-[#e9730c] hover:bg-[#c76109] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>1. Ingresar a Bloqueado (Mov. 651)</span>
                          </button>
                        )}

                        {isReceived && !isClosed && (
                          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#d9e1e8]">
                            <label className="text-[11px] font-semibold text-[#5b738b]">Recuperables:</label>
                            <input
                              type="number"
                              min="0"
                              max={ret.quantity}
                              value={recoveredInput}
                              onChange={e => setRecoveredInput(Math.min(ret.quantity, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-14 text-center text-xs p-1 rounded border border-[#d9e1e8] font-mono font-bold"
                            />
                            <button
                              onClick={() => resolveReturnInspection(ret.id, recoveredInput, 'REACONDICIONAR')}
                              className="px-3.5 py-1.5 rounded-md bg-[#107e3e] hover:bg-[#0c6330] text-white text-xs font-bold flex items-center gap-1"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>2. Clasificar y Recuperar ({recoveredInput} u.)</span>
                            </button>
                          </div>
                        )}

                        {isClosed && (
                          <div className="text-xs font-mono text-[#107e3e] font-bold">
                            Recuperadas: {ret.recoveredQty}/{ret.quantity} u. ({Math.round((ret.recoveredQty / ret.quantity) * 100)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Material Documents Log */}
      <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d9e1e8] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#5b738b]" />
            Documentos de Material Emitidos en Sesión
          </h3>
          <span className="text-xs font-mono text-[#5b738b] tabular-nums">{materialDocuments.length} docs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f6f7]/60 text-[#5b738b] font-semibold border-b border-[#d9e1e8]">
                <th className="py-2.5 px-4 font-mono">N° Documento</th>
                <th className="py-2.5 px-3 font-mono">Fecha</th>
                <th className="py-2.5 px-3 font-mono">Mov.</th>
                <th className="py-2.5 px-4">Descripción / Texto Cabecera</th>
                <th className="py-2.5 px-3 font-mono">Ítems</th>
                <th className="py-2.5 px-4 font-mono">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7]">
              {materialDocuments.length > 0 ? (
                materialDocuments.map(doc => (
                  <tr key={doc.docNumber} className="hover:bg-[#f0f4f9]/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#0a6ed1] tabular-nums">{doc.docNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-[#5b738b] tabular-nums">{doc.postingDate}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8]">{doc.movementType}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-[#1d2d3e]">{doc.movementDescription}</div>
                      <div className="text-[11px] text-[#5b738b]">{doc.headerText}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">{doc.items.length}</td>
                    <td className="py-2.5 px-4 font-mono text-[#5b738b]">{doc.createdBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#5b738b]">
                    Sin documentos contabilizados aún. Ejecuta una entrada (101), traspaso (311), bloqueo (344) o devolución (651).
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
