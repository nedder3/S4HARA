import React, { Suspense, lazy } from 'react';
import { SAPProvider, useSAP } from './context/SAPContext';
import { FioriShellHeader } from './components/layout/FioriShellHeader';
import { ToastContainer } from './components/layout/ToastContainer';
import { JouleAssistantDrawer } from './components/joule/JouleAssistantDrawer';
import { FioriLaunchpad } from './components/launchpad/FioriLaunchpad';

// Route-level code splitting for optimal initial bundle & TTI
const MMBEStockOverview = lazy(() =>
  import('./components/apps/MMBEStockOverview').then(m => ({ default: m.MMBEStockOverview }))
);
const MIGOGoodsMovement = lazy(() =>
  import('./components/apps/MIGOGoodsMovement').then(m => ({ default: m.MIGOGoodsMovement }))
);
const ME21NPurchaseOrders = lazy(() =>
  import('./components/apps/ME21NPurchaseOrders').then(m => ({ default: m.ME21NPurchaseOrders }))
);
const VL01NOutboundDelivery = lazy(() =>
  import('./components/apps/VL01NOutboundDelivery').then(m => ({ default: m.VL01NOutboundDelivery }))
);
const MD04MRPMonitor = lazy(() =>
  import('./components/apps/MD04MRPMonitor').then(m => ({ default: m.MD04MRPMonitor }))
);
const MC40ABCAnalysis = lazy(() =>
  import('./components/apps/MC40ABCAnalysis').then(m => ({ default: m.MC40ABCAnalysis }))
);
const CMIOverviewDashboard = lazy(() =>
  import('./components/apps/CMIOverviewDashboard').then(m => ({ default: m.CMIOverviewDashboard }))
);
const EWMRackVisualizer = lazy(() =>
  import('./components/apps/EWMRackVisualizer').then(m => ({ default: m.EWMRackVisualizer }))
);
const GuidedTrainingCases = lazy(() =>
  import('./components/apps/GuidedTrainingCases').then(m => ({ default: m.GuidedTrainingCases }))
);

const AppLoadingFallback: React.FC = () => (
  <div className="max-w-[1700px] mx-auto px-4 py-12 flex items-center justify-center">
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#d9e1e8] shadow-xs text-xs font-mono text-[#5b738b]">
      <span className="w-4 h-4 rounded-full border-2 border-[#0a6ed1] border-t-transparent animate-spin" />
      <span>Cargando transacción SAP Fiori...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeApp } = useSAP();

  return (
    <div className="min-h-screen bg-[#f5f6f7] text-[#1d2d3e] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <FioriShellHeader />

      <main className="flex-1 pb-16">
        {activeApp === 'LAUNCHPAD' ? (
          <FioriLaunchpad />
        ) : (
          <Suspense fallback={<AppLoadingFallback />}>
            {activeApp === 'MMBE' && <MMBEStockOverview />}
            {activeApp === 'MIGO' && <MIGOGoodsMovement />}
            {activeApp === 'ME21N' && <ME21NPurchaseOrders />}
            {activeApp === 'VL01N' && <VL01NOutboundDelivery />}
            {activeApp === 'MD04' && <MD04MRPMonitor />}
            {activeApp === 'MC40' && <MC40ABCAnalysis />}
            {activeApp === 'CMI' && <CMIOverviewDashboard />}
            {activeApp === 'EWM_RACK' && <EWMRackVisualizer />}
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
    <SAPProvider>
      <AppContent />
    </SAPProvider>
  );
}

export default App;
