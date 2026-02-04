import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

export const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('As palavras-passe não coincidem', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            addToast('Palavra-passe atualizada com sucesso!', 'success');
            navigate('/');
        } catch (err: any) {
            addToast(err.message || 'Erro ao atualizar senha', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex flex-col items-center leading-none mb-4">
                        <span className="text-gold-primary text-[8px] font-black uppercase tracking-[0.2em]">su-golden</span>
                        <div className="h-[1px] w-full bg-gold-primary mt-0.5"></div>
                    </div>
                    <h2 className="text-2xl font-black text-white text-center">Definir Nova Palavra-passe</h2>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        Escolha uma senha forte para proteger a sua conta.
                    </p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Nova Palavra-passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-white/5 border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Confirmar Palavra-passe</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="bg-white/5 border border-border-gold rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold-primary outline-none text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-gold-primary/20 mt-4 hover:scale-[1.02] transition-transform ${isLoading ? 'opacity-50' : ''}`}
                    >
                        {isLoading ? 'Aguarde...' : 'Atualizar Palavra-passe'}
                    </button>
                </form>
            </div>
        </div>
    );
};
