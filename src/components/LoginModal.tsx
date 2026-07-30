import React, { useState } from 'react';
import { Shield, User, Lock, LogIn } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      showToast('Login berhasil! Selamat datang di e-Kinerja Wali Asuh.', 'success');
      onLoginSuccess();
    } else {
      showToast('Username atau password salah! (Default: admin / admin123)', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-blue-950/90 via-slate-900/90 to-indigo-950/95 backdrop-blur-md p-4 no-print">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <h1 className="text-[20vw] font-black text-white/5 -rotate-12 tracking-tighter">SRT31</h1>
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 mb-4 border border-blue-400/30 shadow-inner">
            <Shield className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Login e-Kinerja</h2>
          <p className="text-blue-200/80 text-sm mt-1">Sekolah Rakyat Terintegrasi 31 Palembang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-100 text-xs font-medium mb-1.5 ml-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-blue-300/70" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-blue-200/40 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-100 text-xs font-medium mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-blue-300/70" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-blue-200/40 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm transition-all"
                placeholder="admin123"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <LogIn className="w-4 h-4" /> Masuk Sistem
          </button>
        </form>

        <p className="text-center text-[11px] text-blue-200/60 mt-6">
          Default akun: <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">admin</code> / <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">admin123</code>
        </p>
      </div>
    </div>
  );
};
