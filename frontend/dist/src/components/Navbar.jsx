import React, { useState } from 'react';
import { Shield, Home, Search, BarChart3, History, Info, Menu, X, ArrowRight } from 'lucide-react';
const NAV_ITEMS = [{
  id: 'home',
  label: 'Home',
  icon: Home
}, {
  id: 'scanner',
  label: 'Scanner',
  icon: Search
}, {
  id: 'dashboard',
  label: 'Dashboard',
  icon: BarChart3
}, {
  id: 'history',
  label: 'History',
  icon: History
}, {
  id: 'about',
  label: 'About',
  icon: Info
}];
export default function Navbar({
  currentPage,
  onNavigate
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNav = pageId => {
    onNavigate(pageId);
    setMobileOpen(false);
  };
  return /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-50 border-b border-slate-800/80 bg-[#060913]/85 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleNav('home'),
    className: "flex items-center gap-3 text-left group focus:outline-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 transition-transform group-hover:scale-105"
  }, /*#__PURE__*/React.createElement(Shield, {
    className: "h-5 w-5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-extrabold tracking-tight text-white"
  }, "Phish", /*#__PURE__*/React.createElement("span", {
    className: "text-cyan-400"
  }, "Guard")), /*#__PURE__*/React.createElement("span", {
    className: "hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:inline-block"
  }, "AI / ML")), /*#__PURE__*/React.createElement("p", {
    className: "hidden text-xs text-slate-400 md:block"
  }, "AI-powered protection against phishing websites"))), /*#__PURE__*/React.createElement("nav", {
    className: "hidden items-center gap-1 md:flex"
  }, NAV_ITEMS.map(item => {
    const Icon = item.icon;
    const active = currentPage === item.id;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      type: "button",
      onClick: () => handleNav(item.id),
      className: `flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${active ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`
    }, /*#__PURE__*/React.createElement(Icon, {
      className: "h-4 w-4"
    }), item.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "hidden items-center gap-3 md:flex"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleNav('scanner'),
    className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500"
  }, /*#__PURE__*/React.createElement("span", null, "Scan URL"), /*#__PURE__*/React.createElement(ArrowRight, {
    className: "h-4 w-4"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMobileOpen(!mobileOpen),
    "aria-label": "Toggle Menu",
    className: "inline-flex items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
  }, mobileOpen ? /*#__PURE__*/React.createElement(X, {
    className: "h-5 w-5"
  }) : /*#__PURE__*/React.createElement(Menu, {
    className: "h-5 w-5"
  }))), mobileOpen && /*#__PURE__*/React.createElement("div", {
    className: "border-t border-slate-800 bg-[#080d1a] px-4 py-4 md:hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col space-y-1.5"
  }, NAV_ITEMS.map(item => {
    const Icon = item.icon;
    const active = currentPage === item.id;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      type: "button",
      onClick: () => handleNav(item.id),
      className: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'}`
    }, /*#__PURE__*/React.createElement(Icon, {
      className: "h-4 w-4"
    }), item.label);
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleNav('scanner'),
    className: "mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
  }, /*#__PURE__*/React.createElement("span", null, "Scan URL"), /*#__PURE__*/React.createElement(ArrowRight, {
    className: "h-4 w-4"
  })))));
}