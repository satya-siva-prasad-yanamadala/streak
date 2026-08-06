import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Flame, Scale, Dumbbell, Ruler, Calendar, User, Activity, Wallet, Check, Edit2, Lightbulb, Target } from 'lucide-react';
import './ProfilePage.css';

const ACTIVITY_MAP = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
};

const GOAL_MAP = {
  lose_weight: 'Lose Weight',
  maintain: 'Maintain',
  gain_muscle: 'Gain Muscle',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    weight: user?.weight || '',
    height: user?.height || '',
    age: user?.age || '',
    monthlySalary: user?.monthlySalary || '',
    activityLevel: user?.activityLevel || 'moderately_active',
    fitnessGoal: user?.fitnessGoal || 'maintain',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      setSuccess('Profile updated successfully! Nutrition targets recalculated.');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-card glass-card">
        {/* Avatar */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <span className="badge badge-brand">{GOAL_MAP[user.fitnessGoal]}</span>
          </div>
          {!editing && (
            <button id="edit-profile-btn" className="btn btn-ghost profile-edit-btn" onClick={() => setEditing(true)}>
              <Edit2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} /> Edit Profile
            </button>
          )}
        </div>

        <div className="divider" />

        {/* Info grid */}
        {!editing ? (
          <div className="profile-info-grid">
            <InfoCard icon={<Scale size={18} />} label="Weight" value={`${user.weight} kg`} />
            <InfoCard icon={<Ruler size={18} />} label="Height" value={`${user.height} cm`} />
            <InfoCard icon={<Calendar size={18} />} label="Age" value={`${user.age} years`} />
            <InfoCard icon={<User size={18} />} label="Gender" value={user.gender === 'male' ? 'Male' : 'Female'} />
            <InfoCard icon={<Activity size={18} />} label="Activity" value={ACTIVITY_MAP[user.activityLevel]} />
            <InfoCard icon={<Wallet size={18} />} label="Monthly Salary" value={`₹${(user.monthlySalary || 0).toLocaleString('en-IN')}`} />
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form" id="profile-edit-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Salary (₹)</label>
                <input className="input" type="number" value={form.monthlySalary} onChange={e => setForm(p => ({...p, monthlySalary: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="input" type="number" value={form.weight} onChange={e => setForm(p => ({...p, weight: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="input" type="number" value={form.height} onChange={e => setForm(p => ({...p, height: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="input" type="number" value={form.age} onChange={e => setForm(p => ({...p, age: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select className="select" value={form.activityLevel} onChange={e => setForm(p => ({...p, activityLevel: e.target.value}))}>
                  {Object.entries(ACTIVITY_MAP).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fitness Goal</label>
                <select className="select" value={form.fitnessGoal} onChange={e => setForm(p => ({...p, fitnessGoal: e.target.value}))}>
                  {Object.entries(GOAL_MAP).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}
            <div className="profile-edit-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button id="save-profile-btn" type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" /> Saving...</> : <><Check size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}

        {/* Computed nutrition targets */}
        <div className="divider" />
        <div className="profile-targets">
          <h3 className="profile-targets-title"><Target size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }}/>Your Daily Nutrition Targets</h3>
          <div className="profile-targets-grid">
            <TargetCard label="Calories" value={user.dailyCalories} unit="kcal" color="var(--color-calories)" />
            <TargetCard label="Protein"  value={user.dailyProtein}  unit="g" color="var(--color-protein)" />
            <TargetCard label="Carbs"    value={user.dailyCarbs}    unit="g" color="var(--color-carbs)" />
            <TargetCard label="Fats"     value={user.dailyFats}     unit="g" color="var(--color-fats)" />
            <TargetCard label="Fiber"    value={user.dailyFiber}    unit="g" color="var(--color-fiber)" />
          </div>
          <p className="profile-targets-note">
            <Lightbulb size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
            These are calculated using the Mifflin-St Jeor equation based on your physical profile and fitness goal. They'll update automatically if you edit your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="profile-info-card">
      <span className="profile-info-icon">{icon}</span>
      <span className="profile-info-label">{label}</span>
      <span className="profile-info-value">{value}</span>
    </div>
  );
}

function TargetCard({ label, value, unit, color }) {
  return (
    <div className="profile-target-card">
      <span className="profile-target-label">{label}</span>
      <span className="profile-target-value" style={{ color }}>{value}<span className="profile-target-unit">{unit}</span></span>
    </div>
  );
}
