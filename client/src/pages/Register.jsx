import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#060a12]">
      <div className="w-full max-w-[390px] animate-slide-up space-y-6">
        <div className="card border border-slate-800/80 bg-navy-900/10 p-8 flex flex-col items-center">
          {/* Mockup Icon */}
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] select-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight text-center uppercase">DevTrack</h1>
          <p className="text-slate-400 text-sm mt-1 text-center font-normal leading-relaxed mb-6">
            Create your developer command center.
          </p>

          <div className="w-full border-t border-slate-900 mb-6" />

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div>
              <label className="label flex items-center gap-1 font-bold">// Full Name</label>
              <div className="relative">
                <input
                  className="input pl-10 bg-navy-950/40 border-slate-800"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  required
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1 font-bold">// Email</label>
              <div className="relative">
                <input
                  className="input pl-10 bg-navy-950/40 border-slate-800"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ada@example.com"
                  required
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1 font-bold">// Password</label>
              <div className="relative">
                <input
                  className="input pl-10 bg-navy-950/40 border-slate-800"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 px-3.5 py-2.5 rounded-xl font-mono">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full !py-3 flex items-center justify-center gap-2 mt-4 text-xs font-bold font-mono tracking-wider" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6 font-normal">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
