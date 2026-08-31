import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Target, Dumbbell, Banknote, Landmark, Flame, CheckCircle,
  TrendingUp, Zap, Award, ArrowRight, Activity, Sun,
  Beef, Wheat, Droplets, Salad, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, X
} from 'lucide-react';
import './DashboardPage.css';

const MOTIVATIONAL_QUOTES = [
  "Every rep counts. Every meal matters. Keep pushing.",
  "Your streak is your legacy. Don't break the chain.",
  "Discipline is choosing what you want most over what you want now.",
  "Small daily improvements lead to staggering long-term results.",
  "The body achieves what the mind believes.",
];

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame,    color: '#FF6B35', targetKey: 'dailyCalories' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    icon: Beef,     color: '#C4B5FD', targetKey: 'dailyProtein' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    icon: Wheat,    color: '#fbbf24', targetKey: 'dailyCarbs' },
  { key: 'fats',     label: 'Fats',     unit: 'g',    icon: Droplets, color: '#f472b6', targetKey: 'dailyFats' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',    icon: Salad,    color: '#C8F135', targetKey: 'dailyFiber' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [gymWeekly, setGymWeekly]     = useState(null);
  const [todayGym, setTodayGym]       = useState(null);
  const [moneyMonthly, setMoneyMonthly] = useState(null);
  const [gymHistory, setGymHistory]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [greeting, setGreeting] = useState('');
  const [calMonth, setCalMonth] = useState(new Date());
  const [dayViews, setDayViews] = useState({});

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    Promise.all([
      api.get('/gym/weekly').catch(() => null),
      api.get('/gym/today').catch(() => null),
      api.get('/money/monthly').catch(() => null),
      api.get('/gym/history?days=60').catch(() => null),
    ]).then(([g, t, m, h]) => {
      if (g) setGymWeekly(g.data);
      if (t) setTodayGym(t.data);
      if (m) setMoneyMonthly(m.data);
      if (h) setGymHistory(h.data.logs);
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

  // 7-day heatmap: map gymWeekly logs to last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const weeklyLogsByDate = {};
  (gymWeekly?.logs || []).forEach(l => { weeklyLogsByDate[l.date] = l; });

  // Calendar logic
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(calMonth);
  const firstDay = getFirstDayOfMonth(calMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const historyMap = {};
  gymHistory.forEach(log => { historyMap[log.date] = log; });

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
        <StatCard icon={Target}     label="Calorie Target"  value={`${user?.dailyCalories ?? 0} kcal`} color="#FF6B35" />
        <StatCard icon={Dumbbell}   label="Protein Target"  value={`${user?.dailyProtein ?? 0}g`}       color="#C4B5FD" />
        <StatCard icon={Banknote}   label="Monthly Salary"  value={`₹${(user?.monthlySalary || 0).toLocaleString('en-IN')}`} color="#C8F135" />
        <StatCard icon={Landmark}   label="Net Savings"     value={`₹${(moneyMonthly?.savings || 0).toLocaleString('en-IN')}`} color={moneyMonthly?.savings >= 0 ? '#C8F135' : '#FF4D4D'} />
        <StatCard icon={CheckCircle} label="Days On Target" value={`${gymWeekly?.daysGoalMet || 0}/${gymWeekly?.totalDays || 0}`} color="#38bdf8" />
        <StatCard icon={TrendingUp} label="Savings Rate"    value={`${savingsRate}%`} color={savingsRate >= 20 ? '#C8F135' : savingsRate >= 10 ? '#C4B5FD' : '#FF4D4D'} />
      </div>

      {/* ── Middle Grid: Today's Macros + Calendar ── */}
      <div className="dash-mid-grid">

        {/* Today's Full Macro Detail */}
        <div className="dash-macro-card glass-card">
          <div className="dash-section-header">
            <Zap size={18} color="#C8F135" />
            <h3>Today's Nutrition</h3>
            <span className="badge badge-gym">Live</span>
          </div>
          <div className="dash-macro-list">
            {MACRO_CONFIG.map(({ key, label, unit, icon: Icon, color, targetKey }) => {
              const consumed  = todayGym?.consumed?.[key] ?? 0;
              const target    = user?.[targetKey] ?? 1;
              const remaining = Math.max(target - consumed, 0);
              const pct       = Math.min(Math.round((consumed / target) * 100), 100);
              return (
                <div key={key} className="dash-macro-row">
                  <div className="dash-macro-icon" style={{ background: `${color}15` }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div className="dash-macro-info">
                    <div className="dash-macro-top">
                      <span className="dash-macro-label">{label}</span>
                      <span className="dash-macro-nums">
                        <span style={{ color, fontWeight: 700 }}>{consumed.toFixed(key === 'calories' ? 0 : 1)}</span>
                        <span className="dash-macro-sep">/ {target}{unit}</span>
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="dash-macro-rem">
                      {remaining > 0
                        ? <span>{remaining.toFixed(key === 'calories' ? 0 : 1)}{unit} remaining</span>
                        : <span style={{ color: '#C8F135' }}>✓ Target reached!</span>}
                      <span className="dash-macro-pct">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="dash-goal-badge">
            <Award size={15} color="#C8F135" />
            <span>Goal: <strong>{user?.fitnessGoal?.replace(/_/g, ' ')}</strong></span>
          </div>
        </div>

        {/* Stylish Calendar */}
        <div className="dash-calendar-card glass-card">
          <div className="dash-cal-header">
            <div className="dash-cal-title">
              <CalendarIcon size={18} color="#C4B5FD" />
              <h3>Activity Calendar</h3>
            </div>
            <div className="dash-cal-nav">
              <button onClick={handlePrevMonth} className="dash-cal-btn"><ChevronLeft size={16} /></button>
              <span className="dash-cal-month">{monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
              <button onClick={handleNextMonth} className="dash-cal-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
          
          <div className="dash-cal-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="dash-cal-dow">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="dash-cal-day empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth()+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const log = historyMap[dateStr];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              let statusClass = 'none';
              let calPct=0, proPct=0, fatPct=0, fibPct=0;
              
              if (log) {
                const pct = (log.totalCalories / (user?.dailyCalories || 1)) * 100;
                if (pct >= 90) statusClass = 'perfect';
                else if (pct >= 50) statusClass = 'good';
                else statusClass = 'low';
                
                calPct = Math.min((log.totalCalories / (user?.dailyCalories || 1)) * 100, 100).toFixed(0);
                proPct = Math.min((log.totalProtein / (user?.dailyProtein || 1)) * 100, 100).toFixed(0);
                fatPct = Math.min((log.totalFats / (user?.dailyFats || 1)) * 100, 100).toFixed(0);
                fibPct = Math.min((log.totalFiber / (user?.dailyFiber || 1)) * 100, 100).toFixed(0);
              }
              
              const viewIndex = dayViews[dateStr] || 0;
              
              return (
                <div key={day} className={`dash-cal-day status-${statusClass} ${isToday ? 'is-today' : ''}`}>
                  {viewIndex === 0 && <span className="dash-cal-date animate-fade-in">{day}</span>}
                  
                  {viewIndex === 1 && (
                    <div className="dash-cal-inline-macro animate-fade-in" style={{color: '#FF6B35'}}>
                      <Flame size={12} /><span>{calPct}%</span>
                    </div>
                  )}
                  {viewIndex === 2 && (
                    <div className="dash-cal-inline-macro animate-fade-in" style={{color: '#C4B5FD'}}>
                      <Beef size={12} /><span>{proPct}%</span>
                    </div>
                  )}
                  {viewIndex === 3 && (
                    <div className="dash-cal-inline-macro animate-fade-in" style={{color: '#f472b6'}}>
                      <Droplets size={12} /><span>{fatPct}%</span>
                    </div>
                  )}
                  {viewIndex === 4 && (
                    <div className="dash-cal-inline-macro animate-fade-in" style={{color: '#C8F135'}}>
                      <Salad size={12} /><span>{fibPct}%</span>
                    </div>
                  )}

                  {log && (
                    <>
                      <button className="dash-cal-cycle-btn" onClick={(e) => {
                        e.stopPropagation();
                        setDayViews(prev => ({ ...prev, [dateStr]: ((prev[dateStr] || 0) + 1) % 5 }));
                      }}>
                      </button>
                      {viewIndex === 0 && <span className="dash-cal-dot animate-fade-in" />}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="dash-cal-legend">
            <span className="dash-cal-leg-item"><span className="dash-cal-dot-leg perfect" /> Target Hit</span>
            <span className="dash-cal-leg-item"><span className="dash-cal-dot-leg good" /> Partial</span>
            <span className="dash-cal-leg-item"><span className="dash-cal-dot-leg none" /> Missed</span>
          </div>
        </div>
      </div>

      {/* ── 7-Day Calorie Heatmap ── */}
      <div className="dash-heatmap-card glass-card">
        <div className="dash-section-header">
          <Activity size={18} color="#C8F135" />
          <h3>7-Day Calorie Streak</h3>
          <span className="badge badge-brand">Target: {user?.dailyCalories} kcal/day</span>
        </div>
        <div className="dash-heatmap">
          {last7Days.map((date) => {
            const log  = weeklyLogsByDate[date];
            const kcal = log?.totalCalories ?? 0;
            const pct  = Math.min((kcal / (user?.dailyCalories || 1)) * 100, 100);
            const today = date === new Date().toISOString().split('T')[0];
            const color = !log
              ? 'rgba(255,255,255,0.05)'
              : pct >= 90  ? '#C8F135'
              : pct >= 60  ? '#fbbf24'
              : '#FF4D4D';
            const label = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
            const dayNum = new Date(date + 'T00:00:00').getDate();
            return (
              <div key={date} className={`dash-heat-col ${today ? 'heat-today' : ''}`}>
                <div className="dash-heat-bar-wrap">
                  <div className="dash-heat-bar" style={{ background: color, height: `${Math.max(pct, 6)}%` }} />
                </div>
                <div className="dash-heat-kcal">{log ? `${Math.round(kcal)}` : '—'}</div>
                <div className="dash-heat-day" style={{ color: today ? '#C8F135' : undefined }}>{label}</div>
                <div className="dash-heat-date" style={{ color: today ? '#C8F135' : undefined }}>{dayNum}</div>
              </div>
            );
          })}
        </div>
        <div className="dash-heatmap-legend">
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: '#C8F135' }} />On target (≥90%)</span>
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: '#fbbf24' }} />Partial (60–90%)</span>
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: '#FF4D4D' }} />Below target</span>
          <span className="dash-legend-item"><span className="dash-legend-dot" style={{ background: 'rgba(255,255,255,0.1)' }} />No data</span>
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
              <div><span className="dash-wk-val" style={{ color: '#FF6B35' }}>{gymWeekly?.avg?.calories?.toFixed(0) ?? 0}</span><span className="dash-wk-lbl">Avg kcal/day</span></div>
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

      {/* ── Body Metrics ── */}
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
          <MetricTile label="Activity" value={user?.activityLevel?.replace(/_/g, ' ') ?? '—'} color="#fbbf24" />
          <MetricTile label="Cal Target" value={`${user?.dailyCalories ?? 0} kcal`} color="#FF6B35" />
          <MetricTile label="Protein"  value={`${user?.dailyProtein ?? 0}g`} color="#C4B5FD" />
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

function MetricTile({ label, value, color }) {
  return (
    <div className="dash-metric-tile">
      <span className="dash-metric-label">{label}</span>
      <span className="dash-metric-value" style={{ color }}>{value}</span>
    </div>
  );
}
