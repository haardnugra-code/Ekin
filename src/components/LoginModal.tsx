import React, { useState } from 'react';
import { Shield, User, Lock, LogIn, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { validateAndUseToken, DEFAULT_TOKENS } from '../utils/tokenManager';

interface LoginModalProps {
  onLoginSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, showToast }) => {
  const [loginMode, setLoginMode] = useState<'token' | 'password'>('token');
  const [tokenCode, setTokenCode] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenCode.trim()) {
      showToast('Silakan masukkan kode token akses terlebih dahulu.', 'error');
      return;
    }
    const result = validateAndUseToken(tokenCode);
    if (result.valid) {
      showToast(result.message, 'success');
      onLoginSuccess();
    } else {
      showToast(result.message, 'error');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password === '817731') {
      showToast('Login Akun Admin Berhasil!', 'success');
      onLoginSuccess();
    } else {
      showToast('ID Admin atau password salah! Silakan periksa kembali.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-blue-950/95 via-purple-950/90 to-slate-950/95 backdrop-blur-md p-4 no-print">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <h1 className="text-[20vw] font-black text-white/5 -rotate-12 tracking-tighter">SRT31</h1>
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-3 border border-purple-400/30 shadow-inner">
            <Shield className="w-8 h-8 text-purple-300" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">e-Kinerja Wali Asuh</h2>
          <p className="text-purple-200/80 text-xs mt-1">Sekolah Rakyat Terintegrasi 31 Palembang</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-black/30 rounded-2xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setLoginMode('token')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'token'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200/70 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Token Akses
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'password'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-200/70 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> User / Admin
          </button>
        </div>

        {/* Token Mode Form */}
        {loginMode === 'token' ? (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-100 text-xs font-bold mb-1.5 ml-1 flex items-center justify-between">
                <span>Masukkan Kode Token Akses</span>
                <span className="text-[10px] text-emerald-300 font-normal">Token Baru / Default</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-purple-300/80" />
                </div>
                <input
                  type="text"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 border border-purple-300/30 text-white placeholder-purple-200/40 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono font-bold text-sm tracking-wider uppercase transition-all"
                  placeholder="Masukkan token baru di sini..."
                  required
                />
              </div>
            </div>

            {/* Default Token Quick Fill Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-purple-200/60 uppercase tracking-wider block ml-1">
                Pilihan Token Siap Pakai:
              </span>
              <div className="flex flex-col gap-1.5">
                {DEFAULT_TOKENS.map((tok) => (
                  <button
                    key={tok.id}
                    type="button"
                    onClick={() => setTokenCode(tok.code)}
                    className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-300/50 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-purple-200 group-hover:text-white block">
                        {tok.label}
                      </span>
                      <span className="text-[10px] font-mono text-purple-300/60 block">
                        {tok.code.slice(0, 5)}••••••••
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> Pilih Token
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/30 mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Masuk Dengan Token
            </button>
          </form>
        ) : (
          /* Password Mode Form */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-100 text-xs font-medium mb-1.5 ml-1">ID Admin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-blue-300/70" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 text-white placeholder-blue-200/40 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm transition-all"
                  placeholder="ID Admin"
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
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" /> Masuk Sistem Admin
            </button>
          </form>
        )}

        {/* Footer info */}
        <p className="text-center text-[11px] text-purple-200/60 mt-6">
          {loginMode === 'token'
            ? 'Masukkan kode token akses Anda untuk membuka aplikasi e-Kinerja.'
            : 'Akses Sistem Admin e-Kinerja terenkripsi.'}
        </p>
      </div>
    </div>
  );
};
