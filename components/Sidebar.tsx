
import React, { useState } from 'react';
import type { ViewType, NavItem } from '../types';
import { LanguageSelector } from './LanguageSelector';
import type { Language } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  navItems: NavItem[];
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, navItems, selectedLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white/50 backdrop-blur-sm text-gray-800 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-20 flex flex-col w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <img src="https://picsum.photos/seed/farmer/40/40" alt="Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-bold text-green-800">Kisan Mitra AI</h1>
        </div>
        <nav className="flex-grow p-4">
          <ul>
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => {
                      onViewChange(item.id);
                      setIsOpen(false);
                  }}
                  className={`flex items-center w-full p-3 my-1 rounded-lg text-left text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200 ${currentView === item.id ? 'bg-green-100 text-green-800 font-semibold' : ''}`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-600 mb-2 block">Language</label>
          <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={onLanguageChange} />
        </div>
      </aside>
    </>
  );
};
