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
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const joinedMonthYear = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Sep 2023';

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'JD';

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="font-mono text-cyan-500 text-sm mb-1">// account preferences</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
          Manage your command center credentials, identity, and daily goal targets.
        </p>
      </div>

      {/* Account Info Profile Card */}
      <div className="card flex items-center gap-5 border border-slate-900/50 bg-[#0a0f1e]/20">
        <div className="w-16 h-16 rounded-full bg-[#060a12]/50 border border-cyan-500 flex items-center justify-center text-xl font-extrabold font-mono text-white shrink-0 select-none shadow-[0_0_15px_rgba(0,217,255,0.15)]">
          {initials}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">{user?.name || 'John Developer'}</h2>
          <p className="text-sm text-slate-400 font-mono">{user?.email || 'john.dev@devtrack.io'}</p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-[#060a12]/40 px-2.5 py-1 rounded-md border border-slate-900/50 w-fit select-none">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>JOINED {joinedMonthYear.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="card space-y-4">
        <div>
          <p className="label flex items-center gap-1.5 select-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            DISPLAY NAME
          </p>
          <form onSubmit={handleNameSave} className="space-y-4">
            <input className="input bg-[#060a12]/40" type="text" value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
              placeholder="Display Name" maxLength={50} required />
            <button type="submit" className="btn-ghost w-full" disabled={saving === 'name'}>
              {saving === 'name' ? 'saving...' : 'Save Name'}
            </button>
          </form>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="card space-y-4">
        <div>
          <p className="label flex items-center gap-1.5 select-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            DAILY WORK GOAL
          </p>
          <form onSubmit={handleGoalSave} className="space-y-4">
            <div className="flex bg-[#060a12]/40 border border-slate-800 rounded-xl overflow-hidden items-center px-4 py-1.5 focus-within:border-cyan-500/50 transition-all">
              <input className="bg-transparent border-none outline-none text-white text-base font-mono w-16 py-2" type="number" min={0} max={24} step={0.5}
                value={goalForm.dailyGoalHours}
                onChange={(e) => setGoalForm({ dailyGoalHours: e.target.value })} />
              <span className="text-slate-500 text-xs font-mono uppercase tracking-wider select-none px-3 border-l border-slate-900/60">| HOURS / DAY</span>
            </div>
            <button type="submit" className="btn-ghost w-full" disabled={saving === 'goal'}>
              {saving === 'goal' ? 'saving...' : 'Update Goal'}
            </button>
          </form>
        </div>
      </div>

      {/* Security & Password */}
      <div className="card space-y-4">
        <div>
          <p className="label flex items-center gap-1.5 select-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            SECURITY & SECRETS
          </p>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <input className="input pr-10 bg-[#060a12]/40" type={showCurrentPassword ? 'text' : 'password'} value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                placeholder="Current Password" required={passForm.newPassword ? true : false} />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showCurrentPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <input className="input pr-10 bg-[#060a12]/40" type={showNewPassword ? 'text' : 'password'} value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="New Password" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showNewPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input className="input pr-10 bg-[#060a12]/40" type={showConfirmPassword ? 'text' : 'password'} value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="Confirm New Password" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                )}
              </button>
            </div>

            <button type="submit" className="btn-ghost w-full flex items-center justify-center gap-2" disabled={saving === 'pass'}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saving === 'pass' ? 'updating...' : 'Update Secrets'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
