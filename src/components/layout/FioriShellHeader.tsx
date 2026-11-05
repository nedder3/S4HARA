import React, { useState, useRef, useEffect } from 'react';
import { useSAP, AppView } from '../../context/SAPContext';
import {
  Search,
  Sparkles,
  RotateCcw,
  Boxes,
  HelpCircle,
  Home,
  CheckCircle2,
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

  // Quick T-Code commands database
  const suggestions = [
    { tcode: 'MMBE', label: 'Resumen de Stock', category: 'Gestión de Inventario (MM)', app: 'MMBE' as AppView },
    { tcode: 'MIGO', label: 'Movimientos de Mercancías (101, 311)', category: 'Gestión de Inventario (MM)', app: 'MIGO' as AppView },
    { tcode: 'ME21N', label: 'Gestión de Pedidos de Compra (PO)', category: 'Aprovisionamiento (MM)', app: 'ME21N' as AppView },
    { tcode: 'VL01N', label: 'Entregas Salientes & Picking (PGI)', category: 'Expedición (SD/LE)', app: 'VL01N' as AppView },
    { tcode: 'EWM', label: 'Visor de Ubicaciones en Racks', category: 'Almacén Avanzado (EWM)', app: 'EWM_RACK' as AppView },
    { tcode: 'CASOS', label: 'Misiones Prácticas para Entrevistas', category: 'Entrenamiento Logístico', app: 'CASES' as AppView },
  ];

  const filteredSuggestions = suggestions.filter(
    s =>
      s.tcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcut Ctrl+K or / to focus search
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

  // Click outside to close suggestions
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

  return (
    <header className="sticky top-0 z-40 bg-[#1b2a4a] text-white shadow-md select-none border-b border-[#2a3f68]">
      {/* Primary Top Bar */}
      <div className="max-w-[1700px] mx-auto px-4 h-13 flex items-center justify-between gap-4">
        {/* Brand & System Environment */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveApp('LAUNCHPAD')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-1"
            title="Ir al Launchpad Principal"
          >
            <div className="w-8 h-8 rounded bg-[#0a6ed1] flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-inner">
              SAP
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm leading-tight tracking-tight flex items-center gap-1.5">
                S/4HANA <span className="text-xs font-normal text-blue-200">Logistics Cloud</span>
              </span>
              <span className="text-[10px] text-slate-300 font-mono tracking-wide">
                S4P (100) • Mandante Logístico
              </span>
            </div>
          </button>

          {/* Plant indicator pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#273a61] text-xs text-blue-100 border border-[#354f82]">
            <Building2 className="w-3.5 h-3.5 text-blue-300" strokeWidth={1.8} />
            <span className="font-mono font-medium">Centro 1010</span>
            <span className="text-slate-400 text-[11px]">— Almacén Central</span>
          </div>
        </div>

        {/* Global Search / Command Bar (T-Codes & Apps) */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={2} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar app o T-Code (ej: MMBE, MIGO, VL01N, ME21N)... [Ctrl+K]"
              className="w-full bg-[#121e35] text-slate-100 placeholder-slate-400 text-xs sm:text-sm pl-9 pr-20 py-2 rounded-lg border border-[#2e4573] focus:outline-none focus:border-[#0a6ed1] focus:ring-2 focus:ring-[#0a6ed1]/30 transition-all font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-slate-400 bg-[#1c2c4d] border border-[#344d7c] rounded font-mono">
                Enter
              </kbd>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 duration-150"
            >
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>Transacciones Rápidas & Aplicaciones Fiori</span>
                <span className="font-mono text-slate-400">T-CODE</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(s => (
                    <button
                      key={s.tcode}
                      onClick={() => handleSelectSuggestion(s.app, s.tcode)}
                      className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50/80 transition-colors group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                          {s.label}
                        </span>
                        <span className="text-[11px] text-slate-500">{s.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 group-hover:bg-blue-600 group-hover:text-white font-mono text-xs font-bold text-slate-700 transition-colors">
                        {s.tcode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontraron transacciones con &quot;{searchQuery}&quot;. Intenta con MMBE, MIGO, ME21N o VL01N.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          {/* Active Case Pill */}
          {activeCase && (
            <button
              onClick={() => setActiveApp('CASES')}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all"
              title="Ver instrucciones de la misión en curso"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
              <span className="truncate max-w-[130px] font-mono">{activeCase.code}</span>
              <span className="px-1.5 py-0.2 bg-amber-400/20 rounded text-[10px]">
                {activeCase.steps.filter(s => s.isCompleted).length}/{activeCase.steps.length}
              </span>
            </button>
          )}

          {/* Reset State Button */}
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar todos los datos de inventario y casos al estado inicial de práctica?')) {
                resetToDefaultData();
              }
            }}
            className="p-1.5 rounded-md hover:bg-[#273a61] text-slate-300 hover:text-white transition-colors"
            title="Reiniciar datos de práctica a valores originales"
            aria-label="Reiniciar datos"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
          </button>

          {/* Joule AI Assistant Toggle */}
          <button
            onClick={() => setIsJouleOpen(!isJouleOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              isJouleOpen
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-blue-300'
                : 'bg-gradient-to-r from-[#243a63] to-[#1e3052] hover:from-[#2e4778] hover:to-[#243a63] text-blue-100 border border-[#3b5487]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" strokeWidth={2} />
            <span className="font-semibold tracking-wide">Joule</span>
            <span className="text-[10px] px-1 py-0.2 bg-white/20 rounded font-mono">Tutor</span>
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#2e4573]">
            <div className="w-7 h-7 rounded-full bg-[#0a6ed1] flex items-center justify-center text-xs font-bold text-white border border-blue-400">
              <User className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium leading-none">Lic. Logística</span>
              <span className="text-[10px] text-slate-300">Operaciones & Almacén</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb / Active App Navigation Bar */}
      {activeApp !== 'LAUNCHPAD' && (
        <div className="bg-[#14213d] border-t border-[#25395f] px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <button
              onClick={() => setActiveApp('LAUNCHPAD')}
              className="flex items-center gap-1 hover:text-white transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Launchpad</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} />
            <span className="font-semibold text-blue-200">
              {activeApp === 'MMBE' && 'Resumen de Stocks (MMBE)'}
              {activeApp === 'MIGO' && 'Movimientos de Mercancías (MIGO)'}
              {activeApp === 'ME21N' && 'Gestión de Pedidos de Compra (ME21N)'}
              {activeApp === 'VL01N' && 'Entregas Salientes & Picking (VL01N / VL02N)'}
              {activeApp === 'EWM_RACK' && 'Mapa de Ubicaciones en Racks (EWM)'}
              {activeApp === 'CASES' && 'Misiones Prácticas Guiadas'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveApp('LAUNCHPAD')}
              className="px-2.5 py-0.5 rounded bg-[#233559] hover:bg-[#2d436f] text-slate-200 text-xs transition-colors border border-[#354f82]"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}

      {/* Guided Case Active Banner */}
      {activeCase && (
        <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded font-mono text-[10px] font-bold text-amber-300">
              {activeCase.code}
            </span>
            <span className="font-semibold">{activeCase.title}</span>
            <span className="text-amber-300/80 hidden md:inline">— {activeCase.role}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono">
              Progreso: {activeCase.steps.filter(s => s.isCompleted).length} de {activeCase.steps.length} pasos
            </span>
            <button
              onClick={() => setActiveCaseStudyId(null)}
              className="text-amber-400 hover:text-white underline text-[11px]"
            >
              Cerrar Misión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
