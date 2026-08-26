import React from 'react';
import { Home, Search, Bookmark, GraduationCap, Settings } from 'lucide-react';

export type TabRoute = 'home' | 'search' | 'saved' | 'practice' | 'settings';

interface BottomNavigationProps {
  activeTab: TabRoute;
  onSelectTab: (tab: TabRoute) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab
}) => {
  const navItems: { id: TabRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={22} /> },
    { id: 'search', label: 'Search', icon: <Search size={22} /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark size={22} /> },
    { id: 'practice', label: 'Practice', icon: <GraduationCap size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
            aria-label={item.label}
            aria-selected={isActive}
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
