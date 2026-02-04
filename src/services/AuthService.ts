import { supabase } from '../lib/supabase';

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

    // Escutar mudanças no estado de autenticação
    onAuthStateChange: (callback: (user: any) => void) => {
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
    isAdmin: (user: any): boolean => {
        if (!user) return false;
        const adminEmail = 'josuemiguelsued@gmail.com';
        // Permite acesso se o e-mail coincidir OU se tiver a flag is_admin no metadata (editável no Supabase Auth)
        return user.email === adminEmail || user.user_metadata?.is_admin === true;
    }
};
