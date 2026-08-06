import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Dumbbell, Wallet, BarChart2, Rocket, User, Flame, Scale } from 'lucide-react';
import './AuthPage.css';

const ACTIVITY_LEVELS = [
  { value: 'sedentary',         label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active',    label: 'Lightly Active (1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
  { value: 'very_active',       label: 'Very Active (6-7 days/week)' },
  { value: 'extra_active',      label: 'Extra Active (athlete/physical job)' },
];

const FITNESS_GOALS = [
  { value: 'lose_weight',  label: 'Lose Weight', icon: Flame, desc: 'Calorie deficit diet' },
  { value: 'maintain',     label: 'Maintain',    icon: Scale, desc: 'Balanced nutrition' },
  { value: 'gain_muscle',  label: 'Gain Muscle', icon: Dumbbell, desc: 'High protein, calorie surplus' },
];

const initialRegister = {
  name: '', email: '', password: '', confirmPassword: '',
  weight: '', height: '', age: '', gender: 'male',
  activityLevel: 'moderately_active', fitnessGoal: 'maintain',
  monthlySalary: '',
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // registration: 2 steps
  const [formData, setFormData] = useState(initialRegister);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegisterStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-mesh" />

      <div className="auth-container animate-fade-in-up">
        {/* Left panel */}
        <div className="auth-panel-left">
          <div className="auth-brand">
            <Zap className="auth-brand-icon" size={28} color="#06B6D4" />
            <h1 className="auth-brand-name">Streak</h1>
          </div>
          <h2 className="auth-tagline">Track. Improve. Repeat.</h2>
          <p className="auth-desc">Your AI-powered companion for daily gym nutrition and financial tracking.</p>

          <div className="auth-features">
            <div className="auth-feature">
              <Dumbbell className="auth-feature-icon" size={24} color="#8B5CF6" />
              <div>
                <div className="auth-feature-title">Gym Nutrition</div>
                <div className="auth-feature-desc">Log meals, track macros</div>
              </div>
            </div>
            <div className="auth-feature">
              <Wallet className="auth-feature-icon" size={24} color="#06B6D4" />
              <div>
                <div className="auth-feature-title">Money Tracker</div>
                <div className="auth-feature-desc">Monitor savings & expenses</div>
              </div>
            </div>
            <div className="auth-feature">
              <BarChart2 className="auth-feature-icon" size={24} color="#10B981" />
              <div>
                <div className="auth-feature-title">Daily Analytics</div>
                <div className="auth-feature-desc">Charts, trends, insights</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-panel-right">
          {/* Tab switch */}
          {step === 1 && (
            <div className="auth-tabs">
              <button
                id="login-tab"
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); setStep(1); }}
              >
                Sign In
              </button>
              <button
                id="register-tab"
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); setStep(1); }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {isLogin && (
            <form className="auth-form" onSubmit={handleLogin} id="login-form">
              <div className="auth-form-header">
                <h2>Welcome back!</h2>
                <p>Sign in to continue your streak</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="login-email" type="email" className="input" value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input id="login-password" type="password" className="input" value={loginData.password}
                  onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password" required />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button id="login-submit-btn" type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── REGISTER STEP 1: Account ── */}
          {!isLogin && step === 1 && (
            <form className="auth-form" onSubmit={handleRegisterStep1} id="register-form-step1">
              <div className="auth-form-header">
                <h2>Create Account</h2>
                <p>Step 1 of 2 — Account details</p>
                <div className="auth-step-dots">
                  <span className="step-dot active" />
                  <span className="step-dot" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="reg-name" type="text" className="input" value={formData.name}
                  onChange={e => set('name', e.target.value)} placeholder="Shiva Kumar" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="reg-email" type="email" className="input" value={formData.email}
                  onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input id="reg-password" type="password" className="input" value={formData.password}
                    onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input id="reg-confirm-password" type="password" className="input" value={formData.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" required />
                </div>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button id="reg-step1-next" type="submit" className="btn btn-primary auth-submit">
                Continue →
              </button>
            </form>
          )}

          {/* ── REGISTER STEP 2: Profile ── */}
          {!isLogin && step === 2 && (
            <form className="auth-form" onSubmit={handleRegisterStep2} id="register-form-step2">
              <div className="auth-form-header">
                <h2>Your Profile</h2>
                <p>Step 2 of 2 — Physical & financial info</p>
                <div className="auth-step-dots">
                  <span className="step-dot done" />
                  <span className="step-dot active" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input id="reg-weight" type="number" className="input" value={formData.weight}
                    onChange={e => set('weight', e.target.value)} placeholder="70" min="30" max="300" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input id="reg-height" type="number" className="input" value={formData.height}
                    onChange={e => set('height', e.target.value)} placeholder="175" min="100" max="250" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input id="reg-age" type="number" className="input" value={formData.age}
                    onChange={e => set('age', e.target.value)} placeholder="25" min="10" max="100" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="auth-gender-toggle">
                  <button type="button" id="gender-male"
                    className={`auth-gender-btn ${formData.gender === 'male' ? 'active' : ''}`}
                    onClick={() => set('gender', 'male')}>
                    <User size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Male
                  </button>
                  <button type="button" id="gender-female"
                    className={`auth-gender-btn ${formData.gender === 'female' ? 'active' : ''}`}
                    onClick={() => set('gender', 'female')}>
                    <User size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} /> Female
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select id="reg-activity" className="select" value={formData.activityLevel}
                  onChange={e => set('activityLevel', e.target.value)}>
                  {ACTIVITY_LEVELS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fitness Goal</label>
                <div className="auth-goal-grid">
                  {FITNESS_GOALS.map(g => {
                    const Icon = g.icon;
                    return (
                      <button
                        type="button"
                        key={g.value}
                        id={`goal-${g.value}`}
                        className={`auth-goal-btn ${formData.fitnessGoal === g.value ? 'active' : ''}`}
                        onClick={() => set('fitnessGoal', g.value)}
                      >
                        <span className="auth-goal-label"><Icon size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/>{g.label}</span>
                        <span className="auth-goal-desc">{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Salary (₹) <span className="form-label-opt">optional</span></label>
                <input id="reg-salary" type="number" className="input" value={formData.monthlySalary}
                  onChange={e => set('monthlySalary', e.target.value)} placeholder="50000" min="0" />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div className="auth-form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button id="reg-submit-btn" type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <><div className="spinner" /> Creating...</> : <><Rocket size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/> Create Account</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
