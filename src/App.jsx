import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initializeMockData } from './services/mockData';

// Import pages
import SplashScreen from './pages/SplashScreen';
import AccountSetupScreen from './pages/AccountSetupScreen';
import MainScreen from './pages/MainScreen';
import SettingsScreen from './pages/SettingsScreen';
import NewBillScreen from './pages/NewBillScreen';
import BillDetailsScreen from './pages/BillDetailsScreen';
import BillOverviewScreen from './pages/BillOverviewScreen';
import AddPersonScreen from './pages/AddPersonScreen';
import AddItemScreen from './pages/AddItemScreen';
import AddSpecialItemScreen from './pages/AddSpecialItemScreen';
import BillSummaryScreen from './pages/BillSummaryScreen';

// Import Tailwind CSS
import './index.css';

function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/setup" element={<AccountSetupScreen />} />
        <Route path="/bills" element={<MainScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/bills/new" element={<NewBillScreen />} />
        <Route path="/bills/:id" element={<BillDetailsScreen />} />
        <Route path="/bills/:id/overview" element={<BillOverviewScreen />} />
        <Route path="/bills/:id/add-person" element={<AddPersonScreen />} />
        <Route path="/bills/:id/add-item" element={<AddItemScreen />} />
        <Route path="/bills/:id/add-special" element={<AddSpecialItemScreen />} />
        <Route path="/bills/:id/summary" element={<BillSummaryScreen />} />
      </Routes>
    </div>
  );
}

export default App;
