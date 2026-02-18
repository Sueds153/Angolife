
import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { Check, X, Lock } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-orange-500/30">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <Lock className="text-amber-500" size={32} />
        </div>
        <h2 className="text-xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Admin Terminal</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
          <input 
            type="password" 
            placeholder="Senha de Acesso" 
            className="border border-orange-500/20 p-3 rounded-xl dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 dark:bg-amber-500 text-white px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-black uppercase">Painel Administrativo</h2>
      <p className="mt-4">Login bem-sucedido. Se você vir esta mensagem, o roteamento está funcionando.</p>
      <button onClick={() => setIsAuthenticated(false)} className="mt-8 bg-red-500 text-white px-4 py-2 rounded font-bold uppercase text-xs">Sair</button>
    </div>
  );
};
