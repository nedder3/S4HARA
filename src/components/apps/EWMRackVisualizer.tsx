import React, { useState } from 'react';
import { useSAP } from '../../context/SAPContext';
import {
  Grid3X3,
  Boxes,
  Weight,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StorageBin } from '../../types/sap';

export const EWMRackVisualizer: React.FC = () => {
  const { storageBins, materials, setActiveApp } = useSAP();
  const [selectedBinId, setSelectedBinId] = useState<string>(storageBins[0]?.id || 'A-01-01');
  const [activeAisle, setActiveAisle] = useState<string>('ALL');

  const selectedBin = storageBins.find(b => b.id === selectedBinId);
  const selectedMaterial = materials.find(m => m.id === selectedBin?.materialId);

  const filteredBins = storageBins.filter(b => activeAisle === 'ALL' || b.aisle === activeAisle);

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-5 animate-in fade-in-50 duration-200">
      {/* Title & App Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Grid3X3 className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Visor de Ubicaciones en Almacén (Storage Bins & Racks)
                </h2>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-xs font-bold">
                  SAP EWM LITE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Supervisión espacial 2D de estanterías industriales, pasillos de picking y control de sobrecarga por posición
              </p>
            </div>
          </div>
        </div>

        {/* Aisle Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveAisle('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeAisle === 'ALL' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos los Pasillos
          </button>
          <button
            onClick={() => setActiveAisle('A')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeAisle === 'A' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pasillo A (Pallets)
          </button>
          <button
            onClick={() => setActiveAisle('B')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeAisle === 'B' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pasillo B (Repuestos)
          </button>
          <button
            onClick={() => setActiveAisle('C')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeAisle === 'C' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pasillo C (Especiales)
          </button>
        </div>
      </div>

      {/* Grid Layout: Visual Racks + Bin Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rack Visual Map (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Matriz de Ubicaciones Físicas (Nivel vs Rack)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Centro 1010 • Almacén 0001
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredBins.map(bin => {
              const isSelected = bin.id === selectedBinId;
              const isOccupied = bin.quantity > 0;
              const loadPercent = Math.round((bin.currentWeightKg / bin.maxWeightKg) * 100);
              const binMat = materials.find(m => m.id === bin.materialId);

              return (
                <div
                  key={bin.id}
                  onClick={() => setSelectedBinId(bin.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-400 shadow-sm'
                      : 'border-slate-200 hover:border-purple-300 bg-slate-50/40 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        {bin.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        Nivel {bin.level}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 truncate">
                      {isOccupied ? binMat?.name : 'Posición Vacía'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {isOccupied ? `${bin.quantity} ${binMat?.unit} • ${bin.batch}` : 'Disponible para asignación'}
                    </div>
                  </div>

                  {/* Weight Capacity Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Carga: {bin.currentWeightKg} kg</span>
                      <span className="font-bold">{loadPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          loadPercent > 80
                            ? 'bg-rose-500'
                            : loadPercent > 40
                            ? 'bg-purple-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bin Inspector Card (1 col) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" />
                Ficha Técnica de la Ubicación
              </h3>
              <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {selectedBin?.id}
              </span>
            </div>

            {selectedBin ? (
              <div className="mt-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block">Zona Logística</span>
                  <span className="text-slate-800 font-semibold">{selectedBin.zone}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Pasillo</span>
                    <span className="font-bold text-slate-800">{selectedBin.aisle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Estantería (Rack)</span>
                    <span className="font-bold text-slate-800">#{selectedBin.rack}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Nivel de Altura</span>
                    <span className="font-bold text-slate-800">{selectedBin.level}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Capacidad Máx</span>
                    <span className="font-bold text-slate-800">{selectedBin.maxWeightKg} kg</span>
                  </div>
                </div>

                {selectedBin.quantity > 0 && selectedMaterial ? (
                  <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200 space-y-2">
                    <span className="text-[11px] font-bold text-purple-900 uppercase block">
                      Material Almacenado
                    </span>
                    <div className="font-semibold text-slate-900">{selectedMaterial.name}</div>
                    <div className="text-[11px] font-mono text-slate-600 flex flex-wrap gap-2">
                      <span>SKU: {selectedMaterial.id}</span>
                      <span>•</span>
                      <span>Lote: {selectedBin.batch}</span>
                      <span>•</span>
                      <span>Saldo: {selectedBin.quantity} {selectedMaterial.unit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 border text-center text-slate-400">
                    Esta posición no tiene inventario asignado actualmente.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveApp('MMBE')}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Verificar en Resumen de Stock (MMBE)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
