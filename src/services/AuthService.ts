import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    is_admin: boolean;
    updated_at: string;
}

export const AuthService = {
    // Cadastrar novo usuário
    signUp: async (email: string, password: string, fullName: string) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
    },

    // Entrar (Login)
    signIn: async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    },

    // Sair (Logout)
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return error;
    },

    // Obter usuário atual
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Obter perfil do banco de dados
    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    // Escutar mudanças no estado de autenticação
    onAuthStateChange: (callback: (user: User | null) => void) => {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null);
        });
    },

    // Redefinir senha (Esqueceu a senha)
    resetPassword: async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname + '#/reset-password',
        });
    },

    // Verificar se o usuário é Administrador
    isAdmin: async (user: User | null): Promise<boolean> => {
        if (!user) return false;
        
        // 1. Verificação rápida por e-mail (Hardcoded master admin)
        const adminEmail = 'josuemiguelsued@gmail.com';
        if (user.email === adminEmail) return true;

        // 2. Verificação no banco de dados (Tabela de perfis protegida)
        try {
            const { data } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            
            return data?.is_admin === true;
        } catch {
            // Fallback para metadata se a tabela falhar por algum motivo (menos seguro, mas mantém UX)
            return user.user_metadata?.is_admin === true;
        }
    }
};
