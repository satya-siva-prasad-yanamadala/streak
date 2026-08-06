import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/Chat/ChatWindow';
import { Wallet, Receipt, Landmark, BarChart2, TrendingUp, Banknote } from 'lucide-react';
import api from '../utils/api';
import './MoneyPage.css';

const MONEY_QUICK_REPLIES = [
  'Spent 300 on lunch',
  'Paid 500 for auto fare',
  'Bought groceries for 800',
  'Received 2000 freelance',
];

export default function MoneyPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthData, setMonthData] = useState(null);

  const fetchMonthly = useCallback(async () => {
    try {
      const { data } = await api.get('/money/monthly');
      setMonthData(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchMonthly();
    setMessages([{
      role: 'bot',
      content: `Hi **${user?.name?.split(' ')[0]}**! I'm your finance assistant.\n\nYour monthly salary: **₹${(user?.monthlySalary || 0).toLocaleString('en-IN')}**\n\nTell me what you spent or earned and I'll track your savings!\n\nExamples:\n• *"Spent 500 on lunch"*\n• *"Paid 1200 electricity bill"*\n• *"Received 3000 freelance payment"*`,
      timestamp: new Date(),
    }]);
  }, [user, fetchMonthly]);

  const handleSend = async (input) => {
    setMessages(prev => [...prev, { role: 'user', content: input, timestamp: new Date() }]);
    setLoading(true);

    try {
      const { data } = await api.post('/money/log', { input });
      setMessages(prev => [...prev, { role: 'bot', content: data.message, timestamp: new Date() }]);
      if (data.recognized) await fetchMonthly();
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `Error: ${err.response?.data?.message || 'Something went wrong.'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const savingsRate = monthData && user?.monthlySalary > 0
    ? Math.round((monthData.savings / user.monthlySalary) * 100)
    : 0;

  return (
    <div className="money-page-wrap">
      {/* Hero Banner */}
      <div className="page-hero money-hero">
        <img src="/images/money_hero.png" alt="Finance" className="page-hero-img" />
        <div className="page-hero-overlay money-page-overlay" />
        <div className="page-hero-content">
          <div className="page-hero-badge" style={{ background: 'rgba(196,181,253,0.12)', borderColor: 'rgba(196,181,253,0.28)', color: 'var(--lavender)' }}>
            <TrendingUp size={14} /> Finance Tracker
          </div>
          <h1 className="page-hero-title">Grow Your <span style={{ color: 'var(--lavender)' }}>Wealth</span></h1>
          <p className="page-hero-sub">Track expenses and monitor your savings goals</p>
        </div>
        <div className="page-hero-stat" style={{ background: 'rgba(196,181,253,0.10)', borderColor: 'rgba(196,181,253,0.25)' }}>
          <Banknote size={22} color="var(--lavender)" />
          <div>
            <div className="page-hero-stat-val" style={{ color: 'var(--lavender)' }}>₹{(user?.monthlySalary || 0).toLocaleString('en-IN')}</div>
            <div className="page-hero-stat-lbl">Monthly Salary</div>
          </div>
        </div>
      </div>

      <div className="tracker-layout">
      {/* Chat panel */}
      <ChatWindow
        messages={messages}
        onSend={handleSend}
        loading={loading}
        placeholder='e.g. "Spent 500 on food" or "Received 2000 from client"'
        accentClass="money"
        quickReplies={MONEY_QUICK_REPLIES}
      />

      {/* Right panel */}
      <div className="money-right-panel">
        {/* Savings summary */}
        <div className="money-summary glass-card">
          <h3 className="money-summary-title">This Month</h3>

          <div className="money-summary-row">
            <div className="money-stat salary">
              <Wallet className="money-stat-icon" size={24} color="#8b5cf6" style={{ marginBottom: 4 }} />
              <span className="money-stat-label">Monthly Salary</span>
              <span className="money-stat-value">₹{(user?.monthlySalary || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="money-stat expense">
              <Receipt className="money-stat-icon" size={24} color="#ef4444" style={{ marginBottom: 4 }} />
              <span className="money-stat-label">Total Spent</span>
              <span className="money-stat-value">₹{(monthData?.totalExpenses || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className={`money-stat savings ${savingsRate < 10 ? 'low' : savingsRate >= 30 ? 'high' : ''}`}>
              <Landmark className="money-stat-icon" size={24} color={savingsRate < 10 ? '#ef4444' : savingsRate >= 30 ? '#10b981' : '#f59e0b'} style={{ marginBottom: 4 }} />
              <span className="money-stat-label">Net Savings</span>
              <span className="money-stat-value">₹{(monthData?.savings || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Savings rate gauge */}
          <div className="savings-gauge">
            <div className="savings-gauge-header">
              <span className="savings-gauge-label">Savings Rate</span>
              <span className="savings-gauge-value" style={{ color: savingsRate >= 20 ? 'var(--gym-primary)' : savingsRate >= 10 ? 'var(--money-primary)' : 'var(--danger)' }}>
                {savingsRate}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(savingsRate, 100)}%`,
                  background: savingsRate >= 20 ? 'var(--gym-primary)' : savingsRate >= 10 ? 'var(--money-primary)' : 'var(--danger)',
                }}
              />
            </div>
            <div className="savings-gauge-hint">
              {savingsRate >= 30 ? 'Excellent savings!' : savingsRate >= 20 ? 'Good savings rate' : savingsRate >= 10 ? 'Try to save more' : 'Very low savings'}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="money-categories glass-card">
          <h3 className="money-category-title">Spending by Category</h3>
          {!monthData?.categoryBreakdown || Object.keys(monthData.categoryBreakdown).length === 0 ? (
            <div className="empty-state">
              <BarChart2 size={48} className="empty-state-icon" />
              <div className="empty-state-title">No expenses yet</div>
              <div className="empty-state-desc">Log an expense to see category breakdown</div>
            </div>
          ) : (
            <div className="money-category-list">
              {Object.entries(monthData.categoryBreakdown)
                .sort(([,a],[,b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = monthData.totalExpenses > 0
                    ? Math.round((amount / monthData.totalExpenses) * 100)
                    : 0;
                  return (
                    <div key={cat} className="money-category-item">
                      <div className="money-category-top">
                        <span className="money-category-name">{cat}</span>
                        <span className="money-category-amount">₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'var(--money-primary)' }} />
                      </div>
                      <span className="money-category-pct">{pct}% of expenses</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
