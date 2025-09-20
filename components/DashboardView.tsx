
import React from 'react';
// FIX: Import ViewType as a value because it is an enum used at runtime. NavItem remains a type import.
import { ViewType } from '../types';
import type { NavItem } from '../types';

interface DashboardViewProps {
  onViewChange: (view: ViewType) => void;
  navItems: NavItem[];
}

const FeatureCard: React.FC<{ item: NavItem; onClick: () => void; }> = ({ item, onClick }) => (
  <button onClick={onClick} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-center text-center border border-gray-100">
    <div className="p-4 bg-green-100 rounded-full mb-4">
      <item.icon className="w-8 h-8 text-green-700" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.label}</h3>
    <p className="text-sm text-gray-500">Get AI-powered assistance for {item.label.toLowerCase()}.</p>
  </button>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ onViewChange, navItems }) => {
    const dashboardItems = navItems.filter(item => item.id !== ViewType.DASHBOARD);
  return (
    <div className="p-6 sm:p-8 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Welcome to Kisan Mitra AI</h1>
        <p className="text-lg text-gray-600">Your trusted partner in modern farming. Select a service to get started.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dashboardItems.map(item => (
            <FeatureCard key={item.id} item={item} onClick={() => onViewChange(item.id)} />
        ))}
      </div>
    </div>
  );
};
