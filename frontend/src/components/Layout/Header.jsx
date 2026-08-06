import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Dumbbell, Wallet, User, Zap, Menu, Flame } from 'lucide-react';
import './Header.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your daily overview', icon: LayoutDashboard },
  '/gym':       { title: 'Gym Tracker', subtitle: 'Log your food, track your macros', icon: Dumbbell },
  '/money':     { title: 'Money Tracker', subtitle: 'Track your expenses and savings', icon: Wallet },
  '/profile':   { title: 'Profile', subtitle: 'Your account settings', icon: User },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const page = PAGE_TITLES[pathname] || { title: 'Streak', subtitle: '', icon: Zap };
  const PageIcon = page.icon;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn btn-icon" onClick={onMenuClick} id="menu-toggle-btn" aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className="header-title-group">
          <div className="header-page-title">
            <PageIcon size={20} color="#06B6D4" />
            <h1 className="header-title">{page.title}</h1>
          </div>
          {page.subtitle && <p className="header-subtitle">{page.subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        <div className="header-date">{today}</div>
        {user && (
          <div className="header-greeting">
            <span>{getGreeting()}, <strong>{user.name.split(' ')[0]}</strong></span>
          </div>
        )}
        <div className="header-streak-badge">
          <Flame size={16} />
          <span>{user?.gymStreak || 0} day streak</span>
        </div>
      </div>
    </header>
  );
}
