import React, { useState, useRef, useEffect } from 'react';
import { useSAP, AppView } from '../../context/SAPContext';
import {
  Search,
  Sparkles,
  RotateCcw,
  Home,
  ChevronRight,
  User,
  Building2,
  BookOpen
} from 'lucide-react';

export const FioriShellHeader: React.FC = () => {
  const {
    activeApp,
    setActiveApp,
    executeTCode,
    isJouleOpen,
    setIsJouleOpen,
    activeCaseStudyId,
    setActiveCaseStudyId,
    caseStudies,
    resetToDefaultData
  } = useSAP();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCase = caseStudies.find(c => c.id === activeCaseStudyId);

  const suggestions = [
    { tcode: 'MMBE', label: 'Resumen de Stock Multicentro & ABC', category: 'Gestión de Inventario (MM)', app: 'MMBE' as AppView },
    { tcode: 'MIGO', label: 'Movimientos (101, 311, 344 Bloqueo, 651 Devolución)', category: 'Gestión de Inventario & Log. Inversa', app: 'MIGO' as AppView },
    { tcode: 'MD04', label: 'Monitor MRP & Explosión BOM (CS03)', category: 'Planificación y Control (PP)', app: 'MD04' as AppView },
    { tcode: 'MC40', label: 'Análisis de Inventarios ABC / Pareto', category: 'Gestión de Abastecimiento (MM)', app: 'MC40' as AppView },
    { tcode: 'ME21N', label: 'Pedidos de Compra & Proveedores (P1/P2/P3)', category: 'Aprovisionamiento (MM)', app: 'ME21N' as AppView },
    { tcode: 'VL02N', label: 'Expedición, PGI (601) & Dimensionamiento Muelles', category: 'Expedición & Transporte (SD/EWM)', app: 'VL01N' as AppView },
    { tcode: 'CMI', label: 'Tablero Analítico CMI / OTIF & Devoluciones', category: 'Control de Gestión (Analytics)', app: 'CMI' as AppView },
    { tcode: 'EWM', label: 'Visor 2D de Racks & Ubicaciones (Bins)', category: 'Almacén Avanzado (EWM)', app: 'EWM_RACK' as AppView },
    { tcode: 'CASOS', label: 'Misiones UTN-to-SAP (TecnoSur, Metalúrgica del Sur)', category: 'Entrenamiento Profesional', app: 'CASES' as AppView }
  ];

  const filteredSuggestions = suggestions.filter(
    s =>
      s.tcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !searchInputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeTCode(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (app: AppView, tcode: string) => {
    setActiveApp(app);
    setSearchQuery(tcode);
    setShowSuggestions(false);
  };

  const appBreadcrumbs: Record<AppView, string> = {
    LAUNCHPAD: 'Launchpad',
    MMBE: 'Resumen de Stocks (MMBE)',
    MIGO: 'Movimientos de Mercancías & Logística Inversa (MIGO)',
    ME21N: 'Pedidos de Compra & Proveedores (ME21N)',
    VL01N: 'Expedición, Picking (PGI 601) & Muelles (VL02N)',
    MD04: 'Monitor MRP & Lista de Materiales BOM (MD04 / CS03)',
    MC40: 'Análisis de Inventarios ABC / Pareto (MC40)',
    CMI: 'Tablero de Control CMI & OTIF (Fiori Overview)',
    EWM_RACK: 'Mapa de Ubicaciones en Racks (EWM)',
    CASES: 'Misiones Prácticas UTN-to-SAP'
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-[#1d2d3e] shadow-xs select-none border-b border-[#d9e1e8]">
      {/* SAP Fiori Morning Horizon Primary Shell Bar */}
      <div className="max-w-[1700px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand & System Environment */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveApp('LAUNCHPAD')}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#0a6ed1] rounded-lg p-1"
            title="Ir al Launchpad Principal"
          >
            <div className="w-9 h-8 rounded-md bg-gradient-to-br from-[#0a6ed1] to-[#0854a0] flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-xs">
              SAP
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm leading-tight tracking-tight text-[#1d2d3e] flex items-center gap-1.5">
                S/4HANA <span className="text-xs font-medium text-[#0a6ed1]">Logistics Cloud</span>
              </span>
              <span className="text-[10px] text-[#5b738b] font-mono tracking-wide">
                S4P (100) · UTN FRBB Edition
              </span>
            </div>
          </button>

          {/* Plant indicator pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f5f6f7] text-xs text-[#1d2d3e] border border-[#d9e1e8]">
            <Building2 className="w-3.5 h-3.5 text-[#0a6ed1]" strokeWidth={1.8} />
            <span className="font-mono font-semibold">Centro 1010</span>
            <span className="text-[#5b738b] text-[11px]">Bahía Blanca</span>
          </div>
        </div>

        {/* Global Search / Command Bar (T-Codes & Apps) */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5b738b] pointer-events-none" strokeWidth={2} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar app o T-Code (MMBE, MIGO, MD04, MC40, VL02N, CMI)... [Ctrl+K]"
              className="w-full bg-[#f5f6f7] hover:bg-[#eff1f4] focus:bg-white text-[#1d2d3e] placeholder-[#5b738b] text-xs sm:text-sm pl-9 pr-16 py-2 rounded-full border border-[#d9e1e8] focus:outline-none focus:border-[#0a6ed1] focus:ring-2 focus:ring-[#0a6ed1]/20 transition-all font-mono"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-[#5b738b] bg-white border border-[#d9e1e8] rounded font-mono">
                Enter
              </kbd>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white text-[#1d2d3e] rounded-xl shadow-xl border border-[#d9e1e8] overflow-hidden z-50"
            >
              <div className="px-3.5 py-2 bg-[#f5f6f7] border-b border-[#edf2f7] flex items-center justify-between text-[11px] font-semibold text-[#5b738b] uppercase tracking-wider">
                <span>Transacciones Rápidas & Apps Fiori</span>
                <span className="font-mono">T-CODE</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#edf2f7]">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(s => (
                    <button
                      key={s.tcode}
                      onClick={() => handleSelectSuggestion(s.app, s.tcode)}
                      className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[#f0f4f9] transition-colors group"
                    >
                      <div className="flex flex-col pr-2">
                        <span className="text-xs font-semibold text-[#1d2d3e] group-hover:text-[#0a6ed1]">
                          {s.label}
                        </span>
                        <span className="text-[11px] text-[#5b738b]">{s.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#f5f6f7] group-hover:bg-[#0a6ed1] group-hover:text-white font-mono text-xs font-bold text-[#1d2d3e] border border-[#d9e1e8] group-hover:border-[#0a6ed1] transition-colors shrink-0">
                        {s.tcode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#5b738b]">
                    Sin coincidencias para &quot;{searchQuery}&quot;. Prueba MMBE, MIGO, MD04, MC40, VL02N o CMI.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeCase && (
            <button
              onClick={() => setActiveApp('CASES')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fef3e6] text-[#9a4d06] border border-[#f5cfa3] text-xs font-semibold hover:bg-[#fde8cf] transition-all"
              title="Ver instrucciones del caso en curso"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#e9730c]" strokeWidth={2} />
              <span className="font-mono">{activeCase.code}</span>
              <span className="px-1.5 py-0.2 bg-white/80 rounded-full text-[10px] tabular-nums">
                {activeCase.steps.filter(s => s.isCompleted).length}/{activeCase.steps.length}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('¿Restablecer todos los escenarios UTN (TecnoSur, Metalúrgica del Sur, MRP y ABC) al estado inicial?')) {
                resetToDefaultData();
              }
            }}
            className="p-2 rounded-full hover:bg-[#f0f4f9] text-[#5b738b] hover:text-[#1d2d3e] transition-colors"
            title="Restablecer datos de práctica"
            aria-label="Restablecer datos"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setIsJouleOpen(!isJouleOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isJouleOpen
                ? 'bg-[#0a6ed1] text-white shadow-sm ring-2 ring-[#0a6ed1]/30'
                : 'bg-[#f0f4f9] hover:bg-[#e1ecf8] text-[#0a6ed1] border border-[#c2dcf7]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Joule</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#d9e1e8]">
            <div className="w-8 h-8 rounded-full bg-[#1b2a4a] flex items-center justify-center text-xs font-bold text-white">
              <User className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold leading-none text-[#1d2d3e]">Lic. Logística</span>
              <span className="text-[10px] text-[#5b738b] mt-0.5">UTN FRBB · Operador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header Breadcrumb when inside an App */}
      {activeApp !== 'LAUNCHPAD' && (
        <div className="bg-[#f5f6f7] border-t border-[#edf2f7] px-4 py-2 flex items-center justify-between text-xs">
          <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5b738b]">
              <button
                onClick={() => setActiveApp('LAUNCHPAD')}
                className="flex items-center gap-1 hover:text-[#0a6ed1] transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Launchpad</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#a0aec0]" strokeWidth={1.8} />
              <span className="font-semibold text-[#1d2d3e]" aria-current="page">
                {appBreadcrumbs[activeApp]}
              </span>
            </div>

            <button
              onClick={() => setActiveApp('LAUNCHPAD')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f0f4f9] text-[#0a6ed1] font-semibold text-xs border border-[#d9e1e8] transition-colors"
            >
              Volver al Launchpad
            </button>
          </div>
        </div>
      )}

      {/* Guided Case Active Context Bar (Goal-Gradient Effect) */}
      {activeCase && (
        <div className="bg-[#1b2a4a] text-white px-4 py-1.5 text-xs">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-[#0a6ed1] rounded font-mono text-[10px] font-bold shrink-0">
                {activeCase.code}
              </span>
              <span className="font-semibold truncate">{activeCase.title}</span>
              <span className="text-blue-200/80 hidden md:inline shrink-0">— {activeCase.subjectTag}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-mono tabular-nums text-blue-200">
                Paso {activeCase.steps.filter(s => s.isCompleted).length}/{activeCase.steps.length}
              </span>
              <button
                onClick={() => setActiveApp('CASES')}
                className="text-blue-300 hover:text-white underline text-[11px]"
              >
                Ver pasos
              </button>
              <button
                onClick={() => setActiveCaseStudyId(null)}
                className="text-slate-300 hover:text-white text-[11px]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
