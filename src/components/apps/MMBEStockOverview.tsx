import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Boxes,
  Building2,
  Filter,
  Search,
  ArrowRightLeft,
  ArrowDownToLine,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';

export const MMBEStockOverview: React.FC = () => {
  const {
    stocks,
    materials,
    plants,
    storageLocations,
    setActiveApp,
    activeCaseStudyId,
    completeCaseStep
  } = useSAP();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('1010');
  const [selectedStorageLoc, setSelectedStorageLoc] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter stocks
  const filteredStocks = stocks.filter(s => {
    if (selectedPlantId !== 'ALL' && s.plantId !== selectedPlantId) return false;
    if (selectedStorageLoc !== 'ALL' && s.storageLocationId !== selectedStorageLoc) return false;
    if (selectedMaterialId !== 'ALL' && s.materialId !== selectedMaterialId) return false;
    if (searchFilter) {
      const mat = materials.find(m => m.id === s.materialId);
      const matchName = mat?.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchId = s.materialId.toLowerCase().includes(searchFilter.toLowerCase());
      const matchBatch = s.batch.toLowerCase().includes(searchFilter.toLowerCase());
      return matchName || matchId || matchBatch;
    }
    return true;
  });

  // Track case study step completion
  React.useEffect(() => {
    if (activeCaseStudyId === 'CASE-01') {
      completeCaseStep('CASE-01', 4);
    } else if (activeCaseStudyId === 'CASE-02') {
      completeCaseStep('CASE-02', 3);
    }
  }, [activeCaseStudyId]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5 animate-in fade-in-50 duration-200">
      {/* Title & App Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a6ed1] flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Resumen de Stocks (Stock Overview)
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                  MMBE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualización en tiempo real del inventario por Centro, Almacén y Lote con desagregación de estados contables
              </p>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveApp('MIGO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0a6ed1] hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <ArrowDownToLine className="w-4 h-4" strokeWidth={2} />
            <span>MIGO (Entrada / Traspaso)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Gestalt & Hick-Hyman Law) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Material Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Material / SKU
          </label>
          <select
            value={selectedMaterialId}
            onChange={e => setSelectedMaterialId(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">-- Todos los Materiales --</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Plant Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Centro / Planta
          </label>
          <select
            value={selectedPlantId}
            onChange={e => setSelectedPlantId(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">-- Todos los Centros --</option>
            {plants.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Storage Location Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Almacén
          </label>
          <select
            value={selectedStorageLoc}
            onChange={e => setSelectedStorageLoc(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
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

        {/* Quick Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
            Filtro de Texto Rápido
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Buscar por lote, descripción..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stock Hierarchy Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" strokeWidth={1.8} />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Niveles Organizativos y Saldos de Inventario
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredStocks.length} registros encontrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 select-none">
                <th className="py-2.5 px-4 font-semibold">Material / Descripción</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Centro</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Almacén</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Lote</th>
                <th className="py-2.5 px-3 text-right font-semibold text-emerald-800">Libre Utilización</th>
                <th className="py-2.5 px-3 text-right font-semibold text-amber-800">Ctrl. Calidad</th>
                <th className="py-2.5 px-3 text-right font-semibold text-rose-800">Bloqueado</th>
                <th className="py-2.5 px-3 text-right font-semibold text-blue-800">Reservado</th>
                <th className="py-2.5 px-4 text-right font-semibold text-slate-800">Total Físico</th>
                <th className="py-2.5 px-4 text-center font-semibold">Estado Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.length > 0 ? (
                filteredStocks.map(stock => {
                  const mat = materials.find(m => m.id === stock.materialId);
                  const loc = storageLocations.find(l => l.plantId === stock.plantId && l.id === stock.storageLocationId);
                  const totalUnits = stock.unrestricted + stock.qualityInspection + stock.blocked;
                  const isUnderSafety = mat ? totalUnits < mat.safetyStock : false;

                  return (
                    <tr
                      key={stock.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Material info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                          {mat?.name || stock.materialId}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{stock.materialId}</span>
                          <span>•</span>
                          <span>Tipo: {mat?.type}</span>
                          <span>•</span>
                          <span>Unidad: {mat?.unit}</span>
                        </div>
                      </td>

                      {/* Plant */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {stock.plantId}
                      </td>

                      {/* Storage Loc */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-700">{stock.storageLocationId}</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {loc?.name || 'Almacén'}
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {stock.batch}
                        </span>
                      </td>

                      {/* Unrestricted */}
                      <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-emerald-700 bg-emerald-50/30">
                        {stock.unrestricted.toLocaleString()} {mat?.unit}
                      </td>

                      {/* Quality inspection */}
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-amber-700">
                        {stock.qualityInspection > 0 ? (
                          <span className="font-semibold px-1 py-0.5 rounded bg-amber-100/70">
                            {stock.qualityInspection} {mat?.unit}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Blocked */}
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-rose-700">
                        {stock.blocked > 0 ? (
                          <span className="font-semibold px-1 py-0.5 rounded bg-rose-100/70">
                            {stock.blocked} {mat?.unit}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Reserved */}
                      <td className="py-3 px-3 text-right tabular-nums font-mono text-blue-700">
                        {stock.reserved > 0 ? (
                          <span>{stock.reserved} {mat?.unit}</span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right tabular-nums font-mono font-bold text-slate-900 bg-slate-50/50">
                        {totalUnits.toLocaleString()} {mat?.unit}
                      </td>

                      {/* Stock Health */}
                      <td className="py-3 px-4 text-center">
                        {isUnderSafety ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Quiebre / Bajo Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Nivel Óptimo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No se encontraron registros de stock con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Callout (Jakob Nielsen H6 Recognition over Recall) */}
      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Boxes className="w-5 h-5 text-[#0a6ed1] shrink-0 mt-0.5" strokeWidth={1.8} />
        <div>
          <h4 className="font-bold text-blue-950">Guía para Entrevistas — Conceptos Clave en MMBE:</h4>
          <p className="mt-1 leading-relaxed text-blue-900/90">
            En SAP, el stock <strong>Libre Utilización</strong> es el único disponible para armar pedidos (picking) y ventas. El stock en <strong>Control de Calidad</strong> proviene habitualmente de recepciones de compra que exigen aprobación por muestreo antes de ser liberadas. El stock <strong>Bloqueado</strong> corresponde a mermas, productos dañados o reclamos a proveedor.
          </p>
        </div>
      </div>
    </div>
  );
};
