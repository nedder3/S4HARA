import React, { useState, useEffect } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Boxes,
  Search,
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle2,
  Layers,
  BarChart3
} from 'lucide-react';

export const MMBEStockOverview: React.FC = () => {
  const {
    stocks,
    materials,
    plants,
    storageLocations,
    setActiveApp,
    completeCaseStep
  } = useSAP();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('1010');
  const [selectedStorageLoc, setSelectedStorageLoc] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Check if TecnoSur step 1 (blocking 17 u. of MAT-A100) was done -> visiting MMBE completes step 2
  useEffect(() => {
    const matAStock = stocks.find(s => s.materialId === 'MAT-A100' && s.storageLocationId === '0001');
    if (matAStock && matAStock.blocked >= 17) {
      completeCaseStep('CASE-TECNOSUR', 2);
    }
  }, [stocks]);

  const filteredStocks = stocks.filter(s => {
    if (selectedPlantId !== 'ALL' && s.plantId !== selectedPlantId) return false;
    if (selectedStorageLoc !== 'ALL' && s.storageLocationId !== selectedStorageLoc) return false;
    if (selectedMaterialId !== 'ALL' && s.materialId !== selectedMaterialId) return false;
    if (searchFilter) {
      const mat = materials.find(m => m.id === s.materialId);
      const q = searchFilter.toLowerCase();
      return (
        mat?.name.toLowerCase().includes(q) ||
        s.materialId.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#d9e1e8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0a6ed1] flex items-center justify-center">
            <Boxes className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d2d3e] tracking-tight">
                Resumen de Stocks (Stock Overview)
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#f0f4f9] text-[#0a6ed1] border border-[#c2dcf7] font-mono text-xs font-bold">
                MMBE
              </span>
            </div>
            <p className="text-xs text-[#5b738b]">
              Jerarquía organizativa: Mandante 100 · Centro 1010 · Almacenes (0001–0004) · Lotes · Clasificación ABC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveApp('MC40')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#f0f4f9] text-[#1d2d3e] border border-[#d9e1e8] text-xs font-semibold transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-[#0a6ed1]" strokeWidth={1.8} />
            <span>Análisis ABC (MC40)</span>
          </button>
          <button
            onClick={() => setActiveApp('MIGO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4" strokeWidth={2} />
            <span>Ir a MIGO</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#d9e1e8] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
            Material / SKU
          </label>
          <select
            value={selectedMaterialId}
            onChange={e => setSelectedMaterialId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1] font-mono"
          >
            <option value="ALL">-- Todos los Materiales --</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
            Centro / Planta
          </label>
          <select
            value={selectedPlantId}
            onChange={e => setSelectedPlantId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1] font-mono"
          >
            <option value="ALL">-- Todos los Centros --</option>
            {plants.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
            Almacén
          </label>
          <select
            value={selectedStorageLoc}
            onChange={e => setSelectedStorageLoc(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1] font-mono"
          >
            <option value="ALL">-- Todos los Almacenes --</option>
            {storageLocations
              .filter(l => selectedPlantId === 'ALL' || l.plantId === selectedPlantId)
              .map((loc, idx) => (
                <option key={`${loc.plantId}-${loc.id}-${idx}`} value={loc.id}>
                  {loc.id} — {loc.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider mb-1">
            Búsqueda Rápida
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5b738b] pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Lote, SKU o descripción..."
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-[#d9e1e8] bg-[#f5f6f7] focus:bg-white focus:outline-none focus:border-[#0a6ed1]"
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-[#d9e1e8] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#f5f6f7] border-b border-[#d9e1e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5b738b]" strokeWidth={1.8} />
            <h3 className="text-xs font-bold text-[#1d2d3e] uppercase tracking-wider">
              Saldos de Inventario por Estado Contable
            </h3>
          </div>
          <span className="text-xs font-mono text-[#5b738b] tabular-nums">
            {filteredStocks.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f6f7]/60 text-[#5b738b] font-semibold border-b border-[#d9e1e8] select-none">
                <th className="py-2.5 px-4">Material / Descripción</th>
                <th className="py-2.5 px-2 text-center font-mono">ABC</th>
                <th className="py-2.5 px-3 font-mono">Centro</th>
                <th className="py-2.5 px-3 font-mono">Almacén</th>
                <th className="py-2.5 px-3 font-mono">Lote</th>
                <th className="py-2.5 px-3 text-right text-[#107e3e]">Libre Utilización</th>
                <th className="py-2.5 px-3 text-right text-[#e9730c]">Ctrl. Calidad</th>
                <th className="py-2.5 px-3 text-right text-[#bb0000]">Bloqueado</th>
                <th className="py-2.5 px-3 text-right text-[#0a6ed1]">Reservado</th>
                <th className="py-2.5 px-4 text-right text-[#1d2d3e]">Total Físico</th>
                <th className="py-2.5 px-4 text-center">Cobertura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7]">
              {filteredStocks.length > 0 ? (
                filteredStocks.map(stock => {
                  const mat = materials.find(m => m.id === stock.materialId);
                  const loc = storageLocations.find(l => l.plantId === stock.plantId && l.id === stock.storageLocationId);
                  const totalUnits = stock.unrestricted + stock.qualityInspection + stock.blocked;
                  const isUnderSafety = mat ? stock.unrestricted < mat.safetyStock && stock.storageLocationId === '0001' : false;

                  const abcColors =
                    mat?.abcClass === 'A'
                      ? 'bg-[#fde8e8] text-[#bb0000] border-[#f5c2c2]'
                      : mat?.abcClass === 'B'
                      ? 'bg-[#fef3e6] text-[#9a4d06] border-[#f5cfa3]'
                      : 'bg-[#f5f6f7] text-[#5b738b] border-[#d9e1e8]';

                  return (
                    <tr key={stock.id} className="hover:bg-[#f0f4f9]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1d2d3e]">{mat?.name || stock.materialId}</div>
                        <div className="text-[11px] font-mono text-[#5b738b] flex items-center gap-1.5 mt-0.5">
                          <span>{stock.materialId}</span>
                          <span>·</span>
                          <span>{mat?.type}</span>
                          <span>·</span>
                          <span>SS: {mat?.safetyStock} {mat?.unit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold ${abcColors}`}>
                          {mat?.abcClass || 'C'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#1d2d3e]">{stock.plantId}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#1d2d3e]">{stock.storageLocationId}</span>
                        <div className="text-[10px] text-[#5b738b] truncate max-w-[140px]">{loc?.name}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-[#f5f6f7] border border-[#d9e1e8] text-[11px] text-[#1d2d3e]">
                          {stock.batch}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-[#107e3e] bg-[#eaf7ee]/40">
                        {stock.unrestricted.toLocaleString('es-AR')} {mat?.unit}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-[#e9730c]">
                        {stock.qualityInspection > 0 ? (
                          <span className="font-bold px-1.5 py-0.5 rounded bg-[#fef3e6]">
                            {stock.qualityInspection} {mat?.unit}
                          </span>
                        ) : (
                          <span className="text-[#cbd5e1]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-[#bb0000]">
                        {stock.blocked > 0 ? (
                          <span className="font-bold px-1.5 py-0.5 rounded bg-[#fde8e8]">
                            {stock.blocked} {mat?.unit}
                          </span>
                        ) : (
                          <span className="text-[#cbd5e1]">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-[#0a6ed1]">
                        {stock.reserved > 0 ? `${stock.reserved} ${mat?.unit}` : <span className="text-[#cbd5e1]">0</span>}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-mono font-bold text-[#1d2d3e] bg-[#f5f6f7]/50">
                        {totalUnits.toLocaleString('es-AR')} {mat?.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {stock.storageLocationId === '0004' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fde8e8] text-[#bb0000] border border-[#f5c2c2]">
                            <AlertTriangle className="w-3 h-3" />
                            Log. Inversa
                          </span>
                        ) : isUnderSafety ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fde8e8] text-[#bb0000] border border-[#f5c2c2]">
                            <AlertTriangle className="w-3 h-3" />
                            Bajo Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eaf7ee] text-[#107e3e] border border-[#bce3c9]">
                            <CheckCircle2 className="w-3 h-3" />
                            Disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-[#5b738b]">
                    No se encontraron registros de stock con los filtros actuales.
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
