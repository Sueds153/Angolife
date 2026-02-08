import React, { useState } from 'react';
import { JobListing } from '../../types';
import { JobService } from '../../services/JobService';
import { useToast } from '../../context/ToastContext';

interface AdminJobsProps {
    pendingJobs: JobListing[];
    loadPendingJobs: () => void;
    isSyncing: boolean;
}

export const AdminJobs: React.FC<AdminJobsProps> = ({ pendingJobs, loadPendingJobs, isSyncing }) => {
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [showJobForm, setShowJobForm] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '', company: '', location: '', type: 'Tempo Inteiro',
        sourceUrl: '', description: '', salary: '', email: '', phone: '', isElite: false
    });
    const { addToast } = useToast();

    if (isSyncing && pendingJobs.length === 0) {
        return <div className="text-center py-10 text-gold-primary animate-pulse font-bold uppercase tracking-widest text-xs">Sincronizando Vagas...</div>
    }

    const handleApprove = async (id: string) => {
        const { error } = await JobService.approveJob(id);
        if (!error) {
            addToast('Vaga aprovada e publicada!', 'success');
            loadPendingJobs();
        } else {
            addToast(`Erro ao aprovar vaga: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await JobService.deleteJob(id);
        if (!error) {
            addToast('Vaga removida.', 'info');
            loadPendingJobs();
        } else {
            addToast(`Erro ao remover vaga: ${error.message}`, 'error');
        }
    };

    const handleApproveAll = async () => {
        if (pendingJobs.length === 0) return;
        let successCount = 0;
        for (const job of pendingJobs) {
            const { error } = await JobService.approveJob(job.id);
            if (!error) successCount++;
        }
        addToast(`${successCount} vagas aprovadas em massa!`, 'success');
        loadPendingJobs();
    };

    const handleRejectAll = async () => {
        if (!window.confirm('Tem certeza que deseja descartar TODAS as vagas pendentes?')) return;
        for (const job of pendingJobs) {
            await JobService.deleteJob(job.id);
        }
        addToast('Todas as vagas pendentes foram removidas.', 'info');
        loadPendingJobs();
    };

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await JobService.addJob(newJob, 'published');
        if (!error) {
            addToast('Vaga publicada com sucesso!', 'success');
            setNewJob({ title: '', company: '', location: '', type: 'Tempo Inteiro', sourceUrl: '', description: '', salary: '', email: '', phone: '', isElite: false });
            setShowJobForm(false);
        } else {
            addToast('Erro ao publicar vaga: ' + error.message, 'error');
        }
    };

    const getSourceStyle = (source?: string) => {
        switch (source) {
            case 'LinkedIn': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'INEFOP': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Mirantes': return 'bg-gold-primary/10 text-gold-primary border-gold-primary/20';
            default: return 'bg-white/5 text-gray-400 border-white/10';
        }
    };

    return (
        <div className="flex flex-col gap-12">
            <button
                onClick={() => setShowJobForm(!showJobForm)}
                className="glass-card p-6 flex items-center justify-between group hover:border-gold-primary transition-all text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary">
                        <span className="material-symbols-outlined">add_business</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Publicar Vaga Manual</h3>
                        <p className="text-xs text-gray-500">Adicione uma oferta de emprego agora</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-gold-primary transition-colors">
                    {showJobForm ? 'expand_less' : 'add'}
                </span>
            </button>

            {showJobForm && (
                <section className="glass-card p-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-gold-primary mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined">work</span> Nova Vaga de Emprego
                    </h2>
                    <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobTitle" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Título da Vaga</label>
                            <input id="jobTitle" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="Ex: Engenheiro de Software" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobCompany" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Empresa</label>
                            <input id="jobCompany" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} placeholder="Ex: Unitel" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobLocation" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Localização</label>
                            <input id="jobLocation" required className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="Ex: Luanda, Angola" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="jobType" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tipo de Contrato</label>
                            <select id="jobType" className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                                <option value="Tempo Inteiro">Tempo Inteiro</option>
                                <option value="Contrato">Contrato</option>
                                <option value="Remote">Remoto (Internacional)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label htmlFor="jobDescription" className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Descrição da Função</label>
                            <textarea id="jobDescription" required rows={4} className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} placeholder="Descreva os requisitos e responsabilidades..." />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Link Original (Se houver)</label>
                            <input className="bg-white dark:bg-background-dark border border-border-gold rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-gold-primary text-white"
                                value={newJob.sourceUrl} onChange={e => setNewJob({ ...newJob, sourceUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <button type="submit" className="md:col-span-2 bg-gold-gradient text-background-dark font-black py-4 rounded-xl uppercase tracking-widest hover:scale-[1.01] transition-all">
                            Publicar Vaga Agora
                        </button>
                    </form>
                </section>
            )}

            {/* Moderation Section */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gold-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">gavel</span> Moderação de Vagas
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-primary text-[10px]">{pendingJobs.length} Pendentes</span>
                    </h2>
                    {pendingJobs.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleRejectAll}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                Limpar Tudo
                            </button>
                            <button
                                onClick={handleApproveAll}
                                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                Aprovar Tudo
                            </button>
                        </div>
                    )}
                </div>

                {pendingJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingJobs.map(job => (
                            <div key={job.id} className="glass-card flex flex-col group overflow-hidden border-l-4 border-l-gold-primary/30 hover:border-l-gold-primary transition-all">
                                <div className="p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${getSourceStyle(job.source)}`}>
                                            {job.source}
                                        </span>
                                        <p className="text-[10px] text-gray-500">{job.postedAt}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">{job.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">corporate_fare</span> {job.company}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                                        className="text-[10px] text-gold-primary font-bold flex items-center gap-1 hover:underline self-start"
                                    >
                                        {expandedJobId === job.id ? 'Fechar Detalhes' : 'Ver Descrição'}
                                        <span className="material-symbols-outlined text-xs">
                                            {expandedJobId === job.id ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>

                                    {expandedJobId === job.id && (
                                        <div className="text-[10px] text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5 animate-fade-in max-h-32 overflow-y-auto no-scrollbar">
                                            {job.description}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto grid grid-cols-2 border-t border-white/10">
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="py-3 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-r border-white/10"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(job.id)}
                                        className="py-3 text-[9px] font-black uppercase tracking-widest text-green-500/60 hover:text-green-500 hover:bg-green-500/5 transition-all"
                                    >
                                        Aprovar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 bg-white/5 transition-all">
                        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-600 text-3xl">inbox</span>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold">Fila de Moderação Vazia</p>
                            <p className="text-xs text-gray-600 max-w-[200px] mt-1">Nenhuma vaga nova pendente de revisão no momento.</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
