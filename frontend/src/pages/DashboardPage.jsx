import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Target, Dumbbell, Banknote, Landmark, Flame, CheckCircle, BarChart2, Receipt } from 'lucide-react';
import './DashboardPage.css';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11, family: 'Monda' } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11, family: 'Monda' } } },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [gymWeekly, setGymWeekly] = useState(null);
  const [moneyMonthly, setMoneyMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/gym/weekly').catch(() => null),
      api.get('/money/monthly').catch(() => null),
    ]).then(([g, m]) => {
      if (g) setGymWeekly(g.data);
      if (m) setMoneyMonthly(m.data);
    }).finally(() => setLoading(false));
  }, []);

  // Gym: 7-day calorie chart
  const gymLabels = gymWeekly?.logs?.map(l => {
    const d = new Date(l.date);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  }).reverse() ?? [];

  const gymCalorieData = gymWeekly?.logs?.map(l => l.totalCalories).reverse() ?? [];
  const gymProteinData = gymWeekly?.logs?.map(l => l.totalProtein).reverse() ?? [];

  // Money: category doughnut
  const moneyCategories = moneyMonthly?.categoryBreakdown ?? {};
  const moneyCatLabels = Object.keys(moneyCategories);
  const moneyCatValues = Object.values(moneyCategories);
  const DOUGHNUT_COLORS = ['#8b5cf6','#f59e0b','#22d3a5','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Quick stats row */}
      <div className="dashboard-stats-row">
        <StatCard
          icon={Target} label="Daily Calories Target"
          value={`${user?.dailyCalories} kcal`} color="var(--color-calories)"
        />
        <StatCard
          icon={Dumbbell} label="Daily Protein Target"
          value={`${user?.dailyProtein}g`} color="var(--color-protein)"
        />
        <StatCard
          icon={Banknote} label="Monthly Salary"
          value={`₹${(user?.monthlySalary || 0).toLocaleString('en-IN')}`} color="var(--money-primary)"
        />
        <StatCard
          icon={Landmark} label="Current Savings"
          value={`₹${(moneyMonthly?.savings || 0).toLocaleString('en-IN')}`}
          color={moneyMonthly?.savings >= 0 ? 'var(--gym-primary)' : 'var(--danger)'}
        />
        <StatCard
          icon={Flame} label="Gym Streak"
          value={`${user?.gymStreak || 0} days`} color="#f97316"
        />
        <StatCard
          icon={CheckCircle} label="Days On Target (7d)"
          value={`${gymWeekly?.daysGoalMet || 0}/${gymWeekly?.totalDays || 0}`} color="var(--brand-primary)"
        />
      </div>

      {/* Charts row */}
      <div className="dashboard-charts-row">
        {/* Calorie chart */}
        <div className="dashboard-chart-card glass-card">
          <div className="dashboard-chart-header">
            <h3><Flame size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6, color: '#f97316' }}/>Calorie Intake (Last 7 Days)</h3>
            <span className="badge badge-gym">vs {user?.dailyCalories} kcal target</span>
          </div>
          {gymCalorieData.length > 0 ? (
            <div className="chart-wrapper">
              <Bar
                data={{
                  labels: gymLabels,
                  datasets: [
                    {
                      label: 'Calories',
                      data: gymCalorieData,
                      backgroundColor: 'rgba(249,115,22,0.6)',
                      borderColor: '#f97316',
                      borderWidth: 1,
                      borderRadius: 6,
                    },
                    {
                      label: 'Target',
                      data: gymCalorieData.map(() => user?.dailyCalories),
                      type: 'line',
                      borderColor: 'rgba(139,92,246,0.7)',
                      borderDash: [5, 5],
                      borderWidth: 2,
                      pointRadius: 0,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  ...CHART_DEFAULTS,
                  plugins: {
                    ...CHART_DEFAULTS.plugins,
                    legend: { display: true, labels: { color: '#94a3b8', font: { size: 11, family: 'Monda' } } },
                  },
                }}
              />
            </div>
          ) : (
            <div className="empty-state">
              <BarChart2 size={48} className="empty-state-icon" />
              <div className="empty-state-title">No gym data yet</div>
              <div className="empty-state-desc">Start logging meals in the Gym Tracker</div>
            </div>
          )}
        </div>

        {/* Money doughnut */}
        <div className="dashboard-chart-card glass-card">
          <div className="dashboard-chart-header">
            <h3><Banknote size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6, color: '#f59e0b' }}/>Spending Breakdown</h3>
            <span className="badge badge-money">This month</span>
          </div>
          {moneyCatLabels.length > 0 ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: '100%' }}>
              <div className="chart-wrapper" style={{ flex: 1 }}>
                <Doughnut
                  data={{
                    labels: moneyCatLabels,
                    datasets: [{
                      data: moneyCatValues,
                      backgroundColor: DOUGHNUT_COLORS.slice(0, moneyCatLabels.length),
                      borderColor: 'transparent',
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ₹${ctx.raw.toLocaleString('en-IN')}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="donut-legend">
                {moneyCatLabels.map((label, i) => (
                  <div key={label} className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ background: DOUGHNUT_COLORS[i] }} />
                    <span className="donut-legend-label">{label}</span>
                    <span className="donut-legend-value">₹{moneyCatValues[i].toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Receipt size={48} className="empty-state-icon" />
              <div className="empty-state-title">No expenses tracked</div>
              <div className="empty-state-desc">Log expenses in the Money Tracker</div>
            </div>
          )}
        </div>
      </div>

      {/* Protein trend */}
      {gymProteinData.length > 0 && (
        <div className="dashboard-chart-card glass-card">
          <div className="dashboard-chart-header">
            <h3><Dumbbell size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6, color: '#3b82f6' }}/>Protein Intake Trend (Last 7 Days)</h3>
            <span className="badge badge-brand">Target: {user?.dailyProtein}g/day</span>
          </div>
          <div className="chart-wrapper" style={{ height: 160 }}>
            <Line
              data={{
                labels: gymLabels,
                datasets: [
                  {
                    label: 'Protein (g)',
                    data: gymProteinData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4,
                  },
                  {
                    label: 'Target',
                    data: gymProteinData.map(() => user?.dailyProtein),
                    borderColor: 'rgba(139,92,246,0.5)',
                    borderDash: [5,5],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                  },
                ],
              }}
              options={{
                ...CHART_DEFAULTS,
                plugins: {
                  legend: { display: true, labels: { color: '#94a3b8', font: { size: 11, family: 'Monda' } } },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="dashboard-stat-card glass-card">
      <Icon size={24} className="dashboard-stat-icon" color={color} style={{ marginBottom: 4 }} />
      <span className="dashboard-stat-label">{label}</span>
      <span className="dashboard-stat-value" style={{ color }}>{value}</span>
    </div>
  );
}
