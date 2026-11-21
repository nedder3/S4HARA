import React from 'react';
import { SAPProvider, useSAP } from './context/SAPContext';
import { FioriShellHeader } from './components/layout/FioriShellHeader';
import { ToastContainer } from './components/layout/ToastContainer';
import { JouleAssistantDrawer } from './components/joule/JouleAssistantDrawer';
import { FioriLaunchpad } from './components/launchpad/FioriLaunchpad';
import { MMBEStockOverview } from './components/apps/MMBEStockOverview';
import { MIGOGoodsMovement } from './components/apps/MIGOGoodsMovement';
import { ME21NPurchaseOrders } from './components/apps/ME21NPurchaseOrders';
import { VL01NOutboundDelivery } from './components/apps/VL01NOutboundDelivery';
import { MD04MRPMonitor } from './components/apps/MD04MRPMonitor';
import { MC40ABCAnalysis } from './components/apps/MC40ABCAnalysis';
import { CMIOverviewDashboard } from './components/apps/CMIOverviewDashboard';
import { EWMRackVisualizer } from './components/apps/EWMRackVisualizer';
import { GuidedTrainingCases } from './components/apps/GuidedTrainingCases';

const AppContent: React.FC = () => {
  const { activeApp } = useSAP();

  return (
    <div className="min-h-screen bg-[#f5f6f7] text-[#1d2d3e] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <FioriShellHeader />

      <main className="flex-1 pb-16">
        {activeApp === 'LAUNCHPAD' && <FioriLaunchpad />}
        {activeApp === 'MMBE' && <MMBEStockOverview />}
        {activeApp === 'MIGO' && <MIGOGoodsMovement />}
        {activeApp === 'ME21N' && <ME21NPurchaseOrders />}
        {activeApp === 'VL01N' && <VL01NOutboundDelivery />}
        {activeApp === 'MD04' && <MD04MRPMonitor />}
        {activeApp === 'MC40' && <MC40ABCAnalysis />}
        {activeApp === 'CMI' && <CMIOverviewDashboard />}
        {activeApp === 'EWM_RACK' && <EWMRackVisualizer />}
        {activeApp === 'CASES' && <GuidedTrainingCases />}
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
