import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Fingerprint, ShieldCheck, Mail, Key, ArrowRight, Eye, EyeOff, Terminal, ShieldAlert, CheckCircle2, UserPlus, FileKey, Smartphone } from 'lucide-react';

type AuthStep = 'login' | 'register' | '2fa';

export function AuthFlow({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [step, setStep] = useState<AuthStep>('login');

  return (
    <div className="min-h-[100dvh] bg-[#020202] flex items-center justify-center relative overflow-hidden font-sans text-white">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] opacity-40 z-0 mask-image:linear-gradient(to_bottom,black,transparent)] animate-[pulse_4s_ease-in-out_infinite]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-[#0ea5e9]/10 blur-[120px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] bg-[#39ff14]/5 blur-[120px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      
      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md mx-4 pb-20">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-14 h-14 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(14,165,233,0.15)] backdrop-blur-md">
             <Terminal className="w-7 h-7 text-[#0ea5e9]" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">TRADEX OS</h1>
           <p className="text-gray-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-3.5 h-3.5 text-[#39ff14]/80" />
             Institutional Execution
           </p>
        </div>

        <motion.div 
          layout
          className="bg-[#050505]/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden border-t-white/20"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9]/50 to-transparent"></div>
          
          <AnimatePresence mode="wait" initial={false}>
            {step === 'login' && <LoginForm setStep={setStep} onNext={() => setStep('2fa')} key="login" />}
            {step === 'register' && <RegisterForm setStep={setStep} key="register" />}
            {step === '2fa' && <TwoFactorForm onAuthenticate={onAuthenticate} setStep={setStep} key="2fa" />}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer */}
        <div className="mt-8 text-center flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono uppercase tracking-widest">
             <Key className="w-3.5 h-3.5" />
             Zero-Knowledge Architecture
           </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ setStep, onNext }: { setStep: (s: AuthStep) => void, onNext: () => void, key?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div 
      key="login"
      initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Access Terminal</h2>
        <p className="text-xs text-gray-400 font-mono uppercase">Authenticate to proceed</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Operator ID / Email</label>
          <div className="relative group">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#0ea5e9] transition-colors" />
            <input type="text" className="w-full bg-black/40 border border-[#1a1a1a] rounded-xl px-9 py-3 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors font-mono focus:bg-black/60" placeholder="sys_op@tradex.inc" defaultValue="alex.strata" />
          </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-1.5 px-1">
             <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Passphrase</label>
             <a href="#" className="text-[10px] text-[#0ea5e9] hover:text-white transition-colors font-mono uppercase">Recover Key</a>
           </div>
          <div className="relative group">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#0ea5e9] transition-colors" />
            <input type={showPassword ? "text" : "password"} className="w-full bg-black/40 border border-[#1a1a1a] rounded-xl px-9 py-3 text-sm text-white focus:outline-none focus:border-[#0ea5e9]/50 transition-colors font-mono focus:bg-black/60" placeholder="••••••••••••••••" defaultValue="tradex2026!#" />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onNext} className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          Initialize <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onNext} className="w-12 h-12 border border-[#1a1a1a] bg-black/40 hover:bg-black/80 rounded-xl flex items-center justify-center text-[#0ea5e9] hover:border-[#0ea5e9]/50 transition-all flex-shrink-0" title="Biometric Integration">
          <Fingerprint className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs font-sans text-gray-500">
        New operator? <button onClick={() => setStep('register')} className="text-white hover:text-[#0ea5e9] font-bold transition-colors">Request Access</button>
      </div>
    </motion.div>
  );
}

function RegisterForm({ setStep }: { setStep: (s: AuthStep) => void, key?: string }) {
  return (
    <motion.div 
      key="register"
      initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <div className="w-10 h-10 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-5 h-5 text-[#0ea5e9]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Onboard Node</h2>
        <p className="text-xs text-gray-400 font-mono uppercase">Establish Secure Identity</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Alias / Operator ID</label>
          <div className="relative group">
            <UserPlus className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
            <input type="text" className="w-full bg-black/40 border border-[#1a1a1a] rounded-xl px-9 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono" placeholder="quant_alpha_1" />
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mt-2">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-1.5 mb-3">
             <FileKey className="w-3.5 h-3.5 text-[#a855f7]" />
             API Key Vault Generation
           </h3>
           <p className="text-xs text-gray-500 font-sans leading-relaxed mb-3">
             A master cryptographic pair will be generated locally. Private keys never leave this device.
           </p>
           <div className="flex items-center gap-2 p-2 bg-black/50 border border-[#1a1a1a] rounded-lg">
             <div className="w-2 h-2 rounded-full bg-[#39ff14] opacity-80"></div>
             <span className="text-[10px] font-mono text-gray-400">Vault Ready for Provisioning</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button onClick={() => setStep('login')} className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          Generate Keys & Register
        </button>
        <button onClick={() => setStep('login')} className="text-xs text-gray-400 hover:text-white transition-colors py-2 font-mono uppercase">
          Cancel Operation
        </button>
      </div>
    </motion.div>
  );
}

function TwoFactorForm({ onAuthenticate, setStep }: { onAuthenticate: () => void, setStep: (s: AuthStep) => void, key?: string }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleInput = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`2fa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <motion.div 
      key="2fa"
      initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-[#39ff14]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#39ff14]/20">
          <Smartphone className="w-5 h-5 text-[#39ff14]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">2FA Required</h2>
        <p className="text-xs text-gray-400 font-mono uppercase">Enter Authenticator Token</p>
      </div>

      <div className="flex justify-between gap-2 px-2 py-4">
        {code.map((digit, i) => (
          <input
            key={i}
            id={`2fa-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 bg-black/50 border border-[#222] rounded-xl text-center text-xl font-mono text-white focus:outline-none focus:border-[#39ff14]/50 focus:bg-[#39ff14]/5 transition-all shadow-inner"
            autoFocus={i === 0}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-sans bg-[#111] p-3 rounded-lg border border-[#222]">
        <ShieldAlert className="w-4 h-4 text-[#ff4500]" />
        Verify physical token if prompted via YubiKey.
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button onClick={onAuthenticate} className="w-full bg-[#39ff14] hover:bg-[#2ce60b] text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
          <ShieldCheck className="w-4 h-4" /> Verify & Authorize
        </button>
        <button onClick={() => setStep('login')} className="text-xs text-gray-400 hover:text-white transition-colors py-2 font-mono uppercase">
          Return to Login
        </button>
      </div>
    </motion.div>
  );
}
