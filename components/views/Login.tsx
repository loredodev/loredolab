
import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Mail, Sparkles, Zap, Brain, Globe, Shield, Activity, Lock } from 'lucide-react';
import { Language } from '../../types';
import { CONTENT } from '../../constants';
import { Logo } from '../Logo';
import { supabase } from '../../services/supabase';

interface LoginProps {
  onLogin: (email: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isPt = lang === 'pt';
  const t = CONTENT[lang].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError(t.errorRequired);
      return;
    }
    if (!email.includes('@')) {
      setError(t.errorInvalid);
      return;
    }
    if (isRegistering && !name.trim()) {
      setError(isPt ? "Por favor, insira seu nome." : "Please enter your name.");
      return;
    }
    if (password.length < 6) {
        setError(isPt ? "A senha deve ter pelo menos 6 caracteres." : "Password must be at least 6 characters.");
        return;
    }

    setIsLoading(true);

    try {
        if (isRegistering) {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        onboarding_completed: false
                    }
                }
            });
            
            if (signUpError) throw signUpError;

            if (data.user && !data.session) {
                setMessage(isPt 
                    ? "Conta criada! Verifique seu email." 
                    : "Account created! Please check your email.");
                setIsRegistering(false);
                setIsLoading(false);
            }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInError) throw signInError;
        }
    } catch (err: any) {
        setError(err.message || (isPt ? "Ocorreu um erro." : "An error occurred."));
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F8F9FC]">
      
      {/* --- AMBIENT BACKGROUND ANIMATION --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      
      {/* Floating Elements (Decorative) */}
      <div className="hidden lg:block absolute left-[10%] top-[30%] animate-pulse-slow">
          <div className="glass p-4 rounded-2xl shadow-xl transform -rotate-6 border border-white/40 backdrop-blur-md">
              <Activity className="w-6 h-6 text-primary-600" />
          </div>
      </div>
      <div className="hidden lg:block absolute right-[10%] bottom-[30%] animate-pulse-slow" style={{ animationDelay: '1s' }}>
          <div className="glass p-4 rounded-2xl shadow-xl transform rotate-6 border border-white/40 backdrop-blur-md">
              <Brain className="w-6 h-6 text-indigo-600" />
          </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-[1100px] h-auto lg:h-[700px] flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden m-4 border border-white/60">
        
        {/* LEFT: Branding & Visuals */}
        <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-primary-600 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
            {/* Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
                <Logo theme="dark" className="mb-12" />
                
                <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
                    {isPt ? 'Ciência para sua produtividade.' : 'Science for your productivity.'}
                </h1>
                <p className="text-lg text-primary-100 leading-relaxed font-medium">
                    {isPt 
                     ? 'Transforme protocolos científicos em experimentos pessoais mensuráveis. Dados, IA e biologia.' 
                     : 'Transform scientific protocols into measurable personal experiments. Data, AI, and biology.'}
                </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 mt-8">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <div className="p-2 bg-white/20 rounded-lg"><Sparkles className="w-5 h-5 text-yellow-300" /></div>
                    <div>
                        <div className="font-bold text-sm">Gemini AI 2.0</div>
                        <div className="text-xs text-white/70">{isPt ? 'Análise avançada de dados' : 'Advanced data analysis'}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                    <div className="p-2 bg-white/20 rounded-lg"><Lock className="w-5 h-5 text-emerald-300" /></div>
                    <div>
                        <div className="font-bold text-sm">End-to-End Encrypted</div>
                        <div className="text-xs text-white/70">{isPt ? 'Seus dados são seus' : 'Your data is yours'}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: Login Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white relative">
            
            <div className="absolute top-8 right-8 z-20">
                <button 
                    onClick={() => setLang(isPt ? 'en' : 'pt')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                    <Globe className="w-3 h-3" />
                    {isPt ? 'EN' : 'PT'}
                </button>
            </div>

            <div className="lg:hidden mb-8 flex justify-center">
                <Logo className="scale-90" />
            </div>

            <div className="max-w-md mx-auto w-full">
                <div className="text-center lg:text-left mb-10">
                    <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                        {isRegistering 
                            ? (isPt ? 'Crie sua conta' : 'Create your account') 
                            : (isPt ? 'Bem-vindo de volta' : 'Welcome back')}
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {isPt 
                            ? 'Acesse seu laboratório pessoal de performance.' 
                            : 'Access your personal performance laboratory.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && (
                        <div className="space-y-1.5 animate-slide-up">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                {isPt ? 'Nome Completo' : 'Full Name'}
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold placeholder:font-medium"
                                placeholder="Dr. Freeman"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold placeholder:font-medium"
                            placeholder="scientist@lab.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                            {isPt ? 'Senha' : 'Password'}
                        </label>
                        <input 
                            type="password" 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold placeholder:font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 animate-slide-up font-medium">
                            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="flex items-center text-blue-600 text-sm bg-blue-50 p-4 rounded-2xl border border-blue-100 animate-slide-up font-medium">
                            <Mail className="w-5 h-5 mr-3 shrink-0" />
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-slate-200 hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegistering ? (isPt ? 'Criar Conta Grátis' : 'Create Free Account') : (isPt ? 'Entrar na Plataforma' : 'Sign In'))}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        {isRegistering ? (isPt ? 'Já possui conta?' : 'Already have an account?') : (isPt ? 'Ainda não é membro?' : "Don't have an account?")}
                        <button 
                            onClick={() => { setIsRegistering(!isRegistering); setError(null); setMessage(null); }}
                            className="ml-2 font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4"
                        >
                            {isRegistering ? (isPt ? 'Fazer Login' : 'Log in') : (isPt ? 'Criar Conta' : 'Join now')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
