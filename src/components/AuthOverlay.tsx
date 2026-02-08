import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { useToast } from '../context/ToastContext';

interface AuthOverlayProps {
  mode: 'login' | 'register';
  onClose: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ mode: initialMode, onClose }) => {
  const [internalMode, setInternalMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (internalMode === 'register') {
        const { error } = await AuthService.signUp(email, password, fullName);
        if (error) throw error;
        addToast('Conta criada! Verifique seu e-mail.', 'success');
        onClose();
      } else if (internalMode === 'login') {
        const { error } = await AuthService.signIn(email, password);
        if (error) throw error;
        addToast('Bem-vindo de volta!', 'success');
        onClose();
      } else {
        const { error } = await AuthService.resetPassword(email);
        if (error) throw error;
        addToast('E-mail de recuperação enviado!', 'success');
        setInternalMode('login');
      }
    } catch (err) {
      const error = err as { message?: string };
      addToast(error.message || 'Erro na autenticação', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md glass-card rounded-3xl p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gold-primary"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center leading-none mb-4">
            <span className="text-gold-primary text-[8px] font-black uppercase tracking-[0.2em]">su-golden</span>
            <div className="h-[1px] w-full bg-gold-primary mt-0.5"></div>
          </div>
          <h2 className="text-2xl font-black text-white">
            {internalMode === 'login' ? 'Bem-vindo de Volta' : internalMode === 'register' ? 'Criar Conta Elite' : 'Recuperar Acesso'}
          </h2>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {internalMode === 'login'
              ? 'Aceda aos seus dados exclusivos do mercado angolano.'
              : internalMode === 'register' ? 'Junte-se à maior rede de prestígio em Angola.' : 'Enviaremos um link para redefinir a sua palavra-passe.'}
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {internalMode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Nome Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="bg-white/5 border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                placeholder="Ex: Manuel dos Santos"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white/5 border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
              placeholder="seu@email.com"
            />
          </div>
          {internalMode !== 'forgot' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Palavra-passe</label>
                {internalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setInternalMode('forgot')}
                    className="text-[9px] text-gold-primary hover:underline uppercase font-bold tracking-widest"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-white/5 border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-gold-primary/20 mt-4 hover:scale-[1.02] transition-transform ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Aguarde...' : internalMode === 'login' ? 'Entrar' : internalMode === 'register' ? 'Cadastrar' : 'Enviar Link'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {internalMode === 'login' ? 'Ainda não é Membro Elite?' : internalMode === 'register' ? 'Já possui uma conta premium?' : 'Lembrou-se da senha?'}
              <button
                type="button"
                onClick={() => setInternalMode(internalMode === 'login' ? 'register' : 'login')}
                className="ml-2 text-gold-primary font-black uppercase tracking-widest hover:underline"
              >
                {internalMode === 'login' ? 'Cadastrar-se' : 'Entrar Agora'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
