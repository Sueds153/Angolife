
import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'login' }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setShowPassword(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    } else {
      alert("Por favor preencha todos os campos.");
    }
  };

  const handleForgotPassword = () => {
    alert("Um link de recuperação foi enviado para o seu e-mail (Simulação).");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-orange-500/30">
        <button 
          onClick={onClose}
          title="Fechar"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 mb-4 border border-orange-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isRegister ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isRegister 
              ? 'Registe-se para aceder a descontos exclusivos e ferramentas.' 
              : 'Faça login para continuar a usar o Angolife.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {isRegister && (
             <div className="space-y-1">
               <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-widest text-[10px] font-bold">Nome Completo</label>
               <div className="relative">
                 <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                 <input 
                   type="text" 
                   className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-orange-500/20 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                   placeholder="Seu nome"
                 />
               </div>
             </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-widest text-[10px] font-bold">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-orange-500/20 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                placeholder="exemplo@angolife.ao"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-widest text-[10px] font-bold">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-white dark:bg-slate-800 border border-orange-500/20 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-orange-500 transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isRegister && (
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-semibold text-orange-500 hover:underline mt-1"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4 gold-border-subtle"
          >
            {isRegister ? 'Cadastrar' : 'Entrar'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 text-center text-sm border-t gold-border-t-subtle">
          <p className="text-slate-500 dark:text-slate-400">
            {isRegister ? 'Já tem conta?' : 'Ainda não tem conta?'}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-bold text-orange-500 hover:underline focus:outline-none"
            >
              {isRegister ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
