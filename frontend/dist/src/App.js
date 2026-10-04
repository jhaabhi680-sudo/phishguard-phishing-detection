import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Scanner from './pages/Scanner.js';
import Dashboard from './pages/Dashboard.js';
import History from './pages/History.js';
import About from './pages/About.js';
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
  const navigateTo = page => {
    setActivePage(page);
    window.location.hash = page;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleQuickScan = urlToScan => {
    setPrefilledUrl(urlToScan || '');
    navigateTo('scanner');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex flex-col bg-[#060a14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
  }, /*#__PURE__*/React.createElement(Navbar, {
    currentPage: activePage,
    onNavigate: navigateTo
  }), /*#__PURE__*/React.createElement("main", {
    className: "flex-1"
  }, activePage === 'home' && /*#__PURE__*/React.createElement(Home, {
    onNavigate: navigateTo,
    onQuickScan: handleQuickScan
  }), activePage === 'scanner' && /*#__PURE__*/React.createElement(Scanner, {
    scanner: scanner,
    initialUrl: prefilledUrl,
    onClearInitialUrl: () => setPrefilledUrl('')
  }), activePage === 'dashboard' && /*#__PURE__*/React.createElement(Dashboard, {
    onNavigate: navigateTo
  }), activePage === 'history' && /*#__PURE__*/React.createElement(History, {
    onRescan: handleQuickScan
  }), activePage === 'about' && /*#__PURE__*/React.createElement(About, {
    onNavigate: navigateTo
  })), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigateTo
  }));
}