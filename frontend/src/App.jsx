import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Scanner from './pages/Scanner.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import About from './pages/About.jsx';
import { useScanner } from './hooks/useScanner.js';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['home', 'scanner', 'dashboard', 'history', 'about'].includes(hash)) {
      return hash;
    }
    return 'home';
  });

  const [prefilledUrl, setPrefilledUrl] = useState('');
  const scanner = useScanner();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['home', 'scanner', 'dashboard', 'history', 'about'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    setActivePage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickScan = (urlToScan) => {
    setPrefilledUrl(urlToScan || '');
    navigateTo('scanner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060a14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar currentPage={activePage} onNavigate={navigateTo} />

      <main className="flex-1">
        {activePage === 'home' && (
          <Home onNavigate={navigateTo} onQuickScan={handleQuickScan} />
        )}
        {activePage === 'scanner' && (
          <Scanner
            scanner={scanner}
            initialUrl={prefilledUrl}
            onClearInitialUrl={() => setPrefilledUrl('')}
          />
        )}
        {activePage === 'dashboard' && (
          <Dashboard onNavigate={navigateTo} />
        )}
        {activePage === 'history' && (
          <History onRescan={handleQuickScan} />
        )}
        {activePage === 'about' && (
          <About onNavigate={navigateTo} />
        )}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
