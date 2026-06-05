import React, { useState } from 'react';
import { Store, ShieldAlert, KeyRound, User, Sun, Moon, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Login({ onLoginSuccess, isDarkMode, setIsDarkMode }) {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Incorrect credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server API. Verify that the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regName) {
      setRegError('Please fill in all required fields.');
      return;
    }

    setIsRegLoading(true);
    setRegError('');
    setRegSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          name: regName,
          contact: regContact
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegSuccess('Account created successfully! Flipping to sign in...');
        setRegUsername('');
        setRegPassword('');
        setRegName('');
        setRegContact('');
        
        // Auto flip back to login after 2 seconds
        setTimeout(() => {
          setIsRegistering(false);
          setRegSuccess('');
        }, 2000);
      } else {
        setRegError(data.error || 'Failed to register account.');
      }
    } catch (err) {
      console.error(err);
      setRegError('Connection error. Verify that the backend is running.');
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'dark bg-[#04060c]' : 'light bg-slate-50'
    }`}>
      
      {/* Dynamic Grid Background Overlay for premium aesthetic */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] z-0" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Cyber Mesh Soft Orbs */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[20%] w-[550px] h-[550px] rounded-full bg-brand-accent/5 filter blur-[150px] soft-pulse-bg"></div>
          <div className="absolute bottom-[10%] right-[20%] w-[450px] h-[450px] rounded-full bg-brand-violet/5 filter blur-[120px] soft-pulse-bg" style={{ animationDelay: '4s' }}></div>
        </div>
      )}

      {/* Floating Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] dark:border-white/[0.05] light:bg-slate-200/50 hover:bg-slate-300/50 transition-all text-slate-400 dark:text-slate-400 light:text-slate-600 z-50 shadow-inner"
      >
        {isDarkMode ? <Sun className="w-4 h-4 text-brand-accent" /> : <Moon className="w-4 h-4 text-brand-accent" />}
      </button>

      {/* 3D PERSPECTIVE FLIP CONTAINER */}
      <div style={{ perspective: 1200 }} className="w-full max-w-[420px] z-10 relative flex justify-center items-center">
        
        <motion.div 
          animate={{ rotateY: isRegistering ? 180 : 0 }}
          transition={{ duration: 0.65, type: 'spring', stiffness: 180, damping: 22 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full relative min-h-[500px]"
        >
          
          {/* ==================== CARD FRONT (LOGIN FORM) ==================== */}
          <div 
            style={{ backfaceVisibility: 'hidden' }}
            className="w-full glass-panel rounded-[32px] shadow-premium p-10 border border-white/[0.06] glowing-ring flex flex-col justify-between"
          >
            {/* Glow border ring header */}
            <div className="absolute -top-10 left-[10%] right-[10%] h-20 bg-brand-accent/15 filter blur-[30px] pointer-events-none rounded-full"></div>

            <div>
              {/* Logo and Typography */}
              <div className="text-center mb-8 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-violet flex items-center justify-center mb-4 shadow-lg shadow-brand-accent/20 border border-white/10">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-widest bg-gradient-to-r from-brand-accent via-brand-accentLight to-brand-violet bg-clip-text text-transparent">AS STORE</h2>
                <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-widest leading-none mt-1.5 block">Premium Portal</span>
              </div>

              {/* Error Notification */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-2xl bg-brand-rose/10 border border-brand-rose/20 text-brand-rose flex items-start gap-3 text-xs font-semibold shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-6 relative z-10">
                <div>
                  <label htmlFor="username" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-2 pl-1">
                    Username ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
                      className="premium-input !pl-10 text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-2 pl-1">
                    Security Key
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="premium-input !pl-10 text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-premium py-4 text-xs font-black tracking-widest shadow-md shadow-brand-accent/25 hover:shadow-brand-accent/40"
                >
                  {isLoading ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white !border-l-transparent"></span>
                  ) : (
                    'SIGN IN PORTAL'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 text-center border-t border-white/[0.04] pt-5">
              <button 
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[10px] uppercase font-bold text-brand-accent hover:text-brand-accentLight tracking-widest transition-colors duration-300"
              >
                Create Account / Sign Up
              </button>
            </div>

          </div>

          {/* ==================== CARD BACK (REGISTRATION FORM) ==================== */}
          <div 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="w-full absolute inset-0 glass-panel rounded-[32px] shadow-premium p-10 border border-white/[0.06] glowing-ring flex flex-col justify-between"
          >
            {/* Glow border ring header */}
            <div className="absolute -top-10 left-[10%] right-[10%] h-20 bg-brand-violet/15 filter blur-[30px] pointer-events-none rounded-full"></div>

            <div>
              {/* Logo and Typography */}
              <div className="text-center mb-6 relative z-10">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-rose flex items-center justify-center mb-3 shadow-lg shadow-brand-violet/20 border border-white/10">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black tracking-widest bg-gradient-to-r from-brand-violet to-brand-rose bg-clip-text text-transparent">JOIN US</h2>
                <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-widest leading-none mt-1.5 block">Customer Setup</span>
              </div>

              {/* Status Notification */}
              {regError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3.5 rounded-2xl bg-brand-rose/10 border border-brand-rose/20 text-brand-rose flex items-start gap-2.5 text-xs font-semibold shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </motion.div>
              )}

              {regSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3.5 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald flex items-start gap-2.5 text-xs font-semibold shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4 relative z-10">
                <div>
                  <label htmlFor="regName" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 pl-1">
                    Full Name *
                  </label>
                  <input
                    id="regName"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="regUsername" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 pl-1">
                    Username ID *
                  </label>
                  <input
                    id="regUsername"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Choose Username"
                    className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="regPassword" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 pl-1">
                    Security Key *
                  </label>
                  <input
                    id="regPassword"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Choose Secure Password"
                    className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="regContact" className="block text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 pl-1">
                    Contact Phone
                  </label>
                  <input
                    id="regContact"
                    type="text"
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    placeholder="e.g. +91 9999999999"
                    className="premium-input text-slate-800 dark:text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading || regSuccess}
                  className="w-full btn-premium py-3 text-xs font-black tracking-widest shadow-md shadow-brand-violet/25 hover:shadow-brand-violet/40 bg-gradient-to-tr from-brand-violet to-brand-rose hover:from-brand-violet/90 hover:to-brand-rose/90"
                >
                  {isRegLoading ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white !border-l-transparent"></span>
                  ) : (
                    'CREATE CUSTOMER ACCOUNT'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center border-t border-white/[0.04] pt-4">
              <button 
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-[10px] uppercase font-bold text-brand-rose hover:text-brand-rose/85 tracking-widest transition-colors duration-300"
              >
                Back to Sign In
              </button>
            </div>

          </div>

        </motion.div>

      </div>

      {/* INTERACTIVE EVALUATION TOOLTIP */}
      <div className="mt-12 relative z-20">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-200 transition-all duration-300"
        >
          <Info className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
          Demo Evaluation Credentials
        </button>

        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 rounded-2xl glass-panel shadow-premium border border-white/10 z-50 text-[11px] leading-relaxed text-slate-400 space-y-2.5"
            >
              <h5 className="font-extrabold uppercase text-slate-200 tracking-wider flex items-center gap-1.5 text-xs text-brand-accent">
                🛠️ QA Credentials Info
              </h5>
              <div className="space-y-1.5 border-t border-white/5 pt-2">
                <p>
                  🔑 <strong className="text-slate-200 uppercase">Super Admin:</strong>
                  <br />
                  username: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">superadmin</code>
                  <br />
                  password: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">superadmin123</code>
                </p>
                <p>
                  🛡️ <strong className="text-slate-200 uppercase">Store Admin:</strong>
                  <br />
                  username: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">admin</code> (or <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">storeadmin</code>)
                  <br />
                  password: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">admin123</code> (or <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">storeadmin123</code>)
                </p>
                <p>
                  👤 <strong className="text-slate-200 uppercase">Customer Account:</strong>
                  <br />
                  username: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">user</code>
                  <br />
                  password: <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">user123</code>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default Login;
