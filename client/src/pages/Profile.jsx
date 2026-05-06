import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/authService';

const Profile = () => {
  const { user, login } = useAuth();
  const toast = useToast();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [goalForm, setGoalForm] = useState({ dailyGoalHours: user?.dailyGoalHours ?? 2 });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving]     = useState('');

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return toast.error('Name cannot be empty.');
    setSaving('name');
    try {
      const { data } = await updateProfile({ name: nameForm.name.trim() });
      login(localStorage.getItem('devtrack_token'), data.user);
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(''); }
  };

  const handleGoalSave = async (e) => {
    e.preventDefault();
    const hours = Number(goalForm.dailyGoalHours);
    if (hours < 0 || hours > 24) return toast.error('Goal must be between 0 and 24 hours.');
    setSaving('goal');
    try {
      const { data } = await updateProfile({ dailyGoalHours: hours });
      login(localStorage.getItem('devtrack_token'), data.user);
      toast.success('Daily goal updated!');
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(''); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword)
      return toast.error('New passwords do not match.');
    if (passForm.newPassword.length < 6)
      return toast.error('New password must be at least 6 characters.');
    setSaving('pass');
    try {
      await updateProfile({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(''); }
  };

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="animate-fade-in">
        <p className="font-mono text-cyan-500 text-sm">// settings</p>
        <h1 className="text-2xl font-bold text-white mt-1">Profile & Settings</h1>
      </div>

      {/* Account info */}
      <div className="card space-y-2">
        <p className="label">Account Info</p>
        <p className="text-sm text-slate-300">{user?.email}</p>
        <p className="text-xs text-slate-500 font-mono">Joined {joined}</p>
        <span className="inline-block tag mt-1">{user?.role}</span>
      </div>

      {/* Update Name */}
      <div className="card">
        <p className="label mb-4">Display Name</p>
        <form onSubmit={handleNameSave} className="flex gap-3">
          <input className="input flex-1" type="text" value={nameForm.name}
            onChange={(e) => setNameForm({ name: e.target.value })}
            placeholder="Your name" maxLength={50} />
          <button type="submit" className="btn-primary shrink-0" disabled={saving === 'name'}>
            {saving === 'name' ? 'saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Daily Goal */}
      <div className="card">
        <p className="label mb-1">Daily Learning Goal</p>
        <p className="text-xs text-slate-500 mb-4">Sets the target on your dashboard progress bar.</p>
        <form onSubmit={handleGoalSave} className="flex gap-3 items-center">
          <input className="input w-28" type="number" min={0} max={24} step={0.5}
            value={goalForm.dailyGoalHours}
            onChange={(e) => setGoalForm({ dailyGoalHours: e.target.value })} />
          <span className="text-slate-400 text-sm">hours / day</span>
          <button type="submit" className="btn-primary ml-auto shrink-0" disabled={saving === 'goal'}>
            {saving === 'goal' ? 'saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <p className="label mb-4">Change Password</p>
        <form onSubmit={handlePasswordSave} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              placeholder="••••••••" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder="min. 6 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              placeholder="repeat new password" />
          </div>
          <button type="submit" className="btn-primary" disabled={saving === 'pass'}>
            {saving === 'pass' ? 'changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
