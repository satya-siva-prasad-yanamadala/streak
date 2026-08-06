import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/Chat/ChatWindow';
import MacroRings from '../components/Dashboard/MacroRings';
import { Utensils } from 'lucide-react';
import api from '../utils/api';
import './GymPage.css';

const GYM_QUICK_REPLIES = [
  '2 boiled eggs and 100g oats with milk',
  '200g grilled chicken with rice',
  '1 banana and protein shake',
  '100g paneer with 2 rotis',
];

export default function GymPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [meals, setMeals] = useState([]);

  const fetchToday = useCallback(async () => {
    try {
      const { data } = await api.get('/gym/today');
      setTodayData(data);
      if (data.log) setMeals(data.log.meals || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchToday();
    // Welcome message
    setMessages([{
      role: 'bot',
      content: `Hi **${user?.name?.split(' ')[0]}**! I'm your nutrition assistant.\n\nYour daily targets:\n- **${user?.dailyCalories} kcal**\n- **${user?.dailyProtein}g** protein\n- **${user?.dailyCarbs}g** carbs\n- **${user?.dailyFats}g** fats\n\nTell me what you've eaten and I'll track your macros!`,
      timestamp: new Date(),
    }]);
  }, [user, fetchToday]);

  const handleSend = async (input) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input, timestamp: new Date() }]);
    setLoading(true);

    try {
      const { data } = await api.post('/gym/log', { input });

      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.message,
        timestamp: new Date(),
        data: data.data,
      }]);

      if (data.recognized) {
        await fetchToday();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `Error: ${err.response?.data?.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const targets = {
    dailyCalories: user?.dailyCalories,
    dailyProtein:  user?.dailyProtein,
    dailyCarbs:    user?.dailyCarbs,
    dailyFats:     user?.dailyFats,
    dailyFiber:    user?.dailyFiber,
  };

  return (
    <div className="tracker-layout">
      {/* Chat panel */}
      <ChatWindow
        messages={messages}
        onSend={handleSend}
        loading={loading}
        placeholder="What did you eat? e.g. '2 eggs and 100g oats with milk'"
        accentClass="gym"
        quickReplies={GYM_QUICK_REPLIES}
      />

      {/* Right panel */}
      <div className="gym-right-panel">
        {/* Macro rings */}
        <MacroRings
          consumed={todayData?.consumed}
          targets={targets}
          percentConsumed={todayData?.percentConsumed}
        />

        {/* Today's meals list */}
        <div className="gym-meals-panel glass-card">
          <div className="gym-meals-header">
            <h3>Today's Meals</h3>
            <span className="badge badge-gym">{meals.length} items</span>
          </div>

          {meals.length === 0 ? (
            <div className="empty-state">
              <Utensils size={48} className="empty-state-icon" />
              <div className="empty-state-title">No meals logged yet</div>
              <div className="empty-state-desc">Start chatting to log your food</div>
            </div>
          ) : (
            <div className="gym-meals-list">
              {meals.map((meal, i) => (
                <div key={i} className="gym-meal-item">
                  <div className="gym-meal-name">{meal.name}</div>
                  <div className="gym-meal-details">
                    <span>{meal.quantity}g</span>
                    <span className="meal-cal">{meal.calories.toFixed(0)} kcal</span>
                    <span className="meal-prot">{meal.protein.toFixed(1)}g P</span>
                  </div>
                </div>
              ))}

              {/* Totals row */}
              {todayData?.consumed && (
                <div className="gym-meal-totals">
                  <span className="gym-meal-totals-label">Total</span>
                  <div className="gym-meal-details">
                    <span className="meal-cal">{todayData.consumed.calories?.toFixed(0)} kcal</span>
                    <span className="meal-prot">{todayData.consumed.protein?.toFixed(1)}g P</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
