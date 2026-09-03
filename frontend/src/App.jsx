import { useState } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { RecoveryOpportunities } from './pages/RecoveryOpportunities';
import { BudgetOptimizer } from './pages/BudgetOptimizer';
import { Simulator } from './pages/Simulator';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'opportunities' && <RecoveryOpportunities />}
      {activeTab === 'optimizer' && <BudgetOptimizer />}
      {activeTab === 'simulator' && <Simulator />}
    </Layout>
  );
}

export default App;
