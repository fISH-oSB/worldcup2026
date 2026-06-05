import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import PasswordGate from './components/PasswordGate';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GroupStage from './pages/GroupStage';
import Knockout from './pages/Knockout';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/groups"      element={currentUser ? <GroupStage /> : <Navigate to="/" />} />
          <Route path="/knockout"    element={currentUser ? <Knockout />   : <Navigate to="/" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin"       element={<Admin />} />
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </PasswordGate>
  );
}
