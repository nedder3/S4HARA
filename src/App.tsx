import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SAPProvider, useSAP } from './context/SAPContext';
import { FioriShellHeader } from './components/layout/FioriShellHeader';
import { ToastContainer } from './components/layout/ToastContainer';
import { JouleAssistantDrawer } from './components/joule/JouleAssistantDrawer';
import { FioriLaunchpad } from './components/launchpad/FioriLaunchpad';

// Modular lazy-loading organized by real SAP S/4HANA modules
const SAPAcademy = lazy(() => import('./modules/academy/SAPAcademy').then(m => ({ default: m.SAPAcademy })));
const MMBEStockOverview = lazy(() => import('./modules/mm/MMBEStockOverview').then(m => ({ default: m.MMBEStockOverview })));
const MIGOGoodsMovement = lazy(() => import('./modules/mm/MIGOGoodsMovement').then(m => ({ default: m.MIGOGoodsMovement })));
const ME21NPurchaseOrders = lazy(() => import('./modules/mm/ME21NPurchaseOrders').then(m => ({ default: m.ME21NPurchaseOrders })));
const MC40ABCAnalysis = lazy(() => import('./modules/mm/MC40ABCAnalysis').then(m => ({ default: m.MC40ABCAnalysis })));
const MD04MRPMonitor = lazy(() => import('./modules/pp/MD04MRPMonitor').then(m => ({ default: m.MD04MRPMonitor })));
const VL01NOutboundDelivery = lazy(() => import('./modules/sd/VL01NOutboundDelivery').then(m => ({ default: m.VL01NOutboundDelivery })));
const EWMRackVisualizer = lazy(() => import('./modules/ewm/EWMRackVisualizer').then(m => ({ default: m.EWMRackVisualizer })));
const EWMDockPlanner = lazy(() => import('./modules/ewm/EWMDockPlanner').then(m => ({ default: m.EWMDockPlanner })));
const CMIOverviewDashboard = lazy(() => import('./modules/analytics/CMIOverviewDashboard').then(m => ({ default: m.CMIOverviewDashboard })));
const GuidedTrainingCases = lazy(() => import('./modules/training/GuidedTrainingCases').then(m => ({ default: m.GuidedTrainingCases })));

const AppLoadingFallback: React.FC = () => (
  <div className="max-w-[1700px] mx-auto px-4 py-12 flex items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl sap-card shadow-xs text-xs font-mono text-[var(--sap-text-muted)]">
      <span className="w-4 h-4 rounded-full border-2 border-[var(--sap-brand)] border-t-transparent animate-spin" />
      <span>Cargando módulo SAP Fiori...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeApp } = useSAP();
  const mainRef = useRef<HTMLElement>(null);

  // Programmatic Focus Management (WCAG 2.1 AA) when switching modules
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    mainRef.current?.focus();
  }, [activeApp]);

  return (
    <div className="min-h-screen bg-[var(--sap-bg)] text-[var(--sap-text)] flex flex-col font-sans">
      <FioriShellHeader />

      <main ref={mainRef} tabIndex={-1} className="flex-1 pb-16 outline-none">
        {activeApp === 'LAUNCHPAD' ? (
          <FioriLaunchpad />
        ) : (
          <Suspense fallback={<AppLoadingFallback />}>
            {activeApp === 'ACADEMY' && <SAPAcademy />}
            {activeApp === 'MMBE' && <MMBEStockOverview />}
            {activeApp === 'MIGO' && <MIGOGoodsMovement />}
            {activeApp === 'ME21N' && <ME21NPurchaseOrders />}
            {activeApp === 'MC40' && <MC40ABCAnalysis />}
            {activeApp === 'MD04' && <MD04MRPMonitor />}
            {activeApp === 'VL01N' && <VL01NOutboundDelivery />}
            {activeApp === 'EWM_RACK' && <EWMRackVisualizer />}
            {activeApp === 'EWM_DOCK' && <EWMDockPlanner />}
            {activeApp === 'CMI' && <CMIOverviewDashboard />}
            {activeApp === 'CASES' && <GuidedTrainingCases />}
          </Suspense>
        )}
      </main>

      <JouleAssistantDrawer />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <SAPProvider>
        <AppContent />
      </SAPProvider>
    </ThemeProvider>
  );
}

export default App;
