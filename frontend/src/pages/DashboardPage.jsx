import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Target, Dumbbell, Banknote, Landmark, Flame, CheckCircle,
  TrendingUp, Utensils, Zap, Award, Clock, ArrowRight,
  Calendar, Activity, Droplets, Moon, Sun, Wind,
} from 'lucide-react';
import './DashboardPage.css';

const MOTIVATIONAL_QUOTES = [
  "Every rep counts. Every meal matters. Keep pushing.",
  "Your streak is your legacy. Don't break the chain.",
  "Discipline is choosing what you want most over what you want now.",
  "Small daily improvements lead to staggering long-term results.",
  "The body achieves what the mind believes.",
];

const TIPS = [
  { icon: Droplets, text: "Drink 8 glasses of water today", color: "#38bdf8" },
  { icon: Moon, text: "Aim for 7–8 hours of quality sleep", color: "#818cf8" },
  { icon: Sun, text: "Morning sunlight boosts serotonin", color: "#fbbf24" },
  { icon: Wind, text: "5-min deep breathing reduces cortisol", color: "#C8F135" },
  { icon: Activity, text: "Walk 10,000 steps for longevity", color: "#f472b6" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [gymWeekly, setGymWeekly] = useState(null);
  const [moneyMonthly, setMoneyMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    Promise.all([
      api.get('/gym/weekly').catch(() => null),
      api.get('/money/monthly').catch(() => null),
    ]).then(([g, m]) => {
      if (g) setGymWeekly(g.data);
      if (m) setMoneyMonthly(m.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const savingsRate = moneyMonthly && user?.monthlySalary > 0
    ? Math.round((moneyMonthly.savings / user.monthlySalary) * 100)
    : 0;

  const calorieProgress = gymWeekly?.logs?.[0]
    ? Math.min(Math.round((gymWeekly.logs[0].totalCalories / user?.dailyCalories) * 100), 100)
    : 0;

  const proteinProgress = gymWeekly?.logs?.[0]
    ? Math.min(Math.round((gymWeekly.logs[0].totalProtein / user?.dailyProtein) * 100), 100)
    : 0;

  const TipIcon = tip.icon;

  return (
    <div className="dashboard-page animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="dash-hero">
        <img src="/images/dashboard_hero.png" alt="Dashboard Hero" className="dash-hero-img" />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-content">
          <div className="dash-hero-greeting">
            <span className="dash-greeting-badge">
              <Sun size={14} /> {greeting}
            </span>
            <h1 className="dash-hero-title">
              Welcome back, <span className="dash-hero-name">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="dash-hero-quote">"{quote}"</p>
          </div>
          <div className="dash-hero-streak">
            <Flame size={28} color="#C8F135" />
            <div>
              <div className="dash-streak-num">{user?.gymStreak || 0}</div>
              <div className="dash-streak-label">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="dashboard-stats-row">
        <StatCard icon={Target}    label="Calorie Target"  value={`${user?.dailyCalories ?? 0} kcal`}  color="#FF6B35" />
        <StatCard icon={Dumbbell}  label="Protein Target"  value={`${user?.dailyProtein ?? 0}g`}        color="#C4B5FD" />
        <StatCard icon={Banknote}  label="Monthly Salary"  value={`₹${(user?.monthlySalary || 0).toLocaleString('en-IN')}`} color="#C8F135" />
        <StatCard icon={Landmark}  label="Net Savings"     value={`₹${(moneyMonthly?.savings || 0).toLocaleString('en-IN')}`} color={moneyMonthly?.savings >= 0 ? '#C8F135' : '#FF4D4D'} />
        <StatCard icon={CheckCircle} label="Days On Target" value={`${gymWeekly?.daysGoalMet || 0}/${gymWeekly?.totalDays || 0}`} color="#38bdf8" />
        <StatCard icon={TrendingUp} label="Savings Rate"   value={`${savingsRate}%`}                    color={savingsRate >= 20 ? '#C8F135' : savingsRate >= 10 ? '#C4B5FD' : '#FF4D4D'} />
      </div>

      {/* ── Middle Grid: Today's Progress + Quick Actions + Tip ── */}
      <div className="dash-mid-grid">

        {/* Today's progress */}
        <div className="dash-progress-card glass-card">
          <div className="dash-section-header">
            <Zap size={18} color="#C8F135" />
            <h3>Today's Progress</h3>
            <span className="badge badge-gym">Live</span>
          </div>

          <div className="dash-progress-list">
            <ProgressItem label="Calories" value={`${gymWeekly?.logs?.[0]?.totalCalories?.toFixed(0) ?? 0} / ${user?.dailyCalories} kcal`} pct={calorieProgress} color="#FF6B35" />
            <ProgressItem label="Protein"  value={`${gymWeekly?.logs?.[0]?.totalProtein?.toFixed(1) ?? 0} / ${user?.dailyProtein}g`}        pct={proteinProgress} color="#C4B5FD" />
            <ProgressItem label="Savings Rate" value={`${savingsRate}%`}
              pct={Math.min(savingsRate * 2, 100)}
              color={savingsRate >= 20 ? '#C8F135' : '#FF4D4D'}
            />
          </div>

          <div className="dash-goal-badge">
            <Award size={16} color="#C8F135" />
            <span>Goal: <strong>{user?.fitnessGoal?.replace('_', ' ')}</strong></span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="dash-actions-card glass-card">
          <div className="dash-section-header">
            <Calendar size={18} color="#C4B5FD" />
            <h3>Quick Actions</h3>
          </div>
          <div className="dash-action-list">
            <ActionLink href="/gym"   icon={Utensils} label="Log a Meal"       sub="Track nutrition" color="#C8F135" />
            <ActionLink href="/money" icon={Banknote}  label="Log an Expense"   sub="Track spending"  color="#C4B5FD" />
            <ActionLink href="/profile" icon={Target}   label="Update Profile"   sub="Recalculate targets" color="#38bdf8" />
          </div>
        </div>

        {/* Daily tip */}
        <div className="dash-tip-card glass-card">
          <div className="dash-section-header">
            <Zap size={18} color="#fbbf24" />
            <h3>Today's Tip</h3>
          </div>
          <div className="dash-tip-body">
            <div className="dash-tip-icon-wrap" style={{ background: `${tip.color}18`, border: `1px solid ${tip.color}30` }}>
              <TipIcon size={28} color={tip.color} />
            </div>
            <p className="dash-tip-text">{tip.text}</p>
          </div>
        </div>
      </div>

      {/* ── Weekly Summary Cards ── */}
      <div className="dash-weekly-grid">
        <div className="dash-weekly-card glass-card gym-accent-card">
          <div className="dash-weekly-img-wrap">
            <img src="/images/gym_hero.png" alt="Gym" className="dash-weekly-img" />
            <div className="dash-weekly-img-overlay" />
          </div>
          <div className="dash-weekly-body">
            <span className="badge badge-gym">Gym Tracker</span>
            <h3>Weekly Nutrition</h3>
            <div className="dash-weekly-stats">
              <div><span className="dash-wk-val" style={{ color: '#C8F135' }}>{gymWeekly?.totalDays ?? 0}</span><span className="dash-wk-lbl">Days Logged</span></div>
              <div><span className="dash-wk-val" style={{ color: '#FF6B35' }}>{gymWeekly?.avgCalories?.toFixed(0) ?? 0}</span><span className="dash-wk-lbl">Avg kcal/day</span></div>
              <div><span className="dash-wk-val" style={{ color: '#C4B5FD' }}>{gymWeekly?.daysGoalMet ?? 0}</span><span className="dash-wk-lbl">Goals Met</span></div>
            </div>
            <a href="/gym" className="dash-weekly-cta btn btn-gym">
              Log Meal <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="dash-weekly-card glass-card money-accent-card">
          <div className="dash-weekly-img-wrap">
            <img src="/images/money_hero.png" alt="Money" className="dash-weekly-img" />
            <div className="dash-weekly-img-overlay money-overlay" />
          </div>
          <div className="dash-weekly-body">
            <span className="badge badge-money">Finance Tracker</span>
            <h3>Monthly Finance</h3>
            <div className="dash-weekly-stats">
              <div><span className="dash-wk-val" style={{ color: '#C4B5FD' }}>₹{(moneyMonthly?.totalExpenses || 0).toLocaleString('en-IN')}</span><span className="dash-wk-lbl">Spent</span></div>
              <div><span className="dash-wk-val" style={{ color: '#C8F135' }}>₹{(moneyMonthly?.savings || 0).toLocaleString('en-IN')}</span><span className="dash-wk-lbl">Saved</span></div>
              <div><span className="dash-wk-val" style={{ color: savingsRate >= 20 ? '#C8F135' : '#FF4D4D' }}>{savingsRate}%</span><span className="dash-wk-lbl">Rate</span></div>
            </div>
            <a href="/money" className="dash-weekly-cta btn btn-money">
              Log Expense <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* ── BMR / TDEE Info Card ── */}
      <div className="dash-bmr-card glass-card">
        <div className="dash-section-header">
          <Activity size={18} color="#C8F135" />
          <h3>Your Body Metrics</h3>
          <span className="badge badge-brand">Mifflin-St Jeor</span>
        </div>
        <div className="dash-bmr-grid">
          <MetricTile label="Weight"   value={`${user?.weight ?? '—'} kg`}   color="#C8F135" />
          <MetricTile label="Height"   value={`${user?.height ?? '—'} cm`}   color="#C4B5FD" />
          <MetricTile label="Age"      value={`${user?.age ?? '—'} yrs`}     color="#38bdf8" />
          <MetricTile label="Activity" value={user?.activityLevel?.replace('_', ' ') ?? '—'} color="#fbbf24" />
          <MetricTile label="Daily Cal Target" value={`${user?.dailyCalories ?? 0} kcal`} color="#FF6B35" />
          <MetricTile label="Daily Protein"    value={`${user?.dailyProtein ?? 0}g`}      color="#C4B5FD" />
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="dashboard-stat-card glass-card">
      <Icon size={22} color={color} style={{ marginBottom: 4 }} />
      <span className="dashboard-stat-label">{label}</span>
      <span className="dashboard-stat-value" style={{ color }}>{value}</span>
    </div>
  );
}

function ProgressItem({ label, value, pct, color }) {
  return (
    <div className="dash-progress-item">
      <div className="dash-progress-top">
        <span className="dash-progress-label">{label}</span>
        <span className="dash-progress-value" style={{ color }}>{value}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="dash-progress-pct">{pct}%</span>
    </div>
  );
}

function ActionLink({ icon: Icon, label, sub, color }) {
  return (
    <div className="dash-action-item">
      <div className="dash-action-icon" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="dash-action-text">
        <span className="dash-action-label">{label}</span>
        <span className="dash-action-sub">{sub}</span>
      </div>
      <ArrowRight size={16} color="rgba(255,255,255,0.25)" />
    </div>
  );
}

function MetricTile({ label, value, color }) {
  return (
    <div className="dash-metric-tile">
      <span className="dash-metric-label">{label}</span>
      <span className="dash-metric-value" style={{ color }}>{value}</span>
    </div>
  );
}
