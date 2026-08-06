import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Dumbbell, Wallet, User, Zap, LogOut } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/gym',       icon: Dumbbell,        label: 'Gym Tracker' },
  { path: '/money',     icon: Wallet,          label: 'Money Tracker' },
  { path: '/profile',   icon: User,            label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Zap className="sidebar-logo-icon" size={24} color="#06B6D4" />
          <span className="sidebar-logo-text">Streak</span>
        </div>

        {/* User mini-profile */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-goal">{formatGoal(user.fitnessGoal)}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="sidebar-nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {user && (
            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Daily Cal</span>
                <span className="sidebar-stat-value gym-color">{user.dailyCalories}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Salary</span>
                <span className="sidebar-stat-value money-color">₹{(user.monthlySalary/1000).toFixed(0)}k</span>
              </div>
            </div>
          )}
          <button className="sidebar-logout btn btn-ghost" onClick={handleLogout} id="logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function formatGoal(goal) {
  const map = { lose_weight: 'Losing Weight', maintain: 'Maintaining', gain_muscle: 'Building Muscle' };
  return map[goal] || goal;
}
