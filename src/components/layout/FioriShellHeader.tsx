import React, { useState, useRef, useEffect } from 'react';
import { useSAP, AppView } from '../../context/SAPContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Sparkles,
  RotateCcw,
  Home,
  ChevronRight,
  User,
  Building2,
  BookOpen,
  GraduationCap,
  Sun,
  Moon
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

  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCase = caseStudies.find(c => c.id === activeCaseStudyId);

  const suggestions = [
    { tcode: 'ACADEMY', label: 'Academia SAP S/4HANA (Empieza Aquí)', category: 'Formación & Fundamentos', app: 'ACADEMY' as AppView },
    { tcode: 'MMBE', label: 'Resumen de Stock Multicentro & ABC', category: 'SAP MM · Inventario', app: 'MMBE' as AppView },
    { tcode: 'MIGO', label: 'Movimientos (101, 311, 344 Bloqueo, 651 Devolución)', category: 'SAP MM · Movimientos', app: 'MIGO' as AppView },
    { tcode: 'ME21N', label: 'Pedidos de Compra & Proveedores', category: 'SAP MM · Aprovisionamiento', app: 'ME21N' as AppView },
    { tcode: 'MC40', label: 'Análisis de Inventarios ABC / Pareto', category: 'SAP MM · Analítica Stock', app: 'MC40' as AppView },
    { tcode: 'MD04', label: 'Monitor MRP & Explosión BOM (CS03)', category: 'SAP PP · Planificación', app: 'MD04' as AppView },
    { tcode: 'VL02N', label: 'Entregas Salientes, Controles & PGI (601)', category: 'SAP SD/LE · Expedición', app: 'VL01N' as AppView },
    { tcode: 'EWM', label: 'Visor 2D de Racks & Ubicaciones (Bins)', category: 'SAP EWM · Almacén', app: 'EWM_RACK' as AppView },
    { tcode: 'MUELLES', label: 'Programación y Capacidad de Muelles', category: 'SAP EWM · Yard / Docks', app: 'EWM_DOCK' as AppView },
    { tcode: 'CMI', label: 'Tablero Analítico CMI / OTIF', category: 'SAP Analytics · KPIs', app: 'CMI' as AppView },
    { tcode: 'CASOS', label: 'Escenarios Prácticos Guiados', category: 'Práctica Desacoplada', app: 'CASES' as AppView }
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

  const appBreadcrumbs: Record<AppView, string> = {
    LAUNCHPAD: 'Launchpad',
    ACADEMY: 'Academia SAP S/4HANA',
    MMBE: 'SAP MM · Resumen de Stocks (MMBE)',
    MIGO: 'SAP MM · Movimientos de Mercancías (MIGO)',
    ME21N: 'SAP MM · Pedidos de Compra (ME21N)',
    MC40: 'SAP MM · Análisis ABC / Pareto (MC40)',
    MD04: 'SAP PP · Monitor MRP & BOM (MD04 / CS03)',
    VL01N: 'SAP SD/LE · Entregas Salientes & PGI (VL02N)',
    EWM_RACK: 'SAP EWM · Mapa de Ubicaciones (Bins)',
    EWM_DOCK: 'SAP EWM · Capacidad y Programación de Muelles',
    CMI: 'SAP Analytics · Tablero CMI & OTIF',
    CASES: 'Escenarios Prácticos Guiados'
  };

  return (
    <header className="sticky top-0 z-40 sap-card border-x-0 border-t-0 shadow-xs select-none">
      {/* Primary Shell Bar */}
      <div className="max-w-[1700px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand & System */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveApp('LAUNCHPAD')}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity rounded-lg p-1"
            title="Ir al Launchpad Principal"
          >
            <div className="w-9 h-8 rounded-md bg-[var(--sap-brand)] flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-xs">
              SAP
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm leading-tight tracking-tight flex items-center gap-1.5">
                S/4HANA <span className="text-xs font-medium text-[var(--sap-brand)]">Logistics</span>
              </span>
              <span className="text-[10px] text-[var(--sap-text-muted)] font-mono tracking-wide">
                S4P (100) · Enterprise ERP
              </span>
            </div>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md sap-subtle border text-xs">
            <Building2 className="w-3.5 h-3.5 text-[var(--sap-brand)]" strokeWidth={1.8} />
            <span className="font-mono font-semibold">Centro 1010</span>
          </div>
        </div>

        {/* Global T-Code / App Search Bar */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sap-text-muted)] pointer-events-none" strokeWidth={2} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar módulo o T-Code (ACADEMY, MMBE, MIGO, MD04, VL02N)... [Ctrl+K]"
              aria-label="Buscar aplicación o código de transacción SAP"
              className="sap-input w-full text-xs sm:text-sm pl-9 pr-16 py-2 min-h-[38px] rounded-full font-mono transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-[var(--sap-text-muted)] bg-[var(--sap-surface)] border border-[var(--sap-border)] rounded font-mono">
                Enter
              </kbd>
            </div>
          </form>

          {showSuggestions && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 sap-card rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="px-3.5 py-2 sap-subtle border-b border-[var(--sap-border-light)] flex items-center justify-between text-[11px] font-semibold text-[var(--sap-text-muted)] uppercase tracking-wider">
                <span>Transacciones & Módulos SAP</span>
                <span className="font-mono">T-CODE</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--sap-border-light)]">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(s => (
                    <button
                      key={s.tcode}
                      onClick={() => {
                        setActiveApp(s.app);
                        setSearchQuery(s.tcode);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--sap-brand-soft)] transition-colors group"
                    >
                      <div className="flex flex-col pr-2">
                        <span className="text-xs font-semibold group-hover:text-[var(--sap-brand)]">{s.label}</span>
                        <span className="text-[11px] text-[var(--sap-text-muted)]">{s.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded sap-subtle group-hover:bg-[var(--sap-brand)] group-hover:text-white font-mono text-xs font-bold border border-[var(--sap-border)] transition-colors shrink-0">
                        {s.tcode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--sap-text-muted)]">
                    Sin coincidencias para &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* SAP Academy Quick Pill */}
          <button
            onClick={() => setActiveApp('ACADEMY')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all border ${
              activeApp === 'ACADEMY'
                ? 'bg-[var(--sap-brand)] text-white border-[var(--sap-brand)]'
                : 'bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] border-[var(--sap-brand-border)] hover:opacity-90'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Academia</span>
          </button>

          {activeCase && (
            <button
              onClick={() => setActiveApp('CASES')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-[var(--sap-warning-bg)] text-[var(--sap-warning)] border border-[var(--sap-warning-border)] text-xs font-semibold"
              title="Ver escenario activo"
            >
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="font-mono">{activeCase.code}</span>
              <span className="tabular-nums font-mono text-[10px]">
                {activeCase.steps.filter(s => s.isCompleted).length}/{activeCase.steps.length}
              </span>
            </button>
          )}

          {/* Dark Mode Toggle (WCAG Accessible) */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro Morning Horizon' : 'Cambiar a modo oscuro Evening Horizon'}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? 'Modo Claro (Morning Horizon)' : 'Modo Oscuro (Evening Horizon)'}
            className="p-2 min-w-[36px] min-h-[36px] rounded-full hover:bg-[var(--sap-brand-soft)] text-[var(--sap-text-muted)] hover:text-[var(--sap-brand)] transition-colors flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.8} /> : <Moon className="w-4 h-4" strokeWidth={1.8} />}
          </button>

          {/* Reset Data */}
          <button
            onClick={() => {
              if (window.confirm('¿Restablecer inventario, documentos y escenarios al estado inicial?')) {
                resetToDefaultData();
              }
            }}
            className="p-2 min-w-[36px] min-h-[36px] rounded-full hover:bg-[var(--sap-brand-soft)] text-[var(--sap-text-muted)] hover:text-[var(--sap-text)] transition-colors flex items-center justify-center"
            title="Restablecer datos de fábrica"
            aria-label="Restablecer datos de fábrica"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
          </button>

          {/* Joule Assistant */}
          <button
            onClick={() => setIsJouleOpen(!isJouleOpen)}
            aria-expanded={isJouleOpen}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all border ${
              isJouleOpen
                ? 'bg-[var(--sap-brand)] text-white border-[var(--sap-brand)]'
                : 'bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] border-[var(--sap-brand-border)] hover:opacity-90'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Joule</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--sap-border)]">
            <div className="w-8 h-8 rounded-full bg-[#1b2a4a] dark:bg-[#2a4a70] flex items-center justify-center text-white">
              <User className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header Breadcrumb */}
      {activeApp !== 'LAUNCHPAD' && (
        <div className="sap-subtle border-t border-[var(--sap-border-light)] px-4 py-2 text-xs">
          <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-2 text-[var(--sap-text-muted)]" aria-label="Ruta de navegación">
              <button
                onClick={() => setActiveApp('LAUNCHPAD')}
                className="flex items-center gap-1 hover:text-[var(--sap-brand)] transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Launchpad</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" strokeWidth={1.8} />
              <span className="font-semibold text-[var(--sap-text)]" aria-current="page">
                {appBreadcrumbs[activeApp]}
              </span>
            </nav>

            <button
              onClick={() => setActiveApp('LAUNCHPAD')}
              className="px-3 py-1 rounded-md sap-card hover:bg-[var(--sap-brand-soft)] text-[var(--sap-brand)] font-semibold text-xs transition-colors"
            >
              Volver al Launchpad
            </button>
          </div>
        </div>
      )}

      {/* Active Practice Scenario Context Bar */}
      {activeCase && (
        <div className="bg-[#1b2a4a] text-white px-4 py-1.5 text-xs">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-[#0a6ed1] rounded font-mono text-[10px] font-bold shrink-0">
                {activeCase.code}
              </span>
              <span className="font-semibold truncate">{activeCase.title}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-mono tabular-nums text-blue-200">
                Paso {activeCase.steps.filter(s => s.isCompleted).length}/{activeCase.steps.length}
              </span>
              <button onClick={() => setActiveApp('CASES')} className="text-blue-300 hover:text-white underline text-[11px]">
                Ver pasos
              </button>
              <button onClick={() => setActiveCaseStudyId(null)} className="text-slate-300 hover:text-white text-[11px]">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
