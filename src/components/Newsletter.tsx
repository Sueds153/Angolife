import React, { useState } from 'react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send email to backend would go here
    console.log("Newsletter subscription:", email);
    setStatus('success');
    setEmail('');
    
    // Reset status after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-white dark:bg-surface-dark border border-gold-primary/30 p-8 md:p-12 mb-12 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-4 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-gold-primary text-black text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Vaga VIP</span>
            <span className="text-gold-primary text-xs uppercase tracking-widest font-bold">Acesso Exclusivo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
            Receba as <span className="text-gold-gradient">5 Vagas Mais Bem Pagas</span> de Luanda.
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Todas as segundas-feiras, direto no seu email. Apenas cargos acima de 500.000 Kz. Junte-se a 2.500+ profissionais de elite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
          <div className="flex rounded-full bg-gray-100 dark:bg-white/5 border border-border-gold p-1 focus-within:ring-2 focus-within:ring-gold-primary/50 transition-all">
            <input 
              type="email" 
              required
              placeholder="Seu melhor email..." 
              className="bg-transparent flex-1 px-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gold-gradient text-background-dark font-black px-6 py-3 rounded-full uppercase text-xs tracking-widest hover:scale-105 transition-transform"
            >
              Inscrever
            </button>
          </div>
          {status === 'success' && (
            <p className="text-green-400 text-xs font-bold text-center animate-in fade-in">
              <span className="material-symbols-outlined align-middle text-sm mr-1">check_circle</span>
              Sucesso! Bem-vindo à elite.
            </p>
          )}
          <p className="text-[10px] text-gray-600 text-center">Sem spam. Apenas oportunidades de ouro.</p>
        </form>
      </div>
    </div>
  );
};
