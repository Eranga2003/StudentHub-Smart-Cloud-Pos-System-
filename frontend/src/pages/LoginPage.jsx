import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { authService } from '../services/authService.js';
import PosBot from '../components/PosBot.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [slGreeting, setSlGreeting] = useState(() => authService.getSriLankanGreeting());
  const [slTime, setSlTime] = useState(() => authService.getSriLankanCurrentTime());

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Update live Sri Lankan time
  useEffect(() => {
    const timer = setInterval(() => {
      setSlGreeting(authService.getSriLankanGreeting());
      setSlTime(authService.getSriLankanCurrentTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Handle countdown on login success
  useEffect(() => {
    if (!loginSuccess) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [loginSuccess, countdown, navigate, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      await authService.login(email, password);
      setSlGreeting(authService.getSriLankanGreeting());
      setLoginSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedImmediately = () => {
    const destination = location.state?.from?.pathname || '/';
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061B2E] via-[#0B3B60] to-[#04121F] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#43B02A]/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#0B3B60]/40 blur-3xl pointer-events-none"></div>

      {/* SUCCESS GREETING MODAL WITH ANIMATED BOT */}
      {loginSuccess && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-white/20 shadow-2xl space-y-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Top decorative ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B3B60] via-[#43B02A] to-[#0B3B60]"></div>

            {/* Animated Pos Bot Mascot */}
            <div className="pt-2 flex justify-center">
              <div className="relative">
                <PosBot size="xl" waving={true} />
                <span className="absolute -top-1 -right-1 text-2xl animate-bounce">👋</span>
              </div>
            </div>

            {/* Dynamic Sri Lankan Greeting & Bot Message */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#43B02A]/10 text-[#43B02A] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sri Lanka Time • {slTime}</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-[#0B3B60] tracking-tight">
                {slGreeting}, Dinesh!
              </h2>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-1 shadow-inner">
                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Bot Message:
                </p>
                <p className="text-sm lg:text-base font-semibold text-slate-800 leading-relaxed">
                  "Hello! 👋 I am <span className="text-[#0B3B60] font-bold">StudentHub Smart Pos System</span>, so welcome Back <span className="text-[#43B02A] font-bold">Dinesh</span>."
                </p>
              </div>
            </div>

            {/* Session Security Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#43B02A] shrink-0" />
              <span>19-Hour Token Validation Active • Auto-logout in 19h</span>
            </div>

            {/* Progress CTA */}
            <div className="pt-1">
              <button
                onClick={handleProceedImmediately}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#43B02A] to-[#34921f] text-white font-bold text-sm shadow-lg shadow-[#43B02A]/30 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter System ({countdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LOGIN CARD */}
      <div className="w-full max-w-md z-10 space-y-5">
        {/* Top Header Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6">
          {/* Logo & Brand Identity */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-2 shadow-lg border border-slate-200/80 flex items-center justify-center relative group">
              <img
                src="/logo.png"
                alt="StudentHub Official Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#43B02A] ring-2 ring-white" title="Cloud POS Online"></span>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0B3B60]">
                STUDENT<span className="text-[#43B02A]">HUB</span>
              </h1>
              <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Student Service Center • Smart Cloud POS
              </p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#43B02A] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#43B02A] animate-pulse"></span>
                <span>Campus Branch #01 • Terminal Secure Login</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 focus:border-[#0B3B60] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Case-sensitive</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B60]/20 focus:border-[#0B3B60] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Auto Logout Notice */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#43B02A] focus:ring-[#43B02A]"
                />
                <span>Remember session</span>
              </label>

              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#0B3B60]" />
                <span>19h Auto-logout</span>
              </span>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0B3B60] to-[#082d49] hover:from-[#082d49] hover:to-[#0B3B60] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Validating Security Token...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Badge */}
        <div className="text-center text-xs text-white/60 space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#43B02A]" />
            <span>Encrypted Token Security • 19-Hour Auto-Logout Protection</span>
          </div>
          <p className="text-[10px] text-white/40">
            StudentHub Smart POS System © 2026 • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
