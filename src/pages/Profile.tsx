import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Camera, CameraResultType } from '@capacitor/camera';
import { useState } from 'react';

export const Profile: React.FC = () => {
    const { user, loading, signOut } = useAuth();
    const [profilePic, setProfilePic] = useState<string | null>(null);

    const takePicture = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri
            });
            setProfilePic(image.webPath || null);
        } catch (err) {
            console.error('Erro ao acessar camera:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gold-primary">
                <span className="material-symbols-outlined animate-spin text-6xl">progress_activity</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const joinedDate = new Date(user.created_at).toLocaleDateString('pt-AO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isAdmin = user.user_metadata?.is_admin || user.email === 'josuemiguelsued@gmail.com';

    return (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-10">
            {/* Profile Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-16 rounded-2xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gold-primary text-4xl">person_pin</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">O Meu <span className="text-gold-primary">Perfil</span></h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gerencie sua conta AngoLife Elite</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Left Side: Avatar & Type */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    <div className="glass-card rounded-3xl p-8 border border-gold-primary/20 bg-gradient-to-br from-surface-dark to-background-dark shadow-2xl flex flex-col items-center text-center">
                        <div 
                            onClick={takePicture}
                            className="size-32 rounded-full bg-gold-primary/10 border-4 border-background-dark flex items-center justify-center mb-6 relative group overflow-hidden shadow-2xl cursor-pointer"
                        >
                             {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <span className="material-symbols-outlined text-6xl text-gold-primary">person</span>
                             )}
                             <div className="absolute inset-0 bg-gold-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">photo_camera</span>
                             </div>
                        </div>
                        <h3 className="text-xl font-black text-white">{user.user_metadata?.full_name || 'Membro Elite'}</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">{user.email}</p>
                        
                        <div className="px-4 py-1.5 rounded-full bg-gold-primary/20 border border-gold-primary/30 text-gold-primary text-[10px] font-black uppercase tracking-widest">
                            {isAdmin ? 'Administrador' : 'Membro Premium'}
                        </div>
                    </div>

                    <button 
                        onClick={signOut}
                        className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Terminar Sessão
                    </button>
                </div>

                {/* Right Side: Details & Stats */}
                <div className="md:col-span-2 flex flex-col gap-8">
                    {/* Account Details */}
                    <div className="glass-card rounded-3xl p-8 border border-border-gold bg-surface-dark/40 shadow-lg">
                        <h2 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-10 h-[2px] bg-gold-primary"></span> Informações da Conta
                        </h2>

                        <div className="grid grid-cols-2 gap-y-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Email Principal</span>
                                <span className="text-sm font-bold text-white">{user.email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Data de Adesão</span>
                                <span className="text-sm font-bold text-white">{joinedDate}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tipo de Conta</span>
                                <span className="text-sm font-bold text-gold-primary">Elite VIP</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Estado</span>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-white">Activa</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats/Activities */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 group hover:border-gold-primary/20 transition-all">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Promoções Vistas</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-white">42</span>
                                <span className="material-symbols-outlined text-gold-primary text-sm mb-1">trending_up</span>
                            </div>
                        </div>
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 group hover:border-gold-primary/20 transition-all">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Alertas Activos</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-white">3</span>
                                <span className="material-symbols-outlined text-gold-primary text-sm mb-1">notifications_active</span>
                            </div>
                        </div>
                    </div>

                    {/* Settings Mock */}
                    <div className="p-8 rounded-3xl border border-dashed border-border-gold flex flex-col items-center justify-center text-center gap-4 opacity-50">
                        <span className="material-symbols-outlined text-4xl text-gray-500">settings</span>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Configurações Avançadas brevemente</p>
                        <button disabled className="px-6 py-2 border border-gray-700 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                            Editar Dados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
