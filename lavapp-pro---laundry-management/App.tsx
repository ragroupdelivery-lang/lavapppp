import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';

// Import Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Import Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Settings from './pages/Settings';
import ClientPortal from './pages/ClientPortal';

const AdminLayout: React.FC = () => (
  <div className="flex h-screen bg-brand-gray-100 text-brand-gray-800">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-gray-100 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ClientPortal />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="services" element={<Services />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;